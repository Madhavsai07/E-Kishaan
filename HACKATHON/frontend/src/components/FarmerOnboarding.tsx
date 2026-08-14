import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Leaf, MapPin, User, Sprout, CheckCircle2, ChevronRight } from 'lucide-react';

// ─── All crops available (Punjab-focused + common Indian crops) ───────────────
const CROP_OPTIONS = [
  { name: 'Wheat',      emoji: '🌾', season: 'Rabi (Oct–Apr)'   },
  { name: 'Rice',       emoji: '🍚', season: 'Kharif (Jun–Nov)' },
  { name: 'Maize',      emoji: '🌽', season: 'Kharif (Jun–Sep)' },
  { name: 'Cotton',     emoji: '🌿', season: 'Kharif (May–Nov)' },
  { name: 'Sugarcane',  emoji: '🎋', season: 'Year-round'        },
  { name: 'Potato',     emoji: '🥔', season: 'Rabi (Oct–Mar)'   },
  { name: 'Onion',      emoji: '🧅', season: 'Rabi (Nov–Apr)'   },
  { name: 'Tomato',     emoji: '🍅', season: 'Year-round'        },
  { name: 'Soybean',    emoji: '🫘', season: 'Kharif (Jun–Oct)' },
  { name: 'Groundnut',  emoji: '🥜', season: 'Kharif (Jun–Oct)' },
  { name: 'Turmeric',   emoji: '🟡', season: 'Kharif (Jun–Jan)' },
  { name: 'Banana',     emoji: '🍌', season: 'Year-round'        },
  { name: 'Mango',      emoji: '🥭', season: 'Summer (Mar–Jun)' },
  { name: 'Coconut',    emoji: '🥥', season: 'Year-round'        },
  { name: 'Pepper',     emoji: '🫙', season: 'Kharif (Aug–Feb)' },
];

// ─── Indian states ────────────────────────────────────────────────────────────
const STATES = [
  'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan',
  'Maharashtra', 'Gujarat', 'Karnataka', 'Andhra Pradesh', 'Telangana',
  'Tamil Nadu', 'Kerala', 'West Bengal', 'Bihar', 'Odisha',
  'Jharkhand', 'Chhattisgarh', 'Assam', 'Himachal Pradesh', 'Uttarakhand',
];

export interface FarmerProfile {
  name: string;
  state: string;
  location: string;
  primaryCrops: string[];
  points: number;
  level: string;
}

const STORAGE_KEY = 'agrismart_farmer_profile';

