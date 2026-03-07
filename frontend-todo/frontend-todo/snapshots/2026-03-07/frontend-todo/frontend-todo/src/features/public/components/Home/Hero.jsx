import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, LogIn, Zap, CheckCircle2 } from 'lucide-react';

const Hero = ({ onGetStarted, onSignIn }) => {
  return (
    <section className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-40 lg:pt-32">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        {/* Intelligence Module */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 bg-blue-600/10 rounded-full px-5 py-2 mb-10 border border-blue-500/20 backdrop-blur-md"
          >
            <Sparkles size={14} className="text-blue-400" />
            <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em]">Operational Status: Optimal</span>
          </motion.div>

          {/* Primary Command */}
          <h1 className="text-6xl lg:text-8xl font-black leading-[0.9] text-white uppercase tracking-tighter mb-8">
            Master the
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Execution Logic
            </span>
          </h1>

          <p className="text-lg font-medium text-slate-400 max-w-xl leading-relaxed mb-12">
            Transcend traditional task management. Towin integrates neural learning workflows, algorithmic planning, and collaborative protocols for the modern doer.
          </p>

          {/* Activation Buttons */}
          <div className="flex flex-wrap gap-5">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/40 group"
            >
              Get Started
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignIn}
              className="bg-slate-900/50 border border-slate-700/50 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center gap-3 backdrop-blur-md"
            >
              <LogIn size={18} />
              Auth Sync
            </motion.button>
          </div>

          {/* Telemetry Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6">
            {[
              { label: 'Active Nodes', val: '10k+' },
              { label: 'Success Variance', val: '94%' },
              { label: 'Uptime', val: '24/7' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10"
              >
                <div className="text-2xl font-black text-white tracking-tighter mb-1">{stat.val}</div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Visual Engine Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative perspective-2000 hidden lg:block"
        >
          <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-slate-700/50 rounded-[2.5rem] p-8 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
             {/* Glowing Core */}
             <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[80px]" />
             <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[80px]" />

             <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                   <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-500/50 rounded-full" />
                      <div className="w-3 h-3 bg-amber-500/50 rounded-full" />
                      <div className="w-3 h-3 bg-emerald-500/50 rounded-full" />
                   </div>
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol: DSA_LEARNING_PATH</div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                   <div className="bg-gradient-to-br from-blue-600/20 to-transparent p-5 rounded-3xl border border-blue-500/20">
                      <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Throughput</div>
                      <div className="text-4xl font-black text-white tracking-tighter">64%</div>
                   </div>
                   <div className="bg-gradient-to-br from-purple-600/20 to-transparent p-5 rounded-3xl border border-purple-500/20">
                      <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Directives</div>
                      <div className="text-4xl font-black text-white tracking-tighter">18/28</div>
                   </div>
                </div>

                <div className="space-y-4">
                   {[
                      { label: 'Arrays & Strings', status: 'COMPLETED', color: 'emerald' },
                      { label: 'Linked Lists', status: 'IN_PROGRESS', color: 'blue' },
                      { label: 'Trees & Graphs', status: 'QUEUED', color: 'slate' }
                   ].map((item, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ x: 10 }}
                        className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30"
                      >
                         <div className={`w-2 h-2 rounded-full bg-${item.color}-500 shadow-[0_0_10px_rgba(var(--${item.color}-500),0.5)]`} />
                         <span className="flex-1 text-sm font-black text-white uppercase tracking-tight">{item.label}</span>
                         <span className={`text-[9px] font-black text-${item.color}-500 uppercase tracking-widest`}>{item.status}</span>
                      </motion.div>
                   ))}
                </div>
             </div>

             <motion.div
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 3, repeat: Infinity }}
               className="absolute top-10 right-10 p-4 bg-blue-600 rounded-2xl shadow-2xl rotate-12"
             >
               <Zap size={24} className="text-white fill-white" />
             </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
