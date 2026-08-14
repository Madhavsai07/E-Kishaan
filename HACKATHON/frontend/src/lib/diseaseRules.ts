export type RiskLevel = 'High' | 'Medium' | 'Low';

export interface DiseaseRisk {
  disease: string;
  type: 'Fungal' | 'Bacterial' | 'Pest';
  symptoms: string;
  riskLevel: RiskLevel;
  reason: string;
  pesticide: string;
  organicAlternative: string;
  precaution: string;
}

interface WeatherSoilContext {
  temp: number;
  humidity: number;
  rainfall: number;
  moisture: number;
  nitrogen: number;
}

interface DiseaseTrigger {
  tempRange?: [number, number];
  humidityAbove?: number;
  humidityBelow?: number;
  rainfallAbove?: number;
  moistureAbove?: number;
  moistureBelow?: number;
  nitrogenAbove?: number;
}

interface DiseaseRule {
  disease: string;
  type: 'Fungal' | 'Bacterial' | 'Pest';
  symptoms: string;
  trigger: DiseaseTrigger;
  pesticide: string;
  organicAlternative: string;
  precaution: string;
}

const CROP_DISEASE_RULES: Record<string, DiseaseRule[]> = {
  Wheat: [
    {
      disease: 'Yellow (Stripe) Rust',
      type: 'Fungal',
      symptoms: 'Yellow-orange stripes of powdery pustules along leaf veins.',
      trigger: { tempRange: [10, 20], humidityAbove: 70 },
      pesticide: 'Propiconazole 25% EC (0.1%) foliar spray',
      organicAlternative: 'Neem oil spray; sow rust-resistant varieties (HD-3086, PBW-725)',
      precaution: 'Avoid excess nitrogen; scan lower leaves weekly during cool, humid spells.',
    },
    {
      disease: 'Karnal Bunt',
      type: 'Fungal',
      symptoms: 'Fishy-smelling black powdery mass replacing grain at flowering.',
      trigger: { tempRange: [18, 24], humidityAbove: 65, rainfallAbove: 2 },
      pesticide: 'Propiconazole or Tebuconazole spray at flowering',
      organicAlternative: 'Trichoderma viride seed treatment before sowing',
      precaution: 'Use certified disease-free seed; avoid irrigation right at flowering.',
    },
  ],
  'Paddy (Rice)': [
    {
      disease: 'Rice Blast',
      type: 'Fungal',
      symptoms: 'Spindle-shaped grey-centred lesions on leaves and neck.',
      trigger: { tempRange: [25, 28], humidityAbove: 80 },
      pesticide: 'Tricyclazole 75% WP foliar spray',
      organicAlternative: 'Balanced nitrogen dosing + Pseudomonas fluorescens spray',
      precaution: 'Avoid excess nitrogen; keep field drainage functional.',
    },
    {
      disease: 'Bacterial Leaf Blight',
      type: 'Bacterial',
      symptoms: 'Water-soaked yellow streaks turning white, wavy leaf margins.',
      trigger: { humidityAbove: 75, moistureAbove: 55, nitrogenAbove: 95 },
      pesticide: 'Copper oxychloride 50% WP + Streptocycline spray',
      organicAlternative: 'Pseudomonas fluorescens seed and foliar treatment',
      precaution: 'Avoid continuous standing water; split nitrogen doses instead of one heavy dose.',
    },
  ],
  Maize: [
    {
      disease: 'Fall Armyworm',
      type: 'Pest',
      symptoms: 'Ragged "window-pane" feeding holes in whorl leaves.',
      trigger: { tempRange: [25, 32], humidityBelow: 60 },
      pesticide: 'Emamectin benzoate 5% SG or Chlorantraniliprole 18.5% SC',
      organicAlternative: 'Neem Seed Kernel Extract (NSKE 5%) spray',
      precaution: 'Scout whorls early morning; treat at first sign of larvae.',
    },
    {
      disease: 'Turcicum Leaf Blight',
      type: 'Fungal',
      symptoms: 'Long cigar-shaped grey-green lesions on leaves.',
      trigger: { tempRange: [20, 27], humidityAbove: 75, rainfallAbove: 5 },
      pesticide: 'Mancozeb 75% WP foliar spray',
      organicAlternative: 'Trichoderma viride soil application',
      precaution: 'Rotate with a non-host crop; avoid dense sowing.',
    },
  ],
  Cotton: [
    {
      disease: 'Bollworm (Pink/American)',
      type: 'Pest',
      symptoms: 'Bored holes in bolls/squares with frass; premature shedding.',
      trigger: { tempRange: [28, 36], humidityBelow: 55 },
      pesticide: 'Emamectin benzoate 5% SG or Spinosad 45% SC',
      organicAlternative: 'Pheromone traps + neem oil (1500 ppm) spray',
      precaution: 'Install 5 pheromone traps/acre for early monitoring.',
    },
    {
      disease: 'Whitefly (Leaf Curl Virus vector)',
      type: 'Pest',
      symptoms: 'Upward leaf curling, yellowing, sticky honeydew on leaves.',
      trigger: { tempRange: [30, 38], humidityBelow: 50, nitrogenAbove: 80 },
      pesticide: 'Imidacloprid 17.8% SL or Diafenthiuron 50% WP',
      organicAlternative: 'Yellow sticky traps + neem oil spray',
      precaution: 'Avoid excess nitrogen; remove weed hosts around field bunds.',
    },
  ],
  Sugarcane: [
    {
      disease: 'Red Rot',
      type: 'Fungal',
      symptoms: 'Reddened internal stalk tissue with cross-white patches, alcohol smell.',
      trigger: { moistureAbove: 55, humidityAbove: 75, tempRange: [28, 35] },
      pesticide: 'Carbendazim 50% WP sett treatment before planting',
      organicAlternative: 'Trichoderma harzianum sett/soil treatment',
      precaution: 'Use disease-free setts; avoid waterlogging in low-lying fields.',
    },
    {
      disease: 'Early Shoot Borer',
      type: 'Pest',
      symptoms: 'Dead heart of central shoot, easily pulled out with foul smell.',
      trigger: { tempRange: [30, 38], humidityBelow: 55 },
      pesticide: 'Chlorantraniliprole 0.4% GR soil application',
      organicAlternative: 'Release Trichogramma chilonis parasitoid',
      precaution: 'Remove and destroy dead-heart shoots promptly.',
    },
  ],
  Mustard: [
    {
      disease: 'Mustard Aphid',
      type: 'Pest',
      symptoms: 'Dense colonies of green-black aphids on shoots and pods, sooty mould.',
      trigger: { tempRange: [15, 25], humidityBelow: 60 },
      pesticide: 'Imidacloprid 17.8% SL or Thiamethoxam 25% WG',
      organicAlternative: 'Neem oil (1%) spray; conserve ladybird beetles',
      precaution: 'Avoid excess nitrogen fertilization, which favors aphid buildup.',
    },
    {
      disease: 'White Rust',
      type: 'Fungal',
      symptoms: 'White pustules on leaf undersides, distorted floral parts.',
      trigger: { tempRange: [15, 20], humidityAbove: 80, rainfallAbove: 3 },
      pesticide: 'Mancozeb 75% WP or Metalaxyl + Mancozeb spray',
      organicAlternative: 'Trichoderma viride seed treatment',
      precaution: 'Remove and destroy infected plant debris after harvest.',
    },
  ],
  Potato: [
    {
      disease: 'Late Blight',
      type: 'Fungal',
      symptoms: 'Water-soaked dark lesions on leaves with white fungal growth underneath.',
      trigger: { tempRange: [10, 20], humidityAbove: 85, rainfallAbove: 5 },
      pesticide: 'Metalaxyl 8% + Mancozeb 64% WP spray',
      organicAlternative: 'Copper oxychloride (bio-permitted) + Trichoderma application',
      precaution: 'Ensure field drainage; avoid overhead irrigation in cool weather.',
    },
    {
      disease: 'Potato Tuber Moth',
      type: 'Pest',
      symptoms: 'Mined tunnels in leaves and tubers, frass at entry points.',
      trigger: { tempRange: [25, 35], humidityBelow: 50, moistureBelow: 30 },
      pesticide: 'Chlorantraniliprole 18.5% SC spray + proper earthing up',
      organicAlternative: 'Neem cake soil application + timely earthing up',
      precaution: 'Prevent soil cracking so tubers stay covered and unexposed.',
    },
  ],
  Tomato: [
    {
      disease: 'Early Blight',
      type: 'Fungal',
      symptoms: 'Concentric-ring brown spots on older leaves, "target board" pattern.',
      trigger: { tempRange: [24, 29], humidityAbove: 80 },
      pesticide: 'Mancozeb 75% WP or Chlorothalonil 75% WP spray',
      organicAlternative: 'Trichoderma viride + neem oil spray',
      precaution: 'Stake plants for airflow; remove and destroy lower infected leaves.',
    },
    {
      disease: 'Fruit Borer',
      type: 'Pest',
      symptoms: 'Round bore holes in fruit with frass, larvae feeding inside.',
      trigger: { tempRange: [25, 33], humidityBelow: 60 },
      pesticide: 'Emamectin benzoate 5% SG spray',
      organicAlternative: 'Pheromone (Helilure) traps + NSKE spray',
      precaution: 'Hand-pick and destroy infested fruits regularly.',
    },
  ],
  Onion: [
    {
      disease: 'Purple Blotch',
      type: 'Fungal',
      symptoms: 'Purplish concentric lesions on leaves, later turning yellow-brown.',
      trigger: { tempRange: [21, 27], humidityAbove: 80, rainfallAbove: 5 },
      pesticide: 'Mancozeb 75% WP or Propiconazole 25% EC spray',
      organicAlternative: 'Trichoderma viride soil application',
      precaution: 'Avoid overhead irrigation; follow crop rotation.',
    },
    {
      disease: 'Thrips',
      type: 'Pest',
      symptoms: 'Silvery streaks and white patches on leaves, distorted growth.',
      trigger: { tempRange: [28, 36], humidityBelow: 45 },
      pesticide: 'Fipronil 5% SC or Spinosad 45% SC spray',
      organicAlternative: 'Neem oil spray + blue sticky traps',
      precaution: 'Avoid moisture stress; irrigate at regular intervals.',
    },
  ],
  Peas: [
    {
      disease: 'Powdery Mildew',
      type: 'Fungal',
      symptoms: 'White powdery fungal growth on leaves, pods, and stems.',
      trigger: { tempRange: [18, 27], humidityAbove: 65 },
      pesticide: 'Wettable Sulphur 80% WP or Carbendazim 50% WP spray',
      organicAlternative: 'Neem oil + diluted baking-soda spray',
      precaution: 'Avoid dense sowing so plants get airflow.',
    },
    {
      disease: 'Pea Aphid',
      type: 'Pest',
      symptoms: 'Clusters of small green insects on tender shoots and pods.',
      trigger: { tempRange: [12, 20], humidityBelow: 60 },
      pesticide: 'Imidacloprid 17.8% SL spray',
      organicAlternative: 'Neem oil spray; conserve natural predators',
      precaution: 'Monitor tender shoots weekly during cool weather.',
    },
  ],
  'Gram (Chickpea)': [
    {
      disease: 'Pod Borer (Helicoverpa)',
      type: 'Pest',
      symptoms: 'Round holes in pods, larvae feeding on developing seeds.',
      trigger: { tempRange: [25, 32], humidityBelow: 55 },
      pesticide: 'Emamectin benzoate 5% SG or Chlorantraniliprole 18.5% SC',
      organicAlternative: 'HaNPV spray + pheromone traps',
      precaution: 'Install bird perches in field to encourage natural predation.',
    },
    {
      disease: 'Fusarium Wilt',
      type: 'Fungal',
      symptoms: 'Sudden drooping and drying of whole plant, blackened roots.',
      trigger: { moistureBelow: 30, tempRange: [25, 32] },
      pesticide: 'Carbendazim 50% WP seed treatment',
      organicAlternative: 'Trichoderma viride seed treatment',
      precaution: 'Use wilt-resistant varieties; avoid prolonged moisture stress.',
    },
  ],
  Barley: [
    {
      disease: 'Yellow Rust',
      type: 'Fungal',
      symptoms: 'Yellow-orange powdery stripes along leaf veins.',
      trigger: { tempRange: [10, 20], humidityAbove: 70 },
      pesticide: 'Propiconazole 25% EC foliar spray',
      organicAlternative: 'Resistant varieties + neem oil spray',
      precaution: 'Monitor crop weekly during cool, humid spells.',
    },
    {
      disease: 'Aphids',
      type: 'Pest',
      symptoms: 'Colonies of small insects on leaves and ears, sooty mould.',
      trigger: { tempRange: [12, 20], humidityBelow: 60 },
      pesticide: 'Imidacloprid 17.8% SL spray',
      organicAlternative: 'Neem oil spray; conserve ladybird beetles',
      precaution: 'Avoid excess nitrogen application.',
    },
  ],
  Sunflower: [
    {
      disease: 'Head Rot',
      type: 'Fungal',
      symptoms: 'Soft brown rot on flower head, spreading to seeds.',
      trigger: { humidityAbove: 80, rainfallAbove: 5, tempRange: [25, 32] },
      pesticide: 'Mancozeb 75% WP spray at flowering',
      organicAlternative: 'Trichoderma viride soil application',
      precaution: 'Avoid water stagnation at the flowering stage.',
    },
    {
      disease: 'Capitulum Borer',
      type: 'Pest',
      symptoms: 'Larvae boring into flower head and feeding on developing seeds.',
      trigger: { tempRange: [25, 32], humidityAbove: 65 },
      pesticide: 'Chlorantraniliprole 18.5% SC spray',
      organicAlternative: 'Neem Seed Kernel Extract spray',
      precaution: 'Monitor closely from head-formation stage onward.',
    },
  ],
  'Millets (Bajra)': [
    {
      disease: 'Downy Mildew (Green Ear disease)',
      type: 'Fungal',
      symptoms: 'Leafy green distortion of ear head instead of grain formation.',
      trigger: { humidityAbove: 80, rainfallAbove: 8, tempRange: [20, 30] },
      pesticide: 'Metalaxyl 35% WS seed treatment',
      organicAlternative: 'Trichoderma viride seed treatment',
      precaution: 'Rogue and destroy infected plants early; use resistant hybrids.',
    },
    {
      disease: 'Shoot Fly',
      type: 'Pest',
      symptoms: 'Dead heart of central seedling shoot at early growth stage.',
      trigger: { tempRange: [28, 36], humidityBelow: 50, moistureBelow: 30 },
      pesticide: 'Thiamethoxam 30% FS seed treatment',
      organicAlternative: 'Neem cake soil application',
      precaution: 'Sow on time to avoid the peak shoot-fly emergence window.',
    },
  ],
  'Summer Vegetables': [
    {
      disease: 'Powdery Mildew',
      type: 'Fungal',
      symptoms: 'White powdery coating on leaf surfaces, stunted growth.',
      trigger: { tempRange: [25, 32], humidityAbove: 60 },
      pesticide: 'Hexaconazole 5% SC or Wettable Sulphur spray',
      organicAlternative: 'Neem oil + diluted baking-soda spray',
      precaution: 'Improve plant spacing to increase airflow.',
    },
    {
      disease: 'Fruit Fly',
      type: 'Pest',
      symptoms: 'Punctured fruit skin, maggots feeding inside, premature dropping.',
      trigger: { tempRange: [26, 34], humidityAbove: 60 },
      pesticide: 'Spinosad 45% SC bait spray',
      organicAlternative: 'Methyl eugenol traps',
      precaution: 'Collect and destroy fallen or infested fruits promptly.',
    },
  ],
};

function resolveCropKey(cropName: string): string | undefined {
  const normalized = cropName.toLowerCase();
  return Object.keys(CROP_DISEASE_RULES).find(
    (key) => normalized.startsWith(key.toLowerCase()) || normalized.includes(key.toLowerCase())
  );
}

function evaluateRisk(trigger: DiseaseTrigger, ctx: WeatherSoilContext): { level: RiskLevel; matched: number; total: number } {
  const checks: boolean[] = [];

  if (trigger.tempRange) checks.push(ctx.temp >= trigger.tempRange[0] && ctx.temp <= trigger.tempRange[1]);
  if (trigger.humidityAbove !== undefined) checks.push(ctx.humidity >= trigger.humidityAbove);
  if (trigger.humidityBelow !== undefined) checks.push(ctx.humidity <= trigger.humidityBelow);
  if (trigger.rainfallAbove !== undefined) checks.push(ctx.rainfall >= trigger.rainfallAbove);
  if (trigger.moistureAbove !== undefined) checks.push(ctx.moisture >= trigger.moistureAbove);
  if (trigger.moistureBelow !== undefined) checks.push(ctx.moisture <= trigger.moistureBelow);
  if (trigger.nitrogenAbove !== undefined) checks.push(ctx.nitrogen >= trigger.nitrogenAbove);

  const matched = checks.filter(Boolean).length;
  const total = checks.length || 1;
  const ratio = matched / total;

  const level: RiskLevel = ratio === 1 ? 'High' : ratio >= 0.5 ? 'Medium' : 'Low';
  return { level, matched, total };
}

