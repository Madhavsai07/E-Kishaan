import { Request, Response } from 'express';
import { PUNJAB_DISTRICTS_GEO, fetchDistrictWeather } from '../services/soilETL';

interface AgronomicRule {
  cropName: string;
  category: string;
  minPh: number;
  maxPh: number;
  idealN: number;
  idealP: number;
  idealK: number;
  minOc: number;
  idealSeason: 'Rabi' | 'Kharif' | 'Zaid' | 'All';
  waterReqMm: number;
  growingDays: number;
  avgYield: string;
  basePrice: number;
}

const CROP_RULES: AgronomicRule[] = [
  { cropName: 'Wheat', category: 'Cereal', minPh: 6.5, maxPh: 7.8, idealN: 90, idealP: 25, idealK: 180, minOc: 0.55, idealSeason: 'Rabi', waterReqMm: 380, growingDays: 135, avgYield: '22-26 quintal/acre', basePrice: 2425 },
  { cropName: 'Paddy (Rice)', category: 'Cereal', minPh: 6.0, maxPh: 7.5, idealN: 95, idealP: 28, idealK: 175, minOc: 0.60, idealSeason: 'Kharif', waterReqMm: 450, growingDays: 120, avgYield: '26-30 quintal/acre', basePrice: 2300 },
  { cropName: 'Maize', category: 'Cereal', minPh: 6.0, maxPh: 7.8, idealN: 85, idealP: 22, idealK: 160, minOc: 0.50, idealSeason: 'Kharif', waterReqMm: 320, growingDays: 100, avgYield: '20-24 quintal/acre', basePrice: 2225 },
  { cropName: 'Cotton', category: 'Fiber', minPh: 7.0, maxPh: 8.5, idealN: 70, idealP: 18, idealK: 220, minOc: 0.40, idealSeason: 'Kharif', waterReqMm: 300, growingDays: 160, avgYield: '12-16 quintal/acre', basePrice: 7100 },
  { cropName: 'Sugarcane', category: 'Cash Crop', minPh: 6.5, maxPh: 7.8, idealN: 110, idealP: 30, idealK: 190, minOc: 0.65, idealSeason: 'All', waterReqMm: 600, growingDays: 330, avgYield: '350-400 quintal/acre', basePrice: 380 },
  { cropName: 'Mustard', category: 'Oilseed', minPh: 6.2, maxPh: 8.0, idealN: 65, idealP: 18, idealK: 150, minOc: 0.45, idealSeason: 'Rabi', waterReqMm: 240, growingDays: 110, avgYield: '8-12 quintal/acre', basePrice: 5650 },
  { cropName: 'Potato', category: 'Vegetable', minPh: 5.5, maxPh: 7.2, idealN: 90, idealP: 30, idealK: 200, minOc: 0.60, idealSeason: 'Rabi', waterReqMm: 350, growingDays: 90, avgYield: '120-150 quintal/acre', basePrice: 1450 },
  { cropName: 'Tomato', category: 'Vegetable', minPh: 6.0, maxPh: 7.5, idealN: 80, idealP: 25, idealK: 180, minOc: 0.55, idealSeason: 'Zaid', waterReqMm: 320, growingDays: 85, avgYield: '90-110 quintal/acre', basePrice: 1800 },
  { cropName: 'Onion', category: 'Vegetable', minPh: 6.0, maxPh: 7.5, idealN: 75, idealP: 22, idealK: 170, minOc: 0.50, idealSeason: 'Rabi', waterReqMm: 300, growingDays: 100, avgYield: '80-100 quintal/acre', basePrice: 2100 },
  { cropName: 'Peas', category: 'Pulse', minPh: 6.2, maxPh: 7.6, idealN: 40, idealP: 35, idealK: 140, minOc: 0.50, idealSeason: 'Rabi', waterReqMm: 220, growingDays: 75, avgYield: '35-45 quintal/acre', basePrice: 3200 },
  { cropName: 'Gram (Chickpea)', category: 'Pulse', minPh: 6.5, maxPh: 8.2, idealN: 35, idealP: 30, idealK: 130, minOc: 0.40, idealSeason: 'Rabi', waterReqMm: 200, growingDays: 110, avgYield: '10-14 quintal/acre', basePrice: 5440 },
  { cropName: 'Barley', category: 'Cereal', minPh: 6.8, maxPh: 8.2, idealN: 70, idealP: 20, idealK: 150, minOc: 0.45, idealSeason: 'Rabi', waterReqMm: 250, growingDays: 115, avgYield: '18-22 quintal/acre', basePrice: 1950 },
  { cropName: 'Sunflower', category: 'Oilseed', minPh: 6.5, maxPh: 8.0, idealN: 60, idealP: 20, idealK: 160, minOc: 0.48, idealSeason: 'Zaid', waterReqMm: 280, growingDays: 95, avgYield: '10-13 quintal/acre', basePrice: 6400 },
  { cropName: 'Millets (Bajra)', category: 'Cereal', minPh: 6.0, maxPh: 8.4, idealN: 45, idealP: 15, idealK: 140, minOc: 0.35, idealSeason: 'Kharif', waterReqMm: 180, growingDays: 80, avgYield: '14-18 quintal/acre', basePrice: 2500 },
  { cropName: 'Summer Vegetables', category: 'Horticulture', minPh: 6.0, maxPh: 7.6, idealN: 85, idealP: 25, idealK: 175, minOc: 0.58, idealSeason: 'Zaid', waterReqMm: 310, growingDays: 70, avgYield: '70-90 quintal/acre', basePrice: 2200 },
];

