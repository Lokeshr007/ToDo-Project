// frontend/src/features/profile/components/sidebar/QuickActions.jsx
import { Download, Trash2, Loader } from "lucide-react";

function QuickActions({ exportData, exportLoading, setShowDeleteModal }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="space-y-3">
        <button
          onClick={exportData}
          disabled={exportLoading}
          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors disabled:opacity-50"
        >
          {exportLoading ? (
            <Loader size={18} className="text-gray-600 animate-spin" />
          ) : (
            <Download size={18} className="text-gray-600" />
          )}
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">
              {exportLoading ? 'Exporting...' : 'Export Data'}
            </p>
            <p className="text-xs text-gray-500">Download your data</p>
          </div>
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-3 transition-colors"
        >
          <Trash2 size={18} className="text-red-600" />
          <div className="text-left">
            <p className="text-sm font-medium text-red-900">Delete Account</p>
            <p className="text-xs text-red-500">Permanently delete account</p>
          </div>
        </button>
      </div>
    </div>
  );
}

export default QuickActions;