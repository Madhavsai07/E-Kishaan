import { Request, Response } from 'express';

let inMemoryFertilizerLogs: Array<{
  id: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  date: string;
  month: string;
}> = [
  { id: '1', nitrogen: 20, phosphorus: 15, potassium: 25, date: '2026-06-15', month: 'Jun' },
  { id: '2', nitrogen: 25, phosphorus: 18, potassium: 30, date: '2026-07-15', month: 'Jul' },
  { id: '3', nitrogen: 22, phosphorus: 20, potassium: 28, date: '2026-08-15', month: 'Aug' },
];

export async function getSoilFertilityHandler(_req: Request, res: Response) {
  return res.json({
    success: true,
    soilHealth: {
      overallHealthScore: 85,
      phLevel: 6.5,
      organicMatterPercent: 3.2,
      moisturePercent: 45,
      npk: { nitrogen: 75, phosphorus: 68, potassium: 82 },
    },
    logs: inMemoryFertilizerLogs,
  });
}

export async function addFertilizerLogHandler(req: Request, res: Response) {
  try {
    const { nitrogen, phosphorus, potassium, date } = req.body;
    const n = parseFloat(nitrogen) || 0;
    const p = parseFloat(phosphorus) || 0;
    const k = parseFloat(potassium) || 0;
    const logDate = date || new Date().toISOString().split('T')[0];
    const month = new Date(logDate).toLocaleString('default', { month: 'short' });

    const newLog = {
      id: Date.now().toString(),
      nitrogen: n,
      phosphorus: p,
      potassium: k,
      date: logDate,
      month,
    };

    inMemoryFertilizerLogs.push(newLog);

    return res.json({
      success: true,
      message: 'Fertilizer application logged successfully on server',
      log: newLog,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to add fertilizer log',
    });
  }
}
