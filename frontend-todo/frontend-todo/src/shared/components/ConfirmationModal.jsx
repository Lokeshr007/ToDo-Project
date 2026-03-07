import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger", isLoading = false }) => {
  if (!isOpen) return null;

  const themes = {
    danger: {
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      icon: "text-red-400",
      button: "bg-red-600 hover:bg-red-500 shadow-red-600/20",
    },
    warning: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      icon: "text-yellow-400",
      button: "bg-yellow-600 hover:bg-yellow-500 shadow-yellow-600/20",
    },
    info: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      icon: "text-blue-400",
      button: "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20",
    }
  };

  const theme = themes[type] || themes.danger;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-2xl overflow-hidden"
          >
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${theme.bg} rounded-full -mr-16 -mt-16 blur-3xl`} />
            
            <div className="relative flex flex-col items-center text-center">
              <div className={`mb-4 p-4 ${theme.bg} rounded-2xl border ${theme.border}`}>
                <AlertCircle size={32} className={theme.icon} />
              </div>
              
              <h2 className="text-xl font-black text-white mb-2">{title}</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                {message}
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm transition-all border border-white/5"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-3 ${theme.button} text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2`}
                >
                  {isLoading && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />}
                  {confirmText}
                </button>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
