import { useEffect } from "react";
import { ArrowLeftIcon, CommentIcon } from "../../../icons";

const ProjectDetailsSkeleton = () => {
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
    <div className="fixed inset-0 z-100 bg-white">
      <div className="min-h-screen">
        <div className="relative px-4 sm:px-6 md:px-8 py-6">
          {/* Header section - keep static back button, skeleton for dynamic title */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start lg:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 cursor-pointer mb-2">
                <ArrowLeftIcon
                  width={16}
                  height={16}
                  className="text-primary-150 flex-shrink-0"
                />
                <span className="text-base font-semibold text-primary-150">
                  Back to Dashboard
                </span>
              </div>
              <div className={`h-8 w-64 rounded mb-2 ${shimmer}`}></div>
              <div className={`h-4 w-48 rounded ${shimmer}`}></div>
            </div>
            {/* Keep static comment button */}
            <button
              className="flex items-center justify-center w-full sm:w-fit gap-2 py-2 sm:py-3 h-fit border rounded disabled:opacity-50"
              disabled
            >
              <CommentIcon width={13} height={13} />
              <span>Comment(s)</span>
            </button>
          </div>

          {/* Stats Cards - skeleton for dynamic data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mt-3 md:mt-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-11 w-11 rounded ${shimmer}`}></div>
                </div>
                <div className={`h-6 w-20 rounded mb-2 ${shimmer}`}></div>
                <div className={`h-4 w-32 rounded ${shimmer}`}></div>
              </div>
            ))}
          </div>

          {/* Project Info Section */}
          <div className="mt-5 bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h3 className="text-base font-bold">Project Info</h3>
            </div>
            <div className="flex flex-col lg:flex-row w-full gap-4 pb-6 px-6">
              {/* Left column */}
              <div className="border border-secondary-30 rounded-lg p-6 flex flex-col gap-4 w-full">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:gap-4">
                    <div className="text-secondary-60 min-w-[140px] text-sm">
                      {["Project Name:", "Funded By:", "Amount:", "Project End Date:"][index]}
                    </div>
                    <div className={`h-4 w-40 rounded ${shimmer}`}></div>
                  </div>
                ))}
              </div>
              
              {/* Right column */}
              <div className="border border-secondary-30 rounded-lg p-6 flex flex-col gap-4 w-full">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:gap-4">
                    <div className="text-secondary-60 min-w-[140px] text-sm">
                      {["Project Reference:", "Project Begin Date:", "Description:", "Uploaded Files:"][index]}
                    </div>
                    <div className={`h-4 w-40 rounded ${shimmer}`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="mt-5 bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h3 className="text-base font-bold">Location</h3>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="border-b border-gray-100 bg-secondary-10">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm">Sr No</th>
                    <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm">Country</th>
                    <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm">Providence</th>
                    <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm">City</th>
                    <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm">Municipality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-5 py-4">
                        <div className={`h-4 w-6 rounded ${shimmer}`}></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className={`h-4 w-24 rounded ${shimmer}`}></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className={`h-4 w-16 rounded ${shimmer}`}></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contracts Section */}
          <div className="mt-5 bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h3 className="text-base font-bold">Contracts</h3>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="border-b border-gray-100 bg-secondary-10">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm">Sr No</th>
                    <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm">Signed By</th>
                    <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm">Position</th>
                    <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm">Amount by Contract</th>
                    <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm">Date Created</th>
                    <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm">No of Request</th>
                    <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-5 py-4">
                        <div className={`h-4 w-6 rounded ${shimmer}`}></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className={`h-4 w-24 rounded ${shimmer}`}></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className={`h-4 w-8 rounded ${shimmer}`}></div>
                      </td>
                      <td className="px-4 py-3">
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
  );
};

export default ProjectDetailsSkeleton;
