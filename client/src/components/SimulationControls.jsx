import React, { useState } from 'react';
import { Play, Pause, AlertTriangle, ShieldCheck, Flame, RefreshCw } from 'lucide-react';
import { triggerScenario, toggleSimulation } from '../services/api';

const SimulationControls = ({ isSimRunning = true, onActionSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);

  const handleScenario = async (scenario) => {
    try {
      setLoading(true);
      setActiveScenario(scenario);
      await triggerScenario(scenario);
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      console.error('Failed to trigger scenario:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    try {
      setLoading(true);
      await toggleSimulation(!isSimRunning);
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      console.error('Failed to toggle simulator:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
          <RefreshCw className={`w-4 h-4 ${isSimRunning ? 'animate-spin' : ''}`} />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Sensor Simulator Controls
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
              isSimRunning ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {isSimRunning ? 'Active' : 'Paused'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test safety thresholds and automated alarm triggers without physical smoke
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <button
          onClick={() => handleScenario('SAFE')}
          disabled={loading}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
            activeScenario === 'SAFE'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/80'
          }`}
          title="Force safe ambient smoke readings (~400 ADC)"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Force Safe</span>
        </button>

        <button
          onClick={() => handleScenario('WARNING')}
          disabled={loading}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
            activeScenario === 'WARNING'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/80'
          }`}
          title="Force warning smoke readings (~2300 ADC) - Triggers Warning LED"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Force Warning</span>
        </button>

        <button
          onClick={() => handleScenario('CRITICAL')}
          disabled={loading}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
            activeScenario === 'CRITICAL'
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80'
          }`}
          title="Force critical danger readings (~3400 ADC) - Triggers Buzzer & Alert Light"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Force Critical</span>
        </button>

        <button
          onClick={handleToggle}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition"
        >
          {isSimRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 text-amber-400" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Resume</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SimulationControls;
