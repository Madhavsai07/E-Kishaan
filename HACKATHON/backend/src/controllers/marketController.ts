import { Request, Response } from 'express';

const priceHistory = [
  { month: 'Jan', rice: 2800, coconut: 25, pepper: 580 },
  { month: 'Feb', rice: 2900, coconut: 28, pepper: 620 },
  { month: 'Mar', rice: 3100, coconut: 30, pepper: 650 },
  { month: 'Apr', rice: 3200, coconut: 32, pepper: 680 },
  { month: 'May', rice: 3400, coconut: 35, pepper: 720 },
  { month: 'Jun', rice: 3300, coconut: 33, pepper: 700 },
  { month: 'Jul', rice: 3500, coconut: 36, pepper: 750 },
  { month: 'Aug', rice: 3600, coconut: 38, pepper: 780 },
  { month: 'Sep', rice: 3700, coconut: 40, pepper: 800 },
  { month: 'Oct', rice: 3800, coconut: 42, pepper: 820 },
];

const priceForecast = [
  { month: 'Nov', rice: 3900, coconut: 44, pepper: 850 },
  { month: 'Dec', rice: 4100, coconut: 46, pepper: 880 },
  { month: 'Jan', rice: 4200, coconut: 48, pepper: 900 },
  { month: 'Feb', rice: 4000, coconut: 45, pepper: 870 },
  { month: 'Mar', rice: 3800, coconut: 42, pepper: 840 },
  { month: 'Apr', rice: 3600, coconut: 40, pepper: 810 },
];

const profitAnalysis = [
  { crop: 'Rice', investment: 45000, revenue: 84000, profit: 39000, roi: 86.7 },
  { crop: 'Coconut', investment: 25000, revenue: 48000, profit: 23000, roi: 92.0 },
  { crop: 'Pepper', investment: 35000, revenue: 58000, profit: 23000, roi: 65.7 },
];

export async function getMarketPricesHandler(_req: Request, res: Response) {
  return res.json({
    success: true,
    history: priceHistory,
    forecast: priceForecast,
    profitAnalysis,
  });
}
