# Backend Integration Guide (Supabase)

This document is designed to help the backend team seamlessly integrate the Supabase backend with the Dayflow HRMS frontend. 

The frontend has been built with a **Service Layer Architecture** to ensure that components are entirely decoupled from direct database calls. This means you do not need to hunt through dozens of UI components to connect the database; you only need to modify the files in the `src/services/` directory.

---

## 1. Architecture Overview

```text
src/
├── components/    (UI Components - DO NOT add Supabase queries here)
├── pages/         (Page Views - DO NOT add Supabase queries here)
├── data/          
│   └── mockData.js (Current source of truth for the UI)
└── services/      (INTEGRATION POINT - Add Supabase logic here)
    └── authService.js
```

Currently, the frontend relies on `src/data/mockData.js`. To merge the backend:
1. Initialize the Supabase client (`src/services/supabaseClient.js`).
2. Create service files for each domain (`employeeService.js`, `attendanceService.js`, etc.).
3. Replace the static mock imports in the UI components with asynchronous calls to these services.

---

## 2. Setting up Supabase

Create `src/services/supabaseClient.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Ensure you add `.env` to the project root with the necessary keys.

---

## 3. Data Structures Expected by Frontend

To minimize UI breakage, try to map your Supabase responses to match the structures the frontend currently expects. If your schema is different, map the fields in the service layer before returning them to the UI.

### Employee Object
```javascript
{
  id: "uuid-or-string",
  firstName: "String",
  lastName: "String",
  email: "String",
  position: "String",
  department: "String",
  status: "Present" | "Absent" | "On Leave",
  joinDate: "YYYY-MM-DD",
  avatarUrl: "String (URL)"
}
```

### Attendance Record
```javascript
{
  id: "uuid-or-number",
  employeeId: "uuid-or-string",
  date: "String (e.g., Oct 24, 2024)",
  checkIn: "String (e.g., 09:00 AM) or '-'",
  checkOut: "String (e.g., 05:00 PM) or '-'",
  hours: "String (e.g., 8h 0m)",
  extra: "String",
  status: "Present" | "Absent" | "On Leave"
}
```

### Time Off Request (Pending Approval)
```javascript
{
  id: "uuid-or-number",
  employee: { /* Employee Object above */ },
  type: "Paid Leave" | "Sick Leave" | "Unpaid Leave",
  start: "String Date",
  end: "String Date",
  duration: "String (e.g., 4 days)",
  reason: "String",
  status: "Pending" | "Approved" | "Rejected"
}
```

---

## 4. Required Services to Implement

Here is the checklist of services the backend team needs to build inside `src/services/`:

### A. Authentication & Roles (`authService.js`)
Currently mocked. You need to connect this to Supabase Auth.
- `login(email, password)`
- `logout()`
- `getCurrentUser()` -> Should fetch the Supabase user AND join with the `employees` table to get their role (`ADMIN`, `HR_OFFICER`, `EMPLOYEE`).

### B. Employees (`employeeService.js`)
- `getEmployees()`: Fetch list for the directory.
- `getEmployeeById(id)`: Fetch detailed personnel record.
- `createEmployee(data)`: (Admin only).

### C. Attendance (`attendanceService.js`)
- `checkIn(employeeId)`: Record start time.
- `checkOut(employeeId)`: Record end time and calculate hours.
- `getTodayAttendance(employeeId)`: Check if the user is currently checked in.
- `getAttendanceHistory(filters)`: For the Admin log table.

### D. Time Off (`timeOffService.js`)
- `getLeaveBalances(employeeId)`: Return total/used/pending for Paid, Sick, and Unpaid leave.
- `requestTimeOff(data)`: Submit a new request.
- `getPendingRequests()`: (Admin only) Fetch requests awaiting approval.
- `updateRequestStatus(requestId, status)`: Approve or reject.

### E. Salary (`salaryService.js` - Admin Only)
- `getSalaryDetails(employeeId)`: Fetch structured salary breakdown and deductions.

---

## 5. Merging Workflow for the Team

1. **Backend Team**: Build the Supabase schema and RLS policies independently.
2. **Backend Team**: Implement the service functions in `src/services/` that query Supabase and return Promises.
3. **Frontend/Backend Together**: Go to the pages (e.g., `src/pages/Employees.jsx`), remove the `import { mockEmployees } from '../data/mockData'`, and replace it with a `useEffect` hook that calls `employeeService.getEmployees()`.

By keeping all database logic confined to the `services` folder, the frontend UI remains clean, and the backend team can safely write queries without fear of breaking the React layout.
