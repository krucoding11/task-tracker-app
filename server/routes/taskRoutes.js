const express = require("express");
const router = express.Router();
const { getTasksByEmployeeId } = require("../controllers/taskController.js");

const { protect, authorize } = require("../middleware/authMiddleware");

router.get(
  "/my-tasks",
  protect,
  authorize("tasks:manage", "tasks:read"),
  getTasksByEmployeeId,
);

module.exports = router;
