// frontend/src/features/profile/modals/DeleteAccountModal.jsx
import { AlertTriangle } from "lucide-react";

function DeleteAccountModal({ email, deleteConfirm, setDeleteConfirm, onDelete, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4 text-red-600">
          <AlertTriangle size={24} />
          <h3 className="text-lg font-bold">Delete Account</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          This action is permanent and cannot be undone. All your data will be permanently deleted.
        </p>
        
        <p className="text-sm text-gray-500 mb-2">
          Please type <span className="font-mono font-bold">{email}</span> to confirm:
        </p>
        
        <input
          type="text"
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
          placeholder={email}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            disabled={deleteConfirm !== email}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccountModal;
