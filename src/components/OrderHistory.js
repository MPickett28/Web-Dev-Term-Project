import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:5000";

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short"
});

async function readResponse(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function formatCurrency(value) {
  const amount = Number(value);
  return currencyFormatter.format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : dateFormatter.format(date);
}

function statusClassName(status) {
  const safeStatus = String(status || "Unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  return `order-status order-status-${safeStatus}`;
}

function OrderHistory({ onBackToAccount, onLoginRequired }) {
  const { token, isLoggedIn, logout } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authenticationError, setAuthenticationError] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const handleAuthenticationError = useCallback((message) => {
    logout();
    setAuthenticationError(true);
    setError(message);
    setSelectedOrder(null);
  }, [logout]);

  const loadOrders = useCallback(async (signal) => {
    if (!token || !isLoggedIn) {
      setLoading(false);
      setAuthenticationError(true);
      setError((currentError) =>
        currentError || "Please log in to view your purchase history."
      );
      return;
    }

    setLoading(true);
    setError("");
    setAuthenticationError(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        signal
      });
      const data = await readResponse(response);

      if (response.status === 401) {
        handleAuthenticationError(
          "Your session expired. Please log in again to view your orders."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to load your purchase history.");
      }

      const sortedOrders = Array.isArray(data.orders)
        ? [...data.orders].sort((first, second) => {
            const dateDifference =
              new Date(second.createdAt).getTime() -
              new Date(first.createdAt).getTime();

            if (Number.isFinite(dateDifference) && dateDifference !== 0) {
              return dateDifference;
            }

            return Number(second.orderId) - Number(first.orderId);
          })
        : [];

      setOrders(sortedOrders);
    } catch (requestError) {
      if (requestError.name === "AbortError") {
        return;
      }

      setError(
        requestError instanceof TypeError
          ? "Unable to connect to the order server. Please make sure the backend is running."
          : requestError.message || "Unable to load your purchase history."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [handleAuthenticationError, isLoggedIn, token]);

  useEffect(() => {
    const controller = new AbortController();
    loadOrders(controller.signal);

    return () => controller.abort();
  }, [loadOrders]);

  const loadOrderDetails = async (orderId) => {
    if (!token) {
      handleAuthenticationError(
        "Please log in to view the details for this order."
      );
      return;
    }

    setDetailsLoading(true);
    setDetailsError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await readResponse(response);

      if (response.status === 401) {
        handleAuthenticationError(
          "Your session expired. Please log in again to view this order."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to load the order details.");
      }

      setSelectedOrder(data.order);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      setDetailsError(
        requestError instanceof TypeError
          ? "Unable to connect to the order server. Please try again."
          : requestError.message || "Unable to load the order details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  if (authenticationError || !isLoggedIn) {
    return (
      <main className="orders-page orders-state-page">
        <section className="orders-state-card" role="alert">
          <div className="orders-state-icon" aria-hidden="true">!</div>
          <p className="cart-eyebrow">AUTHENTICATION REQUIRED</p>
          <h1>Purchase History Locked</h1>
          <p>{error || "Please log in to view your purchase history."}</p>
          <button
            type="button"
            className="cart-primary-button"
            onClick={() => onLoginRequired(error)}
          >
            Go to Login
          </button>
        </section>
      </main>
    );
  }

  if (selectedOrder) {
    return (
      <main className="orders-page">
        <div className="orders-heading">
          <div>
            <p className="cart-eyebrow">ORDER DETAILS</p>
            <h1>Order #{selectedOrder.orderId}</h1>
            <p>{formatDate(selectedOrder.createdAt)}</p>
          </div>
          <button
            type="button"
            className="checkout-back-button"
            onClick={() => {
              setSelectedOrder(null);
              setDetailsError("");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            ← Back to Orders
          </button>
        </div>

        <div className="order-detail-layout">
          <section className="order-detail-card" aria-labelledby="purchased-items-title">
            <div className="order-detail-card-heading">
              <div>
                <p className="cart-eyebrow">PURCHASED ITEMS</p>
                <h2 id="purchased-items-title">Arsenal Loadout</h2>
              </div>
              <span className={statusClassName(selectedOrder.status)}>
                {selectedOrder.status || "Unknown"}
              </span>
            </div>

            <div className="order-detail-items">
              {selectedOrder.items.map((item) => (
                <article
                  className="order-detail-item"
                  key={item.orderItemId || `${item.productId}-${item.productName}`}
                >
                  <div className="order-detail-product">
                    <span className="order-detail-product-icon" aria-hidden="true">⚔</span>
                    <div>
                      <h3>{item.productName}</h3>
                      <p>Product #{item.productId}</p>
                    </div>
                  </div>
                  <div>
                    <span>Unit Price</span>
                    <strong>{formatCurrency(item.unitPrice)}</strong>
                  </div>
                  <div>
                    <span>Quantity</span>
                    <strong>{item.quantity}</strong>
                  </div>
                  <div>
                    <span>Line Total</span>
                    <strong>{formatCurrency(item.lineTotal)}</strong>
                  </div>
                </article>
              ))}
            </div>

            <div className="order-detail-total">
              <span>Final Order Total</span>
              <strong>{formatCurrency(selectedOrder.totalAmount)}</strong>
            </div>
          </section>

          <aside className="order-shipping-card">
            <p className="cart-eyebrow">SHIPPING INFORMATION</p>
            <h2>Delivery Destination</h2>
            <address>
              <strong>{selectedOrder.shipping.name}</strong>
              <span>{selectedOrder.shipping.address}</span>
              <span>
                {selectedOrder.shipping.city}, {selectedOrder.shipping.region}{" "}
                {selectedOrder.shipping.postalCode}
              </span>
              <span>{selectedOrder.shipping.country}</span>
            </address>
            <div className="order-shipping-meta">
              <span>Status</span>
              <strong className={statusClassName(selectedOrder.status)}>
                {selectedOrder.status || "Unknown"}
              </strong>
            </div>
          </aside>
        </div>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <div className="orders-heading">
        <div>
          <p className="cart-eyebrow">HERO PURCHASES</p>
          <h1>Purchase History</h1>
          <p>Review every order placed through Terraria Arsenal.</p>
        </div>
        <button type="button" className="checkout-back-button" onClick={onBackToAccount}>
          ← Back to My Account
        </button>
      </div>

      {loading ? (
        <section className="orders-state-card" role="status">
          <div className="orders-loading-icon" aria-hidden="true"></div>
          <h2>Loading Your Orders...</h2>
          <p>Searching the Arsenal records.</p>
        </section>
      ) : error ? (
        <section className="orders-state-card" role="alert">
          <div className="orders-state-icon" aria-hidden="true">!</div>
          <h2>Orders Unavailable</h2>
          <p>{error}</p>
          <button
            type="button"
            className="cart-primary-button"
            onClick={() => loadOrders()}
          >
            Try Again
          </button>
        </section>
      ) : orders.length === 0 ? (
        <section className="orders-state-card">
          <div className="orders-empty-icon" aria-hidden="true">◇</div>
          <h2>No Orders Yet</h2>
          <p>Your completed purchases will appear here.</p>
        </section>
      ) : (
        <section className="orders-list" aria-label="Purchase history">
          {detailsError && (
            <p className="account-message account-message-error" role="alert">
              {detailsError}
            </p>
          )}

          {orders.map((order) => (
            <article className="order-history-card" key={order.orderId}>
              <div className="order-history-main">
                <div>
                  <p className="cart-eyebrow">ORDER NUMBER</p>
                  <h2>#{order.orderId}</h2>
                </div>
                <span className={statusClassName(order.status)}>
                  {order.status || "Unknown"}
                </span>
              </div>

              <dl className="order-history-meta">
                <div>
                  <dt>Date</dt>
                  <dd>{formatDate(order.createdAt)}</dd>
                </div>
                <div>
                  <dt>Items</dt>
                  <dd>
                    {order.itemCount} {Number(order.itemCount) === 1 ? "item" : "items"}
                  </dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd>{formatCurrency(order.totalAmount)}</dd>
                </div>
              </dl>

              <button
                type="button"
                className="order-details-button"
                onClick={() => loadOrderDetails(order.orderId)}
                disabled={detailsLoading}
              >
                {detailsLoading ? "Loading..." : "View Details"}
              </button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default OrderHistory;
