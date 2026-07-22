const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderById
} = require("../controllers/orderController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);

// Backward-compatible alias for the earlier checkout endpoint.
router.post("/checkout", createOrder);

module.exports = router;
