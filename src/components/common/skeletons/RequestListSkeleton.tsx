import { useEffect } from "react";

const RequestListSkeleton = () => {
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
        {/* Keep the static AppLayout structure */}
        <div className="p-6">
          {/* Header section - keep static title, skeleton for dynamic button */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-4 px-4 sm:px-0">
            <h1 className="text-xl font-extrabold text-secondary-100">Requests</h1>
            <div className={`h-10 w-40 rounded ${shimmer}`}></div>
          </div>

          {/* Table container - match the real structure */}
          <div className="px-4 sm:px-0">
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
              {/* Table skeleton */}
              <div className="sm:mx-0 overflow-x-auto">
                <div className="relative rounded-lg border border-secondary-30 bg-white">
                  <table className="w-full border-collapse">
                    {/* Table Header - Keep static headers */}
                    <thead className="border-b border-gray-100 bg-secondary-10 rounded-lg">
                      <tr>
                        <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm w-16">
                          Sr No
                        </th>
                        <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm min-w-[120px]">
                          Request No
                        </th>
                        <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm min-w-[120px]">
                          Amount
                        </th>
                        <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm w-28">
                          Created Date
                        </th>
                        <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm w-24">
                          Stage
                        </th>
                        <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm w-24">
                          Status
                        </th>
                        <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm w-20">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    
                    {/* Table Body - Skeleton rows for dynamic data */}
                    <tbody className="divide-y divide-gray-100">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <tr key={index}>
                          <td className="px-5 py-4 text-gray-500 text-sm">
                            <div className={`h-4 w-6 rounded ${shimmer}`}></div>
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            <div className={`h-4 w-16 rounded ${shimmer}`}></div>
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            <div className={`h-6 w-20 rounded ${shimmer}`}></div>
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            <div className={`h-6 w-20 rounded ${shimmer}`}></div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-sm">
                            <div className={`h-8 w-8 rounded-md ${shimmer}`}></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination section - Keep static structure, skeleton for dynamic parts */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 px-4 sm:px-0">
                {/* Rows per page - static */}
                <div className="flex items-center gap-2 text-sm">
                  <span>Rows per page:</span>
                  <select className="border rounded px-2 py-1 text-sm bg-white" disabled>
                    <option>8</option>
                  </select>
                </div>

                {/* Page navigation - skeleton for dynamic page numbers */}
                <div className="flex items-center gap-2 text-sm">
                  <button className="px-2 py-1 min-w-[32px] border-0 text-gray-400" disabled>
                    ←
                  </button>
                  <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                  <button className="px-2 py-1 min-w-[32px] border-0 text-gray-400" disabled>
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestListSkeleton;
