// src/shared/components/QuantumToaster.jsx
// Nebula Activity Log: A bottom-right holographic system log that replaces traditional toasts.
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  Sparkles,
  X,
  Bell,
  Activity,
  Zap,
  Terminal
} from 'lucide-react';

const subscribers = new Set();

export const taskToast = {
  success: (message, opts = {}) => emit('success', message, opts),
  error: (message, opts = {}) => emit('error', message, opts),
  warning: (message, opts = {}) => emit('warning', message, opts),
  info: (message, opts = {}) => emit('info', message, opts),
  loading: (message, opts = {}) => emit('loading', message, { ...opts, persist: true }),
  promise: async (promise, msgs = {}) => {
    const id = emit('loading', msgs.loading || 'Neural Link Establishing...', { persist: true });
    try {
      const result = await promise;
      dismiss(id);
      emit('success', msgs.success || 'Link Stable');
      return result;
    } catch (err) {
      dismiss(id);
      emit('error', msgs.error || 'Link Severed');
      throw err;
    }
  },
  dismiss: (id) => dismiss(id),
};

let uid = 0;
function emit(type, message, opts = {}) {
  const id = `nebula-${++uid}`;
  subscribers.forEach(fn => fn({ 
    id, 
    type, 
    message, 
    description: opts.description, 
    persist: opts.persist || false,
    duration: opts.duration || 5000 
  }));
  return id;
}

function dismiss(id) {
  subscribers.forEach(fn => fn({ id, _dismiss: true }));
}

const THEMES = {
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    glow: 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]',
    tag: 'SUCCESS'
  },
  error: {
    icon: XCircle,
    color: 'text-rose-400',
    border: 'border-rose-500/20',
    glow: 'shadow-[0_0_15px_-3px_rgba(244,63,94,0.2)]',
    tag: 'CRITICAL'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    border: 'border-amber-500/20',
    glow: 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]',
    tag: 'WARNING'
  },
  info: {
    icon: Zap,
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    glow: 'shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]',
    tag: 'INFO'
  },
  loading: {
    icon: Loader2,
    color: 'text-purple-400',
    border: 'border-purple-500/20',
    glow: 'shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]',
    tag: 'PENDING',
    animate: true
  },
};

function LogItem({ item, onDismiss }) {
  const theme = THEMES[item.type] || THEMES.info;
  const Icon = theme.icon;

  useEffect(() => {
    if (item.persist) return;
    const t = setTimeout(() => onDismiss(item.id), item.duration);
    return () => clearTimeout(t);
  }, [item.id, item.persist, item.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9, height: 0, marginBottom: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className={`
        mb-3 w-80 overflow-hidden
        bg-slate-900/40 backdrop-blur-xl border-l-2 ${theme.border}
        rounded-l-xl p-4 flex gap-4 items-start
        relative group hover:bg-slate-900/60 transition-all duration-300
      `}
    >
      <div className={`mt-0.5 shrink-0 ${theme.animate ? 'animate-spin' : ''}`}>
        <Icon size={16} className={theme.color} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[10px] font-black font-mono tracking-tighter ${theme.color}`}>
            [{theme.tag}]
          </span>
          <span className="text-[9px] text-slate-600 font-mono">
            {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-300 leading-tight">
          {item.message}
        </p>
        {item.description && (
          <p className="text-xs text-slate-500 mt-1 italic line-clamp-2">
            {item.description}
          </p>
        )}
      </div>

      <button
        onClick={() => onDismiss(item.id)}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded text-slate-600 hover:text-white transition-all"
      >
        <X size={12} />
      </button>

      {/* Holographic scanning line effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-1/2 w-full pointer-events-none"
        animate={{ y: ['-100%', '200%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  );
}

export default function QuantumToaster() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const handler = (event) => {
      if (event._dismiss) {
        setItems(prev => prev.filter(i => i.id !== event.id));
      } else {
        setItems(prev => [event, ...prev].slice(0, 5));
      }
    };
    subscribers.add(handler);
    return () => subscribers.delete(handler);
  }, []);

  const dismiss = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  if (items.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-6 right-0 z-[10000] flex flex-col items-end pointer-events-none">
      <div className="pr-4 mb-2 flex items-center gap-2 text-slate-500">
        <Terminal size={12} />
        <span className="text-[10px] font-black uppercase tracking-widest font-mono">Activity Log</span>
      </div>
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <LogItem 
            key={item.id} 
            item={item} 
            onDismiss={dismiss} 
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
