const bcrypt = require('bcryptjs');

// --- 1. Define All Permissions ---
// (Your full list of permissions is correct)
const allPermissions = [
  // Employees
  { action: 'employees:create', description: 'Can create new employees' },
  { action: 'employees:read', description: 'Can view list of all employees' },
  {
    action: 'employees:read:details',
    description: 'Can view full details of an employee',
  },
  {
    action: 'employees:update',
    description: "Can edit an employee's personal & job info",
  },
  {
    action: 'employees:update:salary',
    description: "Can edit an employee's salary",
  },
  // {
  //   action: "employees:read:salary",
  //   description: "Can view an employee's salary",
  // }, // UNUSED
  {
    action: 'employees:terminate',
    description: 'Can terminate an employee (soft delete)',
  },
  {
    action: 'employees:delete:permanent',
    description: 'Can permanently delete an employee',
  },
  {
    action: 'employees:upload:document',
    description: 'Can upload documents for an employee',
  },

  // Self (Employee-only actions)
  { action: 'self:read:profile', description: 'Can view their own profile' },
  { action: 'playroll:read:self', description: 'Can view their own payslips' },
  { action: 'leave:apply', description: 'Can apply for leave' },
  {
    action: 'leave:read:self',
    description: 'Can view their own leave history',
  },
  {
    action: 'attendance:read:self',
    description: 'Can view their own attendance',
  },
  {
    action: 'attendance:request:correction',
    description: 'Can request an attendance correction',
  },
  { action: 'polls:vote', description: 'Can vote on a poll' },

  // Team (Manager-only actions)
  { action: 'team:read', description: "Can view their team's profiles" },
  {
    action: 'leave:approve',
    description: 'Can approve/reject leave requests from their team',
  },
  {
    action: 'attendance:approve:correction',
    description: 'Can approve/reject attendance corrections from their team',
  },
  {
    action: 'performance:create',
    description: 'Can submit performance reviews for their team',
  },

  // Admin / Settings (Main Admin actions)
  { action: 'payroll:run', description: 'Can run and process payroll' },
  { action: 'reports:read', description: 'Can view the main reports page' },
  {
    action: 'attendance:sync',
    description: 'Can manually trigger attendance sync',
  },
  {
    action: 'roles:manage',
    description: 'Can create, edit, and delete roles and permissions',
  },
  {
    action: 'settings:manage',
    description:
      'Can manage Departments, Designations, Shifts, Leave Types, etc.',
  },
  {
    action: 'announcements:manage',
    description: 'Can create and delete announcements',
  },
  { action: 'polls:manage', description: 'Can create and delete polls' },
  { action: 'assets:manage', description: 'Can manage all company assets' },

  // Admin/HR (Viewing ALL data)
  // {
  //   action: "leave:read:all",
  //   description: "Can view all leave requests from all employees",
  // }, // UNUSED
  {
    action: 'leave:manage',
    description: "Can edit or delete any employee's leave request",
  },
  {
    action: 'attendance:read:all',
    description: 'Can view all attendance records for all employees',
  },
  // {
  //   action: "attendance:manage",
  //   description: "Can manually add/edit/delete attendance records",
  // }, // UNUSED

  // New Modules (Projects)
  {
    action: 'projects:manage',
    description: 'Can create, read, update, and delete projects',
  },

  // New Modules (Recruitment)
  {
    action: 'recruitment:manage',
    description: 'Can create openings and manage all applicants/applications',
  },
  {
    action: 'recruitment:apply',
    description: 'Can view openings and apply for a job',
  },

  // New Modules (Rewards)
  {
    action: 'rewards:manage',
    description: 'Can create and give rewards to employees',
  },

  // New Modules (Tasks & Time Logging)
  {
    action: 'tasks:manage',
    description: 'Can create, update, and delete tasks',
  },
  {
    action: 'tasks:read',
    description: 'Can view tasks for projects they are assigned to',
  },
  {
    action: 'tasks:log:time',
    description: 'Can log time against assigned tasks',
  },
  {
    action: 'tasks:manage:team',
    description: 'Can manage tasks for their team',
  },
  {
    action: 'tasks:self',
    description: 'Can manage their own tasks',
  },

  // New Modules (Training)
  {
    action: 'training:manage',
    description: 'Can create/manage courses and record employee training',
  },

  // General Admin
  {
    action: 'admin',
    description: 'General admin access',
  },
];

