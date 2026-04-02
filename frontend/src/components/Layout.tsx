import { Outlet, NavLink } from 'react-router-dom';
import { Home, Timer, BarChart3, Calendar, Flame } from 'lucide-react';
import { useActivityStore } from '../store/activityStore';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/timer', icon: Timer, label: 'Timer' },
  { to: '/analytics', icon: BarChart3, label: 'Stats' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
];

export default function Layout() {
  const todayLog = useActivityStore((s) => s.getTodayLog());

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-surface-light/50 backdrop-blur-lg sticky top-0 z-30 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-400" />
          <span className="font-bold text-lg">FocusFlow</span>
        </div>
        <div className="text-sm text-white/60">
          {todayLog.completionPercent}% done
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-surface-light/90 backdrop-blur-lg border-t border-white/10 z-30">
        <div className="flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                  isActive
                    ? 'text-brand-400'
                    : 'text-white/40 hover:text-white/70'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
