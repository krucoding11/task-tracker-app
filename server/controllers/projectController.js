const db = require("../config/db.js");

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await db("projects").select("*");

    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const tasks = await db("tasks").where({ project_id: project.id });

        const assignedEmployeesRaw = await db("employees")
          .join("task_assignees", "employees.id", "task_assignees.employee_id")
          .join("tasks", "tasks.id", "task_assignees.task_id")
          .where("tasks.project_id", project.id)
          .select(
            "employees.id",
            "employees.profile_picture_url",
            db.raw(
              "CONCAT(employees.first_name, ' ', employees.last_name) AS full_name",
            ),
          );

        const uniqueEmployeesMap = new Map();
        assignedEmployeesRaw.forEach((emp) => {
          if (!uniqueEmployeesMap.has(emp.id)) {
            uniqueEmployeesMap.set(emp.id, emp);
          }
        });
        const assignedEmployees = Array.from(uniqueEmployeesMap.values());

        const latestDueDate = tasks
          .map((t) => t.due_date)
          .filter(Boolean)
          .sort((a, b) => new Date(b) - new Date(a))[0];

        let attachedFiles = [];
        if (project.attachment_ids && project.attachment_ids.length > 0) {
          attachedFiles = await db("attachments")
            .whereIn("id", project.attachment_ids)
            .select("id", "filename", "filesize", "storage_path");
        }

        return {
          ...project,
          start_date: project.start_date,
          end_date: latestDueDate || project.end_date,
          assigned_employees: assignedEmployees,
          attached_files: attachedFiles,
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: projectsWithDetails,
      message: "Fetched all projects with employees and task info",
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Error fetching projects", error });
  }
};
