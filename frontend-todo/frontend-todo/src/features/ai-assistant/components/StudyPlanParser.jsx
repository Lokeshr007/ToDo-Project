// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\components\StudyPlanParser.jsx
import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  Target,
  CheckCircle,
  AlertCircle,
  Loader,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Tag,
  Users,
  Award,
  Zap,
  Brain,
  Sparkles
} from 'lucide-react';
import { format, addDays } from 'date-fns';

function StudyPlanParser({ plan, tasks, analysis, onConfirm, onBack, className = '' }) {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    weekly: false,
    tasks: false,
    insights: true
  });
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  if (!plan) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'beginner': return 'text-green-400 bg-green-500/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'advanced': return 'text-red-400 bg-red-500/20';
      default: return 'text-blue-400 bg-blue-500/20';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'development': return <Code size={16} />;
      case 'language': return <Languages size={16} />;
      case 'business': return <Briefcase size={16} />;
      case 'fitness': return <Activity size={16} />;
      case 'academic': return <GraduationCap size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  // Generate weekly breakdown
  const weeks = Array.from({ length: Math.ceil(plan.durationDays / 7) }, (_, i) => i + 1);
  
  const weeklyTasks = weeks.reduce((acc, week) => {
    acc[week] = tasks?.filter(t => t.weekNumber === week) || [];
    return acc;
  }, {});

  return (
    <div className={`bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{plan.title}</h3>
              <p className="text-sm text-slate-400">{plan.description}</p>
            </div>
          </div>
          
          {plan.confidenceScore && (
            <div className="text-right">
              <div className="text-sm text-slate-400">AI Confidence</div>
              <div className="text-2xl font-bold text-green-400">{plan.confidenceScore}%</div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <Calendar size={16} className="text-purple-400 mb-1" />
            <div className="text-lg font-bold text-white">{plan.durationDays}</div>
            <div className="text-xs text-slate-400">Total Days</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <Clock size={16} className="text-blue-400 mb-1" />
            <div className="text-lg font-bold text-white">{plan.estimatedTotalHours}h</div>
            <div className="text-xs text-slate-400">Total Hours</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <Target size={16} className="text-green-400 mb-1" />
            <div className="text-lg font-bold text-white">{tasks?.length || 0}</div>
            <div className="text-xs text-slate-400">Generated Tasks</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <BarChart3 size={16} className="text-yellow-400 mb-1" />
            <div className="text-lg font-bold text-white">{plan.recommendedDailyHours}h</div>
            <div className="text-xs text-slate-400">Daily Recommended</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {plan.difficulty && (
            <span className={`px-3 py-1 rounded-full text-xs ${getDifficultyColor(plan.difficulty)}`}>
              {plan.difficulty}
            </span>
          )}
          {plan.category && (
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
              {plan.category}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
        {/* Overview Section */}
        <div className="border border-slate-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('overview')}
            className="w-full p-4 bg-slate-700/30 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
          >
            <span className="font-medium text-white">Overview</span>
            {expandedSections.overview ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedSections.overview && (
            <div className="p-4 space-y-4">
              {plan.summary && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Summary</h4>
                  <p className="text-sm text-white">{plan.summary}</p>
                </div>
              )}

              {analysis && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <div className="text-xs text-slate-400">Words</div>
                    <div className="text-lg font-bold text-white">{analysis.wordCount}</div>
                  </div>
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <div className="text-xs text-slate-400">Reading Time</div>
                    <div className="text-lg font-bold text-white">{analysis.estimatedReadingTimeMinutes}m</div>
                  </div>
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <div className="text-xs text-slate-400">Complexity</div>
                    <div className="text-lg font-bold text-white">{analysis.complexity}</div>
                  </div>
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <div className="text-xs text-slate-400">Topics</div>
                    <div className="text-lg font-bold text-white">{analysis.topics?.length || 0}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Weekly Breakdown */}
        <div className="border border-slate-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('weekly')}
            className="w-full p-4 bg-slate-700/30 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
          >
            <span className="font-medium text-white">Weekly Breakdown</span>
            {expandedSections.weekly ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedSections.weekly && (
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 mb-4">
                {weeks.map(week => (
                  <button
                    key={week}
                    onClick={() => setSelectedWeek(selectedWeek === week ? null : week)}
                    className={`
                      p-2 text-center rounded-lg transition-colors
                      ${selectedWeek === week 
                        ? 'bg-purple-500/20 border border-purple-500/50' 
                        : 'bg-slate-700/30 hover:bg-slate-700/50'
                      }
                    `}
                  >
                    <div className="text-xs text-slate-400">Week</div>
                    <div className="text-sm font-bold text-white">{week}</div>
                    <div className="text-xs text-purple-400">{weeklyTasks[week]?.length || 0} tasks</div>
                  </button>
                ))}
              </div>

              {selectedWeek && (
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-medium text-white">Week {selectedWeek} Tasks</h4>
                  {weeklyTasks[selectedWeek]?.map((task, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-xs text-purple-400">Day {task.dayNumber}</span>
                          <h5 className="text-sm text-white font-medium">{task.title}</h5>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          task.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                          task.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{task.description}</p>
                      {task.estimatedHours && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock size={12} />
                          {task.estimatedHours} hours
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Learning Objectives */}
        {plan.learningObjectives && plan.learningObjectives.length > 0 && (
          <div className="border border-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">Learning Objectives</h4>
            <ul className="space-y-2">
              {plan.learningObjectives.map((obj, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle size={14} className="text-green-400 mt-0.5" />
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prerequisites */}
        {plan.prerequisites && plan.prerequisites.length > 0 && (
          <div className="border border-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">Prerequisites</h4>
            <div className="flex flex-wrap gap-2">
              {plan.prerequisites.map((prereq, index) => (
                <span key={index} className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs">
                  {prereq}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        {plan.resources && plan.resources.length > 0 && (
          <div className="border border-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">Recommended Resources</h4>
            <ul className="space-y-2">
              {plan.resources.map((resource, index) => (
                <li key={index} className="text-sm text-purple-400 hover:text-purple-300">
                  • {resource}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            Confirm & Generate Tasks
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudyPlanParser;