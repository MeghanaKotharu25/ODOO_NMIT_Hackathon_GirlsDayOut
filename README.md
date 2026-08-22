# Dayflow HRMS 🌊

**Dayflow** is a premium, high-fidelity Human Resources Management System (HRMS) built for the modern enterprise.

For the NMIT Hackathon "Girls Day Out", we designed Dayflow with a **"quiet, premium operating system"** philosophy. Instead of a standard SaaS dashboard, Dayflow feels like a bespoke, cinematic terminal. It leverages strict monochromatic palettes, heavy typographic hierarchy, structural borders, and fluid animations to create a zero-friction, tactile experience.

## 🎬 Cinematic OS Experience
- **Boot Sequence**: Secure terminal-style login screen leading into a full CRT-scanline boot sequence.
- **Physical UI**: Menus, popovers, and drawers don't just appear; they slide in with snappy, physics-based motion curves powered by `framer-motion`.
- **Atmosphere**: A global, animated SVG film grain overlay grounds the application in a physical space.
- **Custom Hardware**: Custom crosshair/ring cursor system with magnetic physics that physically reacts to interactive elements.

## ⚡ Core Modules

### 📊 Command Center (Dashboard)
Aggregated operational summaries, SVG-based chart visualizations (via Recharts), staggered entry sequences, and a live scrolling system ticker.

### 👥 Personnel Roster (Employees)
Real-time filtering by name and department. Integrated slide-out drawer for adding new records (Admin Only). 
- **Smart Onboarding**: Custom employee ID generation formula (`[Company]+[Initials]+[Year]+[Serial]`). 
- **Automated Security**: System automatically generates a secure temporary password for new employees upon creation.
- Backend-connected via Supabase Edge Function (`create-employee`).

### 📋 Employee Dossier (Employee Details)
Three-tab detailed profile view:
- **Resume** — Contact info, organization details, and downloadable documents.
- **Private Info** — Personal details, banking & compliance (PAN, UAN, PF Code, IFSC).
- **Salary Info** *(Admin Only)* — Live salary auto-calculator. Change the Monthly Wage input and all components (Base 50%, Standard Allowance 15%, Performance Bonus 8.33%, LTA 8.33%, Fixed Allowance 18.34%) and deductions (PF 12%, Professional Tax ₹200) recalculate instantly.

### ⏰ Attendance Tracker
Clock-in/clock-out tracking with total hours calculation and calendar-based attendance views.

### 🏖️ Time Off Management
- **Admin View**: Pending approvals queue with Approve/Reject actions, file attachment support for sick leave certificates, and request history table.
- **Employee View**: Leave balance dashboard (Paid Time Off, Sick Leave, Unpaid Leave) with visual progress bars.
- Submitted requests dynamically appear in the Admin's pending queue in real-time.

### 💰 Payroll & Compensation
Cinematic financial ledger interface with:
- Searchable employee salary records showing Base, Earnings, Deductions, and Net Pay.
- Admin-only "Edit Salary" functionality with live recalculation of projected deductions.
- Summary statistics: Total Payroll, Average Salary, Highest Earner.

## 🔐 Architecture & Security
- **Supabase Backend**: Fully integrated BaaS handling Authentication, PostgreSQL Database, and Edge Functions.
- **Role-Based Access Control**: Strict segregation between Admin and Employee roles (e.g., standard employees cannot register new personnel).
- **Self-Service Security**: Employees can securely change their auto-generated system passwords via their profile dashboard.
- **Row Level Security (RLS)**: Enforced on all tables — employees can only view their own private data; admins retain global access via Service Role Key.
- **Edge Functions**: Secure `create-employee` function that bypasses frontend auth state to safely create users server-side.
- **Demo Mode**: When Supabase credentials are not configured (e.g., on Vercel), the app automatically activates Demo Mode with a mock admin user, ensuring the full UI renders without any backend dependency.

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Styling | Vanilla CSS Design System + TailwindCSS 4 |
| Motion | Framer Motion (Magnetic UI, Staggered Reveals) |
| Backend | Supabase (PostgreSQL, Auth, RLS, Edge Functions) |
| Routing | React Router DOM v7 (Protected Routes) |
| Icons | Lucide React |
| Charts | Recharts |

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Supabase Project API Keys (optional — app runs in Demo Mode without them)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/MeghanaKotharu25/ODOO_NMIT_Hackathon_GirlsDayOut.git
   cd ODOO_NMIT_Hackathon_GirlsDayOut
   ```
2. *(Optional)* Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```
   > **Note:** If you skip this step, the app will run in **Demo Mode** with mock data and a simulated admin user.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Access the portal at `http://localhost:5173/`.

### Production Build
```bash
npm run build
npm run preview
```

## 📁 Project Structure
```
src/
├── components/layout/   # AppShell, TopBar, CustomCursor, Magnetic
├── context/             # AuthContext, ToastContext
├── data/                # mockData.js (employees, payroll, current user)
├── lib/                 # Supabase client (with demo-mode fallback)
├── pages/               # Dashboard, Employees, EmployeeDetails, Attendance,
│                        # TimeOff, Payroll, MyProfile, Settings, Login, LoadingScreen
├── routes/              # ProtectedRoute (auth gate)
├── services/            # authService, employeeService (Supabase-guarded)
├── utils/               # motion.js (animation variants)
└── index.css            # Design system tokens & global styles
supabase/
├── schema.sql           # Full database schema + RLS policies
└── functions/           # Edge Functions (create-employee)
```

---
*Built with precision for the NMIT Hackathon by Girls Day Out 🎀*