function buildReason(level: RiskLevel, ctx: WeatherSoilContext): string {
  const conditionSummary = `${ctx.temp.toFixed(1)}°C, ${Math.round(ctx.humidity)}% humidity, ${ctx.rainfall.toFixed(1)}mm rainfall`;
  if (level === 'High') return `Current conditions (${conditionSummary}) are highly favorable for this disease/pest.`;
  if (level === 'Medium') return `Current conditions (${conditionSummary}) are moderately favorable — stay alert.`;
  return `Current conditions (${conditionSummary}) are not favorable for this disease/pest right now.`;
}

export function getDiseaseRisks(
  cropName: string,
  weather: { temp: number; humidity: number; rainfall: number; moisture: number },
  nitrogen: number
): DiseaseRisk[] {
  const key = resolveCropKey(cropName);
  if (!key) return [];

  const ctx: WeatherSoilContext = { ...weather, nitrogen };

  return CROP_DISEASE_RULES[key].map((rule) => {
    const { level } = evaluateRisk(rule.trigger, ctx);
    return {
      disease: rule.disease,
      type: rule.type,
      symptoms: rule.symptoms,
      riskLevel: level,
      reason: buildReason(level, ctx),
      pesticide: rule.pesticide,
      organicAlternative: rule.organicAlternative,
      precaution: rule.precaution,
    };
  });
}
