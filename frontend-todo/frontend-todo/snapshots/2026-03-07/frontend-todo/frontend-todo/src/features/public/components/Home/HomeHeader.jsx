import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X, LogIn, UserPlus } from 'lucide-react';

const HomeHeader = ({ onSignIn, onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Protocols', href: '#how-it-works' },
    { label: 'Modules', href: '#features' },
    { label: 'Sectors', href: '#for-who' },
    { label: 'Neural Logs', href: '#testimonials' }
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/50 py-3' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
        {/* Core Identity */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/20 group-hover:rotate-12 transition-transform">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <span className="font-black text-2xl text-white uppercase tracking-tighter">
            Towin
          </span>
        </motion.div>

        {/* Tactical Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>

        {/* Action Terminals */}
        <div className="hidden md:flex items-center gap-4">
          <motion.button
            whileHover={{ y: -2 }}
            onClick={onSignIn}
            className="text-slate-400 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <LogIn size={14} />
            Initialize
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGetStarted}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40"
          >
            <UserPlus size={14} />
            Deploy Now
          </motion.button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white p-2 bg-slate-800/50 rounded-lg border border-slate-700/50"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Terminal */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-3xl border-t border-slate-800 overflow-hidden"
          >
            <nav className="flex flex-col p-8 gap-6">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <button
                  onClick={() => { onSignIn(); setIsMenuOpen(false); }}
                  className="px-6 py-4 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { onGetStarted(); setIsMenuOpen(false); }}
                  className="px-6 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl"
                >
                  Get Started
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default HomeHeader;
