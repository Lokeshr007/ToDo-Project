import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/services/api";
import { useTheme } from "@/app/providers/ThemeContext";
import { useNotification } from "@/app/providers/NotificationContext";
import { useWorkspace } from "@/app/providers/WorkspaceContext";
import toast from 'react-hot-toast';
import realtimeService from "@/services/realtimeService";
import ProjectTimelineView from "../ProjectTimelineView";

import ProjectHeader from "./ProjectHeader";
import ProjectBoardView from "./ProjectBoardView";
import ProjectListView from "./ProjectListView";
import ProjectTaskModal from "./ProjectTaskModal";
import ProjectSkeleton from "./ProjectSkeleton";
import ProjectCalendarView from "./ProjectCalendarView";

const ProjectView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const [project, setProject] = useState(null);
  const [boards, setBoards] = useState([]);
  const [view, setView] = useState('board');
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [filters, setFilters] = useState({
    assignee: 'all',
    priority: 'all',
    status: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [hideEmptyColumns, setHideEmptyColumns] = useState(false);
  const { themeStyles } = useTheme();
  const { addNotification } = useNotification();

  const fetchProjectData = useCallback(async () => {
    setLoading(true);
    try {
      const projectRes = await API.get(`/projects/${projectId}`);
      setProject(projectRes.data);

      const boardsRes = await API.get(`/boards?projectId=${projectId}`);
      const sortedBoardsList = boardsRes.data.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

      const boardsWithColumns = await Promise.all(
        sortedBoardsList.map(async (board) => {
          try {
            const boardDetailsRes = await API.get(`/kanban/boards/${board.id}`);
            const boardData = boardDetailsRes.data;
            const todos = (boardData.columns || []).flatMap(col => col.tasks || []);
            return {
              ...boardData,
              todos: todos
            };
          } catch (err) {
            console.error(`Failed to fetch board details for board ${board.id}`, err);
            return { ...board, columns: [], todos: [] };
          }
        })
      );
      
      setBoards(boardsWithColumns);
      
      if (boardsWithColumns.length > 0 && !activeBoardId) {
        setActiveBoardId(boardsWithColumns[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch project data:", error);
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  }, [projectId, activeBoardId]);

  const fetchProjectMembers = useCallback(async (workspaceId) => {
    if (!workspaceId) return;
    try {
      const response = await API.get(`/workspaces/${workspaceId}/members`);
      setMembers(response.data);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  }, []);

  useEffect(() => {
    if (projectId) fetchProjectData();
  }, [projectId, fetchProjectData]);

  useEffect(() => {
    if (project?.workspaceId) fetchProjectMembers(project.workspaceId);
  }, [project, fetchProjectMembers]);

  useEffect(() => {
    if (!projectId) return;

    realtimeService.connect(() => {
      realtimeService.subscribe(`/topic/project/${projectId}`, (message) => {
        if (['TASK_MOVED', 'TASK_CREATED', 'TASK_DELETED'].includes(message.type)) {
          fetchProjectData();
        }
      });
    });

    return () => {
      realtimeService.unsubscribe(`/topic/project/${projectId}`);
    };
  }, [projectId, fetchProjectData]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    const sourceBoardIndex = boards.findIndex(b => 
      b.columns?.some(col => col.id.toString() === source.droppableId)
    );
    const destBoardIndex = boards.findIndex(b => 
      b.columns?.some(col => col.id.toString() === destination.droppableId)
    );

    if (sourceBoardIndex === -1 || destBoardIndex === -1) return;

    const newBoards = [...boards];
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
    
    if (destColumn.type === 'DONE') movedTask.status = 'COMPLETED';
    else if (['IN_PROGRESS', 'INFLOW'].includes(destColumn.type)) movedTask.status = 'IN_PROGRESS';
    else if (destColumn.type === 'REVIEW') movedTask.status = 'REVIEW';
    else if (['TODO', 'BACKLOG'].includes(destColumn.type)) movedTask.status = 'PENDING';

    destTasks.splice(destination.index, 0, movedTask);

    sourceColumn.tasks = sourceTasks;
    destColumn.tasks = destTasks;

    sourceBoard.columns = sourceBoard.columns.map(col => col.id.toString() === source.droppableId ? sourceColumn : col);
    if (sourceBoardIndex !== destBoardIndex) {
      destBoard.columns = destBoard.columns.map(col => col.id.toString() === destination.droppableId ? destColumn : col);
    } else {
      sourceBoard.columns = sourceBoard.columns.map(col => {
        if (col.id.toString() === source.droppableId) return sourceColumn;
        if (col.id.toString() === destination.droppableId) return destColumn;
        return col;
      });
    }

    newBoards[sourceBoardIndex] = sourceBoard;
    if (sourceBoardIndex !== destBoardIndex) newBoards[destBoardIndex] = destBoard;

    newBoards.forEach(board => {
      board.todos = board.columns?.flatMap(col => col.tasks || []) || [];
    });

    setBoards(newBoards);

    try {
      await API.post('/kanban/tasks/move', {
        taskId: parseInt(draggableId),
        fromColumnId: parseInt(source.droppableId),
        toColumnId: parseInt(destination.droppableId),
        newIndex: destination.index
      });
      toast.success('Objective repositioned');
    } catch (error) {
      console.error("Failed to move task:", error);
      fetchProjectData();
      toast.error("Vector update failure");
    }
  };

  const filterTasks = useCallback((tasks) => {
    if (!tasks) return [];
    return tasks.filter(task => {
      if (searchQuery && !task.item?.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !task.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filters.assignee !== 'all' && task.assignedTo?.id !== parseInt(filters.assignee)) return false;
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
      if (filters.status !== 'all' && task.status !== filters.status) return false;
      return true;
    });
  }, [searchQuery, filters]);

  const updateColumn = async (columnId, columnData) => {
    try {
      await API.put(`/kanban/columns/${columnId}`, columnData);
      toast.success('Registry updated');
      fetchProjectData();
    } catch (error) {
      toast.error('Registry update failed');
    }
  };

  const deleteColumn = async (columnId) => {
    if (!window.confirm('Delete this registry? Operational data will be salvaged to Backlog.')) return;
    try {
      await API.delete(`/kanban/columns/${columnId}`);
      toast.success('Registry decommissioned');
      fetchProjectData();
    } catch (error) {
      toast.error('Decommissioning failed');
    }
  };

  const createColumn = (boardId) => {
    if (!boardId) return;
    const columnName = prompt('Identifier for new registry path:');
    if (columnName) {
      API.post(`/kanban/boards/${boardId}/columns`, { 
        name: columnName,
        type: 'CUSTOM',
        wipLimit: 0,
        color: '#3b82f6'
      }).then(() => {
        toast.success('New path initialized');
        fetchProjectData();
      }).catch(() => toast.error('Initialization failed'));
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]';
      case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]';
      case 'NORMAL': return 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]';
      case 'LOW': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'COMPLETED': return 'bg-emerald-500/20 text-emerald-400';
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400';
      case 'REVIEW': return 'bg-purple-500/20 text-purple-400';
      case 'BLOCKED': return 'bg-red-500/20 text-red-400';
      case 'BACKLOG': return 'bg-slate-500/20 text-slate-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  if (loading) return <ProjectSkeleton themeStyles={themeStyles} />;

  return (
    <div className={`min-h-screen ${themeStyles.bg}`}>
      <ProjectHeader 
        project={project}
        view={view}
        setView={setView}
        hideEmptyColumns={hideEmptyColumns}
        setHideEmptyColumns={setHideEmptyColumns}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        onBack={() => navigate('/app/projects')}
        themeStyles={themeStyles}
        boards={boards}
        activeBoardId={activeBoardId}
        setActiveBoardId={setActiveBoardId}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'board' && (
          <ProjectBoardView 
            boards={boards}
            activeBoardId={activeBoardId}
            hideEmptyColumns={hideEmptyColumns}
            filterTasks={filterTasks}
            themeStyles={themeStyles}
            handleDragEnd={handleDragEnd}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
            updateColumn={updateColumn}
            deleteColumn={deleteColumn}
            setSelectedTask={setSelectedTask}
            setShowTaskModal={setShowTaskModal}
            createColumn={createColumn}
          />
        )}

        {view === 'list' && (
          <ProjectListView 
            boards={boards}
            filterTasks={filterTasks}
            themeStyles={themeStyles}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            setSelectedTask={setSelectedTask}
            setShowTaskModal={setShowTaskModal}
          />
        )}

        {view === 'calendar' && (
          <ProjectCalendarView 
            tasks={boards.flatMap(b => b.todos || [])}
            themeStyles={themeStyles}
            onTaskClick={(task) => { setSelectedTask(task); setShowTaskModal(true); }}
          />
        )}

        {view === 'timeline' && (
          <ProjectTimelineView 
            projectId={projectId} 
            themeStyles={themeStyles} 
          />
        )}
      </div>

      {showTaskModal && (
        <ProjectTaskModal
          task={selectedTask}
          onClose={() => { setShowTaskModal(false); setSelectedTask(null); }}
          onUpdate={fetchProjectData}
          themeStyles={themeStyles}
          members={members}
          boards={boards}
        />
      )}
    </div>
  );
};

export default ProjectView;