function getCurrentSeasonName(): 'Rabi' | 'Kharif' | 'Zaid' {
  const month = new Date().getMonth() + 1; // 1-12
  if ([11, 12, 1, 2, 3].includes(month)) return 'Rabi';
  if ([4, 5].includes(month)) return 'Zaid';
  return 'Kharif';
}

export async function getCropRecommendationsHandler(req: Request, res: Response) {
  const districtName = (req.params.district || req.query.district || 'Ludhiana') as string;
  const matchKey = Object.keys(PUNJAB_DISTRICTS_GEO).find(
    (k) => k.toLowerCase() === districtName.toLowerCase()
  ) || 'Ludhiana';

  const geo = PUNJAB_DISTRICTS_GEO[matchKey];
  const weather = await fetchDistrictWeather(geo.lat, geo.lng);
  const currentSeason = getCurrentSeasonName();

  const scoredCrops = CROP_RULES.map((crop) => {
    // 1. pH Factor (20%)
    let phScore = 100;
    if (geo.ph < crop.minPh || geo.ph > crop.maxPh) {
      phScore = Math.max(30, 100 - Math.abs(geo.ph - (crop.minPh + crop.maxPh) / 2) * 40);
    }

    // 2. Nitrogen (15%)
    const nDiff = Math.abs(geo.nitrogen - crop.idealN);
    const nScore = Math.max(40, 100 - (nDiff / crop.idealN) * 50);

    // 3. Phosphorus (10%)
    const pDiff = Math.abs(geo.phosphorus - crop.idealP);
    const pScore = Math.max(40, 100 - (pDiff / crop.idealP) * 50);

    // 4. Potassium (10%)
    const kDiff = Math.abs(geo.potassium - crop.idealK);
    const kScore = Math.max(40, 100 - (kDiff / crop.idealK) * 50);

    // 5. Organic Carbon (10%)
    const ocScore = geo.oc >= crop.minOc ? 100 : Math.max(40, (geo.oc / crop.minOc) * 100);

    // 6. Weather Forecast (20%)
    let weatherScore = 90;
    if (weather.temp > 38 && crop.cropName === 'Wheat') weatherScore -= 30;
    if (weather.moisture < 35 && crop.cropName === 'Paddy (Rice)') weatherScore -= 20;

    // 7. Rainfall (10%)
    let rainfallScore = 85;
    if (weather.rainfall > 10 && crop.waterReqMm < 250) rainfallScore -= 15;

    // 8. Season Compatibility (5%)
    const seasonScore = crop.idealSeason === 'All' || crop.idealSeason === currentSeason ? 100 : 40;

    // 9. Historical District Success (10%)
    const isPrimary = geo.recommendedCrop.toLowerCase().includes(crop.cropName.toLowerCase().split(' ')[0]);
    const historyScore = isPrimary ? 100 : 75;

    // Weighted Total Score
    const totalScore = Math.round(
      phScore * 0.20 +
      nScore * 0.15 +
      pScore * 0.10 +
      kScore * 0.10 +
      ocScore * 0.10 +
      weatherScore * 0.20 +
      rainfallScore * 0.10 +
      seasonScore * 0.05 +
      historyScore * 0.10
    );

    let status = 'Good';
    if (totalScore >= 85) status = 'Excellent';
    else if (totalScore >= 70) status = 'Good';
    else if (totalScore >= 55) status = 'Moderate';
    else status = 'Poor';

    const urea = Math.round((crop.idealN - geo.nitrogen * 0.7) * 1.2);
    const dap = Math.round((crop.idealP - geo.phosphorus * 0.8) * 1.4);

    return {
      crop: crop.cropName,
      category: crop.category,
      score: totalScore,
      status,
      expectedYield: crop.avgYield,
      waterRequirement: `${crop.waterReqMm} mm`,
      growingDays: crop.growingDays,
      estimatedHarvestTime: `${crop.growingDays} days (${crop.idealSeason} season)`,
      fertilizer: `Urea (${Math.max(30, urea)}kg), DAP (${Math.max(25, dap)}kg)`,
      marketDemand: totalScore >= 80 ? 'High' : 'Moderate',
      expectedPrice: `₹${crop.basePrice}/quintal`,
      risk: totalScore >= 80 ? 'Low' : totalScore >= 65 ? 'Medium' : 'High',
      confidence: Math.min(98, Math.max(70, totalScore + 5)),
      profitabilityScore: Math.min(99, Math.round((totalScore * 0.7) + (crop.basePrice / 100))),
    };
  });

  // Sort by score descending and pick Top 5
  scoredCrops.sort((a, b) => b.score - a.score);
  const topRecommendations = scoredCrops.slice(0, 5);
  const topCrop = topRecommendations[0];

  const advisoryText = `Based on current ICAR standards, ${geo.name}'s soil pH (${geo.ph}), organic carbon (${geo.oc}%), available nitrogen (${geo.nitrogen} kg/ha), and live weather conditions (${weather.temp}°C, ${weather.moisture}% moisture), ${topCrop.crop} is highly recommended for cultivation this ${currentSeason} season with a suitability score of ${topCrop.score}/100. Expected yield is ${topCrop.expectedYield} with low risk.`;

  return res.json({
    success: true,
    district: geo.name,
    season: currentSeason,
    weather,
    soilHealth: {
      ph: geo.ph,
      oc: geo.oc,
      nitrogen: geo.nitrogen,
      phosphorus: geo.phosphorus,
      potassium: geo.potassium,
    },
    aiAdvisory: advisoryText,
    recommendations: topRecommendations,
    allCrops: scoredCrops,
  });
}
