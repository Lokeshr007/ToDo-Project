// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\pages\LearningPathPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Target,
  Clock,
  BarChart3,
  Users,
  Award,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Star,
  Download,
  Share2,
  Calendar,
  CheckCircle,
  Zap,
  Brain,
  Sparkles,
  ChevronRight,
  Code,
  Languages,
  Briefcase,
  Activity,
  GraduationCap
} from 'lucide-react';
import { format } from 'date-fns';
import { taskToast } from '@/shared/components/QuantumToaster';

import { useWorkspace } from '@/app/providers/WorkspaceContext';
import * as learningPathApi from '../api/learningPathApi';
import LearningPathVisualizer from '../components/LearningPathVisualizer';
import LoadingSkeleton from '@/features/todos/components/common/LoadingSkeleton';
import EmptyState from '@/features/todos/components/common/EmptyState';

function LearningPathPage() {
  const [learningPaths, setLearningPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    fetchLearningPaths();
  }, [currentWorkspace, filter, category, difficulty]);

  const fetchLearningPaths = async () => {
    setLoading(true);
    try {
      const paths = await learningPathApi.getLearningPaths(
        currentWorkspace?.id,
        category !== 'all' ? category : null,
        difficulty !== 'all' ? difficulty : null
      );
      setLearningPaths(paths);
    } catch (error) {
      console.error('Failed to fetch learning paths:', error);
      taskToast.error('Failed to load learning paths');
    } finally {
      setLoading(false);
    }
  };

  const filteredPaths = learningPaths.filter(path => {
    if (searchQuery) {
      return path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             path.description?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'beginner': return 'text-green-400 bg-green-500/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'advanced': return 'text-red-400 bg-red-500/20';
      default: return 'text-blue-400 bg-blue-500/20';
    }
  };

  const getCategoryIcon = (cat) => {
    switch(cat?.toLowerCase()) {
      case 'development': return <Code size={16} />;
      case 'language': return <Languages size={16} />;
      case 'business': return <Briefcase size={16} />;
      case 'fitness': return <Activity size={16} />;
      case 'academic': return <GraduationCap size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  const handleClonePath = async (pathId) => {
    try {
      const cloned = await learningPathApi.cloneLearningPath(pathId);
      taskToast.success('Learning path cloned successfully');
      fetchLearningPaths();
    } catch (error) {
      taskToast.error('Failed to clone learning path');
    }
  };

  const handleRatePath = async (pathId, rating) => {
    try {
      await learningPathApi.rateLearningPath(pathId, rating);
      taskToast.success('Thank you for rating!');
      fetchLearningPaths();
    } catch (error) {
      taskToast.error('Failed to submit rating');
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Learning Paths</h1>
                <p className="text-slate-400 text-sm mt-1">
                  Structured 60-day learning journeys
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/app/ai/enterprise')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2"
            >
              <Zap size={18} />
              Create New Path
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search learning paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="all">All Categories</option>
                <option value="development">Development</option>
                <option value="language">Language</option>
                <option value="business">Business</option>
                <option value="fitness">Fitness</option>
                <option value="academic">Academic</option>
              </select>

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredPaths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPaths.map(path => (
              <div
                key={path.id}
                className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer"
                onClick={() => setSelectedPath(path)}
              >
                {/* Path Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
                        {getCategoryIcon(path.category)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{path.title}</h3>
                        <p className="text-sm text-slate-400">{path.category}</p>
                      </div>
                    </div>
                    
                    {path.averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-400 fill-current" />
                        <span className="text-sm text-white">{path.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                    {path.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{path.totalDays}</div>
                      <div className="text-xs text-slate-400">Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{path.totalHours}h</div>
                      <div className="text-xs text-slate-400">Hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{path.usageCount}</div>
                      <div className="text-xs text-slate-400">Used</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(path.difficulty)}`}>
                      {path.difficulty}
                    </span>
                    {path.milestones && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                        {path.milestones.length} Milestones
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-700/30 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar size={14} />
                      {format(new Date(path.createdAt), 'MMM d, yyyy')}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClonePath(path.id);
                      }}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      Clone Path
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No learning paths found"
            description="Create your first learning path with AI assistance"
            actionLabel="Create Learning Path"
            onAction={() => navigate('/app/ai/enterprise')}
          />
        )}
      </div>

      {/* Path Details Modal */}
      {selectedPath && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <LearningPathVisualizer
              path={selectedPath}
              onClose={() => setSelectedPath(null)}
              onRate={(rating) => handleRatePath(selectedPath.id, rating)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default LearningPathPage;
