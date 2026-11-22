import React from 'react';
import { Volume2, Lightbulb, BellRing } from 'lucide-react';

export const SingleActuatorCard = ({ title, state, icon: Icon, activeClass, activeText = 'ACTIVE', subtitle = '' }) => {
  const isActive = Boolean(state);

  return (
    <div className={`rounded-2xl border p-5 shadow-sm flex items-center justify-between transition-all duration-300 ${
      isActive 
        ? `${activeClass} bg-white shadow-md` 
        : 'bg-white border-slate-200/90'
    }`}>
      <div className="flex items-center space-x-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center p-3 transition-colors ${
          isActive 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'bg-slate-100 text-slate-500 border border-slate-200'
        }`}>
          <Icon className={`w-7 h-7 ${isActive ? 'animate-bounce' : ''}`} />
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
            {title}
          </p>
          <div className="flex items-center space-x-2 mt-0.5">
            <span className={`text-2xl font-black tracking-tight ${
              isActive ? 'text-slate-900' : 'text-slate-600'
            }`}>
              {isActive ? activeText : 'OFF'}
            </span>
            {isActive && (
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="hidden sm:block">
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
          isActive ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-50 text-slate-400'
        }`}>
          {isActive ? 'TRIGGERED' : 'STANDBY'}
        </span>
      </div>
    </div>
  );
};

const ActuatorCardsGrid = ({ buzzer = false, led = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SingleActuatorCard 
        title="Audible Alarm (Piezo Buzzer)" 
        state={buzzer} 
        icon={Volume2} 
        activeClass="border-amber-400 ring-2 ring-amber-100"
        activeText="SOUNDING"
        subtitle="ESP32 GPIO Alarm Output"
      />
      <SingleActuatorCard 
        title="Visual Indicator (Warning LED)" 
        state={led} 
        icon={Lightbulb} 
        activeClass="border-red-400 ring-2 ring-red-100"
        activeText="ILLUMINATED"
        subtitle="Hazard Warning Light"
      />
    </div>
  );
};

export default ActuatorCardsGrid;
