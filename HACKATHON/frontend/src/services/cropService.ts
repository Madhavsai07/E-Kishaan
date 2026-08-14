import { PUNJAB_DATASET_FALLBACK } from './soilService';
import { computeCropRecommendations } from './cropOfflineEngine';

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
  /** 'live' = computed just now from the backend's real soil+weather feed. 'estimated' = computed locally (see cropOfflineEngine.ts) because the backend wasn't reachable. */
  source: 'live' | 'estimated';
}

const API_BASE = '/api/crops';

/**
 * Fetches AI crop recommendations for a district. Tries the live backend
 * first (real soil data + live Open-Meteo weather). If it's unreachable —
 * e.g. a static frontend-only deployment with no Express/FastAPI behind it —
 * falls back to computing the same scoring model locally
 * (cropOfflineEngine.ts) from the district's curated soil baseline, so the
 * page always shows a real, per-district-computed result instead of an
 * error. The response always says which source produced it.
 */
export async function fetchCropRecommendations(district: string): Promise<CropRecommendationResponse> {
  try {
    const res = await fetch(`${API_BASE}/recommendation/${encodeURIComponent(district)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
      return { ...(data as CropRecommendationResponse), source: 'live' };
    }
    throw new Error('Malformed response from crop recommendation engine');
  } catch (error) {
    console.warn(`[cropService] Live backend unavailable for ${district}, using offline estimate:`, error);
    const matchKey =
      Object.keys(PUNJAB_DATASET_FALLBACK).find((k) => k.toLowerCase() === district.toLowerCase()) || 'Ludhiana';
    const geo = PUNJAB_DATASET_FALLBACK[matchKey];
    return { ...computeCropRecommendations(geo), source: 'estimated' };
  }
}
