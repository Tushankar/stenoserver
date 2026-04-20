const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getAdminDashboard,
  createPassage,
} = require("../controllers/adminController");

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res
      .status(403)
      .json({ success: false, message: "Not authorized as an admin" });
  }
};

router.get("/dashboard", protect, requireAdmin, getAdminDashboard);
router.post("/passage", protect, requireAdmin, createPassage);

module.exports = router;
