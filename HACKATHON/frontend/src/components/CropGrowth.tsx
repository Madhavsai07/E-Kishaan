import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Sprout,
  Droplets,
  Award,
  ShieldCheck,
  BarChart3,
  Clock,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

import {
  fetchCropRecommendations,
  type CropRecommendationResponse,
  type CropRecommendation,
} from '@/services/cropService';
import { fetchDistricts, type DistrictSummary } from '@/services/soilService';

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 bg-gray-200 rounded-xl" />
      <div className="h-24 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-56 bg-gray-200 rounded-xl" />)}
      </div>
    </div>
  );
}

export default function CropGrowth() {
  const [districts, setDistricts] = useState<DistrictSummary[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Ludhiana');
  const [cropData, setCropData] = useState<CropRecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDistricts().then(setDistricts).catch(() => setDistricts([]));
  }, []);

  const loadCrops = useCallback(async (district: string) => {
    setIsLoading(true);
    setError(null);
    const data = await fetchCropRecommendations(district);
    if (data) {
      setCropData(data);
    } else {
      setError(`Could not reach the AI crop recommendation engine for ${district}. It combines live soil data with real-time weather, so no results are shown until it responds.`);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCrops(selectedDistrict);
  }, [selectedDistrict, loadCrops]);

  const topCrop: CropRecommendation | undefined = cropData?.recommendations?.[0];

  const barChartData = (cropData?.recommendations || []).map((c) => ({
    name: c.crop.split(' ')[0],
    score: c.score,
    confidence: c.confidence,
    profitability: c.profitabilityScore,
  }));

  const radarChartData = topCrop
    ? [
        { subject: 'Soil Match', A: topCrop.factors.soilMatch, fullMark: 100 },
        { subject: 'Nutrient Balance', A: topCrop.factors.nutrientBalance, fullMark: 100 },
        { subject: 'Climate Suitability', A: topCrop.factors.climateSuitability, fullMark: 100 },
        { subject: 'Seasonal Fit', A: topCrop.factors.seasonalFit, fullMark: 100 },
        { subject: 'Market Potential', A: topCrop.factors.marketPotential, fullMark: 100 },
      ]
    : [];

  if (isLoading && !cropData) {
    return <LoadingSkeleton />;
  }

  if (error && !cropData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Crop Recommendation Engine Unavailable</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{error}</p>
          <Button size="sm" variant="outline" onClick={() => loadCrops(selectedDistrict)} className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!cropData) return null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="shadow-sm border-emerald-100 bg-gradient-to-r from-emerald-50/50 via-white to-green-50/40">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sprout className="w-7 h-7 text-emerald-600" />
                <CardTitle className="text-2xl font-bold text-gray-900">
                  AI Crop Recommendation & Agronomic Advisory
                </CardTitle>
              </div>
              <CardDescription className="text-gray-600 mt-1">
                Data-driven crop selection combining live Soil NPK, real-time Open-Meteo climate, and ICAR agricultural standards
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-600 text-white text-sm py-1.5 px-3">
                Season: {cropData.season}
              </Badge>

              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold text-gray-700">District:</Label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={isLoading}
                  className="px-3 py-2 bg-white border border-emerald-300 rounded-md font-bold text-emerald-900 shadow-sm text-sm disabled:opacity-60"
                >
                  {districts.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Showing the last successful result for {selectedDistrict} — {error}</AlertDescription>
        </Alert>
      )}

      {/* AI Advisory Summary Box */}
      <Alert className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 shadow-sm">
        <Sparkles className="h-5 w-5 text-emerald-600" />
        <AlertTitle className="text-emerald-950 font-bold text-lg flex items-center gap-2">
          AI Agricultural Advisor for {cropData.district}
        </AlertTitle>
        <AlertDescription className="text-emerald-900 mt-1 text-base leading-relaxed font-medium">
          {cropData.aiAdvisory}
        </AlertDescription>
      </Alert>

      {/* Top Crop Hero Card */}
      {topCrop && (
        <Card className="border-2 border-emerald-500 shadow-md bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-400" />
                  <span className="text-emerald-200 text-sm font-semibold uppercase tracking-wider">
                    #1 Top Recommended Crop
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold text-white">{topCrop.crop}</h2>
                <p className="text-emerald-100 text-sm">
                  {topCrop.category} • Expected Yield: <span className="font-bold text-amber-300">{topCrop.expectedYield}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="text-center bg-emerald-950/60 p-3 rounded-xl border border-emerald-700/50">
                  <div className="text-xs text-emerald-300">Suitability Score</div>
                  <div className="text-3xl font-bold text-amber-400">{topCrop.score} / 100</div>
                  <Badge className="mt-1 bg-emerald-600">{topCrop.status}</Badge>
                </div>

                <div className="text-center bg-emerald-950/60 p-3 rounded-xl border border-emerald-700/50">
                  <div className="text-xs text-emerald-300">Confidence Index</div>
                  <div className="text-3xl font-bold text-emerald-300">{topCrop.confidence}%</div>
                  <div className="text-[11px] text-emerald-200 mt-1">AI Verified</div>
                </div>

                <div className="text-center bg-emerald-950/60 p-3 rounded-xl border border-emerald-700/50">
                  <div className="text-xs text-emerald-300">Expected Market Price</div>
                  <div className="text-2xl font-bold text-white">{topCrop.expectedPrice}</div>
                  <div className="text-[11px] text-emerald-200 mt-1">Demand: {topCrop.marketDemand}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="rankings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rankings">Top 5 Crop Rankings</TabsTrigger>
          <TabsTrigger value="visualizations">Suitability Charts</TabsTrigger>
          <TabsTrigger value="timeline">Growth Stage Timeline</TabsTrigger>
        </TabsList>

        {/* Rankings Tab */}
        <TabsContent value="rankings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(cropData.recommendations || []).map((c, idx) => (
              <Card key={c.crop} className="border-green-100 hover:border-emerald-400 transition-all shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-emerald-500 text-emerald-700 font-bold">
                      #{idx + 1} {c.category}
                    </Badge>
                    <Badge className={c.score >= 85 ? 'bg-emerald-600' : 'bg-teal-600'}>{c.score} pts</Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mt-2">{c.crop}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-1 border-b">
                    <span className="text-gray-500">Expected Yield</span>
                    <span className="font-semibold text-gray-900">{c.expectedYield}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b">
                    <span className="text-gray-500">Water Requirement</span>
                    <span className="font-semibold text-blue-600">{c.waterRequirement}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b">
                    <span className="text-gray-500">Fertilizer Dose</span>
                    <span className="font-semibold text-emerald-800 text-xs">{c.fertilizer}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b">
                    <span className="text-gray-500">Market Price Trend</span>
                    <span className="font-bold text-amber-700">{c.expectedPrice}</span>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-500">Risk Profile</span>
                    <Badge className={c.risk === 'Low' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                      {c.risk} Risk
                    </Badge>
                  </div>

                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>AI Model Confidence</span>
                      <span className="font-bold text-gray-800">{c.confidence}%</span>
                    </div>
                    <Progress value={c.confidence} className="h-1.5 bg-gray-200" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Visualizations Tab */}
        <TabsContent value="visualizations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  Crop Suitability Scores Comparison (0-100)
                </CardTitle>
                <CardDescription>Multi-factor score ranking for {selectedDistrict}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" fill="#059669" name="Suitability Score" />
                      <Bar dataKey="profitability" fill="#d97706" name="Profitability Index" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  Top Crop Factor Analysis (Live Computed)
                </CardTitle>
                <CardDescription>Real agronomic sub-scores for {topCrop?.crop || 'the top crop'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarChartData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name={topCrop?.crop || 'Crop'} dataKey="A" stroke="#059669" fill="#10b981" fillOpacity={0.5} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Growth Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Agronomic Growth Timeline ({topCrop?.crop || 'Top Crop'})
              </CardTitle>
              <CardDescription>
                Stages sized from {topCrop?.crop || 'this crop'}'s actual {topCrop?.growingDays ?? '–'}-day growing cycle, with dosing computed from this district's live soil nutrients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-center">
                {(topCrop?.growthStages || []).map((stage) => (
                  <div
                    key={stage.stage}
                    className={`p-4 border rounded-xl space-y-2 ${
                      stage.stage === topCrop?.growthStages.length
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 mx-auto text-white rounded-full flex items-center justify-center font-bold ${
                        stage.stage === topCrop?.growthStages.length ? 'bg-amber-600' : 'bg-emerald-600'
                      }`}
                    >
                      {stage.stage}
                    </div>
                    <div className="font-bold text-gray-900">{stage.name}</div>
                    <div className="text-xs text-gray-500">Day {stage.dayStart} - {stage.dayEnd}</div>
                    <p className={`text-[11px] ${stage.stage === topCrop?.growthStages.length ? 'text-amber-800' : 'text-emerald-800'}`}>
                      {stage.advice}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-blue-50/50">
            <CardContent className="p-4 flex items-start gap-3">
              <Droplets className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">
                Total seasonal water requirement for {topCrop?.crop}: <span className="font-bold">{topCrop?.waterRequirement}</span> over {topCrop?.growingDays} days — irrigation scheduling above is derived from this figure, not a fixed template.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
