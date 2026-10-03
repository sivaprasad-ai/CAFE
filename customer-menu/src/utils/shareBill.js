export function buildBillText(order) {
  const lines = [
    "🍽️ *Raghuveer Cafe*",
    "A Smile In Every Bite",
    "Hukkeri, Belagavi District, Karnataka",
    "",
    `Table ${order.table} · ${order.orderType === "takeaway" ? "Takeaway" : "Dine-in"}`,
    `Order #${order.id} · ${new Date(order.placedAt).toLocaleString("en-IN")}`,
    "",
    ...order.items.map((it) => `${it.qty} x ${it.name} — ₹${it.qty * it.price}`),
    "",
  ];

  if (order.packingCharge > 0) {
    lines.push(`Subtotal: ₹${order.subtotal}`);
    lines.push(`Packing Charge: ₹${order.packingCharge}`);
  }

  lines.push(`*Total: ₹${order.total}*`);
  lines.push("");
  lines.push("Thank you for visiting! 🌿");

  return lines.join("\n");
}

// Normalizes an Indian phone number to the digits-only "91XXXXXXXXXX" format
// wa.me expects. Returns null if it doesn't look like a valid 10-digit number.
export function normalizeIndianPhone(raw) {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 10) return `91${digits}`;
  return null;
}

// Opens a WhatsApp chat with a specific number, bill pre-filled — customer
// still taps Send (no Business API access needed for this).
export function whatsappSendUrl(order, phone) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(buildBillText(order))}`;
}
