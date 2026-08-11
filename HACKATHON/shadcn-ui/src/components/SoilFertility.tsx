import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, Droplets, Zap, AlertCircle, TrendingUp, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

const soilData = {
  nitrogen: 75,
  phosphorus: 68,
  potassium: 82,
  ph: 6.5,
  organicMatter: 3.2,
  moisture: 45
};

const fertilizerHistory = [
  { month: 'Jun', nitrogen: 20, phosphorus: 15, potassium: 25 },
  { month: 'Jul', nitrogen: 25, phosphorus: 18, potassium: 30 },
  { month: 'Aug', nitrogen: 22, phosphorus: 20, potassium: 28 },
  { month: 'Sep', nitrogen: 18, phosphorus: 16, potassium: 22 },
  { month: 'Oct', nitrogen: 15, phosphorus: 12, potassium: 20 },
];

const soilTrends = [
  { month: 'Jun', nitrogen: 70, phosphorus: 65, potassium: 78 },
  { month: 'Jul', nitrogen: 72, phosphorus: 66, potassium: 80 },
  { month: 'Aug', nitrogen: 74, phosphorus: 67, potassium: 81 },
  { month: 'Sep', nitrogen: 75, phosphorus: 68, potassium: 82 },
  { month: 'Oct', nitrogen: 75, phosphorus: 68, potassium: 82 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function SoilFertility() {
  const [fertilizerInput, setFertilizerInput] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleFertilizerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle fertilizer input submission
    console.log('Fertilizer input:', fertilizerInput);
    setFertilizerInput({ nitrogen: '', phosphorus: '', potassium: '', date: new Date().toISOString().split('T')[0] });
  };

  const npkData = [
    { name: 'Nitrogen', value: soilData.nitrogen, color: '#0088FE' },
    { name: 'Phosphorus', value: soilData.phosphorus, color: '#00C49F' },
    { name: 'Potassium', value: soilData.potassium, color: '#FFBB28' },
  ];

  const getHealthStatus = (value: number) => {
    if (value >= 80) return { status: 'Excellent', color: 'bg-green-500' };
    if (value >= 60) return { status: 'Good', color: 'bg-blue-500' };
    if (value >= 40) return { status: 'Fair', color: 'bg-yellow-500' };
    return { status: 'Poor', color: 'bg-red-500' };
  };

  return (
    <div className="space-y-6">
      {/* Soil Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-500" />
              Overall Soil Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">85%</div>
            <Badge className="mt-2 bg-green-100 text-green-800">Excellent</Badge>
            <p className="text-sm text-gray-600 mt-2">Based on NPK levels and pH balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              pH Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{soilData.ph}</div>
            <Badge className="mt-2 bg-blue-100 text-blue-800">Optimal</Badge>
            <p className="text-sm text-gray-600 mt-2">Ideal for most crops</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              Organic Matter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{soilData.organicMatter}%</div>
            <Badge className="mt-2 bg-orange-100 text-orange-800">Good</Badge>
            <p className="text-sm text-gray-600 mt-2">Supports healthy microbial activity</p>
          </CardContent>
        </Card>
      </div>

      {/* NPK Levels */}
      <Card>
        <CardHeader>
          <CardTitle>NPK Nutrient Levels</CardTitle>
          <CardDescription>Current nitrogen, phosphorus, and potassium levels in your soil</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Nitrogen (N)</Label>
                  <span className="text-sm font-medium">{soilData.nitrogen}%</span>
                </div>
                <Progress value={soilData.nitrogen} className="h-2" />
                <Badge variant="secondary" className={getHealthStatus(soilData.nitrogen).color + " text-white mt-1"}>
                  {getHealthStatus(soilData.nitrogen).status}
                </Badge>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Phosphorus (P)</Label>
                  <span className="text-sm font-medium">{soilData.phosphorus}%</span>
                </div>
                <Progress value={soilData.phosphorus} className="h-2" />
                <Badge variant="secondary" className={getHealthStatus(soilData.phosphorus).color + " text-white mt-1"}>
                  {getHealthStatus(soilData.phosphorus).status}
                </Badge>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Potassium (K)</Label>
                  <span className="text-sm font-medium">{soilData.potassium}%</span>
                </div>
                <Progress value={soilData.potassium} className="h-2" />
                <Badge variant="secondary" className={getHealthStatus(soilData.potassium).color + " text-white mt-1"}>
                  {getHealthStatus(soilData.potassium).status}
                </Badge>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={npkData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {npkData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fertilizer Management */}
      <Tabs defaultValue="input" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="input">Add Fertilizer</TabsTrigger>
          <TabsTrigger value="history">Usage History</TabsTrigger>
          <TabsTrigger value="trends">Soil Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Record Fertilizer Application
              </CardTitle>
              <CardDescription>Track your fertilizer usage to monitor soil health changes</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFertilizerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="nitrogen">Nitrogen (kg/acre)</Label>
                    <Input
                      id="nitrogen"
                      type="number"
                      value={fertilizerInput.nitrogen}
                      onChange={(e) => setFertilizerInput({ ...fertilizerInput, nitrogen: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phosphorus">Phosphorus (kg/acre)</Label>
                    <Input
                      id="phosphorus"
                      type="number"
                      value={fertilizerInput.phosphorus}
                      onChange={(e) => setFertilizerInput({ ...fertilizerInput, phosphorus: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="potassium">Potassium (kg/acre)</Label>
                    <Input
                      id="potassium"
                      type="number"
                      value={fertilizerInput.potassium}
                      onChange={(e) => setFertilizerInput({ ...fertilizerInput, potassium: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Application Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={fertilizerInput.date}
                      onChange={(e) => setFertilizerInput({ ...fertilizerInput, date: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full md:w-auto">
                  Record Application
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fertilizer Usage History</CardTitle>
              <CardDescription>Your fertilizer application over the past 5 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fertilizerHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="nitrogen" fill="#0088FE" name="Nitrogen (kg/acre)" />
                    <Bar dataKey="phosphorus" fill="#00C49F" name="Phosphorus (kg/acre)" />
                    <Bar dataKey="potassium" fill="#FFBB28" name="Potassium (kg/acre)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Soil Nutrient Trends</CardTitle>
              <CardDescription>How your soil health has changed over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={soilTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="nitrogen" stroke="#0088FE" strokeWidth={2} name="Nitrogen %" />
                    <Line type="monotone" dataKey="phosphorus" stroke="#00C49F" strokeWidth={2} name="Phosphorus %" />
                    <Line type="monotone" dataKey="potassium" stroke="#FFBB28" strokeWidth={2} name="Potassium %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Soil Health Recommendations</AlertTitle>
        <AlertDescription>
          <div className="mt-2 space-y-1">
            <p>• Your phosphorus levels are slightly low. Consider applying phosphate fertilizer.</p>
            <p>• Excellent potassium levels - maintain current practices.</p>
            <p>• Add organic compost to further improve soil structure.</p>
            <p>• Test soil pH monthly during growing season.</p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}