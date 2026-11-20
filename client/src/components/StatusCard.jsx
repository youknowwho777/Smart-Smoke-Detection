import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

const StatusCard = ({ status = 'SAFE' }) => {
  const normStatus = (status || 'SAFE').toUpperCase();

  const config = {
    SAFE: {
      title: 'SAFE',
      subtext: 'No smoke hazard detected',
      icon: ShieldCheck,
      cardBg: 'from-emerald-50/80 via-emerald-100/40 to-emerald-50/20 border-emerald-200/90',
      iconBg: 'bg-emerald-100 text-emerald-600 border-emerald-300',
      textColor: 'text-emerald-700',
      badgeColor: 'bg-emerald-500'
    },
    WARNING: {
      title: 'WARNING',
      subtext: 'Elevated smoke level detected',
      icon: AlertTriangle,
      cardBg: 'from-amber-50/90 via-amber-100/50 to-orange-50/30 border-amber-300',
      iconBg: 'bg-amber-100 text-amber-600 border-amber-300',
      textColor: 'text-amber-600',
      badgeColor: 'bg-amber-500'
    },
    CRITICAL: {
      title: 'CRITICAL',
      subtext: 'High smoke hazard! Emergency systems engaged',
      icon: AlertOctagon,
      cardBg: 'from-rose-50/95 via-red-100/60 to-red-50/40 border-red-300 critical-pulse',
      iconBg: 'bg-red-100 text-red-600 border-red-300',
      textColor: 'text-red-600',
      badgeColor: 'bg-red-500'
    }
  };

  const current = config[normStatus] || config.SAFE;
  const Icon = current.icon;

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${current.cardBg} p-6 shadow-sm flex items-center justify-between transition-all duration-300`}>
      <div className="flex items-center space-x-5 z-10">
        <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center shadow-md ${current.iconBg}`}>
          <Icon className="w-9 h-9" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${current.badgeColor}`}></span>
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Current Status
            </span>
          </div>
          <h2 className={`text-4xl font-black tracking-tight mt-1 ${current.textColor}`}>
            {current.title}
          </h2>
          <p className="text-sm font-medium text-slate-600 mt-0.5">
            {current.subtext}
          </p>
        </div>
      </div>

      {/* Decorative background wave effect */}
      <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none transform translate-x-4 translate-y-4">
        <Icon className="w-44 h-44 text-slate-900" />
      </div>
    </div>
  );
};

export default StatusCard;
