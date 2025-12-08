const express = require("express");
const router = express.Router();
const {
  getTasksByEmployeeId,
  getTasksByProject,
  logTime,
  getTimeEntriesForTask,
} = require("../controllers/taskController.js");

const { protect, authorize } = require("../middleware/authMiddleware");

router.get(
  "/my-tasks",
  protect,
  authorize("tasks:manage", "tasks:read"),
  getTasksByEmployeeId,
);
router.get(
  "/project/:projectId",
  protect,
  authorize("tasks:read"),
  getTasksByProject,
);
router.post("/log-time", protect, authorize("tasks:log:time"), logTime);

router.get(
  "/:taskId/time-entries",
  protect,
  authorize("tasks:manage"),
  getTimeEntriesForTask,
);

module.exports = router;
