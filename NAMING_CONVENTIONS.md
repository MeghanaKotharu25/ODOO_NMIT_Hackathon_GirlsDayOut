## Common Naming Conventions

### General Rules

* Use **English only** for all code, variables, database fields, routes, and commits.
* Use descriptive names. Avoid vague names like `data`, `info`, `temp`, or `result` when a specific name is possible.
* Do not create duplicate names for the same concept.
* Follow the naming conventions below consistently across the entire project.

---

### 1. Database Naming

Use **`snake_case`** for all:

* Table names
* Column names
* Foreign keys
* Database functions

Examples:

```text
profiles
employee_private_info
leave_requests
employee_id
full_name
created_at
check_in
```

Do not use:

```text
employeeProfile
EmployeeProfile
employee-profile
employeeId
```

---

### 2. React / JavaScript Naming

Use **`camelCase`** for:

* Variables
* Functions
* Props
* Hook variables

Examples:

```javascript
currentUser
employeeProfile
leaveRequests
checkInTime
calculateSalary()
handleCheckIn()
```

Use **`PascalCase`** for:

* React components
* Pages
* Contexts

Examples:

```javascript
EmployeeCard
AttendanceTable
LeaveRequestForm
AuthContext
MyProfile
```

Component files must match the component name:

```text
EmployeeCard.jsx
AttendanceTable.jsx
AuthContext.jsx
```

---

### 3. Database vs Frontend Data

Database fields remain in **snake_case**:

```javascript
profile.full_name
attendance.check_in
leaveRequest.start_date
```

For this hackathon, **do not create unnecessary camelCase conversion layers**. Supabase responses should generally be used with their original database field names.

---

### 4. Roles

Use exactly:

```text
admin
employee
```

Do not use:

```text
Admin
ADMIN
hr
HR
officer
manager
```

`admin` represents the Admin / HR Officer role.

---

### 5. Employee Naming

| Concept               | Standard Name         |
| --------------------- | --------------------- |
| Employee UUID         | `employee_id`         |
| Employee display/code | `employee_code`       |
| Full name             | `full_name`           |
| Email                 | `email`               |
| Department            | `department`          |
| Job title             | `designation`         |
| Manager               | `manager_id`          |
| Joining date          | `join_date`           |
| Profile picture       | `profile_picture_url` |
| Account state         | `account_status`      |

**Important:** All employee-related foreign keys should reference the Supabase UUID:

```text
profiles.id
```

Do not use `employee_code` as a foreign key.

---

### 6. Authentication Naming

| Concept                | Standard Name     |
| ---------------------- | ----------------- |
| Logged-in user         | `user`            |
| User UUID              | `user_id`         |
| Authentication session | `session`         |
| Authentication role    | `role`            |
| Password               | `password`        |
| Password confirmation  | `confirmPassword` |

Use:

```javascript
user.id
profile.role
```

---

### 7. Attendance Naming

Use exactly:

```text
attendance
attendance_date
check_in
check_out
work_hours
extra_hours
status
```

Attendance statuses:

```text
present
absent
half_day
leave
```

Do not use mixed values such as:

```text
Present
HALF_DAY
halfday
on_leave
```

---

### 8. Leave Management Naming

Use exactly:

```text
leave_requests
leave_balances
leave_type
start_date
end_date
total_days
remarks
attachment_url
status
reviewed_by
review_comment
reviewed_at
```

Leave types:

```text
paid
sick
unpaid
```

Leave request statuses:

```text
pending
approved
rejected
```

---

### 9. Payroll Naming

Use exactly:

```text
payroll
salary_components
monthly_wage
working_days_month
working_hours_day
component_name
component_type
calculation_type
calculation_base
```

Salary component types:

```text
earning
deduction
employer_contribution
```

Calculation types:

```text
fixed
percentage
```

Calculation bases:

```text
monthly_wage
basic_salary
```

---

### 10. Common Database Fields

Use these standard names everywhere:

```text
id
created_at
updated_at
```

For references:

```text
employee_id
manager_id
reviewed_by
payroll_id
```

Use `*_id` for foreign keys.

---

### 11. Files and Folders

#### Components

