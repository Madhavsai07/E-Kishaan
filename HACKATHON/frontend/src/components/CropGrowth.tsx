import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sprout, Leaf, Wheat as WheatIcon, Calendar, Droplets, Bug, AlertCircle, TrendingUp, Award } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

// Growth stage thresholds (days from planting) and the display progress %
// associated with reaching each stage. Used to derive currentStage,
// progress, and daysFromPlanting dynamically from plantedDate.
const growthStages = [
  { stage: 'Germination', day: 0, progress: 0 },
  { stage: 'Seedling', day: 15, progress: 15 },
  { stage: 'Vegetative', day: 45, progress: 35 },
  { stage: 'Flowering', day: 75, progress: 65 },
  { stage: 'Grain Filling', day: 95, progress: 85 },
  { stage: 'Maturity', day: 120, progress: 100 }
];

// Base crop info for Punjab. plantedDate drives everything else
// (currentStage, progress, daysFromPlanting) dynamically, computed live
// from the current date rather than hardcoded.
interface CropBase {
  id: number;
  name: string;
  variety: string;
  plantedDate: string; // ISO date
  expectedHarvest: string;
  health: string;
  area: string;
  color: string; // chart line color
  cycleMonths: number; // approx months from planting to harvest, used for forecast shape
  peakYield: number; // quintals/acre at harvest peak
  confidence: number; // 0-100, model confidence in the forecast
}

const cropBaseData: CropBase[] = [
  {
    id: 1,
    name: 'Wheat',
    variety: 'HD-2967',
    plantedDate: '2026-04-15',
    expectedHarvest: '2026-09-15',
    health: 'Excellent',
    area: '5.0 acres',
    color: '#d97706',
    cycleMonths: 5,
    peakYield: 48,
    confidence: 95
  },
  {
    id: 2,
    name: 'Rice',
    variety: 'Pusa Basmati 1121',
    plantedDate: '2026-05-01',
    expectedHarvest: '2026-10-25',
    health: 'Good',
    area: '3.5 acres',
    color: '#16a34a',
    cycleMonths: 6,
    peakYield: 34,
    confidence: 92
  },
  {
    id: 3,
    name: 'Cotton',
    variety: 'BT Cotton (RCH-2)',
    plantedDate: '2026-06-10',
    expectedHarvest: '2026-11-15',
    health: 'Fair',
    area: '2.0 acres',
    color: '#0ea5e9',
    cycleMonths: 6,
    peakYield: 8.2,
    confidence: 88
  },
  {
    id: 4,
    name: 'Sugarcane',
    variety: 'CoJ 85',
    plantedDate: '2026-01-01',
    expectedHarvest: '2027-01-01',
    health: 'Good',
    area: '4.0 acres',
    color: '#a855f7',
    cycleMonths: 12,
    peakYield: 350,
    confidence: 96
  }
];

// Derives daysFromPlanting, currentStage, and progress live from today's
// date and the crop's plantedDate. This is what makes growth "dynamic".
function computeGrowth(plantedDate: string) {
  const planted = new Date(plantedDate);
  const today = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysFromPlanting = Math.max(
    0,
    Math.floor((today.getTime() - planted.getTime()) / msPerDay)
  );

  let currentStage = growthStages[0].stage;
  let progress = growthStages[0].progress;
  for (const stage of growthStages) {
    if (daysFromPlanting >= stage.day) {
      currentStage = stage.stage;
      progress = stage.progress;
    }
  }

  return { daysFromPlanting, currentStage, progress };
}

// Forward-looking monthly forecast window: Jan 2026 through Jun 2027 (18 months).
// Fixed window per the team's request, not tied to "today" — always shows
// this specific planning horizon so farmers can compare crops for the
// upcoming planting season regardless of when the app is opened.
const FORECAST_START = { year: 2026, month: 0 }; // Jan 2026
const FORECAST_MONTHS = 18; // through Jun 2027

function buildForecastMonths(): { key: string; label: string }[] {
  const months: { key: string; label: string }[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 0; i < FORECAST_MONTHS; i++) {
    const totalMonth = FORECAST_START.month + i;
    const year = FORECAST_START.year + Math.floor(totalMonth / 12);
    const month = totalMonth % 12;
    months.push({ key: `${year}-${String(month + 1).padStart(2, '0')}`, label: `${monthNames[month]} ${year}` });
  }
  return months;
}

