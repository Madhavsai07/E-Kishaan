import { Request, Response } from 'express';

let inMemoryUserStats = {
  userPoints: 1250,
  problemsSolved: 2,
  weatherChecks: 5,
  fertilizerLogs: 3,
  marketChecks: 4,
  cropsTracked: 4,
  firstVisitDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export async function getUserStatsHandler(_req: Request, res: Response) {
  return res.json({
    success: true,
    stats: inMemoryUserStats,
  });
}

export async function updateUserStatsHandler(req: Request, res: Response) {
  try {
    const patch = req.body;
    inMemoryUserStats = { ...inMemoryUserStats, ...patch };
    return res.json({
      success: true,
      message: 'User stats updated on backend',
      stats: inMemoryUserStats,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
