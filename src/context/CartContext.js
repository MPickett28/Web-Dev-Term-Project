import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

// ==================== CART CONTEXT SETUP ====================
// Create the CartContext to manage cart state across the entire app
const CartContext = createContext(null);

// ==================== CART PROVIDER COMPONENT ====================
// CartProvider component wraps the app and manages all cart functionality
export function CartProvider({ children }) {
  // Initialize cart items from localStorage or empty array
  const [cartItems, setCartItems] = useState(() => {
    try {
      // Try to load cart from browser's localStorage
      const savedCart = localStorage.getItem("terrariaArsenalCart");
      // Return parsed cart if exists, otherwise empty array
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      // Log error if localStorage fails
      console.error("Could not load cart:", error);
      return [];
    }
  });

  // ==================== SAVE CART TO STORAGE ====================
  // Effect hook: automatically save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      // Save current cart items to browser's localStorage as JSON
      localStorage.setItem(
        "terrariaArsenalCart",
        JSON.stringify(cartItems)
      );
    } catch (error) {
      // Log error if localStorage save fails
      console.error("Could not save cart:", error);
    }
  }, [cartItems]); // Dependency: re-run whenever cartItems changes

  // ==================== ADD TO CART FUNCTION ====================
  // Add a product to cart or increase quantity if already exists
  function addToCart(product) {
    setCartItems((currentItems) => {
      // Check if product already exists in cart
      const existingItem = currentItems.find(
        (item) => item.id === product.id
      );

      // If product exists, increase its quantity
      if (existingItem) {
        return currentItems.map((item) => {
          if (item.id !== product.id) {
            return item;
          }

          // Increase quantity but don't exceed stock
          const newQuantity = item.quantity + 1;

          return {
            ...item,
            quantity: Math.min(newQuantity, product.stock)
          };
        });
      }

      // If product is out of stock, don't add
      if (product.stock <= 0) {
        return currentItems;
      }

      // Add new product to cart with quantity 1
      return [
        ...currentItems,
        {
          ...product,
          quantity: 1
        }
      ];
    });
  }

  // ==================== REMOVE FROM CART FUNCTION ====================
  // Remove a product completely from the cart by ID
  function removeFromCart(productId) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId)
    );
  }

  // ==================== UPDATE QUANTITY FUNCTION ====================
  // Update the quantity of a product in cart
  function updateQuantity(productId, quantity) {
    const numericQuantity = Number(quantity);

    setCartItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item.id !== productId) {
            return item;
          }

          // Ensure quantity is between 0 and product stock
          const validQuantity = Math.min(
            Math.max(numericQuantity, 0),
            item.stock
          );

          return {
            ...item,
            quantity: validQuantity
          };
        })
        // Remove items with 0 quantity
        .filter((item) => item.quantity > 0)
    );
  }

  // ==================== INCREASE QUANTITY FUNCTION ====================
  // Increase quantity of a product by 1
  function increaseQuantity(productId) {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== productId) {
          return item;
        }

        // Increase by 1 but don't exceed stock
        return {
          ...item,
          quantity: Math.min(item.quantity + 1, item.stock)
        };
      })
    );
  }

  // ==================== DECREASE QUANTITY FUNCTION ====================
  // Decrease quantity of a product by 1
  function decreaseQuantity(productId) {
    setCartItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item.id !== productId) {
            return item;
          }

          return {
            ...item,
            quantity: item.quantity - 1
          };
        })
        // Remove items with 0 quantity
        .filter((item) => item.quantity > 0)
    );
  }

  // ==================== CLEAR CART FUNCTION ====================
  // Empty the entire cart
  function clearCart() {
    setCartItems([]);
  }

  // ==================== CART COUNT CALCULATION ====================
  // Calculate total number of items in cart (sum of all quantities)
  // useMemo ensures this only recalculates when cartItems changes
  const cartCount = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, [cartItems]);

  // ==================== CART TOTAL CALCULATION ====================
  // Calculate total price of all items in cart
  // useMemo ensures this only recalculates when cartItems changes
  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  // ==================== CONTEXT VALUE OBJECT ====================
  // Package all cart functions and data to provide to the app
  const value = {
    cartItems,        // Array of items in cart
    addToCart,         // Function to add item to cart
    removeFromCart,    // Function to remove item from cart
    updateQuantity,    // Function to update item quantity
    increaseQuantity,  // Function to increase quantity by 1
    decreaseQuantity,  // Function to decrease quantity by 1
    clearCart,         // Function to clear entire cart
    cartCount,         // Total number of items in cart
    cartTotal          // Total price of all items
  };

  // Provide context to all child components
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// ==================== USE CART HOOK ====================
// Custom hook to access cart context in any component
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}

// Export CartContext for direct use if needed
export { CartContext };