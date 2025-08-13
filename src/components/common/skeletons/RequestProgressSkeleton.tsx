const RequestProgressSkeleton = () => {
  const shimmer = "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200";

  return (
    <div className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100/50 backdrop-blur-sm">
      {/* Title Skeleton */}
      <div className={`h-6 w-32 rounded ${shimmer} mb-8`}></div>

      {/* Progress Steps */}
      <div className="relative">
        <div className="space-y-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex items-start group">
              <div className="relative flex flex-col items-center mr-4">
                {/* Step Indicator */}
                <div className="relative z-10">
                  <div className={`w-10 h-10 rounded-full ${shimmer} flex-shrink-0`}></div>
                </div>

                {index < 9 && (
                  <div className={`w-[3px] h-12 mt-2 rounded-full ${shimmer}`}></div>
                )}
              </div>
              
              {/* Step Content */}
              <div className="flex-1 pt-2">
                <div className={`h-4 w-32 rounded ${shimmer} mb-2`}></div>
                <div className={`h-3 w-24 rounded ${shimmer}`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Progress Info */}
      <div className="mt-8 space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className={`h-4 w-20 rounded ${shimmer} mb-3`}></div>
          <div className={`h-8 w-12 rounded ${shimmer} mb-2`}></div>
          <div className={`h-3 w-16 rounded ${shimmer}`}></div>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className={`h-4 w-24 rounded ${shimmer} mb-3`}></div>
          <div className={`h-6 w-16 rounded ${shimmer} mb-2`}></div>
          <div className={`h-3 w-20 rounded ${shimmer}`}></div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className={`h-3 w-16 rounded ${shimmer}`}></div>
          <div className={`h-3 w-8 rounded ${shimmer}`}></div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full w-1/5 ${shimmer}`}></div>
        </div>
      </div>
    </div>
  );
};

export default RequestProgressSkeleton;
