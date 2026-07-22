const express = require("express");
const {
  getCurrentUser,
  updateCurrentUser
} = require("../controllers/userController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", requireAuth, getCurrentUser);
router.put("/me", requireAuth, updateCurrentUser);

module.exports = router;
