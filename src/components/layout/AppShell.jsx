import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';

export function AppShell() {
  const location = useLocation();
  
  return (
    <div className="app-layout">
      <TopBar />
      <div className="main-content-wrapper">
        <main className="main-content" key={location.pathname}>
          <div className="page-transition-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
