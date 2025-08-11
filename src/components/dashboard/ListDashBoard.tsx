import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import AppLayout from "../../layout/AppLayout";
import Button from "../../lib/components/atoms/Button";
import DashBoardCard from "../../lib/components/molecules/DashBoardCard.tsx";
import {
  ChevronLeftIcon,
  ChevronLeftLightIcon,
  ChevronRightIcon,
  ChevronRightLightIcon,
  // ArchiveIcon,
  FileVioletIcon,
  FilterIcon,
  // FilterIcon,
  SearchIcon,
  UsdGreenIcon,
  CdfCreamIcon,
  WhitePlusIcon,
  ArchiveIcon,
} from "../../icons";
import Typography from "../../lib/components/atoms/Typography.tsx";
import Input from "../../lib/components/atoms/Input.tsx";
import ListDashBoardTable, { Data } from "../table/ListDashboardTable.tsx";
import homeService from "../../services/home.service.ts";
import { useNavigate } from "react-router";
import Filter from "../../lib/components/molecules/Filter.tsx";
import { useLoading } from "../../context/LoaderProvider.tsx";
import CreateProject from "./project-manager/CreateProject.tsx";
import projectService from "../../services/project.service.ts";
import { useMutation } from "@tanstack/react-query";

const ListDashBoard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [data, setData] = useState<Data[]>([]);
  const { setLoading } = useLoading();

  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(8);
  const [offset, setOffset] = useState(0);
  // Dashboard card state
  const [totalProject, setTotalProject] = useState(0);
  const [totalAmountProjectUSD, setTotalAmountProjectUSD] = useState(0);
  // const [setTotalRequest] = useState(0);
  const [totalAmountProjectCDF, setTotalAmountProjectCDF] = useState(0);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [range, setRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const [hasInitialData, setHasInitialData] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const datePickerRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const formateDate = useCallback((date: Date | null) => {
    if (!date) return;
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await homeService.getHomeData(
        limit,
        offset,
        debouncedSearchTerm,
        formateDate(range.startDate),
        formateDate(range.endDate)
      );
      const dataArray = (res.data || []).map(
        (
          item: {
            reference: string;
            name: string;
            currency: string;
            amount: string | number;
            created_at: string;
            requests_count: number;
            id: string;
            status: string;
            end_date: string;
            funded_by: string;
          },
          idx: number
        ) => ({
          id: idx + 1 + offset,
          projectId: item.reference || "-",
          projectName: item.name,
          currency: item.currency,
          amount: Number(item.amount),
          createdDate: item.created_at,
          noOfRequest: item.requests_count || 0,
          projectUuid: item.id,
          status: item.status,
          endDate: item.end_date,
          fundedBy: item.funded_by,
        })
      );

      setData(dataArray);
      setTotal(res.total_project || 0);
      setTotalProject(res.total_project || 0);
      setTotalAmountProjectUSD(res.total_usd_amount_project || 0);
      setTotalAmountProjectCDF(res.total_cdf_amount_project || 0);

      if (
        !hasInitialData &&
        (res.total_project > 0 ||
          debouncedSearchTerm ||
          range.startDate ||
          range.endDate)
      ) {
        setHasInitialData(true);
      }

      if (res.total_project <= 0 && !hasInitialData) {
        navigate("/project-dashboard");
      }
    } catch (e) {
      console.log(e, "error");
      setData([]);
      if (!hasInitialData) {
        navigate("/project-dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, [limit, offset, debouncedSearchTerm, range, hasInitialData, navigate, setLoading, formateDate]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Archive mutation (defined after fetchData to avoid circular dependency)
  const archiveProjectMutation = useMutation({
    mutationFn: async (projectIds: string) => {
      const response = await projectService.archiveProject(projectIds);
      return response;
    },
    onSuccess: async (response: any) => {
      console.log("Archive successful:", response);
      // Call fetchData to refresh all the data after successful archive
      await fetchData();
    },
    onError: (error) => {
      console.error("Archive failed:", error);
      // You can add toast notification here if needed
    },
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * limit;
    setOffset(newOffset);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setOffset(0); // Reset to first page when changing limit
  };

  const handleApplyDateFilter = (newRange: {
    startDate: Date | null;
    endDate: Date | null;
  }) => {
    setRange(newRange);
    setIsDatePickerOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Archive handlers
  const handleBulkArchive = async () => {
    if (selectedProjects.length === 0) {
      alert(t("please_select_projects_to_archive"));
      return;
    }

    if (window.confirm(t("confirm_archive_multiple_projects", { count: selectedProjects.length }))) {
      const projectIds = selectedProjects.join(",");
      await archiveProjectMutation.mutateAsync(projectIds);
      setSelectedProjects([]); // Clear selection after archive
    }
  };

  const handleSingleArchive = async (projectUuid: string) => {
    if (window.confirm(t("confirm_archive_single_project"))) {
      await archiveProjectMutation.mutateAsync(projectUuid);
    }
  };

  const handleSelectionChange = useCallback((selectedProjectUuids: string[]) => {
    setSelectedProjects(selectedProjectUuids);
  }, []);

  // Check if we have any active filters or search
  const hasActiveFilters =
    debouncedSearchTerm || range.startDate || range.endDate;

  return (
    <AppLayout>
      {data.length <= 0 && !hasActiveFilters && !hasInitialData ? (
        <CreateProject />
      ) : data.length <= 0 && hasActiveFilters ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
                />
              </svg>
            </div>
            <Typography
              size="lg"
              weight="semibold"
              className="text-secondary-100 mb-2"
            >
              {t("no_data_found")}
            </Typography>
            <Typography size="base" className="text-secondary-60 mb-6">
              {t("no_projects_match_your_search_criteria")}
            </Typography>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setRange({ startDate: null, endDate: null });
                }}
                className="px-4 py-2"
              >
                {t("clear_filters")}
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate("/create-project")}
                className="px-4 py-2"
              >
                {t("create_new_project")}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <motion.div
            className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-4 px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Typography
              size="xl"
              weight="extrabold"
              className="text-secondary-100 text-center sm:text-left"
            >
              {t("dashboard")}
            </Typography>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full sm:w-auto"
            >
              <Button
                variant="primary"
                className="flex items-center justify-center w-full sm:w-fit gap-2 py-2.5 px-4"
                onClick={() => navigate("/create-project")}
              >
                <WhitePlusIcon
                  width={12}
                  height={12}
                  className="sm:w-[13px] sm:h-[13px]"
                />
                <Typography size="sm" className="sm:text-base">
                  {t("create_project")}
                </Typography>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div className="px-4 sm:px-0">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6"
              initial="hidden"
              animate="visible"
            >
              {[
                {
                  icon: (
                    <FileVioletIcon
                      width={36}
                      height={36}
                      className="sm:w-11 sm:h-11"
                    />
                  ),
                  count: totalProject,
                  title: t("total_project"),
                },
                {
                  icon: (
                    <UsdGreenIcon
                      width={36}
                      height={36}
                      className="sm:w-11 sm:h-11"
                    />
                  ),
                  count: totalAmountProjectUSD,
                  title: t("total_amount"),
                },
                // {
                //   icon: (
                //     <UsdVioletIcon
                //       width={36}
                //       height={36}
                //       className="sm:w-11 sm:h-11"
                //     />
                //   ),
                //   count: totalRequest,
                //   title: t("total_request"),
                // },
                {
                  icon: (
                    <CdfCreamIcon
                      width={36}
                      height={36}
                      className="sm:w-11 sm:h-11"
                    />
                  ),
                  count: totalAmountProjectCDF,
                  title: t("total_amount"),
                },
              ].map((card, index) => (
                <motion.div key={index} transition={{ duration: 0.3 }}>
                  <DashBoardCard
                    icon={card.icon}
                    count={card.count}
                    title={card.title}
                  />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="bg-white p-3 sm:p-4 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center sm:gap-4 mb-4 sm:mb-5">
                <motion.div
                  className="w-full sm:w-1/2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative">
                    <div className="absolute inset-y-0 left-2.5 sm:left-3 flex items-center pointer-events-none">
                      <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-50" />
                    </div>
                    <Input
                      type="text"
                      placeholder={t("search_placeholder")}
                      className="pl-8 sm:pl-10 bg-white pr-3 sm:pr-4 text-sm sm:text-base w-full h-9 sm:h-10"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </motion.div>

                <div className="flex gap-2 sm:gap-3 justify-end relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="outline"
                      className={`flex justify-center items-center gap-1.5 sm:gap-2 py-2 px-3 sm:py-2.5 sm:px-4 min-w-[90px] sm:min-w-[120px] h-9 sm:h-10 ${
                        selectedProjects.length > 0 
                          ? "bg-red-50 border-red-200 hover:bg-red-100" 
                          : ""
                      }`}
                      onClick={handleBulkArchive}
                      disabled={archiveProjectMutation.isPending}
                    >
                      <ArchiveIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                      <Typography
                        className={selectedProjects.length > 0 ? "text-red-600" : "text-secondary-60"}
                        element="span"
                        size="sm"
                        weight="semibold"
                      >
                        {archiveProjectMutation.isPending 
                          ? t("archiving") 
                          : selectedProjects.length > 0 
                            ? t("archive_count", { count: selectedProjects.length }) 
                            : t("archive")
                        }
                      </Typography>
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="outline"
                      className="flex justify-center items-center gap-1.5 sm:gap-2 py-2 px-3 sm:py-2.5 sm:px-4 min-w-[90px] sm:min-w-[120px] h-9 sm:h-10"
                      onClick={() => setIsDatePickerOpen(true)}
                    >
                      <FilterIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                      <Typography
                        className="text-secondary-60"
                        element="span"
                        size="sm"
                        weight="semibold"
                      >
                        {t("filter")}
                      </Typography>
                    </Button>
                  </motion.div>
                  {isDatePickerOpen && (
                    <div
                      ref={datePickerRef}
                      className="absolute top-[100%] right-0 w-max z-50 mt-2 bg-white border border-secondary-30 rounded-lg shadow-lg p-4"
                    >
                      <Filter
                        startDate={range.startDate}
                        endDate={range.endDate}
                        onApply={handleApplyDateFilter}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:mx-0">
                <ListDashBoardTable 
                  data={data} 
                  onSelectedProjectsChange={handleSelectionChange}
                  onSingleArchive={handleSingleArchive}
                  isArchiving={archiveProjectMutation.isPending}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 px-4 sm:px-0">
                <div className="flex items-center gap-2 text-sm">
                  <span>{t("rows_per_page")}</span>
                  <select
                    value={limit}
                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                    className="border rounded px-2 py-1 text-sm bg-white"
                  >
                    {[8, 16, 32].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Button
                    variant="outline"
                    className="px-2 py-1 min-w-[32px] border-0 disabled:text-gray-400"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    {currentPage === 1 ? (
                      <ChevronLeftLightIcon />
                    ) : (
                      <ChevronLeftIcon />
                    )}
                  </Button>
                  <div>
                    <span className="text-nowrap">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="px-2 py-1 min-w-[32px] border-0"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    {currentPage === totalPages ? (
                      <ChevronRightLightIcon />
                    ) : (
                      <ChevronRightIcon />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AppLayout>
  );
};

export default ListDashBoard;
