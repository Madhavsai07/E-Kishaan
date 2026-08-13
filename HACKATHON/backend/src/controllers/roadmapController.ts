import { Request, Response } from 'express';
import { PUNJAB_DISTRICTS_GEO, fetchDistrictWeather } from '../services/soilETL';

export interface FarmOnboardingProfile {
  farmerName: string;
  district: string;
  village: string;
  state: string;
  language: string;
  farmSizeAcres: number;
  numFields: number;
  irrigationSource: string;
  waterAvailability: string;
  currentCrop: string;
  previousCrop: string;
  plantingDate: string;
  expectedHarvestDate: string;
  growthStage: string;
  farmingGoals: string[];
}

export interface FarmDailyDiary {
  checkInDate: string;
  irrigated: boolean;
  fertilizerApplied: boolean;
  fertilizerDetails?: string;
  pestsObserved: boolean;
  diseaseSymptoms?: string;
  rainfallObserved: boolean;
  laborersCount: number;
  notes?: string;
}

export interface DailyPlannerTask {
  id: string;
  taskName: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  duration: string;
  requiredMaterials: string;
  reason: string;
  expectedBenefit: string;
  deadline: string;
  consequenceIfSkipped: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Skipped' | 'Delayed';
}

export interface RoadmapPhase {
  phaseNumber: number;
  phaseName: string;
  status: 'Completed' | 'In Progress' | 'Upcoming';
  expectedStartDate: string;
  expectedEndDate: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  aiRecommendation: string;
  progressPercent: number;
  checklist: string[];
  estimatedCost: string;
  expectedReturn: string;
}

export interface SmartAlert {
  id: string;
  category: 'Roadmap' | 'Irrigation' | 'Fertilizer' | 'Weather' | 'Disease/Pest' | 'Harvest' | 'Market';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  reason: string;
  recommendedAction: string;
  consequenceIfIgnored: string;
  timestamp: string;
}

// Global In-Memory Persistent Profile (Mock Supabase State for dynamic updates)
let currentProfile: FarmOnboardingProfile = {
  farmerName: 'Gurpreet Singh',
  district: 'Ludhiana',
  village: 'Gill',
  state: 'Punjab',
  language: 'English',
  farmSizeAcres: 5.0,
  numFields: 2,
  irrigationSource: 'Tube-well + Canal',
  waterAvailability: 'High',
  currentCrop: 'Wheat (HD-2967)',
  previousCrop: 'Paddy (Rice)',
  plantingDate: '2026-04-15',
  expectedHarvestDate: '2026-09-15',
  growthStage: 'Vegetative Stage',
  farmingGoals: ['Maximum Profit', 'Reduce Fertilizer Cost'],
};

let dailyDiariesHistory: FarmDailyDiary[] = [];
let taskStatusMap: Record<string, 'Not Started' | 'In Progress' | 'Completed' | 'Skipped' | 'Delayed'> = {};

