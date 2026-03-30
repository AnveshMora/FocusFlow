import { Request, Response } from 'express';

export const getTodayActivities = async (req: Request, res: Response) => {
  // Fetch today's activities for the user
  res.json([]);
};

export const markActivity = async (req: Request, res: Response) => {
  // Mark activity as done or skipped
  res.json({});
};

export const createCheckpoint = async (req: Request, res: Response) => {
  // Create a checkpoint for the day
  res.json({});
};
