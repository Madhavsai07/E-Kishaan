import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { fetchMarketPrices, type CropPriceInfo } from '@/services/marketService';

// ─── Props ────────────────────────────────────────────────────────────────────
interface MarketAnalysisProps {
  /** Farmer's crops from their profile, e.g. ['Rice', 'Coconut', 'Pepper'] */
  primaryCrops?: string[];
  /** Optional state for narrowing mandi search, e.g. 'Kerala' */
  state?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function confidenceLabel(c: CropPriceInfo['forecastConfidence']) {
  if (c === 'high')   return { label: 'High confidence',   color: 'bg-green-100 text-green-800' };
  if (c === 'medium') return { label: 'Medium confidence', color: 'bg-yellow-100 text-yellow-800' };
  return               { label: 'Estimate only',           color: 'bg-orange-100 text-orange-800' };
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
              {crop.market}, {crop.district} · Updated: {crop.lastUpdated}
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
        <AlertTitle className="text-amber-800">Important: These are estimates, not guarantees</AlertTitle>
        <AlertDescription className="text-amber-700 text-sm">
          Price forecasts are based on seasonal patterns and historical mandi data. Actual prices depend
          on weather, arrivals, festivals, and other market factors. Always check your local mandi before
          making a final decision.
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
// Kept from original but now uses live prices
function ProfitAnalysisTab({ data }: { data: CropPriceInfo[] }) {
  return (
    <div className="space-y-4">
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Based on current mandi prices</AlertTitle>
        <AlertDescription className="text-blue-700 text-sm">
          Enter your actual investment and expected yield in your profile to get personalised profit calculations.
        </AlertDescription>
      </Alert>

      {data.map((crop) => {
        // Simple per-acre estimate for illustration (assumes 1 acre)
        const yieldPerAcre: Record<string, number> = {
          quintal: 20,
          kg: 1000,
          piece: 2000,
        };
        const estYield = yieldPerAcre[crop.unit] ?? 20;
        const estRevenue = crop.currentPrice * estYield;

        return (
          <Card key={crop.cropName}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{crop.cropName}</CardTitle>
              <CardDescription>Estimated for 1 acre at today's mandi price</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                  <p className="text-xs text-gray-500">Today's price</p>
                  <p className="font-bold text-blue-700 mt-1">₹{crop.currentPrice.toLocaleString('en-IN')}/{crop.unit}</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <p className="text-xs text-gray-500">Est. yield / acre</p>
                  <p className="font-bold text-green-700 mt-1">{estYield.toLocaleString('en-IN')} {crop.unit}</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3 text-center">
                  <p className="text-xs text-gray-500">Est. revenue / acre</p>
                  <p className="font-bold text-emerald-700 mt-1">₹{estRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-3 text-center">
                  <p className="text-xs text-gray-500">14-day outlook</p>
                  <p className={`font-bold mt-1 ${crop.forecast14d >= crop.currentPrice ? 'text-green-600' : 'text-red-600'}`}>
                    {crop.forecast14d >= crop.currentPrice ? '▲' : '▼'} ₹{Math.abs(crop.forecast14d - crop.currentPrice).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Price Trends</TabsTrigger>
          <TabsTrigger value="forecast">Price Forecast</TabsTrigger>
          <TabsTrigger value="profit">Profit Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends"   className="mt-4"><PriceTrendsTab   data={crops} /></TabsContent>
        <TabsContent value="forecast" className="mt-4"><PriceForecastTab data={crops} /></TabsContent>
        <TabsContent value="profit"   className="mt-4"><ProfitAnalysisTab data={crops} /></TabsContent>
      </Tabs>
    </div>
  );
}