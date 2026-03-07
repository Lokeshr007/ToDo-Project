// src/shared/utils/toast.js
// TaskFlow toast bridge — drop-in replacement for both sonner and react-hot-toast
// Import this everywhere instead of 'sonner' or 'react-hot-toast'
import { taskToast } from '@/shared/components/QuantumToaster';

// Callable as toast("msg") or toast.success("msg"), etc.
export function toast(message, opts = {}) {
  taskToast.info(message, opts);
}

toast.success = (message, opts = {}) => taskToast.success(message, opts);
toast.error = (message, opts = {}) => taskToast.error(message, opts);
toast.warning = (message, opts = {}) => taskToast.warning(message, opts);
toast.info = (message, opts = {}) => taskToast.info(message, opts);
toast.loading = (message, opts = {}) => taskToast.loading(message, opts);
toast.promise = (p, msgs) => taskToast.promise(p, msgs);
toast.dismiss = (id) => taskToast.dismiss(id);

// Sonner Toaster compatibility (QuantumToaster handles rendering itself via portal)
export const Toaster = () => null;

export default toast;