// Projects a monthly yield curve for a crop across the forecast window.
// Each planting cycle ramps from 0 -> peakYield over cycleMonths, holds
// briefly at harvest, then drops back to 0 until the next cycle starts.
function projectCropYield(crop: CropBase, months: { key: string; label: string }[]) {
  const planted = new Date(crop.plantedDate);
  const cycleLenMonths = crop.cycleMonths;

  return months.map((m) => {
    const [y, mo] = m.key.split('-').map(Number);
    const pointDate = new Date(y, mo - 1, 1);

    const monthsSincePlanting =
      (pointDate.getFullYear() - planted.getFullYear()) * 12 +
      (pointDate.getMonth() - planted.getMonth());

    // Position within the current growth cycle (wraps for multi-cycle crops
    // like Wheat/Rice/Cotton that could be replanted after harvest).
    const posInCycle = ((monthsSincePlanting % cycleLenMonths) + cycleLenMonths) % cycleLenMonths;

    let projectedYield = 0;
    if (monthsSincePlanting >= 0) {
      // Simple ramp-up to peak at harvest (last month of cycle), then reset.
      const growthFraction = (posInCycle + 1) / cycleLenMonths;
      projectedYield = Math.round(crop.peakYield * growthFraction * 100) / 100;
    }

    return { month: m.label, [crop.name]: projectedYield };
  });
}

