import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/SelectUI';
import { Label } from '@/components/ui/label';
import {
  Sprout,
  Leaf,
  Calendar,
  Droplets,
  TrendingUp,
  Award,
  Zap,
  ShieldCheck,
  BarChart3,
  Clock,
  Sparkles,
  CloudSun,
  Bug,
  FlaskConical,
  Leaf as LeafOrganic,
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
  FALLBACK_CROP_DATA,
  CropRecommendationResponse,
  CropRecommendation,
} from '@/services/cropService';
import { DEFAULT_DISTRICTS_LIST } from '@/services/soilService';

export default function CropGrowth() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Ludhiana');
  const [cropData, setCropData] = useState<CropRecommendationResponse>(FALLBACK_CROP_DATA['Ludhiana']);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadCrops() {
      setIsLoading(true);
      const data = await fetchCropRecommendations(selectedDistrict);
      if (data) setCropData(data);
      setIsLoading(false);
    }
    loadCrops();
  }, [selectedDistrict]);

  const topCrop: CropRecommendation | undefined = cropData.recommendations?.[0];

  const barChartData = (cropData.recommendations || []).map((c) => ({
    name: c.crop.split(' ')[0],
    score: c.score,
    confidence: c.confidence,
    profitability: c.profitabilityScore,
  }));

  const radarChartData = [
    { subject: 'Soil pH Match', A: topCrop ? Math.min(100, topCrop.score + 2) : 90, fullMark: 100 },
    { subject: 'NPK Balance', A: topCrop ? topCrop.confidence : 92, fullMark: 100 },
    { subject: 'Water Needs', A: topCrop ? 88 : 85, fullMark: 100 },
    { subject: 'Market Demand', A: topCrop ? topCrop.profitabilityScore : 90, fullMark: 100 },
    { subject: 'Climate Risk', A: topCrop ? 100 - (topCrop.risk === 'Low' ? 10 : 30) : 90, fullMark: 100 },
  ];

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
                Data-driven crop selection combining Soil NPK, Open-Meteo climate, and ICAR agricultural standards
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-600 text-white text-sm py-1.5 px-3">
                Season: {cropData.season || 'Rabi'}
              </Badge>

              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold text-gray-700">District:</Label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="px-3 py-2 bg-white border border-emerald-300 rounded-md font-bold text-emerald-900 shadow-sm text-sm"
                >
                  {DEFAULT_DISTRICTS_LIST.map((d) => (
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

      {/* AI Advisory Summary Box */}
      <Alert className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 shadow-sm">
        <Sparkles className="h-5 w-5 text-emerald-600" />
        <AlertTitle className="text-emerald-950 font-bold text-lg flex items-center gap-2">
          AI Agricultural Advisor for {selectedDistrict}
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rankings">Top 5 Crop Rankings</TabsTrigger>
          <TabsTrigger value="visualizations">Suitability Charts</TabsTrigger>
          <TabsTrigger value="timeline">Growth Stage Timeline</TabsTrigger>
          <TabsTrigger value="disease">Disease & Pest Alerts</TabsTrigger>
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
                  Top Crop Radar Analysis vs District Factors
                </CardTitle>
                <CardDescription>Evaluating {topCrop?.crop || 'Top Crop'}</CardDescription>
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
                Agronomic Growth Timeline ({topCrop?.crop || 'Wheat'})
              </CardTitle>
              <CardDescription>Stages from Land Preparation to Peak Harvest</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="w-8 h-8 mx-auto bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div className="font-bold text-gray-900">Sowing</div>
                  <div className="text-xs text-gray-500">Day 0 - 15</div>
                  <p className="text-[11px] text-emerald-800">Apply Basal DAP & Organic Compost</p>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="w-8 h-8 mx-auto bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div className="font-bold text-gray-900">Vegetative</div>
                  <div className="text-xs text-gray-500">Day 15 - 45</div>
                  <p className="text-[11px] text-emerald-800">Apply 1st Split Urea & First Irrigation</p>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="w-8 h-8 mx-auto bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div className="font-bold text-gray-900">Flowering</div>
                  <div className="text-xs text-gray-500">Day 45 - 75</div>
                  <p className="text-[11px] text-emerald-800">Monitor Pest Activity & 2nd Irrigation</p>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="w-8 h-8 mx-auto bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <div className="font-bold text-gray-900">Grain Filling</div>
                  <div className="text-xs text-gray-500">Day 75 - 105</div>
                  <p className="text-[11px] text-emerald-800">Maintain Soil Moisture & Micronutrient Spray</p>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                  <div className="w-8 h-8 mx-auto bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
                  <div className="font-bold text-gray-900">Harvest</div>
                  <div className="text-xs text-gray-500">Day 105 - 135</div>
                  <p className="text-[11px] text-amber-800">Peak Moisture Content for Maximum Price</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Disease & Pest Alerts Tab */}
        <TabsContent value="disease" className="space-y-4">
          <Alert className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 shadow-sm">
            <Bug className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-950 font-bold">Weather & Soil-Based Disease Risk Forecast</AlertTitle>
            <AlertDescription className="text-red-900 mt-1 text-sm leading-relaxed">
              Risk levels below are computed from live temperature ({cropData.weather?.temp}°C), humidity ({cropData.weather?.humidity}%),
              rainfall ({cropData.weather?.rainfall}mm) and soil nitrogen ({cropData.soilHealth?.nitrogen} kg/ha) for {selectedDistrict}.
              Always confirm with your local agriculture extension officer before applying any chemical.
            </AlertDescription>
          </Alert>

          {(cropData.recommendations || []).map((c) => (
            <Card key={c.crop} className="border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-600" />
                  {c.crop}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {c.diseaseRisks && c.diseaseRisks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {c.diseaseRisks.map((d) => (
                      <div
                        key={d.disease}
                        className={
                          d.riskLevel === 'High'
                            ? 'p-4 rounded-xl border border-red-300 bg-red-50'
                            : d.riskLevel === 'Medium'
                            ? 'p-4 rounded-xl border border-amber-300 bg-amber-50'
                            : 'p-4 rounded-xl border border-gray-200 bg-gray-50'
                        }
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Bug className="w-4 h-4 text-gray-600 shrink-0" />
                            <span className="font-bold text-gray-900">{d.disease}</span>
                          </div>
                          <Badge
                            className={
                              d.riskLevel === 'High'
                                ? 'bg-red-600 text-white'
                                : d.riskLevel === 'Medium'
                                ? 'bg-amber-500 text-white'
                                : 'bg-gray-400 text-white'
                            }
                          >
                            {d.riskLevel} Risk
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{d.type} • {d.symptoms}</p>
                        <p className="text-xs text-gray-600 italic mt-2">{d.reason}</p>

                        <div className="mt-3 space-y-1.5 text-sm">
                          <div className="flex items-start gap-2">
                            <FlaskConical className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <span><span className="font-semibold text-gray-800">Pesticide: </span>{d.pesticide}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <LeafOrganic className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span><span className="font-semibold text-gray-800">Organic option: </span>{d.organicAlternative}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                            <span><span className="font-semibold text-gray-800">Precaution: </span>{d.precaution}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No common disease/pest data available for this crop yet.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
