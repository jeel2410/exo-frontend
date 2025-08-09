import { useEffect } from "react";

interface SkeletonLoaderProps {
  variant?: "page" | "card" | "table" | "dashboard";
}

const SkeletonLoader = ({ variant = "page" }: SkeletonLoaderProps) => {
  useEffect(() => {
    const body = document.body;

    // Disable scroll and pointer events
    body.style.overflow = "hidden";
    body.style.pointerEvents = "none";

    return () => {
      // Cleanup on unmount
      body.style.overflow = "";
      body.style.pointerEvents = "";
    };
  }, []);

  const useShimmer = "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200";

  const renderPageSkeleton = () => (
    <div className="fixed inset-0 z-100 bg-white">
      <div className="min-h-screen p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className={`h-8 w-48 rounded ${useShimmer}`}></div>
          <div className="flex space-x-4">
            <div className={`h-8 w-8 rounded-full ${useShimmer}`}></div>
            <div className={`h-8 w-8 rounded-full ${useShimmer}`}></div>
            <div className={`h-8 w-24 rounded ${useShimmer}`}></div>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`h-6 w-32 rounded ${useShimmer}`}></div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`h-4 w-full rounded ${useShimmer}`}></div>
            ))}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title */}
            <div className={`h-8 w-64 rounded ${useShimmer}`}></div>
            
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <div className={`h-4 w-3/4 rounded ${useShimmer}`}></div>
                  <div className={`h-3 w-full rounded ${useShimmer}`}></div>
                  <div className={`h-3 w-2/3 rounded ${useShimmer}`}></div>
                  <div className="flex justify-between items-center mt-4">
                    <div className={`h-6 w-16 rounded ${useShimmer}`}></div>
                    <div className={`h-8 w-20 rounded ${useShimmer}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCardSkeleton = () => (
    <div className="fixed inset-0 z-100 bg-white/60 backdrop-blur-sm">
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl space-y-4">
          <div className={`h-6 w-48 rounded ${useShimmer}`}></div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className={`h-4 w-1/4 rounded ${useShimmer}`}></div>
              <div className={`h-10 w-full rounded ${useShimmer}`}></div>
            </div>
          ))}
          <div className="flex justify-end space-x-3 pt-4">
            <div className={`h-10 w-24 rounded ${useShimmer}`}></div>
            <div className={`h-10 w-24 rounded ${useShimmer}`}></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="fixed inset-0 z-100 bg-white">
      <div className="min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className={`h-8 w-48 rounded ${useShimmer}`}></div>
          <div className={`h-10 w-32 rounded ${useShimmer}`}></div>
        </div>

        {/* Table Header */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex border-b p-4 space-x-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`h-4 flex-1 rounded ${useShimmer}`}></div>
            ))}
          </div>
          
          {/* Table Rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex border-b p-4 space-x-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className={`h-4 flex-1 rounded ${useShimmer}`}></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDashboardSkeleton = () => (
    <div className="fixed inset-0 z-100 bg-white">
      <div className="min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className={`h-8 w-48 rounded ${useShimmer}`}></div>
          <div className="flex space-x-4">
            <div className={`h-8 w-8 rounded-full ${useShimmer}`}></div>
            <div className={`h-8 w-24 rounded ${useShimmer}`}></div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className={`h-4 w-24 rounded ${useShimmer}`}></div>
                <div className={`h-8 w-8 rounded ${useShimmer}`}></div>
              </div>
              <div className={`h-8 w-16 rounded ${useShimmer}`}></div>
              <div className={`h-3 w-20 rounded ${useShimmer}`}></div>
            </div>
          ))}
        </div>

        {/* Charts/Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className={`h-6 w-32 rounded mb-4 ${useShimmer}`}></div>
            <div className={`h-64 w-full rounded ${useShimmer}`}></div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className={`h-6 w-32 rounded ${useShimmer}`}></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className={`h-10 w-10 rounded-full ${useShimmer}`}></div>
                <div className="flex-1 space-y-2">
                  <div className={`h-4 w-3/4 rounded ${useShimmer}`}></div>
                  <div className={`h-3 w-1/2 rounded ${useShimmer}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case "card":
      return renderCardSkeleton();
    case "table":
      return renderTableSkeleton();
    case "dashboard":
      return renderDashboardSkeleton();
    default:
      return renderPageSkeleton();
  }
};

export default SkeletonLoader;
