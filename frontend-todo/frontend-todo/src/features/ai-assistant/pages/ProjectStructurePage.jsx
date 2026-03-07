// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\pages\ProjectStructurePage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  Layout,
  Columns,
  ListTodo,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Tag,
  ArrowLeft,
  Edit2,
  Save,
  X,
  Plus,
  ChevronRight,
  Settings,
  Share2,
  Download,
  Eye,
  EyeOff,
  Sparkles,
  Brain,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useWorkspace } from '@/app/providers/WorkspaceContext';
import * as projectApi from '@/services/api/projectApi';
import * as boardApi from '@/services/api/boardApi';
import * as todoApi from '@/services/api/todoApi';
import LoadingSkeleton from '@/features/todos/components/common/LoadingSkeleton';

function ProjectStructurePage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [boards, setBoards] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [expandedBoards, setExpandedBoards] = useState(new Set());
  const [editing, setEditing] = useState(false);
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchProjectStructure();
    }
  }, [projectId]);

  const fetchProjectStructure = async () => {
    setLoading(true);
    try {
      // Fetch project details
      const projectData = await projectApi.projectApi.getProject(projectId);
      setProject(projectData);

      // Fetch boards
      const boardsData = await boardApi.boardApi.getBoards(projectId);
      setBoards(boardsData);

      // Fetch tasks for each board
      const allTasks = [];
      for (const board of boardsData) {
        const boardTasks = await todoApi.todoApi.getTodos({ boardId: board.id });
        allTasks.push(...boardTasks);
      }
      setTasks(allTasks);

      // Select first board by default
      if (boardsData.length > 0) {
        setSelectedBoard(boardsData[0].id);
      }

    } catch (error) {
      console.error('Failed to fetch project structure:', error);
      toast.error('Failed to load project structure');
    } finally {
      setLoading(false);
    }
  };

  const toggleBoard = (boardId) => {
    setExpandedBoards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(boardId)) {
        newSet.delete(boardId);
      } else {
        newSet.add(boardId);
      }
      return newSet;
    });
  };

  const getBoardStats = (boardId) => {
    const boardTasks = tasks.filter(t => t.boardId === boardId);
    const total = boardTasks.length;
    const completed = boardTasks.filter(t => t.status === 'COMPLETED').length;
    const inProgress = boardTasks.filter(t => t.status === 'IN_PROGRESS').length;
    const pending = boardTasks.filter(t => t.status === 'PENDING').length;
    
    return { total, completed, inProgress, pending };
  };

  const getTaskStatusColor = (status) => {
    switch(status) {
      case 'COMPLETED': return 'text-green-400 bg-green-500/20';
      case 'IN_PROGRESS': return 'text-blue-400 bg-blue-500/20';
      case 'PENDING': return 'text-yellow-400 bg-yellow-500/20';
      case 'BLOCKED': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getTaskPriorityColor = (priority) => {
    switch(priority) {
      case 'HIGH': return 'text-red-400 bg-red-500/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20';
      case 'LOW': return 'text-green-400 bg-green-500/20';
      default: return 'text-blue-400 bg-blue-500/20';
    }
  };

  const calculateProgress = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                  <span>Project</span>
                  <ChevronRight size={12} />
                  <span className="text-white">{project?.name}</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Project Structure</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                {showStats ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <button
                onClick={() => setEditing(!editing)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                {editing ? <Save size={18} /> : <Edit2 size={18} />}
              </button>
              <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                <Share2 size={18} />
              </button>
              <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                <Download size={18} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">Overall Progress</span>
              <span className="text-white font-medium">{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {showStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <FolderOpen size={20} className="text-purple-400" />
                <span className="text-2xl font-bold text-white">{boards.length}</span>
              </div>
              <p className="text-sm text-slate-400">Total Boards</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <ListTodo size={20} className="text-blue-400" />
                <span className="text-2xl font-bold text-white">{tasks.length}</span>
              </div>
              <p className="text-sm text-slate-400">Total Tasks</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle size={20} className="text-green-400" />
                <span className="text-2xl font-bold text-white">
                  {tasks.filter(t => t.status === 'COMPLETED').length}
                </span>
              </div>
              <p className="text-sm text-slate-400">Completed</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <Clock size={20} className="text-yellow-400" />
                <span className="text-2xl font-bold text-white">
                  {tasks.filter(t => t.status === 'IN_PROGRESS').length}
                </span>
              </div>
              <p className="text-sm text-slate-400">In Progress</p>
            </div>
          </div>
        )}

        {/* Boards Grid */}
        <div className="space-y-6">
          {boards.map(board => {
            const stats = getBoardStats(board.id);
            const isExpanded = expandedBoards.has(board.id);
            
            return (
              <div
                key={board.id}
                className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 overflow-hidden"
              >
                {/* Board Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-slate-700/30 transition-colors"
                  onClick={() => toggleBoard(board.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: board.color + '20' }}
                      >
                        <Layout size={20} style={{ color: board.color }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{board.name}</h3>
                        <p className="text-sm text-slate-400">{board.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{stats.total}</div>
                          <div className="text-xs text-slate-400">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">{stats.completed}</div>
                          <div className="text-xs text-slate-400">Done</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-400">{stats.inProgress}</div>
                          <div className="text-xs text-slate-400">Active</div>
                        </div>
                      </div>

                      <button className="p-2 hover:bg-slate-700 rounded-lg">
                        <ChevronRight 
                          size={18} 
                          className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Mini Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                      <div 
                        className="h-1 rounded-full transition-all"
                        style={{ 
                          width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
                          backgroundColor: board.color
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Board Tasks */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      {['PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'].map(status => {
                        const statusTasks = tasks.filter(
                          t => t.boardId === board.id && t.status === status
                        );
                        
                        return (
                          <div key={status} className="space-y-2">
                            <h4 className="text-sm font-medium text-slate-400 mb-3">
                              {status.replace('_', ' ')}
                              <span className="ml-2 text-xs bg-slate-700 px-2 py-0.5 rounded">
                                {statusTasks.length}
                              </span>
                            </h4>
                            
                            {statusTasks.slice(0, 3).map(task => (
                              <div
                                key={task.id}
                                className="p-3 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-purple-500/50 transition-colors cursor-pointer"
                                onClick={() => navigate(`/app/todos/${task.id}`)}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <span className="text-sm text-white font-medium">{task.title}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded ${getTaskPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  {task.dueDate && (
                                    <>
                                      <Calendar size={10} />
                                      {format(new Date(task.dueDate), 'MMM d')}
                                    </>
                                  )}
                                  {task.assignedTo && (
                                    <>
                                      <Users size={10} />
                                      {task.assignedTo.name}
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                            
                            {statusTasks.length > 3 && (
                              <button className="text-xs text-purple-400 hover:text-purple-300">
                                +{statusTasks.length - 3} more
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* AI Insights */}
        <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/30 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Brain size={24} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Sparkles size={18} className="text-purple-400" />
                AI Structure Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-300 mb-2">📊 Workload Distribution</p>
                  <ul className="space-y-1 text-xs text-slate-400">
                    <li>• Most tasks are in Week 1-2 (foundation)</li>
                    <li>• Review weeks have lighter loads</li>
                    <li>• Project weeks have fewer but larger tasks</li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-slate-300 mb-2">🎯 Recommendations</p>
                  <ul className="space-y-1 text-xs text-slate-400">
                    <li>• Complete prerequisite topics first</li>
                    <li>• Schedule 2-3 hours per day</li>
                    <li>• Use weekends for project work</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectStructurePage;
