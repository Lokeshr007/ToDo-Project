import { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  Settings, 
  Trash2, 
  PlusCircle,
  Loader,
  Search,
  ChevronRight,
  UserPlus
} from "lucide-react";
import { useWorkspace } from "@/app/providers/WorkspaceContext";
import { useAuth } from "@/app/providers/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "@/services/api";
import { toast } from "sonner";

function Workspaces() {
  const navigate = useNavigate();
  const { workspaces, currentWorkspace, switchWorkspace, createWorkspace, refreshWorkspaces } = useWorkspace();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWorkspaces = (workspaces || []).filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    setLoading(true);
    try {
      await createWorkspace(newWorkspaceName, newWorkspaceDesc);
      setShowCreateModal(false);
      setNewWorkspaceName("");
      setNewWorkspaceDesc("");
      toast.success("Workspace created successfully");
    } catch (error) {
      console.error("Failed to create workspace:", error);
      toast.error("Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkspace = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workspace? All data will be lost forever.")) {
      return;
    }

    try {
      await API.delete(`/workspaces/${id}`);
      refreshWorkspaces();
      toast.success("Workspace deleted");
    } catch (error) {
      toast.error("Failed to delete workspace");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto backdrop-blur-3xl bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Workspaces</h1>
            <p className="text-purple-200 mt-1">Manage and collaborate in different workspace environments</p>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-600/30"
          >
            <Plus size={20} />
            New Workspace
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={18} />
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-purple-500/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkspaces.map((workspace) => (
            <div 
              key={workspace.id}
              className={`group relative bg-white/5 backdrop-blur-lg rounded-2xl border-2 transition-all p-6 cursor-pointer ${
                currentWorkspace?.id === workspace.id 
                  ? 'border-purple-500 shadow-xl shadow-purple-500/20' 
                  : 'border-purple-500/10 hover:border-purple-500/30'
              }`}
              onClick={() => switchWorkspace(workspace)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold bg-gradient-to-br from-purple-500 to-indigo-600`}>
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/app/workspace/settings');
                    }}
                    className="p-2 text-purple-300 hover:text-white rounded-lg hover:bg-white/10"
                  >
                    <Settings size={18} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWorkspace(workspace.id);
                    }}
                    className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">{workspace.name}</h3>
              <p className="text-purple-200 text-sm line-clamp-2 mb-6 h-10">
                {workspace.description || 'No description provided.'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-purple-500/10">
                <div className="flex items-center gap-2 text-purple-300 text-sm">
                  <UserPlus size={16} />
                  <span>{workspace.memberCount || 1} Members</span>
                </div>
                {currentWorkspace?.id === workspace.id && (
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-1 rounded">Active</span>
                )}
              </div>

              {currentWorkspace?.id !== workspace.id && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-purple-900/40 rounded-2xl backdrop-blur-[2px]">
                  <span className="bg-white text-purple-900 px-6 py-2 rounded-xl font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    Switch To <ChevronRight size={18} />
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Create Card */}
          <div 
            onClick={() => setShowCreateModal(true)}
            className="group h-full min-h-[220px] flex flex-col items-center justify-center bg-white/5 border-2 border-dashed border-purple-500/20 rounded-2xl hover:bg-white/10 hover:border-purple-500/40 transition-all cursor-pointer p-6"
          >
            <PlusCircle size={48} className="text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-medium text-purple-200">Create New Workspace</span>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-purple-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Workspace</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Workspace Name</label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-purple-500/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Engineering Team"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Description (Optional)</label>
                <textarea
                  value={newWorkspaceDesc}
                  onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-purple-500/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                  placeholder="Describe your workspace team or purpose..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 text-purple-200 hover:bg-white/5 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateWorkspace}
                disabled={loading || !newWorkspaceName.trim()}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
              >
                {loading ? <Loader size={20} className="animate-spin" /> : "Create Workspace"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Workspaces;
