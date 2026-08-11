import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CloudRain, Sun, Cloud, Wind, Droplets, Thermometer, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface WeatherDashboardProps {
  compact?: boolean;
}

const weatherData = [
  { day: 'Mon', temp: 28, humidity: 75, rainfall: 2 },
  { day: 'Tue', temp: 30, humidity: 68, rainfall: 0 },
  { day: 'Wed', temp: 32, humidity: 72, rainfall: 5 },
  { day: 'Thu', temp: 29, humidity: 80, rainfall: 12 },
  { day: 'Fri', temp: 27, humidity: 85, rainfall: 8 },
  { day: 'Sat', temp: 31, humidity: 70, rainfall: 0 },
  { day: 'Sun', temp: 33, humidity: 65, rainfall: 0 },
];

const monthlyForecast = [
  { month: 'Oct', avgTemp: 29, rainfall: 180 },
  { month: 'Nov', avgTemp: 27, rainfall: 120 },
  { month: 'Dec', avgTemp: 25, rainfall: 80 },
  { month: 'Jan', avgTemp: 24, rainfall: 40 },
  { month: 'Feb', avgTemp: 26, rainfall: 60 },
  { month: 'Mar', avgTemp: 28, rainfall: 100 },
];

export default function WeatherDashboard({ compact = false }: WeatherDashboardProps) {
  if (compact) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {weatherData.slice(0, 3).map((day, index) => (
            <div key={index} className="text-center">
              <p className="text-sm font-medium">{day.day}</p>
              <div className="flex items-center justify-center my-2">
                {day.rainfall > 0 ? <CloudRain className="w-6 h-6 text-blue-500" /> : <Sun className="w-6 h-6 text-yellow-500" />}
              </div>
              <p className="text-lg font-bold">{day.temp}°C</p>
              <p className="text-xs text-gray-500">{day.humidity}% humidity</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weather Alerts */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800">Weather Alert</AlertTitle>
        <AlertDescription className="text-orange-700">
          Heavy rainfall expected on Thursday. Consider postponing field activities and ensure proper drainage.
        </AlertDescription>
      </Alert>

      {/* Current Weather */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-red-500" />
              Temperature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">28°C</div>
            <p className="text-sm text-gray-600">Feels like 31°C</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              Humidity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">75%</div>
            <p className="text-sm text-gray-600">Optimal for crops</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wind className="w-5 h-5 text-gray-500" />
              Wind Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12 km/h</div>
            <p className="text-sm text-gray-600">Light breeze</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-blue-600" />
              Rainfall
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2mm</div>
            <p className="text-sm text-gray-600">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* 7-Day Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Weather Forecast</CardTitle>
          <CardDescription>Temperature and rainfall predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} name="Temperature (°C)" />
                <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} name="Humidity (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>6-Month Climate Forecast</CardTitle>
          <CardDescription>Long-term weather patterns for crop planning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgTemp" fill="#f59e0b" name="Avg Temperature (°C)" />
                <Bar dataKey="rainfall" fill="#3b82f6" name="Rainfall (mm)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Farming Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Weather-Based Farming Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">This Week</Badge>
              <ul className="space-y-1 text-sm">
                <li>• Prepare drainage systems for Thursday's heavy rain</li>
                <li>• Apply foliar fertilizer before Wednesday</li>
                <li>• Monitor pest activity during humid conditions</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">Next Month</Badge>
              <ul className="space-y-1 text-sm">
                <li>• Consider planting winter vegetables in November</li>
                <li>• Reduce irrigation frequency as rainfall increases</li>
                <li>• Plan harvest activities for dry periods</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}