export async function getFarmRoadmapHandler(req: Request, res: Response) {
  const districtName = (req.params.district || req.query.district || currentProfile.district || 'Ludhiana') as string;
  const matchKey = Object.keys(PUNJAB_DISTRICTS_GEO).find(
    (k) => k.toLowerCase() === districtName.toLowerCase()
  ) || 'Ludhiana';

  const geo = PUNJAB_DISTRICTS_GEO[matchKey];
  const weather = await fetchDistrictWeather(geo.lat, geo.lng);

  // Dynamic 14-Phase Farming Lifecycle
  const phases: RoadmapPhase[] = [
    {
      phaseNumber: 1,
      phaseName: 'Land Preparation',
      status: 'Completed',
      expectedStartDate: '2026-04-01',
      expectedEndDate: '2026-04-10',
      priority: 'High',
      aiRecommendation: 'Deep plowing with disc harrow; incorporate 2 tons/acre organic vermicompost.',
      progressPercent: 100,
      checklist: ['Soil tilling', 'Compost spreading', 'Leveling'],
      estimatedCost: '₹3,500/acre',
      expectedReturn: 'Soil structure improvement (+15% root depth)',
    },
    {
      phaseNumber: 2,
      phaseName: 'Seed Selection',
      status: 'Completed',
      expectedStartDate: '2026-04-10',
      expectedEndDate: '2026-04-12',
      priority: 'Critical',
      aiRecommendation: 'Certified ICAR HD-2967 wheat variety resistant to yellow rust.',
      progressPercent: 100,
      checklist: ['Certified seed purchase', 'Germination test (>90%)'],
      estimatedCost: '₹1,200/acre',
      expectedReturn: 'Disease resistance protection',
    },
    {
      phaseNumber: 3,
      phaseName: 'Seed Treatment',
      status: 'Completed',
      expectedStartDate: '2026-04-13',
      expectedEndDate: '2026-04-14',
      priority: 'High',
      aiRecommendation: 'Treat seeds with Trichoderma viride @ 4g/kg to prevent root rot.',
      progressPercent: 100,
      checklist: ['Fungicide coating', 'Bio-fertilizer inoculation'],
      estimatedCost: '₹400/acre',
      expectedReturn: 'Prevent fungal seedling rot',
    },
    {
      phaseNumber: 4,
      phaseName: 'Field Preparation',
      status: 'Completed',
      expectedStartDate: '2026-04-14',
      expectedEndDate: '2026-04-15',
      priority: 'Medium',
      aiRecommendation: 'Laser land leveling to optimize irrigation water distribution efficiency.',
      progressPercent: 100,
      checklist: ['Laser leveling', 'Ridge making'],
      estimatedCost: '₹1,800/acre',
      expectedReturn: '25% Water savings during irrigation',
    },
    {
      phaseNumber: 5,
      phaseName: 'Sowing',
      status: 'Completed',
      expectedStartDate: '2026-04-15',
      expectedEndDate: '2026-04-18',
      priority: 'Critical',
      aiRecommendation: 'Seed drill sowing at 45kg/acre with 22.5cm row spacing at 5cm depth.',
      progressPercent: 100,
      checklist: ['Basal DAP application', 'Seed drill operation'],
      estimatedCost: '₹2,200/acre',
      expectedReturn: 'Optimal crop density (220 plants/m²)',
    },
    {
      phaseNumber: 6,
      phaseName: 'Germination',
      status: 'Completed',
      expectedStartDate: '2026-04-19',
      expectedEndDate: '2026-04-28',
      priority: 'High',
      aiRecommendation: 'Monitor emergence rate; maintain soil moisture without waterlogging.',
      progressPercent: 100,
      checklist: ['Emergence count', 'First light irrigation'],
      estimatedCost: '₹800/acre',
      expectedReturn: 'Uniform canopy establishment',
    },
    {
      phaseNumber: 7,
      phaseName: 'Early Vegetative',
      status: 'Completed',
      expectedStartDate: '2026-04-29',
      expectedEndDate: '2026-05-15',
      priority: 'Medium',
      aiRecommendation: 'Apply first top dressing Urea @ 25kg/acre after Crown Root Initiation.',
      progressPercent: 100,
      checklist: ['CRI stage check', 'First N top-dressing'],
      estimatedCost: '₹950/acre',
      expectedReturn: 'Active tiller count boost',
    },
    {
      phaseNumber: 8,
      phaseName: 'Vegetative',
      status: 'In Progress',
      expectedStartDate: '2026-05-16',
      expectedEndDate: '2026-06-15',
      priority: 'Critical',
      aiRecommendation: 'Apply 2nd Nitrogen split (Urea 30kg/acre); spray Zinc Sulphate 0.5%.',
      progressPercent: 65,
      checklist: ['Second Urea split', 'Zinc spray', 'Weed management'],
      estimatedCost: '₹1,500/acre',
      expectedReturn: 'Max biomass & tillers/plant',
    },
    {
      phaseNumber: 9,
      phaseName: 'Flowering',
      status: 'Upcoming',
      expectedStartDate: '2026-06-16',
      expectedEndDate: '2026-07-10',
      priority: 'Critical',
      aiRecommendation: 'Critical water requirement stage; maintain 50-60mm moisture. Avoid pesticide spray during peak bloom.',
      progressPercent: 0,
      checklist: ['Flowering irrigation', 'Aphid monitoring'],
      estimatedCost: '₹1,200/acre',
      expectedReturn: 'Grain head count spike',
    },
    {
      phaseNumber: 10,
      phaseName: 'Grain Development',
      status: 'Upcoming',
      expectedStartDate: '2026-07-11',
      expectedEndDate: '2026-08-10',
      priority: 'High',
      aiRecommendation: 'Foliar spray of Potassium Nitrate 1% (13-0-45) to enhance 1000-grain weight.',
      progressPercent: 0,
      checklist: ['KNO3 spray', 'Final light irrigation'],
      estimatedCost: '₹1,100/acre',
      expectedReturn: '+12% Grain weight & test weight',
    },
    {
      phaseNumber: 11,
      phaseName: 'Maturity',
      status: 'Upcoming',
      expectedStartDate: '2026-08-11',
      expectedEndDate: '2026-08-25',
      priority: 'Medium',
      aiRecommendation: 'Stop all irrigation 14 days prior to harvest to allow uniform drying.',
      progressPercent: 0,
      checklist: ['Stop irrigation', 'Moisture check (<14%)'],
      estimatedCost: '₹300/acre',
      expectedReturn: 'Prevent lodging & grain decay',
    },
    {
      phaseNumber: 12,
      phaseName: 'Harvest',
      status: 'Upcoming',
      expectedStartDate: '2026-08-26',
      expectedEndDate: '2026-09-05',
      priority: 'Critical',
      aiRecommendation: 'Combine harvester operation when grain moisture drops to 12-14%.',
      progressPercent: 0,
      checklist: ['Combine booking', 'Bagger arrangement'],
      estimatedCost: '₹2,500/acre',
      expectedReturn: 'Minimal shattering loss (<1%)',
    },
    {
      phaseNumber: 13,
      phaseName: 'Storage',
      status: 'Upcoming',
      expectedStartDate: '2026-09-06',
      expectedEndDate: '2026-09-15',
      priority: 'Medium',
      aiRecommendation: 'Store in hermetic bags treated with Neem extract; keep relative humidity <65%.',
      progressPercent: 0,
      checklist: ['Hermetic storage', 'Moisture meter check'],
      estimatedCost: '₹600/acre',
      expectedReturn: 'Protect against weevils & mold',
    },
    {
      phaseNumber: 14,
      phaseName: 'Market Selling',
      status: 'Upcoming',
      expectedStartDate: '2026-09-16',
      expectedEndDate: '2026-09-30',
      priority: 'High',
      aiRecommendation: 'Sell at local Ludhiana Mandi during peak price window (expected ₹2,425/quintal).',
      progressPercent: 0,
      checklist: ['Mandi slot booking', 'Quality certification'],
      estimatedCost: '₹800/acre',
      expectedReturn: 'Maximum net ROI realization',
    },
  ];

  // Dynamic "Today's Farm Plan" Tasks
  const todayTasks: DailyPlannerTask[] = [
    {
      id: 'task-1',
      taskName: 'Check Field 1 Soil Moisture & CRI Stage',
      priority: 'High',
      duration: '30 mins',
      requiredMaterials: 'Soil moisture probe / spade',
      reason: `Live Open-Meteo temp is ${weather.temp}°C and soil moisture is ${weather.moisture}%.`,
      expectedBenefit: 'Determines whether next 35mm irrigation is required today or can be delayed.',
      deadline: 'Today, 5:00 PM',
      consequenceIfSkipped: 'Risk of moisture stress reducing tiller formation.',
      status: taskStatusMap['task-1'] || 'In Progress',
    },
    {
      id: 'task-2',
      taskName: `Apply Top Dressing Urea @ 25kg/acre on ${currentProfile.currentCrop}`,
      priority: 'Critical',
      duration: '1.5 hours',
      requiredMaterials: 'Neem-coated Urea (2 bags)',
      reason: `Soil Nitrogen is ${geo.nitrogen} kg/ha (ICAR benchmark is 90 kg/ha).`,
      expectedBenefit: 'Boosts leaf chlorophyll & vegetative tillering (+12% yield potential).',
      deadline: 'Tomorrow, 10:00 AM',
      consequenceIfSkipped: 'Yellowing of leaves and reduced tiller count.',
      status: taskStatusMap['task-2'] || 'Not Started',
    },
    {
      id: 'task-3',
      taskName: 'Inspect Field Borders for Aphids & Yellow Rust Symptoms',
      priority: 'Medium',
      duration: '45 mins',
      requiredMaterials: 'Magnifying lens & notebook',
      reason: `High humidity (${weather.humidity}%) increases fungal spore germination risk.`,
      expectedBenefit: 'Early detection prevents outbreak across all ${currentProfile.farmSizeAcres} acres.',
      deadline: 'In 2 days',
      consequenceIfSkipped: 'Pest infestation spread resulting in up to 20% crop damage.',
      status: taskStatusMap['task-3'] || 'Not Started',
    },
  ];

  // Dynamic Context-Aware Smart Alerts
  const smartAlerts: SmartAlert[] = [
    {
      id: 'alert-1',
      category: 'Irrigation',
      priority: weather.rainfall > 5 ? 'High' : 'Medium',
      title: weather.rainfall > 5 ? '☔ Heavy Rainfall Expected: Skip Irrigation' : '💧 Next Irrigation Recommended in 3 Days',
      reason: `Live Open-Meteo weather shows ${weather.rainfall}mm rainfall forecast and ${weather.moisture}% soil moisture in ${geo.name}.`,
      recommendedAction: weather.rainfall > 5 ? 'Cancel scheduled canal watering to prevent waterlogging.' : 'Prepare tube-well pump for 30mm supplemental irrigation on Thursday.',
      consequenceIfIgnored: 'Waterlogging can rot delicate root systems and leach nitrogen reserves.',
      timestamp: '10 mins ago',
    },
    {
      id: 'alert-2',
      category: 'Fertilizer',
      priority: 'Critical',
      title: '🌱 Top-Dressing Urea Application Due',
      reason: `Current crop (${currentProfile.currentCrop}) is in Vegetative Stage (${currentProfile.growthStage}) requiring 25kg/acre Nitrogen.`,
      recommendedAction: 'Apply Neem-Coated Urea early in the morning before daytime temperature rises above 32°C.',
      consequenceIfIgnored: 'Delaying beyond 5 days lowers tiller count and overall grain head density.',
      timestamp: '1 hour ago',
    },
    {
      id: 'alert-3',
      category: 'Weather',
      priority: 'High',
      title: '💨 Strong Winds Expected Tomorrow: Avoid Pesticide Spraying',
      reason: `Forecasted wind speed is higher than optimal thresholds for foliar absorption.`,
      recommendedAction: 'Postpone any liquid pesticide or micronutrient foliar spray until wind dies down.',
      consequenceIfIgnored: 'Pesticide spray drift will cause financial loss and uneven chemical coverage.',
      timestamp: '3 hours ago',
    },
    {
      id: 'alert-4',
      category: 'Market',
      priority: 'Low',
      title: '📈 Wheat Mandi Price Trend Rising',
      reason: `Ludhiana Grain Market spot prices increased by ₹45/quintal over the last 7 days.`,
      recommendedAction: 'Review expected harvest timeline and arrange dry storage bags for maximum profit margin.',
      consequenceIfIgnored: 'Selling immediately post-harvest during peak glut may reduce profit by ₹150/quintal.',
      timestamp: 'Yesterday',
    },
  ];

  // Digital Farm Twin Overview Calculation
  const waterBalance = Math.min(100, Math.round(weather.moisture * 1.5 + (weather.rainfall > 0 ? 20 : 0)));
  const nutrientBalance = Math.min(100, Math.round((geo.nitrogen / 110) * 100));
  const expectedYieldVal = Math.round(currentProfile.farmSizeAcres * 24.5);
  const expectedProfitVal = Math.round(expectedYieldVal * 2425 - currentProfile.farmSizeAcres * 6500);

  return res.json({
    success: true,
    profile: currentProfile,
    digitalTwin: {
      waterBalancePercent: waterBalance,
      nutrientBalancePercent: nutrientBalance,
      expectedYieldTotal: `${expectedYieldVal} quintals (${(24.5).toFixed(1)} q/acre)`,
      expectedProfitTotal: `₹${expectedProfitVal.toLocaleString('en-IN')}`,
      harvestCountdownDays: 90,
      overallProgressPercent: 54,
    },
    phases,
    todayTasks,
    smartAlerts,
    diariesHistory: dailyDiariesHistory,
    weather,
    soilHealth: geo,
  });
}

