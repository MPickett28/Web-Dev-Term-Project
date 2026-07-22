import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

// Get the root DOM element where the React app will be mounted
const root = ReactDOM.createRoot(
  document.getElementById("root")
);

// Render the app with CartProvider context wrapper
// CartProvider manages all cart state and localStorage persistence
root.render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);