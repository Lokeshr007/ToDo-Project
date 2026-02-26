// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\components\AIContextPanel.jsx
import { useState } from 'react';
import {
  Brain,
  Eye,
  Ear,
  BookOpen,
  Hand,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
  Save,
  Edit2,
  User,
  Target,
  Zap,
  Sparkles
} from 'lucide-react';

function AIContextPanel({ context, onUpdate, onClose, className = '' }) {
  const [editing, setEditing] = useState(false);
  const [editedContext, setEditedContext] = useState(context || {});

  if (!context) return null;

  const learningStyles = [
    { value: 'VISUAL', icon: Eye, label: 'Visual', color: 'blue' },
    { value: 'AUDITORY', icon: Ear, label: 'Auditory', color: 'green' },
    { value: 'READING', icon: BookOpen, label: 'Reading', color: 'purple' },
    { value: 'KINESTHETIC', icon: Hand, label: 'Kinesthetic', color: 'orange' }
  ];

  const getLearningStyleIcon = (style) => {
    const found = learningStyles.find(s => s.value === style);
    return found?.icon || Brain;
  };

  const getLearningStyleColor = (style) => {
    const colors = {
      VISUAL: 'text-blue-400 bg-blue-500/20',
      AUDITORY: 'text-green-400 bg-green-500/20',
      READING: 'text-purple-400 bg-purple-500/20',
      KINESTHETIC: 'text-orange-400 bg-orange-500/20'
    };
    return colors[style] || 'text-slate-400 bg-slate-500/20';
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedContext);
    }
    setEditing(false);
  };

  const handleAddStrength = () => {
    const strength = prompt('Enter a strength:');
    if (strength) {
      setEditedContext(prev => ({
        ...prev,
        strengths: [...(prev.strengths || []), strength]
      }));
    }
  };

  const handleAddWeakness = () => {
    const weakness = prompt('Enter an area for improvement:');
    if (weakness) {
      setEditedContext(prev => ({
        ...prev,
        weaknesses: [...(prev.weaknesses || []), weakness]
      }));
    }
  };

  const removeStrength = (index) => {
    setEditedContext(prev => ({
      ...prev,
      strengths: prev.strengths.filter((_, i) => i !== index)
    }));
  };

  const removeWeakness = (index) => {
    setEditedContext(prev => ({
      ...prev,
      weaknesses: prev.weaknesses.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className={`bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-purple-400" />
          <h3 className="font-medium text-white">AI Context</h3>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
            >
              <Edit2 size={14} />
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="p-1 hover:bg-slate-700 rounded text-green-400"
              >
                <Save size={14} />
              </button>
              <button
                onClick={() => setEditing(false)}
                className="p-1 hover:bg-slate-700 rounded text-red-400"
              >
                <X size={14} />
              </button>
            </>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Learning Style */}
        <div>
          <label className="text-xs text-slate-400 block mb-2">Learning Style</label>
          {editing ? (
            <select
              value={editedContext.learningStyle || 'VISUAL'}
              onChange={(e) => setEditedContext(prev => ({ ...prev, learningStyle: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
            >
              {learningStyles.map(style => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </select>
          ) : (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getLearningStyleColor(context.learningStyle)}`}>
              {React.createElement(getLearningStyleIcon(context.learningStyle), { size: 16 })}
              <span className="text-sm">{context.learningStyle}</span>
            </div>
          )}
        </div>

        {/* Attention Span */}
        <div>
          <label className="text-xs text-slate-400 block mb-2">Attention Span</label>
          {editing ? (
            <input
              type="number"
              value={editedContext.attentionSpan || 45}
              onChange={(e) => setEditedContext(prev => ({ ...prev, attentionSpan: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
              min="15"
              max="120"
              step="5"
            />
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/30 rounded-lg">
              <Clock size={16} className="text-blue-400" />
              <span className="text-sm text-white">{context.attentionSpan} minutes</span>
            </div>
          )}
        </div>

        {/* Progress */}
        {context.progressRate !== undefined && (
          <div>
            <label className="text-xs text-slate-400 block mb-2">Progress</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${context.progressRate}%` }}
                />
              </div>
              <span className="text-sm text-white">{context.progressRate}%</span>
            </div>
          </div>
        )}

        {/* Strengths */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-slate-400">Strengths</label>
            {editing && (
              <button
                onClick={handleAddStrength}
                className="p-1 hover:bg-slate-700 rounded text-green-400"
              >
                <Plus size={12} />
              </button>
            )}
          </div>
          <div className="space-y-1">
            {(editing ? editedContext.strengths : context.strengths)?.map((strength, index) => (
              <div key={index} className="flex items-center justify-between group px-3 py-1.5 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle size={12} className="text-green-400" />
                  <span className="text-xs text-green-300">{strength}</span>
                </div>
                {editing && (
                  <button
                    onClick={() => removeStrength(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} className="text-red-400" />
                  </button>
                )}
              </div>
            ))}
            {(editing ? editedContext.strengths : context.strengths)?.length === 0 && (
              <p className="text-xs text-slate-500 italic">No strengths listed</p>
            )}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-slate-400">Areas to Improve</label>
            {editing && (
              <button
                onClick={handleAddWeakness}
                className="p-1 hover:bg-slate-700 rounded text-yellow-400"
              >
                <Plus size={12} />
              </button>
            )}
          </div>
          <div className="space-y-1">
            {(editing ? editedContext.weaknesses : context.weaknesses)?.map((weakness, index) => (
              <div key={index} className="flex items-center justify-between group px-3 py-1.5 bg-yellow-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle size={12} className="text-yellow-400" />
                  <span className="text-xs text-yellow-300">{weakness}</span>
                </div>
                {editing && (
                  <button
                    onClick={() => removeWeakness(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} className="text-red-400" />
                  </button>
                )}
              </div>
            ))}
            {(editing ? editedContext.weaknesses : context.weaknesses)?.length === 0 && (
              <p className="text-xs text-slate-500 italic">No areas listed</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="pt-2 border-t border-slate-700">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-slate-400">Interactions:</div>
            <div className="text-white text-right">{context.interactionCount || 0}</div>
            <div className="text-slate-400">Last Active:</div>
            <div className="text-white text-right">
              {context.lastInteraction 
                ? new Date(context.lastInteraction).toLocaleDateString()
                : 'Today'
              }
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        {context.recommendation && (
          <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <div className="flex items-start gap-2">
              <Sparkles size={14} className="text-purple-400 mt-0.5" />
              <div>
                <p className="text-xs text-purple-300 font-medium mb-1">AI Recommendation</p>
                <p className="text-xs text-slate-300">{context.recommendation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIContextPanel;