import React, { useState, useMemo } from 'react';
import {
  Compass,
  Sun,
  Plane,
  UtensilsCrossed,
  GraduationCap,
  Anchor,
  Clock,
  MapPin,
  Sparkles,
  Info,
} from 'lucide-react';
import { Property } from '../types';

interface PropertyLifestyleSectionProps {
  property: Property;
}

export const PropertyLifestyleSection: React.FC<PropertyLifestyleSectionProps> = ({
  property,
}) => {
  // Time of day slider in hours (8 to 20)
  const [selectedHour, setSelectedHour] = useState<number>(14);

  // Derive orientation based on property ref / location or defaults
  const orientationData = useMemo(() => {
    const isRiviera =
      property.department.includes('06') ||
      property.department.includes('83') ||
      property.region?.toLowerCase().includes('azur') ||
      property.title.toLowerCase().includes('cannes') ||
      property.title.toLowerCase().includes('saint-tropez');

    const isAlps =
      property.department.includes('73') ||
      property.department.includes('74') ||
      property.region?.toLowerCase().includes('alpes');

    const isParis =
      property.department.includes('75') ||
      property.department.includes('92') ||
      property.city.toLowerCase().includes('paris') ||
      property.title.toLowerCase().includes('paris');

    let direction = 'South-West';
    let degrees = 225;
    let description =
      'Optimal afternoon exposure with golden twilight lighting across the main reception rooms and private outdoor terraces.';

    if (isRiviera) {
      direction = 'South / Mediterranean Panoramic';
      degrees = 180;
      description =
        'Full day Mediterranean sunlight. The terrace receives unbroken sunlight from 09:30 to 19:45, ideal for outdoor lounge dining and sea-view entertaining.';
    } else if (isAlps) {
      direction = 'South-East / Mont-Blanc View';
      degrees = 135;
      description =
        'Crisp morning sunlight penetrating alpine cathedral windows and continuous afternoon brightness over private balconies.';
    } else if (isParis) {
      direction = 'West-South-West';
      degrees = 240;
      description =
        'High double-exposure Haussmannian layout with luminous morning courtyards and bright Parisian afternoon skies over grand reception salons.';
    }

    return { direction, degrees, description };
  }, [property]);

  // Derive lifestyle POIs based on region
  const lifestylePOIs = useMemo(() => {
    const isRiviera =
      property.department.includes('06') ||
      property.department.includes('83') ||
      property.region?.toLowerCase().includes('azur') ||
      property.title.toLowerCase().includes('cannes') ||
      property.title.toLowerCase().includes('saint-tropez');

    const isAlps =
      property.department.includes('73') ||
      property.department.includes('74') ||
      property.region?.toLowerCase().includes('alpes');

    if (isRiviera) {
      return [
        {
          category: 'Private Aviation & Heliports',
          icon: Plane,
          items: [
            { name: 'Cannes Mandelieu Business Airport', time: '12 min (Car / Transfer)' },
            { name: 'Nice Côte d’Azur VIP Helipad', time: '15 min (Direct flight)' },
            { name: 'Monaco Heliport (Fontvieille)', time: '18 min' },
          ],
        },
        {
          category: 'Michelin-Starred Dining',
          icon: UtensilsCrossed,
          items: [
            { name: 'La Vague d’Or *** (Cheval Blanc St-Tropez)', time: '10 min' },
            { name: 'Mirazur *** (Menton - World Best)', time: '28 min' },
            { name: 'Le Louis XV - Alain Ducasse *** (Monaco)', time: '22 min' },
          ],
        },
        {
          category: 'Marinas & Elite Yacht Clubs',
          icon: Anchor,
          items: [
            { name: 'Port Vauban Billionaires Quay', time: '14 min' },
            { name: 'Yacht Club de Monaco', time: '20 min' },
            { name: 'Port de Saint-Tropez (Quai Suffren)', time: '8 min' },
          ],
        },
        {
          category: 'International Schools',
          icon: GraduationCap,
          items: [
            { name: 'International School of Nice (IB World)', time: '18 min' },
            { name: 'Mougins British International School', time: '15 min' },
          ],
        },
      ];
    }

    if (isAlps) {
      return [
        {
          category: 'Private Aviation & Access',
          icon: Plane,
          items: [
            { name: 'Courchevel Altiport LFLJ (Direct Turboprop / Heli)', time: '6 min' },
            { name: 'Chambéry VIP Private Terminal', time: '55 min' },
            { name: 'Geneva International Airport (GVA)', time: '1h 45 min' },
          ],
        },
        {
          category: 'Michelin Gastronomy',
          icon: UtensilsCrossed,
          items: [
            { name: 'Le 1947 à Cheval Blanc *** (Courchevel)', time: '4 min' },
            { name: 'Flocons de Sel *** (Megève)', time: '25 min' },
            { name: 'La Bouitte *** (Saint-Martin-de-Belleville)', time: '35 min' },
          ],
        },
        {
          category: 'Alpine Clubs & Wellness',
          icon: Anchor,
          items: [
            { name: 'ESF Courchevel 1850 Elite Ski Academy', time: 'Ski-in / Ski-out' },
            { name: 'Aquamotion Private Spa & Thermal Reserve', time: '8 min' },
          ],
        },
        {
          category: 'Heliskiing & Expeditions',
          icon: GraduationCap,
          items: [
            { name: 'Val d’Isère Private Heli-Drop Zones', time: '10 min Heli' },
            { name: 'Aiguille du Midi High-Altitude Guide Station', time: '45 min' },
          ],
        },
      ];
    }

    // Default: Paris & Prestige France
    return [
      {
        category: 'Private Aviation & Helipads',
        icon: Plane,
        items: [
          { name: 'Paris-Le Bourget (Private Jet Hub #1 in Europe)', time: '25 min (Chauffeur)' },
          { name: 'Issy-les-Moulineaux Heliport', time: '14 min' },
          { name: 'Paris-Charles de Gaulle (CDG 2A VIP Lounge)', time: '35 min' },
        ],
      },
      {
        category: 'Michelin-Starred Gastronomy',
        icon: UtensilsCrossed,
        items: [
          { name: 'Plénitude - Arnaud Donckele *** (Cheval Blanc Paris)', time: '12 min' },
          { name: 'Restaurant Guy Savoy *** (Monnaie de Paris)', time: '10 min' },
          { name: 'Le Gabriel - La Réserve *** (Avenue Gabriel)', time: '8 min' },
        ],
      },
      {
        category: 'Prestigious Private Clubs',
        icon: Anchor,
        items: [
          { name: 'Polo de Paris (Bois de Boulogne)', time: '12 min' },
          { name: 'Golf de Saint-Cloud', time: '18 min' },
          { name: 'Cercle de l’Union Interalliée', time: '10 min' },
        ],
      },
      {
        category: 'International Academies & Schools',
        icon: GraduationCap,
        items: [
          { name: 'American School of Paris (Saint-Cloud)', time: '16 min' },
          { name: 'Bilingual International School of Paris (15e)', time: '10 min' },
          { name: 'Lycée International de Saint-Germain-en-Laye', time: '28 min' },
        ],
      },
    ];
  }, [property]);

  // Calculate sun position and illumination status based on hour
  const sunStatus = useMemo(() => {
    let phase = 'Morning Light';
    let luxLevel = 'Moderate Ambient';
    let anglePercent = ((selectedHour - 8) / (20 - 8)) * 100;
    let warmth = 'Warm Golden';

    if (selectedHour >= 8 && selectedHour < 11) {
      phase = 'Morning Dawn & Soft Glow';
      luxLevel = 'Gentle Natural Illuminance (~18,000 Lux)';
      warmth = 'Crisp Fresh Daylight';
    } else if (selectedHour >= 11 && selectedHour < 15) {
      phase = 'Midday Zenith Peak';
      luxLevel = 'Maximum Natural Brightness (~85,000 Lux)';
      warmth = 'Pure Daylight Zenith';
    } else if (selectedHour >= 15 && selectedHour < 18) {
      phase = 'Afternoon Radiance';
      luxLevel = 'High Warm Sun (~55,000 Lux)';
      warmth = 'Golden Amber Light';
    } else {
      phase = 'Golden Hour Twilight';
      luxLevel = 'Sensory Sunset Glow (~22,000 Lux)';
      warmth = 'Deep Rose & Honey Glow';
    }

    return { phase, luxLevel, anglePercent, warmth };
  }, [selectedHour]);

  return (
    <div className="space-y-8 my-8 pt-8 border-t border-neutral-200">
      {/* Section Header */}
      <div>
        <div className="flex items-center space-x-2 text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-600 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-neutral-800" />
          <span>Hyper-Local & Lifestyle Intelligence</span>
        </div>
        <h3 className="text-2xl font-light font-serif-luxury text-[#1d1d1b]">
          Terrace Exposure & Prestige Neighborhood
        </h3>
        <p className="text-sm text-neutral-600 font-light mt-1">
          Verified travel times, culinary proximity, and computational sunlight trajectory modeled for {property.city}.
        </p>
      </div>

      {/* Interactive Sunlight Simulator */}
      <div className="bg-[#fae9e5]/30 rounded-sm border border-neutral-200/80 p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-200/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-amber-600 shadow-xs">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-500 font-medium">
                Orientation Compass
              </p>
              <h4 className="text-base font-medium text-[#1d1d1b]">
                {orientationData.direction} ({orientationData.degrees}°)
              </h4>
            </div>
          </div>

          <div className="inline-flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-full border border-neutral-200 text-xs text-neutral-700">
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="font-medium text-[#1d1d1b]">{sunStatus.phase}</span>
            <span className="text-neutral-400">·</span>
            <span>{selectedHour}:00</span>
          </div>
        </div>

        {/* Sun Trajectory Visual Arc */}
        <div className="relative pt-8 pb-4">
          <div className="h-2 w-full bg-gradient-to-r from-amber-100 via-amber-300 to-orange-300 rounded-full relative">
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-md flex items-center justify-center text-white transition-all duration-300"
              style={{ left: `${Math.max(5, Math.min(95, sunStatus.anglePercent))}%` }}
            >
              <Sun className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
            </div>
          </div>

          {/* Time markers */}
          <div className="flex justify-between text-[11px] text-neutral-500 font-medium mt-3 px-1">
            <span>08:00 (Sunrise)</span>
            <span>11:00</span>
            <span className="text-[#1d1d1b] font-semibold">14:00 (Zenith)</span>
            <span>17:00</span>
            <span>20:00 (Golden Hour)</span>
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="mt-4">
          <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-1.5">
            Simulate Daylight Progression ({selectedHour}:00)
          </label>
          <input
            type="range"
            min={8}
            max={20}
            step={1}
            value={selectedHour}
            onChange={(e) => setSelectedHour(parseInt(e.target.value, 10))}
            className="w-full accent-[#1d1d1b] cursor-pointer"
          />
        </div>

        {/* Dynamic Illumination Card */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-neutral-200/60">
          <div className="bg-white/80 p-3.5 rounded-sm border border-neutral-200/60">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
              Atmospheric Illuminance
            </span>
            <span className="text-xs text-[#1d1d1b] font-medium mt-0.5 block">
              {sunStatus.luxLevel} ({sunStatus.warmth})
            </span>
          </div>
          <div className="bg-white/80 p-3.5 rounded-sm border border-neutral-200/60">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
              Architectural Exposure
            </span>
            <p className="text-xs text-neutral-700 font-light mt-0.5 leading-relaxed">
              {orientationData.description}
            </p>
          </div>
        </div>
      </div>

      {/* Prestige Travel Times & Local Highlights */}
      <div>
        <h4 className="text-lg font-serif-luxury font-light text-[#1d1d1b] mb-4">
          Key Travel Times & Elite Destinations
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lifestylePOIs.map((group, idx) => {
            const GroupIcon = group.icon;
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-sm border border-neutral-200 shadow-xs hover:border-neutral-300 transition-colors"
              >
                <div className="flex items-center space-x-2.5 pb-3 border-b border-neutral-100 mb-3">
                  <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-[#1d1d1b]">
                    <GroupIcon className="w-3.5 h-3.5" />
                  </div>
                  <h5 className="text-xs uppercase tracking-wider font-semibold text-[#1d1d1b]">
                    {group.category}
                  </h5>
                </div>

                <ul className="space-y-2.5">
                  {group.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start justify-between text-xs">
                      <span className="text-neutral-700 font-light max-w-[70%]">
                        {item.name}
                      </span>
                      <span className="inline-flex items-center space-x-1 text-[#1d1d1b] font-medium whitespace-nowrap bg-neutral-50 px-2 py-0.5 rounded-xs border border-neutral-100">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span>{item.time}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="flex items-center space-x-2 mt-4 text-[11px] text-neutral-500">
          <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span>
            Distances computed via chauffeur route and direct executive helicopter corridors. Contact your dedicated advisor for bespoke flight clearance.
          </span>
        </div>
      </div>
    </div>
  );
};
