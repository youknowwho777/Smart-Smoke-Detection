import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Flame, 
  LayoutDashboard, 
  Activity, 
  Bell, 
  Cpu, 
  Settings,
  CircleDot
} from 'lucide-react';

const Sidebar = ({ deviceStatus = 'online', deviceId = 'SMOKE-001' }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Live Monitoring', path: '/monitoring', icon: Activity },
    { name: 'Alerts & History', path: '/alerts', icon: Bell },
    { name: 'Devices', path: '/devices', icon: Cpu },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  const getStatusColor = () => {
    switch (deviceStatus?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500 animate-ping';
      case 'warning':
        return 'bg-amber-400 animate-pulse';
      case 'offline':
        return 'bg-slate-500';
      default:
        return 'bg-emerald-400';
    }
  };

  return (
    <aside className="w-64 bg-[#0c1427] text-slate-300 flex flex-col justify-between min-h-screen border-r border-slate-800/80 shadow-2xl z-20 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-snug">
              Smart Smoke
              <span className="block text-slate-100 font-extrabold">Detection</span>
            </h1>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              IoT Safety System
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Device Status Card */}
      <div className="p-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 shadow-inner">
          <div className="relative flex items-center justify-center">
            <span className={`w-3 h-3 rounded-full ${getStatusColor()}`}></span>
            <span className={`absolute w-3 h-3 rounded-full opacity-75 ${getStatusColor()}`}></span>
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 capitalize">
              Device {deviceStatus === 'offline' ? 'Offline' : 'Online'}
            </p>
            <p className="text-[11px] font-mono text-slate-400 truncate">
              {deviceId}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
