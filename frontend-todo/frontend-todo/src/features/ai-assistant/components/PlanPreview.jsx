// frontend/src/features/ai-assistant/components/PlanPreview.jsx
import { useState } from "react";
import { 
  ChevronLeft, 
  CheckCircle, 
  Calendar, 
  BookOpen, 
  Target,
  Clock,
  Edit2,
  Save,
  X,
  AlertCircle,
  Loader
} from "lucide-react";

function PlanPreview({ plan, onConfirm, onBack, processing }) {
  const [editing, setEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState(plan);

  if (!plan) return null;

  const handleSaveEdit = () => {
    setEditing(false);
    // Update plan with edited values
  };

  const handleDayClick = (day) => {
    // Show detailed view for specific day
    console.log('View day:', day);
  };

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
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
            >
              <Edit2 size={16} />
            </button>
          ) : (
            <>
              <button
                onClick={() => setEditing(false)}
                className="p-2 hover:bg-slate-700 rounded-lg text-red-400"
              >
                <X size={16} />
              </button>
              <button
                onClick={handleSaveEdit}
                className="p-2 hover:bg-slate-700 rounded-lg text-green-400"
              >
                <Save size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Plan Title */}
      <div className="mb-6">
        {editing ? (
          <input
            type="text"
            value={editedPlan.title}
            onChange={(e) => setEditedPlan({ ...editedPlan, title: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xl font-bold"
          />
        ) : (
          <h2 className="text-2xl font-bold text-white">{plan.title}</h2>
        )}
        
        <div className="flex items-center gap-4 mt-2 text-sm">
          <span className="flex items-center gap-1 text-slate-400">
            <Calendar size={14} />
            {plan.duration} days
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <BookOpen size={14} />
            {plan.subjects?.length || 0} subjects
          </span>
        </div>
      </div>

      {/* Subjects */}
      {plan.subjects && plan.subjects.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Subjects</h3>
          <div className="flex flex-wrap gap-2">
            {plan.subjects.map((subject, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      {plan.milestones && plan.milestones.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Milestones</h3>
          <div className="space-y-2">
            {plan.milestones.map((milestone, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg"
              >
                <Target size={16} className="text-purple-400 mt-0.5" />
                <div>
                  <p className="text-white text-sm">{milestone.description}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Day {milestone.day}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Goals Preview */}
      {plan.dailyGoals && plan.dailyGoals.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Daily Breakdown</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {plan.dailyGoals.slice(0, 7).map((day, index) => (
              <div
                key={index}
                onClick={() => handleDayClick(day.day)}
                className="p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Day {day.day}</span>
                  {day.hours && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={10} />
                      {day.hours} hours
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {day.topics?.slice(0, 3).map((topic, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-slate-600 text-slate-300 rounded"
                    >
                      {topic}
                    </span>
                  ))}
                  {day.topics?.length > 3 && (
                    <span className="text-xs text-slate-500">
                      +{day.topics.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
            {plan.dailyGoals.length > 7 && (
              <p className="text-xs text-slate-500 text-center mt-2">
                +{plan.dailyGoals.length - 7} more days
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <button
          onClick={onConfirm}
          disabled={processing}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {processing ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <CheckCircle size={18} />
          )}
          {processing ? 'Processing...' : 'Confirm & Generate Tasks'}
        </button>
      </div>
    </div>
  );
}

export default PlanPreview;
