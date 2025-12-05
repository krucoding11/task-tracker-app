const express = require("express");
const router = express.Router();
const { getAllProjects } = require("../controllers/projectController.js");

const { protect, authorize } = require("../middleware/authMiddleware.js");
router.get(
  "/",
  protect,
  authorize("projects:manage", "projects:read"),
  getAllProjects,
);

module.exports = router;
