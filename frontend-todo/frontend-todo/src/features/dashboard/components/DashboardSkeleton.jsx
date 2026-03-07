/**
 * Skeleton Loader for Dashboard page.
 */
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-4 sm:p-6">
      <div className="animate-pulse">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 w-64 bg-slate-700 rounded mb-2" />
          <div className="h-4 w-96 bg-slate-700 rounded" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-800/50 rounded-xl border border-slate-700" />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-slate-800/50 rounded-xl border border-slate-700" />
            <div className="h-96 bg-slate-800/50 rounded-xl border border-slate-700" />
          </div>
          <div className="space-y-6">
            <div className="h-80 bg-slate-800/50 rounded-xl border border-slate-700" />
            <div className="h-96 bg-slate-800/50 rounded-xl border border-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;
