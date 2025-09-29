import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  BlueNoteIcon,
  FilterIcon,
  GreenRightIcon,
  PdfIcon,
  SearchIcon,
} from "../../../icons";
import Typography from "../../../lib/components/atoms/Typography";
import DashBoardCard from "../../../lib/components/molecules/DashBoardCard";
import RequestTable from "../../table/RequestTable";
import Input from "../../../lib/components/atoms/Input";
import Button from "../../../lib/components/atoms/Button";
import { useEffect, useRef, useState } from "react";
import Filter from "../../../lib/components/molecules/Filter";
import { useParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import contractService from "../../../services/contract.service";
import moment from "moment";
import { useLoading } from "../../../context/LoaderProvider";
// import { useAuth } from "../../../context/AuthContext";
import requestService from "../../../services/request.service";
import { useRoleRoute } from "../../../hooks/useRoleRoute";
import Breadcrumbs from "../../common/Breadcrumbs";
import CurrencyBadge from "../../common/CurrencyBadge";
import { formatCurrencyFrench } from "../../../utils/numberFormat";

interface ContractProps {
  id?: string;
  project_id: string;
  signed_by?: string;
  organization?: string;
  created_at?: string;
  requests_data_count?: number;
  position?: string;
  documents: any[];
  requests_data?: any[];
  currency: string; // Changed from "USD" | "CDF" to string for flexibility
  amount?: string | number;
  reference?: string;
  name?: string;
  summary?: any; // For backward compatibility
  // New API fields
  place?: string;
  date_of_signing?: string;
  contracting_agency_name?: string;
  contracting_agency_person_name?: string;
  contracting_agency_person_position?: string;
  awarded_company_name?: string;
  awarded_company_person_name?: string;
  awarded_company_person_position?: string;
}

// Define the type for request data from API
interface RequestApiData {
  id: string;
  request_unique_number?: string;
  amount?: string;
  total_amount?: string;
  entities?: Array<{
    total?: string;
    [key: string]: any;
  }>;
  created_at?: string;
  current_status?: string;
  sub_status?: string;
  // add other fields as needed
}

interface CardDateProps {
  approved_requests: number;
  pending_requests: number;
  rejected_requests: number;
  requests_total: number;
  total_requests: number;
}

const ContractDetails = () => {
  const { t } = useTranslation();
  // const { user } = useAuth();

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [contractData, setContractData] = useState<ContractProps>();
  const [requestsData, setRequestsData] = useState<RequestApiData[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [cardData, setCardData] = useState<CardDateProps>({
    approved_requests: 0,
    pending_requests: 0,
    rejected_requests: 0,
    requests_total: 0,
    total_requests: 0,
  });
  const [range, setRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const { contractId } = useParams();
  const { setLoading } = useLoading();
  const { getRoute } = useRoleRoute();

  const handleApplyDateFilter = (newRange: {
    startDate: Date | null;
    endDate: Date | null;
  }) => {
    setRange(newRange);
    setIsDatePickerOpen(false);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (contractData && contractData.id) {
      requestMutation.mutate({
        contractId: contractData.id,
        projectId: contractData.project_id,
      });
    }
  }, [debouncedSearchTerm, range]);

  const contractMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const formData = new FormData();
      if (contractId) {
        formData.append("contract_id", contractId);
      }
      const response = await contractService.getContractDetails(formData);
      const contract: ContractProps = response.data.data;

      // Handle case where summary might not exist in the response
      const card = response.data.data.summary || {
        approved_requests: 0,
        pending_requests: 0,
        rejected_requests: 0,
        requests_total: 0,
        total_requests: 0
      };

      setCardData(card);

      // Set initial requests data from contract
      if (contract.requests_data && Array.isArray(contract.requests_data)) {
        setRequestsData(contract.requests_data);
      }

      if (contract.id) {
        requestMutation.mutate({
          contractId: contract.id,
          projectId: contract.project_id,
        });
      }
      setContractData(contract);
      setLoading(false);
      return contract;
    },
    onSuccess: async () => {
      setLoading(false);
    },
    onError: async (error) => {
      console.error(error);
      setLoading(false);
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (data: { projectId: string; contractId: string | undefined }) => {
      if (!data.contractId) {
        throw new Error('Contract ID is required');
      }
      const payload = {
        contract_id: data.contractId,
        project_id: data.projectId,
        search: debouncedSearchTerm,
        ...(range.startDate && { start_date: range.startDate }),
        ...(range.endDate && { end_date: range.endDate }),
      };
      const response = await requestService.getAllRequestList(payload);
      return response.data;
    },
    onSuccess: async (data) => {
      // Update the requests data with the filtered/searched results
      if (data && data.data) {
        setRequestsData(data.data);
      }
    },
    onError: async (error) => {
      console.log(error);
    },
  });

  useEffect(() => {
    if (contractId) {
      contractMutation.mutate();
    }
  }, [contractId]);

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

  const crumbs = [
    { label: "dashboard", path: getRoute("dashboard") },
    {
      label: "project_details",
      path: `${getRoute("projectDetails")}/${contractData?.project_id}`,
    },
    { label: "contract_details" },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const tableVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header Section */}
        <motion.div
          className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Breadcrumbs crumbs={crumbs} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
          >
            <Typography
              size="lg"
              weight="extrabold"
              className="text-secondary-100 break-words sm:text-xl md:text-2xl"
            >
              {t("contract_details")}{" "}
              {/* {project?.reference ? `#${project.reference}` : ""} */}
            </Typography>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={cardVariants}>
            <DashBoardCard
              icon={
                <BlueNoteIcon
                  width={32}
                  height={32}
                  className="sm:w-11 sm:h-11"
                />
              }
              count={requestsData.length || 0}
              title={t("number_of_request")}
            />
          </motion.div>
          <motion.div variants={cardVariants}>
            <DashBoardCard
              icon={
                <CurrencyBadge
                  currency={(contractData?.currency as "USD" | "CDF") || "CDF"}
                  variant="violet"
                  width={32}
                  height={32}
                  className="sm:w-11 sm:h-11"
                />
              }
              count={cardData.requests_total}
              title={t("sum_of_request")}
            />
          </motion.div>
          <motion.div
            variants={cardVariants}
            className="sm:col-span-2 lg:col-span-1"
          >
            <DashBoardCard
              icon={
                <GreenRightIcon
                  width={32}
                  height={32}
                  className="sm:w-11 sm:h-11"
                />
              }
              count={cardData.approved_requests}
              title={t("accepted_requests")}
            />
          </motion.div>
        </motion.div>

        {/* Contract Info Section */}
        <motion.div
          className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4 sm:mb-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="p-4 sm:p-6 border-b border-gray-100"
            variants={itemVariants}
          >
            <Typography
              element="p"
              size="base"
              weight="bold"
              className="text-gray-900"
            >
              {t("contract_info")}
            </Typography>
          </motion.div>
          <motion.div
            className="p-4 sm:p-6"
            variants={staggerContainer}
          >
            {/* Contract Information Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Basic Details - Full width on mobile, 2 columns on xl */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* Basic Information Card */}
                <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
                  <Typography
                    className="text-gray-800 text-lg font-semibold mb-4 border-b border-gray-100 pb-2"
                    weight="semibold"
                  >
                    {t("basic_details")}
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Typography className="text-gray-600 text-sm" weight="semibold">
                          {t("name")}:
                        </Typography>
                        <Typography className="text-gray-900 text-sm break-words" weight="normal">
                          {contractData?.name || "-"}
                        </Typography>
                      </div>
                      <div className="space-y-1">
                        <Typography className="text-gray-600 text-sm" weight="semibold">
                          {t("reference")}:
                        </Typography>
                        <div className="bg-gray-50 rounded-md p-2 border" title={contractData?.reference || "-"}>
                          <Typography className="text-gray-900 text-sm break-all font-mono" weight="normal">
                            {contractData?.reference || "-"}
                          </Typography>
                        </div>
                      </div>
                      <div className="flex justify-between items-start">
                        <Typography className="text-gray-600 text-sm" weight="semibold">
                          {t("contract_amount")}:
                        </Typography>
                        <Typography className="text-gray-900 text-sm font-medium text-right ml-2" weight="semibold">
                          {contractData?.currency}{" "}
                          {contractData?.amount
                            ? formatCurrencyFrench(contractData.amount)
                            : "0"}
                        </Typography>
                      </div>
                      <div className="space-y-1">
                        <Typography className="text-gray-600 text-sm" weight="semibold">
                          {t("place")}:
                        </Typography>
                        <Typography className="text-gray-900 text-sm break-words" weight="normal">
                          {contractData?.place || "-"}
                        </Typography>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <Typography className="text-gray-600 text-sm" weight="semibold">
                          {t("date_of_signing")}:
                        </Typography>
                        <Typography className="text-gray-900 text-sm text-right ml-2" weight="normal">
                          {contractData?.date_of_signing
                            ? moment(contractData.date_of_signing).format("YYYY/MM/DD")
                            : "-"}
                        </Typography>
                      </div>
                      <div className="flex justify-between items-start">
                        <Typography className="text-gray-600 text-sm" weight="semibold">
                          {t("date_created")}:
                        </Typography>
                        <Typography className="text-gray-900 text-sm text-right ml-2" weight="normal">
                          {contractData?.created_at
                            ? moment(contractData?.created_at).format("YYYY/MM/DD")
                            : "-"}
                        </Typography>
                      </div>
                      <div className="flex justify-between items-start">
                        <Typography className="text-gray-600 text-sm" weight="semibold">
                          {t("no_of_request")}:
                        </Typography>
                        <Typography className="text-gray-900 text-sm text-right ml-2" weight="normal">
                          {contractData?.requests_data_count || 0}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contracting Parties - Side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contracting Agency */}
                  <div className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-white">
                    <Typography
                      className="text-gray-800 text-base font-semibold mb-3 border-b border-gray-100 pb-2 text-blue-700"
                      weight="semibold"
                    >
                      {t("contracting_agency")}
                    </Typography>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Typography className="text-gray-600 text-sm" weight="semibold">
                          {t("agency_name")}:
                        </Typography>
                        <Typography className="text-gray-900 text-sm break-words" weight="normal">
                          {contractData?.contracting_agency_name || "-"}
                        </Typography>
                      </div>
                      <div className="space-y-1">
                        <Typography className="text-gray-600 text-sm" weight="semibold">
                          {t("person_name")}:
                        </Typography>
                        <Typography className="text-gray-900 text-sm break-words" weight="normal">
                          {contractData?.contracting_agency_person_name || "-"}
                        </Typography>
                      </div>
                      <div className="space-y-1">
                        <Typography className="text-gray-600 text-sm" weight="semibold">
                          {t("person_position")}:
                        </Typography>
                        <Typography className="text-gray-900 text-sm break-words" weight="normal">
                          {contractData?.contracting_agency_person_position || "-"}
                        </Typography>
                      </div>
                    </div>
                  </div>

                  {/* Awarded Company */}
                  <div className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-white">
                    <Typography
                      className="text-gray-800 text-base font-semibold mb-3 border-b border-gray-100 pb-2 text-green-700"
                      weight="semibold"
                    >
                      {t("awarded_company")}
                    </Typography>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Typography className="text-gray-600 text-sm" weight="semibold">
                          {t("company_name")}:
                        </Typography>
                        <Typography className="text-gray-900 text-sm break-words" weight="normal">
                          {contractData?.awarded_company_name || "-"}
                        </Typography>
                      </div>
                      <div className="space-y-1">
                        <Typography className="text-gray-600 text-sm" weight="semibold">
                          {t("person_name")}:
                        </Typography>
                        <Typography className="text-gray-900 text-sm break-words" weight="normal">
                          {contractData?.awarded_company_person_name || "-"}
                        </Typography>
                      </div>
                      <div className="space-y-1">
                        <Typography className="text-gray-600 text-sm" weight="semibold">
                          {t("person_position")}:
                        </Typography>
                        <Typography className="text-gray-900 text-sm break-words" weight="normal">
                          {contractData?.awarded_company_person_position || "-"}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legacy Information (if available) */}
                {(contractData?.signed_by || contractData?.organization || contractData?.position) && (
                  <div className="border border-orange-200 bg-orange-50 rounded-lg p-4 sm:p-5">
                    <Typography
                      className="text-orange-800 text-base font-semibold mb-3 border-b border-orange-200 pb-2"
                      weight="semibold"
                    >
                      {t("legacy_info")}
                    </Typography>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {contractData?.signed_by && (
                        <div className="space-y-1">
                          <Typography className="text-orange-700 text-sm" weight="semibold">
                            {t("signed_by")}:
                          </Typography>
                          <Typography className="text-orange-900 text-sm break-words" weight="normal">
                            {contractData.signed_by}
                          </Typography>
                        </div>
                      )}
                      {contractData?.organization && (
                        <div className="space-y-1">
                          <Typography className="text-orange-700 text-sm" weight="semibold">
                            {t("organization")}:
                          </Typography>
                          <Typography className="text-orange-900 text-sm break-words" weight="normal">
                            {contractData.organization}
                          </Typography>
                        </div>
                      )}
                      {contractData?.position && (
                        <div className="space-y-1">
                          <Typography className="text-orange-700 text-sm" weight="semibold">
                            {t("position")}:
                          </Typography>
                          <Typography className="text-orange-900 text-sm break-words" weight="normal">
                            {contractData.position}
                          </Typography>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Documents Sidebar */}
              <div className="xl:col-span-1">
                <div className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-white h-fit sticky top-6">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                    <Typography
                      className="text-gray-800 text-base font-semibold"
                      weight="semibold"
                    >
                      {t("uploaded_files")}
                    </Typography>
                    {contractData?.documents?.length ? (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        {contractData.documents.length}
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-3">
                    {contractData?.documents?.length ? (
                      contractData.documents.map((doc: any, index: number) => (
                        <div key={index} className="group">
                          <a
                            href={doc.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 text-blue-600 hover:bg-blue-50 rounded-md border border-gray-200 text-sm transition-colors group-hover:border-blue-300 group-hover:shadow-sm"
                            title={doc?.original_name}
                          >
                            <PdfIcon
                              width={16}
                              height={16}
                              className="flex-shrink-0 text-red-500"
                            />
                            <span className="break-words text-xs leading-relaxed">
                              {doc?.original_name}
                            </span>
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <div className="text-gray-400 mb-2">
                          <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <Typography
                          className="text-gray-500 text-sm"
                          weight="normal"
                        >
                          {t("no_documents_available")}
                        </Typography>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Requests Section */}
        <motion.div
          className="bg-white rounded-lg shadow-sm border border-gray-100"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="p-4 sm:p-6 border-b border-gray-100"
            variants={itemVariants}
          >
            <Typography
              element="p"
              size="base"
              weight="bold"
              className="text-gray-900"
            >
              {t("requests")}
            </Typography>
          </motion.div>
          <motion.div className="p-4 sm:p-6" variants={tableVariants}>
            {/* Search and Filter Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center sm:gap-4 mb-4 sm:mb-6">
              {/* Search Input */}
              <motion.div
                className="w-full sm:w-1/2"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search by request no..."
                    className="pl-10 pr-4 bg-white border-gray-200 text-sm w-full h-10 focus:border-blue-500 focus:ring-blue-500"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    value={searchTerm}
                  />
                  {requestMutation.isPending && (
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3 justify-end relative">
                {/* {user?.type === "user" && (
                  <Button
                    variant="outline"
                    className="flex justify-center items-center gap-1.5 sm:gap-2 py-2 px-3 sm:py-2.5 sm:px-4 min-w-[80px] sm:min-w-[100px] h-9 sm:h-10 text-xs sm:text-sm"
                  >
                    <ArchiveIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <Typography
                      className="text-gray-600"
                      element="span"
                      size="sm"
                      weight="semibold"
                    >
                      {t("Archive")}
                    </Typography>
                  </Button>
                )} */}

                <Button
                  variant="outline"
                  className="flex justify-center items-center gap-1.5 sm:gap-2 py-2 px-3 sm:py-2.5 sm:px-4 min-w-[80px] sm:min-w-[100px] h-9 sm:h-10 text-xs sm:text-sm"
                  onClick={() => setIsDatePickerOpen(true)}
                >
                  <FilterIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <Typography
                    className="text-gray-600"
                    element="span"
                    size="sm"
                    weight="semibold"
                  >
                    {t("filter")}
                  </Typography>
                </Button>

                {/* Filter Dropdown */}
                {isDatePickerOpen && (
                  <div
                    ref={datePickerRef}
                    className="absolute top-full right-0 w-full sm:w-max z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
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

            {/* Table */}
            <div className="relative">
              {requestMutation.isPending && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <Typography
                      className="text-gray-600"
                      size="sm"
                      weight="normal"
                    >
                      {t("searching_request")}
                    </Typography>
                  </div>
                </div>
              )}
              <RequestTable
                data={
                  Array.isArray(requestsData)
                    ? (requestsData as RequestApiData[]).map((req, idx) => {
                        // Get the correct amount from entities[0].total first, then fallback to other fields
                        const finalAmount =
                          req.entities?.[0]?.total ||
                          req.total_amount ||
                          req.amount ||
                          "0";
                        return {
                          id: idx + 1,
                          requestNo: req.request_unique_number
                            ? String(req.request_unique_number)
                            : String(idx + 1),
                          amount: finalAmount,
                          currency: contractData?.currency || "USD", // Add currency from contract data
                          createdDate: req.created_at
                            ? moment(req.created_at).format("YYYY-MM-DD")
                            : "",
                          status: req.current_status || "", // This will be shown in Stage column
                          sub_status: req.sub_status || "", // This will be shown in Status column
                          request_id: req.id || "",
                          contract_id: contractData?.id || "",
                        };
                      })
                    : []
                }
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContractDetails;
