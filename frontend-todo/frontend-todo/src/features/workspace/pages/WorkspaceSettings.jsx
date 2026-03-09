import { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Settings, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  Trash2, 
  Search, 
  Mail,
  Loader,
  ChevronLeft,
  X,
  Check,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useWorkspace } from "@/app/providers/WorkspaceContext";
import { useAuth } from "@/app/providers/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "@/services/api";
import { taskToast } from '@/shared/components/QuantumToaster';

function WorkspaceSettings() {
  const navigate = useNavigate();
  const { currentWorkspace, refreshWorkspaces } = useWorkspace();
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [searchQuery, setSearchQuery] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchMembers();
    }
  }, [currentWorkspace?.id]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/workspaces/${currentWorkspace.id}/members`);
      setMembers(response.data);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      tasktaskToast.error("Failed to load workspace members");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      tasktaskToast.error("Email is required");
      return;
    }

    setIsActionLoading(true);
    try {
      await API.post(`/workspaces/${currentWorkspace.id}/members`, {
        email: inviteEmail,
        role: inviteRole
      });
      tasktaskToast.success(`Invitation sent to ${inviteEmail}`);
      setShowInviteModal(false);
      setInviteEmail("");
      fetchMembers();
    } catch (error) {
      console.error("Failed to invite member:", error);
      tasktaskToast.error(error.response?.data?.error || "Failed to invite member");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    setIsActionLoading(true);
    try {
      await API.put(`/workspaces/${currentWorkspace.id}/members/${memberId}`, {
        role: newRole
      });
      tasktaskToast.success("Member role updated");
      fetchMembers();
    } catch (error) {
      tasktaskToast.error("Failed to update role");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) {
      return;
    }

    setIsActionLoading(true);
    try {
      await API.delete(`/workspaces/${currentWorkspace.id}/members/${memberId}`);
      tasktaskToast.success("Member removed");
      fetchMembers();
    } catch (error) {
      tasktaskToast.error("Failed to remove member");
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAdmin = members.find(m => m.id === currentUser?.id)?.role === 'ADMIN' || currentWorkspace?.ownerId === currentUser?.id;

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p>Loading workspace settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/app/workspaces')}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                <ChevronLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  {currentWorkspace.name} Settings
                </h1>
                <p className="text-slate-400 text-sm">Manage members and workspace configuration</p>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all font-semibold shadow-lg shadow-purple-600/20"
              >
                <UserPlus size={18} />
                <span>Invite Member</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - General Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] border border-white/10 p-8">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center text-4xl font-bold shadow-2xl mb-6 mx-auto">
                {currentWorkspace.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-center mb-2">{currentWorkspace.name}</h2>
              <p className="text-slate-400 text-sm text-center mb-6">
                {currentWorkspace.description || "No description provided."}
              </p>
              
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Owner</span>
                  <span className="text-white font-medium">You</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Created</span>
                  <span className="text-white font-medium">
                    {currentWorkspace.createdAt ? new Date(currentWorkspace.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Member Count</span>
                  <span className="text-white font-medium">{members.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-red-500/10 backdrop-blur-lg rounded-[2rem] border border-red-500/20 p-8">
              <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                <ShieldAlert size={18} />
                Danger Zone
              </h3>
              <p className="text-slate-400 text-xs mb-4">
                Deleting this workspace will permanently remove all associated tasks, projects, and data.
              </p>
              <button className="w-full py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all text-sm font-bold">
                Delete Workspace
              </button>
            </div>
          </div>

          {/* Right Column - Member List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] border border-white/10 overflow-hidden">
              <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Users className="text-purple-500" />
                  Team Members
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm w-full sm:w-64"
                  />
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {loading ? (
                  <div className="p-20 text-center">
                    <Loader className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-slate-400">Loading members...</p>
                  </div>
                ) : filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <div key={member.id} className="p-6 flex items-center justify-between hover:bg-white/2 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-white/10 shadow-lg text-lg font-bold">
                          {member.name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{member.name || "Invite Pending"}</p>
                          <p className="text-slate-400 text-sm flex items-center gap-2">
                            <Mail size={12} />
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                            member.role === 'ADMIN' 
                              ? 'bg-purple-500/20 text-purple-400' 
                              : 'bg-slate-500/20 text-slate-400'
                          }`}>
                            {member.role === 'ADMIN' ? <ShieldCheck size={12} /> : <Shield size={12} />}
                            {member.role}
                          </span>
                        </div>

                        {isAdmin && member.id !== currentUser?.id && (
                          <div className="flex items-center gap-2">
                            <select
                              value={member.role}
                              onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                              className="bg-slate-900/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                              disabled={isActionLoading}
                            >
                              <option value="MEMBER">Member</option>
                              <option value="ADMIN">Admin</option>
                              <option value="VIEWER">Viewer</option>
                            </select>
                            <button
                              onClick={() => handleRemoveMember(member.id, member.name || member.email)}
                              className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                              disabled={isActionLoading}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}

                        {member.id === currentUser?.id && (
                          <span className="text-xs text-purple-500 font-bold bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">YOU</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center text-slate-500">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No members found matching your search.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => !isActionLoading && setShowInviteModal(false)}></div>
          <div className="relative bg-slate-900 border border-white/10 rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Invite to Team</h2>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
                disabled={isActionLoading}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Member Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="email@example.com"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Workspace Role</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'ADMIN', label: 'Admin', icon: ShieldCheck, desc: 'Full access' },
                    { id: 'MEMBER', label: 'Member', icon: Shield, desc: 'Create & edit' }
                  ].map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setInviteRole(role.id)}
                      className={`p-4 rounded-2xl border transition-all text-left ${
                        inviteRole === role.id 
                          ? 'bg-purple-600/10 border-purple-500 text-white' 
                          : 'bg-white/2 border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <role.icon size={20} className={inviteRole === role.id ? 'text-purple-400' : 'text-slate-500'} />
                      <p className="mt-2 font-bold text-sm">{role.label}</p>
                      <p className="text-[10px] opacity-60">{role.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-3 text-slate-400 font-bold hover:bg-white/5 rounded-2xl transition-all"
                  disabled={isActionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteMember}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={isActionLoading || !inviteEmail.trim()}
                >
                  {isActionLoading ? <Loader size={18} className="animate-spin" /> : <Check size={18} />}
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkspaceSettings;

