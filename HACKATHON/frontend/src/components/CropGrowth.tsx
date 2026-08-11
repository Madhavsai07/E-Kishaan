import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sprout, Leaf, Wheat as WheatIcon, Calendar, Droplets, Bug, AlertCircle } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// STATIC crop data for Punjab. daysFromPlanting is a fixed value (not derived
// from new Date()), so the timeline no longer shifts every time the page loads.
const cropData = [
  {
    id: 1,
    name: 'Wheat',
    variety: 'HD-2967',
    plantedDate: '2023-11-05',
    expectedHarvest: '2024-04-15',
    currentStage: 'Maturity',
    progress: 100,
    health: 'Excellent',
    area: '5.0 acres',
    daysFromPlanting: 160
  },
  {
    id: 2,
    name: 'Rice',
    variety: 'Pusa Basmati 1121',
    plantedDate: '2024-06-10',
    expectedHarvest: '2024-10-25',
    currentStage: 'Grain Filling',
    progress: 85,
    health: 'Good',
    area: '3.5 acres',
    daysFromPlanting: 105
  },
  {
    id: 3,
    name: 'Cotton',
    variety: 'BT Cotton (RCH-2)',
    plantedDate: '2024-05-01',
    expectedHarvest: '2024-11-15',
    currentStage: 'Flowering',
    progress: 65,
    health: 'Fair',
    area: '2.0 acres',
    daysFromPlanting: 95
  },
  {
    id: 4,
    name: 'Sugarcane',
    variety: 'CoJ 85',
    plantedDate: '2023-03-01',
    expectedHarvest: '2024-03-01',
    currentStage: 'Maturity',
    progress: 100,
    health: 'Good',
    area: '4.0 acres',
    daysFromPlanting: 365
  }
];

const growthStages = [
  { stage: 'Germination', day: 0, progress: 0 },
  { stage: 'Seedling', day: 15, progress: 15 },
  { stage: 'Vegetative', day: 45, progress: 35 },
  { stage: 'Flowering', day: 75, progress: 65 },
  { stage: 'Grain Filling', day: 95, progress: 85 },
  { stage: 'Maturity', day: 120, progress: 100 }
];

// STATIC yearly yield data (quintals/acre) for Punjab crops, replacing the
// old month-by-month "predicted vs actual" chart that had null placeholders
// for future months. All values here are fixed and pre-recorded.
const yearlyYieldData: Record<string, { year: string; yield: number }[]> = {
  Wheat: [
    { year: '2020', yield: 42 },
    { year: '2021', yield: 44 },
    { year: '2022', yield: 41 },
    { year: '2023', yield: 46 },
    { year: '2024', yield: 48 }
  ],
  Rice: [
    { year: '2020', yield: 29 },
    { year: '2021', yield: 31 },
    { year: '2022', yield: 30 },
    { year: '2023', yield: 33 },
    { year: '2024', yield: 34 }
  ],
  Cotton: [
    { year: '2020', yield: 7.5 },
    { year: '2021', yield: 6.8 },
    { year: '2022', yield: 7.1 },
    { year: '2023', yield: 7.9 },
    { year: '2024', yield: 8.2 }
  ],
  Sugarcane: [
    { year: '2020', yield: 320 },
    { year: '2021', yield: 335 },
    { year: '2022', yield: 328 },
    { year: '2023', yield: 342 },
    { year: '2024', yield: 350 }
  ]
};

// Static summary figures shown alongside the chart, per crop.
const yieldSummary: Record<string, { expected: string; harvestDate: string; confidence: string }> = {
  Wheat: { expected: '24 tons', harvestDate: 'Apr 15', confidence: '95%' },
  Rice: { expected: '17 tons', harvestDate: 'Oct 25', confidence: '92%' },
  Cotton: { expected: '4.1 tons', harvestDate: 'Nov 15', confidence: '88%' },
  Sugarcane: { expected: '140 tons', harvestDate: 'Mar 01', confidence: '96%' }
};

export default function CropGrowth() {
  const [selectedCrop, setSelectedCrop] = useState(cropData[0]);

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

  const cropYield = yearlyYieldData[selectedCrop.name] ?? [];
  const cropSummary = yieldSummary[selectedCrop.name];

  return (
    <div className="space-y-6">
      {/* Crop Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cropData.map((crop) => (
          <Card
            key={crop.id}
            className={`cursor-pointer transition-all ${selectedCrop.id === crop.id ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => setSelectedCrop(crop)}
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
          <TabsTrigger value="predictions">Yield Data</TabsTrigger>
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
                Day {selectedCrop.daysFromPlanting} of growth cycle
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
          <Card>
            <CardHeader>
              <CardTitle>Punjab Yearly Yield Data — {selectedCrop.name}</CardTitle>
              <CardDescription>Static recorded yield (quintals/acre) for the last 5 years</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cropYield}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="yield" stroke="#16a34a" fill="#16a34a" fillOpacity={0.5} name="Yield (quintals/acre)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {cropSummary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{cropSummary.expected}</div>
                    <p className="text-sm text-gray-600">Expected Yield</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{cropSummary.harvestDate}</div>
                    <p className="text-sm text-gray-600">Harvest Date</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{cropSummary.confidence}</div>
                    <p className="text-sm text-gray-600">Confidence</p>
                  </div>
                </div>
              )}
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
