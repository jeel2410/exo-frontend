import { useEffect, useRef, useState } from "react";
import AppLayout from "../../../layout/AppLayout";
import { motion } from "framer-motion";
import Typography from "../../../lib/components/atoms/Typography";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import Button from "../../../lib/components/atoms/Button";
import {
  ArchiveIcon,
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
import CreateContractEmpty from "../../../components/dashboard/CreateContractEmpty";
import { useMutation } from "@tanstack/react-query";
import contractService from "../../../services/contract.service";
import { useLoading } from "../../../context/LoaderProvider";
import moment from "moment";

export interface ContractData {
  id: number;
  projectName: string;
  contractName: string;
  reference: string;
  contractingAgencyName: string;
  contractingAgencyPersonName: string;
  contractingAgencyPersonPosition: string;
  awardedCompanyName: string;
  awardedCompanyPersonName: string;
  awardedCompanyPersonPosition: string;
  amountOfContract: number;
  currency: string;
  place: string;
  dateOfSigning: string;
  numberOfRequests: number;
  contractId: string;
  projectId?: string;
  created_at: string | Date;
  // Legacy fields for backward compatibility
  signedBy?: string;
  position?: string;
  organization?: string;
}
export interface ContractDetails {
  id: string;
  project_id: string;
  user_id: string;
  currency: string;
  amount: string;
  project_name: string;
  name: string;
  place: string;
  date_of_signing: string;
  status: string;
  created_at: string;
  requests_data_count: number;
  is_archived?: boolean;
  reference?: string;
  // New API fields
  contracting_agency_name?: string;
  contracting_agency_person_name?: string;
  contracting_agency_person_position?: string;
  awarded_company_name?: string;
  awarded_company_person_name?: string;
  awarded_company_person_position?: string;
  // Legacy fields for backward compatibility
  signed_by?: string;
  position?: string;
  organization?: string;
}

const ContractListPage = () => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(8);
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<ContractData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasInitialData, setHasInitialData] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

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
    mutationFn: async (override?: Partial<{ limit: number; offset: number; search: string; start_date?: string; end_date?: string; status?: string }>) => {
      setLoading(true);
      const payload = {
        limit,
        offset,
        search: searchTerm,
        start_date: formateDate(range.startDate),
        end_date: formateDate(range.endDate),
        ...(showArchived && { status: "archived" }),
        ...(override || {}),
      };
      const response = await contractService.getAllContractList(payload);
      const contracts: ContractDetails[] = response.data.data;
      console.log(contracts, "contracts");

      console.log(contracts, "contracts");
      const newContractData: ContractData[] = contracts.map(
        (contract, index: number) => ({
          id: Number(index + 1),
          projectName: contract.project_name,
          contractName: contract.name,
          reference: contract.reference || "-",
          contractingAgencyName: contract.contracting_agency_name || "-",
          contractingAgencyPersonName: contract.contracting_agency_person_name || "-",
          contractingAgencyPersonPosition: contract.contracting_agency_person_position || "-",
          awardedCompanyName: contract.awarded_company_name || "-",
          awardedCompanyPersonName: contract.awarded_company_person_name || "-",
          awardedCompanyPersonPosition: contract.awarded_company_person_position || "-",
          amountOfContract: Number(contract.amount),
          currency: contract.currency,
          place: contract.place || "-",
          dateOfSigning: contract.date_of_signing
            ? moment(contract.date_of_signing).format("YYYY/MM/DD")
            : "-",
          numberOfRequests: contract.requests_data_count,
          contractId: contract.id,
          projectId: contract.project_id,
          created_at: contract.created_at,
          // Legacy fields for backward compatibility
          signedBy: contract.signed_by,
          position: contract.position,
          organization: contract.organization,
        })
      );
      setData(newContractData);
      setTotal(response.data.total);

      if (!hasInitialData && (response.data.total > 0 || searchTerm)) {
        setHasInitialData(true);
      }

      setLoading(false);
    },
    onError: async (error) => {
      console.error("Contract API Error:", error);
      setLoading(false);
      // Clear data on error to prevent showing stale data
      setData([]);
      setTotal(0);

      if (!hasInitialData) {
        // Show empty state if no initial data loaded
      }
    },
  });

  useEffect(() => {
    contractMutaion.mutate({});
  }, [limit, offset, range, showArchived]);

  // Trigger search only when user submits
  const handleSearch = (next?: string) => {
    const term = next !== undefined ? next : searchTerm;
    if (next !== undefined) {
      setSearchTerm(next);
    }
    if (offset === 0) {
      contractMutaion.mutate({ search: term });
    } else {
      setOffset(0);
    }
  };

  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * limit;
    setOffset(newOffset);
  };

  const handleToggleArchived = () => {
    setShowArchived(!showArchived);
    setOffset(0); // Reset to first page when toggling
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

  // Check if we have any active filters or search
  const hasActiveFilters =
    searchTerm || range.startDate || range.endDate;

  return (
    <AppLayout>
      {data.length <= 0 && !hasActiveFilters && !hasInitialData ? (
        <CreateContractEmpty />
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
              {t("searching_contract")}
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
                onClick={() => navigate("/contract-project-list")}
                className="px-4 py-2"
              >
                {t("create_contract")}
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
              {showArchived ? t("archived_contracts") : t("contracts")}
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
                      disabled={contractMutaion.isPending}
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
                  >
                    <Button
                      variant={showArchived ? "primary" : "outline"}
                      className={`flex justify-center items-center gap-2 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 min-w-[120px] h-9 sm:h-10 ${
                        showArchived
                          ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                          : "bg-white hover:bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-300"
                      }`}
                      onClick={handleToggleArchived}
                    >
                      <ArchiveIcon className="w-4 h-4" />
                      <span>
                        {showArchived ? t("active") : t("archive")}
                      </span>
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

              <div className="-mx-3 sm:mx-0 sm:px-0 overflow-x-auto">
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
      )}
    </AppLayout>
  );
};

export default ContractListPage;
