import { supabase } from "./supabase";

const STORAGE_KEY = "raghuveer_cafe_orders";

function getLocalOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {}
}

function handleLocalRequest(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const orders = getLocalOrders();

  if (path === "/orders/" && method === "GET") {
    return orders;
  }

  if (path === "/orders/" && method === "POST") {
    const data = JSON.parse(options.body || "{}");
    const newOrder = {
      ...data,
      id: Date.now(),
      placedAt: new Date().toISOString(),
      status: data.status || "new",
    };
    orders.unshift(newOrder);
    saveLocalOrders(orders);
    return newOrder;
  }

  const statusMatch = path.match(/^\/orders\/([^/]+)\/status\/?$/);
  if (statusMatch && method === "PATCH") {
    const id = statusMatch[1];
    const data = JSON.parse(options.body || "{}");
    const idx = orders.findIndex((o) => String(o.id) === String(id));
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], status: data.status };
      saveLocalOrders(orders);
      return orders[idx];
    }
    return { detail: "Order not found" };
  }

  const deleteMatch = path.match(/^\/orders\/([^/]+)\/?$/);
  if (deleteMatch && method === "DELETE") {
    const id = deleteMatch[1];
    const filtered = orders.filter((o) => String(o.id) !== String(id));
    saveLocalOrders(filtered);
    return null;
  }

  return null;
}

export async function fetchOrders() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("placedAt", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Supabase fetch failed, using local store fallback:", err);
    return handleLocalRequest("/orders/", { method: "GET" });
  }
}

export async function createOrder(order) {
  if (!order.table || order.table === "null" || order.table === "undefined" || !String(order.table).trim()) {
    throw new Error("A valid Table number is required to place an order.");
  }
  try {
    const payload = {
      table: String(order.table),
      orderType: order.orderType || "dinein",
      items: order.items,
      subtotal: Number(order.subtotal),
      packingCharge: Number(order.packingCharge || 0),
      total: Number(order.total),
      status: order.status || "new",
      source: order.source || "customer",
    };
    const { data, error } = await supabase
      .from("orders")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Supabase create failed, using local store fallback:", err);
    return handleLocalRequest("/orders/", { method: "POST", body: JSON.stringify(order) });
  }
}

export async function updateOrderStatus(id, status) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Supabase update failed, using local store fallback:", err);
    return handleLocalRequest(`/orders/${id}/status/`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }
}

export async function deleteOrder(id) {
  try {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw error;
    return null;
  } catch (err) {
    console.warn("Supabase delete failed, using local store fallback:", err);
    return handleLocalRequest(`/orders/${id}/`, { method: "DELETE" });
  }
}

export function subscribeToOrders(onUpdate) {
  try {
    const channel = supabase
      .channel("orders_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (onUpdate) onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn("Supabase subscription failed:", err);
    return () => {};
  }
}
