import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';

export function AppShell() {
  return (
    <div className="app-layout">
      <TopBar />
      <div className="main-content-wrapper">
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
