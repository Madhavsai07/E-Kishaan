export interface CropFactors {
  soilMatch: number;
  nutrientBalance: number;
  climateSuitability: number;
  seasonalFit: number;
  marketPotential: number;
}

export interface GrowthStage {
  stage: number;
  name: string;
  dayStart: number;
  dayEnd: number;
  advice: string;
}

export interface CropRecommendation {
  crop: string;
  category: string;
  score: number;
  status: string;
  expectedYield: string;
  waterRequirement: string;
  growingDays: number;
  estimatedHarvestTime: string;
  fertilizer: string;
  marketDemand: string;
  expectedPrice: string;
  risk: string;
  confidence: number;
  profitabilityScore: number;
  /** Real computed sub-scores from the 9-factor agronomic model — drives the radar chart. */
  factors: CropFactors;
  /** Per-crop growth-stage timeline, sized proportionally from this crop's actual growing-days. */
  growthStages: GrowthStage[];
}

export interface CropRecommendationResponse {
  district: string;
  season: string;
  weather: {
    temp: number;
    rainfall: number;
    humidity: number;
    moisture: number;
  };
  soilHealth: {
    ph: number;
    oc: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  aiAdvisory: string;
  recommendations: CropRecommendation[];
}

const API_BASE = '/api/crops';

/**
 * Fetches AI crop recommendations for a district from the live agronomic
 * scoring engine (real soil data + live Open-Meteo weather). Returns `null`
 * on any failure instead of masking it with static numbers — the caller is
 * responsible for showing a genuine loading/error state so nothing on
 * screen is ever a number the backend didn't actually compute.
 */
export async function fetchCropRecommendations(district: string): Promise<CropRecommendationResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/recommendation/${encodeURIComponent(district)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
      return data as CropRecommendationResponse;
    }
    throw new Error('Malformed response from crop recommendation engine');
  } catch (error) {
    console.error(`[cropService] Could not fetch crop recommendations for ${district}:`, error);
    return null;
  }
}
