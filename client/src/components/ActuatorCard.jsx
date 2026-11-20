import React from 'react';
import { Fan, Volume2, Lightbulb } from 'lucide-react';

export const SingleActuatorCard = ({ title, state, icon: Icon, activeClass, activeText = 'ON' }) => {
  const isActive = Boolean(state);

  return (
    <div className={`rounded-2xl border p-5 shadow-sm flex items-center space-x-4 transition-all duration-300 ${
      isActive 
        ? `${activeClass} bg-white shadow-md` 
        : 'bg-white border-slate-200/90'
    }`}>
      <div className={`w-13 h-13 rounded-2xl flex items-center justify-center p-3 transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'bg-blue-50 text-blue-600 border border-blue-100'
      }`}>
        <Icon className={`w-7 h-7 ${isActive && title.includes('Fan') ? 'spin-slow' : ''}`} />
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          {title}
        </p>
        <div className="flex items-center space-x-2 mt-0.5">
          <span className={`text-2xl font-black tracking-tight ${
            isActive ? 'text-slate-900' : 'text-slate-700'
          }`}>
            {isActive ? activeText : 'OFF'}
          </span>
          {isActive && (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          )}
        </div>
      </div>
    </div>
  );
};

const ActuatorCardsGrid = ({ fan = false, buzzer = false, led = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SingleActuatorCard 
        title="Ventilation Fan" 
        state={fan} 
        icon={Fan} 
        activeClass="border-blue-400 ring-2 ring-blue-100"
      />
      <SingleActuatorCard 
        title="Buzzer" 
        state={buzzer} 
        icon={Volume2} 
        activeClass="border-amber-400 ring-2 ring-amber-100"
      />
      <SingleActuatorCard 
        title="Alert LED" 
        state={led} 
        icon={Lightbulb} 
        activeClass="border-red-400 ring-2 ring-red-100"
      />
    </div>
  );
};

export default ActuatorCardsGrid;
