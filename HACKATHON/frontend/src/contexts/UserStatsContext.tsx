import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { toast } from '@/components/ui/sonner';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number; // 0 - 100 percentage towards unlocking
  unlockedAt?: string;
  category: 'Farming' | 'Weather' | 'Solver' | 'Market' | 'Tech';
}

export interface DynamicFarmingStats {
  totalSeasons: number;
  avgROI: number;
  bestYield: string;
  problemsSolved: number;
  userPoints: number;
  daysActive: number;
  weatherChecks: number;
  fertilizerLogs: number;
  marketChecks: number;
  carbonSaved: string;
  waterSaved: string;
  organicScore: number;
}

interface UserStatsState {
  firstVisitDate: string;
  problemsSolved: number;
  userPoints: number;
  weatherChecks: number;
  fertilizerLogs: number;
  marketChecks: number;
  cropsTracked: number;
  solvedProblemTitles: string[];
}

interface UserStatsContextValue {
  stats: DynamicFarmingStats;
  achievements: Achievement[];
  recordWeatherCheck: () => void;
  recordFertilizerLog: () => void;
  recordProblemSolved: (points: number, problemTitle: string) => void;
  recordMarketCheck: () => void;
  recordCropAdded: () => void;
  resetStats: () => void;
}

const STORAGE_KEY = 'ekishaan_dynamic_user_stats_v2';

const getInitialState = (): UserStatsState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load stats from localStorage', e);
  }
  
  // Default clean starting state
  return {
    firstVisitDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days active default
    problemsSolved: 2,
    userPoints: 1250,
    weatherChecks: 5,
    fertilizerLogs: 3,
    marketChecks: 4,
    cropsTracked: 4,
    solvedProblemTitles: ['Basic Awakening Potion'],
  };
};

const UserStatsContext = createContext<UserStatsContextValue | undefined>(undefined);