export async function saveFarmProfileHandler(req: Request, res: Response) {
  if (req.body) {
    currentProfile = { ...currentProfile, ...req.body };
  }
  return res.json({ success: true, profile: currentProfile });
}

export async function submitDailyDiaryHandler(req: Request, res: Response) {
  const diary: FarmDailyDiary = {
    checkInDate: req.body.checkInDate || new Date().toISOString().split('T')[0],
    irrigated: Boolean(req.body.irrigated),
    fertilizerApplied: Boolean(req.body.fertilizerApplied),
    fertilizerDetails: req.body.fertilizerDetails || '',
    pestsObserved: Boolean(req.body.pestsObserved),
    diseaseSymptoms: req.body.diseaseSymptoms || '',
    rainfallObserved: Boolean(req.body.rainfallObserved),
    laborersCount: Number(req.body.laborersCount) || 0,
    notes: req.body.notes || '',
  };

  dailyDiariesHistory.unshift(diary);
  return res.json({ success: true, message: 'End-of-day check-in recorded! Adaptive roadmap updated.', diary });
}

export async function updateTaskStatusHandler(req: Request, res: Response) {
  const { taskId, status } = req.body;
  if (taskId && status) {
    taskStatusMap[taskId] = status;
  }
  return res.json({ success: true, taskId, status });
}
