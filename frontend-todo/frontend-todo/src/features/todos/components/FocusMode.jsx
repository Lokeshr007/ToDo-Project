import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Clock, Target, 
  Bell, Volume2, VolumeX, Coffee, Zap, 
  ListTodo, CheckCircle, X 
} from 'lucide-react';
import { todoApi } from '@/services/api/todoApi';
import toast from 'react-hot-toast';

const FocusMode = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [sessionType, setSessionType] = useState('pomodoro'); // pomodoro, shortBreak, longBreak
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [volume, setVolume] = useState(true);
  const [showTaskSelect, setShowTaskSelect] = useState(false);

  const timerRef = useRef(null);
  const audioRef = useRef(new Audio('/notification.mp3'));

  const focusDurations = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  useEffect(() => {
    fetchTasks();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setTime(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, isPaused]);

  const fetchTasks = async () => {
    try {
      const data = await todoApi.getTodos();
      setTasks(data.filter(t => t.status !== 'COMPLETED'));
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleSessionComplete = () => {
    clearInterval(timerRef.current);
    setIsActive(false);
    
    if (volume) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }

    if (sessionType === 'pomodoro') {
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);
      
      toast.custom((t) => (
        <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl border border-green-500/30">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-400" size={20} />
            <div>
              <p className="font-medium">Pomodoro Complete! 🎉</p>
              <p className="text-sm text-slate-300">
                {newCount % 4 === 0 
                  ? "Time for a long break!" 
                  : "Take a short break"}
              </p>
            </div>
          </div>
        </div>
      ), { duration: 5000 });

      // Auto-switch to break
      if (newCount % 4 === 0) {
        setSessionType('longBreak');
        setTime(focusDurations.longBreak);
      } else {
        setSessionType('shortBreak');
        setTime(focusDurations.shortBreak);
      }
    } else {
      // Break complete, back to pomodoro
      setSessionType('pomodoro');
      setTime(focusDurations.pomodoro);
      
      toast.success('Break time over! Ready to focus?');
    }
  };

  const toggleTimer = () => {
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTime(focusDurations[sessionType]);
  };

  const switchSession = (type) => {
    setSessionType(type);
    setTime(focusDurations[type]);
    setIsActive(false);
    setIsPaused(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((focusDurations[sessionType] - time) / focusDurations[sessionType]) * 100;

  const selectTaskForFocus = async (task) => {
    setSelectedTask(task);
    setShowTaskSelect(false);
    
    // Auto-start focus when task selected
    if (!isActive) {
      setIsActive(true);
    }
    
    toast.success(`Focusing on: ${task.title}`);
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="text-yellow-400" size={24} />
          Focus Mode
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVolume(!volume)}
            className="p-2 hover:bg-slate-700 rounded-lg"
          >
            {volume ? (
              <Volume2 size={18} className="text-slate-400" />
            ) : (
              <VolumeX size={18} className="text-slate-400" />
            )}
          </button>
          <button
            onClick={() => setShowTaskSelect(true)}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg flex items-center gap-1"
          >
            <Target size={14} />
            Focus Task
          </button>
        </div>
      </div>

      {/* Session Type Selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => switchSession('pomodoro')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            sessionType === 'pomodoro'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => switchSession('shortBreak')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            sessionType === 'shortBreak'
              ? 'bg-green-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Short Break
        </button>
        <button
          onClick={() => switchSession('longBreak')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            sessionType === 'longBreak'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Long Break
        </button>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-6">
        <div className="text-6xl font-bold text-white mb-2 font-mono">
          {formatTime(time)}
        </div>
        <p className="text-sm text-slate-400">
          {sessionType === 'pomodoro' ? 'Focus Time' : 'Break Time'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-700 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={toggleTimer}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isActive && !isPaused
              ? 'bg-yellow-600 hover:bg-yellow-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isActive && !isPaused ? (
            <Pause size={24} className="text-white" />
          ) : (
            <Play size={24} className="text-white" />
          )}
        </button>
        <button
          onClick={resetTimer}
          className="w-16 h-16 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-all"
        >
          <RotateCcw size={24} className="text-slate-300" />
        </button>
      </div>

      {/* Selected Task */}
      {selectedTask && (
        <div className="mb-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-purple-400" />
              <div>
                <p className="text-xs text-slate-400">Focusing on</p>
                <p className="text-sm text-white">{selectedTask.title}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedTask(null)}
              className="p-1 hover:bg-slate-700 rounded"
            >
              <X size={14} className="text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-700/30 rounded-xl p-3">
          <p className="text-xs text-slate-400">Sessions Today</p>
          <p className="text-xl font-bold text-white">{sessionsCompleted}</p>
        </div>
        <div className="bg-slate-700/30 rounded-xl p-3">
          <p className="text-xs text-slate-400">Focus Time</p>
          <p className="text-xl font-bold text-green-400">
            {Math.floor(sessionsCompleted * 25 / 60)}h {sessionsCompleted * 25 % 60}m
          </p>
        </div>
      </div>

      {/* Task Selection Modal */}
      {showTaskSelect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Select Task to Focus</h3>
              <button
                onClick={() => setShowTaskSelect(false)}
                className="p-1 hover:bg-slate-700 rounded"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => selectTaskForFocus(task)}
                  className="w-full p-3 bg-slate-700/30 hover:bg-slate-700 rounded-xl text-left transition-colors"
                >
                  <p className="text-white font-medium">{task.title}</p>
                  {task.dueDate && (
                    <p className="text-xs text-slate-400 mt-1">
                      Due: {format(new Date(task.dueDate), 'MMM d, h:mm a')}
                    </p>
                  )}
                </button>
              ))}

              {tasks.length === 0 && (
                <p className="text-center text-slate-400 py-4">
                  No pending tasks. Create one first!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusMode;