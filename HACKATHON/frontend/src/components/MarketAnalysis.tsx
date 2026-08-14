import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  AlertCircle,
  IndianRupee,
  Store,
  CalendarClock,
  ShieldAlert,
  Pencil,
  CheckCircle2,
  PiggyBank,
  ReceiptText,
  Wallet,
  BarChart3,
} from 'lucide-react';
import { fetchMarketPrices, getMandiComparison, getUpcomingFestivals, type CropPriceInfo } from '@/services/marketService';

// ─── Props ────────────────────────────────────────────────────────────────────
interface MarketAnalysisProps {
  /** Farmer's crops from their profile, e.g. ['Rice', 'Coconut', 'Pepper'] */
  primaryCrops?: string[];
  /** Optional state for narrowing mandi search, e.g. 'Kerala' */
  state?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function confidenceLabel(c: CropPriceInfo['forecastConfidence']) {
  if (c === 'high')   return { label: 'High confidence',    color: 'bg-green-100 text-green-800' };
  if (c === 'medium') return { label: 'Seasonal estimate',  color: 'bg-blue-100 text-blue-800'   };
  return               { label: 'Rough estimate',           color: 'bg-orange-100 text-orange-800' };
}

function trendIcon(trend: CropPriceInfo['trend']) {
  if (trend === 'up')   return <TrendingUp  className="w-4 h-4 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500"  />;
  return                       <Minus        className="w-4 h-4 text-gray-400" />;
}

function adviceColor(advice: CropPriceInfo['sellAdvice']) {
  if (advice === 'sell_now') return 'border-blue-300  bg-blue-50';
  if (advice === 'wait_7')   return 'border-amber-300 bg-amber-50';
  return                            'border-green-300 bg-green-50';
}

function adviceEmoji(advice: CropPriceInfo['sellAdvice']) {
  if (advice === 'sell_now') return '💰';
  if (advice === 'wait_7')   return '⏳';
  return '📦';
}

function adviceHeadline(advice: CropPriceInfo['sellAdvice']) {
  if (advice === 'sell_now') return 'Sell now';
  if (advice === 'wait_7')   return 'Wait about 7 days';
  return 'Consider waiting ~14 days';
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function CropCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-28" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-48" />
      </CardContent>
    </Card>
  );
}

// ─── Price Trends Tab ─────────────────────────────────────────────────────────
// Shows current mandi price and where the market stands this month
function PriceTrendsTab({ data }: { data: CropPriceInfo[] }) {
  return (
    <div className="space-y-4">
      {data.map((crop) => (
        <Card key={crop.cropName} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-green-600" />
                {crop.cropName}
              </CardTitle>
              <Badge variant="outline" className="flex items-center gap-1">
                {trendIcon(crop.trend)}
                {crop.priceChange > 0 ? '+' : ''}{crop.priceChange}% this month
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-1 text-sm">
              <Store className="w-3.5 h-3.5" />
              {crop.market} · Season: {crop.lastUpdated}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Price block */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Lowest price</p>
                <p className="text-lg font-semibold text-gray-700">
                  ₹{crop.minPrice.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
                <p className="text-xs text-green-700 font-medium mb-1">Mandi price today</p>
                <p className="text-2xl font-bold text-green-700">
                  ₹{crop.currentPrice.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500">per {crop.unit}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Highest price</p>
                <p className="text-lg font-semibold text-gray-700">
                  ₹{crop.maxPrice.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Plain-language explanation */}
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              {crop.trend === 'up' && (
                <p>📈 Prices for {crop.cropName} have gone <strong>up</strong> compared to last month. The market is buying well right now.</p>
              )}
              {crop.trend === 'down' && (
                <p>📉 Prices for {crop.cropName} have come <strong>down</strong> a little this month. Arrivals at the mandi are higher than demand.</p>
              )}
              {crop.trend === 'stable' && (
                <p>➡️ Prices for {crop.cropName} are <strong>steady</strong> this month. No big changes seen at the mandi.</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Price Forecast Tab ───────────────────────────────────────────────────────
// Shows the sell/wait advisory with 7-day and 14-day projections
function PriceForecastTab({ data }: { data: CropPriceInfo[] }) {
  return (
    <div className="space-y-6">
      {/* Uncertainty disclaimer — shown once at the top */}
      <Alert className="border-amber-300 bg-amber-50">
        <ShieldAlert className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">These are seasonal estimates, not guarantees</AlertTitle>
        <AlertDescription className="text-amber-700 text-sm">
          Prices are based on historical Punjab mandi patterns across harvest and sowing seasons.
          They reflect typical price movements — not today's exact mandi rate.
          Always check your local mandi before making a final selling decision.
        </AlertDescription>
      </Alert>

      {data.map((crop) => {
        const conf = confidenceLabel(crop.forecastConfidence);
        return (
          <Card key={crop.cropName} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-lg">{crop.cropName} – Price Outlook</CardTitle>
                <Badge className={conf.color}>{conf.label}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Three-column price timeline */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 text-center">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Today</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ₹{crop.currentPrice.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">per {crop.unit}</p>
                </div>

                <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-center">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">In 7 days</p>
                  <p className="text-2xl font-bold text-amber-700">
                    ₹{crop.forecast7d.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {crop.forecast7d > crop.currentPrice
                      ? `+₹${(crop.forecast7d - crop.currentPrice).toLocaleString('en-IN')} expected`
                      : crop.forecast7d < crop.currentPrice
                        ? `-₹${(crop.currentPrice - crop.forecast7d).toLocaleString('en-IN')} expected`
                        : 'No change expected'}
                  </p>
                </div>

                <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4 text-center">
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">In 14 days</p>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{crop.forecast14d.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {crop.forecast14d > crop.currentPrice
                      ? `+₹${(crop.forecast14d - crop.currentPrice).toLocaleString('en-IN')} expected`
                      : crop.forecast14d < crop.currentPrice
                        ? `-₹${(crop.currentPrice - crop.forecast14d).toLocaleString('en-IN')} expected`
                        : 'No change expected'}
                  </p>
                </div>
              </div>

              {/* Sell advisory */}
              <div className={`rounded-xl border-2 p-4 ${adviceColor(crop.sellAdvice)}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{adviceEmoji(crop.sellAdvice)}</span>
                  <div>
                    <p className="font-bold text-gray-800 text-base">
                      {adviceHeadline(crop.sellAdvice)}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">{crop.adviceReason}</p>
                    {crop.waitDays > 0 && (
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Make sure storage cost is less than the extra income you will earn by waiting.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Factors considered */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Factors considered in this forecast</p>
                <div className="flex flex-wrap gap-2">
                  {['Historical mandi prices', 'Seasonal patterns', 'Crop arrivals', 'Festival demand', 'Regional production'].map((f) => (
                    <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{f}</span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Profit Analysis Tab ──────────────────────────────────────────────────────
// Farmer inputs actual investment and revenue; profit + ROI calculated live.

interface CropFinancials {
  investment: string;
  revenue: string;
}

const PROFIT_STORAGE_KEY = 'agrismart_profit_data';

function loadProfitData(): Record<string, CropFinancials> {
  try {
    const raw = localStorage.getItem(PROFIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveProfitData(data: Record<string, CropFinancials>) {
  localStorage.setItem(PROFIT_STORAGE_KEY, JSON.stringify(data));
}

function ProfitAnalysisTab({ data }: { data: CropPriceInfo[] }) {
  const [financials, setFinancials] = useState<Record<string, CropFinancials>>(
    () => loadProfitData()
  );
  const [editingCrop, setEditingCrop] = useState<string | null>(
    data.find((c) => !loadProfitData()[c.cropName])?.cropName ?? null
  );

  useEffect(() => { saveProfitData(financials); }, [financials]);

  function get(cropName: string): CropFinancials {
    return financials[cropName] ?? { investment: '', revenue: '' };
  }

  function update(cropName: string, field: keyof CropFinancials, value: string) {
    if (value !== '' && !/^\d+$/.test(value)) return;
    setFinancials((prev) => ({ ...prev, [cropName]: { ...get(cropName), [field]: value } }));
  }

  function hasFilled(cropName: string) {
    const f = get(cropName);
    return f.investment !== '' || f.revenue !== '';
  }

  const totalInv    = data.reduce((s, c) => s + (parseInt(get(c.cropName).investment) || 0), 0);
  const totalRev    = data.reduce((s, c) => s + (parseInt(get(c.cropName).revenue)    || 0), 0);
  const totalProfit = totalRev - totalInv;
  const totalROI    = totalInv > 0 ? (totalProfit / totalInv) * 100 : 0;
  const hasSummary  = data.some((c) => hasFilled(c.cropName));

  return (
    <div className="space-y-4">
      <Alert className="border-blue-200 bg-blue-50">
        <ReceiptText className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Enter your actual numbers</AlertTitle>
        <AlertDescription className="text-blue-700 text-sm">
          Add how much you spent and how much you earned for each crop.
          We will calculate your profit and return on investment (ROI).
        </AlertDescription>
      </Alert>

      {data.map((crop) => {
        const f          = get(crop.cropName);
        const investment = parseInt(f.investment) || 0;
        const revenue    = parseInt(f.revenue)    || 0;
        const profit     = revenue - investment;
        const roi        = investment > 0 ? (profit / investment) * 100 : 0;
        const isEditing  = editingCrop === crop.cropName;
        const filled     = hasFilled(crop.cropName);

        return (
          <Card key={crop.cropName} className={`transition-all ${isEditing ? 'ring-2 ring-green-400' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{crop.cropName}</CardTitle>
                  {filled && !isEditing && (
                    <Badge className={profit >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {profit >= 0 ? '✅ Profit' : '❌ Loss'}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline" size="sm" className="text-xs"
                  onClick={() => setEditingCrop(isEditing ? null : crop.cropName)}
                >
                  {isEditing
                    ? <><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-600" /> Done</>
                    : <><Pencil className="w-3.5 h-3.5 mr-1" /> {filled ? 'Edit' : 'Enter data'}</>
                  }
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {isEditing && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="space-y-1.5">
                    <Label htmlFor={`inv-${crop.cropName}`} className="text-sm font-medium text-gray-700">
                      💸 Total Investment (₹)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                      <Input
                        id={`inv-${crop.cropName}`}
                        placeholder="e.g. 45000"
                        value={f.investment}
                        onChange={(e) => update(crop.cropName, 'investment', e.target.value)}
                        className="pl-7 h-11"
                        inputMode="numeric"
                      />
                    </div>
                    <p className="text-xs text-gray-400">Seeds + fertilizer + labour + other costs</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`rev-${crop.cropName}`} className="text-sm font-medium text-gray-700">
                      💰 Total Revenue Earned (₹)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                      <Input
                        id={`rev-${crop.cropName}`}
                        placeholder="e.g. 84000"
                        value={f.revenue}
                        onChange={(e) => update(crop.cropName, 'revenue', e.target.value)}
                        className="pl-7 h-11"
                        inputMode="numeric"
                      />
                    </div>
                    <p className="text-xs text-gray-400">Total amount received from selling this crop</p>
                  </div>
                </div>
              )}

              {filled && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-blue-50 p-3 text-center">
                    <PiggyBank className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Investment</p>
                    <p className="font-bold text-blue-700 mt-0.5 text-sm">
                      {investment > 0 ? `₹${investment.toLocaleString('en-IN')}` : '—'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-green-50 p-3 text-center">
                    <ReceiptText className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="font-bold text-green-700 mt-0.5 text-sm">
                      {revenue > 0 ? `₹${revenue.toLocaleString('en-IN')}` : '—'}
                    </p>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${profit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <Wallet className={`w-5 h-5 mx-auto mb-1 ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                    <p className="text-xs text-gray-500">Net Profit</p>
                    <p className={`font-bold mt-0.5 text-sm ${profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {investment > 0 && revenue > 0 ? `${profit >= 0 ? '+' : ''}₹${profit.toLocaleString('en-IN')}` : '—'}
                    </p>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${roi >= 0 ? 'bg-purple-50' : 'bg-red-50'}`}>
                    <BarChart3 className={`w-5 h-5 mx-auto mb-1 ${roi >= 0 ? 'text-purple-500' : 'text-red-500'}`} />
                    <p className="text-xs text-gray-500">ROI</p>
                    <p className={`font-bold mt-0.5 text-sm ${roi >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
                      {investment > 0 && revenue > 0 ? `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%` : '—'}
                    </p>
                  </div>
                </div>
              )}

              {filled && investment > 0 && revenue > 0 && (
                <div className={`rounded-xl p-3 text-sm ${
                  profit >= 0
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {profit >= 0
                    ? <>✅ You made a profit of <strong>₹{profit.toLocaleString('en-IN')}</strong> on {crop.cropName}. For every ₹100 invested, you earned back ₹{(100 + roi).toFixed(0)}.</>
                    : <>⚠️ You had a loss of <strong>₹{Math.abs(profit).toLocaleString('en-IN')}</strong> on {crop.cropName}. For every ₹100 invested, you got back ₹{(100 + roi).toFixed(0)}.</>
                  }
                </div>
              )}

              {!filled && !isEditing && (
                <p className="text-sm text-gray-400 text-center py-2">
                  Tap <strong>Enter data</strong> above to add your investment and revenue.
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}

      {hasSummary && (
        <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">📊 Total Season Summary</CardTitle>
            <CardDescription className="text-gray-400 text-xs">Across all your crops</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-xs text-gray-400">Total Invested</p>
                <p className="text-lg font-bold text-blue-300 mt-0.5">₹{totalInv.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Total Revenue</p>
                <p className="text-lg font-bold text-green-300 mt-0.5">₹{totalRev.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Net Profit</p>
                <p className={`text-lg font-bold mt-0.5 ${totalProfit >= 0 ? 'text-emerald-300' : 'text-red-400'}`}>
                  {totalProfit >= 0 ? '+' : ''}₹{totalProfit.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Overall ROI</p>
                <p className={`text-lg font-bold mt-0.5 ${totalROI >= 0 ? 'text-purple-300' : 'text-red-400'}`}>
                  {totalROI >= 0 ? '+' : ''}{totalROI.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Where to Sell Tab ────────────────────────────────────────────────────────
// Compares 5 Punjab mandis: mandi price, transport cost, net you get.
function WhereToSellTab({ data }: { data: CropPriceInfo[] }) {
  const comparisons = getMandiComparison(data);

  return (
    <div className="space-y-5">
      <Alert className="border-blue-200 bg-blue-50">
        <Store className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Which mandi gives you the most money?</AlertTitle>
        <AlertDescription className="text-blue-700 text-sm">
          We compare price and transport cost across 5 Punjab mandis so you know
          exactly where to take your crop.
        </AlertDescription>
      </Alert>

      {comparisons.map((comp) => {
        const best = comp.options.find((o) => o.isBest)!;
        return (
          <Card key={comp.cropName}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-green-600" />
                {comp.cropName}
              </CardTitle>
              <CardDescription className="text-sm">
                Best option: <strong className="text-green-700">{best.name} Mandi</strong>
                {' '}— you get <strong className="text-green-700">₹{best.netRealization.toLocaleString('en-IN')}</strong> per {comp.unit} after transport
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide px-3">
                  <span>Mandi</span>
                  <span className="text-right">Price</span>
                  <span className="text-right">Transport</span>
                  <span className="text-right">You Get</span>
                </div>
                {comp.options.map((opt) => (
                  <div
                    key={opt.name}
                    className={`grid grid-cols-4 gap-2 items-center rounded-xl px-3 py-2.5 text-sm ${
                      opt.isBest
                        ? 'bg-green-50 border-2 border-green-400 font-semibold'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {opt.isBest && <span className="text-green-600">⭐</span>}
                      <span className={opt.isBest ? 'text-green-800' : 'text-gray-700'}>
                        {opt.name}
                      </span>
                    </div>
                    <span className="text-right text-gray-700">₹{opt.price.toLocaleString('en-IN')}</span>
                    <span className="text-right text-red-600">−₹{opt.transportCostPerQ}</span>
                    <span className={`text-right font-bold ${opt.isBest ? 'text-green-700' : 'text-gray-800'}`}>
                      ₹{opt.netRealization.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Transport cost is per {comp.unit}. Distance estimated from Ludhiana area.
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}


// ─── Festival Calendar Tab ───────────────────────────────────────────────────────────────────
// Simple upcoming festivals list with crop price impact.
function FestivalCalendarTab({ farmerCrops }: { farmerCrops: string[] }) {
  const festivals = getUpcomingFestivals(6);
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const impactColor = (i: string) =>
    i === 'high'   ? 'bg-green-100 text-green-800 border-green-300' :
    i === 'medium' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                     'bg-gray-100 text-gray-600 border-gray-300';

  const impactLabel = (i: string) =>
    i === 'high' ? '📈 High impact' : i === 'medium' ? '➡️ Medium' : '➡️ Low';

  return (
    <div className="space-y-4">
      <Alert className="border-purple-200 bg-purple-50">
        <CalendarClock className="h-4 w-4 text-purple-600" />
        <AlertTitle className="text-purple-800">Upcoming festivals &amp; price impact</AlertTitle>
        <AlertDescription className="text-purple-700 text-sm">
          Festivals increase demand for certain crops and push prices up.
          Plan your selling around these dates.
        </AlertDescription>
      </Alert>

      {festivals.map((fest) => {
        // Check if any of the farmer's crops are in this festival
        const relevantCrops = fest.crops.filter((c) =>
          farmerCrops.some((fc) => fc.toLowerCase() === c.toLowerCase())
        );
        const isRelevant = relevantCrops.length > 0;

        return (
          <Card key={fest.name} className={isRelevant ? 'ring-2 ring-purple-300' : ''}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-800 text-base">🎉 {fest.name}</h3>
                    <span className="text-xs text-gray-400">
                      {MONTH_NAMES[(fest as any).month]} {(fest as any).approxDay}
                    </span>
                    {isRelevant && (
                      <Badge className="bg-purple-100 text-purple-800 text-xs">Your crop!</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{fest.reason}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {fest.crops.map((c) => (
                      <span
                        key={c}
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          farmerCrops.some((fc) => fc.toLowerCase() === c.toLowerCase())
                            ? 'bg-purple-100 text-purple-800 border-purple-300 font-semibold'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg border whitespace-nowrap ${impactColor(fest.impact)}`}>
                  {impactLabel(fest.impact)}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <p className="text-xs text-gray-400 text-center">
        Crops highlighted in purple are the ones you grow. Plan to sell just before these festivals for best prices.
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MarketAnalysis({
  primaryCrops = ['Rice', 'Coconut', 'Pepper'],
  state,
}: MarketAnalysisProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['marketPrices', primaryCrops, state],
    queryFn: () => fetchMarketPrices(primaryCrops, state),
    staleTime: 30 * 60 * 1000,   // refetch after 30 minutes
    retry: 2,
  });

  // ── Loading state ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {primaryCrops.map((c) => <CropCardSkeleton key={c} />)}
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <Alert className="border-red-300 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Could not load market prices</AlertTitle>
        <AlertDescription className="text-red-700 text-sm">
          {(error as Error)?.message ?? 'Please check your internet connection and try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  const crops: CropPriceInfo[] = data ?? [];

  return (
    <div className="space-y-6">
      {/* ── Top crop price summary cards (personalised) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {crops.map((crop, i) => {
          const gradients = [
            'from-green-500 to-emerald-600',
            'from-blue-500 to-cyan-600',
            'from-orange-500 to-amber-600',
            'from-purple-500 to-violet-600',
            'from-rose-500 to-pink-600',
          ];
          const gradient = gradients[i % gradients.length];

          return (
            <Card key={crop.cropName} className={`bg-gradient-to-r ${gradient} text-white shadow-md`}>
              <CardHeader className="pb-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  {crop.cropName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{crop.currentPrice.toLocaleString('en-IN')}
                  <span className="text-sm font-normal opacity-80">/{crop.unit}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-sm opacity-90">
                  {trendIcon(crop.trend)}
                  <span>
                    {crop.priceChange > 0 ? '+' : ''}{crop.priceChange}% this month
                  </span>
                </div>
                <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" />
                  {crop.market}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Personalisation notice ── */}
      {primaryCrops.length > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 text-sm">
            Showing prices for <strong>{primaryCrops.join(', ')}</strong> — your crops from your profile.
            Update your profile to change which crops appear here.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Tabs ── */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Price Trends</TabsTrigger>
          <TabsTrigger value="forecast">Price Forecast</TabsTrigger>
          <TabsTrigger value="sell">Where to Sell</TabsTrigger>
          <TabsTrigger value="festivals">Festivals</TabsTrigger>
          <TabsTrigger value="profit">Profit Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends"    className="mt-4"><PriceTrendsTab    data={crops} /></TabsContent>
        <TabsContent value="forecast"  className="mt-4"><PriceForecastTab  data={crops} /></TabsContent>
        <TabsContent value="sell"      className="mt-4"><WhereToSellTab    data={crops} /></TabsContent>
        <TabsContent value="festivals" className="mt-4"><FestivalCalendarTab farmerCrops={primaryCrops} /></TabsContent>
        <TabsContent value="profit"    className="mt-4"><ProfitAnalysisTab  data={crops} /></TabsContent>
      </Tabs>
    </div>
  );
}