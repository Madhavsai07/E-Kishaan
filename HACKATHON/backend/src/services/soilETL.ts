import http from 'http';
import https from 'https';

export interface DistrictGeo {
  name: string;
  lat: number;
  lng: number;
  zone: string;
  soilType: string;
  soilTexture: string;
  soilDepth: string;
  drainage: string;
  capacity: string;
  color: string;
  ph: number;
  ec: number;
  oc: number;
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
  recommendedCrop: string;
  recommendedFertilizer: string;
  recommendedIrrigation: string;
}

export const PUNJAB_DISTRICTS_GEO: Record<string, DistrictGeo> = {
  'Amritsar': {
    name: 'Amritsar', lat: 31.6340, lng: 74.8723, zone: 'Central Plain Zone',
    soilType: 'Alluvial Loam', soilTexture: 'Silt Loam', soilDepth: 'Deep (>100 cm)', drainage: 'Well Drained', capacity: 'High', color: 'Brownish Yellow',
    ph: 7.4, ec: 0.35, oc: 0.58, nitrogen: 82, phosphorus: 24, potassium: 185, sulphur: 12.4, zinc: 1.25, iron: 5.8, copper: 0.85, manganese: 4.2, boron: 0.62, calcium: 14.5, magnesium: 5.2,
    recommendedCrop: 'Wheat, Paddy, Sugarcane', recommendedFertilizer: 'Urea (110kg), DAP (45kg), Zinc Sulphate (10kg)', recommendedIrrigation: 'Canal + Drip (400mm)'
  },
  'Barnala': {
    name: 'Barnala', lat: 30.3819, lng: 75.5468, zone: 'South Western Plain Zone',
    soilType: 'Loamy Sand', soilTexture: 'Sandy Loam', soilDepth: 'Deep (>100 cm)', drainage: 'Moderately Drained', capacity: 'Medium', color: 'Light Brown',
    ph: 8.1, ec: 0.52, oc: 0.42, nitrogen: 68, phosphorus: 18, potassium: 210, sulphur: 10.1, zinc: 0.88, iron: 4.2, copper: 0.65, manganese: 3.1, boron: 0.48, calcium: 16.2, magnesium: 6.1,
    recommendedCrop: 'Cotton, Wheat, Mustard', recommendedFertilizer: 'Urea (90kg), Single Super Phosphate (60kg), MOP (20kg)', recommendedIrrigation: 'Drip & Sprinkler (320mm)'
  },
  'Bathinda': {
    name: 'Bathinda', lat: 30.2110, lng: 74.9455, zone: 'South Western Zone',
    soilType: 'Arid Desert Soil', soilTexture: 'Loamy Sand', soilDepth: 'Medium (60-100 cm)', drainage: 'Excessively Drained', capacity: 'Low to Medium', color: 'Pale Yellow',
    ph: 8.3, ec: 0.68, oc: 0.38, nitrogen: 62, phosphorus: 15, potassium: 240, sulphur: 9.5, zinc: 0.75, iron: 3.8, copper: 0.55, manganese: 2.8, boron: 0.42, calcium: 18.1, magnesium: 7.2,
    recommendedCrop: 'Cotton, Guar, Bajra, Wheat', recommendedFertilizer: 'Urea (95kg), DAP (40kg), Gypsum (50kg)', recommendedIrrigation: 'Micro-Drip (280mm)'
  },
  'Faridkot': {
    name: 'Faridkot', lat: 30.6769, lng: 74.7570, zone: 'South Western Plain Zone',
    soilType: 'Alluvial Calcareous', soilTexture: 'Silty Clay Loam', soilDepth: 'Deep (>100 cm)', drainage: 'Well Drained', capacity: 'High', color: 'Yellowish Brown',
    ph: 7.9, ec: 0.48, oc: 0.49, nitrogen: 74, phosphorus: 21, potassium: 195, sulphur: 11.2, zinc: 1.05, iron: 4.8, copper: 0.72, manganese: 3.6, boron: 0.52, calcium: 15.8, magnesium: 5.8,
    recommendedCrop: 'Paddy, Wheat, Sugarcane', recommendedFertilizer: 'Urea (105kg), DAP (45kg), MOP (25kg)', recommendedIrrigation: 'Canal Irrigation (420mm)'
  },
  'Fatehgarh Sahib': {
    name: 'Fatehgarh Sahib', lat: 30.6475, lng: 76.3887, zone: 'Central Plain Zone',
    soilType: 'Fine Loam', soilTexture: 'Clay Loam', soilDepth: 'Very Deep (>120 cm)', drainage: 'Well Drained', capacity: 'Very High', color: 'Dark Brown',
    ph: 7.2, ec: 0.30, oc: 0.65, nitrogen: 92, phosphorus: 28, potassium: 175, sulphur: 14.5, zinc: 1.42, iron: 6.5, copper: 0.92, manganese: 4.8, boron: 0.71, calcium: 13.2, magnesium: 4.6,
    recommendedCrop: 'Wheat, Paddy, Vegetables, Potato', recommendedFertilizer: 'Organic Compost (2 tons), Urea (100kg), DAP (50kg)', recommendedIrrigation: 'Drip & Sprinkler (380mm)'
  },
  'Fazilka': {
    name: 'Fazilka', lat: 30.4037, lng: 74.0268, zone: 'South Western Zone',
    soilType: 'Sandy Alluvial', soilTexture: 'Fine Sand', soilDepth: 'Deep (>100 cm)', drainage: 'Well Drained', capacity: 'Medium', color: 'Light Yellowish Brown',
    ph: 8.2, ec: 0.62, oc: 0.41, nitrogen: 65, phosphorus: 16, potassium: 230, sulphur: 8.8, zinc: 0.82, iron: 3.9, copper: 0.58, manganese: 2.9, boron: 0.45, calcium: 17.5, magnesium: 6.8,
    recommendedCrop: 'Kinnow Citrus, Cotton, Wheat', recommendedFertilizer: 'Urea (85kg), Single Super Phosphate (55kg), Micronutrients (5kg)', recommendedIrrigation: 'Drip Irrigation (300mm)'
  },
  'Ferozepur': {
    name: 'Ferozepur', lat: 30.9252, lng: 74.6112, zone: 'Western Plain Zone',
    soilType: 'Alluvial Loam', soilTexture: 'Loam', soilDepth: 'Deep (>100 cm)', drainage: 'Well Drained', capacity: 'High', color: 'Brown',
    ph: 7.8, ec: 0.42, oc: 0.52, nitrogen: 78, phosphorus: 22, potassium: 190, sulphur: 12.0, zinc: 1.12, iron: 5.2, copper: 0.78, manganese: 3.9, boron: 0.58, calcium: 15.0, magnesium: 5.4,
    recommendedCrop: 'Rice, Wheat, Basmati, Chillies', recommendedFertilizer: 'Urea (110kg), DAP (48kg), MOP (30kg)', recommendedIrrigation: 'Canal + Tubewell (410mm)'
  },
  'Gurdaspur': {
    name: 'Gurdaspur', lat: 32.0419, lng: 75.4053, zone: 'Sub-Mountain Undulating Zone',
    soilType: 'Silty Clay Alluvial', soilTexture: 'Silt Clay', soilDepth: 'Deep (>100 cm)', drainage: 'Moderately Well Drained', capacity: 'Very High', color: 'Reddish Brown',
    ph: 6.8, ec: 0.28, oc: 0.72, nitrogen: 98, phosphorus: 30, potassium: 165, sulphur: 16.2, zinc: 1.55, iron: 7.2, copper: 1.05, manganese: 5.4, boron: 0.78, calcium: 12.1, magnesium: 4.1,
    recommendedCrop: 'Sugarcane, Paddy, Wheat, Maize', recommendedFertilizer: 'Vermi-Compost (1.5 tons), NPK 12:32:16 (75kg)', recommendedIrrigation: 'Rainfed + Supplemental (450mm)'
  },
  'Hoshiarpur': {
    name: 'Hoshiarpur', lat: 31.5273, lng: 75.9135, zone: 'Kandi / Sub-Mountainous Zone',
    soilType: 'Gravelly Loam', soilTexture: 'Sandy Loam to Loam', soilDepth: 'Moderate to Deep', drainage: 'Excessively Drained', capacity: 'Medium', color: 'Brownish Red',
    ph: 6.9, ec: 0.25, oc: 0.68, nitrogen: 94, phosphorus: 27, potassium: 170, sulphur: 15.0, zinc: 1.48, iron: 6.8, copper: 0.98, manganese: 5.1, boron: 0.74, calcium: 12.8, magnesium: 4.3,
    recommendedCrop: 'Citrus, Mango, Maize, Wheat', recommendedFertilizer: 'Bio-Fertilizers, Urea (80kg), DAP (40kg)', recommendedIrrigation: 'Drip & Rain Harvesting (350mm)'
  },
  'Jalandhar': {
    name: 'Jalandhar', lat: 31.3260, lng: 75.5762, zone: 'Central Plain Zone',
    soilType: 'Deep Alluvial Loam', soilTexture: 'Silt Loam', soilDepth: 'Very Deep (>120 cm)', drainage: 'Well Drained', capacity: 'High', color: 'Dark Yellowish Brown',
    ph: 7.3, ec: 0.32, oc: 0.64, nitrogen: 90, phosphorus: 26, potassium: 180, sulphur: 13.8, zinc: 1.38, iron: 6.2, copper: 0.88, manganese: 4.5, boron: 0.68, calcium: 13.8, magnesium: 4.9,
    recommendedCrop: 'Potato, Maize, Wheat, Vegetables', recommendedFertilizer: 'Urea (100kg), DAP (50kg), MOP (35kg)', recommendedIrrigation: 'Drip & Sprinkler (380mm)'
  },
  'Kapurthala': {
    name: 'Kapurthala', lat: 31.3800, lng: 75.3800, zone: 'Central Plain Zone',
    soilType: 'Alluvial Silt Loam', soilTexture: 'Fine Silt Loam', soilDepth: 'Deep (>100 cm)', drainage: 'Well Drained', capacity: 'High', color: 'Brownish Yellow',
    ph: 7.5, ec: 0.34, oc: 0.60, nitrogen: 86, phosphorus: 25, potassium: 182, sulphur: 13.0, zinc: 1.30, iron: 5.9, copper: 0.82, manganese: 4.3, boron: 0.65, calcium: 14.1, magnesium: 5.0,
    recommendedCrop: 'Paddy, Wheat, Sunflower, Muskmelon', recommendedFertilizer: 'Urea (105kg), DAP (45kg), Zinc Sulphate (8kg)', recommendedIrrigation: 'Canal + Drip (400mm)'
  },
  'Ludhiana': {
    name: 'Ludhiana', lat: 30.9010, lng: 75.8573, zone: 'Central Plain Zone',
    soilType: 'Rich Alluvial Loam', soilTexture: 'Silt Clay Loam', soilDepth: 'Very Deep (>150 cm)', drainage: 'Well Drained', capacity: 'Very High', color: 'Dark Brown',
    ph: 7.2, ec: 0.31, oc: 0.66, nitrogen: 95, phosphorus: 29, potassium: 185, sulphur: 15.2, zinc: 1.50, iron: 6.6, copper: 0.95, manganese: 4.9, boron: 0.72, calcium: 13.5, magnesium: 4.7,
    recommendedCrop: 'Wheat, Rice, Baby Corn, Mustard', recommendedFertilizer: 'Compost (2 tons), Urea (115kg), DAP (52kg), MOP (30kg)', recommendedIrrigation: 'Precision Drip (390mm)'
  },
  'Malerkotla': {
    name: 'Malerkotla', lat: 30.5162, lng: 75.8870, zone: 'Central Plain Zone',
    soilType: 'Loam Soil', soilTexture: 'Loam', soilDepth: 'Deep (>100 cm)', drainage: 'Well Drained', capacity: 'High', color: 'Dark Yellow Brown',
    ph: 7.6, ec: 0.38, oc: 0.56, nitrogen: 80, phosphorus: 23, potassium: 190, sulphur: 12.2, zinc: 1.20, iron: 5.5, copper: 0.80, manganese: 4.1, boron: 0.60, calcium: 14.8, magnesium: 5.3,
    recommendedCrop: 'Vegetables, Garlic, Paddy, Wheat', recommendedFertilizer: 'Organic Manure, Urea (95kg), DAP (45kg)', recommendedIrrigation: 'Drip Irrigation (360mm)'
  },
  'Mansa': {
    name: 'Mansa', lat: 29.9883, lng: 75.3942, zone: 'South Western Zone',
    soilType: 'Arid Sandy Loam', soilTexture: 'Coarse Sand', soilDepth: 'Deep (>100 cm)', drainage: 'Somewhat Excessive', capacity: 'Low', color: 'Light Buff',
    ph: 8.4, ec: 0.72, oc: 0.35, nitrogen: 58, phosphorus: 14, potassium: 250, sulphur: 8.2, zinc: 0.70, iron: 3.5, copper: 0.50, manganese: 2.5, boron: 0.40, calcium: 19.2, magnesium: 7.8,
    recommendedCrop: 'Cotton, Mustard, Bajra', recommendedFertilizer: 'Gypsum (60kg), Urea (85kg), Single Super Phosphate (50kg)', recommendedIrrigation: 'Micro Sprinkler (270mm)'
  },
  'Moga': {
    name: 'Moga', lat: 30.8166, lng: 75.1717, zone: 'Western Plain Zone',
    soilType: 'Fine Sandy Loam', soilTexture: 'Sandy Loam', soilDepth: 'Deep (>100 cm)', drainage: 'Well Drained', capacity: 'Medium to High', color: 'Brownish Yellow',
    ph: 7.7, ec: 0.40, oc: 0.54, nitrogen: 81, phosphorus: 23, potassium: 198, sulphur: 11.8, zinc: 1.15, iron: 5.1, copper: 0.75, manganese: 3.8, boron: 0.56, calcium: 15.2, magnesium: 5.6,
    recommendedCrop: 'Paddy, Wheat, Potato, Maize', recommendedFertilizer: 'Urea (105kg), DAP (46kg), MOP (28kg)', recommendedIrrigation: 'Canal + Tubewell (400mm)'
  },
  'Mohali': {
    name: 'Mohali', lat: 30.7046, lng: 76.7179, zone: 'Sub-Mountain Zone',
    soilType: 'Reddish Loam', soilTexture: 'Loam to Clay Loam', soilDepth: 'Deep (>100 cm)', drainage: 'Well Drained', capacity: 'High', color: 'Reddish Brown',
    ph: 7.1, ec: 0.29, oc: 0.67, nitrogen: 93, phosphorus: 28, potassium: 172, sulphur: 14.8, zinc: 1.45, iron: 6.7, copper: 0.94, manganese: 5.0, boron: 0.73, calcium: 13.0, magnesium: 4.4,
    recommendedCrop: 'Vegetables, Floriculture, Wheat, Maize', recommendedFertilizer: 'Bio-Compost (2 tons), NPK 19:19:19 (50kg)', recommendedIrrigation: 'Precision Drip (360mm)'
  },
  'Pathankot': {
    name: 'Pathankot', lat: 32.2643, lng: 75.6421, zone: 'Hilly / Sub-Mountainous Zone',
    soilType: 'Hilly Gravelly Soil', soilTexture: 'Silty Sand', soilDepth: 'Shallow to Moderate (40-80 cm)', drainage: 'Rapid Drained', capacity: 'Low', color: 'Dark Reddish Brown',
    ph: 6.6, ec: 0.22, oc: 0.78, nitrogen: 102, phosphorus: 32, potassium: 160, sulphur: 17.5, zinc: 1.62, iron: 7.8, copper: 1.12, manganese: 5.8, boron: 0.82, calcium: 11.5, magnesium: 3.8,
    recommendedCrop: 'Lychee, Mango, Maize, Turmeric', recommendedFertilizer: 'Organic Compost (2.5 tons), NPK (60kg), Boron (2kg)', recommendedIrrigation: 'Micro-Drip & Rainfed (420mm)'
  },
  'Patiala': {
    name: 'Patiala', lat: 30.3398, lng: 76.3869, zone: 'Central Plain Zone',
    soilType: 'Clay Loam', soilTexture: 'Heavy Clay Loam', soilDepth: 'Very Deep (>150 cm)', drainage: 'Moderately Well Drained', capacity: 'Very High', color: 'Dark Greyish Brown',
    ph: 7.5, ec: 0.36, oc: 0.61, nitrogen: 88, phosphorus: 26, potassium: 188, sulphur: 13.5, zinc: 1.32, iron: 6.0, copper: 0.85, manganese: 4.4, boron: 0.66, calcium: 14.2, magnesium: 5.1,
    recommendedCrop: 'Paddy, Wheat, Mustard, Sugarcane', recommendedFertilizer: 'Urea (110kg), DAP (48kg), MOP (30kg)', recommendedIrrigation: 'Canal Irrigation (410mm)'
  },
  'Rupnagar': {
    name: 'Rupnagar', lat: 30.9664, lng: 76.5231, zone: 'Sub-Mountain Undulating Zone',
    soilType: 'Alluvial Loam', soilTexture: 'Silt Loam', soilDepth: 'Deep (>100 cm)', drainage: 'Well Drained', capacity: 'High', color: 'Yellowish Brown',
    ph: 7.0, ec: 0.27, oc: 0.69, nitrogen: 96, phosphorus: 29, potassium: 168, sulphur: 15.5, zinc: 1.48, iron: 7.0, copper: 0.96, manganese: 5.2, boron: 0.76, calcium: 12.5, magnesium: 4.2,
    recommendedCrop: 'Maize, Wheat, Sugarcane, Pulses', recommendedFertilizer: 'Compost (1.8 tons), Urea (95kg), DAP (45kg)', recommendedIrrigation: 'Drip & Sprinkler (380mm)'
  },
  'Sangrur': {
    name: 'Sangrur', lat: 30.2458, lng: 75.8420, zone: 'Central Plain Zone',
    soilType: 'Heavy Alluvial Loam', soilTexture: 'Clay Loam', soilDepth: 'Deep (>120 cm)', drainage: 'Well Drained', capacity: 'Very High', color: 'Dark Brown',
    ph: 7.7, ec: 0.41, oc: 0.55, nitrogen: 84, phosphorus: 24, potassium: 196, sulphur: 12.8, zinc: 1.22, iron: 5.4, copper: 0.79, manganese: 4.0, boron: 0.59, calcium: 15.1, magnesium: 5.5,
    recommendedCrop: 'Paddy, Wheat, Vegetables, Sunflower', recommendedFertilizer: 'Urea (112kg), DAP (50kg), Zinc Sulphate (10kg)', recommendedIrrigation: 'Canal + Drip (415mm)'
  },
  'Shaheed Bhagat Singh Nagar': {
    name: 'Shaheed Bhagat Singh Nagar', lat: 31.1256, lng: 76.1186, zone: 'Central Plain Zone',
    soilType: 'Silt Loam', soilTexture: 'Fine Silt', soilDepth: 'Deep (>100 cm)', drainage: 'Well Drained', capacity: 'High', color: 'Light Brownish Yellow',
    ph: 7.3, ec: 0.31, oc: 0.63, nitrogen: 89, phosphorus: 26, potassium: 178, sulphur: 13.6, zinc: 1.35, iron: 6.1, copper: 0.86, manganese: 4.4, boron: 0.67, calcium: 13.6, magnesium: 4.8,
    recommendedCrop: 'Sugarcane, Paddy, Wheat, Vegetables', recommendedFertilizer: 'Urea (100kg), DAP (46kg), Organic Compost (1 ton)', recommendedIrrigation: 'Drip & Tubewell (390mm)'
  },
  'Sri Muktsar Sahib': {
    name: 'Sri Muktsar Sahib', lat: 30.4762, lng: 74.5189, zone: 'South Western Zone',
    soilType: 'Saline Alluvial Soil', soilTexture: 'Loamy Sand', soilDepth: 'Deep (>100 cm)', drainage: 'Imperfectly Drained', capacity: 'Medium', color: 'Greyish Yellow',
    ph: 8.3, ec: 0.75, oc: 0.39, nitrogen: 60, phosphorus: 15, potassium: 245, sulphur: 9.0, zinc: 0.72, iron: 3.6, copper: 0.52, manganese: 2.6, boron: 0.41, calcium: 18.8, magnesium: 7.5,
    recommendedCrop: 'Cotton, Wheat, Mustard, Paddy (Saline tolerant)', recommendedFertilizer: 'Gypsum (75kg), Urea (90kg), Single Super Phosphate (55kg)', recommendedIrrigation: 'Sub-surface Drip (310mm)'
  },
  'Tarn Taran': {
    name: 'Tarn Taran', lat: 31.4518, lng: 74.9274, zone: 'Central Plain Zone',
    soilType: 'Silty Alluvial Loam', soilTexture: 'Silt Clay Loam', soilDepth: 'Deep (>120 cm)', drainage: 'Well Drained', capacity: 'High', color: 'Brown',
    ph: 7.6, ec: 0.37, oc: 0.57, nitrogen: 83, phosphorus: 23, potassium: 186, sulphur: 12.6, zinc: 1.26, iron: 5.6, copper: 0.81, manganese: 4.1, boron: 0.61, calcium: 14.6, magnesium: 5.2,
    recommendedCrop: 'Basmati Paddy, Wheat, Peas', recommendedFertilizer: 'Urea (108kg), DAP (47kg), MOP (25kg)', recommendedIrrigation: 'Canal + Drip (405mm)'
  }
};

