export default function CartDrawer({
  open,
  cart,
  subtotal,
  orderType,
  onOrderTypeChange,
  packingCharge,
  grandTotal,
  onClose,
  onPlaceOrder,
  placing,
  onAdd,
  onRemove,
}) {
  const entries = Object.values(cart);

  return (
    <>
      <div className={"overlay" + (open ? " visible" : "")} onClick={onClose} />
      <div className={"cart-drawer" + (open ? " open" : "")}>
        <div className="drawer-handle" />
        <div className="cart-header">
          <h2>Your Order</h2>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="order-type-toggle">
          <button
            className={"order-type-btn" + (orderType === "dinein" ? " active" : "")}
            onClick={() => onOrderTypeChange("dinein")}
          >
            Dine-in
          </button>
          <button
            className={"order-type-btn" + (orderType === "takeaway" ? " active" : "")}
            onClick={() => onOrderTypeChange("takeaway")}
          >
            Takeaway
          </button>
        </div>

        <div className="cart-items">
          {entries.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <p>Your cart is empty</p>
              <span>Add something tasty to get started</span>
            </div>
          ) : (
            entries.map((e) => (
              <div className="cart-item-row" key={e.item.id}>
                <span className="name">{e.item.name}</span>
                <div className="cart-item-right">
                  <div className="qty-control small">
                    <button onClick={() => onRemove(e.item.id)}>−</button>
                    <span>{e.qty}</span>
                    <button onClick={() => onAdd(e.item)}>+</button>
                  </div>
                  <span className="row-price">₹{e.item.price * e.qty}</span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="cart-footer">
          {orderType === "takeaway" && packingCharge > 0 && (
            <>
              <div className="cart-subtotal-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="cart-subtotal-row">
                <span>Packing Charge</span>
                <span>₹{packingCharge}</span>
              </div>
            </>
          )}
          <div className="cart-total-row">
            <span>To Pay</span>
            <span>₹{grandTotal}</span>
          </div>
          <button
            className="place-order-btn"
            disabled={entries.length === 0 || placing}
            onClick={onPlaceOrder}
          >
            {placing ? "Placing Order…" : `Place Order · ₹${grandTotal}`}
          </button>
        </div>
      </div>
    </>
  );
}
