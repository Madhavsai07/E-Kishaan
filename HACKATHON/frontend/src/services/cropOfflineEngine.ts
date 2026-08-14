/**
 * Crop Growth — Offline Scoring Engine
 * =====================================
 * This is a client-side port of the exact same 9-factor agronomic scoring
 * model used by the live backend (backend/src/controllers/cropController.ts)
 * — same crop rules, same weights, same growth-stage math. Keep the two in
 * sync if either changes.
 *
 * Why it exists: on a static deployment (e.g. Vercel hosting only this
 * frontend build, no Express/FastAPI processes behind it), there is no
 * `/api/crops/recommendation/:district` to call. Rather than showing an
 * error or a single hardcoded dataset, this computes real per-district,
 * per-crop results entirely offline, fed by `PUNJAB_DATASET_FALLBACK`
 * (soilService.ts) — the same real per-district soil/weather baseline
 * already used by the Soil Health module — so every district still gets
 * genuinely different numbers instead of one district's data repeated.
 *
 * It's a *static* data source (no live weather API call), not fabricated
 * output: the soil figures are the same curated per-district dataset used
 * elsewhere in this app, and the scores/timelines are still computed from
 * them via the real formula, not hand-typed per crop.
 */
import type { DistrictSoilReport } from './soilService';
import type { CropRecommendation, CropRecommendationResponse, GrowthStage } from './cropService';

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

const STAGE_TEMPLATE: Array<{ name: string; startPct: number; endPct: number }> = [
  { name: 'Sowing & Land Preparation', startPct: 0, endPct: 0.08 },
  { name: 'Vegetative Growth', startPct: 0.08, endPct: 0.35 },
  { name: 'Flowering', startPct: 0.35, endPct: 0.55 },
  { name: 'Grain / Fruit Filling', startPct: 0.55, endPct: 0.85 },
  { name: 'Maturity & Harvest', startPct: 0.85, endPct: 1.0 },
];

function buildGrowthStages(crop: AgronomicRule, ureaKg: number, dapKg: number): GrowthStage[] {
  const days = crop.growingDays;
  const firstSplitUrea = Math.round(ureaKg * 0.4);
  const secondSplitUrea = Math.max(0, ureaKg - firstSplitUrea);
  const isHorticulture = crop.category === 'Vegetable' || crop.category === 'Horticulture';

  const adviceByStage: Record<string, string> = {
    'Sowing & Land Preparation': `Apply full DAP dose (${dapKg}kg/acre) and first Urea split (${firstSplitUrea}kg/acre) as basal fertilizer before/at sowing.`,
    'Vegetative Growth': `Irrigate to meet early-stage demand (crop needs ${crop.waterReqMm}mm total across the season) and apply the remaining Urea split (${secondSplitUrea}kg/acre).`,
    'Flowering': `Monitor closely for pest/disease pressure — this is the most yield-sensitive window for ${crop.cropName}. Maintain steady soil moisture.`,
    'Grain / Fruit Filling': `Maintain consistent moisture through fill; a micronutrient (zinc/boron) foliar spray typically boosts ${isHorticulture ? 'fruit set and quality' : 'grain weight'}.`,
    'Maturity & Harvest': `Taper off irrigation. Target harvest at physiological maturity for ${crop.cropName} to maximize both ${isHorticulture ? 'quality' : 'grain'} and market price (₹${crop.basePrice}/quintal benchmark).`,
  };

  return STAGE_TEMPLATE.map((stageDef, idx) => ({
    stage: idx + 1,
    name: stageDef.name,
    dayStart: Math.round(days * stageDef.startPct),
    dayEnd: Math.max(Math.round(days * stageDef.endPct), Math.round(days * stageDef.startPct) + 1),
    advice: adviceByStage[stageDef.name],
  }));
}

function getCurrentSeasonName(): 'Rabi' | 'Kharif' | 'Zaid' {
  const month = new Date().getMonth() + 1;
  if ([11, 12, 1, 2, 3].includes(month)) return 'Rabi';
  if ([4, 5].includes(month)) return 'Zaid';
  return 'Kharif';
}

const MAX_WATER_REQ_MM = Math.max(...CROP_RULES.map((c) => c.waterReqMm));

