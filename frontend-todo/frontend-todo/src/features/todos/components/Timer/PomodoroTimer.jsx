import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Target, Bell } from 'lucide-react';
import { taskToast } from '@/shared/components/QuantumToaster';

const PomodoroTimer = ({ onComplete }) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // focus, break

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    if (mode === 'focus') {
      setMinutes(25);
    } else {
      setMinutes(5);
    }
    setSeconds(0);
  }, [mode]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setMinutes(newMode === 'focus' ? 25 : 5);
    setSeconds(0);
  };

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer finished
          clearInterval(interval);
          setIsActive(false);
          handleTimerComplete();
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = () => {
    const sound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    sound.play().catch(e => console.log("Audio play failed"));

    if (mode === 'focus') {
      tasktaskToast.success("Focus session complete! Time for a break.");
      if (onComplete) onComplete();
      switchMode('break');
    } else {
      tasktaskToast.success("Break over! Ready to focus?");
      switchMode('focus');
    }
  };

  const progress = mode === 'focus' 
    ? ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100
    : ((5 * 60 - (minutes * 60 + seconds)) / (5 * 60)) * 100;

  return (
    <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 p-1 bg-gray-900/50 rounded-xl">
          <button
            onClick={() => switchMode('focus')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'focus' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Focus
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'break' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Break
          </button>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          {mode === 'focus' ? <Target size={18} /> : <Coffee size={18} />}
        </div>
      </div>

      <div className="relative flex items-center justify-center mb-8">
        {/* Progress Ring Background */}
        <svg className="w-48 h-48 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-700/30"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={552.9}
            strokeDashoffset={552.9 - (552.9 * progress) / 100}
            className={`${mode === 'focus' ? 'text-purple-500' : 'text-indigo-400'} transition-all duration-1000 ease-linear`}
          />
        </svg>

        <div className="absolute text-center">
          <div className="text-4xl font-black text-white font-mono tracking-tighter">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
            {isActive ? 'Keep Going' : 'Paused'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={resetTimer}
          className="p-3 bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition-all"
          title="Reset"
        >
          <RotateCcw size={20} />
        </button>
        
        <button
          onClick={toggleTimer}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90 ${
            isActive 
              ? 'bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20' 
              : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-500/20'
          }`}
        >
          {isActive ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
        </button>

        <div className="p-3 bg-gray-700/50 text-gray-400 rounded-xl">
          <Bell size={20} />
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
