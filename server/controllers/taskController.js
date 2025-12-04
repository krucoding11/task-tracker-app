const db = require("../config/db");
const moment = require("moment");
const { format } = require("date-fns");
// const {
//   insertAttachmentsAndGetIds,
//   deleteAttachmentsAndRecords,
// } = require("../helpers/fileAttachment");
// const {
//   saveNewCommentFiles,
//   deleteCommentFiles,
// } = require("../middleware/attachmentUpload");

exports.getTasksByEmployeeId = async (req, res) => {
  const employeeId = req.user.id;

  try {
    const result = await db.raw(
      `
      WITH user_tasks AS (
        -- Step 1: Find the DISTINCT task IDs (Primary Key) 
        -- where the employee is either assigned OR the creator.
        SELECT DISTINCT t.id AS task_id
        FROM tasks AS t
        LEFT JOIN task_assignees AS et ON et.task_id = t.id
        WHERE et.employee_id = ? OR t.creator_id = ?
      )
      
      -- Step 2: Select all task details for those unique IDs.
      -- This allows the JSON aggregation to work without conflict.
      SELECT
        t.id, t.title, t.description, t.due_date, t.status, t.priority,
        t.project_id, p.name AS project_name,
        (
          SELECT json_agg(json_build_object('first_name', e.first_name, 'last_name', e.last_name,'id',e.id))
          FROM task_assignees et_agg
          JOIN employees e ON e.id = et_agg.employee_id
          WHERE et_agg.task_id = t.id
        ) AS assigned_employees
      FROM tasks AS t
      JOIN user_tasks ut ON ut.task_id = t.id
      LEFT JOIN projects AS p ON p.id = t.project_id
      ORDER BY t.due_date ASC
      `,
      [employeeId, employeeId],
    );

    const rawRows = result.rows || result;

    const formattedTasks = rawRows.map((task) => ({
      ...task,
      due_date: task.due_date
        ? moment(task.due_date).format("YYYY-MM-DD")
        : null,
      assigned_employees: task.assigned_employees || [],
    }));

    return res.status(200).json({
      success: true,
      data: formattedTasks,
      message: "Fetched tasks assigned to or created by the employee.",
    });
  } catch (error) {
    console.error("Error fetching tasks by employee ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve employee tasks.",
      error: error.message,
    });
  }
};
