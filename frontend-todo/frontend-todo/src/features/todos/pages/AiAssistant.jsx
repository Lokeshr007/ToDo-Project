// src/pages/Discoveries.jsx
function DiscoveriesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-slate-900 mb-2">Discoveries</h1>
      <p className="text-slate-500 mb-8">
        Things you've uncovered on your journey
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sample discovery cards - will be populated from backend */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-medium text-slate-900 mb-2">Eiffel Tower Facts</h3>
          <p className="text-sm text-slate-500">Discovered by completing "Visit Paris"</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-medium text-slate-900 mb-2">Alpine Wildlife</h3>
          <p className="text-sm text-slate-500">Discovered by completing "Hike in Alps"</p>
        </div>
      </div>
    </div>
  );
}

export default DiscoveriesPage;
