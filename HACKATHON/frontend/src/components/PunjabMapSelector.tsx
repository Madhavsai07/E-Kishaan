import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { DistrictSummary } from '@/services/soilService';

interface PunjabMapSelectorProps {
  districts: DistrictSummary[];
  selectedDistrict: string;
  onSelectDistrict: (districtName: string) => void;
}

export const PunjabMapSelector: React.FC<PunjabMapSelectorProps> = ({
  districts,
  selectedDistrict,
  onSelectDistrict,
}) => {
  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'Excellent':
        return 'bg-emerald-600 text-white hover:bg-emerald-700';
      case 'Good':
        return 'bg-teal-600 text-white hover:bg-teal-700';
      case 'Moderate':
        return 'bg-amber-500 text-white hover:bg-amber-600';
      case 'Poor':
        return 'bg-orange-500 text-white hover:bg-orange-600';
      case 'Critical':
        return 'bg-red-600 text-white hover:bg-red-700';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <Card className="border-emerald-100 shadow-sm bg-slate-50/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-900">Interactive Punjab Soil Map & District Selector</h3>
          </div>
          <Badge variant="outline" className="border-emerald-300 text-emerald-800">
            {districts.length} Districts Connected
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {districts.map((d) => {
            const isSelected = d.name.toLowerCase() === selectedDistrict.toLowerCase();
            return (
              <button
                key={d.name}
                type="button"
                onClick={() => onSelectDistrict(d.name)}
                className={`p-2.5 rounded-lg border text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 shadow-sm ring-2 ring-emerald-500/30'
                    : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                    {d.name}
                  </span>
                  <Badge className={`text-[10px] px-1.5 py-0 shrink-0 ${getBadgeColor(d.healthStatus)}`}>
                    {d.healthScore}
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 truncate">
                  pH: {d.ph} • {d.soilType.split(' ')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PunjabMapSelector;
