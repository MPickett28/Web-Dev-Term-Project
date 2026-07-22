function CategoryPage({
  category,
  categories,
  products,
  onAddToCart,
  onSelectCategory,
  onBack
}) {
  const isAccessories = category.name === "Accessories";
  const itemLabel = isAccessories ? "Accessories" : "Weapons";

  return (
    <main className="category-page" id={category.slug}>
      <section className="category-hero">
        <button type="button" className="category-back-button" onClick={onBack}>
          ← Back to Arsenal
        </button>
        <div className="category-hero-content">
          <div className="category-hero-icon" aria-hidden="true">{category.icon}</div>
          <div>
            <p className="category-eyebrow">
              {isAccessories ? "ACCESSORY COLLECTION" : "WEAPON COLLECTION"}
            </p>
            <h1>{category.name}</h1>
            <p>{category.description}</p>
          </div>
        </div>
        <div className="category-hero-stats">
          <div>
            <strong>{products.length}</strong>
            <span>{itemLabel}</span>
          </div>
          <div>
            <strong>{products.reduce((total, product) => total + product.stock, 0)}</strong>
            <span>In Stock</span>
          </div>
        </div>
      </section>

      {categories.length > 1 && (
        <nav className="category-switcher" aria-label="Weapon categories">
          {categories.map((option) => (
            <button
              type="button"
              key={option.slug}
              className={option.slug === category.slug ? "active" : ""}
              onClick={() => onSelectCategory(option)}
            >
              <span aria-hidden="true">{option.icon}</span>
              {option.name.replace(" Weapons", "")}
            </button>
          ))}
        </nav>
      )}

      <section className="category-products" aria-labelledby="collection-heading">
        <div className="category-products-heading">
          <div>
            <p className="category-eyebrow">AVAILABLE NOW</p>
            <h2 id="collection-heading">Explore the Collection</h2>
          </div>
          <p>{products.length} {products.length === 1 ? "result" : "results"}</p>
        </div>

        <div className="category-product-grid">
          {products.map((product) => {
            const isOutOfStock = product.stock <= 0;

            return (
              <article className="category-product-card" key={product.id}>
                <div className="category-product-art">
                  <img src={product.image} alt={product.name} loading="lazy" />
                  {product.featured && <small>Featured</small>}
                </div>
                <div className="category-product-info">
                  <p className="category-product-type">{product.category}</p>
                  <h3>{product.name}</h3>
                  <p className="category-product-description">{product.description}</p>
                  <div className="category-product-meta">
                    <strong>${product.price.toFixed(2)}</strong>
                    <span className={isOutOfStock ? "stock-empty" : ""}>
                      {isOutOfStock ? "Out of stock" : `${product.stock} in stock`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="category-add-button"
                  onClick={() => onAddToCart(product)}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? "Out of Stock" : "🛒 Add to Cart"}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default CategoryPage;
