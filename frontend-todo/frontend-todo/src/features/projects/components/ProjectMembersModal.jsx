import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Trash2, Users, Crown, Shield, Mail, Send } from 'lucide-react';
import UserSearch from '@/shared/components/UserSearch';
import { taskToast } from '@/shared/components/QuantumToaster';
import { useNotification } from '@/app/providers/NotificationContext';

const ProjectMembersModal = ({ isOpen, onClose, project, onAddMember, onRemoveMember, isAdding, isRemoving }) => {
  const [emailInput, setEmailInput] = useState('');
  const { showConfirm } = useNotification();

  if (!isOpen || !project) return null;

  const handleAddById = async (user) => {
    try {
      await onAddMember(project.id, user.id);
      // toast is handled in Projects.jsx but we can add secondary feedback here if needed
    } catch (error) {
      // error handled in Projects.jsx
    }
  };

  const handleAddByEmail = async (e) => {
    e?.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      tasktaskToast.error("Please enter a valid email address");
      return;
    }

    try {
      await onAddMember(project.id, emailInput.trim());
      setEmailInput('');
    } catch (error) {
      // error handled in Projects.jsx
    }
  };

  const handleRemove = (userId, userName) => {
    showConfirm({
      title: "Remove Member?",
      message: `Are you sure you want to remove ${userName} from this project?`,
      confirmText: "Remove Member",
      onConfirm: async () => {
        try {
          await onRemoveMember(project.id, userId);
        } catch (error) {
          // error handled in Projects.jsx
        }
      }
    });
  };

  const members = project.members || [];
  const excludeIds = members.map(m => m.id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 bg-slate-800/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-600/20 rounded-xl border border-purple-500/20">
                  <Users className="text-purple-400" size={20} />
                </div>
                <div>
                   <h2 className="text-lg font-bold text-white">Project Members</h2>
                   <p className="text-xs text-slate-400 font-medium">{project.name}</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            {/* Add Member Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Add Member (Search Workspace)</label>
                <UserSearch 
                  onSelect={(user) => handleAddById(user)} 
                  placeholder="Search by name or email..." 
                  excludeIds={excludeIds}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900 px-2 text-slate-500 font-bold">Or Invite by Email</span>
                </div>
              </div>

              <form onSubmit={handleAddByEmail} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter email address..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAdding || !emailInput.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isAdding ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                  Add
                </button>
              </form>
            </div>

            {/* Members List */}
            <div className="mt-8">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Current Members ({members.length})</label>
              <div className="space-y-2">
                {members.length === 0 ? (
                  <div className="text-center py-10 bg-slate-950/30 rounded-2xl border border-dashed border-white/5 text-slate-500 text-sm">
                    No members in this project.
                  </div>
                ) : (
                  members.map((member) => (
                    <motion.div
                      layout
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-slate-800/40 border border-white/5 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                          {member.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white flex items-center gap-2">
                            {member.name}
                            {member.role === 'ADMIN' && <Crown size={12} className="text-yellow-400" />}
                          </p>
                          <p className="text-[10px] text-slate-500">{member.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(member.id, member.name)}
                        disabled={isRemoving}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-white/5 flex justify-end">
             <button
               onClick={onClose}
               className="px-6 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all"
             >
               Close
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProjectMembersModal;

