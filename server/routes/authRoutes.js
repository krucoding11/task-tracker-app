// In your Node.js backend: src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  login,
  getMe,
  getEmployeeById,
} = require("../controllers/authController.js");
const { protect, authorize } = require("../middleware/authMiddleware.js");

router.post("/login", login);
router.get("/me", protect, getMe);
router
  .route("/:id")
  .get(protect, authorize("employees:read:details"), getEmployeeById);

module.exports = router;
