interface SideMenuProgressSkeletonProps {
  width?: string;
  stepsCount?: number;
  showAdditionalCards?: boolean;
  className?: string;
}

const SideMenuProgressSkeleton = ({
  width = "w-80",
  stepsCount = 5,
  showAdditionalCards = true,
  className = "",
}: SideMenuProgressSkeletonProps) => {
  const shimmer =
    "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200";

  return (
    <div
      className={`${width} bg-white border-r border-gray-200 p-6 flex-shrink-0 ${className}`}
    >
      {/* Progress Title */}
      <div className="mb-8">
        <div className={`h-6 w-40 rounded ${shimmer} mb-2`}></div>
        <div className={`h-4 w-32 rounded ${shimmer}`}></div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-6">
        {Array.from({ length: stepsCount }).map((_, index) => (
          <div key={index} className="flex items-start">
            {/* Step Circle */}
            <div className="flex flex-col items-center mr-4">
              <div
                className={`w-10 h-10 rounded-full ${shimmer} flex-shrink-0`}
              ></div>
              {index < stepsCount - 1 && (
                <div
                  className={`w-[3px] h-12 rounded-full mt-2 ${shimmer}`}
                ></div>
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 pt-2">
              <div className={`h-4 w-28 rounded ${shimmer} mb-2`}></div>
              <div className={`h-3 w-20 rounded ${shimmer}`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Progress Info */}
      {showAdditionalCards && (
        <div className="mt-8 space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className={`h-4 w-24 rounded ${shimmer} mb-3`}></div>
            <div className={`h-8 w-16 rounded ${shimmer} mb-2`}></div>
            <div className={`h-3 w-20 rounded ${shimmer}`}></div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className={`h-4 w-28 rounded ${shimmer} mb-3`}></div>
            <div className={`h-6 w-20 rounded ${shimmer} mb-2`}></div>
            <div className={`h-3 w-24 rounded ${shimmer}`}></div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className={`h-3 w-16 rounded ${shimmer}`}></div>
          <div className={`h-3 w-8 rounded ${shimmer}`}></div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full w-3/5 ${shimmer}`}></div>
        </div>
      </div>
    </div>
  );
};

export default SideMenuProgressSkeleton;
