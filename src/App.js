import React, { useState, useContext, useEffect } from "react";
import "./App.css";

import { getProducts } from "./services/productServices";
import { CartContext } from "./context/CartContext";
import { AuthContext } from "./context/AuthContext";

import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Login from "./components/Login";
import OrderHistory from "./components/OrderHistory";
import CategoryPage from "./components/CategoryPage";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loginNotice, setLoginNotice] = useState("");
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");

  const { addToCart, cartCount } = useContext(CartContext);

  const {
    user,
    isLoggedIn,
    authLoading
  } = useContext(AuthContext);

  useEffect(() => {
    async function loadProducts() {
      try {
        const databaseProducts = await getProducts();

        const formattedProducts = databaseProducts.map((product) => ({
          id: product.product_id,
          name: product.product_name,
          description: product.description,
          price: Number(product.price),
          stock: product.inventory_quantity,
          image: product.image_url,
          featured: Boolean(product.is_featured),
          category: product.category_name,
          categoryId: product.category_id
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error(error);
        setProductError(error.message);
      } finally {
        setLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    if (checkoutPending && isLoggedIn && !authLoading) {
      setCheckoutPending(false);
      setLoginNotice("");
      setCurrentView("checkout");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [checkoutPending, isLoggedIn, authLoading]);

  const showView = (view) => (event) => {
    event.preventDefault();
    setCheckoutPending(false);
    setLoginNotice("");
    setCompletedOrder(null);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showCategory = (category) => (event) => {
    event.preventDefault();
    setCheckoutPending(false);
    setLoginNotice("");
    setCompletedOrder(null);

    if (category.name === "Accessories") {
      setCurrentView("accessories");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSelectedCategory(category);
    setCurrentView("category");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();

    return (
      product.name.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search)
    );
  });

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      setLoginNotice("Please log in before continuing to checkout.");
      setCheckoutPending(true);
      setCurrentView("login");
    } else {
      setCompletedOrder(null);
      setCurrentView("checkout");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthenticationRequired = (message) => {
    setLoginNotice(message);
    setCheckoutPending(true);
    setCurrentView("login");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOrderSuccess = (order) => {
    setCompletedOrder(order);
    setCurrentView("orderConfirmation");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContinueShopping = () => {
    setCheckoutPending(false);
    setLoginNotice("");
    setCompletedOrder(null);
    setCurrentView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToCart = () => {
    setCurrentView("cart");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewOrders = () => {
    if (!isLoggedIn) {
      setLoginNotice("Please log in to view your purchase history.");
      setCurrentView("login");
    } else {
      setCurrentView("orders");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOrdersLoginRequired = (message) => {
    setCheckoutPending(false);
    setLoginNotice(message || "Please log in to view your purchase history.");
    setCurrentView("login");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const featuredProducts = products.filter(
    (product) => product.featured
  );

  const categories = [
    {
      name: "Melee Weapons",
      slug: "melee-weapons",
      description: "Swords, spears, and close-range power.",
      icon: "⚔️"
    },
    {
      name: "Magic Weapons",
      slug: "magic-weapons",
      description: "Channel powerful magic to destroy enemies.",
      icon: "🔮"
    },
    {
      name: "Ranged Weapons",
      slug: "ranged-weapons",
      description: "Bows, guns, and explosive mayhem.",
      icon: "🏹"
    },
    {
      name: "Summoner Weapons",
      slug: "summoner-weapons",
      description: "Summon minions to fight by your side.",
      icon: "👻"
    }
  ];

  const accessoriesCategory = {
    name: "Accessories",
    slug: "accessories",
    description:
      "Powerful equipment that improves movement, defense, and combat ability.",
    icon: "🛡️"
  };

  const homepageCategories = [
    ...categories,
    accessoriesCategory
  ];

  if (loadingProducts || authLoading) {
    return <h2>Loading...</h2>;
  }

  if (productError) {
    return <h2>{productError}</h2>;
  }

  return (
    <div className="App">
      {/* ==================== BANNER ==================== */}
      <header className="banner">
        <div className="banner-content">
          <h1 className="banner-title">
            <span>TERRARIA</span>
            <span>ARSENAL</span>
          </h1>

          <p className="banner-subtitle">
            LEGENDARY WEAPONS FOR LEGENDARY HEROES
          </p>
        </div>

        <div className="banner-decorations"></div>
      </header>

      {/* ==================== NAVIGATION ==================== */}
      <nav className="navbar">
        <div className="nav-container">
          <a
            href="#home"
            className="nav-item home-link"
            onClick={showView("home")}
          >
            <span className="nav-icon">🏠</span>
            Home
          </a>

          <div className="nav-dropdown">
            <button
              type="button"
              className="nav-item"
              aria-haspopup="true"
            >
              <span className="nav-icon">⚔️</span>
              Weapons
              <span className="dropdown-arrow">▼</span>
            </button>

            <div className="nav-dropdown-menu">
              {categories.map((category) => (
                <a
                  key={category.slug}
                  href={`#${category.slug}`}
                  onClick={showCategory(category)}
                >
                  <span>{category.icon}</span>
                  {category.name}
                </a>
              ))}
            </div>
          </div>

          <div className="nav-dropdown">
            <button
              type="button"
              className="nav-item accessories-link"
              onClick={showView("accessories")}
            >
              <span className="nav-icon">🛡️</span>
              Accessories
              <span className="dropdown-arrow">▼</span>
            </button>
          </div>

          <div className="nav-right">
            <a
              href="#cart"
              className="nav-item cart-link"
              onClick={showView("cart")}
            >
              <span className="nav-icon">🛒</span>
              Cart
              <span className="cart-badge">
                ({cartCount})
              </span>
            </a>

            <a
              href={isLoggedIn ? "#account" : "#login"}
              className="nav-item login-link"
              onClick={showView("login")}
            >
              <span className="nav-icon">👤</span>

              {isLoggedIn && user
                ? user.firstName
                : "Login"}
            </a>
          </div>
        </div>
      </nav>

      {/* ==================== PAGE CONTENT ==================== */}
      {currentView === "cart" ? (
        <Cart
          onContinueShopping={handleContinueShopping}
          onCheckout={handleCheckout}
        />
      ) : currentView === "checkout" ? (
        <Checkout
          onBackToCart={handleBackToCart}
          onOrderSuccess={handleOrderSuccess}
          onContinueShopping={handleContinueShopping}
          onAuthenticationRequired={handleAuthenticationRequired}
        />
      ) : currentView === "orderConfirmation" && completedOrder ? (
        <Checkout
          order={completedOrder}
          onContinueShopping={handleContinueShopping}
        />
      ) : currentView === "orders" ? (
        <OrderHistory
          onBackToAccount={() => setCurrentView("login")}
          onLoginRequired={handleOrdersLoginRequired}
        />
      ) : currentView === "login" ? (
        <Login notice={loginNotice} onViewOrders={handleViewOrders} />
      ) : currentView === "category" &&
        selectedCategory ? (
        <CategoryPage
          category={selectedCategory}
          categories={categories}
          products={products.filter(
            (product) =>
              product.category === selectedCategory.name
          )}
          onAddToCart={handleAddToCart}
          onSelectCategory={(category) => {
            setSelectedCategory(category);
            window.scrollTo({
              top: 0,
              behavior: "smooth"
            });
          }}
          onBack={() => setCurrentView("home")}
        />
      ) : currentView === "accessories" ? (
        <CategoryPage
          category={accessoriesCategory}
          categories={[accessoriesCategory]}
          products={products.filter(
            (product) =>
              product.category === "Accessories"
          )}
          onAddToCart={handleAddToCart}
          onSelectCategory={() => {}}
          onBack={() => setCurrentView("home")}
        />
      ) : (
        <>
          {/* ==================== FEATURED ITEMS ==================== */}
          <section className="featured-section">
            <h2 className="section-title">
              <span className="title-decoration">
                ✦
              </span>
              FEATURED ITEMS
              <span className="title-decoration">
                ✦
              </span>
            </h2>

            <div className="featured-products">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="featured-card"
                >
                  <div className="product-image-placeholder">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                    />
                  </div>

                  <h3 className="product-name">
                    {product.name}
                  </h3>

                  <p className="product-description">
                    {product.description}
                  </p>

                  <p className="product-price">
                    ${product.price.toFixed(2)}
                  </p>

                  <button
                    type="button"
                    className="btn-view-details"
                    onClick={() =>
                      handleAddToCart(product)
                    }
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* ==================== CATEGORIES ==================== */}
          <section
            className="categories-section"
            id="weapon-categories"
          >
            <h2 className="section-title">
              <span className="title-decoration">
                ✦
              </span>
              CATEGORIES
              <span className="title-decoration">
                ✦
              </span>
            </h2>

            <div className="categories-grid">
              {homepageCategories.map(
                (category) => (
                  <div
                    key={category.slug}
                    className="category-card"
                  >
                    <div className="category-icon">
                      {category.icon}
                    </div>

                    <h3 className="category-name">
                      {category.name}
                    </h3>

                    <p className="category-description">
                      {category.description}
                    </p>

                    <a
                      href={`#${category.slug}`}
                      className="browse-items-link"
                      onClick={showCategory(category)}
                    >
                      Browse Items
                      <span className="arrow">
                        →
                      </span>
                    </a>
                  </div>
                )
              )}
            </div>
          </section>

          {/* ==================== SEARCH ==================== */}
          <section
            className="search-section"
            id="search-products"
          >
            <h2 className="section-title">
              <span className="title-decoration">
                ✦
              </span>
              SEARCH PRODUCTS
              <span className="title-decoration">
                ✦
              </span>
            </h2>

            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search for weapons, accessories, and more..."
                value={searchTerm}
                onChange={handleSearch}
              />

              <button
                type="button"
                className="btn-search"
              >
                🔍 Search
              </button>
            </div>

            <div className="search-results">
              {searchTerm ? (
                filteredProducts.length > 0 ? (
                  <p className="results-count">
                    Found {filteredProducts.length}{" "}
                    product(s) matching "
                    {searchTerm}"
                  </p>
                ) : (
                  <p className="no-results">
                    No products found matching "
                    {searchTerm}"
                  </p>
                )
              ) : (
                <p className="results-hint">
                  Enter a search term to find weapons
                  and accessories
                </p>
              )}
            </div>
          </section>
        </>
      )}

      {/* ==================== FOOTER ==================== */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section logo-section">
            <h2 className="footer-logo">
              🗡️ TERRARIA ARSENAL
            </h2>

            <p className="footer-tagline">
              Legendary Weapons for Legendary Heroes.
            </p>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">
              QUICK LINKS
            </h3>

            <ul className="footer-links">
              <li>
                <a
                  href="#home"
                  onClick={showView("home")}
                >
                  Home
                </a>
              </li>

              <li>
                <a
                  href="#cart"
                  onClick={showView("cart")}
                >
                  Cart
                </a>
              </li>

              <li>
                <a
                  href={
                    isLoggedIn
                      ? "#account"
                      : "#login"
                  }
                  onClick={showView("login")}
                >
                  {isLoggedIn
                    ? "My Account"
                    : "Login / Register"}
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">
              CUSTOMER SERVICE
            </h3>

            <ul className="footer-links">
              <li>
                <a href="#contact">Contact Us</a>
              </li>

              <li>
                <a href="#about">About Us</a>
              </li>

              <li>
                <a href="#shipping">
                  Shipping Policy
                </a>
              </li>

              <li>
                <a href="#returns">
                  Returns & Refunds
                </a>
              </li>

              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>
          </div>

          <div className="footer-section social-section">
            <h3 className="footer-title">
              FOLLOW US
            </h3>

            <div className="social-icons">
              <a
                href="#discord"
                className="social-icon"
                title="Discord"
              >
                💬
              </a>

              <a
                href="#twitter"
                className="social-icon"
                title="Twitter"
              >
                𝕏
              </a>

              <a
                href="#youtube"
                className="social-icon"
                title="YouTube"
              >
                ▶️
              </a>

              <a
                href="#twitch"
                className="social-icon"
                title="Twitch"
              >
                📺
              </a>
            </div>

            <p className="footer-creators">
              Marcus Pickett<br />
              Liam Dyer
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; 2026 Terraria Arsenal. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
