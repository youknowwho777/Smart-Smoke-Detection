import React from 'react';
import { FlaskConical, Bell, User, Wifi, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({ 
  title = 'Dashboard', 
  subtitle = 'Real-time smoke monitoring and automated safety system',
  isSimulation = true,
  unreadAlertsCount = 0,
  backendConnected = true
}) => {
  return (
    <header className="bg-transparent px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-slate-500 font-normal mt-0.5">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center space-x-3.5 self-end md:self-auto">
        {/* Backend Connectivity Status */}
        <div 
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            backendConnected 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
          title={backendConnected ? 'Connected to backend REST API' : 'Backend offline or unreachable'}
        >
          {backendConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">Backend API Live</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="hidden sm:inline">Backend Disconnected</span>
            </>
          )}
        </div>

        {/* Operating Mode Badge */}
        <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200/80 text-blue-700 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm">
          <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
          <span>{isSimulation ? 'Simulation Mode' : 'Hardware Mode'}</span>
        </div>

        {/* Notification Bell with Badge */}
        <Link 
          to="/alerts" 
          className="relative p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition shadow-sm"
          title="View Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
              {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
            </span>
          )}
        </Link>

        {/* User Profile Avatar */}
        <div className="w-9 h-9 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 shadow-sm">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
};

export default Header;
