import React, { createContext, useEffect, useState, useContext } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authToken, setAuthToken] = useState(localStorage.getItem("authToken") || null);

    useEffect(() => {
        if(authToken){
            axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
            localStorage.setItem('authToken', authToken);
            getMe();
        }else{
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('authToken');
            setUser(null);
            setLoading(false);
        }
    },[authToken]);

    const getMe = async ()=>{
        try {
            const response = await axios.get(`${API_URL}/api/auth/me`);
            setUser(response.data.data);
        } catch (error) {
            console.error("logging out", error);
            setAuthToken(null);
        } finally{
            setLoading(false);
        }
    };

    const login = async (work_email, password) => {
  try {
    setLoading(true);

    const response = await axios.post(
      `${API_URL}/api/auth/login`,
      { work_email, password }
    );

    const { token, user: userData } = response.data;

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setAuthToken(token);
    setUser(userData);
    localStorage.setItem("authToken", token);

    setLoading(false);
    return { success: true };
  } catch (error) {
    setLoading(false);
    const errorMessage =
      error.response?.data?.error || "Login failed due to server error";
    return { success: false, error: errorMessage };
  }
};


    // const getEmployeeById = async (id) => {
    //     try {
    //         const response = await axios.get(`${API_URL}/api/auth/${id}`);
    //         return { success: true, data: response.data.data};
    //     } catch (error) {
    //         const errorMessage = error.response?.data?.error || 'Failed to fetch Employee details';
    //         return { success: false, error: errorMessage};
    //     }
    // }

    const logout = async () => {
        setAuthToken(null);
        localStorage.removeItem("authToken");
        setUser(null);
    };

    const value = {
        user,
        authToken,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
};

// --- Custom Hook to use the Auth Context ---
export const useAuth = () => {
  return useContext(AuthContext);
};

//  <Select
//           options={taskOption}
//           value={task}
//           onChange={(selected) => setTask(selected)}
//           placeholder={project ? "Select task" : "Select project first"}
//           isSearchable
//           menuPosition="absolute"
//           // menuPortalTarget={document.body}
//           styles={customStyles}
//           classNamePrefix="react-select"
//           menuPlacement="bottom"
//           isDisabled={isRunning || !project}
//           blurInputOnSelect={false}
//           controlShouldRenderValue
//         />


// exports.getTasksByEmployeeId = async (req, res) => {
//   const employeeId = req.user.id;
//   const user = req.user;
//   const isAdmin = user.permissions.includes("tasks:manage");

//   const { status, page = 1, limit = 10 } = req.query;

//   const currentPage = parseInt(page, 10);
//   const limitNumber = parseInt(limit, 10);
//   const offset = (currentPage - 1) * limitNumber;

//   if (isNaN(currentPage) || currentPage < 1) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid page number.",
//     });
//   }

//   try {
//     const whereParts = [];
//     const bindings = [];

//     if (status && status !== "all") {
//       whereParts.push("t.status = ?");
//       bindings.push(status);
//     }

//     if (req.query.assigned_to) {
//       whereParts.push(`
//         t.id IN (
//           SELECT DISTINCT task_id FROM task_assignees WHERE employee_id = ?
//         )
//       `);
//       bindings.push(req.query.assigned_to);
//     }

//     if (req.query.search) {
//       whereParts.push("t.title ILIKE ?");
//       bindings.push(`%${req.query.search}%`);
//     }

//     if (!isAdmin) {
//       const authorizedCreatorIds = await getAuthorizedProjectCreatorIds(user);

//       if (
//         user.permissions.includes("tasks:manage:team") &&
//         authorizedCreatorIds?.length > 0
//       ) {
//         whereParts.push(`
//           (
//             t.creator_id IN (${authorizedCreatorIds.join(",")})
//             OR t.id IN (
//               SELECT DISTINCT task_id FROM task_assignees WHERE employee_id IN (${authorizedCreatorIds.join(",")})
//             )
//           )
//         `);
//       } else {
//         whereParts.push(`
//           (
//             t.creator_id = ?
//             OR t.id IN (SELECT DISTINCT task_id FROM task_assignees WHERE employee_id = ?)
//           )
//         `);
//         bindings.push(employeeId, employeeId);
//       }
//     }

//     const whereClause =
//       whereParts.length > 0 ? `WHERE ${whereParts.join(" AND ")}` : "";

//     const countQuery = `
//       SELECT COUNT(DISTINCT t.id) AS total_count
//       FROM tasks t
//       LEFT JOIN projects p ON p.id = t.project_id
//       ${whereClause}
//     `;

//     const countResult = await db.raw(countQuery, bindings);
//     const totalTasks = parseInt(countResult.rows[0].total_count, 10);
//     const totalPages = Math.ceil(totalTasks / limitNumber);

//     const dataQuery = `
//      SELECT
//        t.id, t.title, t.description, t.due_date, t.status, t.priority,
//        t.creator_id, t.project_id, p.name AS project_name,
//        (
//         SELECT COALESCE(ROUND(SUM(te.hours_spent * 3600)), 0)
//         FROM time_entries te
//         WHERE te.task_id = t.id
//       ) AS savedTime,
//        (
//          SELECT json_agg(json_build_object('first_name', e.first_name, 'last_name', e.last_name, 'profile_picture_url', e.profile_picture_url, 'id', e.id))
//          FROM task_assignees ta
//          JOIN employees e ON e.id = ta.employee_id
//          WHERE ta.task_id = t.id
//        ) AS assigned_employees
//      FROM tasks t
//      LEFT JOIN projects p ON p.id = t.project_id
//      ${whereClause}
//      ORDER BY t.due_date ASC
//      LIMIT ?
//      OFFSET ?
//    `;

    // const dataQuery = `
    //   SELECT
    //     t.id, t.title, t.description, t.due_date, t.status, t.priority,
    //     t.creator_id, t.project_id, p.name AS project_name,
    //     (
    //       SELECT json_agg(json_build_object('first_name', e.first_name, 'last_name', e.last_name, 'profile_picture_url', e.profile_picture_url, 'id', e.id))
    //       FROM task_assignees ta
    //       JOIN employees e ON e.id = ta.employee_id
    //       WHERE ta.task_id = t.id
    //     ) AS assigned_employees
    //   FROM tasks t
    //   LEFT JOIN projects p ON p.id = t.project_id
    //   ${whereClause}
    //   ORDER BY t.due_date ASC
    //   LIMIT ?
    //   OFFSET ?
    // `;

//     const finalBindings = [...bindings, limitNumber, offset];
//     const result = await db.raw(dataQuery, finalBindings);

//     const formattedTasks = result.rows.map((task) => ({
//       ...task,
//       assigned_employees: task.assigned_employees || [],
//       due_date: task.due_date
//         ? format(new Date(task.due_date), "yyyy-MM-dd")
//         : null,
//     }));

//     return res.status(200).json({
//       success: true,
//       data: formattedTasks,
//       meta: {
//         total_tasks: totalTasks,
//         total_pages: totalPages,
//         current_page: currentPage,
//         per_page: limitNumber,
//         has_more: currentPage < totalPages,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching tasks:", error);
//     const { message, statusCode } = parseDbError(error);
//     return res.status(statusCode).json({ error: message });
//   }
// };
// exports.logTime = async (req, res) => {
//   console.log("logTime api...................");

//   const { task_id, hours_spent, entry_date, notes } = req.body;
//   const employeeId = req.user.id;

//   console.log("employeeId: ", employeeId);
//   console.log("task_id: ", task_id);
//   console.log("hours_spent: ", hours_spent);
//   console.log("entry_date: ", entry_date);
//   console.log("notes: ", notes);

//   if (!task_id || !hours_spent || !entry_date) {
//     return res
//       .status(400)
//       .json({ message: "Task ID, hours, and date are required." });
//   }

//   try {
//     const roundedHours = Math.round(hours_spent * 3600) / 3600;
//     const existing = await db("time_entries")
//       .where({
//         task_id,
//         employee_id: employeeId,
//       })
//       .first();

//     let id;
//     if (existing) {
//       await db("time_entries")
//         .where({ id: existing.id })
//         .update({ hours_spent: roundedHours });

//       id = existing.id;
//     } else {
//       const [inserted] = await db("time_entries")
//         .insert({
//           task_id,
//           employee_id: employeeId,
//           hours_spent: roundedHours,
//           date: entry_date,
//           note: notes,
//         })
//         .returning("id");

//       id = inserted.id || inserted;
//     }

//     const newTimeEntry = await db("time_entries").where({ id }).first();
//     console.log("newTimeEntry................", newTimeEntry);

//     return res.status(201).json({
//       success: true,
//       data: newTimeEntry,
//       message: "Time logged successfully.",
//     });
//   } catch (error) {
//     console.error("Error logging time:", error);
//     return res.status(500).json({
//       message: "Error logging time",
//       error: error.message,
//     });
//   }
// };
// exports.getTimeEntriesForTask = async (req, res) => {
//   const { taskId } = req.params;

//   if (!(await isUserAuthorizedForTask(taskId, req.user))) {
//     return res.status(403).json({
//       message:
//         "Access denied: You are not authorized to view time entries for this task.",
//     });
//   }

//   try {
//     const timeEntries = await db("time_entries")
//       .join("employees", "time_entries.employee_id", "employees.id")
//       .where({ task_id: taskId })
//       .select("time_entries.*", "employees.first_name", "employees.last_name");
//     res.status(200).json({
//       success: true,
//       data: timeEntries,
//       message: "Fetched time entries for task successfully.",
//     });
//   } catch (error) {
//     const { message, statusCode } = parseDbError(error);
//     res.status(statusCode).json({ error: message });
//   }
// };
// exports.getTasksByProject = async (req, res) => {
//   const { projectId } = req.params;
//   const { status, page = 1, limit = 10 } = req.query;
//   const employeeId = req.user.id;

//   const currentPage = parseInt(page, 10);
//   const limitNumber = parseInt(limit, 10);
//   const offset = (currentPage - 1) * limitNumber;

//   if (isNaN(currentPage) || currentPage < 1) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid page number.",
//     });
//   }

//   const isAdmin = req.user.permissions.includes("tasks:manage");

//   if (!isAdmin) {
//     const authorizedCreatorIds = await getAuthorizedProjectCreatorIds(req.user);

//     const project = await db("projects")
//       .where({ id: projectId })
//       .select("employees_id")
//       .first();

//     const canManageProject =
//       project && authorizedCreatorIds?.includes(project.employees_id);

//     if (!canManageProject) {
//       const isAssigned = await db("tasks")
//         .join("task_assignees", "tasks.id", "task_assignees.task_id")
//         .where({
//           "tasks.project_id": projectId,
//           "task_assignees.employee_id": employeeId,
//         })
//         .first();

//       if (!isAssigned) {
//         return res.status(403).json({
//           success: false,
//           message:
//             "Access denied: You do not manage this project and are not assigned to any tasks.",
//         });
//       }
//     }
//   }

//   try {
//     let baseQuery = db("tasks").where("project_id", projectId);

//     if (status && status !== "all") {
//       baseQuery = baseQuery.where("status", status);
//     }

//     if (req.query.assigned_to) {
//       baseQuery = baseQuery.whereIn("id", function () {
//         this.select("task_id")
//           .from("task_assignees")
//           .where("employee_id", req.query.assigned_to);
//       });
//     }

//     if (req.query.search) {
//       baseQuery = baseQuery.where("title", "ilike", `%${req.query.search}%`);
//     }

//     const countResult = await baseQuery.clone().count("id as count").first();
//     const totalTasks = parseInt(countResult.count, 10);
//     const totalPages = Math.ceil(totalTasks / limitNumber);

//     const tasks = await baseQuery
//       .clone()
//       .orderBy("created_at", "desc")
//       .limit(limitNumber)
//       .offset(offset)
//       .select("*");

//     const tasksWithDetails = await Promise.all(
//       tasks.map(async (task) => {
//         const assignedEmployees = await db("employees")
//           .join("task_assignees", "employees.id", "task_assignees.employee_id")
//           .where("task_assignees.task_id", task.id)
//           .select(
//             "employees.id",
//             "employees.profile_picture_url",
//             "employees.first_name",
//             "employees.last_name"
//           );

//         // const project = await db("projects")
//         //   .where({ id: task.project_id })
//         //   .select("name")
//         //   .first();

//         let project_name = null;
//         if (task.project_id) {
//           const project = await db("projects")
//             .where({ id: task.project_id })
//             .select("name")
//             .first();
//           project_name = project ? project.name : null;
//         }

//         const timeSum = await db("time_entries")
//           .where({ task_id: task.id })
//           .sum("hours_spent as total");

//         const savedTime = Math.round((timeSum[0].total || 0) * 3600);

//         let attachedFiles = [];
//         if (task.attachment_ids?.length > 0) {
//           attachedFiles = await db("attachments")
//             .whereIn("id", task.attachment_ids)
//             .select("id", "filename", "storage_path", "filesize", "mimetype");
//         }

//         return {
//           ...task,
//           project_name: project ? project.name : null,
//           assigned_employees: assignedEmployees,
//           attached_files: attachedFiles,
//         };
//       })
//     );

//     return res.status(200).json({
//       success: true,
//       data: tasksWithDetails,
//       meta: {
//         total_tasks: totalTasks,
//         total_pages: totalPages,
//         current_page: currentPage,
//         per_page: limitNumber,
//         has_more: currentPage < totalPages,
//         status_filter: status || "all",
//       },
//       message: `Fetched tasks for project ${projectId} (Status: ${
//         status || "All"
//       }, Page: ${currentPage}).`,
//     });
//   } catch (error) {
//     console.error("Error fetching tasks:", error);
//     const { message, statusCode } = parseDbError(error);
//     return res.status(statusCode).json({ error: message });
//   }
// };