import { Request, Response } from 'express';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export async function getMarketPricesHandler(_req: Request, res: Response) {
  const currentDate = new Date();
  const currentMonthIdx = currentDate.getMonth();

  const priceHistory = [];
  for (let i = 9; i >= 0; i--) {
    const mIdx = (currentMonthIdx - i + 12) % 12;
    const monthLabel = MONTH_NAMES[mIdx];
    const step = 9 - i;
    const rice = Math.round(3000 + step * 90 + Math.sin(mIdx) * 140);
    const coconut = Math.round(26 + step * 1.6 + Math.cos(mIdx) * 3);
    const pepper = Math.round(610 + step * 22 + Math.sin(mIdx * 0.8) * 30);
    priceHistory.push({ month: monthLabel, rice, coconut, pepper });
  }

  const priceForecast = [];
  const latestHistory = priceHistory[priceHistory.length - 1];
  for (let i = 1; i <= 6; i++) {
    const mIdx = (currentMonthIdx + i) % 12;
    const monthLabel = MONTH_NAMES[mIdx];
    const rice = Math.round(latestHistory.rice + i * 105 + Math.sin(i) * 70);
    const coconut = Math.round(latestHistory.coconut + i * 1.5 + Math.cos(i) * 2);
    const pepper = Math.round(latestHistory.pepper + i * 24 + Math.sin(i * 1.2) * 25);
    priceForecast.push({ month: monthLabel, rice, coconut, pepper });
  }

  const profitAnalysis = [
    { crop: 'Rice', investment: 45000, revenue: Math.round(latestHistory.rice * 22.1), profit: Math.round(latestHistory.rice * 22.1) - 45000, roi: Math.round(((Math.round(latestHistory.rice * 22.1) - 45000) / 45000) * 1000) / 10 },
    { crop: 'Coconut', investment: 25000, revenue: Math.round(latestHistory.coconut * 1140), profit: Math.round(latestHistory.coconut * 1140) - 25000, roi: Math.round(((Math.round(latestHistory.coconut * 1140) - 25000) / 25000) * 1000) / 10 },
    { crop: 'Pepper', investment: 35000, revenue: Math.round(latestHistory.pepper * 71), profit: Math.round(latestHistory.pepper * 71) - 35000, roi: Math.round(((Math.round(latestHistory.pepper * 71) - 35000) / 35000) * 1000) / 10 },
  ];

  return res.json({
    success: true,
    history: priceHistory,
    forecast: priceForecast,
    profitAnalysis,
  });
}
