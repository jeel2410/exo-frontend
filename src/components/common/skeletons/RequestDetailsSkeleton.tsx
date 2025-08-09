const RequestDetailsSkeleton = () => {
  const shimmer =
    "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200";

  return (
    <div className="px-4 md:px-8 py-6">
      <div className="mb-6">
        {/* Breadcrumb skeleton */}
        <div className="cursor-pointer mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className={`h-4 w-20 rounded ${shimmer}`}></div>
            <span className="text-gray-400">›</span>
            <div className={`h-4 w-28 rounded ${shimmer}`}></div>
            <span className="text-gray-400">›</span>
            <div className={`h-4 w-32 rounded ${shimmer}`}></div>
          </div>
        </div>
        {/* Page Title skeleton */}
        <div className={`h-10 w-80 rounded ${shimmer}`}></div>
      </div>

      <div className="flex gap-6">
        {/* Request Progress Skeleton - matches RequestProgress component */}
        <div>
          <div className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100/50 backdrop-blur-sm">
            {/* Title skeleton */}
            <div className={`h-6 w-32 rounded ${shimmer} mb-8`}></div>

            {/* Progress Steps skeleton */}
            <div className="relative">
              <div className="space-y-6">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-start group">
                    <div className="relative flex flex-col items-center mr-4">
                      {/* Step Indicator skeleton */}
                      <div className="relative z-10">
                        <div
                          className={`w-10 h-10 rounded-full ${shimmer} flex-shrink-0`}
                        ></div>
                      </div>

                      {index < 4 && (
                        <div
                          className={`w-[3px] h-12 mt-2 rounded-full ${shimmer}`}
                          style={{ height: "48px" }}
                        ></div>
                      )}
                    </div>

                    {/* Step Content skeleton */}
                    <div className="flex-1 pt-2 pl-3">
                      <div className={`h-4 w-32 rounded ${shimmer}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Request Details Card skeleton */}
          <div className="border border-gray-300 bg-white rounded-lg">
            <div className="px-4 md:px-6 py-5">
              <div className="flex justify-between items-center">
                <div className={`h-6 w-32 rounded ${shimmer}`}></div>
              </div>
            </div>

            {/* Cards Grid skeleton */}
            <div className="px-4 md:px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`h-11 w-11 rounded ${shimmer}`}></div>
                    </div>
                    <div className={`h-8 w-16 rounded mb-2 ${shimmer}`}></div>
                    <div className={`h-4 w-24 rounded ${shimmer}`}></div>
                  </div>
                ))}
              </div>

              {/* Details List skeleton */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                  <div
                    className={`h-4 w-16 rounded ${shimmer} min-w-[100px]`}
                  ></div>
                  <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                  <div
                    className={`h-4 w-16 rounded ${shimmer} min-w-[100px]`}
                  ></div>
                  <div className={`h-4 w-64 rounded ${shimmer}`}></div>
                </div>

                <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
                  <div
                    className={`h-4 w-24 rounded ${shimmer} min-w-[100px]`}
                  ></div>
                  <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-2 border border-gray-400 rounded-full px-3 py-1.5 bg-white">
                      <div className={`h-3 w-3 rounded ${shimmer}`}></div>
                      <div className={`h-4 w-32 rounded ${shimmer}`}></div>
                      <span className="text-xs text-gray-500">0.09MB</span>
                    </div>
                    <div className="inline-flex items-center gap-2 border border-gray-400 rounded-full px-3 py-1.5 bg-white">
                      <div className={`h-3 w-3 rounded ${shimmer}`}></div>
                      <div className={`h-4 w-36 rounded ${shimmer}`}></div>
                      <span className="text-xs text-gray-500">0.09MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Request Letter Section skeleton */}
            <div className="px-4 md:px-6 py-5 border-t border-gray-100">
              <div className={`h-6 w-28 rounded ${shimmer} mb-4`}></div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className={`h-4 w-full rounded ${shimmer} mb-2`}></div>
                <div className={`h-4 w-3/4 rounded ${shimmer} mb-2`}></div>
                <div className={`h-4 w-1/2 rounded ${shimmer}`}></div>
              </div>
            </div>

            {/* Entity Table Section skeleton */}
            <div className="px-4 md:px-6 py-5 border-t border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Sr No
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Label
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Quantity
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Unit Price
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Total
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Tax Rate
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Tax Amount
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600">
                        VAT Included
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <tr key={index}>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className={`h-4 w-4 rounded ${shimmer}`}></div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className={`h-4 w-16 rounded ${shimmer}`}></div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className={`h-4 w-8 rounded ${shimmer}`}></div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className={`h-4 w-12 rounded ${shimmer}`}></div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className={`h-4 w-12 rounded ${shimmer}`}></div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className={`h-4 w-8 rounded ${shimmer}`}></div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className={`h-4 w-8 rounded ${shimmer}`}></div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className={`h-4 w-12 rounded ${shimmer}`}></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* History Card skeleton */}
          <div className="border border-gray-300 bg-white rounded-lg">
            <div className={`h-6 w-16 rounded ${shimmer} p-4`}></div>
            <div className="p-4 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div
                    className={`h-10 w-10 rounded-full ${shimmer} flex-shrink-0`}
                  ></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`h-4 w-24 rounded ${shimmer}`}></div>
                      <div className={`h-3 w-16 rounded ${shimmer}`}></div>
                    </div>
                    <div className={`h-4 w-full rounded ${shimmer} mb-1`}></div>
                    <div className={`h-4 w-3/4 rounded ${shimmer}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsSkeleton;
