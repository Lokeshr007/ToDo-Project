import StreakCounter from "../StreakCounter";
import ConsistencyCalendar from "../ConsistencyCalendar";
import FocusMode from "../FocusMode";
import TaskAnalytics from "../TaskAnalytics";
import GoalTracker from "../GoalTracker";
import SmartReminder from "../SmartReminder";
import { Brain, Sparkles } from "lucide-react";

function TaskIntelligenceSidebar() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="text-purple-400" size={20} />
          <h3 className="text-white font-medium">Daily Intelligence</h3>
        </div>
        <StreakCounter />
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <Sparkles className="text-blue-400" size={18} />
          Focus Session
        </h3>
        <FocusMode />
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
        <h3 className="text-white font-medium mb-4">Analytics</h3>
        <TaskAnalytics />
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
        <h3 className="text-white font-medium mb-4">Goals</h3>
        <GoalTracker />
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
        <h3 className="text-white font-medium mb-4">Smart Reminders</h3>
        <SmartReminder />
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
        <h3 className="text-white font-medium mb-4">Consistency</h3>
        <ConsistencyCalendar />
      </div>
    </div>
  );
}

export default TaskIntelligenceSidebar;
