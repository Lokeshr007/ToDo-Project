import React from 'react';

const TodoSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-950 p-8 sm:p-12">
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="flex justify-between items-center mb-12">
           <div className="space-y-3">
              <div className="h-10 w-64 bg-slate-900 rounded-2xl" />
              <div className="h-3 w-40 bg-slate-900/50 rounded-full" />
           </div>
           <div className="h-14 w-48 bg-slate-900 rounded-2xl" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
           {[1,2,3,4].map(i => (
              <div key={i} className="h-12 bg-slate-900 rounded-xl" />
           ))}
        </div>
        
        <div className="space-y-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-32 bg-slate-900/40 rounded-[2rem] border border-slate-900" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodoSkeleton;
