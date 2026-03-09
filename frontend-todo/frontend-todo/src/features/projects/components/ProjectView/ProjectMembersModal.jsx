import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Shield, ShieldCheck, Mail, Loader, Check, Users } from 'lucide-react';
import API from '@/services/api';
import { taskToast } from '@/shared/components/QuantumToaster';

const ProjectMembersModal = ({ projectId, workspaceId, onClose, themeStyles }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteQuery, setInviteQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      // For now, projects use workspace members in this implementation
      // If backend has project-specific members, update endpoint accordingly
      const response = await API.get(`/workspaces/${workspaceId}/members`);
      setMembers(response.data);
    } catch (error) {
      console.error("Failed to fetch project members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (inviteQuery.length >= 2) {
        setSearching(true);
        try {
          const response = await API.get(`/users/search?q=${inviteQuery}`);
          // Filter out those who are already members
          const filtered = response.data.filter(u => !members.some(m => m.id === u.id));
          setSearchResults(filtered);
        } catch (error) {
          console.error("User search failed:", error);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [inviteQuery, members]);

  const handleInvite = async (user) => {
    setIsInviting(true);
    try {
      // Invite to workspace first as projects are tied to workspaces
      await API.post(`/workspaces/${workspaceId}/members`, {
        email: user.email,
        role: 'MEMBER'
      });
      taskToast.success(`Added ${user.name || user.email} to workspace team`);
      setInviteQuery('');
      setSearchResults([]);
      fetchMembers();
    } catch (error) {
      taskToast.error(error.response?.data?.error || "Inter-service link failure during invite");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-lg bg-slate-900 rounded-[2.5rem] border border-slate-700/50 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 border-b border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600/20 rounded-2xl border border-purple-500/30">
              <Users size={24} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Project Team</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Personnel Allocation Shell</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          {/* Global Search Section */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-3 ml-1">
              <UserPlus size={12} className="text-purple-500" />
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enlist New Member (Email Search)</label>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-purple-500" size={18} />
              <input
                type="text"
                value={inviteQuery}
                onChange={(e) => setInviteQuery(e.target.value)}
                placeholder="search-email@protocol.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-700/50 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-bold"
              />
              {searching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader size={16} className="text-purple-500 animate-spin" />
                </div>
              )}
            </div>

            {/* Results Overlay */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 max-h-60 overflow-y-auto">
                {searchResults.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleInvite(user)}
                    className="w-full p-3 flex items-center justify-between hover:bg-purple-600/20 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-black text-white group-hover:bg-purple-600">
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-white tracking-tight">{user.name || 'Agent'}</p>
                        <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{user.email}</p>
                      </div>
                    </div>
                    <Check size={16} className="text-purple-500 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current Team Section */}
          <div>
            <div className="flex items-center gap-2 mb-4 ml-1">
              <ShieldCheck size={12} className="text-purple-500" />
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Personnel</label>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                   <Loader size={30} className="text-slate-800 mb-4 animate-spin" />
                   <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest animate-pulse">Scanning Bio-Profiles...</p>
                </div>
              ) : members.map(member => (
                <div key={member.id} className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-center justify-between group hover:border-purple-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sm font-black text-white group-hover:bg-slate-800">
                      {member.name?.[0] || member.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{member.name || 'Anonymous'}</p>
                      <p className="text-[10px] text-slate-500 font-mono tracking-tighter flex items-center gap-2">
                        <Mail size={10} />
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-black tracking-[0.1em] uppercase ${
                      member.role === 'ADMIN' 
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                        : 'bg-slate-800/50 text-slate-500 border-slate-700'
                    }`}>
                      {member.role || 'MEMBER'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-950/50 border-t border-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectMembersModal;
