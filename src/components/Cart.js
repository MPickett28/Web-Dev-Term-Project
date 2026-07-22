import { useCart } from "../context/CartContext";

function Cart({ onContinueShopping, onCheckout }) {
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <main className="cart-page cart-empty">
        <div className="cart-empty-icon" aria-hidden="true">🛒</div>
        <h1 className="section-title">YOUR CART IS EMPTY</h1>
        <p>Your next legendary weapon is waiting for you.</p>
        <button type="button" className="cart-primary-button" onClick={onContinueShopping}>
          Browse the Arsenal
        </button>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <div>
          <p className="cart-eyebrow">TERRARIA ARSENAL</p>
          <h1>Shopping Cart</h1>
        </div>
        <p className="cart-count">
          {cartCount} {cartCount === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="cart-layout">
        <section className="cart-items" aria-label="Items in your cart">
          {cartItems.map((item) => (
            <article className="cart-item" key={item.id}>
              <img className="cart-item-image" src={item.image} alt={item.name} />

              <div className="cart-item-details">
                <p className="cart-item-category">{item.category}</p>
                <h2>{item.name}</h2>
                <p className="cart-item-description">{item.description}</p>
                <p className="cart-unit-price">${item.price.toFixed(2)} each</p>

                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(item.id)}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onChange={(event) => updateQuantity(item.id, event.target.value)}
                      aria-label={`Quantity of ${item.name}`}
                    />
                    <button
                      type="button"
                      onClick={() => increaseQuantity(item.id)}
                      disabled={item.quantity >= item.stock}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="cart-remove-button"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <p className="cart-line-total">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </article>
          ))}
        </section>

        <aside className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Items ({cartCount})</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span className="summary-free">FREE</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>

          <button
            type="button"
            className="cart-primary-button cart-checkout-button"
            onClick={onCheckout}
          >
            Checkout
          </button>
          <button type="button" className="cart-secondary-button" onClick={onContinueShopping}>
            Continue Shopping
          </button>
          <button type="button" className="cart-clear-button" onClick={clearCart}>
            Clear Cart
          </button>
        </aside>
      </div>
    </main>
  );
}

export default Cart;
