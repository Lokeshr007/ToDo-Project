import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  FolderKanban, 
  MoreVertical, 
  Layout,
  Search,
  Filter,
  Clock,
  Users,
  Star,
  Grid,
  List,
  Settings,
  Edit2,
  Trash2,
  Copy,
  Archive,
  Share2,
  X,
  ChevronRight,
  Calendar,
  CheckCircle,
  AlertCircle,
  Globe,
  Lock,
  BarChart3
} from "lucide-react";
import API from "../services/api";
import { useWorkspace } from "../context/WorkspaceContext";
import { useNotification } from "../context/NotificationContext";
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [boards, setBoards] = useState({});
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectVisibility, setNewProjectVisibility] = useState("private");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [projectStats, setProjectStats] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (currentWorkspace) {
      setSelectedWorkspace(currentWorkspace);
      fetchProjects();
    }
  }, [currentWorkspace]);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchProjects();
    }
  }, [selectedWorkspace, filter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/projects?workspaceId=${selectedWorkspace?.id}`);
      
      let filteredProjects = response.data;
      
      // Apply filters
      if (filter === 'recent') {
        filteredProjects = filteredProjects.sort((a, b) => 
          new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );
      } else if (filter === 'starred') {
        filteredProjects = filteredProjects.filter(p => p.isStarred);
      } else if (filter === 'archived') {
        filteredProjects = filteredProjects.filter(p => p.isArchived);
      } else {
        filteredProjects = filteredProjects.filter(p => !p.isArchived);
      }
      
      if (searchQuery) {
        filteredProjects = filteredProjects.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      setProjects(filteredProjects);
      
      // Fetch boards for each project
      await fetchBoardsForProjects(filteredProjects);
      
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchBoardsForProjects = async (projectsList) => {
    const boardsData = {};
    const statsData = {};

    for (const project of projectsList) {
      try {
        const boardsRes = await API.get(`/boards?projectId=${project.id}`);
        boardsData[project.id] = boardsRes.data;
        
        // Get task stats for project
        let totalTasks = 0;
        let completedTasks = 0;
        
        for (const board of boardsRes.data) {
          try {
            const boardRes = await API.get(`/kanban/boards/${board.id}`);
            const boardTasks = boardRes.data.columns?.flatMap(col => col.todos || []) || [];
            totalTasks += boardTasks.length;
            completedTasks += boardTasks.filter(t => t.status === 'COMPLETED').length;
          } catch (error) {
            console.error(`Failed to fetch board ${board.id}:`, error);
          }
        }
        
        statsData[project.id] = {
          boards: boardsRes.data.length,
          tasks: totalTasks,
          completed: completedTasks,
          members: project.memberCount || 1
        };
      } catch (error) {
        console.error(`Failed to fetch boards for project ${project.id}:`, error);
        statsData[project.id] = { boards: 0, tasks: 0, completed: 0, members: 1 };
      }
    }
    
    setBoards(boardsData);
    setProjectStats(statsData);
  };

  const createProject = async () => {
    if (!newProjectName.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      const response = await API.post(`/projects`, {
        name: newProjectName,
        description: newProjectDescription,
        workspaceId: selectedWorkspace.id,
        visibility: newProjectVisibility
      });
      
      setProjects([response.data, ...projects]);
      setShowCreateModal(false);
      resetProjectForm();
      toast.success("Project created successfully");
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error(error.response?.data?.message || "Failed to create project");
    }
  };

  const updateProject = async () => {
    if (!newProjectName.trim() || !selectedProject) return;

    try {
      const response = await API.put(`/projects/${selectedProject.id}`, {
        name: newProjectName,
        description: newProjectDescription,
        visibility: newProjectVisibility
      });
      
      setProjects(projects.map(p => 
        p.id === selectedProject.id ? response.data : p
      ));
      setShowEditModal(false);
      setSelectedProject(null);
      resetProjectForm();
      toast.success("Project updated successfully");
    } catch (error) {
      console.error("Failed to update project:", error);
      toast.error(error.response?.data?.message || "Failed to update project");
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await API.delete(`/projects/${projectId}`);
      setProjects(projects.filter(p => p.id !== projectId));
      setShowDeleteConfirm(null);
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error(error.response?.data?.message || "Failed to delete project");
    }
  };

  const toggleStarProject = async (projectId) => {
    try {
      const response = await API.put(`/projects/${projectId}/star`);
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, isStarred: response.data.isStarred } : p
      ));
      toast.success(response.data.isStarred ? "Project starred" : "Project unstarred");
    } catch (error) {
      console.error("Failed to star project:", error);
      toast.error("Failed to update project");
    }
  };

  const toggleArchiveProject = async (projectId) => {
    try {
      const response = await API.put(`/projects/${projectId}/archive`);
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, isArchived: response.data.isArchived } : p
      ));
      toast.success(response.data.isArchived ? "Project archived" : "Project unarchived");
    } catch (error) {
      console.error("Failed to archive project:", error);
      toast.error("Failed to update project");
    }
  };

  const duplicateProject = async (project) => {
    try {
      const response = await API.post(`/projects/${project.id}/duplicate`);
      setProjects([response.data, ...projects]);
      toast.success("Project duplicated successfully");
    } catch (error) {
      console.error("Failed to duplicate project:", error);
      toast.error("Failed to duplicate project");
    }
  };

  const navigateToProject = (projectId) => {
    navigate(`/app/projects/${projectId}`);
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setNewProjectName(project.name);
    setNewProjectDescription(project.description || "");
    setNewProjectVisibility(project.visibility || "private");
    setShowEditModal(true);
  };

  const resetProjectForm = () => {
    setNewProjectName("");
    setNewProjectDescription("");
    setNewProjectVisibility("private");
  };

  const getProjectStats = (projectId) => {
    return projectStats[projectId] || {
      boards: 0,
      tasks: 0,
      completed: 0,
      members: 1
    };
  };

  if (loading && selectedWorkspace) {
    return <ProjectsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Projects</h1>
              <p className="text-sm text-slate-400 mt-1">
                Manage your workspaces and projects
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex rounded-lg overflow-hidden border border-slate-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  title="Grid View"
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  title="List View"
                >
                  <List size={18} />
                </button>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all text-sm sm:text-base"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">New Project</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Projects</option>
              <option value="recent">Recently Updated</option>
              <option value="starred">Starred</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <StatCard
            icon={<FolderKanban size={20} />}
            label="Total Projects"
            value={projects.length}
            color="blue"
          />
          <StatCard
            icon={<Layout size={20} />}
            label="Total Boards"
            value={Object.values(boards).flat().length || 0}
            color="green"
          />
          <StatCard
            icon={<CheckCircle size={20} />}
            label="Total Tasks"
            value={Object.values(projectStats).reduce((sum, stat) => sum + stat.tasks, 0)}
            color="purple"
          />
          <StatCard
            icon={<BarChart3 size={20} />}
            label="Completion Rate"
            value={`${Math.round((Object.values(projectStats).reduce((sum, stat) => sum + stat.completed, 0) / 
              (Object.values(projectStats).reduce((sum, stat) => sum + stat.tasks, 0) || 1)) * 100)}%`}
            color="orange"
          />
        </div>

        {/* Projects Grid/List */}
        {projects.length === 0 ? (
          <EmptyState 
            onCreateClick={() => setShowCreateModal(true)}
            searchQuery={searchQuery}
            filter={filter}
          />
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onNavigate={navigateToProject}
                    onEdit={openEditModal}
                    onDelete={() => setShowDeleteConfirm(project.id)}
                    onDuplicate={duplicateProject}
                    onStar={toggleStarProject}
                    onArchive={toggleArchiveProject}
                    stats={getProjectStats(project.id)}
                    boards={boards[project.id] || []}
                  />
                ))}
              </div>
            ) : (
              <ProjectListView
                projects={projects}
                onNavigate={navigateToProject}
                onEdit={openEditModal}
                onDelete={setShowDeleteConfirm}
                onDuplicate={duplicateProject}
                onStar={toggleStarProject}
                onArchive={toggleArchiveProject}
                stats={projectStats}
              />
            )}
          </>
        )}

        {/* Modals */}
        {showCreateModal && (
          <ProjectModal
            title="Create New Project"
            projectName={newProjectName}
            projectDescription={newProjectDescription}
            projectVisibility={newProjectVisibility}
            onNameChange={setNewProjectName}
            onDescriptionChange={setNewProjectDescription}
            onVisibilityChange={setNewProjectVisibility}
            onClose={() => {
              setShowCreateModal(false);
              resetProjectForm();
            }}
            onSubmit={createProject}
            submitLabel="Create"
          />
        )}

        {showEditModal && (
          <ProjectModal
            title="Edit Project"
            projectName={newProjectName}
            projectDescription={newProjectDescription}
            projectVisibility={newProjectVisibility}
            onNameChange={setNewProjectName}
            onDescriptionChange={setNewProjectDescription}
            onVisibilityChange={setNewProjectVisibility}
            onClose={() => {
              setShowEditModal(false);
              setSelectedProject(null);
              resetProjectForm();
            }}
            onSubmit={updateProject}
            submitLabel="Update"
          />
        )}

        {showDeleteConfirm && (
          <DeleteConfirmModal
            onConfirm={() => deleteProject(showDeleteConfirm)}
            onCancel={() => setShowDeleteConfirm(null)}
          />
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    purple: 'bg-purple-500/20 text-purple-400',
    orange: 'bg-orange-500/20 text-orange-400'
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Project Card Component
function ProjectCard({ project, onNavigate, onEdit, onDelete, onDuplicate, onStar, onArchive, stats, boards }) {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleAction = (action, e) => {
    e.stopPropagation();
    setShowMenu(false);
    action();
  };

  const progress = stats.tasks > 0 ? Math.round((stats.completed / stats.tasks) * 100) : 0;

  return (
    <div
      className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
      onClick={() => onNavigate(project.id)}
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-700">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
            <FolderKanban size={24} className="text-white" />
          </div>
          
          {/* Star Button */}
          <button
            onClick={(e) => handleAction(() => onStar(project.id), e)}
            className={`p-2 rounded-lg transition-colors ${
              project.isStarred ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'
            } hover:bg-slate-700`}
          >
            <Star size={16} fill={project.isStarred ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Content */}
        <h3 className="font-semibold text-white mb-1 truncate">{project.name}</h3>
        {project.description && (
          <p className="text-sm text-slate-400 mb-3 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Visibility Badge */}
        <div className="mb-3">
          <span className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${
            project.visibility === 'public' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-slate-500/20 text-slate-400'
          }`}>
            {project.visibility === 'public' ? <Globe size={12} /> : <Lock size={12} />}
            {project.visibility || 'private'}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 text-xs">
          <span className="flex items-center gap-1 text-slate-400">
            <Layout size={12} />
            {stats.boards} boards
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <CheckCircle size={12} />
            {stats.completed}/{stats.tasks}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Users size={12} />
            {stats.members}
          </span>
        </div>

        {/* Boards Preview */}
        {boards.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {boards.slice(0, 3).map(board => (
              <span key={board.id} className="text-xs px-2 py-1 bg-slate-700 rounded-full text-slate-300">
                {board.name}
              </span>
            ))}
            {boards.length > 3 && (
              <span className="text-xs px-2 py-1 bg-slate-700 rounded-full text-slate-300">
                +{boards.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock size={12} />
            {format(new Date(project.updatedAt || project.createdAt || new Date()), 'MMM dd, yyyy')}
          </span>
          
          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <MoreVertical size={16} className="text-slate-400" />
            </button>
            
            {showMenu && (
              <ProjectMenu
                onClose={() => setShowMenu(false)}
                onEdit={() => handleAction(() => onEdit(project))}
                onDuplicate={() => handleAction(() => onDuplicate(project))}
                onArchive={() => handleAction(() => onArchive(project.id))}
                onDelete={() => handleAction(() => onDelete(project.id))}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Project Menu Component
function ProjectMenu({ onClose, onEdit, onDuplicate, onArchive, onDelete }) {
  useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="absolute right-0 mt-1 w-48 bg-slate-800 rounded-lg border border-slate-700 shadow-xl z-10 py-1"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onEdit}
        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center gap-2"
      >
        <Edit2 size={14} />
        Edit
      </button>
      <button
        onClick={onDuplicate}
        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center gap-2"
      >
        <Copy size={14} />
        Duplicate
      </button>
      <button
        onClick={onArchive}
        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center gap-2"
      >
        <Archive size={14} />
        Archive
      </button>
      <button
        onClick={onDelete}
        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
      >
        <Trash2 size={14} />
        Delete
      </button>
    </div>
  );
}

// Project List View Component
function ProjectListView({ projects, onNavigate, onEdit, onDelete, onDuplicate, onStar, onArchive, stats }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800 border-b border-slate-700">
            <tr>
              <th className="px-4 sm:px-6 py-4 text-left text-sm font-medium text-slate-400">Project</th>
              <th className="hidden md:table-cell px-4 sm:px-6 py-4 text-left text-sm font-medium text-slate-400">Description</th>
              <th className="hidden lg:table-cell px-4 sm:px-6 py-4 text-left text-sm font-medium text-slate-400">Updated</th>
              <th className="hidden sm:table-cell px-4 sm:px-6 py-4 text-left text-sm font-medium text-slate-400">Boards</th>
              <th className="hidden sm:table-cell px-4 sm:px-6 py-4 text-left text-sm font-medium text-slate-400">Tasks</th>
              <th className="px-4 sm:px-6 py-4 text-left text-sm font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {projects.map(project => {
              const projectStat = stats[project.id] || { boards: 0, tasks: 0, completed: 0 };
              
              return (
                <tr
                  key={project.id}
                  className="hover:bg-slate-700/50 cursor-pointer transition-colors"
                  onClick={() => onNavigate(project.id)}
                >
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                        <FolderKanban size={16} className="text-white" />
                      </div>
                      <div>
                        <span className="font-medium text-white block">{project.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          {project.isStarred && (
                            <Star size={12} className="text-yellow-400 fill-current" />
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            project.visibility === 'public' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-slate-500/20 text-slate-400'
                          }`}>
                            {project.visibility || 'private'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                    <p className="text-sm text-slate-400 line-clamp-1 max-w-xs">
                      {project.description || 'No description'}
                    </p>
                  </td>
                  <td className="hidden lg:table-cell px-4 sm:px-6 py-4">
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Clock size={14} />
                      {format(new Date(project.updatedAt || project.createdAt || new Date()), 'MMM dd, yyyy')}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-4 sm:px-6 py-4">
                    <span className="text-sm text-slate-400">
                      {projectStat.boards}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-4 sm:px-6 py-4">
                    <span className="text-sm text-slate-400">
                      {projectStat.completed}/{projectStat.tasks}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onStar(project.id)}
                        className={`p-1 rounded-lg hover:bg-slate-700 transition-colors ${
                          project.isStarred ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'
                        }`}
                        title={project.isStarred ? "Remove from starred" : "Add to starred"}
                      >
                        <Star size={14} />
                      </button>
                      <button
                        onClick={() => onEdit(project)}
                        className="p-1 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDuplicate(project)}
                        className="p-1 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                        title="Duplicate"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => onArchive(project.id)}
                        className="p-1 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                        title="Archive"
                      >
                        <Archive size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(project.id)}
                        className="p-1 rounded-lg hover:bg-red-500/10 transition-colors text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Project Modal Component
function ProjectModal({ 
  title,
  projectName, 
  projectDescription, 
  projectVisibility,
  onNameChange, 
  onDescriptionChange, 
  onVisibilityChange,
  onClose, 
  onSubmit,
  submitLabel 
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-md bg-slate-800 rounded-2xl p-6 border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>
        
        <input
          type="text"
          value={projectName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Project name"
          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          autoFocus
        />

        <textarea
          value={projectDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Project description (optional)"
          rows="3"
          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />

        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-2">Visibility</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={projectVisibility === 'private'}
                onChange={(e) => onVisibilityChange(e.target.value)}
                className="text-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm text-white flex items-center gap-1">
                <Lock size={14} />
                Private
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={projectVisibility === 'public'}
                onChange={(e) => onVisibilityChange(e.target.value)}
                className="text-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm text-white flex items-center gap-1">
                <Globe size={14} />
                Public
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!projectName.trim()}
            className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-md bg-slate-800 rounded-2xl p-6 border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Delete Project</h3>
          <p className="text-slate-400 mb-6">
            Are you sure you want to delete this project? This action cannot be undone.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ onCreateClick, searchQuery, filter }) {
  let message = "Create your first project to get started with organizing your tasks";
  
  if (searchQuery) {
    message = "No projects match your search criteria";
  } else if (filter === 'starred') {
    message = "You haven't starred any projects yet";
  } else if (filter === 'archived') {
    message = "No archived projects";
  }

  return (
    <div className="text-center py-12 sm:py-16">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700">
        <FolderKanban size={32} className="text-slate-400" />
      </div>
      
      <h3 className="text-lg font-medium text-white mb-2">
        {searchQuery ? "No projects found" : "No projects yet"}
      </h3>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">
        {message}
      </p>
      
      <button
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
      >
        <Plus size={18} />
        Create New Project
      </button>
    </div>
  );
}

// Skeleton Loading Component
function ProjectsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-4 sm:p-8">
      <div className="animate-pulse">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 w-48 bg-slate-700 rounded mb-2" />
          <div className="h-4 w-64 bg-slate-700 rounded" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 sm:h-24 bg-slate-700 rounded" />
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 sm:h-56 bg-slate-700 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Projects;