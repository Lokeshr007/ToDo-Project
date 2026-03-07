import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Command, 
  X, 
  FolderKanban, 
  ListTodo, 
  Users, 
  ArrowRight,
  TrendingUp,
  Brain,
  Zap,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Clock,
  History,
  LayoutGrid,
  Activity,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "@/services/api";
import { useWorkspace } from "@/app/providers/WorkspaceContext";

function UniversalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await API.get("/search", {
          params: { q: query, workspaceId: currentWorkspace?.id }
        });
        setResults(response.data || []);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query, currentWorkspace?.id]);

  const handleSelect = (item) => {
    setIsOpen(false);
    const type = String(item.type || "").toLowerCase();
    if (type === 'project') navigate(`/app/projects/${item.id}`);
    else if (type === 'task' || type === 'todo') navigate(`/app/todos?id=${item.id}`);
    else if (type === 'board') navigate(`/app/boards/${item.id}`);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] px-4 sm:px-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl"
          />

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -40 }}
            className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden shadow-black/80"
            onKeyDown={onKeyDown}
          >
            {/* Header */}
            <div className="flex items-center gap-5 px-8 py-8 border-b border-white/5 bg-white/5 relative group">
               <div className={`p-2 bg-purple-600/20 rounded-xl border border-purple-500/20 group-focus-within:bg-purple-600 group-focus-within:text-white transition-all`}>
                  <Search className="text-purple-400 group-focus-within:text-white" size={24} />
               </div>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Synchronizing parameters... (Projects, Tasks, Members)"
                className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 text-xl placeholder:text-white/20 font-black tracking-tight"
              />
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-white/10 rounded-xl text-[10px] text-white/30 font-black uppercase tracking-widest">
                <span>ESC</span>
              </div>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-4 scrollbar-hide">
              {loading && (
                <div className="py-20 text-center">
                  <div className="w-12 h-12 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-6 shadow-[0_0_15px_rgba(168,85,247,0.3)]" />
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Neural Scan in Progress...</p>
                </div>
              )}

              {!loading && query.length > 0 && results.length === 0 && (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                    <Zap className="text-white/10" size={32} />
                  </div>
                  <p className="text-sm font-black text-white/30 uppercase tracking-widest">No Signal Matches Found</p>
                </div>
              )}

              {!loading && query.length === 0 && (
                <div className="p-4 space-y-10">
                   <div>
                     <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-6 px-4">Instant Protocols</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <QuickLink icon={LayoutGrid} label="Main Grid" to="/app/dashboard" />
                        <QuickLink icon={Layers} label="Active Units" to="/app/projects" />
                        <QuickLink icon={Activity} label="Tactical Feed" to="/app/todos" />
                        <QuickLink icon={Brain} label="Enterprise AI" to="/app/ai/enterprise" />
                     </div>
                   </div>
                </div>
              )}

              <div className="space-y-2 mt-4">
                {results.map((item, index) => (
                  <motion.div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item)}
                    className={`
                      flex items-center gap-5 px-6 py-5 rounded-[1.5rem] cursor-pointer transition-all duration-300 relative group/item
                      ${selectedIndex === index ? 'bg-purple-600 text-white shadow-2xl shadow-purple-900/50 scale-[1.02] border border-purple-500/30' : 'hover:bg-white/5 text-white/60'}
                    `}
                  >
                    <div className={`p-3 rounded-xl transition-all shadow-inner ${selectedIndex === index ? 'bg-white/20 border border-white/20' : 'bg-gray-900 border border-white/5'}`}>
                      {String(item.type).toLowerCase() === 'project' ? <FolderKanban size={22} /> : 
                       String(item.type).toLowerCase() === 'task' || String(item.type).toLowerCase() === 'todo' ? <ListTodo size={22} /> : <Users size={22} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-black text-lg tracking-tight truncate uppercase leading-none">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${selectedIndex === index ? 'bg-white/20 text-white' : 'bg-purple-600/20 text-purple-400 border border-purple-500/10'}`}>
                          {item.type}
                        </span>
                        <p className={`text-[11px] font-medium truncate uppercase tracking-tight ${selectedIndex === index ? 'text-white/70' : 'text-white/20'}`}>{item.subtitle}</p>
                      </div>
                    </div>

                    <ArrowRight size={20} className={`transition-all ${selectedIndex === index ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-black/40 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Kbd label="UP/DN" desc="navigate" />
                <Kbd label="ENTER" desc="execute" />
              </div>
              <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em] hidden sm:block">System Scan Integrated</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Kbd({ label, desc }) {
  return (
    <div className="flex items-center gap-3 grayscale group">
      <span className="px-2 py-1 bg-white/5 rounded-lg border border-white/10 text-[9px] text-white font-black tracking-tighter uppercase">{label}</span>
      <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">{desc}</span>
    </div>
  );
}

function QuickLink({ icon: Icon, label, to }) {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(to)}
      className="flex items-center gap-5 p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group text-left relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="p-3 bg-gray-900 rounded-xl text-white/20 group-hover:text-purple-400 group-hover:border-purple-500/30 transition-all border border-white/5 relative z-10 shadow-lg group-hover:scale-110">
        <Icon size={20} />
      </div>
      <span className="text-xs font-black text-white/40 group-hover:text-white transition-colors uppercase tracking-[0.2em] relative z-10">{label}</span>
    </button>
  );
}

export default UniversalSearch;
