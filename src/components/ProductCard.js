import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const isOutOfStock = product.stock <= 0;

  return (
    <article className="product-card">
      <img
        src={product.image}
        alt={product.name}
        className="product-image"
      />

      <h3>{product.name}</h3>

      <p>{product.description}</p>

      <p className="product-price">
        ${product.price.toFixed(2)}
      </p>

      <p>
        {isOutOfStock
          ? "Out of stock"
          : `${product.stock} available`}
      </p>

      <button
        type="button"
        onClick={() => addToCart(product)}
        disabled={isOutOfStock}
      >
        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </button>
    </article>
  );
}

export default ProductCard;