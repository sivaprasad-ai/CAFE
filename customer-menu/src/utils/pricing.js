// Menu items with size/variant pricing store it in `desc`, e.g. "Big ₹90" or
// "6\" · Med ₹160 · Big ₹260". Parse it into selectable {label, price} tiers,
// with the base `item.price` labelled "Regular".
export function parseSizeOptions(item) {
  if (!item.desc || !item.desc.includes("₹")) return null;
  const segments = item.desc.split("·").map((s) => s.trim()).filter(Boolean);
  const options = [];
  let baseLabel = "Regular";
  for (const seg of segments) {
    const match = seg.match(/^(.*?)\s*₹(\d+)$/);
    if (match) {
      options.push({ label: match[1].trim() || "Large", price: Number(match[2]) });
    } else {
      baseLabel = seg;
    }
  }
  if (options.length === 0) return null;
  return [{ label: baseLabel, price: item.price }, ...options];
}

export function slugify(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ₹10/item packing charge for Burgers & Pizza (sturdier boxes), ₹5/item otherwise.
export function packingRateFor(category) {
  return category === "Burgers" || category === "Pizza" ? 10 : 5;
}
