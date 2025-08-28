import { useEffect, useRef, useState } from "react";
import AppLayout from "../../../layout/AppLayout";
import { motion } from "framer-motion";
import Typography from "../../../lib/components/atoms/Typography";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import Button from "../../../lib/components/atoms/Button";
import {
  ChevronLeftIcon,
  ChevronLeftLightIcon,
  ChevronRightIcon,
  ChevronRightLightIcon,
  FilterIcon,
  SearchIcon,
  WhitePlusIcon,
} from "../../../icons";
import Input from "../../../lib/components/atoms/Input";

import Filter from "../../../lib/components/molecules/Filter";
import ContractListTable from "../../../components/table/ContractListTable";
import { useMutation } from "@tanstack/react-query";
import contractService from "../../../services/contract.service";
import { useLoading } from "../../../context/LoaderProvider";
import moment from "moment";

export interface ContractData {
  id: number;
  projectName: string;
  signedBy: string;
  position: string;
  amountOfContract: number;
  currency: string;
  organization: string;
  dateOfSigning: string;
  numberOfRequests: number;
  contractId: string;
  created_at: string | Date; // Assuming this is a date string
}
export interface ContractDetails {
  id: string;
  project_id: string;
  user_id: string;
  signed_by: string;
  position: string;
  currency: string;
  amount: string;
  organization: string;
  project_name: string;
  place: string;
  date_of_signing: string;
  status: string;
  created_at: string;
  requests_data_count: number;
}

const ContractListPage = () => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(8);
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<ContractData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [range, setRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const datePickerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setLoading } = useLoading();

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  const handleApplyDateFilter = (newRange: {
    startDate: Date | null;
    endDate: Date | null;
  }) => {
    setRange(newRange);
    setIsDatePickerOpen(false);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setOffset(0); // Reset to first page when changing limit
  };

  const formateDate = (date: Date | null) => {
    if (!date) return;
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  const contractMutaion = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const payload = {
        limit,
        offset,
        search: debouncedSearchTerm,
        start_date: formateDate(range.startDate),
        end_date: formateDate(range.endDate),
      };
      const response = await contractService.getAllContractList(payload);
      const contracts: ContractDetails[] = response.data.data;
      console.log(contracts, "contracts");

      console.log(contracts, "contracts");
      const newContractData: ContractData[] = contracts.map(
        (contract, index: number) => ({
          id: Number(index + 1),
          projectName: contract.project_name,
          projectId: contract.project_id,
          signedBy: contract.signed_by,
          position: contract.position,
          amountOfContract: Number(contract.amount),
          currency: contract.currency,
          organization: contract.organization,
          dateOfSigning: moment(contract.date_of_signing).format("YYYY/MM/DD"),
          numberOfRequests: contract.requests_data_count,
          contractId: contract.id,
          created_at: contract.created_at,
        })
      );
      setData(newContractData);
      setTotal(response.data.total);
      setLoading(false);
    },
    onError: async (error) => {
      console.error(error);
      setLoading(false);
    },
  });

  useEffect(() => {
    contractMutaion.mutate();
  }, [debouncedSearchTerm, limit, offset, range]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * limit;
    setOffset(newOffset);
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
  console.log(data, "data");

  return (
    <AppLayout>
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
            {t("contracts")}
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
              onClick={() => navigate("/contract-project-list")}
            >
              <WhitePlusIcon
                width={12}
                height={12}
                className="sm:w-[13px] sm:h-[13px]"
              />
              <Typography size="sm" className="sm:text-base">
                {t("create_contract")}
              </Typography>
            </Button>
          </motion.div>
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
                  {/* <Button
                    variant="outline"
                    className="flex justify-center items-center gap-1.5 sm:gap-2 py-2 px-3 sm:py-2.5 sm:px-4 min-w-[90px] sm:min-w-[120px] h-9 sm:h-10"
                  >
                    <ArchiveIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    <Typography
                      className="text-secondary-60"
                      element="span"
                      size="sm"
                      weight="semibold"
                    >
                      {t("Archive")}
                    </Typography>
                  </Button> */}
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

            <div className="sm:mx-0 overflow-x-auto">
              {/* <ListDashBoardTable data={data} /> */}
              <ContractListTable data={data} />
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
                    {t("page_of_total", {
                      current: currentPage,
                      total: totalPages,
                    })}
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

export default ContractListPage;
