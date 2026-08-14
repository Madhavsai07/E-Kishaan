import { API_URL } from '@/lib/env';

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
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  estimatedTime: string;
  estimatedCost: string;
  requiredMaterials: string;
  reason: string;
  benefits: string;
  risk: string;
  deadline: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Skipped' | 'Delayed';
  dependencies: string[];
  aiConfidence: number;
}

export interface UpcomingTaskGroup {
  groupName: string;
  tasks: DailyPlannerTask[];
}

export interface TimelineMilestone {
  timelineId: string;
  stageNumber: number;
  stageName: string;
  task: string;
  startDate: string;
  endDate: string;
  actualCompletionDate?: string;
  progressPercent: number;
  currentStage: boolean;
  dependencies: string[];
  currentStatus: 'Completed' | 'In Progress' | 'Upcoming';
  delayImpact: string;
  nextAction: string;
  aiNotes: string;
}

export interface SmartAlert {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  reason: string;
  recommendedAction: string;
  deadline: string;
  impact: string;
  confidence: number;
  relatedTask?: string;
  weatherSource?: string;
  generatedTime: string;
}

export interface DashboardMetrics {
  currentCrop: string;
  currentStage: string;
  currentSeason: string;
  farmSizeAcres: number;
  numFields: number;
  healthScore: number;
  yieldPrediction: string;
  profitPrediction: string;
  harvestCountdownDays: number;
  roadmapProgressPercent: number;
  riskLevel: string;
  weatherSummary: string;
  soilSummary: string;
  waterBalancePercent: number;
  nutrientBalancePercent: number;
  marketOpportunity: string;
  aiConfidence: number;
  completedTasksCount: number;
  pendingTasksCount: number;
  skippedTasksCount: number;
  delayedTasksCount: number;
}

export interface FarmChartsData {
  taskCompletionTrend: Array<{ month: string; completed: number; target: number }>;
  yieldForecastTrend: Array<{ stage: string; yieldQ: number }>;
  profitForecastTrend: Array<{ month: string; profit: number }>;
  waterUsageTrend: Array<{ stage: string; requiredMm: number; actualMm: number }>;
  nutrientTrend: Array<{ nutrient: string; current: number; benchmark: number }>;
  cropGrowthProgress: Array<{ week: string; heightCm: number; biomassIndex: number }>;
}

const API_BASE = `${API_URL}/api/farm`;

export async function getFarmProfile(district?: string): Promise<FarmOnboardingProfile> {
  const query = district ? `?district=${encodeURIComponent(district)}` : '';
  const res = await fetch(`${API_BASE}/profile${query}`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const data = await res.json();
  return data.profile;
}

export async function saveFarmProfile(profile: Partial<FarmOnboardingProfile>): Promise<FarmOnboardingProfile> {
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const data = await res.json();
  return data.profile;
}

export async function getFarmDashboard(district?: string): Promise<DashboardMetrics> {
  const query = district ? `?district=${encodeURIComponent(district)}` : '';
  const res = await fetch(`${API_BASE}/dashboard${query}`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const data = await res.json();
  return data.dashboard;
}

export async function getTodayTasks(district?: string): Promise<DailyPlannerTask[]> {
  const query = district ? `?district=${encodeURIComponent(district)}` : '';
  const res = await fetch(`${API_BASE}/today${query}`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const data = await res.json();
  return data.tasks || [];
}

export async function getUpcomingTasks(district?: string): Promise<UpcomingTaskGroup[]> {
  const query = district ? `?district=${encodeURIComponent(district)}` : '';
  const res = await fetch(`${API_BASE}/upcoming${query}`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const data = await res.json();
  return data.groups || [];
}

export async function getRoadmapTimeline(district?: string): Promise<TimelineMilestone[]> {
  const query = district ? `?district=${encodeURIComponent(district)}` : '';
  const res = await fetch(`${API_BASE}/timeline${query}`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const data = await res.json();
  return data.timeline || [];
}

export async function getSmartAlerts(district?: string): Promise<SmartAlert[]> {
  const query = district ? `?district=${encodeURIComponent(district)}` : '';
  const res = await fetch(`${API_BASE}/alerts${query}`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const data = await res.json();
  return data.alerts || [];
}

export async function getDiaryHistory(): Promise<FarmDailyDiary[]> {
  const res = await fetch(`${API_BASE}/diary`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const data = await res.json();
  return data.history || [];
}

export async function submitDailyDiary(diary: FarmDailyDiary): Promise<boolean> {
  const res = await fetch(`${API_BASE}/diary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(diary),
  });
  return res.ok;
}

export async function getFarmCharts(district?: string): Promise<FarmChartsData> {
  const query = district ? `?district=${encodeURIComponent(district)}` : '';
  const res = await fetch(`${API_BASE}/charts${query}`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const data = await res.json();
  return data.charts;
}

export async function updateTaskStatus(taskId: string, status: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/task/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, status }),
  });
  return res.ok;
}
