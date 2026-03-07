import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';

const CTA = ({ onGetStarted }) => {
  return (
    <section className="py-40 relative px-6">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-slate-900 border border-slate-700/50 rounded-[3rem] p-12 lg:p-24 text-center shadow-[0_0_100px_rgba(37,99,235,0.1)] relative overflow-hidden"
        >
          {/* Internal Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]" />
          
          <h2 className="text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-8">
            Initialize Your 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Execution Path
            </span>
          </h2>

          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium">
            Join the nexus of high-throughput achievers who have evolved from passive planning to active success.
          </p>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="bg-blue-600 text-white px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center gap-4 mx-auto hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/40"
          >
            Deploy My System
            <ArrowRight size={20} />
          </motion.button>

          <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-40">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-blue-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Free Tier: Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-blue-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Sync: Enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-blue-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantum Security</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
