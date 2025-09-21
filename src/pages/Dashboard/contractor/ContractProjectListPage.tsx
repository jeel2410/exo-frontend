import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronLeftLightIcon,
  ChevronRightIcon,
  ChevronRightLightIcon,
  FilterIcon,
  SearchIcon,
} from "../../../icons";
import AppLayout from "../../../layout/AppLayout";
import Typography from "../../../lib/components/atoms/Typography";
import Button from "../../../lib/components/atoms/Button";
import Filter from "../../../lib/components/molecules/Filter";
import ContractProjectListTable, {
  Data,
} from "../../../components/table/ContractProjectListTable";
import Input from "../../../lib/components/atoms/Input";
import { useMutation } from "@tanstack/react-query";
import contractService from "../../../services/contract.service";
import { useNavigate } from "react-router";
import { StatusCode } from "../../../components/common/StatusBadge";
import { useLoading } from "../../../context/LoaderProvider";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  country_code: string | null;
  mobile: string | null;
  company_name: string | null;
  profile_image: string;
  status: string;
}
interface projectResponseProps {
  id: string;
  user_id: string;
  name: string;
  funded_by: string;
  reference: string;
  currency: string;
  amount: number;
  begin_date: string;
  end_date: string;
  description: string;
  status: StatusCode;
  created_at: string;
  user: User;
}

const ContractProjectListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [data, setData] = useState<Data[]>([]);
  const { setLoading } = useLoading();

  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(8);
  const [offset, setOffset] = useState(0);
  // Dashboard card state
  // const [totalProject, setTotalProject] = useState(0);
  // const [totalAmountProject, setTotalAmountProject] = useState(0);
  // const [setTotalRequest] = useState(0);
  // const [totalAmountRequest, setTotalAmountRequest] = useState(0);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [range, setRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const datePickerRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");

  // Search is triggered only on Enter or button click via handleSearch

  const formateDate = (date: Date | null) => {
    if (!date) return;
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  const contractMutation = useMutation({
    mutationFn: async (override?: Partial<{ limit: number; offset: number; search: string; start_date?: string; end_date?: string }>) => {
      setLoading(true);
      const data = {
        limit,
        offset,
        search: searchTerm,
        start_date: formateDate(range.startDate),
        end_date: formateDate(range.endDate),
        ...(override || {}),
      };
      const res = await contractService.getProjects(data);
      const projects = res.data.data || [];
      console.log("Raw API response:", res.data);
      console.log("Projects data:", projects);

      const newProjectData: Data[] = projects.map(
        (project: projectResponseProps, index: number) => ({
          id: index + 1,
          projectId: project.reference || "-",
          projectName: project.name || "-",
          currency: project.currency || "USD",
          amount: project.amount || 0,
          createdDate: project.created_at || new Date().toISOString(),
          status: project.status,
          endDate: project.end_date || "",
          financeBy: project.funded_by || "",
          projectUuid: project.id,
          projectManager: project.user
            ? `${project.user.first_name || ""} ${
                project.user.last_name || ""
              }`.trim() || "-"
            : "-",
          noOfRequest: 0, // Add missing property
        })
      );

      console.log("Transformed project data:", newProjectData);
      setData(newProjectData);
      setTotal(res.data.total);
      setLoading(false);
      return res;
    },
    onSuccess: async () => {
      setLoading(false);
    },
    onError: (error) => {
      console.error(error);
      setLoading(false);
    },
  });

  useEffect(() => {
    contractMutation.mutate();
  }, [limit, offset, navigate, range]);

  // Search trigger function
  const handleSearch = (next?: string) => {
    const term = next !== undefined ? next : searchTerm;
    if (next !== undefined) setSearchTerm(next);
    if (offset === 0) {
      contractMutation.mutate({ search: term });
    } else {
      setOffset(0);
    }
  };

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

  const handleSelectProject = (projectId: string) => {
    navigate(`/create-contract/${projectId}`);
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

  return (
    <AppLayout>
      <div className={"relative"}>
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
            {t("select_project_to_continue")}
          </Typography>
        </motion.div>

        <motion.div className="px-4 sm:px-0">
          <motion.div
            className="bg-white p-3 sm:p-4 rounded-lg shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center sm:gap-4 mb-4 sm:mb-5">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-2/3">
                <motion.div
                  className="w-full sm:w-1/2 shrink-0"
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch((e.target as HTMLInputElement).value);
                      }}
                    />
                  </div>
                </motion.div>

                <div className="flex-none">
                  <Button
                    variant="primary"
                    className="flex items-center justify-center gap-2 h-9 sm:h-10 px-3 sm:px-4 min-w-[110px] sm:min-w-[120px]"
                    onClick={() => handleSearch()}
                    disabled={contractMutation.isPending}
                  >
                    <SearchIcon width={12} height={12} className="sm:w-[13px] sm:h-[13px]" />
                    <Typography size="sm" className="sm:text-base">
                      {t("search")}
                    </Typography>
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 justify-end relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                ></motion.div>

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
                      {t("Filter")}
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
              <ContractProjectListTable
                data={data}
                onSelectProject={handleSelectProject}
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
    </AppLayout>
  );
};

export default ContractProjectListPage;