export function UserStatsProvider({ children }: { children: ReactNode }) {
  const [rawState, setRawState] = useState<UserStatsState>(getInitialState);

  // Sync to localStorage on any state update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rawState));
    } catch (e) {
      console.error('Failed to save user stats', e);
    }
  }, [rawState]);

  // Compute Days Active dynamically based on account start date
  const computeDaysActive = useCallback(() => {
    const start = new Date(rawState.firstVisitDate).getTime();
    const now = Date.now();
    const days = Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
    return days;
  }, [rawState.firstVisitDate]);

  // Compute dynamic stats
  const daysActive = computeDaysActive();
  const totalSeasons = Math.max(1, Math.floor(rawState.cropsTracked * 1.5 + daysActive / 15));
  const avgROI = Math.min(45, Math.round((20 + rawState.marketChecks * 0.8 + rawState.fertilizerLogs * 0.5) * 10) / 10);
  const bestYield = `${(3.2 + (rawState.fertilizerLogs * 0.1)).toFixed(1)} tons/acre`;
  const carbonSavedVal = (2.0 + (rawState.fertilizerLogs * 0.2) + (daysActive * 0.01)).toFixed(1);
  const carbonSaved = `${carbonSavedVal} tons CO2`;
  const waterSavedVal = Math.round(12000 + rawState.weatherChecks * 400 + daysActive * 50);
  const waterSaved = `${waterSavedVal.toLocaleString('en-IN')} L`;
  const organicScore = Math.min(98, Math.round(75 + rawState.fertilizerLogs * 3 + rawState.weatherChecks * 1));

  const stats: DynamicFarmingStats = {
    totalSeasons,
    avgROI,
    bestYield,
    problemsSolved: rawState.problemsSolved,
    userPoints: rawState.userPoints,
    daysActive,
    weatherChecks: rawState.weatherChecks,
    fertilizerLogs: rawState.fertilizerLogs,
    marketChecks: rawState.marketChecks,
    carbonSaved,
    waterSaved,
    organicScore,
  };

  // Derive dynamic achievements status & progress
  const achievements: Achievement[] = [
    {
      id: 'first-harvest',
      title: 'First Harvest',
      description: 'Completed your first crop cycle in the system',
      icon: '🌾',
      earned: rawState.cropsTracked > 0,
      progress: Math.min(100, (rawState.cropsTracked / 1) * 100),
      category: 'Farming',
    },
    {
      id: 'soil-master',
      title: 'Soil Master',
      description: 'Logged fertilizer and maintained optimal soil health',
      icon: '🌱',
      earned: rawState.fertilizerLogs >= 3,
      progress: Math.min(100, Math.round((rawState.fertilizerLogs / 3) * 100)),
      category: 'Farming',
    },
    {
      id: 'weather-warrior',
      title: 'Weather Warrior',
      description: 'Used ML weather forecasts for precision farm planning',
      icon: '⛈️',
      earned: rawState.weatherChecks >= 5,
      progress: Math.min(100, Math.round((rawState.weatherChecks / 5) * 100)),
      category: 'Weather',
    },
    {
      id: 'profit-maximizer',
      title: 'Profit Maximizer',
      description: 'Analyzed commodity market trends to maximize crop ROI',
      icon: '💰',
      earned: rawState.marketChecks >= 3,
      progress: Math.min(100, Math.round((rawState.marketChecks / 3) * 100)),
      category: 'Market',
    },
    {
      id: 'problem-solver',
      title: 'Problem Solver',
      description: 'Solved Frankenstein optimization challenges',
      icon: '🧠',
      earned: rawState.problemsSolved >= 1,
      progress: Math.min(100, Math.round((rawState.problemsSolved / 1) * 100)),
      category: 'Solver',
    },
    {
      id: 'organic-champion',
      title: 'Organic Champion',
      description: 'Achieved an organic practice score over 80%',
      icon: '🍃',
      earned: organicScore >= 80,
      progress: Math.min(100, Math.round((organicScore / 80) * 100)),
      category: 'Farming',
    },
    {
      id: 'tech-innovator',
      title: 'Tech Innovator',
      description: 'Explored all 4 platform modules (Weather, Soil, Market, Solver)',
      icon: '🚀',
      earned: rawState.weatherChecks > 0 && rawState.fertilizerLogs > 0 && rawState.marketChecks > 0 && rawState.problemsSolved > 0,
      progress: Math.round(
        (( (rawState.weatherChecks > 0 ? 1 : 0) +
           (rawState.fertilizerLogs > 0 ? 1 : 0) +
           (rawState.marketChecks > 0 ? 1 : 0) +
           (rawState.problemsSolved > 0 ? 1 : 0) ) / 4) * 100
      ),
      category: 'Tech',
    },
    {
      id: 'community-leader',
      title: 'Community Leader',
      description: 'Accumulated over 1,500 platform knowledge points',
      icon: '👥',
      earned: rawState.userPoints >= 1500,
      progress: Math.min(100, Math.round((rawState.userPoints / 1500) * 100)),
      category: 'Tech',
    },
  ];

  const recordWeatherCheck = useCallback(() => {
    setRawState((prev) => {
      const nextChecks = prev.weatherChecks + 1;
      if (nextChecks === 5) {
        toast.success('🏆 Achievement Unlocked: Weather Warrior!', {
          description: 'You checked live weather and ML predictions 5 times!',
        });
      }
      return { ...prev, weatherChecks: nextChecks };
    });
  }, []);

  const recordFertilizerLog = useCallback(() => {
    setRawState((prev) => {
      const nextLogs = prev.fertilizerLogs + 1;
      if (nextLogs === 3) {
        toast.success('🏆 Achievement Unlocked: Soil Master!', {
          description: 'You logged 3 fertilizer applications to improve soil fertility!',
        });
      }
      return { ...prev, fertilizerLogs: nextLogs };
    });
  }, []);

  const recordProblemSolved = useCallback((points: number, problemTitle: string) => {
    setRawState((prev) => {
      const alreadySolved = prev.solvedProblemTitles.includes(problemTitle);
      const nextSolved = prev.problemsSolved + 1;
      const nextPoints = prev.userPoints + points;
      const nextTitles = alreadySolved ? prev.solvedProblemTitles : [...prev.solvedProblemTitles, problemTitle];

      toast.success(`🎉 Problem Solved! +${points} Points Earned!`, {
        description: `Total points: ${nextPoints.toLocaleString('en-IN')}`,
      });

      if (nextSolved === 1) {
        toast.success('🏆 Achievement Unlocked: Problem Solver!', {
          description: 'Solved your first Frankenstein optimization challenge!',
        });
      }
      if (nextPoints >= 1500 && prev.userPoints < 1500) {
        toast.success('🏆 Achievement Unlocked: Community Leader!', {
          description: 'Earned 1,500+ knowledge points!',
        });
      }

      return {
        ...prev,
        problemsSolved: nextSolved,
        userPoints: nextPoints,
        solvedProblemTitles: nextTitles,
      };
    });
  }, []);

  const recordMarketCheck = useCallback(() => {
    setRawState((prev) => {
      const nextChecks = prev.marketChecks + 1;
      if (nextChecks === 3) {
        toast.success('🏆 Achievement Unlocked: Profit Maximizer!', {
          description: 'Analyzed commodity market price trends 3 times!',
        });
      }
      return { ...prev, marketChecks: nextChecks };
    });
  }, []);

  const recordCropAdded = useCallback(() => {
    setRawState((prev) => {
      const nextCrops = prev.cropsTracked + 1;
      if (nextCrops === 1) {
        toast.success('🏆 Achievement Unlocked: First Harvest!', {
          description: 'Added a new crop cycle to your portfolio!',
        });
      }
      return { ...prev, cropsTracked: nextCrops };
    });
  }, []);

  const resetStats = useCallback(() => {
    const cleanState: UserStatsState = {
      firstVisitDate: new Date().toISOString(),
      problemsSolved: 0,
      userPoints: 500,
      weatherChecks: 0,
      fertilizerLogs: 0,
      marketChecks: 0,
      cropsTracked: 0,
      solvedProblemTitles: [],
    };
    setRawState(cleanState);
    toast.info('Activity progress and achievements reset to default.');
  }, []);

  return (
    <UserStatsContext.Provider
      value={{
        stats,
        achievements,
        recordWeatherCheck,
        recordFertilizerLog,
        recordProblemSolved,
        recordMarketCheck,
        recordCropAdded,
        resetStats,
      }}
    >
      {children}
    </UserStatsContext.Provider>
  );
}

export function useUserStats() {
  const context = useContext(UserStatsContext);
  if (!context) {
    throw new Error('useUserStats must be used within a UserStatsProvider');
  }
  return context;
}