Use `PascalCase`:

```text
EmployeeCard.jsx
CheckInButton.jsx
LeaveBalance.jsx
SalaryComponent.jsx
```

#### Pages

Use `PascalCase`:

```text
Login.jsx
Employees.jsx
Attendance.jsx
TimeOff.jsx
MyProfile.jsx
CreateEmployee.jsx
```

#### Services, hooks, and utilities

Use `camelCase`:

```text
authService.js
employeeService.js
attendanceService.js

useAuth.js
useAttendance.js

salaryCalculator.js
dateUtils.js
constants.js
```

---

### 12. Functions

Use descriptive `camelCase` names.

#### Event handlers

Prefix with `handle`:

```javascript
handleLogin()
handleLogout()
handleCheckIn()
handleCheckOut()
handleLeaveSubmit()
```

#### Fetching data

Prefix with `get`:

```javascript
getEmployeeProfile()
getAttendanceRecords()
getLeaveRequests()
```

#### Creating data

Prefix with `create`:

```javascript
createEmployee()
createLeaveRequest()
```

#### Updating data

Prefix with `update`:

```javascript
updateEmployeeProfile()
updateLeaveStatus()
updatePayroll()
```

#### Deleting data

Prefix with `delete`:

```javascript
deleteEmployee()
deleteLeaveRequest()
```

---

### 13. Boolean Variables

Start boolean variables with:

```text
is
has
can
should
```

Examples:

```javascript
isLoading
isAuthenticated
isAdmin
isCheckedIn
hasError
canApprove
shouldRedirect
```

Avoid unclear names:

```javascript
loading
admin
checked
```

---

### 14. Constants

Store common constant values in:

```text
src/utils/constants.js
```

Use `UPPER_SNAKE_CASE` for constant objects:

```javascript
ROLES
LEAVE_TYPES
LEAVE_STATUS
ATTENDANCE_STATUS
ACCOUNT_STATUS
```

Example:

```javascript
export const ROLES = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
};
```

Never hardcode values like this throughout components:

```javascript
if (profile.role === "Admin")
```

Use:

```javascript
if (profile.role === ROLES.ADMIN)
```

---

### 15. Routes

Use lowercase **kebab-case**:

```text
/login
/employees
/employees/:id
/attendance
/time-off
/my-profile
/admin/create-employee
/admin/payroll
```

Do not use:

```text
/TimeOff
/MyProfile
/adminCreateEmployee
```

---

### 16. Supabase Tables

The agreed table names are:

```text
profiles
employee_private_info
employee_resumes
attendance
leave_balances
leave_requests
payroll
salary_components
activity_logs
```

Do not create duplicate tables such as:

```text
employees
employee_profiles
user_profiles
```

unless the team explicitly agrees to change the schema.

---

### 17. Git Branch Naming

Use:

```text
feature/<feature-name>
fix/<bug-name>
chore/<task-name>
```

Examples:

```text
feature/platform-auth-profile
feature/attendance
feature/leave-management
feature/admin-payroll
fix/login-validation
chore/project-setup
```

Do not use:

```text
meghana-branch
new
final
testing123
plswork
```

---

### 18. Commit Messages

Use this format:

```text
<type>: <short description>
```

Allowed types:

```text
feat
fix
style
refactor
docs
chore
```

Examples:

```text
feat: add employee check-in functionality
feat: add leave approval workflow
fix: prevent duplicate attendance records
style: improve employee card layout
refactor: simplify payroll calculation
docs: update project setup instructions
chore: configure supabase environment
```

---

### 19. Import Order

Keep imports grouped consistently:

```javascript
// React
import { useState, useEffect } from "react";

// Third-party libraries
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

// Components
import EmployeeCard from "../../components/employees/EmployeeCard";

// Services
import { getEmployees } from "../../services/employeeService";

// Utilities
import { ROLES } from "../../utils/constants";
```

---

### 20. Core Rule

Before introducing a new table, field, status, role, route, or shared constant:

> **Check whether an equivalent already exists. If it does, reuse it instead of inventing another name.**

The goal is to keep the project consistent across all four modules and avoid schema mismatches during final integration.
