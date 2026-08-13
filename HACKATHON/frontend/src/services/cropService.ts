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

// Instant dataset fallback for Punjab districts crop recommendations
export const FALLBACK_CROP_DATA: Record<string, CropRecommendationResponse> = {
  Ludhiana: {
    district: 'Ludhiana',
    season: 'Rabi',
    weather: { temp: 28.5, rainfall: 0, humidity: 60, moisture: 45 },
    soilHealth: { ph: 7.2, oc: 0.66, nitrogen: 95, phosphorus: 29, potassium: 185 },
    aiAdvisory:
      'The soil pH (7.2), high potassium level (185 kg/ha), and moderate weather conditions make Wheat and Potato highly suitable for cultivation this season in Ludhiana. Apply recommended NPK fertilizer split doses for optimal yield.',
    recommendations: [
      {
        crop: 'Wheat (HD-2967)',
        category: 'Cereal',
        score: 95,
        status: 'Excellent',
        expectedYield: '24-26 quintal/acre',
        waterRequirement: '380 mm',
        growingDays: 135,
        estimatedHarvestTime: '135 days (Rabi)',
        fertilizer: 'Urea (115kg), DAP (50kg)',
        marketDemand: 'Very High',
        expectedPrice: '₹2425/quintal',
        risk: 'Low',
        confidence: 96,
        profitabilityScore: 94,
      },
      {
        crop: 'Potato (Kufri Pukhraj)',
        category: 'Vegetable',
        score: 89,
        status: 'Excellent',
        expectedYield: '140 quintal/acre',
        waterRequirement: '350 mm',
        growingDays: 90,
        estimatedHarvestTime: '90 days (Rabi)',
        fertilizer: 'Urea (95kg), DAP (55kg), MOP (35kg)',
        marketDemand: 'High',
        expectedPrice: '₹1450/quintal',
        risk: 'Low',
        confidence: 91,
        profitabilityScore: 92,
      },
      {
        crop: 'Mustard (Pusa Bold)',
        category: 'Oilseed',
        score: 84,
        status: 'Good',
        expectedYield: '10-12 quintal/acre',
        waterRequirement: '240 mm',
        growingDays: 110,
        estimatedHarvestTime: '110 days (Rabi)',
        fertilizer: 'Urea (65kg), Single Super Phosphate (50kg)',
        marketDemand: 'High',
        expectedPrice: '₹5650/quintal',
        risk: 'Low',
        confidence: 88,
        profitabilityScore: 90,
      },
      {
        crop: 'Peas (PB-89)',
        category: 'Pulse',
        score: 79,
        status: 'Good',
        expectedYield: '40 quintal/acre',
        waterRequirement: '220 mm',
        growingDays: 75,
        estimatedHarvestTime: '75 days (Rabi)',
        fertilizer: 'Urea (35kg), DAP (30kg)',
        marketDemand: 'Moderate',
        expectedPrice: '₹3200/quintal',
        risk: 'Low',
        confidence: 84,
        profitabilityScore: 83,
      },
      {
        crop: 'Barley (PL-891)',
        category: 'Cereal',
        score: 74,
        status: 'Good',
        expectedYield: '20 quintal/acre',
        waterRequirement: '250 mm',
        growingDays: 115,
        estimatedHarvestTime: '115 days (Rabi)',
        fertilizer: 'Urea (70kg), DAP (35kg)',
        marketDemand: 'Moderate',
        expectedPrice: '₹1950/quintal',
        risk: 'Low',
        confidence: 80,
        profitabilityScore: 78,
      },
    ],
  },
};

const API_BASE = '/api/crops';

export async function fetchCropRecommendations(district: string = 'Ludhiana'): Promise<CropRecommendationResponse> {
  const matchKey = Object.keys(FALLBACK_CROP_DATA).find(
    (k) => k.toLowerCase() === district.toLowerCase()
  ) || 'Ludhiana';

  const fallback = FALLBACK_CROP_DATA[matchKey] || FALLBACK_CROP_DATA['Ludhiana'];

  try {
    const res = await fetch(`${API_BASE}/recommendation/${encodeURIComponent(district)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.recommendations && data.recommendations.length > 0) {
      return data;
    }
  } catch (error) {
    console.warn(`Backend API unavailable, using instant crop recommendation fallback for ${district}.`);
  }
  return { ...fallback, district };
}
