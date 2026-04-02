import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ActivityPage from './pages/ActivityPage';
import TimerPage from './pages/TimerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SchedulePage from './pages/SchedulePage';
import { useActivityStore } from './store/activityStore';
import { useEffect } from 'react';

export default function App() {
  const initToday = useActivityStore((s) => s.initToday);

  useEffect(() => {
    initToday();
  }, [initToday]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/activity/:id" element={<ActivityPage />} />
        <Route path="/timer" element={<TimerPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
