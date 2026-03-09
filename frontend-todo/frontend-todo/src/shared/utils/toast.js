// src/shared/utils/taskToast.js
// TaskFlow toast bridge — drop-in replacement for both sonner and react-hot-toast
// Import this everywhere instead of 'sonner' or 'react-hot-toast'
import { taskToast } from '@/shared/components/QuantumToaster';

// Callable as toast("msg") or taskToast.success("msg"), etc.
export function toast(message, opts = {}) {
  taskToast.info(message, opts);
}

const toastProxy = {
  success: (message, opts = {}) => taskToast.success(message, opts),
  error: (message, opts = {}) => taskToast.error(message, opts),
  warning: (message, opts = {}) => taskToast.warning(message, opts),
  info: (message, opts = {}) => taskToast.info(message, opts),
  loading: (message, opts = {}) => taskToast.loading(message, opts),
  promise: (p, msgs) => taskToast.promise(p, msgs),
  dismiss: (id) => taskToast.dismiss(id),
};

// Sonner Toaster compatibility (QuantumToaster handles rendering itself via portal)
export const Toaster = () => null;

export { toastProxy as taskToast };
export default toast;

