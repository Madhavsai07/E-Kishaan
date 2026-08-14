import { lazy, Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import LanguageToggle from '@/components/LanguageToggle';
import { Bell, CloudRain, Leaf, TrendingUp, Zap, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

// Each dashboard tab is its own chunk — a visitor only downloads the (often
// chart-heavy) code for a module once they actually open that tab, instead
// of all six shipping in the initial bundle.
const WeatherDashboard = lazy(() => import('@/components/WeatherDashboard'));
const SoilFertility = lazy(() => import('@/components/SoilFertility'));
const CropGrowth = lazy(() => import('@/components/CropGrowth'));
const MarketAnalysis = lazy(() => import('@/components/MarketAnalysis'));
const FrankensteinSolver = lazy(() => import('@/components/FrankensteinSolver'));
const FarmRoadmap = lazy(() => import('@/components/FarmRoadmap'));

function TabFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

// Fallback demo values shown when there's no signed-in user yet.
const demoUser = { name: 'Ravi Kumar', location: 'India' };

export default function Index() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: authUser, profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const displayName = profile?.name || authUser?.email || demoUser.name;
  const displayLocation = profile?.location || demoUser.location;
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not log out.');
    }
  };

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
                  {t('common.appNameShort')}
                </h1>
                <p className="text-sm text-gray-600">{t('common.tagline')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageToggle size="sm" />
              <Button variant="outline" size="sm" className="relative">
                <Bell className="w-4 h-4 mr-2" />
                {t('common.alerts')}
                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-red-500">
                  3
                </Badge>
              </Button>

              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>{initials || 'U'}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">{displayName}</p>
                  <p className="text-gray-500">{displayLocation}</p>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                {t('common.logOut')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('dashboard.tabs.dashboard')}
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center gap-2">
              <CloudRain className="w-4 h-4" />
              {t('dashboard.tabs.weather')}
            </TabsTrigger>
            <TabsTrigger value="soil" className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              {t('dashboard.tabs.soil')}
            </TabsTrigger>
            <TabsTrigger value="crops" className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              {t('dashboard.tabs.crops')}
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('dashboard.tabs.market')}
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600" />
              {t('dashboard.tabs.roadmap')}
            </TabsTrigger>
            <TabsTrigger value="solver" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              {t('dashboard.tabs.solver')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t('dashboard.overview.todaysWeather')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28°C</div>
                  <p className="text-blue-100">{t('dashboard.overview.partlyCloudy')}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t('dashboard.overview.soilHealth')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85%</div>
                  <p className="text-green-100">{t('dashboard.overview.excellent')}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t('dashboard.overview.cropStatus')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-orange-100">{t('dashboard.overview.activeCrops')}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t('dashboard.overview.expectedRoi')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24%</div>
                  <p className="text-purple-100">{t('dashboard.overview.thisSeason')}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.overview.quickWeatherOverview')}</CardTitle>
                  <CardDescription>{t('dashboard.overview.next7Days')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<TabFallback />}>
                    <WeatherDashboard compact={true} />
                  </Suspense>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.overview.recentAchievements')}</CardTitle>
                  <CardDescription>{t('dashboard.overview.farmingJourney')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">🏆</Badge>
                      <span>{t('dashboard.overview.achievement1')}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">🌱</Badge>
                      <span>{t('dashboard.overview.achievement2')}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">💰</Badge>
                      <span>{t('dashboard.overview.achievement3')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="weather">
            <Suspense fallback={<TabFallback />}>
              <WeatherDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="soil">
            <Suspense fallback={<TabFallback />}>
              <SoilFertility />
            </Suspense>
          </TabsContent>

          <TabsContent value="crops">
            <Suspense fallback={<TabFallback />}>
              <CropGrowth />
            </Suspense>
          </TabsContent>

          <TabsContent value="market">
            <Suspense fallback={<TabFallback />}>
              <MarketAnalysis />
            </Suspense>
          </TabsContent>

          <TabsContent value="roadmap">
            <Suspense fallback={<TabFallback />}>
              <FarmRoadmap />
            </Suspense>
          </TabsContent>

          <TabsContent value="solver">
            <Suspense fallback={<TabFallback />}>
              <FrankensteinSolver />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}