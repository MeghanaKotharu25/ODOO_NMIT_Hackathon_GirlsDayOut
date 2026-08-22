# Dayflow HRMS 🌊

**Dayflow** is a premium, high-fidelity Human Resources Management System (HRMS) built for the modern enterprise. 

For the NMIT Hackathon "Girls Day Out", we designed Dayflow with a **"quiet, premium operating system"** philosophy. Instead of a standard SaaS dashboard, Dayflow feels like a bespoke, cinematic terminal. It leverages strict monochromatic palettes, heavy typographic hierarchy, structural borders, and fluid animations to create a zero-friction, tactile experience.

> **Note on Branching:** All of the premium design and interactive state features are located on the `frontend-build` branch. The `main` branch contains an older, deprecated sidebar layout. **Please evaluate the `frontend-build` branch!**

## 🎬 Cinematic OS Experience
- **Boot Sequence**: Secure terminal-style login screen leading into a full CRT-scanline boot sequence.
- **Physical UI**: Menus, popovers, and drawers don't just appear; they slide in with snappy, physics-based motion curves.
- **Atmosphere**: A global, animated SVG film grain overlay grounds the application in a physical space.
- **Custom Hardware**: Custom crosshair/ring cursor system that reacts to interactive elements.

## ⚡ Core Features
- **Stateful Interactions**: Fully simulated React state (without a backend). Add employees to the directory, approve/reject time-off requests, and interact with the ledger—all instantly reflected in the UI.
- **Global Toast Engine**: Custom-built, contextual notification system that acknowledges every user action (e.g., generating PDFs, terminating sessions).
- **Command Center Dashboard**: Aggregated operational summaries, SVG-based chart visualizations (via Recharts), and a live scrolling system ticker.
- **Personnel Directory**: Real-time filtering by name and department, with an integrated drawer for new records.

## 🛠️ Tech Stack
- **Frontend Framework**: React 19 + Vite
- **Styling**: Vanilla CSS (Custom Design System, variables, Keyframe animations)
- **Routing**: React Router DOM (with protected route simulation)
- **Icons**: Lucide React
- **Data Visualization**: Recharts

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
1. Clone the repository and checkout the build branch:
   ```bash
   git clone https://github.com/MeghanaKotharu25/ODOO_NMIT_Hackathon_GirlsDayOut.git
   cd ODOO_NMIT_Hackathon_GirlsDayOut
   git checkout frontend-build
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the portal at `http://localhost:5173/`. Use any mock credentials to pass the login gate and initiate the boot sequence!

---
*Built with precision for the NMIT Hackathon.*
