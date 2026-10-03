export default function OrderSuccess({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="success-overlay" onClick={onClose}>
      <div className="success-card" onClick={(e) => e.stopPropagation()}>
        <div className="success-check">
          <svg viewBox="0 0 52 52">
            <circle className="success-check-circle" cx="26" cy="26" r="24" fill="none" />
            <path className="success-check-mark" fill="none" d="M14 27l7 7 16-16" />
          </svg>
        </div>

        <h2>Order Placed!</h2>
        <p className="success-sub">
          {order.orderType === "takeaway" ? (
            <>Sit tight — your <strong>takeaway</strong> order for <strong>Table {order.table}</strong> is being prepared</>
          ) : (
            <>Sit tight — your food is being prepared for <strong>Table {order.table}</strong></>
          )}
        </p>

        <div className="success-items">
          {order.items.map((it, i) => (
            <div className="success-item-row" key={i}>
              <span>{it.qty} × {it.name}</span>
              <span>₹{it.qty * it.price}</span>
            </div>
          ))}
        </div>

        {order.packingCharge > 0 && (
          <div className="success-items">
            <div className="success-item-row">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="success-item-row">
              <span>Packing Charge</span>
              <span>₹{order.packingCharge}</span>
            </div>
          </div>
        )}

        <div className="success-total">
          <span>Total Paid at Counter</span>
          <span>₹{order.total}</span>
        </div>

        <div className="success-eta">🍳 Estimated time: 10–15 minutes</div>

        <button className="success-btn" onClick={onClose}>
          Back to Menu
        </button>
      </div>
    </div>
  );
}
