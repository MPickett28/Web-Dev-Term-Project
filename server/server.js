require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/database");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const configuredOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function allowOrigin(origin, callback) {
  const isLocalDevelopmentOrigin =
    process.env.NODE_ENV !== "production" &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");

  if (!origin || configuredOrigins.includes(origin) || isLocalDevelopmentOrigin) {
    callback(null, true);
    return;
  }

  const error = new Error(`Origin not allowed by CORS: ${origin}`);
  error.status = 403;
  callback(error);
}

app.disable("x-powered-by");
app.use(
  cors({
    origin: allowOrigin
  })
);
app.use(express.json());

app.get("/api/health", async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    next(error);
  }
});

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    await pool.query("SELECT 1");

    app.listen(PORT, () => {
      console.log(`API server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to MySQL:", error.message);
    process.exit(1);
  }
}

startServer();
