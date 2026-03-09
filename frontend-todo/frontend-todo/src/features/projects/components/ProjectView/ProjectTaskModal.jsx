import React, { useState, useEffect } from 'react';
import { X, Loader, MessageSquare, Clock, Calendar as CalendarIcon, Hash, Type, AlignLeft, User as UserIcon, Flag, Save, Check } from 'lucide-react';
import MemberSearch from '@/shared/components/MemberSearch';
import API from "@/services/api";
import { format } from 'date-fns';
import { taskToast } from '@/shared/components/QuantumToaster';

const ProjectTaskModal = ({ task, onClose, onUpdate, themeStyles, members, boards }) => {
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
      taskToast.error('Project directive title is mandatory');
      return;
    }

    setLoading(true);
    try {
      if (taskData.id) {
        await API.put(`/todos/${taskData.id}`, {
          item: taskData.item,
          description: taskData.description,
          priority: taskData.priority,
          status: taskData.status,
          dueDate: taskData.dueDate,
          assignedToId: taskData.assignedToId
        });
        taskToast.success('Directive updated successfully');
      } else {
        await API.post(`/kanban/columns/${taskData.columnId}/tasks`, {
          item: taskData.item,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          assignedToId: taskData.assignedToId
        });
        taskToast.success('New directive deployed');
      }
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to save task:", error);
      taskToast.error(error.response?.data?.message || 'Transaction aborted: Storage failure');
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
      taskToast.success('Comment logged');
    } catch (error) {
      taskToast.error('Inter-service communication failure');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div 
        className={`w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-700/50 max-h-[90vh] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 rounded-xl border border-blue-500/30">
              <Hash size={20} className="text-blue-400" />
            </div>
            <h3 className={`text-xl font-black text-white uppercase tracking-tight`}>
              {task?.id ? 'Objective Details' : 'Initialize Objective'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-xl hover:bg-slate-800 transition-all text-slate-500 hover:text-white`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Navigation */}
        <div className={`flex gap-6 px-8 pt-4 border-b border-slate-800/50 bg-slate-900/30 overflow-x-auto`}>
          {[
            { id: 'details', label: 'Brief', icon: AlignLeft },
            { id: 'comments', label: 'Comm-Log', icon: MessageSquare, count: comments.length },
            { id: 'activity', label: 'History', icon: Clock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? `border-blue-500 text-blue-400`
                  : `border-transparent text-slate-600 hover:text-slate-400`
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Scrollable Intelligence Core */}
        <div className="p-8 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-700">
          {activeTab === 'details' && (
            <div className="space-y-8">
              {/* Title Section */}
              <div className="group">
                <div className="flex items-center gap-2 mb-2 ml-1">
                  <Type size={12} className="text-blue-500" />
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Directive Title</label>
                </div>
                <input
                  type="text"
                  value={taskData.item || ''}
                  onChange={(e) => setTaskData({ ...taskData, item: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-950 border border-slate-700/50 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold text-lg"
                  placeholder="Summarize the objective..."
                  autoFocus
                />
              </div>

              {/* Description Section */}
              <div>
                <div className="flex items-center gap-2 mb-2 ml-1">
                  <AlignLeft size={12} className="text-blue-500" />
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Technical Briefing</label>
                </div>
                <textarea
                  value={taskData.description || ''}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  rows="4"
                  className="w-full px-5 py-4 bg-slate-950 border border-slate-700/50 rounded-2xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none text-sm font-medium leading-relaxed"
                  placeholder="Delineate the scope of work..."
                />
              </div>

              {/* Grid System */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2 ml-1">
                    <Flag size={12} className="text-blue-500" />
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Priority Rating</label>
                  </div>
                  <select
                    value={taskData.priority || 'NORMAL'}
                    onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700/50 rounded-xl text-white focus:outline-none font-bold text-sm cursor-pointer"
                  >
                    <option value="HIGH">Level 1: Critical</option>
                    <option value="MEDIUM">Level 2: Urgent</option>
                    <option value="NORMAL">Level 3: Operational</option>
                    <option value="LOW">Level 4: Routine</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2 ml-1">
                    <Clock size={12} className="text-blue-500" />
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pipeline Status</label>
                  </div>
                  <select
                    value={taskData.status || 'PENDING'}
                    onChange={(e) => setTaskData({ ...taskData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700/50 rounded-xl text-white focus:outline-none font-bold text-sm cursor-pointer"
                  >
                    <option value="BACKLOG">Phase 0: Staging</option>
                    <option value="PENDING">Phase 1: Queued</option>
                    <option value="IN_PROGRESS">Phase 2: Execution</option>
                    <option value="REVIEW">Phase 3: Validation</option>
                    <option value="COMPLETED">Phase 4: Archival</option>
                    <option value="BLOCKED">State: Suspended</option>
                  </select>
                </div>

                <MemberSearch 
                  selectedUserId={taskData.assignedToId}
                  onSelect={(userId) => setTaskData({ ...taskData, assignedToId: userId })}
                  users={members}
                  label="Ownership Assignment (Email Search)"
                />

                <div>
                  <div className="flex items-center gap-2 mb-2 ml-1">
                    <CalendarIcon size={12} className="text-blue-500" />
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Deadline</label>
                  </div>
                  <input
                    type="date"
                    value={taskData.dueDate?.split('T')[0] || ''}
                    onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700/50 rounded-xl text-white focus:outline-none font-bold text-sm"
                  />
                </div>

                {!task?.id && (
                  <div className="sm:col-span-2">
                    <div className="flex items-center gap-2 mb-2 ml-1">
                      <Hash size={12} className="text-blue-500" />
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deployment Target (Column)</label>
                    </div>
                    <select
                      value={taskData.columnId || task?.columnId || ''}
                      onChange={(e) => setTaskData({ ...taskData, columnId: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700/50 rounded-xl text-white focus:outline-none font-bold text-sm cursor-pointer"
                    >
                      <option value="">Awaiting Vector...</option>
                      {boards.flatMap(board => 
                        board.columns?.map(column => (
                          <option key={column.id} value={column.id}>
                            Board: {board.name} // Registry: {column.name}
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
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-12">
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className={`p-5 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-sm`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-black uppercase shadow-lg shadow-blue-900/10`}>
                          {comment.author?.name?.[0] || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-xs font-black text-white uppercase tracking-tight`}>
                            {comment.author?.name || 'Agent-Proxy'}
                          </span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                            {format(new Date(comment.createdAt), 'MMM dd | HH:mm')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className={`text-sm text-slate-300 font-medium leading-relaxed pl-11`}>{comment.content}</p>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 bg-slate-950/20 rounded-3xl border border-dashed border-slate-800">
                    <MessageSquare size={32} className="text-slate-700 mb-2" />
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Silence in the wire</p>
                  </div>
                )}
              </div>

              {/* Secure Comment Input */}
              <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-120px)] max-w-[600px] flex gap-2 p-3 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Transmit memo..."
                  className={`flex-1 px-5 py-2.5 bg-slate-950 border border-slate-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium`}
                  onKeyPress={(e) => e.key === 'Enter' && addComment()}
                />
                <button
                  onClick={addComment}
                  disabled={!newComment.trim()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-blue-900/20"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="flex flex-col items-center justify-center py-32 animate-in pulse duration-700">
               <Clock size={48} className="text-slate-800 mb-4" />
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] text-center">Decrypting historical logs...</p>
               <span className="text-[9px] text-slate-700 mt-2 italic">Feature encryption in progress</span>
            </div>
          )}
        </div>

        {/* Tactical Footer */}
        <div className={`p-6 border-t border-slate-800/80 flex justify-end gap-3 bg-slate-900/50`}>
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-slate-800 transition-all`}
          >
            Abort
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !taskData.item?.trim()}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/30 flex items-center gap-3"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : <><Save size={16}/> {task?.id ? 'Commit' : 'Deploy'}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectTaskModal;