/** Same weighted formula as cropController.ts (weights sum to exactly 1.0). `source` is attached by the caller (cropService.ts). */
export function computeCropRecommendations(geo: DistrictSoilReport): Omit<CropRecommendationResponse, 'source'> {
  const currentSeason = getCurrentSeasonName();
  const weather = geo.weather;

  const scoredCrops: CropRecommendation[] = CROP_RULES.map((crop) => {
    let phScore = 100;
    if (geo.soilPh < crop.minPh || geo.soilPh > crop.maxPh) {
      phScore = Math.max(30, 100 - Math.abs(geo.soilPh - (crop.minPh + crop.maxPh) / 2) * 40);
    }

    const nDiff = Math.abs(geo.nutrients.nitrogen - crop.idealN);
    const nScore = Math.max(40, 100 - (nDiff / crop.idealN) * 50);

    const pDiff = Math.abs(geo.nutrients.phosphorus - crop.idealP);
    const pScore = Math.max(40, 100 - (pDiff / crop.idealP) * 50);

    const kDiff = Math.abs(geo.nutrients.potassium - crop.idealK);
    const kScore = Math.max(40, 100 - (kDiff / crop.idealK) * 50);

    const ocScore = geo.organicCarbon >= crop.minOc ? 100 : Math.max(40, (geo.organicCarbon / crop.minOc) * 100);

    const idealGrowingTempC = 28;
    const tempDeviation = Math.abs(weather.temp - idealGrowingTempC);
    let weatherScore = Math.max(35, 100 - tempDeviation * 3);
    if (weather.temp > 40) weatherScore -= 10;

    const waterNeedRatio = crop.waterReqMm / MAX_WATER_REQ_MM;
    const moistureGap = Math.abs(weather.moisture / 100 - waterNeedRatio);
    weatherScore = Math.max(35, Math.round((weatherScore + Math.max(35, 100 - moistureGap * 130)) / 2));

    const rainfallVsNeed = weather.rainfall - crop.waterReqMm / 30;
    const rainfallScore = Math.max(40, 100 - Math.abs(rainfallVsNeed) * 4);

    const seasonScore = crop.idealSeason === 'All' || crop.idealSeason === currentSeason ? 100 : 40;

    const isPrimary = geo.recommendedCrop.toLowerCase().includes(crop.cropName.toLowerCase().split(' ')[0]);
    const historyScore = isPrimary ? 100 : 75;

    const totalScore = Math.round(
      phScore * 0.20 +
      nScore * 0.15 +
      pScore * 0.10 +
      kScore * 0.10 +
      ocScore * 0.10 +
      weatherScore * 0.20 +
      rainfallScore * 0.05 +
      seasonScore * 0.05 +
      historyScore * 0.05,
    );

    let status = 'Good';
    if (totalScore >= 85) status = 'Excellent';
    else if (totalScore >= 70) status = 'Good';
    else if (totalScore >= 55) status = 'Moderate';
    else status = 'Poor';

    const urea = Math.max(30, Math.round((crop.idealN - geo.nutrients.nitrogen * 0.7) * 1.2));
    const dap = Math.max(25, Math.round((crop.idealP - geo.nutrients.phosphorus * 0.8) * 1.4));
    const profitabilityScore = Math.min(99, Math.round(totalScore * 0.7 + crop.basePrice / 100));

    return {
      crop: crop.cropName,
      category: crop.category,
      score: totalScore,
      status,
      expectedYield: crop.avgYield,
      waterRequirement: `${crop.waterReqMm} mm`,
      growingDays: crop.growingDays,
      estimatedHarvestTime: `${crop.growingDays} days (${crop.idealSeason} season)`,
      fertilizer: `Urea (${urea}kg), DAP (${dap}kg)`,
      marketDemand: totalScore >= 80 ? 'High' : 'Moderate',
      expectedPrice: `₹${crop.basePrice}/quintal`,
      risk: totalScore >= 80 ? 'Low' : totalScore >= 65 ? 'Medium' : 'High',
      confidence: Math.min(98, Math.max(70, totalScore + 5)),
      profitabilityScore,
      factors: {
        soilMatch: Math.round((phScore + ocScore) / 2),
        nutrientBalance: Math.round((nScore + pScore + kScore) / 3),
        climateSuitability: Math.round((weatherScore + rainfallScore) / 2),
        seasonalFit: seasonScore,
        marketPotential: profitabilityScore,
      },
      growthStages: buildGrowthStages(crop, urea, dap),
    };
  });

  scoredCrops.sort((a, b) => b.score - a.score);
  const topRecommendations = scoredCrops.slice(0, 5);
  const topCrop = topRecommendations[0];

  const aiAdvisory = `Based on ${geo.district}'s recorded soil pH (${geo.soilPh}), organic carbon (${geo.organicCarbon}%), available nitrogen (${geo.nutrients.nitrogen} kg/ha), and this district's typical seasonal climate (${weather.temp}°C, ${weather.moisture}% moisture), ${topCrop.crop} is the strongest fit for cultivation this ${currentSeason} season with a suitability score of ${topCrop.score}/100. Expected yield is ${topCrop.expectedYield} with ${topCrop.risk.toLowerCase()} risk.`;

  return {
    district: geo.district,
    season: currentSeason,
    weather,
    soilHealth: {
      ph: geo.soilPh,
      oc: geo.organicCarbon,
      nitrogen: geo.nutrients.nitrogen,
      phosphorus: geo.nutrients.phosphorus,
      potassium: geo.nutrients.potassium,
    },
    aiAdvisory,
    recommendations: topRecommendations,
  };
}
