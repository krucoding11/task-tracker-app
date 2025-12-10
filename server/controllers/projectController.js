const db = require("../config/db.js");

exports.getAllProjects = async (req, res) => {
  try {
    console.log("getAllProjects api...................");

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

// response :
// {
//     "success": true,
//     "data": [
//         {
//             "id": 2,
//             "name": "HRMs",
//             "description": "<p>Video Upload in announcement</p>",
//             "start_date": "2025-11-20",
//             "end_date": "2025-11-21",
//             "status": "planned",
//             "employees_id": 4,
//             "created_at": "2025-11-20T06:18:35.807Z",
//             "updated_at": "2025-11-20T06:18:35.807Z",
//             "attachment_ids": [],
//             "assigned_employees": [
//                 {
//                     "id": 5,
//                     "profile_picture_url": "/uploads/profile_pictures/5/1763641162172-785133894.jpg",
//                     "full_name": "Darshan Dhameliya"
//                 },
//                 {
//                     "id": 28,
//                     "profile_picture_url": "/uploads/profile_pictures/28/1763642894569-329501131.jpg",
//                     "full_name": "Krusha  Golakiya"
//                 },
//                 {
//                     "id": 6,
//                     "profile_picture_url": "/uploads/image-1762001461119.png",
//                     "full_name": "Darshan  Raghvani"
//                 }
//             ],
//             "attached_files": []
//         },
//         {
//             "id": 3,
//             "name": "YSN",
//             "description": "<p>YSN</p>",
//             "start_date": "2025-11-21",
//             "end_date": "2025-11-20",
//             "status": "planned",
//             "employees_id": 25,
//             "created_at": "2025-11-21T07:55:58.993Z",
//             "updated_at": "2025-11-21T07:55:58.993Z",
//             "attachment_ids": [],
//             "assigned_employees": [
//                 {
//                     "id": 8,
//                     "profile_picture_url": "/uploads/image-1762003690260.png",
//                     "full_name": "Krins Golakiya"
//                 }
//             ],
//             "attached_files": []
//         }
//     ],
//     "message": "Fetched all projects with employees and task info"
// }
