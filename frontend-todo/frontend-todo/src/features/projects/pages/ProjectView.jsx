// frontend/src/features/projects/pages/ProjectView.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/services/api";
import { useTheme } from "@/app/providers/ThemeContext";
import { useNotification } from "@/app/providers/NotificationContext";
import { useWorkspace } from "@/app/providers/WorkspaceContext";
import {
  Grid,
  List,
  Calendar as CalendarIcon,
  Settings,
  Plus,
  MoreVertical,
  Clock,
  Users,
  Tag,
  Paperclip,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Filter,
  SortAsc,
  Search,
  Share2,
  Download,
  Archive,
  Trash2,
  Edit2,
  Copy,
  Move,
  Flag,
  UserPlus,
  Link,
  Bell,
  Star,
  X,
  ChevronRight,
  Calendar,
  Kanban,
  Table,
  Loader
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function ProjectView() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const [project, setProject] = useState(null);
  const [boards, setBoards] = useState([]);
  const [view, setView] = useState('board');
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [filters, setFilters] = useState({
    assignee: 'all',
    priority: 'all',
    status: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const { themeStyles } = useTheme();
  const { addNotification } = useNotification();

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  // Separate effect for fetching members after project is loaded
  useEffect(() => {
    if (project?.workspaceId) {
      fetchProjectMembers(project.workspaceId);
    }
  }, [project]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      // Fetch project details
      const projectRes = await API.get(`/projects/${projectId}`);
      setProject(projectRes.data);

      // Fetch boards for the project
      const boardsRes = await API.get(`/boards?projectId=${projectId}`);
      
      // For each board, fetch its columns and tasks
      const boardsWithColumns = await Promise.all(
        boardsRes.data.map(async (board) => {
          try {
            // Fetch board with columns and tasks
            const boardDetailsRes = await API.get(`/kanban/boards/${board.id}`);
            
            // Process columns and tasks
            const columns = boardDetailsRes.data.columns || [];
            
            // Flatten tasks from all columns for easy access
            const todos = columns.flatMap(col => col.tasks || []);
            
            return {
              ...board,
              columns: columns,
              todos: todos
            };
          } catch (error) {
            console.error(`Failed to fetch board ${board.id}:`, error);
            return { 
              ...board, 
              columns: [],
              todos: [] 
            };
          }
        })
      );
      
      setBoards(boardsWithColumns);
    } catch (error) {
      console.error("Failed to fetch project:", error);
      toast.error("Failed to load project");
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load project data'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectMembers = async (workspaceId) => {
    if (!workspaceId) {
      console.log("No workspaceId available for fetching members");
      return;
    }
    
    try {
      console.log("Fetching members for workspace:", workspaceId);
      const response = await API.get(`/workspaces/${workspaceId}/members`);
      setMembers(response.data);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      // Don't show toast for this error as it's not critical
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Find source and destination boards
    const sourceBoardIndex = boards.findIndex(b => 
      b.columns?.some(col => col.id.toString() === source.droppableId)
    );
    const destBoardIndex = boards.findIndex(b => 
      b.columns?.some(col => col.id.toString() === destination.droppableId)
    );

    if (sourceBoardIndex === -1 || destBoardIndex === -1) return;

    // Create optimistic update
    const newBoards = [...boards];
    
    // Find source and destination columns
    const sourceBoard = { ...newBoards[sourceBoardIndex] };
    const destBoard = { ...newBoards[destBoardIndex] };
    
    const sourceColumn = sourceBoard.columns.find(col => col.id.toString() === source.droppableId);
    const destColumn = destBoard.columns.find(col => col.id.toString() === destination.droppableId);
    
    if (!sourceColumn || !destColumn) return;

    const sourceTasks = [...(sourceColumn.tasks || [])];
    const destTasks = sourceBoardIndex === destBoardIndex && source.droppableId === destination.droppableId
      ? sourceTasks
      : [...(destColumn.tasks || [])];
    
    const [movedTask] = sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, movedTask);

    sourceColumn.tasks = sourceTasks;
    destColumn.tasks = destTasks;

    // Update boards with modified columns
    sourceBoard.columns = sourceBoard.columns.map(col => 
      col.id.toString() === source.droppableId ? sourceColumn : col
    );
    
    if (sourceBoardIndex !== destBoardIndex) {
      destBoard.columns = destBoard.columns.map(col => 
        col.id.toString() === destination.droppableId ? destColumn : col
      );
    } else {
      sourceBoard.columns = sourceBoard.columns.map(col => {
        if (col.id.toString() === source.droppableId) return sourceColumn;
        if (col.id.toString() === destination.droppableId) return destColumn;
        return col;
      });
    }

    newBoards[sourceBoardIndex] = sourceBoard;
    if (sourceBoardIndex !== destBoardIndex) {
      newBoards[destBoardIndex] = destBoard;
    }

    // Update todos array for backward compatibility
    newBoards.forEach(board => {
      board.todos = board.columns?.flatMap(col => col.tasks || []) || [];
    });

    setBoards(newBoards);

    // Update on server
    try {
      await API.post('/kanban/tasks/move', {
        taskId: parseInt(draggableId),
        sourceColumnId: parseInt(source.droppableId),
        destinationColumnId: parseInt(destination.droppableId),
        newOrderIndex: destination.index
      });
      
      toast.success('Task moved successfully');
      addNotification({
        type: 'success',
        title: 'Task Moved',
        message: 'Task has been moved successfully'
      });
    } catch (error) {
      console.error("Failed to move task:", error);
      toast.error("Failed to move task");
      fetchProjectData(); // Revert on error
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'NORMAL': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'LOW': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'COMPLETED': return 'bg-green-500/20 text-green-400';
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400';
      case 'REVIEW': return 'bg-purple-500/20 text-purple-400';
      case 'BLOCKED': return 'bg-red-500/20 text-red-400';
      case 'BACKLOG': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  const filterTasks = (tasks) => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      if (searchQuery && !task.item?.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !task.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filters.assignee !== 'all' && task.assignedTo?.id !== parseInt(filters.assignee)) {
        return false;
      }
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }
      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }
      return true;
    });
  };

  const createTaskInColumn = async (columnId, taskData) => {
    try {
      const response = await API.post(`/kanban/columns/${columnId}/tasks`, taskData);
      toast.success('Task created successfully');
      fetchProjectData();
      return response.data;
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task");
    }
  };

  const updateColumn = async (columnId, columnData) => {
    try {
      await API.put(`/kanban/columns/${columnId}`, columnData);
      toast.success('Column updated');
      fetchProjectData();
    } catch (error) {
      console.error("Failed to update column:", error);
      toast.error("Failed to update column");
    }
  };

  const deleteColumn = async (columnId) => {
    if (!window.confirm('Are you sure you want to delete this column? All tasks will be moved to backlog.')) return;
    
    try {
      await API.delete(`/kanban/columns/${columnId}`);
      toast.success('Column deleted');
      fetchProjectData();
    } catch (error) {
      console.error("Failed to delete column:", error);
      toast.error("Failed to delete column");
    }
  };

  if (loading) {
    return <ProjectSkeleton themeStyles={themeStyles} />;
  }

  return (
    <div className={`min-h-screen ${themeStyles.bg}`}>
      {/* Project Header */}
      <div className={`border-b ${themeStyles.border} ${themeStyles.header} sticky top-0 z-10 backdrop-blur-lg bg-opacity-90`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/app/projects')}
                className={`p-2 rounded-lg ${themeStyles.hover} transition-colors`}
              >
                <ChevronRight size={20} className={`${themeStyles.textSecondary} rotate-180`} />
              </button>
              
              <div>
                <h1 className={`text-2xl font-bold ${themeStyles.text}`}>{project?.name}</h1>
                <p className={`text-sm ${themeStyles.textSecondary} mt-1 flex items-center gap-2`}>
                  <Clock size={14} />
                  Last updated {project?.updatedAt ? format(new Date(project.updatedAt), 'MMM dd, yyyy') : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className={`flex rounded-lg border ${themeStyles.border} overflow-hidden bg-opacity-50 ${themeStyles.card}`}>
                <button
                  onClick={() => setView('board')}
                  className={`p-2 transition-all ${view === 'board' ? themeStyles.accent + ' text-white' : themeStyles.textSecondary + ' ' + themeStyles.hover}`}
                  title="Board View"
                >
                  <Kanban size={18} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 transition-all ${view === 'list' ? themeStyles.accent + ' text-white' : themeStyles.textSecondary + ' ' + themeStyles.hover}`}
                  title="List View"
                >
                  <Table size={18} />
                </button>
                <button
                  onClick={() => setView('calendar')}
                  className={`p-2 transition-all ${view === 'calendar' ? themeStyles.accent + ' text-white' : themeStyles.textSecondary + ' ' + themeStyles.hover}`}
                  title="Calendar View"
                >
                  <Calendar size={18} />
                </button>
              </div>

              {/* Action Buttons */}
              <button className={`p-2 rounded-lg ${themeStyles.hover} transition-colors`}>
                <Share2 size={18} className={themeStyles.textSecondary} />
              </button>
              <button className={`p-2 rounded-lg ${themeStyles.hover} transition-colors`}>
                <Settings size={18} className={themeStyles.textSecondary} />
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-4 mt-4">
            <div className={`flex-1 relative`}>
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeStyles.textSecondary}`} size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${themeStyles.input} border ${themeStyles.border} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg ${themeStyles.hover} transition-colors relative`}
            >
              <Filter size={18} className={themeStyles.textSecondary} />
              {(filters.assignee !== 'all' || filters.priority !== 'all' || filters.status !== 'all') && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>

            <button className={`p-2 rounded-lg ${themeStyles.hover} transition-colors`}>
              <SortAsc size={18} className={themeStyles.textSecondary} />
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className={`mt-4 p-4 rounded-lg ${themeStyles.card} border ${themeStyles.border} grid grid-cols-1 sm:grid-cols-3 gap-4`}>
              <div>
                <label className={`block text-xs font-medium ${themeStyles.textSecondary} mb-2`}>
                  Assignee
                </label>
                <select
                  value={filters.assignee}
                  onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg ${themeStyles.input} border ${themeStyles.border} ${themeStyles.text} text-sm`}
                >
                  <option value="all">All Assignees</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name || member.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-medium ${themeStyles.textSecondary} mb-2`}>
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg ${themeStyles.input} border ${themeStyles.border} ${themeStyles.text} text-sm`}
                >
                  <option value="all">All Priorities</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="NORMAL">Normal</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-medium ${themeStyles.textSecondary} mb-2`}>
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg ${themeStyles.input} border ${themeStyles.border} ${themeStyles.text} text-sm`}
                >
                  <option value="all">All Status</option>
                  <option value="BACKLOG">Backlog</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button
                  onClick={() => setFilters({ assignee: 'all', priority: 'all', status: 'all' })}
                  className={`px-4 py-2 rounded-lg ${themeStyles.hover} ${themeStyles.textSecondary} text-sm`}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {view === 'board' && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-6 min-h-[calc(100vh-250px)] scrollbar-thin scrollbar-thumb-gray-600">
              {boards.map(board => (
                board.columns?.map(column => (
                  <div key={column.id} className="flex-shrink-0 w-80">
                    <div className={`${themeStyles.card} rounded-2xl border ${themeStyles.border} p-4 h-full flex flex-col backdrop-blur-sm bg-opacity-50`}>
                      {/* Column Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${themeStyles.text}`}>{column.name}</h3>
                          <span className={`text-sm ${themeStyles.textSecondary} bg-opacity-20 px-2 py-1 rounded-full bg-gray-700`}>
                            {filterTasks(column.tasks)?.length || 0}
                          </span>
                          {column.wipLimit > 0 && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              (column.tasks?.length || 0) >= column.wipLimit 
                                ? 'bg-red-500/20 text-red-400' 
                                : 'bg-green-500/20 text-green-400'
                            }`}>
                              WIP: {column.tasks?.length || 0}/{column.wipLimit}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => {
                              // Open column settings
                              const newName = prompt('Enter new column name:', column.name);
                              if (newName && newName !== column.name) {
                                updateColumn(column.id, { name: newName });
                              }
                            }}
                            className={`p-1 rounded-lg ${themeStyles.hover} transition-colors`}
                          >
                            <Edit2 size={14} className={themeStyles.textSecondary} />
                          </button>
                          <button 
                            onClick={() => deleteColumn(column.id)}
                            className={`p-1 rounded-lg ${themeStyles.hover} transition-colors`}
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </button>
                        </div>
                      </div>

                      {/* Tasks */}
                      <Droppable droppableId={column.id.toString()}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex-1 space-y-3 mb-4 min-h-[200px] transition-colors ${
                              snapshot.isDraggingOver ? 'bg-blue-500/10 rounded-lg' : ''
                            }`}
                          >
                            {filterTasks(column.tasks)?.map((todo, index) => (
                              <Draggable
                                key={todo.id}
                                draggableId={todo.id.toString()}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`${themeStyles.card} rounded-xl p-4 border ${themeStyles.border} ${
                                      snapshot.isDragging ? 'shadow-2xl scale-105 rotate-1' : ''
                                    } hover:shadow-xl transition-all cursor-pointer group`}
                                    onClick={() => {
                                      setSelectedTask(todo);
                                      setShowTaskModal(true);
                                    }}
                                  >
                                    {/* Task Header */}
                                    <div className="flex items-start justify-between mb-2">
                                      <h4 className={`font-medium ${themeStyles.text} flex-1`}>{todo.item}</h4>
                                      {todo.priority && (
                                        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(todo.priority)}`}>
                                          {todo.priority}
                                        </span>
                                      )}
                                    </div>

                                    {todo.description && (
                                      <p className={`text-sm ${themeStyles.textSecondary} mb-3 line-clamp-2`}>
                                        {todo.description}
                                      </p>
                                    )}

                                    {/* Task Metadata */}
                                    <div className="flex items-center gap-3 text-xs">
                                      {todo.dueDate && (
                                        <span className={`flex items-center gap-1 ${themeStyles.textSecondary} ${
                                          new Date(todo.dueDate) < new Date() && todo.status !== 'COMPLETED' 
                                            ? 'text-red-400' 
                                            : ''
                                        }`}>
                                          <Clock size={12} />
                                          {format(new Date(todo.dueDate), 'MMM dd')}
                                        </span>
                                      )}
                                      
                                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(todo.status)}`}>
                                        {todo.status || 'PENDING'}
                                      </span>

                                      {todo.assignedTo && (
                                        <span className="flex items-center gap-1 ml-auto">
                                          <div className={`w-5 h-5 rounded-full ${themeStyles.accent} flex items-center justify-center text-white text-[10px] font-medium`}>
                                            {todo.assignedTo.name?.[0] || todo.assignedTo.email?.[0] || 'U'}
                                          </div>
                                        </span>
                                      )}
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button className={`p-1 rounded-lg ${themeStyles.hover} bg-opacity-90`}>
                                        <Edit2 size={12} className={themeStyles.textSecondary} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            
                            {filterTasks(column.tasks)?.length === 0 && (
                              <div className={`text-center py-8 ${themeStyles.textSecondary} border-2 border-dashed ${themeStyles.border} rounded-lg`}>
                                <p className="text-sm">No tasks</p>
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>

                      {/* Add Task Button */}
                      <button
                        onClick={() => {
                          setSelectedTask({ columnId: column.id, boardId: board.id });
                          setShowTaskModal(true);
                        }}
                        className={`w-full p-2 rounded-lg border border-dashed ${themeStyles.border} ${themeStyles.textSecondary} hover:${themeStyles.hover} flex items-center justify-center gap-1 transition-colors`}
                      >
                        <Plus size={16} />
                        Add Task
                      </button>
                    </div>
                  </div>
                ))
              ))}

              {/* Add Column Button */}
              <div className="flex-shrink-0 w-80">
                <button
                  onClick={() => {
                    const boardId = boards[0]?.id;
                    if (!boardId) return;
                    
                    const columnName = prompt('Enter column name:');
                    if (columnName) {
                      API.post(`/kanban/boards/${boardId}/columns`, { 
                        name: columnName,
                        type: 'CUSTOM',
                        wipLimit: 0,
                        color: '#6b7280'
                      })
                        .then(() => {
                          toast.success('Column created');
                          fetchProjectData();
                        })
                        .catch(error => {
                          console.error("Failed to create column:", error);
                          toast.error("Failed to create column");
                        });
                    }
                  }}
                  className={`w-full h-32 rounded-2xl border-2 border-dashed ${themeStyles.border} ${themeStyles.hover} flex flex-col items-center justify-center gap-2 transition-colors`}
                >
                  <Plus size={24} className={themeStyles.textSecondary} />
                  <span className={themeStyles.textSecondary}>Create New Column</span>
                </button>
              </div>
            </div>
          </DragDropContext>
        )}

        {view === 'list' && (
          <div className={`${themeStyles.card} rounded-2xl border ${themeStyles.border} overflow-hidden backdrop-blur-sm bg-opacity-50`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${themeStyles.header} border-b ${themeStyles.border}`}>
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-left text-sm font-medium text-gray-400">Task</th>
                    <th className="px-4 sm:px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="hidden sm:table-cell px-4 sm:px-6 py-4 text-left text-sm font-medium text-gray-400">Priority</th>
                    <th className="hidden md:table-cell px-4 sm:px-6 py-4 text-left text-sm font-medium text-gray-400">Assignee</th>
                    <th className="hidden lg:table-cell px-4 sm:px-6 py-4 text-left text-sm font-medium text-gray-400">Due Date</th>
                    <th className="px-4 sm:px-6 py-4 text-left text-sm font-medium text-gray-400">Board</th>
                    <th className="px-4 sm:px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {boards.flatMap(board => 
                    filterTasks(board.todos)?.map(todo => (
                      <tr 
                        key={todo.id} 
                        className={`${themeStyles.hover} cursor-pointer transition-colors`} 
                        onClick={() => {
                          setSelectedTask(todo);
                          setShowTaskModal(true);
                        }}
                      >
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <CheckCircle size={18} className={todo.status === 'COMPLETED' ? 'text-green-500' : 'text-gray-500'} />
                            <span className={themeStyles.text}>{todo.item}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(todo.status)}`}>
                            {todo.status || 'PENDING'}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-4 sm:px-6 py-4">
                          {todo.priority && (
                            <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(todo.priority)}`}>
                              {todo.priority}
                            </span>
                          )}
                        </td>
                        <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                          {todo.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full ${themeStyles.accent} flex items-center justify-center text-white text-xs font-medium`}>
                                {todo.assignedTo.name?.[0] || todo.assignedTo.email?.[0]}
                              </div>
                              <span className={themeStyles.textSecondary}>{todo.assignedTo.name || todo.assignedTo.email}</span>
                            </div>
                          ) : (
                            <span className={themeStyles.textSecondary}>Unassigned</span>
                          )}
                        </td>
                        <td className="hidden lg:table-cell px-4 sm:px-6 py-4">
                          <span className={`flex items-center gap-1 ${themeStyles.textSecondary} ${
                            todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== 'COMPLETED' 
                              ? 'text-red-400' 
                              : ''
                          }`}>
                            <Clock size={14} />
                            {todo.dueDate ? format(new Date(todo.dueDate), 'MMM dd, yyyy') : 'No date'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`text-sm ${themeStyles.textSecondary}`}>
                            {boards.find(b => b.id === todo.board?.id)?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              className={`p-1 rounded-lg ${themeStyles.hover} transition-colors`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTask(todo);
                                setShowTaskModal(true);
                              }}
                            >
                              <Edit2 size={14} className={themeStyles.textSecondary} />
                            </button>
                            <button 
                              className={`p-1 rounded-lg ${themeStyles.hover} transition-colors`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Copy size={14} className={themeStyles.textSecondary} />
                            </button>
                            <button 
                              className={`p-1 rounded-lg ${themeStyles.hover} transition-colors`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 size={14} className="text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              {boards.flatMap(b => b.todos || []).length === 0 && (
                <div className="text-center py-12">
                  <p className={themeStyles.textSecondary}>No tasks found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'calendar' && (
          <div className={`${themeStyles.card} rounded-2xl border ${themeStyles.border} p-4 sm:p-6 backdrop-blur-sm bg-opacity-50`}>
            <CalendarView 
              tasks={boards.flatMap(b => b.todos || [])} 
              themeStyles={themeStyles}
              onTaskClick={(task) => {
                setSelectedTask(task);
                setShowTaskModal(true);
              }}
            />
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onUpdate={fetchProjectData}
          themeStyles={themeStyles}
          members={members}
          boards={boards}
        />
      )}
    </div>
  );
}

// Task Modal Component
function TaskModal({ task, onClose, onUpdate, themeStyles, members, boards }) {
  const [taskData, setTaskData] = useState({
    item: '',
    description: '',
    priority: 'NORMAL',
    status: 'PENDING',
    dueDate: '',
    assignedToId: '',
    boardId: '',
    columnId: '',
    ...task
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (task?.id) {
      fetchComments();
    }
  }, [task?.id]);

  const fetchComments = async () => {
    try {
      const response = await API.get(`/todos/${task.id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleSave = async () => {
    if (!taskData.item?.trim()) {
      toast.error('Task title is required');
      return;
    }

    setLoading(true);
    try {
      if (taskData.id) {
        // Update existing task
        const response = await API.put(`/todos/${taskData.id}`, {
          item: taskData.item,
          description: taskData.description,
          priority: taskData.priority,
          status: taskData.status,
          dueDate: taskData.dueDate,
          assignedToId: taskData.assignedToId
        });
        toast.success('Task updated successfully');
      } else {
        // Create new task
        const response = await API.post(`/kanban/columns/${taskData.columnId}/tasks`, {
          item: taskData.item,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          assignedToId: taskData.assignedToId
        });
        toast.success('Task created successfully');
      }
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to save task:", error);
      toast.error(error.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await API.post(`/todos/${task.id}/comments`, {
        content: newComment
      });
      setComments([...comments, response.data]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await API.patch(`/todos/${task.id}/status`, { status: newStatus });
      setTaskData({ ...taskData, status: newStatus });
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className={`w-full max-w-2xl ${themeStyles.modal} rounded-2xl border ${themeStyles.border} max-h-[90vh] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`p-4 sm:p-6 border-b ${themeStyles.border} flex items-center justify-between`}>
          <h3 className={`text-xl font-semibold ${themeStyles.text}`}>
            {task?.id ? 'Edit Task' : 'Create Task'}
          </h3>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-lg ${themeStyles.hover} transition-colors`}
          >
            <X size={18} className={themeStyles.textSecondary} />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex gap-4 px-4 sm:px-6 pt-4 border-b ${themeStyles.border} overflow-x-auto`}>
          {['details', 'comments', 'activity'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-1 text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? `${themeStyles.accent} border-b-2 border-purple-500 text-purple-400`
                  : themeStyles.textSecondary + ' hover:' + themeStyles.text
              }`}
            >
              {tab} {tab === 'comments' && comments.length > 0 && `(${comments.length})`}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className={`block text-sm font-medium ${themeStyles.textSecondary} mb-2`}>
                  Title *
                </label>
                <input
                  type="text"
                  value={taskData.item || ''}
                  onChange={(e) => setTaskData({ ...taskData, item: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg ${themeStyles.input} border ${themeStyles.border} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                  placeholder="Task title"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium ${themeStyles.textSecondary} mb-2`}>
                  Description
                </label>
                <textarea
                  value={taskData.description || ''}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  rows="4"
                  className={`w-full px-4 py-2 rounded-lg ${themeStyles.input} border ${themeStyles.border} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none`}
                  placeholder="Add description..."
                />
              </div>

              {/* Grid Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${themeStyles.textSecondary} mb-2`}>
                    Priority
                  </label>
                  <select
                    value={taskData.priority || 'NORMAL'}
                    onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${themeStyles.input} border ${themeStyles.border} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="NORMAL">Normal</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${themeStyles.textSecondary} mb-2`}>
                    Status
                  </label>
                  {task?.id ? (
                    <select
                      value={taskData.status || 'PENDING'}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg ${themeStyles.input} border ${themeStyles.border} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="BACKLOG">Backlog</option>
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="REVIEW">Review</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="BLOCKED">Blocked</option>
                    </select>
                  ) : (
                    <select
                      value={taskData.status || 'PENDING'}
                      onChange={(e) => setTaskData({ ...taskData, status: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg ${themeStyles.input} border ${themeStyles.border} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="BACKLOG">Backlog</option>
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="REVIEW">Review</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="BLOCKED">Blocked</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${themeStyles.textSecondary} mb-2`}>
                    Assignee
                  </label>
                  <select
                    value={taskData.assignedToId || ''}
                    onChange={(e) => setTaskData({ ...taskData, assignedToId: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${themeStyles.input} border ${themeStyles.border} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Unassigned</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name || member.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${themeStyles.textSecondary} mb-2`}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskData.dueDate?.split('T')[0] || ''}
                    onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${themeStyles.input} border ${themeStyles.border} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                {!task?.id && (
                  <div className="sm:col-span-2">
                    <label className={`block text-sm font-medium ${themeStyles.textSecondary} mb-2`}>
                      Column
                    </label>
                    <select
                      value={taskData.columnId || task?.columnId || ''}
                      onChange={(e) => setTaskData({ ...taskData, columnId: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg ${themeStyles.input} border ${themeStyles.border} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Select Column</option>
                      {boards.flatMap(board => 
                        board.columns?.map(column => (
                          <option key={column.id} value={column.id}>
                            {board.name} - {column.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className={`p-4 rounded-lg ${themeStyles.card} border ${themeStyles.border}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${themeStyles.accent} flex items-center justify-center text-white text-xs`}>
                        {comment.author?.name?.[0] || 'U'}
                      </div>
                      <span className={`text-sm font-medium ${themeStyles.text}`}>
                        {comment.author?.name || comment.author?.email}
                      </span>
                    </div>
                    <span className={`text-xs ${themeStyles.textSecondary}`}>
                      {format(new Date(comment.createdAt), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                  <p className={`text-sm ${themeStyles.textSecondary}`}>{comment.content}</p>
                </div>
              ))}

              {comments.length === 0 && (
                <p className={`text-center py-8 ${themeStyles.textSecondary}`}>
                  No comments yet
                </p>
              )}

              {/* Add Comment */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className={`flex-1 px-4 py-2 rounded-lg ${themeStyles.input} border ${themeStyles.border} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  onKeyPress={(e) => e.key === 'Enter' && addComment()}
                />
                <button
                  onClick={addComment}
                  disabled={!newComment.trim()}
                  className={`px-4 py-2 rounded-lg ${themeStyles.accent} text-white disabled:opacity-50 transition-colors`}
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <p className={`text-center py-8 ${themeStyles.textSecondary}`}>
                Activity log coming soon
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`p-4 sm:p-6 border-t ${themeStyles.border} flex justify-end gap-3`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${themeStyles.hover} ${themeStyles.textSecondary} transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !taskData.item?.trim()}
            className={`px-4 py-2 rounded-lg ${themeStyles.accent} text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          >
            {loading ? <Loader size={16} className="animate-spin" /> : task?.id ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Calendar View Component
function CalendarView({ tasks, themeStyles, onTaskClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    
    // Previous month days
    for (let i = 0; i < firstDay.getDay(); i++) {
      const date = new Date(year, month, -i);
      days.unshift({ date, isCurrentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Next month days (to fill 42 days - 6 weeks)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    setCalendarDays(days);
  };

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const getTasksForDate = (date) => {
    return tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate).toDateString() === date.toDateString()
    );
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className={`text-xl font-semibold ${themeStyles.text}`}>
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className={`p-2 rounded-lg ${themeStyles.hover} transition-colors`}
          >
            <ChevronRight size={18} className={`${themeStyles.textSecondary} rotate-180`} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className={`px-4 py-2 rounded-lg ${themeStyles.hover} ${themeStyles.textSecondary} text-sm transition-colors`}
          >
            Today
          </button>
          <button
            onClick={() => changeMonth(1)}
            className={`p-2 rounded-lg ${themeStyles.hover} transition-colors`}
          >
            <ChevronRight size={18} className={themeStyles.textSecondary} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-800 rounded-lg overflow-hidden">
        {/* Weekday headers */}
        {weekDays.map(day => (
          <div key={day} className={`p-3 text-center text-sm font-medium ${themeStyles.textSecondary} bg-opacity-50 ${themeStyles.card}`}>
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map(({ date, isCurrentMonth }, index) => {
          const dayTasks = getTasksForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={index}
              className={`min-h-[100px] sm:min-h-[120px] p-2 border border-gray-800 ${
                isCurrentMonth ? themeStyles.card : 'opacity-40'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-sm ${isCurrentMonth ? themeStyles.text : themeStyles.textSecondary}`}>
                  {date.getDate()}
                </span>
                {dayTasks.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${themeStyles.accent} text-white`}>
                    {dayTasks.length}
                  </span>
                )}
              </div>
              
              <div className="space-y-1 max-h-[60px] sm:max-h-[80px] overflow-y-auto scrollbar-thin">
                {dayTasks.slice(0, 3).map(task => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={`w-full text-left text-xs p-1 rounded ${themeStyles.hover} truncate transition-colors`}
                    title={task.item}
                  >
                    • {task.item}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <span className={`text-xs ${themeStyles.textSecondary}`}>
                    +{dayTasks.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// In ProjectView.jsx, update the ProjectSkeleton component:

// Skeleton Loading Component
function ProjectSkeleton({ themeStyles }) {
  // Provide default styles if themeStyles is undefined
  const styles = themeStyles || {
    bg: 'bg-gray-900',
    card: 'bg-gray-800',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    border: 'border-gray-700',
    hover: 'hover:bg-gray-700',
    accent: 'bg-purple-600',
    input: 'bg-gray-700',
    header: 'bg-gray-800',
    modal: 'bg-gray-800',
  };

  return (
    <div className={`min-h-screen ${styles.bg} p-4 sm:p-8`}>
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-48 bg-gray-700 rounded mb-2" />
            <div className="h-4 w-64 bg-gray-700 rounded" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 bg-gray-700 rounded" />
            <div className="h-10 w-24 bg-gray-700 rounded" />
          </div>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-shrink-0 w-80">
              <div className={`h-96 ${styles.card} rounded-2xl p-4`}>
                <div className="h-6 w-32 bg-gray-700 rounded mb-4" />
                <div className="space-y-3">
                  <div className="h-24 bg-gray-700 rounded" />
                  <div className="h-24 bg-gray-700 rounded" />
                  <div className="h-24 bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProjectView;