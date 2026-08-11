import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sprout, Leaf, Wheat, Calendar, Droplets, Bug, AlertCircle } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const cropData = [
  {
    id: 1,
    name: 'Rice',
    variety: 'Jyothi',
    plantedDate: '2024-08-15',
    expectedHarvest: '2024-12-15',
    currentStage: 'Flowering',
    progress: 75,
    health: 'Excellent',
    area: '2.5 acres'
  },
  {
    id: 2,
    name: 'Coconut',
    variety: 'Dwarf Green',
    plantedDate: '2023-01-10',
    expectedHarvest: 'Ongoing',
    currentStage: 'Mature',
    progress: 100,
    health: 'Good',
    area: '1.0 acre'
  },
  {
    id: 3,
    name: 'Pepper',
    variety: 'Panniyur-1',
    plantedDate: '2024-06-01',
    expectedHarvest: '2025-02-01',
    currentStage: 'Vegetative',
    progress: 45,
    health: 'Fair',
    area: '0.5 acres'
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

const yieldPrediction = [
  { month: 'Aug', predicted: 20, actual: 18 },
  { month: 'Sep', predicted: 35, actual: 32 },
  { month: 'Oct', predicted: 55, actual: 52 },
  { month: 'Nov', predicted: 75, actual: null },
  { month: 'Dec', predicted: 100, actual: null }
];

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
      case 'Grain Filling': return <Wheat className="w-4 h-4" />;
      case 'Maturity': return <Wheat className="w-4 h-4" />;
      default: return <Sprout className="w-4 h-4" />;
    }
  };

  const getDaysFromPlanting = (plantedDate: string) => {
    const planted = new Date(plantedDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - planted.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Crop Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <TabsTrigger value="predictions">Yield Prediction</TabsTrigger>
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
                Day {getDaysFromPlanting(selectedCrop.plantedDate)} of growth cycle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {growthStages.map((stage, index) => {
                  const isCompleted = getDaysFromPlanting(selectedCrop.plantedDate) >= stage.day;
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
              <CardTitle>Yield Prediction for {selectedCrop.name}</CardTitle>
              <CardDescription>AI-powered yield forecasting based on weather, soil, and growth data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yieldPrediction}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="predicted" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="Predicted Yield %" />
                    <Area type="monotone" dataKey="actual" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.8} name="Actual Yield %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">2.8 tons</div>
                  <p className="text-sm text-gray-600">Expected Yield</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">Dec 15</div>
                  <p className="text-sm text-gray-600">Harvest Date</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">95%</div>
                  <p className="text-sm text-gray-600">Confidence</p>
                </div>
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
                      High humidity increases blast disease risk. Apply preventive fungicide spray.
                    </AlertDescription>
                  </Alert>
                  <ul className="space-y-1 text-sm">
                    <li>• Weekly inspection for brown planthopper</li>
                    <li>• Use pheromone traps for stem borer</li>
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
                    <p className="text-sm text-gray-600">Weekly check for brown planthopper and stem borer</p>
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