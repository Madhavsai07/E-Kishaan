import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useUserStats } from '@/contexts/UserStatsContext';

const priceHistory = [
  { month: 'Jan', rice: 2800, coconut: 25, pepper: 580 },
  { month: 'Feb', rice: 2900, coconut: 28, pepper: 620 },
  { month: 'Mar', rice: 3100, coconut: 30, pepper: 650 },
  { month: 'Apr', rice: 3200, coconut: 32, pepper: 680 },
  { month: 'May', rice: 3400, coconut: 35, pepper: 720 },
  { month: 'Jun', rice: 3300, coconut: 33, pepper: 700 },
  { month: 'Jul', rice: 3500, coconut: 36, pepper: 750 },
  { month: 'Aug', rice: 3600, coconut: 38, pepper: 780 },
  { month: 'Sep', rice: 3700, coconut: 40, pepper: 800 },
  { month: 'Oct', rice: 3800, coconut: 42, pepper: 820 },
];

const priceForecast = [
  { month: 'Nov', rice: 3900, coconut: 44, pepper: 850 },
  { month: 'Dec', rice: 4100, coconut: 46, pepper: 880 },
  { month: 'Jan', rice: 4200, coconut: 48, pepper: 900 },
  { month: 'Feb', rice: 4000, coconut: 45, pepper: 870 },
  { month: 'Mar', rice: 3800, coconut: 42, pepper: 840 },
  { month: 'Apr', rice: 3600, coconut: 40, pepper: 810 },
];

const profitAnalysis = [
  { crop: 'Rice', investment: 45000, revenue: 84000, profit: 39000, roi: 86.7 },
  { crop: 'Coconut', investment: 25000, revenue: 48000, profit: 23000, roi: 92.0 },
  { crop: 'Pepper', investment: 35000, revenue: 58000, profit: 23000, roi: 65.7 },
];

const marketTrends = [
  { name: 'Rice', value: 45, color: '#0088FE' },
  { name: 'Coconut', value: 30, color: '#00C49F' },
  { name: 'Pepper', value: 25, color: '#FFBB28' },
];

