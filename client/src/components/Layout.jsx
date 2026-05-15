import { Outlet } from 'react-router-dom';
import TopNavBar from './TopNavBar';
import SideNavBar from './SideNavBar';
import MobileNavBar from './MobileNavBar';
import NetworkBanner from './NetworkBanner';

export default function Layout() {
  return (
    <div className="min-h-screen bg-surface">
      <TopNavBar />
      <SideNavBar />
      <NetworkBanner />

      <main className="md:ml-[240px] pt-[56px] min-h-screen pb-16 md:pb-0">
        <Outlet />
      </main>

      <MobileNavBar />
    </div>
  );
}
