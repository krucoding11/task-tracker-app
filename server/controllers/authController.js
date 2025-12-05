const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db.js");

const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret-key";
console.log("JWT_SECRET...........", JWT_SECRET);
exports.login = async (req, res) => {
  const { work_email, password } = req.body;
  try {
    console.log("work_email.............", work_email);
    console.log("password.............", password);
    const employee = await db("employees").where({ work_email }).first();
    console.log("employee................", employee);
    if (!employee) {
      return res.status(401).json({ error: "Invalid Email-address" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid Password" });
    }

    const role = await db("roles").where({ id: employee.role_id }).first();

    const permissions = await db("role_permissions as rp")
      .join("permissions as p", "rp.permission_id", "p.id")
      .where({ role_id: employee.role_id })
      .pluck("p.action");

    const payload = {
      leave_plan_id: employee.leave_plan_id,

      id: employee.id,
      name: `${employee.first_name} ${employee.last_name}`,
      role_id: employee.role_id,
      role: role.name,
      permissions: permissions,
      work_setting: employee.work_setting,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
    const user = await getUserInfo(payload.id);

    res.json({ token, user });
  } catch (error) {
    console.log("error...............", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

const getUserInfo = (id) => {
  return db("employees as e")
    .leftJoin("departments as d", "e.department_id", "d.id")
    .leftJoin("designations as des", "e.designation_id", "des.id")
    .leftJoin("roles as r", "e.role_id", "r.id")
    .where("e.id", id)
    .select(
      "e.id",
      "e.employee_id",
      "e.id",
      "e.first_name",
      "e.last_name",
      "e.work_email",
      "e.personal_email",
      "e.profile_picture_url",
      "e.phone_number",
      "e.dob",
      "e.gender",
      "e.address",
      "e.hire_date",
      "e.work_setting",
      "d.name as department_name",
      "des.title as designation_title",
      "r.name as role",
    )
    .first();
};

exports.getMe = async (req, res) => {
  try {
    const user = await getUserInfo(req.user.id);
    user.permissions = req.user?.permissions;
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};
