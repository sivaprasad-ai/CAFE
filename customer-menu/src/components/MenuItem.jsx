import { useState } from "react";
import { parseSizeOptions, slugify } from "../utils/pricing";

const isBestseller = (name) => /raghuveer spl|raghuveer special/i.test(name);
const isSpicy = (name) => /chilli|peri peri/i.test(name);

export default function MenuItem({ item, cart, category, onAdd, onRemove, icon, color, delay = 0 }) {
  const bestseller = isBestseller(item.name);
  const spicy = isSpicy(item.name);
  const sizeOptions = parseSizeOptions(item);
  const [sizeIndex, setSizeIndex] = useState(0);

  const activeSize = sizeOptions ? sizeOptions[sizeIndex] : { label: null, price: item.price };
  const variantId = sizeOptions && sizeIndex > 0 ? `${item.id}-${slugify(activeSize.label)}` : item.id;
  const variantName = sizeOptions && sizeIndex > 0 ? `${item.name} (${activeSize.label})` : item.name;
  const qty = cart[variantId]?.qty || 0;

  const handleAdd = () => {
    onAdd({ id: variantId, name: variantName, price: activeSize.price, category });
  };

  const plainDesc = !sizeOptions ? item.desc : null;

  return (
    <div className="tile" style={{ animationDelay: `${delay}s` }}>
      <div className="tile-icon" style={{ background: color, boxShadow: `0 6px 14px ${color}55` }}>
        <span>{icon}</span>
      </div>
      <div className="tile-tags">
        {bestseller && <span className="tag tag-best">🔥 Popular</span>}
        {spicy && <span className="tag tag-spicy">🌶 Spicy</span>}
      </div>
      <h3 className="tile-name">{item.name}</h3>
      {plainDesc && <p className="tile-desc">{plainDesc}</p>}

      {sizeOptions && (
        <div className="size-pills">
          {sizeOptions.map((opt, i) => (
            <button
              key={opt.label}
              className={"size-pill" + (i === sizeIndex ? " active" : "")}
              style={i === sizeIndex ? { background: color, borderColor: color } : undefined}
              onClick={() => setSizeIndex(i)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <div className="tile-footer">
        <span className="tile-price">₹{activeSize.price}</span>
        {qty > 0 ? (
          <div className="stepper" style={{ background: color }}>
            <button onClick={() => onRemove(variantId)} aria-label="Remove one">−</button>
            <span>{qty}</span>
            <button onClick={handleAdd} aria-label="Add one more">+</button>
          </div>
        ) : (
          <button className="tile-add" style={{ color, borderColor: color }} onClick={handleAdd}>
            Add
          </button>
        )}
      </div>
    </div>
  );
}
