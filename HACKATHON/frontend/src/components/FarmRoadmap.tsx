import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Droplets,
  Zap,
  TrendingUp,
  Sparkles,
  User,
  ShieldCheck,
  Bell,
  BookOpen,
  Send,
  Plus,
  Info,
  Layers,
  ArrowRight,
  Sun,
  CloudRain,
  Bot,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';

import {
  fetchFarmRoadmap,
  saveFarmProfile,
  submitDailyDiary,
  updateTaskStatus,
  FALLBACK_ROADMAP_DATA,
  FarmRoadmapResponse,
  FarmOnboardingProfile,
  DailyPlannerTask,
  RoadmapPhase,
  SmartAlert,
  FarmDailyDiary,
} from '@/services/roadmapService';
import { DEFAULT_DISTRICTS_LIST } from '@/services/soilService';

export default function FarmRoadmap() {
  const [district, setDistrict] = useState<string>('Ludhiana');
  const [data, setData] = useState<FarmRoadmapResponse>(FALLBACK_ROADMAP_DATA['Ludhiana']);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isDiaryOpen, setIsDiaryOpen] = useState<boolean>(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState<FarmOnboardingProfile>(data.profile);

  // Diary Form State
  const [diaryForm, setDiaryForm] = useState<FarmDailyDiary>({
    checkInDate: new Date().toISOString().split('T')[0],
    irrigated: false,
    fertilizerApplied: false,
    fertilizerDetails: '',
    pestsObserved: false,
    diseaseSymptoms: '',
    rainfallObserved: false,
    laborersCount: 2,
    notes: '',
  });

  // Assistant Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello ${data.profile.farmerName}! I am your AI Agricultural Assistant for ${data.profile.district}. How can I guide your ${data.profile.currentCrop} farming today?`,
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      const res = await fetchFarmRoadmap(district);
      if (res) {
        setData(res);
        setProfileForm(res.profile);
      }
    }
    loadData();
  }, [district]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await saveFarmProfile(profileForm);
    if (ok) {
      toast.success('Farm Profile & Digital Twin updated!');
      setIsOnboardingOpen(false);
      const res = await fetchFarmRoadmap(district);
      if (res) setData(res);
    } else {
      toast.error('Failed to update profile.');
    }
  };

  const handleDiarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submitDailyDiary(diaryForm);
    if (ok) {
      toast.success('End-of-Day Check-in recorded! Adaptive roadmap updated.');
      setIsDiaryOpen(false);
      setDiaryForm({
        checkInDate: new Date().toISOString().split('T')[0],
        irrigated: false,
        fertilizerApplied: false,
        fertilizerDetails: '',
        pestsObserved: false,
        diseaseSymptoms: '',
        rainfallObserved: false,
        laborersCount: 2,
        notes: '',
      });
      const res = await fetchFarmRoadmap(district);
      if (res) setData(res);
    } else {
      toast.error('Failed to submit check-in.');
    }
  };

  const handleTaskAction = async (taskId: string, status: 'Completed' | 'Skipped' | 'Delayed') => {
    const ok = await updateTaskStatus(taskId, status);
    if (ok) {
      toast.success(`Task marked as ${status}! Adaptive plan recalculated.`);
      setData((prev) => ({
        ...prev,
        todayTasks: prev.todayTasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
      }));
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim()) return;

    const newMessages = [...chatMessages, { sender: 'user' as const, text: q }];
    setChatMessages(newMessages);
    if (!textToSend) setInputQuery('');

    // AI Consultant dynamic logic
    setTimeout(() => {
      let aiAns = `Based on your ${data.profile.farmSizeAcres} acre ${data.profile.currentCrop} field in ${district}, soil moisture is at ${data.digitalTwin.waterBalancePercent}%. Everything is optimal.`;
      const qLower = q.toLowerCase();
      if (qLower.includes('irrigate') || qLower.includes('water')) {
        aiAns = `Based on live Open-Meteo weather (${data.weather?.temp || 28.5}°C, ${data.weather?.moisture || 45}% soil moisture), next 30mm irrigation is recommended in 3 days. No immediate rain expected.`;
      } else if (qLower.includes('fertilizer') || qLower.includes('urea')) {
        aiAns = `Your crop is currently in the ${data.profile.growthStage}. Apply 25kg/acre Neem-coated Urea top dressing tomorrow early morning to prevent volatilization loss.`;
      } else if (qLower.includes('today') || qLower.includes('do')) {
        aiAns = `Today's priority is: 1) Check Field 1 CRI soil moisture, 2) Prepare 25kg/acre Urea for top dressing, 3) Inspect borders for rust spores.`;
      } else if (qLower.includes('harvest')) {
        aiAns = `Expected harvest countdown is 90 days (approx September 15, 2026). Target yield is ${data.digitalTwin.expectedYieldTotal}.`;
      }

      setChatMessages((prev) => [...prev, { sender: 'ai', text: aiAns }]);
    }, 600);
  };

  const getPriorityColor = (p: string) => {
    if (p === 'Critical') return 'bg-red-600 text-white';
    if (p === 'High') return 'bg-amber-600 text-white';
    if (p === 'Medium') return 'bg-blue-600 text-white';
    return 'bg-emerald-600 text-white';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Profile Header */}
      <Card className="shadow-sm border-emerald-100 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-400 text-emerald-950 font-bold px-2.5 py-0.5">
                  AI Digital Farm Twin Active
                </Badge>
                <span className="text-emerald-200 text-xs font-semibold">
                  District: {data.profile.district} • Village: {data.profile.village}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
                🌾 My Farm Roadmap & Intelligent Advisory
              </h1>
              <p className="text-emerald-100 text-sm">
                Farmer: <span className="font-bold text-white">{data.profile.farmerName}</span> • Land:{' '}
                <span className="font-bold text-amber-300">{data.profile.farmSizeAcres} Acres</span> ({data.profile.numFields} Fields) • Crop:{' '}
                <span className="font-bold text-white">{data.profile.currentCrop}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Onboarding Dialog Trigger */}
              <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold shadow-sm">
                    <User className="w-4 h-4 mr-2" />
                    Edit Farm Profile & Goals
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-emerald-950">Farmer Onboarding & Profile Setup</DialogTitle>
                    <DialogDescription>
                      Customize your farm details to dynamically generate a unique AI Roadmap.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleProfileSave} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Farmer Name</Label>
                        <Input
                          value={profileForm.farmerName}
                          onChange={(e) => setProfileForm({ ...profileForm, farmerName: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>District</Label>
                        <select
                          value={profileForm.district}
                          onChange={(e) => {
                            setProfileForm({ ...profileForm, district: e.target.value });
                            setDistrict(e.target.value);
                          }}
                          className="w-full mt-1 p-2 border rounded-md font-medium"
                        >
                          {DEFAULT_DISTRICTS_LIST.map((d) => (
                            <option key={d.name} value={d.name}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Village</Label>
                        <Input
                          value={profileForm.village}
                          onChange={(e) => setProfileForm({ ...profileForm, village: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Total Land Area (Acres)</Label>
                        <Input
                          type="number"
                          value={profileForm.farmSizeAcres}
                          onChange={(e) => setProfileForm({ ...profileForm, farmSizeAcres: parseFloat(e.target.value) || 1 })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Current Crop</Label>
                        <Input
                          value={profileForm.currentCrop}
                          onChange={(e) => setProfileForm({ ...profileForm, currentCrop: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Growth Stage</Label>
                        <Input
                          value={profileForm.growthStage}
                          onChange={(e) => setProfileForm({ ...profileForm, growthStage: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Irrigation Source</Label>
                        <Input
                          value={profileForm.irrigationSource}
                          onChange={(e) => setProfileForm({ ...profileForm, irrigationSource: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Planting Date</Label>
                        <Input
                          type="date"
                          value={profileForm.plantingDate}
                          onChange={(e) => setProfileForm({ ...profileForm, plantingDate: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <DialogFooter className="mt-4">
                      <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">
                        Save Profile & Regenerate AI Roadmap
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* End-of-Day Check-In Trigger */}
              <Dialog open={isDiaryOpen} onOpenChange={setIsDiaryOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-amber-400 text-amber-300 hover:bg-emerald-950 font-bold">
                    <BookOpen className="w-4 h-4 mr-2" />
                    End-of-Day Check-In
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-emerald-950">Daily Digital Farm Diary</DialogTitle>
                    <DialogDescription>
                      Record what actually happened on your farm today to dynamically update your AI Roadmap.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleDiarySubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="irrigated"
                          checked={diaryForm.irrigated}
                          onChange={(e) => setDiaryForm({ ...diaryForm, irrigated: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="irrigated" className="font-semibold">Did you irrigate today?</Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="fertilizerApplied"
                          checked={diaryForm.fertilizerApplied}
                          onChange={(e) => setDiaryForm({ ...diaryForm, fertilizerApplied: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="fertilizerApplied" className="font-semibold">Did you apply fertilizer today?</Label>
                      </div>

                      {diaryForm.fertilizerApplied && (
                        <div>
                          <Label className="text-xs">Fertilizer Details (Amount & Type)</Label>
                          <Input
                            placeholder="e.g. 25kg Neem Urea"
                            value={diaryForm.fertilizerDetails}
                            onChange={(e) => setDiaryForm({ ...diaryForm, fertilizerDetails: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="pestsObserved"
                          checked={diaryForm.pestsObserved}
                          onChange={(e) => setDiaryForm({ ...diaryForm, pestsObserved: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="pestsObserved" className="font-semibold">Pests or disease symptoms noticed?</Label>
                      </div>

                      <div>
                        <Label className="text-xs">Number of Laborers Worked</Label>
                        <Input
                          type="number"
                          value={diaryForm.laborersCount}
                          onChange={(e) => setDiaryForm({ ...diaryForm, laborersCount: parseInt(e.target.value) || 0 })}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Additional Field Notes</Label>
                        <Input
                          placeholder="e.g. Crop greening fast"
                          value={diaryForm.notes}
                          onChange={(e) => setDiaryForm({ ...diaryForm, notes: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">
                        Submit Daily Check-In
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Digital Farm Twin Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-blue-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Soil Water Balance
              <Droplets className="w-4 h-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{data.digitalTwin.waterBalancePercent}%</div>
            <Progress value={data.digitalTwin.waterBalancePercent} className="h-2 mt-2 bg-gray-200" />
            <p className="text-xs text-gray-500 mt-1">Optimal zone: 60-85%</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-emerald-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Nutrient Availability
              <Zap className="w-4 h-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{data.digitalTwin.nutrientBalancePercent}%</div>
            <Progress value={data.digitalTwin.nutrientBalancePercent} className="h-2 mt-2 bg-gray-200" />
            <p className="text-xs text-gray-500 mt-1">N, P, K & Micronutrient index</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-amber-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Expected Total Yield
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-amber-900">{data.digitalTwin.expectedYieldTotal}</div>
            <p className="text-xs text-gray-500 mt-1">Target yield met (+12% optimization)</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Expected Net Profit
              <ShieldCheck className="w-4 h-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{data.digitalTwin.expectedProfitTotal}</div>
            <p className="text-xs text-gray-500 mt-1">
              Harvest Countdown: <span className="font-bold text-purple-700">{data.digitalTwin.harvestCountdownDays} days</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Sections: Daily Planner, Smart Alerts, 14-Phase Timeline & AI Assistant */}
      <Tabs defaultValue="planner" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="planner">Today's Farm Plan</TabsTrigger>
          <TabsTrigger value="alerts">AI Smart Alerts</TabsTrigger>
          <TabsTrigger value="timeline">14-Phase Lifecycle Timeline</TabsTrigger>
          <TabsTrigger value="assistant">AI Farm Assistant</TabsTrigger>
        </TabsList>

        {/* Today's Farm Plan Tab */}
        <TabsContent value="planner" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    Today's Actionable Farm Plan ({new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })})
                  </CardTitle>
                  <CardDescription>
                    Tailored specifically for {data.profile.currentCrop} in {data.profile.district} based on live weather and growth stage
                  </CardDescription>
                </div>
                <Badge className="bg-emerald-700 text-white font-bold">{data.todayTasks.length} Tasks Scheduled</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.todayTasks.map((t) => (
                <div key={t.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(t.priority)}>{t.priority} Priority</Badge>
                      <h4 className="font-bold text-gray-900 text-base">{t.taskName}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-gray-300 text-gray-700">
                        <Clock className="w-3 h-3 mr-1" /> {t.duration}
                      </Badge>
                      <Badge variant="outline" className="border-emerald-500 text-emerald-800">
                        Due: {t.deadline}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-white p-3 border rounded-lg">
                    <div>
                      <span className="font-semibold text-gray-700">AI Context & Reason:</span>
                      <p className="text-gray-600 mt-0.5">{t.reason}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-emerald-800">Expected Benefit:</span>
                      <p className="text-emerald-700 mt-0.5">{t.expectedBenefit}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="text-xs text-red-600 font-medium">
                      ⚠️ Consequence if skipped: {t.consequenceIfSkipped}
                    </div>

                    <div className="flex items-center gap-2">
                      {t.status === 'Completed' ? (
                        <Badge className="bg-emerald-600">✓ Completed</Badge>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleTaskAction(t.id, 'Completed')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs"
                          >
                            Mark Done
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTaskAction(t.id, 'Skipped')}
                            className="text-gray-600 hover:bg-gray-100 font-medium text-xs"
                          >
                            Skip
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Smart Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Intelligent Alerts & Context-Aware Reminders
              </CardTitle>
              <CardDescription>
                Continuously evaluated against live Open-Meteo weather, soil health, and growth stage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.smartAlerts.map((a) => (
                <div
                  key={a.id}
                  className={`p-4 border rounded-xl space-y-2 ${
                    a.priority === 'Critical'
                      ? 'bg-red-50/70 border-red-200'
                      : a.priority === 'High'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-blue-50/70 border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(a.priority)}>{a.category}</Badge>
                      <h4 className="font-bold text-gray-900 text-base">{a.title}</h4>
                    </div>
                    <span className="text-xs text-gray-500">{a.timestamp}</span>
                  </div>

                  <div className="text-sm space-y-1">
                    <div>
                      <strong className="text-gray-900">Why did I receive this alert?</strong>
                      <p className="text-gray-700 text-xs">{a.reason}</p>
                    </div>

                    <div>
                      <strong className="text-emerald-900">Recommended Action:</strong>
                      <p className="text-emerald-800 text-xs font-medium">{a.recommendedAction}</p>
                    </div>

                    <div>
                      <strong className="text-red-900">What happens if ignored?</strong>
                      <p className="text-red-700 text-xs">{a.consequenceIfIgnored}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 14-Phase Lifecycle Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                Full 14-Phase Farming Lifecycle Roadmap
              </CardTitle>
              <CardDescription>
                From Land Preparation to Market Selling for {data.profile.currentCrop}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-emerald-300 ml-4 space-y-6 pl-6 py-2">
                {data.phases.map((p) => (
                  <div key={p.phaseNumber} className="relative group">
                    <div
                      className={`absolute -left-[31px] top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white ${
                        p.status === 'Completed'
                          ? 'bg-emerald-600'
                          : p.status === 'In Progress'
                          ? 'bg-amber-500 animate-pulse'
                          : 'bg-slate-400'
                      }`}
                    >
                      {p.phaseNumber}
                    </div>

                    <div className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-lg">
                            Phase {p.phaseNumber}: {p.phaseName}
                          </h4>
                          <Badge
                            className={
                              p.status === 'Completed'
                                ? 'bg-emerald-600'
                                : p.status === 'In Progress'
                                ? 'bg-amber-500'
                                : 'bg-slate-500'
                            }
                          >
                            {p.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          {p.expectedStartDate} → {p.expectedEndDate}
                        </span>
                      </div>

                      <p className="text-xs text-gray-700 font-medium">
                        <strong>AI Strategy:</strong> {p.aiRecommendation}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border">
                        <div>
                          <span className="text-gray-500">Est. Cost:</span>{' '}
                          <strong className="text-gray-900">{p.estimatedCost}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500">Expected Benefit:</span>{' '}
                          <strong className="text-emerald-700">{p.expectedReturn}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500">Phase Progress:</span>{' '}
                          <strong className="text-blue-700">{p.progressPercent}%</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Farm Assistant Tab */}
        <TabsContent value="assistant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-600" />
                AI Agricultural Scientist Assistant
              </CardTitle>
              <CardDescription>
                Ask any question about your farm profile, weather alerts, or fertilizer schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Prompt Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage('What should I do today?')}
                  className="text-xs border-emerald-300 text-emerald-800"
                >
                  What should I do today?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage('When should I irrigate?')}
                  className="text-xs border-emerald-300 text-emerald-800"
                >
                  When should I irrigate?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage('Should I apply fertilizer now?')}
                  className="text-xs border-emerald-300 text-emerald-800"
                >
                  Should I apply fertilizer now?
                </Button>
              </div>

              {/* Chat Box */}
              <div className="h-64 overflow-y-auto border rounded-xl p-4 bg-slate-50 space-y-3">
                {chatMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-xl text-sm ${
                        m.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-white border text-gray-900 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Type your farming question..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
