import { useEffect, useMemo, useRef, useState } from "react";
import { MENU, CATEGORY_META } from "./menuData";
import { packingRateFor } from "./utils/pricing";
import { createOrder } from "./utils/api";
import CategoryNav from "./components/CategoryNav";
import MenuItem from "./components/MenuItem";
import CartDrawer from "./components/CartDrawer";
import SearchBar from "./components/SearchBar";
import OrderSuccess from "./components/OrderSuccess";
import Landing from "./components/Landing";
import "./App.css";

function useTableNumber() {
  const params = new URLSearchParams(window.location.search);
  return params.get("table") || "1";
}

export default function App() {
  const tableNumber = useTableNumber();
  const categories = useMemo(() => MENU.map((c) => c.category), []);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [cart, setCart] = useState({}); // id -> { item, qty }
  const [cartOpen, setCartOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("landing"); // "landing" | "menu"
  const [orderType, setOrderType] = useState("dinein"); // "dinein" | "takeaway"
  const [pendingCategory, setPendingCategory] = useState(null);
  const sectionRefs = useRef({});

  const addItem = (item) => {
    setCart((prev) => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: { item, qty: (existing?.qty || 0) + 1 },
      };
    });
  };

  const removeItem = (id) => {
    setCart((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      const nextQty = existing.qty - 1;
      const next = { ...prev };
      if (nextQty <= 0) {
        delete next[id];
      } else {
        next[id] = { ...existing, qty: nextQty };
      }
      return next;
    });
  };

  const cartCount = Object.values(cart).reduce((sum, e) => sum + e.qty, 0);
  const cartTotal = Object.values(cart).reduce((sum, e) => sum + e.qty * e.item.price, 0);

  // Packing charge only applies to takeaway orders — ₹20/item for Combos, ₹10/item for Burgers & Pizza
  // (they need sturdier boxes), ₹5/item for everything else.
  const packingCharge =
    orderType === "takeaway"
      ? Object.values(cart).reduce((sum, e) => {
          if (/extra cheese/i.test(e.item.name)) return sum;
          return sum + packingRateFor(e.item.category) * e.qty;
        }, 0)
      : 0;
  const grandTotal = cartTotal + packingCharge;

  const isManualScroll = useRef(false);

  const scrollToCategory = (cat) => {
    isManualScroll.current = true;
    setActiveCategory(cat);
    sectionRefs.current[cat]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => (isManualScroll.current = false), 700);
  };

  useEffect(() => {
    if (view !== "menu" || !pendingCategory) return;
    scrollToCategory(pendingCategory);
    setPendingCategory(null);
  }, [view, pendingCategory]);

  useEffect(() => {
    if (query) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualScroll.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const cat = visible[0].target.dataset.category;
          setActiveCategory(cat);
        }
      },
      { rootMargin: "-140px 0px -70% 0px", threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [query]);

  const [placingOrder, setPlacingOrder] = useState(false);

  const placeOrder = async () => {
    if (cartCount === 0 || placingOrder) return;

    const order = {
      table: tableNumber,
      orderType,
      items: Object.values(cart).map((e) => ({
        name: e.item.name,
        qty: e.qty,
        price: e.item.price,
      })),
      subtotal: cartTotal,
      packingCharge,
      total: grandTotal,
      status: "new", // new -> preparing -> completed
      source: "customer",
    };

    setPlacingOrder(true);
    try {
      const saved = await createOrder(order);
      setCart({});
      setCartOpen(false);
      setPlacedOrder(saved);
    } catch {
      alert("Couldn't place the order — please check your connection and try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const filteredMenu = useMemo(() => {
    if (!query.trim()) return MENU;
    const q = query.trim().toLowerCase();
    return MENU.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => item.name.toLowerCase().includes(q)),
    })).filter((cat) => cat.items.length > 0);
  }, [query]);

  if (view === "landing") {
    return (
      <Landing
        onOrderNow={(category) => {
          setView("menu");
          setPendingCategory(category || null);
        }}
        tableNumber={tableNumber}
      />
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <button className="back-btn" onClick={() => setView("landing")} aria-label="Back to home">
              ←
            </button>
            <div>
              <h1>Raghuveer Cafe</h1>
              <p className="brand-sub">AC Cafe · A Smile In Every Bite</p>
            </div>
            <span className="table-badge">Table {tableNumber}</span>
          </div>
          <div className="search-wrap">
            <SearchBar value={query} onChange={setQuery} />
          </div>
        </div>
      </header>

      <div className="body-shell">
        {!query && (
          <aside className="sidebar">
            <CategoryNav categories={categories} active={activeCategory} onSelect={scrollToCategory} />
          </aside>
        )}

        <div className="content-col">
          {!query && (
            <div className="hero">
              <div className="hero-text">
                <h2>A Smile In Every Bite</h2>
                <p>Fresh, made-to-order food — straight from your table</p>
              </div>
              <div className="hero-stats">
                <span>⭐ 4.6 Rating</span>
                <span>⏱ 10-15 min</span>
                <span>🌿 100% Veg</span>
              </div>
            </div>
          )}

          <main className="menu-list">
            {filteredMenu.length === 0 && (
              <div className="no-results">
                <div className="no-results-icon">🔎</div>
                <p>No items match "{query}"</p>
              </div>
            )}
            {filteredMenu.map((cat) => {
              const meta = CATEGORY_META[cat.category] || {};
              return (
                <section
                  key={cat.category}
                  className="category-section"
                  data-category={cat.category}
                  ref={(el) => (sectionRefs.current[cat.category] = el)}
                >
                  <h2>
                    <span className="section-icon">{meta.icon}</span>
                    {cat.category}
                  </h2>
                  <div className="tile-grid">
                    {cat.items.map((item, i) => (
                      <MenuItem
                        key={item.id}
                        item={item}
                        category={cat.category}
                        cart={cart}
                        onAdd={addItem}
                        onRemove={removeItem}
                        icon={meta.icon}
                        color={meta.color}
                        delay={Math.min(i, 8) * 0.03}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </main>
        </div>
      </div>

      <button
        className={"cart-fab" + (cartCount > 0 ? " visible" : "")}
        onClick={() => setCartOpen(true)}
      >
        <span className="cart-fab-count">{cartCount}</span>
        <span>{cartCount} item{cartCount !== 1 ? "s" : ""} added</span>
        <span className="cart-fab-total">₹{cartTotal} ›</span>
      </button>

      <CartDrawer
        open={cartOpen}
        cart={cart}
        subtotal={cartTotal}
        orderType={orderType}
        onOrderTypeChange={setOrderType}
        packingCharge={packingCharge}
        grandTotal={grandTotal}
        onClose={() => setCartOpen(false)}
        onPlaceOrder={placeOrder}
        placing={placingOrder}
        onAdd={addItem}
        onRemove={removeItem}
      />

      <OrderSuccess order={placedOrder} onClose={() => setPlacedOrder(null)} />
    </div>
  );
}
