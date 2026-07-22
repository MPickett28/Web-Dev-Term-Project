import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const API_BASE_URL = "http://localhost:5000";

const emptyShippingForm = {
  name: "",
  address: "",
  city: "",
  region: "",
  postalCode: "",
  country: ""
};

async function readResponse(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function OrderConfirmation({ order, onContinueShopping }) {
  return (
    <main className="checkout-page checkout-confirmation-page">
      <section className="order-confirmation" aria-labelledby="confirmation-title">
        <div className="order-confirmation-icon" aria-hidden="true">✓</div>
        <p className="cart-eyebrow">ORDER RECEIVED</p>
        <h1 id="confirmation-title">Your Loadout Is Being Prepared</h1>
        <p className="order-confirmation-copy">
          Thank you for your order. The Arsenal has started preparing your items.
        </p>

        <div className="order-confirmation-meta">
          <div>
            <span>Order ID</span>
            <strong>#{order.orderId}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{order.status}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>${Number(order.totalAmount).toFixed(2)}</strong>
          </div>
        </div>

        <div className="confirmation-items" aria-label="Purchased items">
          <h2>Purchased Items</h2>
          {order.items.map((item) => (
            <div className="confirmation-item" key={item.productId}>
              <div>
                <strong>{item.productName}</strong>
                <span>
                  {item.quantity} × ${Number(item.unitPrice).toFixed(2)}
                </span>
              </div>
              <strong>${Number(item.lineTotal).toFixed(2)}</strong>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="cart-primary-button confirmation-continue-button"
          onClick={onContinueShopping}
        >
          Continue Shopping
        </button>
      </section>
    </main>
  );
}

function Checkout({
  order = null,
  onBackToCart,
  onOrderSuccess,
  onContinueShopping,
  onAuthenticationRequired
}) {
  const { user, token, logout } = useContext(AuthContext);
  const { cartItems, cartCount, cartTotal, clearCart } = useCart();
  const [shipping, setShipping] = useState(() => ({
    ...emptyShippingForm,
    name: [user?.firstName, user?.lastName].filter(Boolean).join(" ")
  }));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const accountName = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(" ");

    if (accountName) {
      setShipping((current) => ({
        ...current,
        name: current.name || accountName
      }));
    }
  }, [user]);

  if (order) {
    return (
      <OrderConfirmation
        order={order}
        onContinueShopping={onContinueShopping}
      />
    );
  }

  const updateShipping = (event) => {
    const { name, value } = event.target;

    setShipping((current) => ({
      ...current,
      [name]: value
    }));
    setError("");
  };

  const validateCheckout = () => {
    if (cartItems.length === 0) {
      return "Your cart is empty.";
    }

    if (Object.values(shipping).some((value) => !value.trim())) {
      return "Please complete every shipping field.";
    }

    const hasInvalidQuantity = cartItems.some(
      (item) =>
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) <= 0
    );

    if (hasInvalidQuantity) {
      return "Every cart item must have a valid quantity.";
    }

    return "";
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validateCheckout();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!token) {
      onAuthenticationRequired("Please log in before placing your order.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          shipping: Object.fromEntries(
            Object.entries(shipping).map(([key, value]) => [key, value.trim()])
          ),
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: Number(item.quantity)
          }))
        })
      });
      const data = await readResponse(response);

      if (response.status === 401) {
        logout();
        onAuthenticationRequired(
          "Your session expired. Please log in again to complete checkout."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to place your order.");
      }

      clearCart();
      onOrderSuccess(data.order);
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Unable to connect to the order server. Please make sure the backend is running."
          : requestError.message || "Unable to place your order."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="cart-page cart-empty">
        <div className="cart-empty-icon" aria-hidden="true">🛒</div>
        <h1 className="section-title">YOUR CART IS EMPTY</h1>
        <p>Add an item before beginning checkout.</p>
        <button type="button" className="cart-primary-button" onClick={onBackToCart}>
          Return to Cart
        </button>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="cart-heading checkout-heading">
        <div>
          <p className="cart-eyebrow">SECURE CHECKOUT</p>
          <h1>Complete Your Order</h1>
        </div>
        <button type="button" className="checkout-back-button" onClick={onBackToCart}>
          ← Back to Cart
        </button>
      </div>

      <form className="checkout-layout" onSubmit={handlePlaceOrder} noValidate>
        <section className="checkout-shipping" aria-labelledby="shipping-title">
          <div className="checkout-section-heading">
            <p className="cart-eyebrow">DELIVERY DETAILS</p>
            <h2 id="shipping-title">Shipping Information</h2>
          </div>

          <div className="checkout-fields">
            <label className="checkout-field-wide">
              Full Name
              <input
                type="text"
                name="name"
                value={shipping.name}
                onChange={updateShipping}
                autoComplete="name"
                disabled={isSubmitting}
                required
              />
            </label>

            <label className="checkout-field-wide">
              Address
              <input
                type="text"
                name="address"
                value={shipping.address}
                onChange={updateShipping}
                autoComplete="street-address"
                disabled={isSubmitting}
                required
              />
            </label>

            <label>
              City
              <input
                type="text"
                name="city"
                value={shipping.city}
                onChange={updateShipping}
                autoComplete="address-level2"
                disabled={isSubmitting}
                required
              />
            </label>

            <label>
              Province / State / Region
              <input
                type="text"
                name="region"
                value={shipping.region}
                onChange={updateShipping}
                autoComplete="address-level1"
                disabled={isSubmitting}
                required
              />
            </label>

            <label>
              Postal / ZIP Code
              <input
                type="text"
                name="postalCode"
                value={shipping.postalCode}
                onChange={updateShipping}
                autoComplete="postal-code"
                disabled={isSubmitting}
                required
              />
            </label>

            <label>
              Country
              <input
                type="text"
                name="country"
                value={shipping.country}
                onChange={updateShipping}
                autoComplete="country-name"
                disabled={isSubmitting}
                required
              />
            </label>
          </div>
        </section>

        <aside className="checkout-order-summary">
          <h2>Order Summary</h2>
          <div className="checkout-review-items">
            {cartItems.map((item) => (
              <article className="checkout-review-item" key={item.id}>
                <img src={item.image} alt="" />
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    Qty {item.quantity} × ${Number(item.price).toFixed(2)}
                  </p>
                </div>
                <strong>${(item.price * item.quantity).toFixed(2)}</strong>
              </article>
            ))}
          </div>

          <div className="summary-row">
            <span>Items ({cartCount})</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span className="summary-free">FREE</span>
          </div>
          <div className="summary-total">
            <span>Order Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>

          <p className="checkout-price-note">
            Final prices and availability are confirmed securely by the Arsenal.
          </p>

          {error && (
            <p className="account-message account-message-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="cart-primary-button checkout-place-order"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>
        </aside>
      </form>
    </main>
  );
}

export default Checkout;
