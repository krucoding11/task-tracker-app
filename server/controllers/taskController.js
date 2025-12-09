const db = require("../config/db");
const { format } = require("date-fns");

const getAuthorizedProjectCreatorIds = async (user) => {
  // If user is Admin, they are authorized for all.
  const isAdmin =
    user.permissions && user.permissions.includes("projects:manage");
  if (isAdmin) return null; // null means all

  // Check for manager or self access
  if (user.permissions && user.permissions.includes("project:self")) {
    let authorizedIds = [user.id];

    // If the user is a manager, include subordinates' IDs
    if (user.permissions.includes("projects:manage:team")) {
      const subordinates = await db("employees")
        .where({ manager_id: user.id })
        .select("id");

      if (subordinates.length > 0) {
        const subordinateIds = subordinates.map((sub) => sub.id);
        authorizedIds = [...authorizedIds, ...subordinateIds];
      }
    }

    return [...new Set(authorizedIds)];
  }

  return []; // No access
};

exports.getTasksByEmployeeId = async (req, res) => {
  const employeeId = req.user.id;
  const user = req.user;

  const isAdmin = user.permissions.includes("tasks:manage");
  console.log("isAdmin..............", isAdmin);

  const { status, page = 1, limit = 10 } = req.query;

  const currentPage = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const offset = (currentPage - 1) * limitNumber;

  if (isNaN(currentPage) || currentPage < 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid page number.",
    });
  }
  try {
    const whereParts = [];
    const bindings = [];

    if (status && status !== "all") {
      whereParts.push("t.status = ?");
      bindings.push(status);
    }

    if (req.query.assigned_to) {
      whereParts.push(`
       t.id IN (
         SELECT DISTINCT task_id FROM task_assignees WHERE employee_id = ?
       )
     `);
      bindings.push(req.query.assigned_to);
    }

    if (!isAdmin) {
      const authorizedCreatorIds = await getAuthorizedProjectCreatorIds(user);
      if (
        user.permissions.includes("tasks:manage:team") &&
        authorizedCreatorIds?.length > 0
      ) {
        whereParts.push(`
         (
           t.creator_id IN (${authorizedCreatorIds.join(",")})
           OR t.id IN (
             SELECT DISTINCT task_id FROM task_assignees WHERE employee_id IN (${authorizedCreatorIds.join(
               ",",
             )})
           )
         )
       `);
      } else {
        whereParts.push(`
         (
           t.creator_id = ?
           OR t.id IN (SELECT DISTINCT task_id FROM task_assignees WHERE employee_id = ?)
         )
       `);
        bindings.push(employeeId, employeeId);
      }
    }

    const whereClause =
      whereParts.length > 0 ? `WHERE ${whereParts.join(" AND ")}` : "";
    const countQuery = `
     SELECT COUNT(DISTINCT t.id) AS total_count
     FROM tasks t
     LEFT JOIN projects p ON p.id = t.project_id
     ${whereClause}
   `;

    const countResult = await db.raw(countQuery, bindings);
    const totalTasks = parseInt(countResult.rows[0].total_count, 10);
    const totalPages = Math.ceil(totalTasks / limitNumber);
    const dataQuery = `
     SELECT
       t.id, t.title, t.description, t.due_date, t.status, t.priority,
       t.creator_id, t.project_id, p.name AS project_name,
       (
         SELECT json_agg(json_build_object('first_name', e.first_name, 'last_name', e.last_name, 'profile_picture_url', e.profile_picture_url, 'id', e.id))
         FROM task_assignees ta
         JOIN employees e ON e.id = ta.employee_id
         WHERE ta.task_id = t.id
       ) AS assigned_employees
     FROM tasks t
     LEFT JOIN projects p ON p.id = t.project_id
     ${whereClause}
     ORDER BY t.due_date ASC
     LIMIT ?
     OFFSET ?
   `;

    const finalBindings = [...bindings, limitNumber, offset];
    const result = await db.raw(dataQuery, finalBindings);

    const formattedTasks = result.rows.map((task) => ({
      ...task,
      assigned_employees: task.assigned_employees || [],
      due_date: task.due_date
        ? format(new Date(task.due_date), "yyyy-MM-dd")
        : null,
    }));

    return res.status(200).json({
      success: true,
      data: formattedTasks,
      meta: {
        total_tasks: totalTasks,
        total_pages: totalPages,
        current_page: currentPage,
        per_page: limitNumber,
        has_more: currentPage < totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    const { message, statusCode } = parseDbError(error);
    return res.status(statusCode).json({ error: message });
  }
};

// resposne :
// {
//     "success": true,
//     "data": [
//         {
//             "id": "c9775c44-a5fb-4801-8f53-b49adb6756f4",
//             "title": "understand HRM Project",
//             "description": "<p>understand HRM Project's all functionality..</p>",
//             "due_date": "2025-11-20",
//             "status": "Review",
//             "priority": "High",
//             "creator_id": 4,
//             "project_id": 2,
//             "project_name": "HRMs",
//             "assigned_employees": [
//                 {
//                     "first_name": "Krusha ",
//                     "last_name": "Golakiya",
//                     "profile_picture_url": "/uploads/profile_pictures/28/1763642894569-329501131.jpg",
//                     "id": 28
//                 }
//             ]
//         },
//         {
//             "id": "701192f1-f7ec-4bb5-9871-98c5a8dc6eb8",
//             "title": "Fix: Replace logo of YSN according to client comment",
//             "description": "<p>Fix: Replace logo of YSN according to client comment</p>",
//             "due_date": "2025-11-20",
//             "status": "Completed",
//             "priority": "High",
//             "creator_id": 25,
//             "project_id": 3,
//             "project_name": "YSN",
//             "assigned_employees": [
//                 {
//                     "first_name": "Krins",
//                     "last_name": "Golakiya",
//                     "profile_picture_url": "/uploads/image-1762003690260.png",
//                     "id": 8
//                 }
//             ]
//         },
//         {
//             "id": "21f204ad-5f57-4ee4-b9fa-879ed1d14bc7",
//             "title": "Profile picture upload issue.",
//             "description": "<p>when i am trying to upload my profile picture of 5.1 MB it shows success upload but not able to see profile pic.</p>",
//             "due_date": "2025-11-20",
//             "status": "Done",
//             "priority": "Medium",
//             "creator_id": 25,
//             "project_id": 2,
//             "project_name": "HRMs",
//             "assigned_employees": [
//                 {
//                     "first_name": "Darshan",
//                     "last_name": "Dhameliya",
//                     "profile_picture_url": "/uploads/profile_pictures/5/1763641162172-785133894.jpg",
//                     "id": 5
//                 }
//             ]
//         },
//         {
//             "id": "a6fa8ce5-29ce-4f02-904a-8196b3a460d6",
//             "title": "Video Upload in announcement",
//             "description": "<p><span style=\"background-color: rgb(255, 255, 255); color: oklch(0.446 0.03 256.802);\">Video Upload in announcement</span></p>",
//             "due_date": "2025-11-21",
//             "status": "Done",
//             "priority": "High",
//             "creator_id": 4,
//             "project_id": 2,
//             "project_name": "HRMs",
//             "assigned_employees": [
//                 {
//                     "first_name": "Darshan",
//                     "last_name": "Dhameliya",
//                     "profile_picture_url": "/uploads/profile_pictures/5/1763641162172-785133894.jpg",
//                     "id": 5
//                 }
//             ]
//         },
//         {
//             "id": "3c5e62fd-d876-4857-82d8-789131294bba",
//             "title": "Delete CRM Duplicate Records",
//             "description": "<p>Delete CRM Plans Duplicate Records</p>",
//             "due_date": "2025-11-24",
//             "status": "Done",
//             "priority": "High",
//             "creator_id": 5,
//             "project_id": null,
//             "project_name": null,
//             "assigned_employees": [
//                 {
//                     "first_name": "Shruti",
//                     "last_name": "Mungra",
//                     "profile_picture_url": "/uploads/image-1762001328515.png",
//                     "id": 14
//                 }
//             ]
//         },
//         {
//             "id": "df4cd89a-72d8-4db7-a691-9597f33d2c5f",
//             "title": "Show loader in file upload",
//             "description": "<p>Show loader in file upload</p>",
//             "due_date": null,
//             "status": "Done",
//             "priority": "Low",
//             "creator_id": 5,
//             "project_id": 2,
//             "project_name": "HRMs",
//             "assigned_employees": [
//                 {
//                     "first_name": "Darshan",
//                     "last_name": "Dhameliya",
//                     "profile_picture_url": "/uploads/profile_pictures/5/1763641162172-785133894.jpg",
//                     "id": 5
//                 }
//             ]
//         },
//         {
//             "id": "744b1b58-8f1b-4507-91e3-3ee4e7ef8e6a",
//             "title": "Task List and Grid view",
//             "description": "<p>Fix Task List and Grid view </p>",
//             "due_date": null,
//             "status": "Completed",
//             "priority": "High",
//             "creator_id": 4,
//             "project_id": null,
//             "project_name": null,
//             "assigned_employees": [
//                 {
//                     "first_name": "Hasti",
//                     "last_name": "Nakrani",
//                     "profile_picture_url": "/uploads/image-1762001378983.png",
//                     "id": 19
//                 }
//             ]
//         },
//         {
//             "id": "bb2823e7-612d-4af7-b1f6-1aa7b2aa2748",
//             "title": "Testing Notification",
//             "description": "<p>Testing Notification</p>",
//             "due_date": null,
//             "status": "In-Progress",
//             "priority": "Low",
//             "creator_id": 5,
//             "project_id": null,
//             "project_name": null,
//             "assigned_employees": [
//                 {
//                     "first_name": "Shree",
//                     "last_name": "Satani",
//                     "profile_picture_url": "/uploads/image-1762001646698.png",
//                     "id": 7
//                 },
//                 {
//                     "first_name": "Nandini",
//                     "last_name": "Verma",
//                     "profile_picture_url": "/uploads/image-1762434930703.png",
//                     "id": 9
//                 }
//             ]
//         },
//         {
//             "id": "374f501e-8c6a-4cf9-90d7-bf62f190999c",
//             "title": "Employee can see project section.",
//             "description": "<p>employee can see projects which assigned.<br><br>also we should add search section while task assign. </p>",
//             "due_date": null,
//             "status": "Completed",
//             "priority": "High",
//             "creator_id": 25,
//             "project_id": 2,
//             "project_name": "HRMs",
//             "assigned_employees": [
//                 {
//                     "first_name": "Darshan ",
//                     "last_name": "Raghvani",
//                     "profile_picture_url": "/uploads/image-1762001461119.png",
//                     "id": 6
//                 }
//             ]
//         },
//         {
//             "id": "545ba455-8861-41bc-8222-71769de706b1",
//             "title": "Add time Format Selection",
//             "description": "<p>for hrm make times 12H format or put in setting how user want to see time in which format</p>",
//             "due_date": null,
//             "status": "Pending",
//             "priority": "Medium",
//             "creator_id": 5,
//             "project_id": null,
//             "project_name": null,
//             "assigned_employees": [
//                 {
//                     "first_name": "Darshan ",
//                     "last_name": "Raghvani",
//                     "profile_picture_url": "/uploads/image-1762001461119.png",
//                     "id": 6
//                 }
//             ]
//         }
//     ],
//     "meta": {
//         "total_tasks": 10,
//         "total_pages": 1,
//         "current_page": 1,
//         "per_page": 10,
//         "has_more": false
//     }
// }

exports.getTasksByProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    const tasks = await db("tasks")
      .where({ project_id: projectId })
      .select("*");

    const tasksWithDetails = await Promise.all(
      tasks.map(async (task) => {
        const assignedEmployees = await db("employees")
          .join("task_assignees", "employees.id", "task_assignees.employee_id")
          .where("task_assignees.task_id", task.id)
          .select(
            "employees.id",
            "employees.profile_picture_url",
            "employees.first_name",
            "employees.last_name",
          );

        let project_name = null;
        if (task.project_id) {
          const project = await db("projects")
            .where({ id: task.project_id })
            .select("name")
            .first();
          project_name = project ? project.name : null;
        }

        let attachedFiles = [];
        if (task.attachment_ids && task.attachment_ids.length > 0) {
          attachedFiles = await db("attachments")
            .whereIn("id", task.attachment_ids)
            .select("id", "filename", "storage_path", "filesize", "mimetype");
        }

        return {
          ...task,
          project_name,
          assigned_employees: assignedEmployees,
          attached_files: attachedFiles,
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: tasksWithDetails,
      message: "Fetched all tasks with assigned employees and attachments",
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Error fetching tasks", error });
  }
};

// response :
// project 3
// {
//     "success": true,
//     "data": [
//         {
//             "id": "701192f1-f7ec-4bb5-9871-98c5a8dc6eb8",
//             "project_id": 3,
//             "assigned_to": null,
//             "title": "Fix: Replace logo of YSN according to client comment",
//             "description": "<p>Fix: Replace logo of YSN according to client comment</p>",
//             "priority": "High",
//             "status": "Completed",
//             "start_date": null,
//             "due_date": "2025-11-20",
//             "estimated_hours": 0,
//             "created_at": "2025-11-21T07:57:31.378Z",
//             "updated_at": "2025-11-25T07:10:36.239Z",
//             "creator_id": 25,
//             "attachment_ids": [],
//             "project_name": "YSN",
//             "assigned_employees": [
//                 {
//                     "id": 8,
//                     "profile_picture_url": "/uploads/image-1762003690260.png",
//                     "first_name": "Krins",
//                     "last_name": "Golakiya"
//                 }
//             ],
//             "attached_files": []
//         }
//     ],
//     "message": "Fetched all tasks with assigned employees and attachments"
// }
// project 2
// {
//     "success": true,
//     "data": [
//         {
//             "id": "c9775c44-a5fb-4801-8f53-b49adb6756f4",
//             "project_id": 2,
//             "assigned_to": null,
//             "title": "understand HRM Project",
//             "description": "<p>understand HRM Project's all functionality..</p>",
//             "priority": "High",
//             "status": "Review",
//             "start_date": null,
//             "due_date": "2025-11-20",
//             "estimated_hours": 0,
//             "created_at": "2025-11-21T07:20:25.374Z",
//             "updated_at": "2025-11-24T09:17:42.263Z",
//             "creator_id": 4,
//             "attachment_ids": [],
//             "project_name": "HRMs",
//             "assigned_employees": [
//                 {
//                     "id": 28,
//                     "profile_picture_url": "/uploads/profile_pictures/28/1763642894569-329501131.jpg",
//                     "first_name": "Krusha ",
//                     "last_name": "Golakiya"
//                 }
//             ],
//             "attached_files": []
//         },
//         {
//             "id": "374f501e-8c6a-4cf9-90d7-bf62f190999c",
//             "project_id": 2,
//             "assigned_to": null,
//             "title": "Employee can see project section.",
//             "description": "<p>employee can see projects which assigned.<br><br>also we should add search section while task assign. </p>",
//             "priority": "High",
//             "status": "Completed",
//             "start_date": null,
//             "due_date": null,
//             "estimated_hours": 0,
//             "created_at": "2025-11-21T07:59:55.703Z",
//             "updated_at": "2025-11-24T12:33:30.514Z",
//             "creator_id": 25,
//             "attachment_ids": [],
//             "project_name": "HRMs",
//             "assigned_employees": [
//                 {
//                     "id": 6,
//                     "profile_picture_url": "/uploads/image-1762001461119.png",
//                     "first_name": "Darshan ",
//                     "last_name": "Raghvani"
//                 }
//             ],
//             "attached_files": []
//         },
//         {
//             "id": "21f204ad-5f57-4ee4-b9fa-879ed1d14bc7",
//             "project_id": 2,
//             "assigned_to": null,
//             "title": "Profile picture upload issue.",
//             "description": "<p>when i am trying to upload my profile picture of 5.1 MB it shows success upload but not able to see profile pic.</p>",
//             "priority": "Medium",
//             "status": "Done",
//             "start_date": null,
//             "due_date": "2025-11-20",
//             "estimated_hours": 0,
//             "created_at": "2025-11-20T09:25:50.069Z",
//             "updated_at": "2025-11-25T11:03:50.620Z",
//             "creator_id": 25,
//             "attachment_ids": [],
//             "project_name": "HRMs",
//             "assigned_employees": [
//                 {
//                     "id": 5,
//                     "profile_picture_url": "/uploads/profile_pictures/5/1763641162172-785133894.jpg",
//                     "first_name": "Darshan",
//                     "last_name": "Dhameliya"
//                 }
//             ],
//             "attached_files": []
//         },
//         {
//             "id": "a6fa8ce5-29ce-4f02-904a-8196b3a460d6",
//             "project_id": 2,
//             "assigned_to": null,
//             "title": "Video Upload in announcement",
//             "description": "<p><span style=\"background-color: rgb(255, 255, 255); color: oklch(0.446 0.03 256.802);\">Video Upload in announcement</span></p>",
//             "priority": "High",
//             "status": "Done",
//             "start_date": null,
//             "due_date": "2025-11-21",
//             "estimated_hours": 0,
//             "created_at": "2025-11-20T06:34:41.642Z",
//             "updated_at": "2025-11-25T11:03:54.326Z",
//             "creator_id": 4,
//             "attachment_ids": [],
//             "project_name": "HRMs",
//             "assigned_employees": [
//                 {
//                     "id": 5,
//                     "profile_picture_url": "/uploads/profile_pictures/5/1763641162172-785133894.jpg",
//                     "first_name": "Darshan",
//                     "last_name": "Dhameliya"
//                 }
//             ],
//             "attached_files": []
//         },
//         {
//             "id": "df4cd89a-72d8-4db7-a691-9597f33d2c5f",
//             "project_id": 2,
//             "assigned_to": null,
//             "title": "Show loader in file upload",
//             "description": "<p>Show loader in file upload</p>",
//             "priority": "Low",
//             "status": "Done",
//             "start_date": null,
//             "due_date": null,
//             "estimated_hours": 0,
//             "created_at": "2025-11-21T07:46:45.760Z",
//             "updated_at": "2025-11-25T11:04:03.663Z",
//             "creator_id": 5,
//             "attachment_ids": [],
//             "project_name": "HRMs",
//             "assigned_employees": [
//                 {
//                     "id": 5,
//                     "profile_picture_url": "/uploads/profile_pictures/5/1763641162172-785133894.jpg",
//                     "first_name": "Darshan",
//                     "last_name": "Dhameliya"
//                 }
//             ],
//             "attached_files": []
//         }
//     ],
//     "message": "Fetched all tasks with assigned employees and attachments"
// }

// exports.logTime = async (req, res) => {
//   const { task_id, hours_spent, entry_date, notes } = req.body;
//   const employeeId = req.user.id;
//   console.log("employeeId.................", employeeId);
//   console.log("task_id.................", task_id);
//   console.log("hours_spent.................", hours_spent);
//   console.log("entry_date.................", entry_date);
//   console.log("notes.................", notes);

//   if (!task_id || !hours_spent || !entry_date) {
//     return res
//       .status(400)
//       .json({ message: "Task ID, hours, and date are required." });
//   }

//   try {
//     const [id] = await db("time_entries")
//       .insert({
//         task_id,
//         employee_id: employeeId,
//         hours_spent,
//         date: entry_date,
//         note: notes,
//       })
//       .returning("id");
//     console.log("[id]................", [id]);

//     const newTimeEntry = await db("time_entries")
//       .where({ id: id.id || id })
//       .first();
//     console.log("newTimeEntry...................", newTimeEntry);
//     res.status(201).json({
//       success: true,
//       // data: newTimeEntry,
//       message: "Time logged successfully.",
//     });
//   } catch (error) {
//     console.error("Error logging time:", error);
//     res
//       .status(500)
//       .json({ message: "Error logging time", error: error.message });
//   }
// };

exports.logTime = async (req, res) => {
  const { task_id, hours_spent, entry_date, notes } = req.body;
  const employeeId = req.user.id;

  console.log("employeeId.................", employeeId);
  console.log("task_id.................", task_id);
  console.log("hours_spent.................", hours_spent);
  console.log("entry_date.................", entry_date);
  console.log("notes.................", notes);

  if (!task_id || !hours_spent || !entry_date) {
    return res
      .status(400)
      .json({ message: "Task ID, hours, and date are required." });
  }

  try {
    const existing = await db("time_entries")
      .where({
        task_id,
        employee_id: employeeId,
        date: entry_date,
      })
      .first();

    let id;
    if (existing) {
      await db("time_entries")
        .where({ id: existing.id })
        .update({ hours_spent });

      id = existing.id;
    } else {
      const [inserted] = await db("time_entries")
        .insert({
          task_id,
          employee_id: employeeId,
          hours_spent,
          date: entry_date,
          note: notes,
        })
        .returning("id");

      id = inserted.id || inserted;
    }

    const newTimeEntry = await db("time_entries").where({ id }).first();
    console.log("newTimeEntry................", newTimeEntry);

    return res.status(201).json({
      success: true,
      data: newTimeEntry,
      message: "Time logged successfully.",
    });
  } catch (error) {
    console.error("Error logging time:", error);
    return res.status(500).json({
      message: "Error logging time",
      error: error.message,
    });
  }
};

// response :
// {
//     "success": true,
//     "data": {
//         "id": "9829f7a0-2269-4660-8700-186bb25cecb0",
//         "task_id": "c9775c44-a5fb-4801-8f53-b49adb6756f4",
//         "employee_id": 4,
//         "date": "2025-11-25",
//         "hours_spent": 5.8333,
//         "note": "part-1",
//         "created_at": "2025-12-08T07:47:46.519Z",
//         "updated_at": "2025-12-08T07:47:46.519Z"
//     },
//     "message": "Time logged successfully."
// }

exports.getTimeEntriesForTask = async (req, res) => {
  const { taskId } = req.params;
  try {
    const timeEntries = await db("time_entries")
      .join("employees", "time_entries.employee_id", "employees.id")
      .where({ task_id: taskId })
      .select("time_entries.*", "employees.first_name", "employees.last_name");
    res.status(200).json(timeEntries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching time entries", error });
  }
};

// response :
// [
//     {
//         "id": "352dd06c-9cc4-4f16-99e3-9a8738832d63",
//         "task_id": "c9775c44-a5fb-4801-8f53-b49adb6756f4",
//         "employee_id": 4,
//         "date": "2025-11-25",
//         "hours_spent": 2.15,
//         "note": "part-1",
//         "created_at": "2025-12-08T07:42:18.425Z",
//         "updated_at": "2025-12-08T07:42:18.425Z",
//         "first_name": "Nensi ",
//         "last_name": "Gabani"
//     },
//     {
//         "id": "9829f7a0-2269-4660-8700-186bb25cecb0",
//         "task_id": "c9775c44-a5fb-4801-8f53-b49adb6756f4",
//         "employee_id": 4,
//         "date": "2025-11-25",
//         "hours_spent": 5.8333,
//         "note": "part-1",
//         "created_at": "2025-12-08T07:47:46.519Z",
//         "updated_at": "2025-12-08T07:47:46.519Z",
//         "first_name": "Nensi ",
//         "last_name": "Gabani"
//     }
// ]
