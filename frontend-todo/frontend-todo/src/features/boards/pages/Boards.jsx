import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Plus, 
  Layout, 
  MoreVertical, 
  ArrowLeft,
  Clock,
  CheckCircle,
  Users,
  Edit2,
  Trash2,
  Copy,
  X,
  Loader
} from "lucide-react";
import API from "@/services/api";
import { useTheme } from "@/app/providers/ThemeContext";
import { useNotification } from "@/app/providers/NotificationContext";
import { taskToast } from '@/shared/components/QuantumToaster';
import { format } from 'date-fns';

function Boards() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { themeStyles } = useTheme();
  const { addNotification } = useNotification();
  const [boards, setBoards] = useState([]);
  const [project, setProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [newBoardName, setNewBoardName] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (projectId) {
      fetchBoards();
    }
  }, [projectId]);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const boardsRes = await API.get(`/boards?projectId=${projectId}`);
      setBoards(boardsRes.data);
      
      // Fetch project details
      const projectRes = await API.get(`/projects/${projectId}`);
      setProject(projectRes.data);

      // Fetch stats for each board
      const statsData = {};
      for (const board of boardsRes.data) {
        try {
          const todosRes = await API.get(`/kanban/boards/${board.id}`);
          statsData[board.id] = {
            total: todosRes.data.columns?.flatMap(col => col.tasks || col.todos || [])?.length || 0,
            completed: todosRes.data.columns?.flatMap(col => 
              (col.tasks || col.todos || []).filter(t => t.status === 'COMPLETED')
            )?.length || 0
          };
        } catch (error) {
          statsData[board.id] = { total: 0, completed: 0 };
        }
      }
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch boards:", error);
      taskToast.error("Failed to load boards");
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load boards'
      });
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async () => {
    if (!newBoardName.trim()) {
      taskToast.error("Board name is required");
      return;
    }

    try {
      const response = await API.post(`/boards?projectId=${projectId}`, {
        name: newBoardName
      });
      
      setBoards([...boards, response.data]);
      setShowCreateModal(false);
      setNewBoardName("");
      taskToast.success("Board created successfully");
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Board created successfully'
      });
    } catch (error) {
      console.error("Failed to create board:", error);
      taskToast.error(error.response?.data?.message || "Failed to create board");
    }
  };

  const updateBoard = async () => {
    if (!newBoardName.trim() || !selectedBoard) return;

    try {
      const response = await API.put(`/boards/${selectedBoard.id}`, {
        name: newBoardName
      });
      
      setBoards(boards.map(b => 
        b.id === selectedBoard.id ? response.data : b
      ));
      setShowEditModal(false);
      setSelectedBoard(null);
      setNewBoardName("");
      taskToast.success("Board updated successfully");
    } catch (error) {
      console.error("Failed to update board:", error);
      taskToast.error(error.response?.data?.message || "Failed to update board");
    }
  };

  const deleteBoard = async (boardId) => {
    if (!window.confirm("Are you sure you want to delete this board? This action cannot be undone.")) {
      return;
    }

    try {
      await API.delete(`/boards/${boardId}`);
      setBoards(boards.filter(b => b.id !== boardId));
      taskToast.success("Board deleted successfully");
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Board deleted successfully'
      });
    } catch (error) {
      console.error("Failed to delete board:", error);
      taskToast.error(error.response?.data?.message || "Failed to delete board");
    }
  };

  const duplicateBoard = async (board) => {
    try {
      const response = await API.post(`/boards/${board.id}/duplicate`);
      setBoards([...boards, response.data]);
      taskToast.success("Board duplicated successfully");
    } catch (error) {
      console.error("Failed to duplicate board:", error);
      taskToast.error("Failed to duplicate board");
    }
  };

  const navigateToBoard = (boardId) => {
    navigate(`/app/boards/${boardId}`);
  };

  const openEditModal = (board) => {
    setSelectedBoard(board);
    setNewBoardName(board.name);
    setShowEditModal(true);
  };

  if (loading) {
    return <BoardsSkeleton themeStyles={themeStyles} />;
  }

  return (
    <div className={`min-h-screen ${themeStyles.bg} p-4 sm:p-6`}>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/app/projects')}
          className={`flex items-center gap-2 ${themeStyles.textSecondary} hover:${themeStyles.text} mb-4 transition-colors`}
        >
          <ArrowLeft size={18} />
          Back to Projects
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${themeStyles.text}`}>
              {project?.name || 'Project'} Boards
            </h1>
            <p className={`${themeStyles.textSecondary} mt-1`}>Manage your Kanban boards and tasks</p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all self-start"
          >
            <Plus size={18} />
            New Board
          </button>
        </div>
      </div>

      {/* Boards Grid */}
      {boards.length === 0 ? (
        <div className={`text-center py-12 ${themeStyles.card} rounded-xl border ${themeStyles.border}`}>
          <Layout size={48} className={`mx-auto ${themeStyles.textSecondary} mb-4`} />
          <h3 className={`text-lg font-medium ${themeStyles.text} mb-2`}>No boards yet</h3>
          <p className={`${themeStyles.textSecondary} mb-4`}>Create your first board to start organizing tasks</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map(board => (
            <BoardCard
              key={board.id}
              board={board}
              stats={stats[board.id] || { total: 0, completed: 0 }}
              onNavigate={navigateToBoard}
              onEdit={openEditModal}
              onDelete={deleteBoard}
              onDuplicate={duplicateBoard}
              themeStyles={themeStyles}
            />
          ))}
        </div>
      )}

      {/* Create Board Modal */}
      {showCreateModal && (
        <BoardModal
          title="Create New Board"
          boardName={newBoardName}
          onNameChange={setNewBoardName}
          onClose={() => {
            setShowCreateModal(false);
            setNewBoardName("");
          }}
          onSave={createBoard}
          themeStyles={themeStyles}
        />
      )}

      {/* Edit Board Modal */}
      {showEditModal && (
        <BoardModal
          title="Edit Board"
          boardName={newBoardName}
          onNameChange={setNewBoardName}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBoard(null);
            setNewBoardName("");
          }}
          onSave={updateBoard}
          isEdit={true}
          themeStyles={themeStyles}
        />
      )}
    </div>
  );
}

// Board Card Component
function BoardCard({ board, stats, onNavigate, onEdit, onDelete, onDuplicate, themeStyles }) {
  const [showMenu, setShowMenu] = useState(false);
  const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div
      className={`${themeStyles.card} rounded-xl border ${themeStyles.border} hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden`}
      onClick={() => onNavigate(board.id)}
    >
      {/* Progress Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${themeStyles.border}`}>
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
            <Layout size={24} className="text-white" />
          </div>
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className={`p-1 ${themeStyles.hover} rounded-lg transition-colors`}
            >
              <MoreVertical size={16} className={themeStyles.textSecondary} />
            </button>
            
            {showMenu && (
              <div
                className={`absolute right-0 mt-1 w-48 ${themeStyles.card} rounded-lg border ${themeStyles.border} shadow-xl z-10`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    onEdit(board);
                    setShowMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm ${themeStyles.text} hover:${themeStyles.hover} flex items-center gap-2`}
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDuplicate(board);
                    setShowMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm ${themeStyles.text} hover:${themeStyles.hover} flex items-center gap-2`}
                >
                  <Copy size={14} />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    onDelete(board.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <h3 className={`font-semibold ${themeStyles.text} text-lg mb-2`}>{board.name}</h3>
        
        {/* Stats */}
        <div className="flex items-center gap-4 mb-3">
          <div className={`flex items-center gap-1 text-sm ${themeStyles.textSecondary}`}>
            <Layout size={14} />
            <span>{stats.total} tasks</span>
          </div>
          <div className={`flex items-center gap-1 text-sm ${themeStyles.textSecondary}`}>
            <CheckCircle size={14} className="text-green-500" />
            <span>{stats.completed} done</span>
          </div>
        </div>

        {/* Progress Text */}
        <div className="flex items-center justify-between text-xs">
          <span className={themeStyles.textSecondary}>Progress</span>
          <span className="text-purple-600 font-medium">{progress}%</span>
        </div>
      </div>
    </div>
  );
}

// Board Modal Component
function BoardModal({ title, boardName, onNameChange, onClose, onSave, isEdit = false, themeStyles }) {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await onSave();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className={`w-full max-w-md ${themeStyles.modal} rounded-2xl p-6 border ${themeStyles.border}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-semibold ${themeStyles.text}`}>{title}</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${themeStyles.hover} transition-colors`}
          >
            <X size={18} className={themeStyles.textSecondary} />
          </button>
        </div>
        
        <input
          type="text"
          value={boardName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Board name"
          className={`w-full px-4 py-2 rounded-lg ${themeStyles.input} border ${themeStyles.border} ${themeStyles.text} mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500`}
          autoFocus
          onKeyPress={(e) => e.key === 'Enter' && handleSave()}
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 rounded-lg ${themeStyles.hover} ${themeStyles.textSecondary} transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !boardName.trim()}
            className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader size={16} className="animate-spin mx-auto" /> : (isEdit ? 'Update' : 'Create')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Skeleton Loading Component
function BoardsSkeleton({ themeStyles }) {
  return (
    <div className={`min-h-screen ${themeStyles.bg} p-4 sm:p-6`}>
      <div className="animate-pulse">
        <div className="h-10 w-32 bg-gray-700 rounded mb-8" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="h-8 w-48 bg-gray-700 rounded mb-2" />
            <div className="h-4 w-64 bg-gray-700 rounded" />
          </div>
          <div className="h-10 w-32 bg-gray-700 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Boards;