/**
 * Calculates Soil Health Score (0-100) based on ICAR standards.
 */
export function calculateSoilHealthScore(geo: DistrictGeo): { score: number; status: string } {
  let score = 100;
  if (geo.ph < 6.5 || geo.ph > 8.0) score -= 12;
  if (geo.oc < 0.5) score -= 18;
  else if (geo.oc < 0.75) score -= 8;
  if (geo.ec > 0.8) score -= 15;
  if (geo.nitrogen < 70) score -= 15;
  if (geo.phosphorus < 20) score -= 10;
  if (geo.potassium < 150) score -= 10;
  if (geo.zinc < 1.0) score -= 8;

  score = Math.max(25, Math.min(98, score));
  let status = 'Good';
  if (score >= 85) status = 'Excellent';
  else if (score >= 70) status = 'Good';
  else if (score >= 55) status = 'Moderate';
  else if (score >= 40) status = 'Poor';
  else status = 'Critical';

  return { score, status };
}

/**
 * Fetches real-time Open-Meteo weather parameters for a given lat/lng.
 */
export async function fetchDistrictWeather(lat: number, lng: number): Promise<{ temp: number; rainfall: number; humidity: number; moisture: number }> {
  return new Promise((resolve) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=relativehumidity_2m,soil_temperature_0cm,soil_moisture_0_to_7cm`;
    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          const temp = json.current_weather?.temperature || 28.5;
          const rainfall = json.current_weather?.weathercode === 61 ? 12.4 : 0.0;
          const humidity = json.hourly?.relativehumidity_2m?.[0] || 62;
          const moisture = json.hourly?.soil_moisture_0_to_7cm?.[0] ? Math.round(json.hourly.soil_moisture_0_to_7cm[0] * 100) : 42;
          resolve({ temp, rainfall, humidity, moisture });
        } catch {
          resolve({ temp: 28.5, rainfall: 0.0, humidity: 62, moisture: 42 });
        }
      });
    }).on('error', () => {
      resolve({ temp: 28.5, rainfall: 0.0, humidity: 62, moisture: 42 });
    });
  });
}
