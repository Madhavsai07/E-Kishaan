import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LanguageToggle from '@/components/LanguageToggle';
import { Bell, CloudRain, Leaf, TrendingUp, Zap, LogOut, Map, Edit3 } from 'lucide-react';
import WeatherDashboard from '@/components/WeatherDashboard';
import SoilFertility from '@/components/SoilFertility';
import CropGrowth from '@/components/CropGrowth';
import MarketAnalysis from '@/components/MarketAnalysis';
import FrankensteinSolver from '@/components/FrankensteinSolver';
import FarmRoadmap from '@/components/FarmRoadmap';
import FarmerOnboarding, { clearProfile } from '@/components/FarmerOnboarding';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

// ─── Farmer profile shape ────────────────────────────────────────────────────
interface FarmerProfile {
  name: string;
  location: string;
  state: string;
  primaryCrops: string[];
  points?: number;
  level?: string;
}

const PROFILE_KEY = 'agrismart_farmer_profile';
const SESSION_CROP_KEY = 'ekisaan_session_crop_selected';

function loadProfile(): FarmerProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Index() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: authUser, profile: authProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Farmer profile from onboarding (localStorage)
  const [farmer, setFarmer] = useState<FarmerProfile | null>(() => loadProfile());

  // Session-based flag to ensure crop selection is shown right after login
  const [cropSelectionDone, setCropSelectionDone] = useState<boolean>(() => {
    return sessionStorage.getItem(SESSION_CROP_KEY) === 'true';
  });

  // Re-read profile if it changes
  useEffect(() => {
    const stored = loadProfile();
    if (stored) setFarmer(stored);
  }, []);

  const handleOnboardingComplete = (profile: FarmerProfile) => {
    sessionStorage.setItem(SESSION_CROP_KEY, 'true');
    setFarmer(profile);
    setCropSelectionDone(true);
  };

  const handleReopenCropSelection = () => {
    setCropSelectionDone(false);
  };

  // Show crop selection screen if profile is missing OR crop selection not done for this login session
  if (!farmer || !cropSelectionDone) {
    return (
      <FarmerOnboarding
        onComplete={handleOnboardingComplete}
        defaultName={authProfile?.name || authUser?.email?.split('@')[0] || farmer?.name || 'Farmer'}
        defaultLocation={authProfile?.location || farmer?.location || 'Ludhiana, Punjab'}
        defaultState={authProfile?.state || farmer?.state || 'Punjab'}
      />
    );
  }

  // Display name: prefer auth profile > onboarding name
  const displayName     = authProfile?.name || authUser?.email || farmer.name;
  const displayLocation = authProfile?.location || farmer.location;
  const initials = displayName
    .split(' ')
    .map((p: string) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem(SESSION_CROP_KEY);
      clearProfile();
      await logout();
      navigate('/login');
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
                  E-Kisaan
                </h1>
                <p className="text-sm text-gray-600">AI-Powered Farming Assistant</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Language toggle from friend's feature */}
              <LanguageToggle size="sm" />

              <Button variant="outline" size="sm" className="relative">
                <Bell className="w-4 h-4 mr-2" />
                {t('common.alerts') || 'Alerts'}
                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-red-500">
                  3
                </Badge>
              </Button>

              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>{initials || 'TF'}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">{displayName}</p>
                  <p className="text-gray-500 text-xs">{displayLocation}</p>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                {t('common.logOut') || 'Log out'}
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
              {t('dashboard.tabs.dashboard') || 'Dashboard'}
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center gap-2">
              <CloudRain className="w-4 h-4" />
              {t('dashboard.tabs.weather') || 'Weather'}
            </TabsTrigger>
            <TabsTrigger value="soil" className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              {t('dashboard.tabs.soil') || 'Soil Health'}
            </TabsTrigger>
            <TabsTrigger value="crops" className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              {t('dashboard.tabs.crops') || 'Crop Growth'}
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('dashboard.tabs.market') || 'Market'}
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center gap-2">
              <Map className="w-4 h-4 text-emerald-600" />
              {t('dashboard.tabs.roadmap') || 'My Farm Roadmap'}
            </TabsTrigger>
            <TabsTrigger value="solver" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              {t('dashboard.tabs.solver') || 'AI Solver'}
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t('dashboard.overview.todayWeather') || "Today's Weather"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28°C</div>
                  <p className="text-blue-100">{t('dashboard.overview.partlyCloudy') || 'Partly Cloudy'}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t('dashboard.overview.soilHealth') || 'Soil Health'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85%</div>
                  <p className="text-green-100">{t('dashboard.overview.excellent') || 'Excellent'}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t('dashboard.overview.cropStatus') || 'Crop Status'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{farmer.primaryCrops.length}</div>
                  <p className="text-orange-100 font-medium">{farmer.primaryCrops.join(', ')}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t('dashboard.overview.expectedRoi') || 'Expected ROI'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24%</div>
                  <p className="text-purple-100">{t('dashboard.overview.thisSeason') || 'This Season'}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.overview.quickWeatherOverview') || 'Quick Weather Overview'}</CardTitle>
                  <CardDescription>{t('dashboard.overview.next7Days') || 'Next 7 days forecast'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <WeatherDashboard compact={true} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Your Crops</CardTitle>
                    <CardDescription>Crops you plan to grow this season</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReopenCropSelection}
                    className="flex items-center gap-1.5 text-xs text-green-700 border-green-300 hover:bg-green-50"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Change Crops
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {farmer.primaryCrops.map((crop) => (
                      <Badge key={crop} className="bg-green-100 text-green-800 text-sm px-3 py-1 font-medium">
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

          {/* Market — personalised with farmer's crops & state */}
          <TabsContent value="market">
            <MarketAnalysis
              primaryCrops={farmer.primaryCrops}
              state={farmer.state}
            />
          </TabsContent>

          {/* Farm Roadmap — friend's feature */}
          <TabsContent value="roadmap">
            <FarmRoadmap />
          </TabsContent>

          <TabsContent value="solver">
            <FrankensteinSolver />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}