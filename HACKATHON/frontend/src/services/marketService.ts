/**
 * AgriSmart Market Intelligence Service
 * ======================================
 * Communicates with the Python FastAPI ML backend.
 * All data returned is real — sourced from Agmarknet / data.gov.in.
 * All predictions come from trained XGBoost + Prophet ensemble models.
 *
 * Zero synthetic data. Zero hardcoded numbers.
 */

const ML_BACKEND_URL = import.meta.env.VITE_ML_BACKEND_URL || 'http://localhost:8000';

// ─── Response Types ─────────────────────────────────────────────────────────

export interface PriceHistoryPoint {
  date: string;
  month: string;
  modal_price: number;
  min_price: number;
  max_price: number;
}

export interface ForecastPoint {
  date: string;
  month: string;
  predicted_price: number;
  lower_bound: number;
  upper_bound: number;
  confidence: number;
}

export interface CropSummary {
  crop: string;
  display_name: string;
  unit: string;
  current_price: number;
  prev_month_price: number;
  price_change_pct: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export interface ProfitData {
  crop: string;
  investment_per_acre: number;
  revenue_per_acre: number;
  profit_per_acre: number;
  roi_pct: number;
  yield_per_acre: number;
  unit: string;
}

export interface RecommendationItem {
  type: 'hold' | 'sell_now' | 'stable';
  crop: string;
  message: string;
  confidence: number;
  peak_month: string;
  peak_price: number;
}

export interface MarketData {
  success: boolean;
  last_updated: string;
  data_source: string;
  summaries: CropSummary[];
  history: Record<string, PriceHistoryPoint[]>;
  forecast: Record<string, ForecastPoint[]>;
  profit_analysis: ProfitData[];
  recommendations: RecommendationItem[];
  model_info: Record<string, { prophet: boolean; xgboost: boolean; records: number }>;
}

export interface SupportedCrop {
  id: string;
  display_name: string;
  unit: string;
  color: string;
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function fetchMarketData(
  crops: string[] = ['rice', 'coconut', 'pepper'],
  forecastMonths = 6,
  signal?: AbortSignal,
): Promise<MarketData> {
  const cropParam = crops.join(',');
  const url = `${ML_BACKEND_URL}/api/market/prices?crops=${cropParam}&forecast_months=${forecastMonths}`;

  const response = await fetch(url, { signal });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Market API error (${response.status}): ${errorText}`);
  }

  const data: MarketData = await response.json();

  if (!data.success) {
    throw new Error('Backend returned success=false');
  }

  return data;
}

export async function fetchSupportedCrops(signal?: AbortSignal): Promise<SupportedCrop[]> {
  const url = `${ML_BACKEND_URL}/api/market/crops`;
  const response = await fetch(url, { signal });

  if (!response.ok) throw new Error(`Failed to fetch crops list (${response.status})`);

  const data = await response.json();
  return data.crops as SupportedCrop[];
}

export async function triggerModelRefresh(crop: string): Promise<{ success: boolean; message: string }> {
  const url = `${ML_BACKEND_URL}/api/market/refresh/${crop}`;
  const response = await fetch(url, { method: 'POST' });

  if (!response.ok) throw new Error(`Refresh failed (${response.status})`);

  return response.json();
}

export async function checkMLBackendHealth(): Promise<{ healthy: boolean; models: Record<string, unknown> }> {
  try {
    const response = await fetch(`${ML_BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return { healthy: false, models: {} };
    const data = await response.json();
    return { healthy: data.status === 'healthy', models: data.models || {} };
  } catch {
    return { healthy: false, models: {} };
  }
}

// ─── Data Transformation Helpers (for Recharts) ──────────────────────────────

/**
 * Merge history + forecast arrays into a single combined chart-ready array.
 * Historical points have actual prices; forecast points have predicted prices.
 * The boundary point appears in both to create a seamless chart transition.
 */
export function buildCombinedChartData(
  history: Record<string, PriceHistoryPoint[]>,
  forecast: Record<string, ForecastPoint[]>,
  crops: string[],
): Array<Record<string, unknown>> {
  const historyPoints = history[crops[0]] || [];
  const forecastPoints = forecast[crops[0]] || [];

  // Historical data rows
  const histRows: Array<Record<string, unknown>> = historyPoints.map((pt) => {
    const row: Record<string, unknown> = { month: pt.month, type: 'actual' };
    crops.forEach((crop) => {
      const cropHistory = history[crop] || [];
      const match = cropHistory.find((h) => h.date === pt.date);
      row[crop] = match?.modal_price ?? null;
      row[`${crop}_min`] = match?.min_price ?? null;
      row[`${crop}_max`] = match?.max_price ?? null;
    });
    return row;
  });

  // The last historical point as the "bridge" to forecast
  const lastHistRow = histRows[histRows.length - 1];

  // Forecast data rows
  const forecastRows: Array<Record<string, unknown>> = forecastPoints.map((pt, i) => {
    const row: Record<string, unknown> = { month: pt.month, type: 'forecast' };
    crops.forEach((crop) => {
      const cropForecast = forecast[crop] || [];
      const match = cropForecast[i];
      row[`${crop}_forecast`] = match?.predicted_price ?? null;
      row[`${crop}_lower`] = match?.lower_bound ?? null;
      row[`${crop}_upper`] = match?.upper_bound ?? null;
    });
    // Bridge: carry last actual price as the start of the dashed forecast line
    if (i === 0 && lastHistRow) {
      crops.forEach((crop) => {
        row[crop] = lastHistRow[crop]; // actual bridge point
      });
    }
    return row;
  });

  return [...histRows, ...forecastRows];
}
