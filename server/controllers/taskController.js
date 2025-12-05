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
