export interface DistrictSummary {
  name: string;
  lat: number;
  lng: number;
  zone: string;
  soilType: string;
  ph: number;
  healthScore: number;
  healthStatus: string;
  recommendedCrop: string;
}

export interface SoilNutrients {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  sulphur: number;
  zinc: number;
  iron: number;
  copper: number;
  manganese: number;
  boron: number;
  calcium: number;
  magnesium: number;
}

export interface DistrictSoilReport {
  district: string;
  latitude: number;
  longitude: number;
  zone: string;
  soilType: string;
  soilTexture: string;
  soilDepth: string;
  drainage: string;
  waterHoldingCapacity: string;
  soilColor: string;
  soilPh: number;
  electricalConductivity: number;
  organicCarbon: number;
  soilHealthScore: number;
  soilHealthStatus: string;
  recommendedCrop: string;
  recommendedFertilizer: string;
  recommendedIrrigation: string;
  weather: {
    temp: number;
    rainfall: number;
    humidity: number;
    moisture: number;
  };
  nutrients: SoilNutrients;
  lastUpdated: string;
}

export interface SoilHistoryPoint {
  month: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicCarbon: number;
  ph: number;
  healthScore: number;
}

export interface FertilizerRecItem {
  name: string;
  dosageKgPerAcre: number;
  stage: string;
  frequency: string;
}

export interface DistrictComparisonData {
  district1: DistrictSoilReport;
  district2: DistrictSoilReport;
}

const API_BASE = '/api/soil';

export async function fetchDistricts(): Promise<DistrictSummary[]> {
  try {
    const res = await fetch(`${API_BASE}/districts`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.districts || [];
  } catch (error) {
    console.error('Failed to fetch soil districts:', error);
    return [];
  }
}

export async function fetchSoilReport(district: string): Promise<DistrictSoilReport | null> {
  try {
    const res = await fetch(`${API_BASE}/report/${encodeURIComponent(district)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.report || null;
  } catch (error) {
    console.error(`Failed to fetch soil report for ${district}:`, error);
    return null;
  }
}

export async function fetchSoilHistory(district: string): Promise<SoilHistoryPoint[]> {
  try {
    const res = await fetch(`${API_BASE}/history/${encodeURIComponent(district)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.history || [];
  } catch (error) {
    console.error(`Failed to fetch soil history for ${district}:`, error);
    return [];
  }
}

export async function fetchSoilRecommendations(district: string) {
  try {
    const res = await fetch(`${API_BASE}/recommendation/${encodeURIComponent(district)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.recommendations || null;
  } catch (error) {
    console.error(`Failed to fetch soil recommendations for ${district}:`, error);
    return null;
  }
}

export async function compareDistricts(d1: string, d2: string): Promise<DistrictComparisonData | null> {
  try {
    const res = await fetch(`${API_BASE}/compare?d1=${encodeURIComponent(d1)}&d2=${encodeURIComponent(d2)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.comparison || null;
  } catch (error) {
    console.error(`Failed to compare districts ${d1} and ${d2}:`, error);
    return null;
  }
}

export async function triggerAdminETLSync(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/sync`, { method: 'POST' });
    return res.ok;
  } catch (error) {
    console.error('Failed to trigger admin ETL sync:', error);
    return false;
  }
}

export async function postFertilizerLog(log: { nitrogen: number; phosphorus: number; potassium: number; date: string }) {
  try {
    const res = await fetch(`${API_BASE}/fertilizer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
    return res.ok;
  } catch (error) {
    console.error('Failed to post fertilizer log:', error);
    return false;
  }
}
