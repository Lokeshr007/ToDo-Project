// frontend/src/features/projects/pages/Projects.jsx
import { useState, useEffect } from "react";
import { useAuth } from "@/app/providers/AuthContext";
import { useWorkspace } from "@/app/providers/WorkspaceContext";
import { 
  FolderKanban, 
  Plus, 
  MoreVertical, 
  Clock, 
  Users,
  ListTodo,
  Loader,
  Trash2,
  Edit2,
  Copy,
  Archive
} from "lucide-react";
import API from "@/services/api";
import { Link, useNavigate } from "react-router-dom";
import { taskToast } from '@/shared/components/QuantumToaster';
import { format } from 'date-fns';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    color: '#6366f1'
  });
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch projects if workspace exists
    if (currentWorkspace && currentWorkspace.id) {
      fetchProjects();
    } else {
      // If no workspace, still set loading to false
      setLoading(false);
    }
  }, [currentWorkspace]);

  const fetchProjects = async () => {
    if (!currentWorkspace?.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log("Fetching projects for workspace:", currentWorkspace.id);
      const response = await API.get('/projects', {
        params: { workspaceId: currentWorkspace.id }
      });
      setProjects(response.data || []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      if (error.response?.status !== 401 && error.response?.status !== 400) {
        taskToast.error("Failed to load projects");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    // Add check for workspace
    if (!currentWorkspace || !currentWorkspace.id) {
      taskToast.error('No workspace selected. Please select a workspace first.');
      return;
    }

    if (!newProject.name.trim()) {
      taskToast.error('Project name is required');
      return;
    }

    try {
      console.log("Creating project in workspace:", currentWorkspace.id);
      const response = await API.post('/projects', newProject, {
        params: { workspaceId: currentWorkspace.id }
      });
      setProjects([response.data, ...projects]);
      setShowCreateModal(false);
      setNewProject({ name: '', description: '', color: '#6366f1' });
      taskToast.success('Project created successfully');
    } catch (error) {
      console.error("Failed to create project:", error);
      taskToast.error(error.response?.data?.error || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!currentWorkspace?.id) {
      taskToast.error('No workspace selected');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this project? All boards and tasks will be permanently deleted.')) {
      return;
    }

    try {
      await API.delete(`/projects/${projectId}`);
      setProjects(projects.filter(p => p.id !== projectId));
      taskToast.success('Project deleted successfully');
    } catch (error) {
      console.error("Failed to delete project:", error);
      taskToast.error(error.response?.data?.error || 'Failed to delete project');
    }
  };

  const handleDuplicateProject = async (projectId) => {
    if (!currentWorkspace?.id) {
      taskToast.error('No workspace selected');
      return;
    }

    try {
      const response = await API.post(`/projects/${projectId}/duplicate`);
      setProjects([response.data, ...projects]);
      taskToast.success('Project duplicated successfully');
    } catch (error) {
      console.error("Failed to duplicate project:", error);
      taskToast.error(error.response?.data?.error || 'Failed to duplicate project');
    }
  };

  const getRandomColor = () => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Show workspace selection message if no workspace
  if (!currentWorkspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <FolderKanban size={64} className="mx-auto text-purple-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Workspace Selected</h2>
          <p className="text-purple-200 mb-6">Please select a workspace to view projects</p>
          <Link
            to="/app/workspaces"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all"
          >
            Go to Workspaces
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Loader size={40} className="text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Projects</h1>
            <p className="text-purple-200 mt-1">
              Workspace: <span className="font-semibold">{currentWorkspace.name}</span>
            </p>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-600/30"
          >
            <Plus size={20} />
            New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16 bg-white/5 backdrop-blur-lg rounded-2xl border border-purple-500/20">
            <FolderKanban size={64} className="mx-auto text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-purple-200 mb-6">Create your first project to get started</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
                onDuplicate={handleDuplicateProject}
                onNavigate={(id) => navigate(`/app/projects/${id}`)}
              />
            ))}
          </div>
        )}

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          newProject={newProject}
          setNewProject={setNewProject}
          onCreate={handleCreateProject}
        />
      </div>
    </div>
  );
}

// Project Card Component
function ProjectCard({ project, onDelete, onDuplicate, onNavigate }) {
  const [showMenu, setShowMenu] = useState(false);

  const getRandomColor = () => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div
      className="group bg-white/5 backdrop-blur-lg rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all overflow-hidden"
    >
      <div className="p-6" onClick={() => onNavigate(project.id)}>
        <div className="flex items-start justify-between mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold"
            style={{ backgroundColor: project.color || getRandomColor() }}
          >
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="text-purple-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <MoreVertical size={20} />
            </button>
            
            {showMenu && (
              <div 
                className="absolute right-0 mt-1 w-48 bg-gray-800 rounded-lg border border-purple-500/30 shadow-xl z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    onDuplicate(project.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-purple-200 hover:bg-white/10 flex items-center gap-2"
                >
                  <Copy size={14} />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    onDelete(project.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        
        <h3 className="font-semibold text-lg text-white mb-2">{project.name}</h3>
        <p className="text-sm text-purple-200 line-clamp-2 mb-4">
          {project.description || 'No description provided.'}
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-purple-200">
              <ListTodo size={16} />
              <span>{project.taskCount || 0} Tasks</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-200">
              <Users size={16} />
              <span>Workspace</span>
            </div>
          </div>

          {project.createdAt && (
            <div className="flex items-center gap-1 text-xs text-purple-300">
              <Clock size={12} />
              <span>Created {format(new Date(project.createdAt), 'MMM dd, yyyy')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Create Project Modal
function CreateProjectModal({ isOpen, onClose, newProject, setNewProject, onCreate }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-purple-500/30 max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Create New Project</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter project name"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Description
            </label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 bg-gray-800 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter project description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Color
            </label>
            <input
              type="color"
              value={newProject.color}
              onChange={(e) => setNewProject({ ...newProject, color: e.target.value })}
              className="w-full h-10 bg-gray-800 border border-purple-500/30 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={!newProject.name.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}

export default Projects;
