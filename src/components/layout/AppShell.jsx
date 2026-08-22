import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content-wrapper">
        <TopBar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
