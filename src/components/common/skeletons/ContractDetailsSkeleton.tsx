import { useEffect } from "react";
import { ArrowLeftIcon } from "../../../icons";

const ContractDetailsSkeleton = () => {
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
      <div className="min-h-screen bg-gray-50">
        <div className="relative px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          
          {/* Header Section */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2">
              <ArrowLeftIcon
                width={16}
                height={16}
                className="text-primary-150 flex-shrink-0"
              />
              <div className={`h-4 w-32 rounded ${shimmer}`}></div>
              <span className="text-gray-400">/</span>
              <div className={`h-4 w-24 rounded ${shimmer}`}></div>
              <span className="text-gray-400">/</span>
              <div className={`h-4 w-28 rounded ${shimmer}`}></div>
            </div>
            
            {/* Title */}
            <div className={`h-8 w-80 rounded ${shimmer}`}></div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-8 w-8 sm:h-11 sm:w-11 rounded ${shimmer}`}></div>
                </div>
                <div className={`h-6 w-16 rounded mb-2 ${shimmer}`}></div>
                <div className={`h-4 w-32 rounded ${shimmer}`}></div>
              </div>
            ))}
          </div>

          {/* Contract Info Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4 sm:mb-6">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className={`h-5 w-32 rounded ${shimmer}`}></div>
            </div>
            
            <div className="p-4 sm:p-6">
              {/* Contract Information Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Main Content Area - 2 columns on xl */}
                <div className="xl:col-span-2 space-y-6">
                  
                  {/* Basic Details Card */}
                  <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
                    <div className={`h-5 w-24 rounded mb-4 ${shimmer}`}></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Column */}
                      <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div key={index} className="space-y-1">
                            <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                            {index === 1 ? (
                              // Reference field with special styling
                              <div className="bg-gray-50 rounded-md p-2 border">
                                <div className={`h-4 w-full rounded ${shimmer}`}></div>
                              </div>
                            ) : (
                              <div className={`h-4 w-32 rounded ${shimmer}`}></div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Right Column */}
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="space-y-1">
                            <div className={`h-4 w-24 rounded ${shimmer}`}></div>
                            <div className={`h-4 w-28 rounded ${shimmer}`}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Contracting Parties - Side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contracting Agency */}
                    <div className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-white">
                      <div className={`h-5 w-32 rounded mb-3 ${shimmer}`}></div>
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="space-y-1">
                            <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                            <div className={`h-4 w-full rounded ${shimmer}`}></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Awarded Company */}
                    <div className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-white">
                      <div className={`h-5 w-28 rounded mb-3 ${shimmer}`}></div>
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="space-y-1">
                            <div className={`h-4 w-24 rounded ${shimmer}`}></div>
                            <div className={`h-4 w-full rounded ${shimmer}`}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Legacy Information - Conditional styling */}
                  <div className="border border-orange-200 bg-orange-50 rounded-lg p-4 sm:p-5">
                    <div className={`h-5 w-32 rounded mb-3 ${shimmer}`}></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="space-y-1">
                          <div className={`h-4 w-16 rounded ${shimmer}`}></div>
                          <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Documents Sidebar */}
                <div className="xl:col-span-1">
                  <div className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-white h-fit sticky top-6">
                    {/* Header with count */}
                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                      <div className={`h-5 w-28 rounded ${shimmer}`}></div>
                      <div className={`h-5 w-6 rounded-full ${shimmer}`}></div>
                    </div>
                    
                    {/* Document List */}
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="group">
                          <div className="flex items-center gap-2 p-3 rounded-md border border-gray-200">
                            <div className={`h-4 w-4 rounded ${shimmer}`}></div>
                            <div className={`h-4 w-full rounded ${shimmer}`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Requests Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className={`h-5 w-20 rounded ${shimmer}`}></div>
            </div>
            
            <div className="p-4 sm:p-6">
              {/* Search and Filter Controls */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center sm:gap-4 mb-4 sm:mb-6">
                {/* Search Input */}
                <div className="w-full sm:w-1/2">
                  <div className={`h-10 w-full rounded border ${shimmer}`}></div>
                </div>
                
                {/* Filter Button */}
                <div className="flex gap-2 sm:gap-3 justify-end">
                  <div className={`h-9 w-20 rounded border ${shimmer}`}></div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-left text-sm">Request No</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-left text-sm">Amount</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-left text-sm">Created Date</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-left text-sm">Stage</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-left text-sm">Status</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-left text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div className={`h-4 w-16 rounded ${shimmer}`}></div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`h-4 w-24 rounded ${shimmer}`}></div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`h-6 w-20 rounded-full ${shimmer}`}></div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`h-6 w-16 rounded-full ${shimmer}`}></div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`h-8 w-8 rounded ${shimmer}`}></div>
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
  );
};

export default ContractDetailsSkeleton;