exports.seed = async function (knex) {
  return knex.transaction(async (trx) => {
    console.log('Clearing old data...');
    // await trx('activity_logs').del();
    // await trx('refresh_tokens').del();
    await trx('leave_approval_logs').del();
    await trx('payroll_arrears').del();
    await trx('payroll_overrides').del();
    await trx('adhoc_deductions').del();
    await trx('adhoc_payments').del();
    await trx('reimbursement_claims').del();
    await trx('reactions').del();
    await trx('shift_breaks').del();
    await trx('employee_incident_logs').del();
    await trx('comp_off_requests').del();
    await trx('approval_workflow_steps').del();
    await trx('approval_workflows').del();
    await trx('leave_plan_rules').del();
    await trx('leave_notice_policies').del();
    await trx('task_comments').del();
    await trx('task_assignees').del();
    await trx('project_employees').del();
    await trx('time_entries').del();
    await trx('tasks').del();
    await trx('projects').del();
    await trx('job_logs').del();
    await trx('employee_documents').del();
    await trx('payroll_details').del();
    await trx('attendance_requests').del();
    await trx('attendance_logs').del();
    await trx('attendance').del();
    await trx('performance_reviews').del();
    await trx('rewards').del();
    await trx('employee_training').del();
    await trx('employee_benefits').del();
    await trx('employee_job_history').del();
    await trx('employee_salary_history').del();
    await trx('payrolls').del();
    await trx('poll_votes').del();
    await trx('polls').del();
    await trx('announcements').del();
    await trx('leave_applications').del();
    await trx('employee_leave_balances').del();
    await trx('role_permissions').del();

    // Now we can safely delete the 'parent' tables
    await trx('employees').del();
    await trx('permissions').del();
    await trx('roles').del();
    await trx('leave_plans').del(); // Added leave_plans
    await trx('shifts').del();
    await trx('holidays').del();
    await trx('benefits').del();
    await trx('leave_types').del();
    await trx('salary_components').del();
    await trx('designations').del();
    await trx('departments').del();

    console.log('Seeding permissions...');
    const insertedPermissions = await trx('permissions')
      .insert(allPermissions)
      .returning('*');

    console.log('Seeding roles...');
    const [adminRole, managerRole, employeeRole] = await trx('roles')
      .insert([
        { name: 'Admin', description: 'Full system access' },
        { name: 'Manager', description: 'Access to manage their team' },
        {
          name: 'Employee',
          description: 'Access to their own personal information',
        },
      ])
      .returning('*');

    console.log('Linking permissions to roles...');

    // Admin Role: Gets ALL permissions
    const adminPermissions = insertedPermissions.map((p) => ({
      role_id: adminRole.id,
      permission_id: p.id,
    }));
    await trx('role_permissions').insert(adminPermissions);

    // Employee Role: Gets basic self-service permissions
    const employeeActions = [
      'self:read:profile',
      'playroll:read:self',
      'leave:apply',
      'leave:read:self',
      'attendance:read:self',
      'attendance:request:correction',
      'polls:vote',
      'recruitment:apply',
      'tasks:read',
      'tasks:log:time',
    ];

    const employeePermissions = insertedPermissions
      .filter((p) => employeeActions.includes(p.action))
      .map((p) => ({ role_id: employeeRole.id, permission_id: p.id }));
    await trx('role_permissions').insert(employeePermissions);

    // Manager Role: Gets all Employee permissions + team management
    const managerActions = [
      ...employeeActions,
      'team:read',
      'leave:approve',
      'attendance:approve:correction',
      'performance:create',
      'rewards:manage',
      'tasks:manage',
      'projects:manage',
    ];

    const managerPermissions = insertedPermissions
      .filter((p) => managerActions.includes(p.action))
      .map((p) => ({ role_id: managerRole.id, permission_id: p.id }));
    await trx('role_permissions').insert(managerPermissions);

    console.log('Seeding lookup tables...');

    const [department] = await trx('departments')
      .insert({
        name: 'Administration',
        description: 'General and Administrative',
      })
      .returning('*');
    const [designation] = await trx('designations')
      .insert({ title: 'Administrator', description: 'System Administrator' })
      .returning('*');

    await trx('shifts').insert({
      shift_name: 'General Shift',
      start_time: '09:30:00',
      end_time: '19:00:00',
    });

    const salaryComponents = [
      // Earnings
      { name: 'Basic', type: 'Earning' },
      { name: 'House Rent Allowance (HRA)', type: 'Earning' },
      { name: 'Transport Allowance', type: 'Earning' },
      { name: 'Special Allowance', type: 'Earning' },

      // Deductions
      { name: 'Provident Fund (PF)', type: 'Deduction' },
      { name: 'Professional Tax (PT)', type: 'Deduction' },
      { name: 'Income Tax (TDS)', type: 'Deduction' },
    ];
    await trx('salary_components').insert(salaryComponents);

    const benefitsData = [
      { name: 'Group Health Insurance', provider: 'Company Policy' },
      { name: 'Term Life Insurance', provider: 'Company Policy' },
      { name: 'Provident Fund Scheme', provider: 'Government' },
    ];
    await trx('benefits').insert(benefitsData);

    const holidaysData = [
      { name: 'Diwali', holiday_date: '2025-10-21' },
      { name: 'Christmas Day', holiday_date: '2025-12-25' },
      { name: 'Republic Day', holiday_date: '2026-01-26' },
      { name: 'Holi', holiday_date: '2026-03-06' },
      { name: 'Good Friday', holiday_date: '2026-04-03' },
      { name: 'Independence Day', holiday_date: '2026-08-15' },
      { name: 'Gandhi Jayanti', holiday_date: '2026-10-02' },
    ];
    await trx('holidays').insert(holidaysData);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    const [adminUser] = await trx('employees')
      .insert({
        employee_id: 'ADMIN001',
        first_name: 'Admin',
        last_name: 'User',
        work_email: 'admin@hrm.com',
        password: hashedPassword,
        // hire_date: new Date().toLocaleDateString('en-CA'),
        hire_date: new Date().toISOString().slice(0, 10),
        role_id: adminRole.id,
        employee_status: 'Active',
        department_id: department.id,
        designation_id: designation.id,
      })
      .returning('*');

    console.log('Seeding complete! ✨');
  });
};
