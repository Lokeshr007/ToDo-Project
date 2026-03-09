// frontend/src/features/ai-assistant/components/TaskGenerationPreview.jsx
import { useState } from "react";
import { 
  ChevronLeft, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Flag,
  Tag,
  Calendar,
  RefreshCw,
  Save,
  Loader,
  ChevronDown,
  ChevronUp,
  Filter
} from "lucide-react";
import { format, addDays } from 'date-fns';

function TaskGenerationPreview({ 
  tasks, 
  tasksByWeek,
  selectedTasks, 
  onToggleTask, 
  onToggleAll, 
  onSave, 
  onRegenerate, 
  onBack, 
  processing 
}) {
  const [expandedWeeks, setExpandedWeeks] = useState(
    Object.keys(tasksByWeek).reduce((acc, week) => ({ ...acc, [week]: true }), {})
  );
  const [filterPriority, setFilterPriority] = useState('all');

  const toggleWeek = (week) => {
    setExpandedWeeks(prev => ({ ...prev, [week]: !prev[week] }));
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return <Flag size={12} className="text-red-400" />;
      case 'medium': return <Flag size={12} className="text-yellow-400" />;
      case 'low': return <Flag size={12} className="text-green-400" />;
      default: return <Flag size={12} className="text-blue-400" />;
    }
  };

  const filteredTasksByWeek = Object.entries(tasksByWeek).reduce((acc, [week, weekTasks]) => {
    const filtered = filterPriority === 'all' 
      ? weekTasks 
      : weekTasks.filter(t => t.priority?.toLowerCase() === filterPriority);
    if (filtered.length > 0) {
      acc[week] = filtered;
    }
    return acc;
  }, {});

  const totalSelected = selectedTasks.size;
  const totalTasks = tasks.length;

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
          Back
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">
            {totalSelected} of {totalTasks} selected
          </span>
        </div>
      </div>

      {/* Stats and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            Generated Tasks
          </h2>
          <p className="text-sm text-slate-400">
            Review and customize your 60-day task list
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Select All Toggle */}
          <button
            onClick={onToggleAll}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white flex items-center gap-2"
          >
            {selectedTasks.size === tasks.length ? (
              <>
                <CheckCircle size={14} className="text-green-400" />
                Deselect All
              </>
            ) : (
              <>
                <CheckCircle size={14} />
                Select All
              </>
            )}
          </button>

          {/* Regenerate */}
          <button
            onClick={onRegenerate}
            disabled={processing}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white disabled:opacity-50"
            title="Regenerate tasks"
          >
            <RefreshCw size={18} className={processing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tasks by Week */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 mb-6">
        {Object.entries(filteredTasksByWeek).map(([week, weekTasks]) => (
          <div key={week} className="bg-slate-700/30 rounded-lg overflow-hidden">
            {/* Week Header */}
            <div
              onClick={() => toggleWeek(week)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
            >
              <div>
                <h3 className="text-white font-medium">Week {week}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {weekTasks.length} tasks
                </p>
              </div>
              <button className="text-slate-400">
                {expandedWeeks[week] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            {/* Week Tasks */}
            {expandedWeeks[week] && (
              <div className="p-4 space-y-3 border-t border-slate-600/50">
                {weekTasks.map((task, index) => (
                  <TaskItem
                    key={task.id || index}
                    task={task}
                    isSelected={selectedTasks.has(task.id || `temp-${index}`)}
                    onToggle={() => onToggleTask(task.id || `temp-${index}`)}
                    getPriorityColor={getPriorityColor}
                    getPriorityIcon={getPriorityIcon}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={processing || totalSelected === 0}
        className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
      >
        {processing ? (
          <Loader size={20} className="animate-spin" />
        ) : (
          <Save size={20} />
        )}
        {processing 
          ? 'Saving Tasks...' 
          : `Save ${totalSelected} Selected Task${totalSelected !== 1 ? 's' : ''}`}
      </button>
    </div>
  );
}

// Individual Task Item
function TaskItem({ task, isSelected, onToggle, getPriorityColor, getPriorityIcon }) {
  return (
    <div className={`
      flex items-start gap-3 p-3 rounded-lg border transition-colors
      ${isSelected 
        ? 'bg-purple-500/10 border-purple-500/30' 
        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'
      }
    `}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="mt-1 w-4 h-4 rounded border-slate-600 text-purple-600 focus:ring-purple-500"
      />
      
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
          <h4 className={`text-white text-sm font-medium ${!isSelected && 'opacity-70'}`}>
            Day {task.day}: {task.title}
          </h4>
          
          {task.priority && (
            <span className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 w-fit ${getPriorityColor(task.priority)}`}>
              {getPriorityIcon(task.priority)}
              {task.priority}
            </span>
          )}
        </div>
        
        {task.description && (
          <p className="text-xs text-slate-400 mb-2">{task.description}</p>
        )}
        
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {task.estimatedHours && (
            <span className="flex items-center gap-1 text-slate-400">
              <Clock size={10} />
              {task.estimatedHours} {task.estimatedHours === 1 ? 'hour' : 'hours'}
            </span>
          )}
          
          {task.tags && task.tags.length > 0 && (
            <span className="flex items-center gap-1 text-slate-400">
              <Tag size={10} />
              {task.tags.join(', ')}
            </span>
          )}
          
          {task.dueDate && (
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar size={10} />
              Due: {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskGenerationPreview;
