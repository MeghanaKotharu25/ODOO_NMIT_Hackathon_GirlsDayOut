# Dayflow HRMS 🌊

**Dayflow** is a premium, high-fidelity Human Resources Management System (HRMS) built for the modern enterprise. 

For the NMIT Hackathon "Girls Day Out", we designed Dayflow with a **"quiet, premium operating system"** philosophy. Instead of a standard SaaS dashboard, Dayflow feels like a bespoke, cinematic terminal. It leverages strict monochromatic palettes, heavy typographic hierarchy, structural borders, and fluid animations to create a zero-friction, tactile experience.

## 🎬 Cinematic OS Experience
- **Boot Sequence**: Secure terminal-style login screen leading into a full CRT-scanline boot sequence.
- **Physical UI**: Menus, popovers, and drawers don't just appear; they slide in with snappy, physics-based motion curves powered by `framer-motion`.
- **Atmosphere**: A global, animated SVG film grain overlay grounds the application in a physical space.
- **Custom Hardware**: Custom crosshair/ring cursor system with magnetic physics that physically reacts to interactive elements.

## ⚡ Core Features
- **Supabase Backend**: Fully integrated Backend-as-a-Service (BaaS) handling live Authentication and Database management with Row Level Security (RLS) policies.
- **Global Toast Engine**: Custom-built, contextual notification system that acknowledges every user action (e.g., generating PDFs, terminating sessions).
- **Command Center Dashboard**: Aggregated operational summaries, SVG-based chart visualizations (via Recharts), staggered entry sequences, and a live scrolling system ticker.
- **Personnel Directory**: Real-time filtering by name and department, with an integrated drawer for new records.

## 🛠️ Tech Stack
- **Frontend Framework**: React 19 + Vite
- **Styling**: Vanilla CSS (Custom Design System, variables, Keyframe animations)
- **Motion Engine**: Framer Motion (Magnetic UI, Staggered Reveals)
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Routing**: React Router DOM (with protected route logic)
- **Icons**: Lucide React
- **Data Visualization**: Recharts

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Supabase Project API Keys

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/MeghanaKotharu25/ODOO_NMIT_Hackathon_GirlsDayOut.git
   cd ODOO_NMIT_Hackathon_GirlsDayOut
   ```
2. Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Access the portal at `http://localhost:5173/`. Use your registered Supabase credentials to pass the login gate and initiate the boot sequence!

---
*Built with precision for the NMIT Hackathon.*
