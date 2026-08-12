import { Request, Response } from 'express';

const PUNJAB_LOCATIONS = [
  { id: 'amritsar', name: 'Amritsar', lat: 31.6340, lon: 74.8723, district: 'Amritsar', region: 'North' },
  { id: 'barnala', name: 'Barnala', lat: 30.3819, lon: 75.5468, district: 'Barnala', region: 'Central' },
  { id: 'bathinda', name: 'Bathinda', lat: 30.2110, lon: 74.9455, district: 'Bathinda', region: 'South' },
  { id: 'faridkot', name: 'Faridkot', lat: 30.6769, lon: 74.7460, district: 'Faridkot', region: 'West' },
  { id: 'ludhiana', name: 'Ludhiana', lat: 30.9010, lon: 75.8573, district: 'Ludhiana', region: 'Central' },
  { id: 'jalandhar', name: 'Jalandhar', lat: 31.3260, lon: 75.5762, district: 'Jalandhar', region: 'Central' },
  { id: 'patiala', name: 'Patiala', lat: 30.3398, lon: 76.3869, district: 'Patiala', region: 'East' },
];

export async function getWeatherHandler(req: Request, res: Response) {
  try {
    const locationId = (req.query.locationId as string) || 'ludhiana';
    const loc = PUNJAB_LOCATIONS.find((l) => l.id === locationId) || PUNJAB_LOCATIONS[4];

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=Asia%2FKolkata`;

    const fetchRes = await fetch(url);
    if (!fetchRes.ok) {
      throw new Error(`Open-Meteo returned status ${fetchRes.status}`);
    }

    const data = await fetchRes.json();
    return res.json({
      success: true,
      location: loc,
      rawWeatherData: data,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch weather data from backend provider',
    });
  }
}
