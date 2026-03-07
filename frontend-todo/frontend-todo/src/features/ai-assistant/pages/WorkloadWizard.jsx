import { useState, useEffect } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceContext';
import API from '@/services/api';
import { 
  Users, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  BarChart3, 
  UserPlus, 
  RefreshCcw,
  Clock,
  CheckCircle2,
  Brain,
  ShieldCheck,
  Zap,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WorkloadWizard = () => {
    const { currentWorkspace } = useWorkspace();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalysis = async () => {
        if (!currentWorkspace?.id) return;
        setLoading(true);
        try {
            const response = await API.get(`/workspace/${currentWorkspace.id}/workload-analysis`);
            setAnalysis(response.data);
        } catch (error) {
            console.error('Failed to fetch workload analysis:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, [currentWorkspace?.id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-6">
                <motion.div 
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative"
                >
                    <div className="w-20 h-20 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin"></div>
                    <Brain className="absolute inset-0 m-auto text-purple-400" size={32} />
                </motion.div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-white">Consulting the Wizard</h3>
                    <p className="text-slate-400 max-w-xs mx-auto text-sm">Analyzing member throughput, deadline proximity, and resource allocation across your workspace...</p>
                </div>
            </div>
        );
    }

    if (!analysis) return null;

    const totalActiveTasks = (analysis.tasksByStatus?.PENDING || 0) + 
                            (analysis.tasksByStatus?.IN_PROGRESS || 0) + 
                            (analysis.tasksByStatus?.REVIEW || 0) + 
                            (analysis.tasksByStatus?.BACKLOG || 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">
                {/* Premium Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/5">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/20">
                            <Zap size={24} className="text-white fill-white" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Workload <span className="text-purple-500">Wizard</span></h1>
                    </div>
                    <p className="text-slate-400 text-lg flex items-center gap-2">
                        <ShieldCheck size={18} className="text-emerald-500" />
                        AI-optimized resource planning for <span className="text-slate-200 font-medium">"{currentWorkspace?.name}"</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchAnalysis}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-all font-medium text-sm group"
                    >
                        <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                        Re-calibrate
                    </button>
                </div>
            </div>

            {/* Health Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <HealthCard 
                    title="Team Health"
                    value={`${Math.round(analysis.overallEfficiency)}%`}
                    subtitle="Throughput Score"
                    icon={<TrendingUp size={20} />}
                    color="purple"
                    progress={analysis.overallEfficiency}
                />
                <StatCard 
                    title="Operational Flux"
                    value={totalActiveTasks}
                    subtitle="Ongoing Missions"
                    icon={<BarChart3 size={20} />}
                    color="blue"
                />
                <StatCard 
                    title="Risk Factors"
                    value={analysis.bottlenecks?.length || 0}
                    subtitle="Resource Conflicts"
                    icon={<AlertTriangle size={20} />}
                    color="red"
                />
                <StatCard 
                    title="Active Squad"
                    value={analysis.userWorkloads.length}
                    subtitle="Deployed Members"
                    icon={<Users size={20} />}
                    color="emerald"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Member Allocation Table */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded-lg"><Users size={20} className="text-indigo-400" /></div>
                            Member Allocation
                        </h2>
                    </div>
                    
                    <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-3xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                                    <tr>
                                        <th className="px-6 py-4">Commander</th>
                                        <th className="px-6 py-4">Load Balance</th>
                                        <th className="px-6 py-4">Stats (A/O/D)</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {analysis.userWorkloads.map(user => (
                                        <tr key={user.userId} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-black border border-white/10 flex items-center justify-center text-white font-black text-lg shadow-xl shrink-0 group-hover:scale-105 transition-transform">
                                                        {user.userName[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white leading-tight">{user.userName}</div>
                                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">Primary Assignee</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 min-w-[160px]">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${user.utilizationPercentage}%` }}
                                                            className={`h-full rounded-full ${
                                                                user.utilizationPercentage > 85 ? 'bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
                                                                user.utilizationPercentage > 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 
                                                                'bg-gradient-to-r from-emerald-400 to-cyan-400'
                                                            }`}
                                                        />
                                                    </div>
                                                    <span className={`text-xs font-black ${user.utilizationPercentage > 85 ? 'text-red-400' : 'text-slate-400'}`}>
                                                        {Math.round(user.utilizationPercentage)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md font-bold text-xs" title="Active">
                                                        {user.activeTasks}
                                                    </span>
                                                    <span className={`px-2 py-1 ${user.overdueTasks > 0 ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-slate-500'} rounded-md font-bold text-xs`} title="Overdue">
                                                        {user.overdueTasks}
                                                    </span>
                                                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md font-bold text-xs" title="Completed">
                                                        {user.completedTasks}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    user.utilizationPercentage > 85 ? 'bg-red-400/10 text-red-500 border border-red-500/20' : 
                                                    user.overdueTasks > 0 ? 'bg-amber-400/10 text-amber-500 border border-amber-500/20' : 
                                                    'bg-emerald-400/10 text-emerald-500 border border-emerald-500/20'
                                                }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                                        user.utilizationPercentage > 85 ? 'bg-red-500' : 
                                                        user.overdueTasks > 0 ? 'bg-amber-500' : 
                                                        'bg-emerald-500'
                                                    }`} />
                                                    {user.utilizationPercentage > 85 ? 'Burst Mode' : user.overdueTasks > 0 ? 'Lagging' : 'Optimal'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* AI Advisor Panel */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <div className="p-2 bg-purple-600/20 rounded-lg"><Brain size={20} className="text-purple-400" /></div>
                        AI Advisor
                    </h2>
                    
                    <div className="bg-gradient-to-b from-slate-900 to-black border border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl flex flex-col h-full ring-1 ring-white/10">
                        <div className="p-8 space-y-8">
                            {/* Critical Threats */}
                            {analysis.bottlenecks.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-xs font-black text-red-500 uppercase tracking-widest">Workspace Threats</h3>
                                        <span className="w-5 h-5 bg-red-500 text-white rounded-md flex items-center justify-center text-[10px] font-black">{analysis.bottlenecks.length}</span>
                                    </div>
                                    <div className="space-y-3">
                                        {analysis.bottlenecks.map((b, idx) => (
                                            <motion.div 
                                                initial={{ x: 20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: idx * 0.1 }}
                                                key={idx} 
                                                className="relative group p-4 bg-gradient-to-r from-red-500/10 to-transparent border-l-4 border-red-500 rounded-xl overflow-hidden"
                                            >
                                                <div className="relative z-10">
                                                    <p className="text-sm text-slate-200 font-bold leading-relaxed">{b.reason}</p>
                                                    <div className="flex gap-2 mt-3">
                                                        {b.affectedTaskIds.map(id => (
                                                            <span key={id} className="text-[9px] font-black bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">
                                                                TASK-{id}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                                    <AlertTriangle size={40} />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Strategic Optimizations */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest">Optimizations</h3>
                                    <Lightbulb size={16} className="text-yellow-400 animate-pulse" />
                                </div>
                                <div className="space-y-4">
                                    {analysis.suggestions.map((s, idx) => (
                                        <motion.div 
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 + idx * 0.1 }}
                                            key={idx} 
                                            className="p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/[0.08] transition-all group"
                                        >
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 shrink-0 border border-blue-400/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                    {s.type === 'REASSIGN' ? <UserPlus size={18} /> : <Zap size={18} />}
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-sm text-slate-300 leading-relaxed font-medium">{s.description}</p>
                                                    {s.targetTaskId && (
                                                        <button 
                                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                                                        >
                                                            Apply Fix <ChevronRight size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    
                                    {analysis.suggestions.length === 0 && (
                                        <div className="text-center py-12 space-y-4 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                                            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                                <ShieldCheck size={32} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-white">Maximum Efficiency</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No corrective actions needed</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-auto bg-white/5 p-6 text-center border-t border-white/5">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Engine v2.0.4-Loki</p>
                            <p className="text-[9px] text-slate-600 italic">Predictive modeling resets in 24h</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

const HealthCard = ({ title, value, subtitle, icon, color, progress }) => {
    const colors = {
        purple: "from-purple-600/20 to-indigo-600/20 border-purple-500/30 text-purple-400 bg-purple-500",
        blue: "from-blue-600/20 to-cyan-600/20 border-blue-500/30 text-blue-400 bg-blue-500",
        red: "from-red-600/20 to-orange-600/20 border-red-500/30 text-red-400 bg-red-500",
        emerald: "from-emerald-600/20 to-teal-600/20 border-emerald-500/30 text-emerald-400 bg-emerald-500",
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color].split(' border')[0]} border ${colors[color].split(' bg')[0].split('border-')[1].split(' ')[0]} rounded-[2rem] p-6 backdrop-blur-3xl shadow-2xl relative overflow-hidden group`}>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 ${colors[color].split(' bg-')[1].split(' ')[0]} bg-${colors[color].split(' bg-')[1].split(' ')[0]} rounded-2xl text-white shadow-lg`}>
                        {icon}
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{title}</span>
                        <div className="text-3xl font-black text-white">{value}</div>
                    </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r from-white to-white/50`}
                    />
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-3 flex items-center gap-1.5 uppercase tracking-tighter">
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {subtitle}
                </div>
            </div>
            {/* Background design elements */}
            <div className="absolute -bottom-8 -right-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                {icon}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, subtitle, icon, color }) => {
    const colors = {
        purple: "bg-purple-500 border-purple-500/20 text-purple-400 shadow-purple-500/5",
        blue: "bg-blue-500 border-blue-500/20 text-blue-400 shadow-blue-500/5",
        red: "bg-red-500 border-red-500/20 text-red-400 shadow-red-500/5",
        emerald: "bg-emerald-500 border-emerald-500/20 text-emerald-400 shadow-emerald-500/5",
    };

    return (
        <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 backdrop-blur-3xl shadow-2xl group hover:bg-slate-900/60 transition-all border-b-2 hover:border-b-white/20">
            <div className="flex items-center gap-4 mb-3">
                <div className={`p-2.5 ${colors[color].split(' ')[0]} bg-opacity-10 rounded-2xl ${colors[color].split(' ')[2]} border border-white/10 group-hover:scale-110 transition-transform shadow-inner`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</div>
                    <div className="text-3xl font-black text-white tabular-nums">{value}</div>
                </div>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1.5 mt-3">
                <ChevronRight size={10} className="text-slate-600" />
                {subtitle}
            </div>
        </div>
    );
};

export default WorkloadWizard;
