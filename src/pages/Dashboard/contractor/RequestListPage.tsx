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
import { useMutation } from "@tanstack/react-query";
import { useLoading } from "../../../context/LoaderProvider";
import moment from "moment";
import requestService from "../../../services/request.service";
import RequestTable from "../../../components/table/RequestTable";
import contractService from "../../../services/contract.service";
import CreateRequestEmpty from "../../../components/dashboard/CreateRequestEmpty";
import NoContractModal from "../../../components/modal/NoContractModal";

export interface RequestData {
  id: number;
  requestNo: string;
  amount: string;
  total_amount?: string;
  currency?: string;
  createdDate: string;
  status: string;
  sub_status?: string;
  request_id: string;
  contract_id: string;
  total_tax_amount?: string;
}

export interface RequestDetails {
  id: string;
  contract_id: string;
  project_id: string;
  project_name: string;
  amount: string;
  total_amount?: string;
  currency?: string;
  status: string;
  current_status: string;
  sub_status?: string;
  created_at: string;
  total_tax_amount?: string;
  amount_summary?: {
    contract_currency?: string;
    [key: string]: any;
  };
  entities?: Array<{
    total?: string;
    [key: string]: any;
  }>;
}

const RequestListPage = () => {
  console.log("in");

  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(8);
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<RequestData[]>([]);
  const [hasContracts, setHasContracts] = useState(false);
  const [contractCurrencyMap, setContractCurrencyMap] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [hasInitialData, setHasInitialData] = useState(false);
  const [showNoContractModal, setShowNoContractModal] = useState(false);
  const { t } = useTranslation();

  // Stage options for the filter dropdown
  const STAGE_OPTIONS = [
    { value: "", label: t("all_stages") },
    { value: "Application Submission", label: t("application_submission") },
    { value: "Secretariat Review", label: t("secretariat_review") },
    { value: "Coordinator Review", label: t("coordinator_review") },
    { value: "Financial Review", label: t("financial_review") },
    {
      value: "Calculation Notes Transmission",
      label: t("calculation_notes_transmission"),
    },
    { value: "FO Preparation", label: t("fo_preparation") },
    { value: "FO Validation", label: t("fo_validation") },
    {
      value: "Coordinator Final Validation",
      label: t("coordinator_final_validation"),
    },
    { value: "Ministerial Review", label: t("ministerial_review") },
    { value: "Title Generation", label: t("title_generation") },
  ];

  const [range, setRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const datePickerRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { setLoading } = useLoading();

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

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

  const formateDate = (date: Date | null) => {
    if (!date) return;
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  const requestMutaion = useMutation({
    mutationFn: async (
      override?: Partial<{
        limit: number;
        offset: number;
        search: string;
        start_date?: string;
        end_date?: string;
        stage?: string;
      }>
    ) => {
      setLoading(true);
      const payload = {
        limit,
        offset,
        search: searchTerm,
        start_date: formateDate(range.startDate),
        end_date: formateDate(range.endDate),
        ...(selectedStage && { stage: selectedStage }),
        ...(override || {}),
      };
      const response = await requestService.getAllRequestList(payload);
      const requests: RequestDetails[] = response.data.data;
      const newRequestData: RequestData[] = requests.map(
        (request, index: number) => {
          // Get the correct amount from entities[0].total first, then fallback to other fields
          const finalAmount =
            request.entities?.[0]?.total ||
            request.total_amount ||
            request.amount ||
            "0";
          console.log(request, "requests");

          return {
            id: Number(index + 1),
            requestNo: request.id,
            amount: request.amount || "0",
            total_amount: request.total_amount || finalAmount,
            currency:
              request.amount_summary?.contract_currency ||
              request.currency ||
              contractCurrencyMap[request.contract_id] ||
              "USD",
            createdDate: moment(request.created_at).format("YYYY/MM/DD"),
            status: request.current_status || request.status,
            sub_status: request.sub_status,
            request_id: request.id,
            contract_id: request.contract_id,
            total_tax_amount: request.total_tax_amount,
          };
        }
      );
      setData(newRequestData);
      setTotal(response.data.total);

      if (!hasInitialData && (response.data.total > 0 || searchTerm)) {
        setHasInitialData(true);
      }

      setLoading(false);
    },
    onError: async (error) => {
      console.error("Request API Error:", error);
      setLoading(false);
      // Clear data on error to prevent showing stale data
      setData([]);
      setTotal(0);

      if (!hasInitialData) {
        // Show empty state if no initial data loaded
      }
    },
  });

  const checkContracts = useMutation({
    mutationFn: async () => {
      const response = await contractService.getAllContractList({
        limit: 1000,
        offset: 0,
        search: "",
        start_date: "",
        end_date: "",
      });
      setHasContracts(response.data.total > 0);
      try {
        const list = (response.data?.data || []) as any[];
        const map: Record<string, string> = {};
        list.forEach((c: any) => {
          if (c?.id) {
            map[c.id] = c.currency || c.contract_currency || "USD";
          }
        });
        setContractCurrencyMap(map);
      } catch (err) {
        // ignore mapping errors
      }
    },
  });

  useEffect(() => {
    requestMutaion.mutate({});
    if (searchTerm === "") {
      checkContracts.mutate();
    }
  }, [limit, offset, range, selectedStage]);

  // Re-fetch when contract currencies are loaded to update currency display
  useEffect(() => {
    if (Object.keys(contractCurrencyMap).length > 0) {
      requestMutaion.mutate({});
    }
  }, [contractCurrencyMap]);

  const handleSearch = (nextTerm?: string) => {
    const term = nextTerm !== undefined ? nextTerm : searchTerm;
    if (nextTerm !== undefined) {
      setSearchTerm(nextTerm);
    }
    if (offset === 0) {
      requestMutaion.mutate({ search: term });
    } else {
      setOffset(0);
    }
    if (term === "") {
      checkContracts.mutate();
    }
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

  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * limit;
    setOffset(newOffset);
  };

  const handleCreateRequest = () => {
    console.log("in handle create reqest");
    console.log(hasContracts, "hasContracts");

    if (hasContracts) {
      console.log("in if has");

      navigate("/select-contract");
    } else {
      setShowNoContractModal(true);
    }
  };

  // Check if we have any active filters or search
  const hasActiveFilters =
    searchTerm || range.startDate || range.endDate || selectedStage;

  return (
    <AppLayout>
      {data.length <= 0 && !hasActiveFilters && !hasInitialData ? (
        <CreateRequestEmpty />
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
              {t("searching_request")}
            </Typography>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setRange({ startDate: null, endDate: null });
                  setSelectedStage("");
                  handleSearch("");
                }}
                className="px-4 py-2"
              >
                {t("clear_filters")}
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateRequest}
                className="px-4 py-2"
              >
                {t("create_request")}
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
              {t("requests")}
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
                onClick={handleCreateRequest}
              >
                <WhitePlusIcon
                  width={12}
                  height={12}
                  className="sm:w-[13px] sm:h-[13px]"
                />
                <Typography size="sm" className="sm:text-base">
                  {t("create_request")}
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
              {/* Search Section */}
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
                        value={searchTerm}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSearch();
                          }
                        }}
                      />
                      {requestMutaion.isPending && (
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  <div className="flex-none">
                    <Button
                      variant="primary"
                      className="flex items-center justify-center gap-2 h-9 sm:h-10 px-3 sm:px-4 min-w-[110px] sm:min-w-[120px]"
                      onClick={() => handleSearch()}
                      disabled={requestMutaion.isPending}
                    >
                      <SearchIcon
                        width={12}
                        height={12}
                        className="sm:w-[13px] sm:h-[13px]"
                      />
                      <Typography size="sm" className="sm:text-base">
                        {t("search")}
                      </Typography>
                    </Button>
                  </div>

                  {/* Stage Filter Dropdown */}
                  <motion.div
                    className="w-full sm:flex-1"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <select
                      value={selectedStage}
                      onChange={(e) => setSelectedStage(e.target.value)}
                      className="w-full h-9 sm:h-10 px-3 text-sm sm:text-base border border-secondary-30 rounded-lg bg-white text-secondary-100 focus:outline-hidden focus:border-primary-50 focus:ring-0"
                    >
                      {STAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                </div>

                <div className="flex gap-2 sm:gap-3 justify-end relative">
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
                <RequestTable data={data} />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 px-4 sm:px-0">
                <div className="flex items-center gap-2 text-sm">
                  <span>{t("rows_per_page")}:</span>
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
                      {t("page")} {currentPage} {t("of")} {totalPages}
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

      {/* No Contract Modal */}
      <NoContractModal
        isOpen={showNoContractModal}
        onClose={() => setShowNoContractModal(false)}
      />
    </AppLayout>
  );
};

export default RequestListPage;