export function loadProfile(): FarmerProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: FarmerProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearProfile() {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Steps ────────────────────────────────────────────────────────────────────
type Step = 'welcome' | 'name' | 'location' | 'crops' | 'done';

interface Props {
  onComplete: (profile: FarmerProfile) => void;
}

export default function FarmerOnboarding({ onComplete }: Props) {
  const [step, setStep]           = useState<Step>('welcome');
  const [name, setName]           = useState('');
  const [state, setState]         = useState('');
  const [village, setVillage]     = useState('');
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [nameError, setNameError] = useState('');
  const [locError, setLocError]   = useState('');
  const [cropError, setCropError] = useState('');

  function toggleCrop(crop: string) {
    setSelectedCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
    setCropError('');
  }

  function handleFinish() {
    if (selectedCrops.length === 0) {
      setCropError('Please select at least one crop.');
      return;
    }
    const profile: FarmerProfile = {
      name: name.trim(),
      state,
      location: village.trim() ? `${village.trim()}, ${state}` : state,
      primaryCrops: selectedCrops,
      points: 0,
      level: 'New Farmer',
    };
    saveProfile(profile);
    setStep('done');
    setTimeout(() => onComplete(profile), 1200);
  }

  // ── Welcome ─────────────────────────────────────────────────────────────────
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AgriSmart</h1>
            <p className="text-gray-500 mt-1">AI-Powered Farming Assistant</p>
          </div>
          <p className="text-gray-600 text-base leading-relaxed">
            Get live mandi prices, 14-day price forecasts, and personalised sell advice — all in simple language.
          </p>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {['📈 Live Prices', '🔮 Forecasts', '💰 Sell Advice'].map((f) => (
              <div key={f} className="bg-green-50 rounded-xl p-3 text-green-800 font-medium">{f}</div>
            ))}
          </div>
          <Button
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12 text-base rounded-xl"
            onClick={() => setStep('name')}
          >
            Get Started <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Name ────────────────────────────────────────────────────────────────────
  if (step === 'name') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6">
          <StepIndicator current={1} total={3} />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">What is your name?</h2>
              <p className="text-sm text-gray-500">So we can greet you personally</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="farmer-name" className="text-gray-700">Full Name</Label>
            <Input
              id="farmer-name"
              placeholder="e.g. Gurpreet Singh"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              className="h-12 text-base rounded-xl"
              autoFocus
            />
            {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
          </div>
          <Button
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12 text-base rounded-xl"
            onClick={() => {
              if (!name.trim()) { setNameError('Please enter your name.'); return; }
              setStep('location');
            }}
          >
            Continue <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Location ─────────────────────────────────────────────────────────────────
  if (step === 'location') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6">
          <StepIndicator current={2} total={3} />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Where is your farm?</h2>
              <p className="text-sm text-gray-500">Used to show prices from your nearest mandi</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="state-select" className="text-gray-700">State</Label>
              <select
                id="state-select"
                value={state}
                onChange={(e) => { setState(e.target.value); setLocError(''); }}
                className="w-full h-12 border border-gray-200 rounded-xl px-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Select your state --</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="village" className="text-gray-700">Village / Town <span className="text-gray-400">(optional)</span></Label>
              <Input
                id="village"
                placeholder="e.g. Ludhiana"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="h-12 text-base rounded-xl"
              />
            </div>
            {locError && <p className="text-red-500 text-sm">{locError}</p>}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setStep('name')}>
              Back
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12 text-base rounded-xl"
              onClick={() => {
                if (!state) { setLocError('Please select your state.'); return; }
                setStep('crops');
              }}
            >
              Continue <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Crops ────────────────────────────────────────────────────────────────────
  if (step === 'crops') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 space-y-5">
          <StepIndicator current={3} total={3} />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Sprout className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Which crops do you grow?</h2>
              <p className="text-sm text-gray-500">Select all that apply — you can change this later</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {CROP_OPTIONS.map((crop) => {
              const selected = selectedCrops.includes(crop.name);
              return (
                <button
                  key={crop.name}
                  onClick={() => toggleCrop(crop.name)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                    selected
                      ? 'border-green-500 bg-green-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  }`}
                >
                  <span className="text-xl">{crop.emoji}</span>
                  <div className="min-w-0">
                    <p className={`font-medium text-sm ${selected ? 'text-green-800' : 'text-gray-700'}`}>
                      {crop.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{crop.season}</p>
                  </div>
                  {selected && <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {selectedCrops.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedCrops.map((c) => (
                <Badge key={c} className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
                  onClick={() => toggleCrop(c)}>
                  {c} ✕
                </Badge>
              ))}
            </div>
          )}

          {cropError && <p className="text-red-500 text-sm">{cropError}</p>}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setStep('location')}>
              Back
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12 text-base rounded-xl"
              onClick={handleFinish}
            >
              Start Farming 🌾
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Done ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {name}! 🎉</h2>
        <p className="text-gray-500">Setting up your personalised dashboard…</p>
        <div className="flex justify-center gap-1 pt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full flex-1 transition-all ${
            i + 1 <= current ? 'bg-green-500' : 'bg-gray-200'
          }`}
        />
      ))}
      <span className="text-xs text-gray-400 ml-1">{current}/{total}</span>
    </div>
  );
}
