// const express = require("express");
// const router = express.Router();

// const {
//   getTasksByEmployeeId,
//   getTasksByProject,
//   logTime,
//   getTimeEntriesForTask,
// } = require("../controllers/taskController.js");

// const { protect, authorize } = require("../middleware/authMiddleware");

// const isLocal = process.env.LOCAL_MODE === "true";

// const maybeProtect = isLocal
//   ? (req, res, next) => {
//       req.user = {
//         id: 1,
//         permissions: [
//           "tasks:manage",
//           "tasks:read",
//           "tasks:log:time",
//         ],
//       };
//       next();
//     }
//   : protect;

// const maybeAuthorize = isLocal
//   ? () => (req, res, next) => next()
//   : authorize;

// // ================= ROUTES =================
// router.get(
//   "/my-tasks",
//   maybeProtect,
//   maybeAuthorize("tasks:manage", "tasks:read"),
//   getTasksByEmployeeId
// );

// router.get(
//   "/project/:projectId",
//   maybeProtect,
//   maybeAuthorize("tasks:read"),
//   getTasksByProject
// );

// router.post(
//   "/log-time",
//   maybeProtect,
//   maybeAuthorize("tasks:log:time"),
//   logTime
// );

// router.get(
//   "/:taskId/time-entries",
//   maybeProtect,
//   maybeAuthorize("tasks:read", "tasks:log:time"),
//   getTimeEntriesForTask
// );

// module.exports = router;



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