export default function CropGrowth() {
  const [selectedCropId, setSelectedCropId] = useState(cropBaseData[0].id);

  // Merge base data with live-computed growth fields on every render, so
  // the growth timeline advances automatically as real time passes.
  const cropData = cropBaseData.map((crop) => ({
    ...crop,
    ...computeGrowth(crop.plantedDate)
  }));

  const selectedCrop = cropData.find((c) => c.id === selectedCropId) ?? cropData[0];

  const forecastMonths = useMemo(() => buildForecastMonths(), []);

  // Combined forecast dataset: one row per month, one column per crop, for
  // the multi-line comparison chart.
  const forecastChartData = useMemo(() => {
    const perCropSeries = cropBaseData.map((crop) => projectCropYield(crop, forecastMonths));
    return forecastMonths.map((m, i) => {
      const row: Record<string, string | number> = { month: m.label };
      perCropSeries.forEach((series) => {
        Object.assign(row, series[i]);
      });
      return row;
    });
  }, [forecastMonths]);

  // Recommendation: rank crops by projected peak yield weighted by model
  // confidence, so a high-yield-but-low-confidence crop doesn't win over a
  // slightly lower but much more reliable one.
  const recommendation = useMemo(() => {
    const scored = cropBaseData.map((crop) => ({
      crop,
      score: crop.peakYield * (crop.confidence / 100)
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored[0];
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Excellent': return 'bg-green-500';
      case 'Good': return 'bg-blue-500';
      case 'Fair': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'Germination': return <Sprout className="w-4 h-4" />;
      case 'Seedling': return <Sprout className="w-4 h-4" />;
      case 'Vegetative': return <Leaf className="w-4 h-4" />;
      case 'Flowering': return <Leaf className="w-4 h-4" />;
      case 'Grain Filling': return <WheatIcon className="w-4 h-4" />;
      case 'Maturity': return <WheatIcon className="w-4 h-4" />;
      default: return <Sprout className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Crop Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cropData.map((crop) => (
          <Card
            key={crop.id}
            className={`cursor-pointer transition-all ${selectedCrop.id === crop.id ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => setSelectedCropId(crop.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                {crop.name}
                <Badge className={`${getHealthColor(crop.health)} text-white`}>
                  {crop.health}
                </Badge>
              </CardTitle>
              <CardDescription>{crop.variety} • {crop.area}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{crop.progress}%</span>
                </div>
                <Progress value={crop.progress} className="h-2" />
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {getStageIcon(crop.currentStage)}
                  {crop.currentStage}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Crop Information */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Growth Timeline</TabsTrigger>
          <TabsTrigger value="predictions">Yield Forecast</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="calendar">Care Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {selectedCrop.name} Growth Timeline
              </CardTitle>
              <CardDescription>
                Planted on {new Date(selectedCrop.plantedDate).toLocaleDateString()} •
                Day {selectedCrop.daysFromPlanting} of growth cycle (updates automatically)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {growthStages.map((stage, index) => {
                  const isCompleted = selectedCrop.daysFromPlanting >= stage.day;
                  const isCurrent = selectedCrop.currentStage === stage.stage;

                  return (
                    <div key={index} className={`flex items-center gap-4 p-3 rounded-lg ${isCurrent ? 'bg-green-50 border border-green-200' :
                        isCompleted ? 'bg-gray-50' : 'bg-white border border-gray-200'
                      }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCurrent ? 'bg-green-500 text-white' :
                          isCompleted ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-500'
                        }`}>
                        {getStageIcon(stage.stage)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{stage.stage}</h4>
                        <p className="text-sm text-gray-600">Day {stage.day}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{stage.progress}%</div>
                        {isCurrent && <Badge variant="secondary">Current</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          {/* Recommended crop banner */}
          <Card className="border-green-300 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-green-700">Recommended crop to plant next, based on forecasted yield & confidence</p>
                  <p className="text-xl font-bold text-green-800">
                    {recommendation.crop.name} — {recommendation.crop.peakYield} quintals/acre projected, {recommendation.crop.confidence}% confidence
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Punjab Yield Forecast — Jan 2026 to Jun 2027
              </CardTitle>
              <CardDescription>Projected monthly yield (quintals/acre) across all tracked crops, for planting-decision comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" interval={1} angle={-30} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {cropBaseData.map((crop) => (
                      <Line
                        key={crop.name}
                        type="monotone"
                        dataKey={crop.name}
                        stroke={crop.color}
                        strokeWidth={selectedCrop.name === crop.name ? 3 : 1.5}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {cropBaseData.map((crop) => (
                  <div key={crop.id} className="text-center p-4 rounded-lg" style={{ backgroundColor: `${crop.color}1a` }}>
                    <div className="text-xl font-bold" style={{ color: crop.color }}>{crop.peakYield}</div>
                    <p className="text-sm text-gray-600">{crop.name} peak (qtl/acre)</p>
                    <p className="text-xs text-gray-500 mt-1">{crop.confidence}% confidence</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  Irrigation Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Increase watering frequency during flowering stage. Apply 2-3 inches of water twice weekly.
                    </AlertDescription>
                  </Alert>
                  <ul className="space-y-1 text-sm">
                    <li>• Monitor soil moisture daily</li>
                    <li>• Avoid waterlogging during grain filling</li>
                    <li>• Reduce irrigation 2 weeks before harvest</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="w-5 h-5 text-red-500" />
                  Pest & Disease Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      High humidity increases blast/rust disease risk. Apply preventive fungicide spray.
                    </AlertDescription>
                  </Alert>
                  <ul className="space-y-1 text-sm">
                    <li>• Weekly inspection for aphids and whitefly</li>
                    <li>• Use pheromone traps for pink bollworm (cotton)</li>
                    <li>• Apply neem oil for organic pest control</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Nutrient Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800">Nitrogen</h4>
                  <p className="text-sm text-blue-600 mt-1">Apply 40kg/acre during tillering stage</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800">Phosphorus</h4>
                  <p className="text-sm text-green-600 mt-1">Apply 20kg/acre at planting</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800">Potassium</h4>
                  <p className="text-sm text-orange-600 mt-1">Apply 20kg/acre during panicle initiation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Care Activities</CardTitle>
              <CardDescription>Scheduled activities for optimal crop management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <h4 className="font-medium">Fertilizer Application</h4>
                    <p className="text-sm text-gray-600">Apply potassium fertilizer during panicle initiation</p>
                  </div>
                  <Badge variant="outline">Tomorrow</Badge>
                </div>

                <div className="flex items-center gap-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <h4 className="font-medium">Pest Inspection</h4>
                    <p className="text-sm text-gray-600">Weekly check for aphids and pink bollworm</p>
                  </div>
                  <Badge variant="outline">In 3 days</Badge>
                </div>

                <div className="flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <h4 className="font-medium">Irrigation Schedule</h4>
                    <p className="text-sm text-gray-600">Deep watering session - 2-3 inches</p>
                  </div>
                  <Badge variant="outline">In 5 days</Badge>
                </div>

                <div className="flex items-center gap-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <h4 className="font-medium">Harvest Preparation</h4>
                    <p className="text-sm text-gray-600">Prepare harvesting equipment and storage</p>
                  </div>
                  <Badge variant="outline">In 2 weeks</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
