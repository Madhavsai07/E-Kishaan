import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, CloudRain, Leaf, TrendingUp, Zap } from 'lucide-react';
import WeatherDashboard from '@/components/WeatherDashboard';
import SoilFertility from '@/components/SoilFertility';
import CropGrowth from '@/components/CropGrowth';
import MarketAnalysis from '@/components/MarketAnalysis';
import FrankensteinSolver from '@/components/FrankensteinSolver';
import UserProfile from '@/components/UserProfile';
import FarmerOnboarding, {
  loadProfile,
  saveProfile,
  type FarmerProfile,
} from '@/components/FarmerOnboarding';

export default function Index() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Load profile from localStorage on first render.
  // null = onboarding not yet completed.
  const [farmer, setFarmer] = useState<FarmerProfile | null>(() => loadProfile());

  // ── Show onboarding until farmer completes setup ────────────────────────────
  if (!farmer) {
    return (
      <FarmerOnboarding
        onComplete={(profile) => {
          saveProfile(profile);
          setFarmer(profile);
        }}
      />
    );
  }

  // ── Initials for avatar ─────────────────────────────────────────────────────
  const initials = farmer.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                  AgriSmart
                </h1>
                <p className="text-sm text-gray-600">AI-Powered Farming Assistant</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="relative">
                <Bell className="w-4 h-4 mr-2" />
                Alerts
                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-red-500">
                  3
                </Badge>
              </Button>

              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">{farmer.name}</p>
                  <p className="text-gray-500 text-xs">{farmer.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center gap-2">
              <CloudRain className="w-4 h-4" />
              Weather
            </TabsTrigger>
            <TabsTrigger value="soil" className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Soil Health
            </TabsTrigger>
            <TabsTrigger value="crops" className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Crop Growth
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Market
            </TabsTrigger>
            <TabsTrigger value="solver" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Solver
            </TabsTrigger>
          </TabsList>

          {/* ── Dashboard ── */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Today's Weather</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28°C</div>
                  <p className="text-blue-100">Partly Cloudy</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Soil Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85%</div>
                  <p className="text-green-100">Excellent</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Active Crops</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{farmer.primaryCrops.length}</div>
                  <p className="text-orange-100">
                    {farmer.primaryCrops.slice(0, 2).join(', ')}
                    {farmer.primaryCrops.length > 2 ? ` +${farmer.primaryCrops.length - 2}` : ''}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Expected ROI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24%</div>
                  <p className="text-purple-100">This Season</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Weather Overview</CardTitle>
                  <CardDescription>Next 7 days forecast</CardDescription>
                </CardHeader>
                <CardContent>
                  <WeatherDashboard compact={true} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Crops</CardTitle>
                  <CardDescription>Crops you plan to grow this season</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {farmer.primaryCrops.map((crop) => (
                      <Badge key={crop} className="bg-green-100 text-green-800 text-sm px-3 py-1">
                        🌾 {crop}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Go to <strong>Market</strong> tab to see live prices and sell advice for your crops.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="weather">
            <WeatherDashboard />
          </TabsContent>

          <TabsContent value="soil">
            <SoilFertility />
          </TabsContent>

          <TabsContent value="crops">
            <CropGrowth />
          </TabsContent>

          {/* ── Market — passes farmer's crops & state ── */}
          <TabsContent value="market">
            <MarketAnalysis
              primaryCrops={farmer.primaryCrops}
              state={farmer.state}
            />
          </TabsContent>

          <TabsContent value="solver">
            <FrankensteinSolver />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}