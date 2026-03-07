// src/shared/components/QuantumToaster.jsx
// Quantum Status HUD: A premium, centralized notification system that replaces traditional toasts.
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
  Bell
} from 'lucide-react';

// ── Shared Event Bus ────────────────────────────────────────────────────────
const subscribers = new Set();

export const taskToast = {
  success: (message, opts = {}) => emit('success', message, opts),
  error: (message, opts = {}) => emit('error', message, opts),
  warning: (message, opts = {}) => emit('warning', message, opts),
  info: (message, opts = {}) => emit('info', message, opts),
  loading: (message, opts = {}) => emit('loading', message, { ...opts, persist: true }),
  promise: async (promise, msgs = {}) => {
    const id = emit('loading', msgs.loading || 'Quantum Processing...', { persist: true });
    try {
      const result = await promise;
      dismiss(id);
      emit('success', msgs.success || 'Operation Successful');
      return result;
    } catch (err) {
      dismiss(id);
      emit('error', msgs.error || 'Operation Failed');
      throw err;
    }
  },
  dismiss: (id) => dismiss(id),
};

let uid = 0;
function emit(type, message, opts = {}) {
  const id = `q-hud-${++uid}`;
  subscribers.forEach(fn => fn({ 
    id, 
    type, 
    message, 
    description: opts.description, 
    persist: opts.persist || false,
    duration: opts.duration || 4000 
  }));
  return id;
}

function dismiss(id) {
  subscribers.forEach(fn => fn({ id, _dismiss: true }));
}

// ── Theme Config ───────────────────────────────────────────────────────────
const THEMES = {
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_20px_-3px_rgba(16,185,129,0.3)]',
    label: 'Done',
  },
  error: {
    icon: XCircle,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    glow: 'shadow-[0_0_20px_-3px_rgba(244,63,94,0.3)]',
    label: 'Alert',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_20px_-3px_rgba(245,158,11,0.3)]',
    label: 'Notice',
  },
  info: {
    icon: Sparkles,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    glow: 'shadow-[0_0_20px_-3px_rgba(99,102,241,0.3)]',
    label: 'System',
  },
  loading: {
    icon: Loader2,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    glow: 'shadow-[0_0_20px_-3px_rgba(168,85,247,0.3)]',
    label: 'Syncing',
    animate: true,
  },
};

// ── HUD Item ────────────────────────────────────────────────────────────────
function HUDItem({ item, onDismiss, index, isTop }) {
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
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ 
        opacity: isTop ? 1 : 0.4, 
        y: index * 10, 
        scale: isTop ? 1 : 0.95 - (index * 0.05),
        zIndex: 100 - index
      }}
      exit={{ opacity: 0, scale: 0.8, y: -40 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`
        pointer-events-auto relative
        flex items-center gap-4 min-w-[320px] max-w-md
        px-6 py-4 rounded-3xl
        bg-slate-900/80 backdrop-blur-2xl border ${theme.border}
        ${theme.glow}
        transition-all duration-500
      `}
    >
      <div className={`shrink-0 ${theme.animate ? 'animate-spin' : ''}`}>
        <Icon size={20} className={theme.color} />
      </div>
      
      <div className="flex-1 min-w-0">
        <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-0.5">
          {theme.label}
        </label>
        <p className="text-sm font-medium text-slate-100 leading-tight truncate">
          {item.message}
        </p>
      </div>

      {isTop && (
        <button
          onClick={() => onDismiss(item.id)}
          className="shrink-0 p-1.5 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      )}

      {/* Unique Pulse Effect for top item */}
      {isTop && (
        <motion.div 
          className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none"
          animate={{ opacity: [0, 0.5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

// ── Quantum Status HUD Root ──────────────────────────────────────────────────
export default function QuantumToaster() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const handler = (event) => {
      if (event._dismiss) {
        setItems(prev => prev.filter(i => i.id !== event.id));
      } else {
        setItems(prev => {
          const filtered = prev.filter(i => i.message !== event.message);
          return [event, ...filtered].slice(0, 3);
        });
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
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[10000] flex flex-col items-center pointer-events-none perspective-1000">
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <HUDItem 
            key={item.id} 
            item={item} 
            index={index} 
            isTop={index === 0} 
            onDismiss={dismiss} 
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
