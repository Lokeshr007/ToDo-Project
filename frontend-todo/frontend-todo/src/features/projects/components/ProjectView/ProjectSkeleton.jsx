import React from 'react';

const ProjectSkeleton = ({ themeStyles }) => {
  const styles = themeStyles || {
    bg: 'bg-slate-900',
    card: 'bg-slate-800/40',
    border: 'border-slate-700/50',
  };

  return (
    <div className={`min-h-screen ${styles.bg} p-4 sm:p-8 pt-24`}>
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="space-y-3">
            <div className="h-10 w-64 bg-slate-800 rounded-2xl" />
            <div className="h-4 w-80 bg-slate-800 rounded-xl" />
          </div>
          <div className="flex gap-4">
            <div className="h-12 w-32 bg-slate-800 rounded-2xl" />
            <div className="h-12 w-12 bg-slate-800 rounded-2xl" />
            <div className="h-12 w-12 bg-slate-800 rounded-2xl" />
          </div>
        </div>
        
        <div className="flex gap-8 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-shrink-0 w-85">
              <div className={`h-[500px] ${styles.card} rounded-3xl p-6 border ${styles.border}`}>
                <div className="flex justify-between items-center mb-8">
                  <div className="h-6 w-32 bg-slate-800 rounded-xl" />
                  <div className="h-6 w-8 bg-slate-800 rounded-lg" />
                </div>
                <div className="space-y-5">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="h-28 bg-slate-800/50 rounded-2xl border border-slate-700/30" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectSkeleton;
