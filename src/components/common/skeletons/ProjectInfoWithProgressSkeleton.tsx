import { useEffect } from "react";
import { ArrowLeftIcon } from "../../../icons";
import SideMenuProgressSkeleton from "./SideMenuProgressSkeleton";

const ProjectInfoWithProgressSkeleton = () => {
  useEffect(() => {
    const body = document.body;
    body.style.overflow = "hidden";
    body.style.pointerEvents = "none";
    return () => {
      body.style.overflow = "";
      body.style.pointerEvents = "";
    };
  }, []);

  const shimmer =
    "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200";

  return (
    <div className="fixed inset-0 z-100 bg-white">
      <div className="min-h-screen flex">
        {/* Side Menu - Stage Progress Skeleton */}
        <SideMenuProgressSkeleton
          width="w-72"
          stepsCount={6}
          showAdditionalCards={false}
          className="border-r-2"
        />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 bg-gray-50">
          <div className="relative px-4 sm:px-6 md:px-8 py-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start lg:items-center gap-4 mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 cursor-pointer mb-3">
                  <ArrowLeftIcon
                    width={16}
                    height={16}
                    className="text-primary-150 flex-shrink-0"
                  />
                  <span className="text-base font-semibold text-primary-150">
                    Back to Dashboard
                  </span>
                </div>
                <div className={`h-8 w-80 rounded mb-2 ${shimmer}`}></div>
                <div className={`h-4 w-64 rounded ${shimmer}`}></div>
              </div>
              {/* Comment button skeleton */}
              <div className={`h-10 w-32 rounded ${shimmer}`}></div>
            </div>

            {/* Project Info Section - matches the image layout */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <h3 className="text-base font-bold mb-6">Project Info</h3>

                <div className="flex flex-col lg:flex-row w-full gap-6">
                  {/* Left column */}
                  <div className="border border-gray-200 rounded-lg p-6 flex flex-col gap-5 w-full">
                    {/* Project Name */}
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <div className="text-gray-600 min-w-[140px] text-sm font-medium">
                        Project Name:
                      </div>
                      <div className={`h-4 w-48 rounded ${shimmer}`}></div>
                    </div>

                    {/* Funded By */}
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <div className="text-gray-600 min-w-[140px] text-sm font-medium">
                        Funded By:
                      </div>
                      <div className={`h-4 w-40 rounded ${shimmer}`}></div>
                    </div>

                    {/* Amount */}
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <div className="text-gray-600 min-w-[140px] text-sm font-medium">
                        Amount:
                      </div>
                      <div className={`h-4 w-32 rounded ${shimmer}`}></div>
                    </div>

                    {/* Project End Date */}
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <div className="text-gray-600 min-w-[140px] text-sm font-medium">
                        Project End Date:
                      </div>
                      <div className={`h-4 w-28 rounded ${shimmer}`}></div>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="border border-gray-200 rounded-lg p-6 flex flex-col gap-5 w-full">
                    {/* Project Reference */}
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <div className="text-gray-600 min-w-[140px] text-sm font-medium">
                        Project Reference:
                      </div>
                      <div className={`h-4 w-36 rounded ${shimmer}`}></div>
                    </div>

                    {/* Project Begin Date */}
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <div className="text-gray-600 min-w-[140px] text-sm font-medium">
                        Project Begin Date:
                      </div>
                      <div className={`h-4 w-28 rounded ${shimmer}`}></div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <div className="text-gray-600 min-w-[140px] text-sm font-medium">
                        Description:
                      </div>
                      <div className="flex-1">
                        <div
                          className={`h-4 w-full rounded ${shimmer} mb-2`}
                        ></div>
                        <div className={`h-4 w-3/4 rounded ${shimmer}`}></div>
                      </div>
                    </div>

                    {/* Uploaded Files */}
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <div className="text-gray-600 min-w-[140px] text-sm font-medium">
                        Uploaded Files:
                      </div>
                      <div className="flex gap-2">
                        <div className={`h-6 w-16 rounded ${shimmer}`}></div>
                        <div className={`h-6 w-20 rounded ${shimmer}`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional sections that might be present */}
            <div className="mt-6 space-y-6">
              {/* Placeholder for other sections */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className={`h-6 w-32 rounded mb-4 ${shimmer}`}></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`h-20 w-full rounded ${shimmer}`}></div>
                  <div className={`h-20 w-full rounded ${shimmer}`}></div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className={`h-6 w-40 rounded mb-4 ${shimmer}`}></div>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`h-4 w-4 rounded ${shimmer}`}></div>
                      <div className={`h-4 flex-1 rounded ${shimmer}`}></div>
                      <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoWithProgressSkeleton;
