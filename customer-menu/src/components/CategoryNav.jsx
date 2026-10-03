import { CATEGORY_META } from "../menuData";

export default function CategoryNav({ categories, active, onSelect }) {
  return (
    <nav className="category-nav">
      {categories.map((cat) => {
        const meta = CATEGORY_META[cat] || {};
        const isActive = cat === active;
        return (
          <button
            key={cat}
            className={"category-btn" + (isActive ? " active" : "")}
            onClick={() => onSelect(cat)}
          >
            <span className="category-icon">{meta.icon}</span>
            {cat}
          </button>
        );
      })}
    </nav>
  );
}
