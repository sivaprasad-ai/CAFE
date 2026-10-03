const LOCAL_API_DEFAULT =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8001/api"
    : "";

const API_BASE = import.meta.env.VITE_API_BASE_URL || LOCAL_API_DEFAULT;
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
      placed_at: new Date().toISOString(),
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

async function request(path, options = {}) {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
      });
      if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
      if (res.status === 204) return null;
      return await res.json();
    } catch (err) {
      console.warn(`API unreachable at ${API_BASE}${path}, using local store fallback`, err);
    }
  }
  return handleLocalRequest(path, options);
}

export const fetchOrders = () => request("/orders/");

export const createOrder = (order) =>
  request("/orders/", { method: "POST", body: JSON.stringify(order) });

export const updateOrderStatus = (id, status) =>
  request(`/orders/${id}/status/`, { method: "PATCH", body: JSON.stringify({ status }) });

export const deleteOrder = (id) => request(`/orders/${id}/`, { method: "DELETE" });

