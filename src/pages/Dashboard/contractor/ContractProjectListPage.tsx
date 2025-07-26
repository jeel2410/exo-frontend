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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const formateDate = (date: Date | null) => {
    if (!date) return;
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  const contractMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const data = {
        limit,
        offset,
        search: debouncedSearchTerm,
        start_date: formateDate(range.startDate),
        end_date: formateDate(range.endDate),
      };
      const res = await contractService.getProjects(data);
      const projects = res.data.data;
      const newProjectData: Data[] = projects.map(
        (project: projectResponseProps, index: number) => ({
          id: index + 1,
          projectId: project.reference,
          projectName: project.name,
          currency: project.currency,
          amount: project.amount,
          createdDate: project.created_at,
          status: project.status,
          endDate: project.end_date,
          financeBy: project.funded_by,
          projectUuid: project.id,
          projectManager: `${project.user.first_name||""} ${project.user.last_name||""}`,
        })
      );
      setData(newProjectData);
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
    setTotal(0);
    contractMutation.mutate();
  }, [limit, offset, navigate, debouncedSearchTerm, range]);

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
                    placeholder={t("Search By Project ID or Project Name...")}
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

            <div className="sm:mx-0 overflow-x-auto">
              <ContractProjectListTable data={data} />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 px-4 sm:px-0">
              <div className="flex items-center gap-2 text-sm">
                <span>Rows per page:</span>
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
