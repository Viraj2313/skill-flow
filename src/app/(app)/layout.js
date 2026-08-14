import BottomTabBar, { DesktopSidebar } from '@/components/BottomTabBar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-aq-bg flex">
      <DesktopSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 pb-20 md:pb-0">
          <div className="max-w-3xl mx-auto w-full">
            {children}
          </div>
        </main>
        <BottomTabBar />
      </div>
    </div>
  );
}
