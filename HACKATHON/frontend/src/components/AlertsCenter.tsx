import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  CheckCheck,
  CloudRain,
  TrendingUp,
  AlertTriangle,
  Info,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export interface AlertItem {
  id: string;
  title: string;
  category: 'weather' | 'market' | 'pest' | 'soil' | 'scheme';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  read: boolean;
  crop?: string;
  actionTab?: string;
  actionLabel?: string;
}

interface AlertsCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmerCrops?: string[];
  location?: string;
  onNavigateTab?: (tab: string) => void;
  onUnreadCountChange?: (count: number) => void;
}

// Generate smart initial alerts based on crops
function generateInitialAlerts(crops: string[] = ['Wheat', 'Maize'], location: string = 'Ludhiana, Punjab'): AlertItem[] {
  const cropListStr = crops.length > 0 ? crops.join(', ') : 'your crops';
  const firstCrop = crops[0] || 'Wheat';
  const secondCrop = crops[1] || 'Maize';

  return [
    {
      id: 'alt-1',
      title: '🌦️ Heavy Rainfall Warning (Next 48 Hours)',
      category: 'weather',
      severity: 'critical',
      message: `Open-Meteo forecasts 17.7mm rain in ${location}. Postpone fertilizer application for ${firstCrop} to prevent nutrient runoff.`,
      timestamp: '10 mins ago',
      read: false,
      crop: firstCrop,
      actionTab: 'weather',
      actionLabel: 'Check Weather Forecast',
    },
    {
      id: 'alt-2',
      title: `📈 Price Surge for ${secondCrop} at Khanna Mandi`,
      category: 'market',
      severity: 'warning',
      message: `Prices for ${secondCrop} increased by +4.8% today (₹2,250/quintal). High demand expected due to upcoming festival season!`,
      timestamp: '1 hour ago',
      read: false,
      crop: secondCrop,
      actionTab: 'market',
      actionLabel: 'View Mandi Prices',
    },
    {
      id: 'alt-3',
      title: '🪲 Late Blight Disease Advisory',
      category: 'pest',
      severity: 'warning',
      message: `High humidity (85%) in ${location} increases risk of fungal blight for ${cropListStr}. Inspect leaves for dark water-soaked spots.`,
      timestamp: '3 hours ago',
      read: false,
      crop: firstCrop,
      actionTab: 'solver',
      actionLabel: 'Ask AI Disease Solver',
    },
    {
      id: 'alt-4',
      title: '🧪 Optimal Soil Nitrogen Window',
      category: 'soil',
      severity: 'info',
      message: `Soil moisture level is optimal (85%). Best window for second nitrogen top-dressing for ${firstCrop}.`,
      timestamp: 'Yesterday',
      read: true,
      crop: firstCrop,
      actionTab: 'soil',
      actionLabel: 'Check Soil Health',
    },
    {
      id: 'alt-5',
      title: '📜 PM-Kisan 16th Installment Released',
      category: 'scheme',
      severity: 'info',
      message: `Govt released ₹2,000 direct benefit to eligible farmers in Punjab. Check your bank account status or Aadhaar link.`,
      timestamp: '2 days ago',
      read: true,
      actionTab: 'roadmap',
      actionLabel: 'Open Farm Roadmap',
    },
  ];
}

const STORAGE_KEY = 'ekisaan_user_alerts';

export default function AlertsCenter({
  open,
  onOpenChange,
  farmerCrops = ['Wheat', 'Maize'],
  location = 'Ludhiana, Punjab',
  onNavigateTab,
}: AlertsCenterProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return generateInitialAlerts(farmerCrops, location);
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'critical' | 'weather' | 'market'>('all');

  const updateAlerts = (newAlerts: AlertItem[]) => {
    setAlerts(newAlerts);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAlerts));
    } catch {}
  };

  const markAsRead = (id: string) => {
    const updated = alerts.map((a) => (a.id === id ? { ...a, read: true } : a));
    updateAlerts(updated);
  };

  const markAllAsRead = () => {
    const updated = alerts.map((a) => ({ ...a, read: true }));
    updateAlerts(updated);
    toast.success('All alerts marked as read');
  };

  const deleteAlert = (id: string) => {
    const updated = alerts.filter((a) => a.id !== id);
    updateAlerts(updated);
    toast.info('Alert removed');
  };

  const handleAction = (alert: AlertItem) => {
    markAsRead(alert.id);
    onOpenChange(false);
    if (alert.actionTab && onNavigateTab) {
      onNavigateTab(alert.actionTab);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (activeFilter === 'unread') return !a.read;
    if (activeFilter === 'critical') return a.severity === 'critical';
    if (activeFilter === 'weather') return a.category === 'weather' || a.category === 'pest';
    if (activeFilter === 'market') return a.category === 'market';
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.read).length;

  const severityBadge = (severity: AlertItem['severity']) => {
    if (severity === 'critical')
      return <Badge className="bg-red-500 text-white text-[10px] px-2 py-0.5">Critical 🚨</Badge>;
    if (severity === 'warning')
      return <Badge className="bg-amber-500 text-white text-[10px] px-2 py-0.5">Warning ⚠️</Badge>;
    return <Badge className="bg-blue-500 text-white text-[10px] px-2 py-0.5">Info ℹ️</Badge>;
  };

  const categoryIcon = (category: AlertItem['category']) => {
    if (category === 'weather') return <CloudRain className="w-5 h-5 text-blue-600" />;
    if (category === 'market') return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (category === 'pest') return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    return <Info className="w-5 h-5 text-emerald-600" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-5 pb-3 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center shadow-md">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Farm Alerts Center
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">{unreadCount} New</Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500">
                  Real-time weather, market surges, and pest advisories for {location}
                </DialogDescription>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs flex items-center gap-1 text-green-700 border-green-300 hover:bg-green-100"
              >
                <CheckCheck className="w-4 h-4" /> Mark all read
              </Button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 pt-3">
            {[
              { id: 'all', label: `All (${alerts.length})` },
              { id: 'unread', label: `Unread (${unreadCount})` },
              { id: 'critical', label: `Critical (${alerts.filter(a => a.severity === 'critical').length})` },
              { id: 'weather', label: 'Weather & Pests' },
              { id: 'market', label: 'Market Surges' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                  activeFilter === f.id
                    ? 'bg-green-700 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* Alert List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[55vh]">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">No alerts right now!</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Your crops are in good condition. We will notify you instantly if weather or market conditions change.
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  alert.read
                    ? 'bg-white border-gray-200 opacity-80'
                    : 'bg-green-50/60 border-green-300 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-xs border border-gray-100 flex-shrink-0 mt-0.5">
                    {categoryIcon(alert.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                        {alert.title}
                        {!alert.read && <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />}
                      </h4>
                      <div className="flex items-center gap-2">
                        {severityBadge(alert.severity)}
                        <span className="text-xs text-gray-400">{alert.timestamp}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed mb-3">{alert.message}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      {alert.actionLabel ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAction(alert)}
                          className="h-8 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 px-3 rounded-lg"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {alert.actionLabel}
                          <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                        </Button>
                      ) : <span />}

                      <div className="flex items-center gap-1">
                        {!alert.read && (
                          <button
                            onClick={() => markAsRead(alert.id)}
                            className="text-xs text-gray-500 hover:text-green-700 p-1 rounded hover:bg-gray-100"
                            title="Mark as read"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="text-xs text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                          title="Dismiss"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t flex items-center justify-between text-xs text-gray-500 px-5">
          <span>AI Advisory updated live for {location}</span>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs h-7">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
