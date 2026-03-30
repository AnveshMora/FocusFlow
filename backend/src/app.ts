import express from 'express';
import cors from 'cors';
import activityRoutes from './routes/activity';
import analyticsRoutes from './routes/analytics';
import scheduleRoutes from './routes/schedule';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', activityRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', scheduleRoutes);

export default app;
