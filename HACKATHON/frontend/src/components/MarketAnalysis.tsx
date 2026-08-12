import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp, TrendingDown, Minus, DollarSign, Calendar, Target,
  AlertCircle, RefreshCw, Wifi, WifiOff, Brain, Clock,
  BarChart3, ShieldCheck, Sparkles, Info,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  ReferenceLine, Area, AreaChart, Legend, ComposedChart,
} from 'recharts';
import { useUserStats } from '@/contexts/UserStatsContext';
import {
  fetchMarketData, checkMLBackendHealth, buildCombinedChartData, triggerModelRefresh,
  type MarketData, type CropSummary, type ForecastPoint,
} from '@/services/marketService';

// ─── Auto-refresh interval (30 minutes) ──────────────────────────────────────
const AUTO_REFRESH_MS = 30 * 60 * 1000;

// ─── Tooltip Formatters ───────────────────────────────────────────────────────
const CROP_UNITS: Record<string, string> = {
  rice: 'quintal',
  coconut: 'piece',
  pepper: 'kg',
};

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const PriceTooltip = ({
  active,
  payload,
  label,
  activeAxis,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: string;
  activeAxis?: 'left' | 'right' | null;
}) => {
  if (!active || !payload?.length) return null;

  // Filter out the confidence bands and filter by active axis if hovered
  const cleanPayload = payload.filter((p) => {
    if (p.dataKey.includes('_upper') || p.dataKey.includes('_lower')) return false;
    if (activeAxis) {
      const isCoconut = p.name.toLowerCase().includes('coconut');
      if (activeAxis === 'right' && !isCoconut) return false;
      if (activeAxis === 'left' && isCoconut) return false;
    }
    return true;
  });

  if (cleanPayload.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-sm min-w-[200px]">
      <p className="font-semibold text-gray-700 mb-2 border-b pb-1">{label}</p>
      {cleanPayload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-gray-500 capitalize">{entry.name.replace(' (Forecast)', '')}</span>
          </div>
          <span className="font-bold text-gray-800 ml-4">₹{entry.value?.toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const PulseBox = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => <PulseBox key={i} className="h-28" />)}
    </div>
    <PulseBox className="h-14" />
    <PulseBox className="h-80" />
  </div>
);

// ─── Backend Status Badge ─────────────────────────────────────────────────────
const BackendStatusBadge = ({ isOnline, isLoading }: { isOnline: boolean | null; isLoading: boolean }) => {
  if (isLoading || isOnline === null) {
    return (
      <Badge variant="outline" className="text-xs gap-1 animate-pulse">
        <RefreshCw className="w-3 h-3 animate-spin" /> Connecting…
      </Badge>
    );
  }
  if (isOnline) {
    return (
      <Badge className="text-xs gap-1 bg-emerald-500 hover:bg-emerald-600">
        <Wifi className="w-3 h-3" /> ML Backend Live
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="text-xs gap-1">
      <WifiOff className="w-3 h-3" /> Backend Offline
    </Badge>
  );
};

// ─── Recommendation Card ──────────────────────────────────────────────────────
const RecommendationCard = ({
  rec,
}: {
  rec: MarketData['recommendations'][0];
}) => {
  const typeConfig = {
    hold: { bg: 'bg-amber-50 border-amber-200', icon: '⏳', color: 'text-amber-700', label: 'Hold Recommendation' },
    sell_now: { bg: 'bg-blue-50 border-blue-200', icon: '💰', color: 'text-blue-700', label: 'Sell Now' },
    stable: { bg: 'bg-gray-50 border-gray-200', icon: '📊', color: 'text-gray-700', label: 'Stable Market' },
  };
  const cfg = typeConfig[rec.type] || typeConfig.stable;

  return (
    <div className={`p-4 rounded-lg border ${cfg.bg}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{cfg.icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`font-semibold text-sm ${cfg.color}`}>{cfg.label} — {rec.crop}</h4>
            <Badge variant="outline" className="text-xs">
              {Math.round(rec.confidence * 100)}% confidence
            </Badge>
          </div>
          <p className={`text-xs ${cfg.color} opacity-90`}>{rec.message}</p>
          <p className="text-xs text-gray-500 mt-1">
            Peak: ₹{rec.peak_price.toLocaleString('en-IN')} in {rec.peak_month}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MarketAnalysis() {
  const { recordMarketCheck } = useUserStats();

  // ── State ──────────────────────────────────────────────────────────────────
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedCrops] = useState(['rice', 'coconut', 'pepper']);
  const [refreshingCrop, setRefreshingCrop] = useState<string | null>(null);
  const [hoveredCrop, setHoveredCrop] = useState<string | null>(null);
  const [hoveredAxis, setHoveredAxis] = useState<'left' | 'right' | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch Market Data from ML Backend ────────────────────────────────────
  const loadMarketData = useCallback(async (isManualRefresh = false) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      // Check backend health first
      const health = await checkMLBackendHealth();
      setBackendOnline(health.healthy);

      if (!health.healthy) {
        throw new Error('ML backend is offline. Please start the Python server: cd ml_backend && uvicorn main:app --reload');
      }

      const data = await fetchMarketData(selectedCrops, 6, controller.signal);
      setMarketData(data);
      setLastUpdated(new Date(data.last_updated));
      recordMarketCheck();
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCrops, recordMarketCheck]);

  // Initial load
  useEffect(() => {
    loadMarketData();
    // Auto-refresh every 30 minutes
    const interval = setInterval(() => loadMarketData(), AUTO_REFRESH_MS);
    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, [loadMarketData]);

  // ── Model Refresh Handler ────────────────────────────────────────────────
  const handleModelRefresh = async (crop: string) => {
    setRefreshingCrop(crop);
    try {
      await triggerModelRefresh(crop);
      await loadMarketData(true);
    } catch (err) {
      setError(`Model refresh failed: ${(err as Error).message}`);
    } finally {
      setRefreshingCrop(null);
    }
  };

  // ── Chart Data ────────────────────────────────────────────────────────────
  const combinedChartData = marketData
    ? buildCombinedChartData(marketData.history, marketData.forecast, selectedCrops)
    : [];

  const historyData = marketData
    ? (marketData.history[selectedCrops[0]] || []).map((pt, idx) => {
        const row: Record<string, unknown> = { month: pt.month };
        selectedCrops.forEach((crop) => {
          row[crop] = marketData.history[crop]?.[idx]?.modal_price ?? null;
        });
        return row;
      })
    : [];

  const forecastData = marketData
    ? (marketData.forecast[selectedCrops[0]] || []).map((pt, idx) => {
        const row: Record<string, unknown> = { month: pt.month };
        selectedCrops.forEach((crop) => {
          const f = marketData.forecast[crop]?.[idx] as ForecastPoint | undefined;
          row[`${crop}_forecast`] = f?.predicted_price ?? null;
          row[`${crop}_lower`] = f?.lower_bound ?? null;
          row[`${crop}_upper`] = f?.upper_bound ?? null;
        });
        return row;
      })
    : [];

  // Pie chart: revenue distribution (derived from live profit data)
  const revenuePieData = marketData?.profit_analysis.map((p) => ({
    name: p.crop.charAt(0).toUpperCase() + p.crop.slice(1),
    value: p.revenue_per_acre,
    color: marketData.summaries.find((s) => s.crop === p.crop)?.color ?? '#8884d8',
  })) ?? [];

  // ── Error State ───────────────────────────────────────────────────────────
  if (!isLoading && error && !marketData) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>ML Backend Unavailable</AlertTitle>
          <AlertDescription className="mt-2">
            <p>{error}</p>
            <div className="mt-3 p-3 bg-red-950 text-red-100 rounded-md font-mono text-xs">
              <p className="text-red-400 mb-1"># Start the ML backend:</p>
              <p>cd E-Kishaan/HACKATHON/ml_backend</p>
              <p>pip install -r requirements.txt</p>
              <p>uvicorn main:app --reload --port 8000</p>
            </div>
            <Button onClick={() => loadMarketData()} className="mt-3" size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ── Loading State ─────────────────────────────────────────────────────────
  if (isLoading) return <LoadingSkeleton />;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header Status Bar ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <BackendStatusBadge isOnline={backendOnline} isLoading={isRefreshing} />
          {marketData?.model_info && (
            <Badge variant="outline" className="text-xs gap-1">
              <Brain className="w-3 h-3" />
              {Object.values(marketData.model_info).some(m => m.xgboost) ? 'XGBoost + Prophet' : 'ML Engine'} Active
            </Badge>
          )}
          {lastUpdated && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadMarketData(true)}
          disabled={isRefreshing}
          className="text-xs gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing…' : 'Refresh Data'}
        </Button>
      </div>

      {/* ── Data Source Attribution ──────────────────────────────────────────── */}
      {marketData && (
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border rounded-lg px-3 py-2">
          <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
          <span><strong>Data Source:</strong> {marketData.data_source}</span>
        </div>
      )}

      {/* ── Crop Summary Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {marketData?.summaries.map((summary: CropSummary) => (
          <Card
            key={summary.crop}
            className="text-white border-0 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${summary.color}dd, ${summary.color})` }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {summary.display_name} Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{summary.current_price.toLocaleString('en-IN')}/{summary.unit}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {summary.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : summary.trend === 'down' ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {summary.price_change_pct > 0 ? '+' : ''}{summary.price_change_pct}% this month
                </span>
              </div>
              <div className="text-xs mt-2 opacity-75">
                vs ₹{summary.prev_month_price.toLocaleString('en-IN')} last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Optimal Selling Time Alert ───────────────────────────────────────── */}
      {marketData?.recommendations && marketData.recommendations.length > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <Target className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 flex items-center gap-2">
            AI-Optimal Selling Time
            <Badge className="text-xs bg-green-600 hover:bg-green-700">
              <Sparkles className="w-3 h-3 mr-1" /> ML Powered
            </Badge>
          </AlertTitle>
          <AlertDescription className="text-green-700">
            {marketData.recommendations.map((rec, i) => (
              <span key={i}>
                {i > 0 && ' · '}
                <strong>{rec.crop}</strong>: {rec.type === 'hold' ? 'Hold until' : rec.type === 'sell_now' ? 'Sell now →' : 'Stable →'} {rec.peak_month}
              </span>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="prices" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prices">Price Trends</TabsTrigger>
          <TabsTrigger value="forecast">AI Forecast</TabsTrigger>
          <TabsTrigger value="profit">Profit Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Historical Price Trends ────────────────────────────────── */}
        <TabsContent value="prices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Historical Price Trends
                <Badge variant="outline" className="text-xs">Real Mandi Data</Badge>
              </CardTitle>
              <CardDescription>
                Actual wholesale modal prices from Agmarknet government database — last {historyData.length} months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis 
                      yAxisId="left" 
                      axisLine={{ strokeOpacity: hoveredAxis === 'right' ? 0.1 : 1 }}
                      tick={{ fontSize: 11, fillOpacity: hoveredAxis === 'right' ? 0.1 : 1 }} 
                      tickFormatter={(val) => `₹${val}`}
                      onMouseEnter={() => setHoveredAxis('left')}
                      onMouseLeave={() => setHoveredAxis(null)}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      axisLine={{ strokeOpacity: hoveredAxis === 'left' ? 0.1 : 1 }}
                      tick={{ fontSize: 11, fillOpacity: hoveredAxis === 'left' ? 0.1 : 1 }} 
                      tickFormatter={(val) => `₹${val}`}
                      onMouseEnter={() => setHoveredAxis('right')}
                      onMouseLeave={() => setHoveredAxis(null)}
                    />
                    <Tooltip content={<PriceTooltip activeAxis={hoveredAxis} />} />
                    <Legend
                      onMouseEnter={(o) => setHoveredCrop(o.dataKey.toString().replace('_forecast', ''))}
                      onMouseLeave={() => setHoveredCrop(null)}
                    />
                    {marketData?.summaries.map((s) => {
                      const yAxisId = s.crop === 'coconut' ? 'right' : 'left';
                      const isFaded = 
                        (hoveredCrop && hoveredCrop !== s.crop) || 
                        (hoveredAxis && hoveredAxis !== yAxisId);
                      return (
                        <Line
                          key={s.crop}
                          yAxisId={s.crop === 'coconut' ? 'right' : 'left'}
                          type="monotone"
                          dataKey={s.crop}
                          stroke={s.color}
                          strokeWidth={isFaded ? 1 : 2}
                          strokeOpacity={isFaded ? 0.15 : 1}
                          dot={isFaded ? false : { r: 3 }}
                          activeDot={isFaded ? false : { r: 5 }}
                          name={s.display_name}
                          connectNulls
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Model info footer */}
              {marketData?.model_info && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(marketData.model_info).map(([crop, info]) => (
                    <div key={crop} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                      <Brain className="w-3.5 h-3.5 text-purple-500" />
                      <span className="capitalize font-medium">{crop}:</span>
                      <span>{info.records} records</span>
                      <span>·</span>
                      <span>{info.xgboost && info.prophet ? 'XGB+Prophet' : info.xgboost ? 'XGBoost' : 'Prophet'}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: AI Forecast ────────────────────────────────────────────── */}
        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                6-Month AI Price Forecast
                <Badge className="text-xs bg-purple-600 hover:bg-purple-700">
                  <Brain className="w-3 h-3 mr-1" /> XGBoost + Prophet Ensemble
                </Badge>
              </CardTitle>
              <CardDescription>
                AI-generated price predictions with 95% confidence intervals. Dashed lines = forecast; shaded bands = uncertainty range.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis 
                      yAxisId="left" 
                      axisLine={{ strokeOpacity: hoveredAxis === 'right' ? 0.1 : 1 }}
                      tick={{ fontSize: 11, fillOpacity: hoveredAxis === 'right' ? 0.1 : 1 }} 
                      tickFormatter={(val) => `₹${val}`}
                      onMouseEnter={() => setHoveredAxis('left')}
                      onMouseLeave={() => setHoveredAxis(null)}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      axisLine={{ strokeOpacity: hoveredAxis === 'left' ? 0.1 : 1 }}
                      tick={{ fontSize: 11, fillOpacity: hoveredAxis === 'left' ? 0.1 : 1 }} 
                      tickFormatter={(val) => `₹${val}`}
                      onMouseEnter={() => setHoveredAxis('right')}
                      onMouseLeave={() => setHoveredAxis(null)}
                    />
                    <Tooltip content={<PriceTooltip activeAxis={hoveredAxis} />} />
                    <Legend
                      onMouseEnter={(o) => setHoveredCrop(o.dataKey.toString().replace('_forecast', ''))}
                      onMouseLeave={() => setHoveredCrop(null)}
                      formatter={(value) => {
                        // Only show the forecast line names; hide upper/lower bands
                        if (value.includes('_upper') || value.includes('_lower')) return null;
                        return value;
                      }}
                    />
                    {marketData?.summaries.flatMap((s) => {
                      const yAxisId = s.crop === 'coconut' ? 'right' : 'left';
                      const isFaded = 
                        (hoveredCrop && hoveredCrop !== s.crop) || 
                        (hoveredAxis && hoveredAxis !== yAxisId);
                      const opacity = isFaded ? 0.15 : 1;
                      
                      return [
                        /* Confidence Interval Band — hidden from legend */
                        <Area
                          key={`${s.crop}_upper`}
                          yAxisId={yAxisId}
                          type="monotone"
                          dataKey={`${s.crop}_upper`}
                          stroke="none"
                          fill={s.color}
                          fillOpacity={isFaded ? 0.02 : 0.12}
                          legendType="none"
                        />,
                        <Area
                          key={`${s.crop}_lower`}
                          yAxisId={yAxisId}
                          type="monotone"
                          dataKey={`${s.crop}_lower`}
                          stroke="none"
                          fill="#f8fafc"
                          fillOpacity={isFaded ? 0 : 1}
                          legendType="none"
                        />,
                        /* Forecast Line */
                        <Line
                          key={`${s.crop}_forecast`}
                          yAxisId={yAxisId}
                          type="monotone"
                          dataKey={`${s.crop}_forecast`}
                          stroke={s.color}
                          strokeWidth={isFaded ? 1 : 2.5}
                          strokeOpacity={opacity}
                          strokeDasharray="7 4"
                          dot={isFaded ? false : { r: 4, fill: s.color }}
                          activeDot={isFaded ? false : { r: 6 }}
                          name={`${s.display_name} (Forecast)`}
                          connectNulls
                        />
                      ];
                    })}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Peak Price Summary Cards — fully dynamic */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {marketData?.recommendations.map((rec) => {
                  const summary = marketData.summaries.find((s) => s.display_name === rec.crop);
                  return (
                    <div
                      key={rec.crop}
                      className="text-center p-4 rounded-lg border"
                      style={{
                        background: `${summary?.color ?? '#8884d8'}15`,
                        borderColor: `${summary?.color ?? '#8884d8'}40`,
                      }}
                    >
                      <div className="text-xl font-bold" style={{ color: summary?.color }}>
                        ₹{rec.peak_price.toLocaleString('en-IN')}
                      </div>
                      <p className="text-sm text-gray-600">
                        Peak {rec.crop} Price ({rec.peak_month})
                      </p>
                      <Badge
                        variant="outline"
                        className="text-xs mt-1"
                        style={{ borderColor: summary?.color, color: summary?.color }}
                      >
                        {Math.round(rec.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Profit Analysis ────────────────────────────────────────── */}
        <TabsContent value="profit" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profit Analysis by Crop</CardTitle>
                <CardDescription>
                  Computed from live market prices × real CACP yield data (per acre)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketData?.profit_analysis.map((p) => {
                    const summary = marketData.summaries.find((s) => s.crop === p.crop);
                    return (
                      <div key={p.crop} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium capitalize">{p.crop}</h4>
                          <Badge
                            className="text-white"
                            style={{
                              background: p.roi_pct > 80 ? '#22c55e' : p.roi_pct > 50 ? '#3b82f6' : '#f59e0b',
                            }}
                          >
                            {p.roi_pct}% ROI
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Investment</p>
                            <p className="font-medium">{formatINR(p.investment_per_acre)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Revenue</p>
                            <p className="font-medium">{formatINR(p.revenue_per_acre)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Profit</p>
                            <p className={`font-medium ${p.profit_per_acre >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatINR(p.profit_per_acre)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          Yield: {p.yield_per_acre.toLocaleString()} {p.unit}/acre · at ₹{summary?.current_price.toLocaleString('en-IN')}/{p.unit}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
                <CardDescription>Live revenue contribution by crop (per acre)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenuePieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        dataKey="value"
                      >
                        {revenuePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatINR(Number(value)), 'Revenue/acre']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary — fully dynamic totals */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>Live computed from current market prices</CardDescription>
            </CardHeader>
            <CardContent>
              {marketData && (() => {
                const totalInvest = marketData.profit_analysis.reduce((s, p) => s + p.investment_per_acre, 0);
                const totalRevenue = marketData.profit_analysis.reduce((s, p) => s + p.revenue_per_acre, 0);
                const totalProfit = marketData.profit_analysis.reduce((s, p) => s + p.profit_per_acre, 0);
                const avgROI = marketData.profit_analysis.length
                  ? (marketData.profit_analysis.reduce((s, p) => s + p.roi_pct, 0) / marketData.profit_analysis.length).toFixed(1)
                  : '0';

                return (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Investment', value: formatINR(totalInvest), color: 'blue', bg: 'bg-blue-50', textColor: 'text-blue-600' },
                      { label: 'Total Revenue', value: formatINR(totalRevenue), color: 'green', bg: 'bg-green-50', textColor: 'text-green-600' },
                      { label: 'Net Profit', value: formatINR(totalProfit), color: 'emerald', bg: 'bg-emerald-50', textColor: 'text-emerald-600' },
                      { label: 'Average ROI', value: `${avgROI}%`, color: 'purple', bg: 'bg-purple-50', textColor: 'text-purple-600' },
                    ].map((card, i) => (
                      <div key={i} className={`text-center p-4 ${card.bg} rounded-lg`}>
                        <div className={`text-2xl font-bold ${card.textColor}`}>{card.value}</div>
                        <p className="text-sm text-gray-600">{card.label}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 4: AI Recommendations ─────────────────────────────────────── */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  AI Selling Strategy
                </CardTitle>
                <CardDescription>Data-driven recommendations from ML ensemble model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketData?.recommendations.map((rec, i) => (
                    <RecommendationCard key={i} rec={rec} />
                  ))}
                  {(!marketData?.recommendations || marketData.recommendations.length === 0) && (
                    <p className="text-sm text-gray-400">No recommendations generated.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  Model Refresh Controls
                </CardTitle>
                <CardDescription>Retrain models with latest available market data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketData?.summaries.map((s) => (
                    <div key={s.crop} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{s.display_name} Model</p>
                        <p className="text-xs text-gray-400">
                          {marketData.model_info[s.crop]?.records ?? '—'} training records ·{' '}
                          {marketData.model_info[s.crop]?.xgboost && 'XGBoost '}{marketData.model_info[s.crop]?.prophet && '+ Prophet'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={refreshingCrop === s.crop}
                        onClick={() => handleModelRefresh(s.crop)}
                        className="text-xs gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${refreshingCrop === s.crop ? 'animate-spin' : ''}`} />
                        {refreshingCrop === s.crop ? 'Retraining…' : 'Retrain'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Management — dynamic, derived from model confidence */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Management Insights</CardTitle>
              <CardDescription>Derived from ML model uncertainty and market volatility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {marketData?.summaries.map((s) => {
                  const forecast = marketData.forecast[s.crop] ?? [];
                  if (!forecast.length) return null;
                  const avgConf = forecast.reduce((sum, f) => sum + f.confidence, 0) / forecast.length;
                  const priceRange = forecast[forecast.length - 1]?.upper_bound - forecast[forecast.length - 1]?.lower_bound;
                  const volatilityLevel = priceRange > s.current_price * 0.15 ? 'High' : priceRange > s.current_price * 0.07 ? 'Medium' : 'Low';
                  const bgColor = volatilityLevel === 'High' ? 'bg-red-50 border-red-200' : volatilityLevel === 'Medium' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200';
                  const textColor = volatilityLevel === 'High' ? 'text-red-800' : volatilityLevel === 'Medium' ? 'text-yellow-800' : 'text-green-800';

                  return (
                    <div key={s.crop} className={`p-4 border rounded-lg ${bgColor}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium text-sm ${textColor}`}>{s.display_name}</h4>
                        <Badge variant="outline" className={`text-xs ${textColor}`}>
                          {volatilityLevel} Volatility
                        </Badge>
                      </div>
                      <p className={`text-xs ${textColor} opacity-90`}>
                        Model confidence: {Math.round(avgConf * 100)}%
                      </p>
                      <p className={`text-xs ${textColor} opacity-75 mt-1`}>
                        6-month price range: ₹{forecast[forecast.length - 1]?.lower_bound.toLocaleString('en-IN')} – ₹{forecast[forecast.length - 1]?.upper_bound.toLocaleString('en-IN')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}