import { useEffect } from "react";
import { ArrowLeftIcon, CommentIcon } from "../../../icons";

const ProjectDetailsPageSkeleton = () => {
  useEffect(() => {
    const body = document.body;
    body.style.overflow = "hidden";
    body.style.pointerEvents = "none";
    return () => {
      body.style.overflow = "";
      body.style.pointerEvents = "";
    };
  }, []);

  const shimmer = "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200";

  return (
    <div className="fixed inset-0 z-100 bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`h-8 w-32 rounded ${shimmer}`}></div>
            <div className="flex items-center space-x-2">
              <div className={`h-4 w-20 rounded ${shimmer}`}></div>
              <div className={`h-4 w-4 rounded ${shimmer}`}></div>
              <div className={`h-4 w-24 rounded ${shimmer}`}></div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`h-8 w-8 rounded-full ${shimmer}`}></div>
            <div className={`h-4 w-16 rounded ${shimmer}`}></div>
            <div className={`h-8 w-8 rounded-full ${shimmer}`}></div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - All skeleton during loading */}
        <div className="w-64 bg-white border-r border-gray-200 p-6 flex-shrink-0">
          {/* Sidebar Title */}
          <div className="mb-6">
            <div className={`h-6 w-32 rounded ${shimmer}`}></div>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-4">
            {/* Card 1 */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className={`h-4 w-full rounded ${shimmer} mb-3`}></div>
              <div className={`h-12 w-full rounded ${shimmer} mb-2`}></div>
              <div className={`h-3 w-3/4 rounded ${shimmer}`}></div>
            </div>

            {/* Card 2 */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className={`h-4 w-full rounded ${shimmer} mb-3`}></div>
              <div className={`h-12 w-full rounded ${shimmer} mb-2`}></div>
              <div className={`h-3 w-3/4 rounded ${shimmer}`}></div>
            </div>

            {/* Card 3 */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className={`h-4 w-full rounded ${shimmer} mb-3`}></div>
              <div className={`h-12 w-full rounded ${shimmer} mb-2`}></div>
              <div className={`h-3 w-3/4 rounded ${shimmer}`}></div>
            </div>

            {/* Card 4 */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className={`h-4 w-full rounded ${shimmer} mb-3`}></div>
              <div className={`h-12 w-full rounded ${shimmer} mb-2`}></div>
              <div className={`h-3 w-3/4 rounded ${shimmer}`}></div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="px-6 py-6">
            {/* Header section with back button and title */}
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
              <button
                className="flex items-center justify-center w-full sm:w-fit gap-2 py-2 sm:py-3 h-fit border rounded disabled:opacity-50"
                disabled
              >
                <CommentIcon width={13} height={13} />
                <span>Comment(s)</span>
              </button>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-12 w-12 rounded ${shimmer}`}></div>
                  </div>
                  <div className={`h-8 w-20 rounded mb-2 ${shimmer}`}></div>
                  <div className={`h-4 w-32 rounded ${shimmer}`}></div>
                </div>
              ))}
            </div>

            {/* Project Info Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Project Info</h3>
                
                <div className="flex flex-col lg:flex-row w-full gap-6">
                  {/* Left column */}
                  <div className="border border-gray-200 rounded-lg p-6 flex flex-col gap-5 w-full">
                    {/* Project Name */}
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <div className="text-gray-600 min-w-[140px] text-sm font-medium mb-2 sm:mb-0">
                        Project Name:
                      </div>
                      <div className={`h-4 w-48 rounded ${shimmer}`}></div>
                    </div>
                    
                    {/* Funded By */}
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <div className="text-gray-600 min-w-[140px] text-sm font-medium mb-2 sm:mb-0">
                        Funded By:
                      </div>
                      <div className={`h-4 w-40 rounded ${shimmer}`}></div>
                    </div>
                    
                    {/* Amount */}
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <div className="text-gray-600 min-w-[140px] text-sm font-medium mb-2 sm:mb-0">
                        Amount:
                      </div>
                      <div className={`h-4 w-32 rounded ${shimmer}`}></div>
                    </div>
                    
                    {/* Project End Date */}
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <div className="text-gray-600 min-w-[140px] text-sm font-medium mb-2 sm:mb-0">
                        Project End Date:
                      </div>
                      <div className={`h-4 w-28 rounded ${shimmer}`}></div>
                    </div>
                  </div>
                  
                  {/* Right column */}
                  <div className="border border-gray-200 rounded-lg p-6 flex flex-col gap-5 w-full">
                    {/* Project Reference */}
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <div className="text-gray-600 min-w-[140px] text-sm font-medium mb-2 sm:mb-0">
                        Project Reference:
                      </div>
                      <div className={`h-4 w-36 rounded ${shimmer}`}></div>
                    </div>
                    
                    {/* Project Begin Date */}
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <div className="text-gray-600 min-w-[140px] text-sm font-medium mb-2 sm:mb-0">
                        Project Begin Date:
                      </div>
                      <div className={`h-4 w-28 rounded ${shimmer}`}></div>
                    </div>
                    
                    {/* Description */}
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <div className="text-gray-600 min-w-[140px] text-sm font-medium mb-2 sm:mb-0">
                        Description:
                      </div>
                      <div className="flex-1">
                        <div className={`h-4 w-full rounded ${shimmer} mb-2`}></div>
                        <div className={`h-4 w-3/4 rounded ${shimmer}`}></div>
                      </div>
                    </div>
                    
                    {/* Uploaded Files */}
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <div className="text-gray-600 min-w-[140px] text-sm font-medium mb-2 sm:mb-0">
                        Uploaded Files:
                      </div>
                      <div className="flex gap-2">
                        <div className={`h-6 w-16 rounded ${shimmer}`}></div>
                        <div className={`h-6 w-20 rounded ${shimmer}`}></div>
                        <div className={`h-6 w-18 rounded ${shimmer}`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Location</h3>
              </div>
              <div className="px-6 pb-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">Sr No</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">Country</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">Province</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">City</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">Municipality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 3 }).map((_, index) => (
                        <tr key={index}>
                          <td className="border border-gray-200 px-4 py-3">
                            <div className={`h-4 w-6 rounded ${shimmer}`}></div>
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            <div className={`h-4 w-24 rounded ${shimmer}`}></div>
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            <div className={`h-4 w-16 rounded ${shimmer}`}></div>
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Contracts Section */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Contracts</h3>
              </div>
              <div className="px-6 pb-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">Sr No</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">Signed By</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">Position</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">Amount by Contract</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">Date Created</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">No of Request</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 4 }).map((_, index) => (
                        <tr key={index}>
                          <td className="border border-gray-200 px-4 py-3">
                            <div className={`h-4 w-6 rounded ${shimmer}`}></div>
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            <div className={`h-4 w-24 rounded ${shimmer}`}></div>
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            <div className={`h-4 w-8 rounded ${shimmer}`}></div>
                          </td>
                          <td className="border border-gray-200 px-4 py-3">
                            <div className={`h-8 w-8 rounded-md ${shimmer}`}></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPageSkeleton;
