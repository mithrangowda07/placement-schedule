import React from 'react';

export const CompanyCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-200"></div>
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-slate-200 rounded-md w-1/3"></div>
          <div className="h-3 bg-slate-200 rounded-md w-1/2"></div>
        </div>
      </div>
      <div className="h-4 bg-slate-200 rounded-md w-full"></div>
      <div className="h-4 bg-slate-200 rounded-md w-4/5"></div>
      <div className="h-16 bg-slate-100 rounded-xl"></div>
      <div className="flex gap-2 pt-2">
        <div className="h-9 bg-slate-200 rounded-xl flex-1"></div>
        <div className="h-9 bg-slate-200 rounded-xl flex-1"></div>
      </div>
    </div>
  );
};

export const CompanySkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CompanyCardSkeleton key={i} />
      ))}
    </div>
  );
};