export default function MarketAnalysis() {
  const { recordMarketCheck } = useUserStats();
  const [selectedCrop, setSelectedCrop] = useState('rice');
  const [timeframe, setTimeframe] = useState('6months');

  useEffect(() => {
    recordMarketCheck();
  }, [selectedCrop, recordMarketCheck]);

  const getCurrentPrice = (crop: string) => {
    const latest = priceHistory[priceHistory.length - 1];
    return latest[crop as keyof typeof latest];
  };

  const getPriceChange = (crop: string) => {
    const latest = priceHistory[priceHistory.length - 1];
    const previous = priceHistory[priceHistory.length - 2];
    const current = latest[crop as keyof typeof latest];
    const prev = previous[crop as keyof typeof previous];
    return ((current - prev) / prev * 100).toFixed(1);
  };

  const getBestSellingTime = (crop: string) => {
    const forecast = priceForecast.find(item => 
      item[crop as keyof typeof item] === Math.max(...priceForecast.map(f => f[crop as keyof typeof f]))
    );
    return forecast?.month || 'Dec';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Rice Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{getCurrentPrice('rice')}/quintal</div>
            <div className="flex items-center gap-1 mt-1">
              {parseFloat(getPriceChange('rice')) > 0 ? 
                <TrendingUp className="w-4 h-4" /> : 
                <TrendingDown className="w-4 h-4" />
              }
              <span className="text-sm">{getPriceChange('rice')}% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Coconut Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{getCurrentPrice('coconut')}/piece</div>
            <div className="flex items-center gap-1 mt-1">
              {parseFloat(getPriceChange('coconut')) > 0 ? 
                <TrendingUp className="w-4 h-4" /> : 
                <TrendingDown className="w-4 h-4" />
              }
              <span className="text-sm">{getPriceChange('coconut')}% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pepper Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{getCurrentPrice('pepper')}/kg</div>
            <div className="flex items-center gap-1 mt-1">
              {parseFloat(getPriceChange('pepper')) > 0 ? 
                <TrendingUp className="w-4 h-4" /> : 
                <TrendingDown className="w-4 h-4" />
              }
              <span className="text-sm">{getPriceChange('pepper')}% this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best Selling Time Alert */}
      <Alert className="border-green-200 bg-green-50">
        <Target className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Optimal Selling Time</AlertTitle>
        <AlertDescription className="text-green-700">
          Based on price forecasts: Rice - {getBestSellingTime('rice')}, Coconut - {getBestSellingTime('coconut')}, Pepper - {getBestSellingTime('pepper')}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="prices" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prices">Price Trends</TabsTrigger>
          <TabsTrigger value="forecast">Price Forecast</TabsTrigger>
          <TabsTrigger value="profit">Profit Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="prices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historical Price Trends</CardTitle>
              <CardDescription>Price movements over the past 10 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'rice' ? `₹${value}/quintal` :
                      name === 'coconut' ? `₹${value}/piece` :
                      `₹${value}/kg`, 
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]} />
                    <Line type="monotone" dataKey="rice" stroke="#0088FE" strokeWidth={2} name="Rice" />
                    <Line type="monotone" dataKey="coconut" stroke="#00C49F" strokeWidth={2} name="Coconut" />
                    <Line type="monotone" dataKey="pepper" stroke="#FFBB28" strokeWidth={2} name="Pepper" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>6-Month Price Forecast</CardTitle>
              <CardDescription>AI-powered price predictions based on market trends and seasonal patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'rice' ? `₹${value}/quintal` :
                      name === 'coconut' ? `₹${value}/piece` :
                      `₹${value}/kg`, 
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]} />
                    <Line type="monotone" dataKey="rice" stroke="#0088FE" strokeWidth={2} strokeDasharray="5 5" name="Rice (Forecast)" />
                    <Line type="monotone" dataKey="coconut" stroke="#00C49F" strokeWidth={2} strokeDasharray="5 5" name="Coconut (Forecast)" />
                    <Line type="monotone" dataKey="pepper" stroke="#FFBB28" strokeWidth={2} strokeDasharray="5 5" name="Pepper (Forecast)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">₹4,200</div>
                  <p className="text-sm text-gray-600">Peak Rice Price (Jan)</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">₹48</div>
                  <p className="text-sm text-gray-600">Peak Coconut Price (Jan)</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">₹900</div>
                  <p className="text-sm text-gray-600">Peak Pepper Price (Jan)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profit Analysis by Crop</CardTitle>
                <CardDescription>Current season performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profitAnalysis.map((crop, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{crop.crop}</h4>
                        <Badge className={crop.roi > 80 ? 'bg-green-500' : crop.roi > 60 ? 'bg-blue-500' : 'bg-yellow-500'}>
                          {crop.roi}% ROI
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Investment</p>
                          <p className="font-medium">{formatCurrency(crop.investment)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Revenue</p>
                          <p className="font-medium">{formatCurrency(crop.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Profit</p>
                          <p className="font-medium text-green-600">{formatCurrency(crop.profit)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
                <CardDescription>Contribution by crop type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={marketTrends}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {marketTrends.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">₹1,05,000</div>
                  <p className="text-sm text-gray-600">Total Investment</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">₹1,90,000</div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">₹85,000</div>
                  <p className="text-sm text-gray-600">Net Profit</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">81%</div>
                  <p className="text-sm text-gray-600">Average ROI</p>
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
                  <Calendar className="w-5 h-5 text-green-500" />
                  Selling Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Hold rice harvest until January for 10-15% better prices. Market demand peaks during festival season.
                    </AlertDescription>
                  </Alert>
                  <ul className="space-y-1 text-sm">
                    <li>• Coconut prices are stable - sell regularly</li>
                    <li>• Pepper shows strong upward trend - consider holding</li>
                    <li>• Monitor monsoon forecasts for price volatility</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Market Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Organic certification can increase prices by 20-30%. Consider transitioning one crop at a time.
                    </AlertDescription>
                  </Alert>
                  <ul className="space-y-1 text-sm">
                    <li>• Direct-to-consumer sales via farmer markets</li>
                    <li>• Contract farming with food processing units</li>
                    <li>• Export opportunities for premium pepper varieties</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Risk Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800">Price Volatility</h4>
                  <p className="text-sm text-yellow-700 mt-1">Diversify selling periods and consider futures contracts</p>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800">Weather Risk</h4>
                  <p className="text-sm text-red-700 mt-1">Crop insurance and weather derivatives available</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800">Market Access</h4>
                  <p className="text-sm text-blue-700 mt-1">Join farmer producer organizations for better prices</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}