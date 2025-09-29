import { useEffect } from "react";
import { FilterIcon, SearchIcon } from "../../../icons";
import { useTranslation } from "react-i18next";

const ContractListSkeleton = () => {
  const { t } = useTranslation();

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
      <div className="min-h-screen">
        <div className="p-6">
          {/* Header section - keep static title, skeleton for dynamic button */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-4 px-4 sm:px-0">
            <h1 className="text-xl font-extrabold text-secondary-100">
              Contracts
            </h1>
            <div className={`h-10 w-40 rounded ${shimmer}`}></div>
          </div>

          {/* Table container - match the real structure */}
          <div className="px-4 sm:px-0">
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
              {/* Filter section - keep static search and filter elements */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center sm:gap-4 mb-4 sm:mb-5">
                <div className="w-full sm:w-1/2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-2.5 sm:left-3 flex items-center pointer-events-none">
                      <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-50" />
                    </div>
                    <input
                      type="text"
                      placeholder={t("search_placeholder")}
                      className="pl-8 sm:pl-10 bg-white pr-3 sm:pr-4 text-sm sm:text-base w-full h-9 sm:h-10 border rounded"
                      disabled
                    />
                  </div>
                </div>

                <div className="flex gap-2 sm:gap-3 justify-end relative">
                  <button
                    className="flex justify-center items-center gap-1.5 sm:gap-2 py-2 px-3 sm:py-2.5 sm:px-4 min-w-[90px] sm:min-w-[120px] h-9 sm:h-10 border rounded"
                    disabled
                  >
                    <FilterIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    <span className="text-secondary-60 text-sm font-semibold">
                      {t("filter")}
                    </span>
                  </button>
                </div>
              </div>

              {/* Table skeleton */}
              <div className="sm:mx-0">
                <div className="relative rounded-lg bg-white min-h-[225px]">
                  <table className="w-full border-collapse">
                    {/* Table Header - Keep static headers */}
                    <thead className="border-b border-gray-100 bg-secondary-10 rounded-lg">
                      <tr>
                        <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm w-16">
                          {t("sr_no")}
                        </th>
                        <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm min-w-[120px]">
                          {t("project_name")}
                        </th>
                        <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm min-w-[120px]">
                          {t("signed_by")}
                        </th>
                        <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm w-24">
                          {t("position")}
                        </th>
                        <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm min-w-[120px]">
                          {t("amount_of_contract")}
                        </th>
                        <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm w-24">
                          {t("organization")}
                        </th>
                        <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm w-24">
                          {t("created_date")}
                        </th>
                        <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm w-24">
                          {t("number_of_equests")}
                        </th>
                        <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm w-20">
                          {t("status")}
                        </th>
                        <th className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm w-20">
                          {t("actions")}
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
                            <div
                              className={`h-4 w-32 rounded ${shimmer}`}
                            ></div>
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            <div
                              className={`h-4 w-24 rounded ${shimmer}`}
                            ></div>
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            <div
                              className={`h-4 w-20 rounded ${shimmer}`}
                            ></div>
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            <div className="flex gap-2 items-center">
                              <div
                                className={`h-4 w-8 rounded ${shimmer}`}
                              ></div>
                              <div
                                className={`h-4 w-16 rounded ${shimmer}`}
                              ></div>
                            </div>
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            <div
                              className={`h-4 w-20 rounded ${shimmer}`}
                            ></div>
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            <div
                              className={`h-4 w-20 rounded ${shimmer}`}
                            ></div>
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            <div className={`h-4 w-8 rounded ${shimmer}`}></div>
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            <div className={`h-5 w-16 rounded-full ${shimmer}`}></div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-sm">
                            <div
                              className={`h-8 w-8 rounded-md ${shimmer}`}
                            ></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination section - Keep static structure, skeleton for dynamic parts */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 px-4 sm:px-0">
                <div className="flex items-center gap-2 text-sm">
                  <span>{t("rows_per_page")}</span>
                  <select
                    className="border rounded px-2 py-1 text-sm bg-white"
                    disabled
                  >
                    <option>8</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <button
                    className="px-2 py-1 min-w-[32px] border-0 text-gray-400"
                    disabled
                  >
                    ←
                  </button>
                  <div className={`h-4 w-20 rounded ${shimmer}`}></div>
                  <button
                    className="px-2 py-1 min-w-[32px] border-0 text-gray-400"
                    disabled
                  >
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

export default ContractListSkeleton;
