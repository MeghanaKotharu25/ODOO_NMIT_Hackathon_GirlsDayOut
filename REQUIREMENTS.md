# Dayflow HRMS - Product Requirements

## Overview
Dayflow is a web-based Human Resources Management System designed to handle core HR operations with an emphasis on a premium user experience and clear data hierarchy.

## User Roles
The system must support the following Role-Based Access Control (RBAC):
1. **Employee**: Can view their own profile, attendance history, submit time-off requests, and view their salary breakdown.
2. **HR/Admin**: Has elevated privileges. Can view the employee directory, approve/reject time-off requests, view company-wide attendance logs, and manage salary data.

## Functional Requirements

### 1. Dashboard
- Display real-time KPI metrics (Headcount, Attendance Rate, Pending Requests).
- Render visual charts tracking attendance trends.
- Display a "Needs Attention" panel highlighting actionable items (e.g., pending leave approvals).

### 2. Employee Directory
- Display a searchable grid/list of all employees.
- Filter employees by department and status.
- Clicking an employee card navigates to their detailed personnel record.

### 3. Profile & Personnel Records
- Display comprehensive employee data including Job Title, Department, Join Date, and Contact Information.
- Provide a tabbed interface separating general information, security settings, and private documents (like Resumes).
- **Security Rule**: Salary and secure documents should only be visible to the specific employee or HR Admins.

### 4. Attendance Module
- Provide a "Check In" and "Check Out" mechanism for daily tracking.
- Calculate and display total hours worked per day.
- **Admin View**: Provide a data-dense log table displaying historical check-ins across the entire organization, with filtering and export capabilities.

### 5. Time Off Module
- Display dynamic leave balances (Paid, Sick, Unpaid).
- Provide a form for employees to request future time off with a reason.
- **Admin View**: Display a queue of pending requests requiring manual Approval or Rejection.

### 6. Salary Module (Admin/Confidential)
- Display a clear breakdown of gross salary components (Base, HRA, Allowances).
- Display a breakdown of deductions (Taxes, Insurance).
- Calculate and highlight the final Net Salary.

## Non-Functional Requirements
- **Performance**: The UI must remain responsive and snappy.
- **Responsiveness**: The application must be fully usable on desktop, tablet, and mobile devices, utilizing adaptive grid layouts.
- **Design Aesthetic**: The interface must adhere to the "quiet, premium operating system" aesthetic. No generic SaaS templates. Use subtle micro-animations and off-white/charcoal palettes. 
- **Security**: All backend API calls must enforce RLS (Row Level Security) via Supabase to prevent data leaks between employees.
