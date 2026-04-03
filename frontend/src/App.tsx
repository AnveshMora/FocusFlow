import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ActivityPage from './pages/ActivityPage';
import TimerPage from './pages/TimerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SchedulePage from './pages/SchedulePage';
import SettingsPage from './pages/SettingsPage';
import MorningRitualModal from './components/MorningRitualModal';
import { useActivityStore } from './store/activityStore';
import { useEffect } from 'react';

export default function App() {
  const initToday = useActivityStore((s) => s.initToday);

  useEffect(() => {
    initToday();

    // Re-init when day changes (midnight rollover or app resume next day)
    const checkDay = () => initToday();
    window.addEventListener('focus', checkDay);
    const interval = setInterval(checkDay, 60_000); // check every minute
    return () => {
      window.removeEventListener('focus', checkDay);
      clearInterval(interval);
    };
  }, [initToday]);

  return (
    <>
      <MorningRitualModal />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/activity/:id" element={<ActivityPage />} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}
