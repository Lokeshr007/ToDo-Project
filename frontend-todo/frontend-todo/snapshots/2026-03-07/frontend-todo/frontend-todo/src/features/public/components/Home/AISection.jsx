import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

const AISection = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-40 bg-slate-900 relative overflow-hidden"
    >
      {/* Neural Core Animation */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse-slow" />
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-6 py-2.5 mb-10 border border-white/20"
        >
          <BrainCircuit size={18} className="text-blue-400" />
          <span className="text-[10px] text-white font-black uppercase tracking-[0.3em]">Advanced Neural Assist</span>
        </motion.div>

        <h2 className="text-6xl lg:text-8xl font-black mb-8 text-white uppercase tracking-tighter leading-[0.9]">
          Intelligence Beyond 
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
             Simple Todos
          </span>
        </h2>

        <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
          Not AI for optics. Real heuristic assistance that decomposes goals, predicts velocity, identifies bottlenecks, and adapts to your unique cognitive rhythm.
        </p>

        <div className="mt-16 flex justify-center gap-10 opacity-50">
           <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Processing Logic</span>
              <div className="h-1 w-20 bg-slate-800 rounded-full overflow-hidden">
                 <motion.div 
                   animate={{ x: [-80, 80] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="h-full w-10 bg-blue-500" 
                 />
              </div>
           </div>
           <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Linkage</span>
              <div className="h-1 w-20 bg-slate-800 rounded-full overflow-hidden">
                 <motion.div 
                   animate={{ x: [80, -80] }}
                   transition={{ duration: 1.5, repeat: Infinity }}
                   className="h-full w-10 bg-purple-500" 
                 />
              </div>
           </div>
        </div>
      </div>
    </motion.section>
  );
};

export default AISection;
