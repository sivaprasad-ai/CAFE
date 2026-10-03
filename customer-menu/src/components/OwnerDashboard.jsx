import { useEffect, useMemo, useRef, useState } from "react";
import { MENU, CATEGORY_META } from "../menuData";
import { parseSizeOptions, slugify, packingRateFor } from "../utils/pricing";
import { fetchOrders, createOrder, updateOrderStatus, deleteOrder } from "../utils/api";
import { whatsappSendUrl, normalizeIndianPhone } from "../utils/shareBill";

// Allowed admin passwords (supports custom password, admin123, or original 1234)
const ALLOWED_ADMIN_PASSWORDS = ["admin123", "admin", "raghuveer@123", "1234"];

const COLUMNS = [
  { key: "new", label: "New", next: "preparing", actionLabel: "Start Preparing" },
  { key: "preparing", label: "Preparing", next: "completed", actionLabel: "Mark Served" },
  { key: "completed", label: "Served", next: null, actionLabel: null },
];

function IconReceipt() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" strokeLinejoin="round" />
      <path d="M9 8h6M9 12h6" strokeLinecap="round" />
    </svg>
  );
}

function IconRupee() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 5h10M7 9h10M7 5c4 0 6 1.3 6 4s-2 4-6 4h-1l7 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPrinter() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9V3h12v6M6 18H4a1 1 0 01-1-1v-6a1 1 0 011-1h16a1 1 0 011 1v6a1 1 0 01-1 1h-2M6 14h12v7H6z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} hr ${mins % 60}m ago`;
}

function isToday(iso) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // audio not available — the visual banner still shows
  }
}

function OrderCard({ order, columnKey, next, actionLabel, onAdvance, onCancel, onPrint, justArrived }) {
  return (
    <div className={"owner-order-card status-" + columnKey + (justArrived ? " just-arrived" : "")}>
      {justArrived && <span className="owner-new-badge">NEW</span>}
      <div className="owner-order-top">
        <span className="owner-order-table">
          Table {order.table}
          {order.orderType === "takeaway" && <span className="owner-takeaway-tag">Takeaway</span>}
        </span>
        <span className="owner-order-time">{timeAgo(order.placedAt)}</span>
      </div>

      <ul className="owner-order-items">
        {order.items.map((it, i) => (
          <li key={i}>
            <span className="owner-order-qty">{it.qty}</span>
            <span className="owner-order-name">{it.name}</span>
            <span className="owner-order-price">₹{it.qty * it.price}</span>
          </li>
        ))}
      </ul>

      <div className="owner-order-footer">
        <span className="owner-order-total">
          Total <strong>₹{order.total}</strong>
          {order.packingCharge > 0 && <em className="owner-order-packing"> (incl. ₹{order.packingCharge} packing)</em>}
        </span>
        <div className="owner-order-actions">
          <button className="owner-btn owner-btn-print" onClick={() => onPrint(order)}>
            <IconPrinter /> Print Bill
          </button>
          {next && (
            <button className="owner-btn owner-btn-advance" onClick={() => onAdvance(order.id, next)}>
              {actionLabel} →
            </button>
          )}
          {columnKey === "new" && (
            <button className="owner-btn owner-btn-cancel" onClick={() => onCancel(order.id)}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CompactOrderRow({ order, onPrint }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="owner-order-compact">
      <button className="owner-order-compact-head" onClick={() => setOpen((v) => !v)}>
        <span className="owner-order-table">Table {order.table}</span>
        <span className="owner-order-compact-summary">
          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
        </span>
        <span className="owner-order-time">{timeAgo(order.placedAt)}</span>
        <span className="owner-order-compact-total">₹{order.total}</span>
        <span className="owner-order-compact-chevron">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="owner-order-compact-body">
          <ul className="owner-order-items">
            {order.items.map((it, i) => (
              <li key={i}>
                <span className="owner-order-qty">{it.qty}</span>
                <span className="owner-order-name">{it.name}</span>
                <span className="owner-order-price">₹{it.qty * it.price}</span>
              </li>
            ))}
          </ul>
          <button className="owner-btn owner-btn-print" onClick={() => onPrint(order)}>
            <IconPrinter /> Print Bill
          </button>
        </div>
      )}
    </div>
  );
}

function Receipt({ order, onClose }) {
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(false);

  if (!order) return null;

  const sendOnWhatsapp = () => {
    const normalized = normalizeIndianPhone(phone);
    if (!normalized) {
      setPhoneError(true);
      return;
    }
    window.open(whatsappSendUrl(order, normalized), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="receipt-overlay">
      <div className="receipt-sheet">
        <div className="receipt-print-area">
          <h2>Raghuveer Cafe</h2>
          <p className="receipt-sub">A Smile In Every Bite</p>
          <p className="receipt-sub">Hukkeri, Belagavi District, Karnataka</p>
          <p className="receipt-sub">+91 81232 02170</p>
          <div className="receipt-divider" />
          <div className="receipt-meta">
            <span>Table {order.table}</span>
            <span>{new Date(order.placedAt).toLocaleString("en-IN")}</span>
          </div>
          <div className="receipt-meta">
            <span>Order #{order.id}</span>
            <span>{order.orderType === "takeaway" ? "Takeaway" : "Dine-in"}</span>
          </div>
          <div className="receipt-divider" />
          <table className="receipt-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Amt</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, i) => (
                <tr key={i}>
                  <td>{it.name}</td>
                  <td>{it.qty}</td>
                  <td>₹{it.qty * it.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="receipt-divider" />
          {order.packingCharge > 0 && (
            <>
              <div className="receipt-meta">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="receipt-meta">
                <span>Packing Charge</span>
                <span>₹{order.packingCharge}</span>
              </div>
              <div className="receipt-divider" />
            </>
          )}
          <div className="receipt-total-row">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
          <div className="receipt-divider" />
          <p className="receipt-thanks">Thank you for visiting!</p>
          <p className="receipt-thanks">100% Vegetarian · AC Seating</p>
        </div>

        <div className="receipt-whatsapp-row">
          <input
            type="tel"
            className={"receipt-phone-input" + (phoneError ? " error" : "")}
            placeholder="Customer's WhatsApp number"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setPhoneError(false);
            }}
          />
          <button className="owner-btn owner-btn-whatsapp" onClick={sendOnWhatsapp}>
            💬 Send Bill
          </button>
        </div>
        {phoneError && <p className="receipt-phone-error">Enter a valid 10-digit number</p>}

        <div className="receipt-controls">
          <button className="owner-btn" onClick={onClose}>Close</button>
          <button className="owner-btn owner-btn-advance" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </div>
    </div>
  );
}

// For customers who can't/won't scan the QR themselves — staff take the
// order verbally and punch it in here, and it lands in the same board.
function NewOrderModal({ onClose, onSubmit }) {
  const categories = useMemo(() => MENU.map((c) => c.category), []);
  const [table, setTable] = useState("");
  const [orderType, setOrderType] = useState("dinein");
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState({});

  const addItem = (item) => {
    setCart((prev) => {
      const existing = prev[item.id];
      return { ...prev, [item.id]: { item, qty: (existing?.qty || 0) + 1 } };
    });
  };

  const removeItem = (id) => {
    setCart((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      const nextQty = existing.qty - 1;
      const next = { ...prev };
      if (nextQty <= 0) delete next[id];
      else next[id] = { ...existing, qty: nextQty };
      return next;
    });
  };

  const visibleItems = useMemo(() => {
    const cat = MENU.find((c) => c.category === activeCategory);
    const items = query.trim() ? MENU.flatMap((c) => c.items.map((it) => ({ ...it, category: c.category }))) : (cat?.items || []).map((it) => ({ ...it, category: activeCategory }));
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter((it) => it.name.toLowerCase().includes(q));
  }, [activeCategory, query]);

  const cartEntries = Object.values(cart);
  const subtotal = cartEntries.reduce((sum, e) => sum + e.qty * e.item.price, 0);
  const packingCharge =
    orderType === "takeaway"
      ? cartEntries.reduce((sum, e) => sum + packingRateFor(e.item.category) * e.qty, 0)
      : 0;
  const total = subtotal + packingCharge;

  const submit = () => {
    if (!table.trim() || cartEntries.length === 0) return;
    onSubmit({
      table: table.trim(),
      orderType,
      items: cartEntries.map((e) => ({ name: e.item.name, qty: e.qty, price: e.item.price })),
      subtotal,
      packingCharge,
      total,
      status: "new",
      source: "staff",
    });
  };

  return (
    <div className="receipt-overlay">
      <div className="new-order-sheet">
        <div className="new-order-header">
          <h2>New Order (Staff Entry)</h2>
          <button className="owner-btn owner-btn-cancel" onClick={onClose}>✕</button>
        </div>

        <div className="new-order-toprow">
          <input
            className="new-order-table-input"
            placeholder="Table no."
            value={table}
            onChange={(e) => setTable(e.target.value)}
          />
          <div className="order-type-toggle new-order-type-toggle">
            <button
              className={"order-type-btn" + (orderType === "dinein" ? " active" : "")}
              onClick={() => setOrderType("dinein")}
            >
              Dine-in
            </button>
            <button
              className={"order-type-btn" + (orderType === "takeaway" ? " active" : "")}
              onClick={() => setOrderType("takeaway")}
            >
              Takeaway
            </button>
          </div>
        </div>

        <input
          className="new-order-search"
          placeholder="Search menu…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {!query.trim() && (
          <div className="new-order-categories">
            {categories.map((cat) => (
              <button
                key={cat}
                className={"new-order-cat-btn" + (cat === activeCategory ? " active" : "")}
                onClick={() => setActiveCategory(cat)}
              >
                {CATEGORY_META[cat]?.icon} {cat}
              </button>
            ))}
          </div>
        )}

        <div className="new-order-body">
          <div className="new-order-items">
            {visibleItems.map((item) => {
              const sizeOptions = parseSizeOptions(item);
              return (
                <StaffMenuRow
                  key={item.id}
                  item={item}
                  category={item.category}
                  sizeOptions={sizeOptions}
                  cart={cart}
                  onAdd={addItem}
                  onRemove={removeItem}
                />
              );
            })}
            {visibleItems.length === 0 && <p className="owner-empty">No items match</p>}
          </div>

          <div className="new-order-cart">
            <h3>Order Summary</h3>
            {cartEntries.length === 0 ? (
              <p className="owner-empty">No items added yet</p>
            ) : (
              <ul className="owner-order-items">
                {cartEntries.map((e) => (
                  <li key={e.item.id}>
                    <span className="owner-order-qty">{e.qty}</span>
                    <span className="owner-order-name">{e.item.name}</span>
                    <span className="owner-order-price">₹{e.qty * e.item.price}</span>
                  </li>
                ))}
              </ul>
            )}

            {packingCharge > 0 && (
              <div className="cart-subtotal-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
            )}
            {packingCharge > 0 && (
              <div className="cart-subtotal-row">
                <span>Packing Charge</span>
                <span>₹{packingCharge}</span>
              </div>
            )}
            <div className="cart-total-row">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <button
              className="owner-btn owner-btn-advance new-order-submit"
              disabled={!table.trim() || cartEntries.length === 0}
              onClick={submit}
            >
              Place Order · ₹{total}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StaffMenuRow({ item, category, sizeOptions, cart, onAdd, onRemove }) {
  const [sizeIndex, setSizeIndex] = useState(0);
  const activeSize = sizeOptions ? sizeOptions[sizeIndex] : { label: null, price: item.price };
  const variantId = sizeOptions && sizeIndex > 0 ? `${item.id}-${slugify(activeSize.label)}` : item.id;
  const variantName = sizeOptions && sizeIndex > 0 ? `${item.name} (${activeSize.label})` : item.name;
  const qty = cart[variantId]?.qty || 0;

  const handleAdd = () => onAdd({ id: variantId, name: variantName, price: activeSize.price, category });

  return (
    <div className="staff-item-row">
      <div className="staff-item-info">
        <span className="staff-item-name">{item.name}</span>
        {sizeOptions && (
          <div className="size-pills">
            {sizeOptions.map((opt, i) => (
              <button
                key={opt.label}
                className={"size-pill" + (i === sizeIndex ? " active" : "")}
                style={i === sizeIndex ? { background: "var(--primary)", borderColor: "var(--primary)" } : undefined}
                onClick={() => setSizeIndex(i)}
              >
                {opt.label} ₹{opt.price}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="staff-item-action">
        {!sizeOptions && <span className="staff-item-price">₹{activeSize.price}</span>}
        {qty > 0 ? (
          <div className="qty-control small">
            <button onClick={() => onRemove(variantId)}>−</button>
            <span>{qty}</span>
            <button onClick={handleAdd}>+</button>
          </div>
        ) : (
          <button className="owner-btn owner-btn-print" onClick={handleAdd}>
            <IconPlus /> Add
          </button>
        )}
      </div>
    </div>
  );
}

function LoginGate({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (ALLOWED_ADMIN_PASSWORDS.includes(password.trim())) {
      sessionStorage.setItem("ownerAuthed", "1");
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="owner-login">
      <form className="owner-login-card" onSubmit={submit}>
        <div className="owner-login-logo">RC</div>
        <h2>Admin Login</h2>
        <p>Enter admin password to continue</p>
        <div className="owner-login-field">
          <input
            type={showPassword ? "text" : "password"}
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="Enter password"
          />
          <button
            type="button"
            className="owner-password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
        {error && <span className="owner-login-error">Incorrect password. Please try again.</span>}
        <button type="submit" className="owner-btn owner-btn-advance">Login</button>
      </form>
    </div>
  );
}

export default function OwnerDashboard() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("ownerAuthed") === "1");
  const [orders, setOrders] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [printOrder, setPrintOrder] = useState(null);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [toast, setToast] = useState(null);
  const [now, setNow] = useState(() => new Date());
  const [, forceTick] = useState(0);
  const knownIds = useRef(null);
  const recentIds = useRef(new Set());

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      fetchOrders()
        .then((data) => !cancelled && setOrders(data))
        .catch(() => {});
    };
    refresh();
    const poll = setInterval(refresh, 3000);
    const clock = setInterval(() => setNow(new Date()), 30000);
    return () => {
      cancelled = true;
      clearInterval(poll);
      clearInterval(clock);
    };
  }, []);

  // Detect newly placed orders (vs. what we already knew about) to trigger the alert.
  useEffect(() => {
    if (knownIds.current === null) {
      knownIds.current = new Set(orders.map((o) => o.id));
      return;
    }
    const fresh = orders.filter((o) => !knownIds.current.has(o.id));
    if (fresh.length > 0) {
      playBeep();
      const latest = fresh[fresh.length - 1];
      setToast(`New order — Table ${latest.table} · ₹${latest.total}`);
      fresh.forEach((o) => recentIds.current.add(o.id));
      setTimeout(() => {
        fresh.forEach((o) => recentIds.current.delete(o.id));
        forceTick((n) => n + 1);
      }, 6000);
      setTimeout(() => setToast(null), 5000);
    }
    orders.forEach((o) => knownIds.current.add(o.id));
  }, [orders]);

  const updateStatus = (id, status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    updateOrderStatus(id, status).catch(() => {
      alert("Couldn't update the order — please check your connection.");
    });
  };

  const cancelOrder = (id) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    deleteOrder(id).catch(() => {
      alert("Couldn't cancel the order — please check your connection.");
    });
  };

  const addManualOrder = (order) => {
    createOrder(order)
      .then((saved) => {
        setOrders((prev) => [saved, ...prev]);
        setShowNewOrder(false);
      })
      .catch(() => {
        alert("Couldn't create the order — please check your connection.");
      });
  };

  const scopedOrders = useMemo(
    () => (showAll ? orders : orders.filter((o) => isToday(o.placedAt))),
    [orders, showAll]
  );

  const columns = useMemo(
    () =>
      COLUMNS.map((col) => ({
        ...col,
        orders: scopedOrders
          .filter((o) => o.status === col.key)
          .sort((a, b) =>
            col.key === "completed"
              ? new Date(b.placedAt) - new Date(a.placedAt)
              : new Date(a.placedAt) - new Date(b.placedAt)
          ),
      })),
    [scopedOrders]
  );

  const todayOrders = orders.filter((o) => isToday(o.placedAt));
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = todayOrders.filter((o) => o.status !== "completed").length;

  if (!authed) {
    return <LoginGate onSuccess={() => setAuthed(true)} />;
  }

  return (
    <div className="owner-dashboard">
      {toast && <div className="owner-toast">{toast}</div>}

      <header className="owner-header">
        <div className="owner-header-left">
          <div className="owner-header-logo">RC</div>
          <div>
            <h1>Raghuveer Cafe</h1>
            <p>Owner Dashboard</p>
          </div>
        </div>
        <div className="owner-header-right">
          <span className="owner-clock">
            {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <a
            href="/?qr"
            target="_blank"
            rel="noopener noreferrer"
            className="owner-btn"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", background: "#f5eee6", border: "1px solid #d4c8bc", color: "#251d16" }}
          >
            📱 Table QRs (9)
          </a>
          <button className="owner-btn owner-btn-advance" onClick={() => setShowNewOrder(true)}>
            <IconPlus /> New Order
          </button>
          <button
            className="owner-btn owner-btn-cancel"
            onClick={() => {
              sessionStorage.removeItem("ownerAuthed");
              setAuthed(false);
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="owner-stats">
        <div className="owner-stat-card accent-blue">
          <span className="owner-stat-icon"><IconReceipt /></span>
          <div>
            <span className="owner-stat-value">{todayOrders.length}</span>
            <span className="owner-stat-label">Orders Today</span>
          </div>
        </div>
        <div className="owner-stat-card accent-gold">
          <span className="owner-stat-icon"><IconRupee /></span>
          <div>
            <span className="owner-stat-value">₹{todayRevenue}</span>
            <span className="owner-stat-label">Revenue Today</span>
          </div>
        </div>
        <div className="owner-stat-card accent-green">
          <span className="owner-stat-icon"><IconClock /></span>
          <div>
            <span className="owner-stat-value">{pendingCount}</span>
            <span className="owner-stat-label">Pending</span>
          </div>
        </div>
      </div>

      <label className="owner-showall">
        <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
        Show older days too
      </label>

      <div className="owner-kanban">
        {columns.map((col) => (
          <div className={"owner-kanban-col col-" + col.key} key={col.key}>
            <div className="owner-kanban-col-head">
              <span className="owner-kanban-col-title">
                <span className="owner-kanban-dot" />
                {col.label}
              </span>
              <span className="owner-kanban-count">{col.orders.length}</span>
            </div>
            <div className="owner-kanban-col-body">
              {col.orders.length === 0 && <p className="owner-empty">No orders here</p>}
              {col.key === "completed"
                ? col.orders.map((order) => (
                    <CompactOrderRow key={order.id} order={order} onPrint={setPrintOrder} />
                  ))
                : col.orders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      columnKey={col.key}
                      next={col.next}
                      actionLabel={col.actionLabel}
                      onAdvance={updateStatus}
                      onCancel={cancelOrder}
                      onPrint={setPrintOrder}
                      justArrived={recentIds.current.has(order.id)}
                    />
                  ))}
            </div>
          </div>
        ))}
      </div>

      <Receipt order={printOrder} onClose={() => setPrintOrder(null)} />

      {showNewOrder && (
        <NewOrderModal onClose={() => setShowNewOrder(false)} onSubmit={addManualOrder} />
      )}
    </div>
  );
}
