import { useTranslation } from "react-i18next";
import {
  BlueCopyIcon,
  PdfIcon,
  USFlag,
  CDFFlag,
  // PdfIcon,
} from "../../icons";
import moment from "moment";
import "moment/locale/fr";
import AppLayout from "../../layout/AppLayout";
import Typography from "../../lib/components/atoms/Typography";
import DashBoardCard from "../../lib/components/molecules/DashBoardCard";
import { useQuery } from "@tanstack/react-query";
import projectService from "../../services/project.service";

import { useEffect, useState } from "react";
import localStorageService from "../../services/local.service";
import { useParams, useNavigate } from "react-router";
import Button from "../../lib/components/atoms/Button";
import RequestProgress from "../../components/dashboard/ProgressStep";
import { useModal } from "../../hooks/useModal";
import RequestDetailModal from "../../components/modal/RequestDetailModal";
import History from "../../components/dashboard/History";
import { useLoading } from "../../context/LoaderProvider";
import {
  transformTracksToHistory,
  TrackItem,
  getVisibleTracks,
} from "../../utils/historyUtils";
import { HistoryItem } from "../../components/dashboard/History";
import { useRoleRoute } from "../../hooks/useRoleRoute";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import CreateRequestTable from "../../components/table/CreateRequestTable.tsx";
import { RequestDetailsSkeleton } from "../../components/common/skeletons";
import CurrencyBadge from "../../components/common/CurrencyBadge";
import { formatAmount } from "../../utils/numberFormat";
interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  company_name: string;
  country_code: string;
  mobile: string;
  email: string;
  profile_image: string;
  type: string;
  token: string;
}

export interface RequestAddress {
  country: string;
  providence: string;
  city: string;
  municipality: string;
}

export interface RequestEntity {
  label: string;
  quantity: number;
  unit?: string;
  unit_price: number;
  total: number;
  tax_rate: number;
  tax_amount: number;
  vat_included: number;
  financial_authority: string;
  status: string;
  reference?: string; // Reference field
  tarrif_position?: string; // Tarrif Position field
}

export interface AmountSummary {
  total_quantity: number;
  total_amount: number;
  total_tax: number;
  vat_included: number;
  contract_currency: string; // Currency from contract
}

export interface RequestDetails {
  id: string;
  unique_number: string;
  status: string;
  project_id: string;
  project_name?: string; // Added from API
  contract_id?: string; // Added from API
  contract_name?: string; // Added from API
  request_letter: string;
  address?: RequestAddress; // Single address (for backward compatibility)
  addresses?: RequestAddress[]; // Multiple addresses (new format)
  address_ids?: string; // Comma-separated string of address IDs
  entities: RequestEntity[];
  amount_summary: AmountSummary;
  files?: any[];
  tracks: TrackItem[];
  contract_currency?: string; // Currency from contract
  project_amount?: number; // Project amount from API
  contract_amount?: number; // Contract amount from API
  sub_status?: string; // Current sub-status (e.g., request_info)
  last_completed_stage?: string; // New: last completed stage (English)
  current_stage?: string; // New: current stage (English)
  tax_category?: string; // Tax category for dynamic column display
}
export interface ProgressStep {
  id: number;
  title: string;
  status: "completed" | "current" | "pending";
}
interface CommentProps {
  initial: string;
  username: string;
  comment: string;
  timestamp: string;
}

// Define the progress steps with translation keys
const getProgressSteps = (t: any): ProgressStep[] => [
  { id: 1, title: t("application_submission"), status: "current" },
  { id: 2, title: t("secretariat_review"), status: "pending" },
  { id: 3, title: t("coordinator_review"), status: "pending" },
  { id: 4, title: t("financial_review"), status: "pending" },
  { id: 5, title: t("calculation_notes_transmission"), status: "pending" },
  { id: 6, title: t("fo_preparation"), status: "pending" },
  { id: 7, title: t("transmission_to_secretariat"), status: "pending" },
  { id: 8, title: t("coordinator_final_validation"), status: "pending" },
  { id: 9, title: t("ministerial_review"), status: "pending" },
  { id: 10, title: t("title_generation"), status: "pending" },
];
export const comments: CommentProps[] = [
  {
    initial: "RF",
    username: "Robert Fox",
    comment: "Requested applicant to resubmit.",
    timestamp: "Today",
  },
  {
    initial: "GH",
    username: "Guy Hawkins",
    comment:
      "Not eligible for exemption as the applicant is a for-profit entity. Rejected with appropriate reasoning.",
    timestamp: "Yesterday",
  },
  {
    initial: "JW",
    username: "Jenny Wilson",
    comment:
      "Request under review. Pending legal team's clarification on eligibility criteria for one-time event-based exemptions.",
    timestamp: "May 28, 2025",
  },
  {
    initial: "CF",
    username: "Cody Fisher",
    comment:
      "Verified PAN and registration certificate. Cause is genuine and aligns with approved tax-exempt activities. Forwarded to accounts team for further processing.",
    timestamp: "May 21, 2025",
  },
];

const TestRequestDetails = () => {
  const { t, i18n } = useTranslation();
  const [userData, setUserData] = useState<UserData | undefined>();
  const [requestData, setRequestData] = useState<RequestDetails | null>(null);
  const { setLoading } = useLoading();
  const [steps, setSteps] = useState<ProgressStep[]>(getProgressSteps(t));
  const {
    isOpen: isOpenRequestDetails,
    closeModal: closeRequestDetails,
    // openModal: openRequestDetails,
  } = useModal();
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { getRoute } = useRoleRoute();

  const { data: _requestDetails, isLoading: _requestLoading } = useQuery<any>({
    queryKey: [`project-${requestId}-address`],
    enabled: !!requestId && !!userData?.token,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      setLoading(true);
      const res = await projectService.requestDetails({
        request_id: requestId,
      });
      setLoading(false);

      // Compute progress using current_stage (new logic)
      const currentStage: string | undefined = res?.data?.data?.current_stage;
      const stageOrder = [
        "Application Submission",
        "Secretariat Review",
        "Coordinator Review",
        "Financial Review",
        "Calculation Notes Transmission",
        "FO Preparation",
        "Transmission to Secretariat",
        "Coordinator Final Validation",
        "Ministerial Review",
        "Title Generation",
      ];
      const normalize = (s: string) => s.toLowerCase().trim();

      // Find the index of the current stage
      const currentStageIndex = (() => {
        if (!currentStage || normalize(String(currentStage)) === "null") {
          return 0; // Default to first stage if no current stage
        }
        const idx = stageOrder.findIndex(
          (s) => normalize(s) === normalize(String(currentStage))
        );
        return idx < 0 ? 0 : idx;
      })();

      const newSteps: ProgressStep[] = getProgressSteps(t).map(
        (step, index) => {
          if (index < currentStageIndex) {
            return { ...step, status: "completed" }; // Previous stages are completed (green)
          } else if (index === currentStageIndex) {
            return { ...step, status: "current" }; // Current stage is orange
          } else {
            return { ...step, status: "pending" }; // Future stages are pending
          }
        }
      );

      setSteps(newSteps);
      setRequestData(res.data.data);
      return res.data;
    },
  });

  useEffect(() => {
    if (!requestData?.tracks) return;

    const tracksForHistory = getVisibleTracks(requestData.tracks as any, {
      preserveAll: true,
    });
    const res = transformTracksToHistory(tracksForHistory as any, {
      includeStatus: false,
      lastEntrySubStatus: requestData?.sub_status
        ? translateSubStatus(requestData?.sub_status)
        : undefined,
      translateStatus: (status: string) => translateStage(status),
      labels: {
        approvedAt: t("approved_at"),
        remarks: t("remarks"),
        comment: t("comment"),
        subStatus: t("sub_status"),
      },
    });
    setHistory(res);
  }, [requestData, i18n.language]);

  // Recompute progress steps and history on language change without page refresh
  useEffect(() => {
    // Update moment locale for date/time formatting in history
    moment.locale(i18n.language === "fr" ? "fr" : "en");

    // Rebuild steps with translated titles based on current_stage
    if (requestData) {
      const stageOrder = [
        "Application Submission",
        "Secretariat Review",
        "Coordinator Review",
        "Financial Review",
        "Calculation Notes Transmission",
        "FO Preparation",
        "Transmission to Secretariat",
        "Coordinator Final Validation",
        "Ministerial Review",
        "Title Generation",
      ];
      const normalize = (s: string) => s.toLowerCase().trim();
      const currentStage = requestData.current_stage;

      // Find the index of the current stage
      const currentStageIndex = (() => {
        if (!currentStage || normalize(String(currentStage)) === "null") {
          return 0; // Default to first stage if no current stage
        }
        const idx = stageOrder.findIndex(
          (s) => normalize(s) === normalize(String(currentStage))
        );
        return idx < 0 ? 0 : idx;
      })();

      const newSteps: ProgressStep[] = getProgressSteps(t).map(
        (step, index) => {
          if (index < currentStageIndex) {
            return { ...step, status: "completed" }; // Previous stages are completed (green)
          } else if (index === currentStageIndex) {
            return { ...step, status: "current" }; // Current stage is orange
          } else {
            return { ...step, status: "pending" }; // Future stages are pending
          }
        }
      );
      setSteps(newSteps);

      // Recompute history to apply new locale formatting (tracks still used for history)
      if (requestData.tracks) {
        const tracksForHistory = getVisibleTracks(requestData.tracks as any, {
          preserveAll: true,
        });
        const historyItems = transformTracksToHistory(tracksForHistory as any, {
          includeStatus: false,
          lastEntrySubStatus: requestData?.sub_status
            ? translateSubStatus(requestData?.sub_status)
            : undefined,
          translateStatus: (status: string) => translateStage(status),
          labels: {
            approvedAt: t("approved_at"),
            remarks: t("remarks"),
            comment: t("comment"),
            subStatus: t("sub_status"),
          },
        });
        setHistory(historyItems);
      }
    }
  }, [i18n.language, requestData?.current_stage, requestData?.tracks]);

  useEffect(() => {
    const user = localStorageService.getUser() || "";
    setUserData(JSON.parse(user));
  }, []);

  // Map backend stage names to i18n keys, then to localized strings
  const translateStage = (status: string) => {
    const map: Record<string, string> = {
      "Application Submission": "application_submission",
      "Secretariat Review": "secretariat_review",
      "Coordinator Review": "coordinator_review",
      "Financial Review": "financial_review",
      "Calculation Notes Transmission": "calculation_notes_transmission",
      "FO Preparation": "fo_preparation",
      "Transmission to Secretariat": "transmission_to_secretariat",
      "Coordinator Final Validation": "coordinator_final_validation",
      "Ministerial Review": "ministerial_review",
      "Title Generation": "title_generation",
    };
    const key = map[status] || status;
    return map[status] ? t(key) : status;
  };

  const translateSubStatus = (sub: string) => {
    if (!sub) return "";
    const norm = sub.toLowerCase().trim();
    const map: Record<string, string> = {
      request_info: "status_request_info",
      requestinfo: "status_request_info",
      approved: "status_approved",
      completed: "status_approved",
      success: "status_approved",
      rejected: "status_rejected",
      reject: "status_rejected",
      draft: "status_draft",
      publish: "status_publish",
      published: "status_publish",
      schedule: "status_schedule",
      scheduled: "status_schedule",
      expired: "status_expired",
      progress: "status_progress",
      inprogress: "status_progress",
      in_progress: "status_progress",
      pending: "status_progress",
      processing: "status_progress",
    };
    return map[norm]
      ? t(map[norm])
      : sub.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const crumbs = [
    { label: "dashboard", path: getRoute("dashboard") },
    {
      label: "project_details",
      path: requestData
        ? `/project-details/${requestData && requestData.project_id}`
        : "",
    },
    { label: "request_details", path: "" }, // current page, no link
  ];

  return (
    <div>
      {!requestData || _requestLoading ? (
        <AppLayout>
          <RequestDetailsSkeleton />
        </AppLayout>
      ) : (
        <AppLayout>
          <div className="px-4 md:px-8 py-6">
            <div className="mb-6">
              <div className="cursor-pointer mb-4">
                <Breadcrumbs crumbs={crumbs} />
              </div>
              <Typography
                size="xl_2"
                weight="extrabold"
                className="text-secondary-100"
              >
                {t("request_details")} #{" "}
                {requestData ? requestData.unique_number : ""}
              </Typography>
            </div>

            {/* Project and Contract Information Cards */}
            {requestData &&
              (requestData.project_name || requestData.contract_name) && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Project Information Card */}
                    {requestData.project_name && requestData.project_id && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-primary-150 rounded-lg flex items-center justify-center">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="text-white"
                                >
                                  <path
                                    d="M19 21V5C19 4.44772 18.5523 4 18 4H6C5.44772 4 5 4.44772 5 5V21L12 17L19 21Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <Typography
                                  size="xs"
                                  weight="semibold"
                                  className="text-primary-150 uppercase tracking-wide"
                                >
                                  {t("selected_project")}
                                </Typography>
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              </div>
                              <Typography
                                size="base"
                                weight="semibold"
                                className="text-gray-900 mb-2"
                              >
                                {requestData.project_name}
                              </Typography>
                              {/* Project Amount */}
                              <div className="flex items-center space-x-2">
                                <Typography
                                  size="xs"
                                  weight="semibold"
                                  className="text-gray-600"
                                >
                                  {t("project_amount")}:
                                </Typography>
                                <div className="flex items-center space-x-2">
                                  {(requestData?.amount_summary
                                    ?.contract_currency || "USD") === "USD" ? (
                                    <USFlag width={20} height={12} />
                                  ) : (
                                    <CDFFlag width={20} height={12} />
                                  )}
                                  <Typography
                                    size="xs"
                                    weight="semibold"
                                    className="text-gray-600"
                                  >
                                    {requestData?.amount_summary
                                      ?.contract_currency || "USD"}
                                  </Typography>
                                  <Typography
                                    size="sm"
                                    weight="bold"
                                    className="text-gray-900"
                                  >
                                    {requestData?.project_amount
                                      ? formatAmount(requestData.project_amount)
                                      : "0"}
                                  </Typography>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-3">
                            <Button
                              variant="outline"
                              onClick={() =>
                                navigate(
                                  `${getRoute("projectDetails")}/${
                                    requestData.project_id
                                  }`
                                )
                              }
                              className="px-3 py-2 text-primary-150 border border-primary-150 rounded-md hover:bg-primary-150 hover:text-white transition-all duration-200 flex items-center space-x-2 text-sm font-medium group"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="transition-transform group-hover:scale-110"
                              >
                                <path
                                  d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="3"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                              </svg>
                              <span>{t("view_project")}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Contract Information Card */}
                    {requestData.contract_name && requestData.contract_id && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-primary-150 rounded-lg flex items-center justify-center">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="text-white"
                                >
                                  <path
                                    d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M14 2V8H20"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <Typography
                                  size="xs"
                                  weight="semibold"
                                  className="text-primary-150 uppercase tracking-wide"
                                >
                                  {t("selected_contract")}
                                </Typography>
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              </div>
                              <Typography
                                size="base"
                                weight="semibold"
                                className="text-gray-900 mb-2"
                              >
                                {requestData.contract_name}
                              </Typography>
                              {/* Contract Amount */}
                              <div className="flex items-center space-x-2">
                                <Typography
                                  size="xs"
                                  weight="semibold"
                                  className="text-gray-600"
                                >
                                  {t("contract_amount")}:
                                </Typography>
                                <div className="flex items-center space-x-2">
                                  {(requestData?.amount_summary
                                    ?.contract_currency || "USD") === "USD" ? (
                                    <USFlag width={20} height={12} />
                                  ) : (
                                    <CDFFlag width={20} height={12} />
                                  )}
                                  <Typography
                                    size="xs"
                                    weight="semibold"
                                    className="text-gray-600"
                                  >
                                    {requestData?.amount_summary
                                      ?.contract_currency || "USD"}
                                  </Typography>
                                  <Typography
                                    size="sm"
                                    weight="bold"
                                    className="text-gray-900"
                                  >
                                    {requestData?.contract_amount
                                      ? formatAmount(
                                          requestData.contract_amount
                                        )
                                      : "0"}
                                  </Typography>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-3">
                            <Button
                              variant="outline"
                              onClick={() =>
                                navigate(
                                  `${getRoute("contractDetails")}/${
                                    requestData.contract_id
                                  }`
                                )
                              }
                              className="px-3 py-2 text-primary-150 border border-primary-150 rounded-md hover:bg-primary-150 hover:text-white transition-all duration-200 flex items-center space-x-2 text-sm font-medium group"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="transition-transform group-hover:scale-110"
                              >
                                <path
                                  d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="3"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                              </svg>
                              <span>{t("view_contract")}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Statistics Cards - moved outside main content box */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashBoardCard
                  icon={<BlueCopyIcon width={44} height={44} />}
                  count={requestData ? requestData.entities.length : 0}
                  title={t("total_entity")}
                />
                <DashBoardCard
                  icon={
                    <CurrencyBadge
                      currency={
                        (requestData?.amount_summary.contract_currency as
                          | "USD"
                          | "CDF") || "USD"
                      }
                      variant="green"
                      width={44}
                      height={44}
                    />
                  }
                  count={
                    requestData ? requestData?.amount_summary?.total_amount : 0
                  }
                  title={t("total_amount")}
                />
                <DashBoardCard
                  icon={
                    <CurrencyBadge
                      currency={
                        (requestData?.amount_summary.contract_currency as
                          | "USD"
                          | "CDF") || "USD"
                      }
                      variant="violet"
                      width={44}
                      height={44}
                    />
                  }
                  count={
                    requestData ? requestData?.amount_summary?.total_tax : 0
                  }
                  title={t("total_coverage_amount")}
                />
                <DashBoardCard
                  icon={
                    <CurrencyBadge
                      currency={
                        (requestData?.amount_summary.contract_currency as
                          | "USD"
                          | "CDF") || "USD"
                      }
                      variant="orange"
                      width={44}
                      height={44}
                    />
                  }
                  count={
                    requestData ? requestData?.amount_summary?.vat_included : 0
                  }
                  title={t("total_amount_with_tax")}
                />
              </div>
            </div>

            <div className="flex gap-6">
              <div>
                <RequestProgress steps={steps} />
              </div>
              <div className="flex flex-col gap-6">
                <div className="border border-secondary-30 bg-white rounded-lg">
                  <div className="px-4 md:px-6 py-5 ">
                    <div className="flex justify-between items-center">
                      <Typography
                        size="base"
                        weight="bold"
                        className="text-secondary-100"
                      >
                        {t("request_details")}
                      </Typography>
                    </div>
                  </div>

                  {/* Details List - cards moved outside */}
                  <div className="px-4 md:px-6 py-5">
                    <div className="space-y-4">
                      {/* <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                        <Typography
                          className="text-secondary-60 min-w-[100px]"
                          size="sm"
                        >
                          {t("amount")}
                        </Typography>
                        <div className="flex items-center gap-2">
                          {(requestData?.amount_summary.contract_currency ||
                            "USD") === "USD" ? (
                            <USFlag width={20} height={12} />
                          ) : (
                            <CDFFlag width={20} height={12} />
                          )}
                          <span className="text-gray-600 text-sm">
                            {requestData?.amount_summary.contract_currency ||
                              "USD"}
                          </span>
                          <Typography className="text-secondary-100" size="sm">
                            {requestData
                              ? requestData.amount_summary.total_amount
                              : 0}
                          </Typography>
                        </div>
                      </div> */}

                      <div className="flex flex-col md:flex-row gap-2 md:gap-8">
                        <Typography
                          className="text-secondary-60 min-w-[100px] flex-shrink-0"
                          size="sm"
                        >
                          {t("location")}
                          {requestData?.addresses &&
                          requestData.addresses.length > 1
                            ? "es"
                            : ""}
                        </Typography>
                        <div className="text-secondary-100 text-sm flex-1">
                          {requestData ? (
                            requestData.addresses &&
                            Array.isArray(requestData.addresses) &&
                            requestData.addresses.length > 0 ? (
                              <div className="space-y-2">
                                {requestData.addresses.map(
                                  (addr: any, index: number) => (
                                    <div
                                      key={index}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full flex-shrink-0 mt-0.5">
                                        {index + 1}
                                      </span>
                                      <span className="break-words">
                                        {[
                                          addr.city,
                                          addr.municipality,
                                          addr.country,
                                          addr.providence,
                                        ]
                                          .filter(
                                            (val) => val && val.trim() !== ""
                                          )
                                          .join(", ")}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : requestData.address ? (
                              // Fallback to single address for backward compatibility
                              <span className="break-words">
                                {[
                                  requestData.address.country,
                                  requestData.address.providence,
                                  requestData.address.city,
                                  requestData.address.municipality,
                                ]
                                  .filter((val) => val && val.trim() !== "")
                                  .join(", ")}
                              </span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Typography className="text-secondary-60" size="sm">
                          {t("invoice_files")}
                        </Typography>
                        {requestData &&
                        requestData?.files &&
                        requestData.files.length > 0 ? (
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                                    {t("sr_no")}
                                  </th>
                                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                                    {t("document_name")}
                                  </th>
                                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                                    {t("action")}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {requestData.files.map((f, index) => (
                                  <tr key={f.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm text-gray-900">
                                      {index + 1}
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-2">
                                        <PdfIcon width={16} height={16} />
                                        <Typography
                                          size="sm"
                                          className="text-gray-900"
                                        >
                                          {f.original_name ||
                                            f.name ||
                                            "Document"}
                                        </Typography>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <a
                                        href={f.file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors"
                                      >
                                        {t("view")}
                                      </a>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm py-4">
                            {t("no_documents_available")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Request Letter Section */}
                  <div className="px-4 md:px-6 py-5 border-t border-gray-100">
                    <Typography
                      size="base"
                      weight="semibold"
                      className="text-secondary-100 mb-4"
                    >
                      {t("request_latter")}
                    </Typography>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <Typography
                        size="sm"
                        weight="normal"
                        className="text-secondary-60"
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: requestData.request_letter,
                          }}
                        ></div>
                      </Typography>
                    </div>
                  </div>

                  {/* Entity Table Section */}
                  <div className="px-4 md:px-6 py-5 border-t border-gray-100">
                    <div className="overflow-x-auto">
                      <CreateRequestTable
                        data={
                          requestData.entities?.map((entity, index) => {
                            const mappedEntity = {
                              id: index + 1,
                              label: entity.label,
                              quantity: entity.quantity,
                              unitPrice: entity.unit_price,
                              unit: entity.unit,
                              unit_price: entity.unit_price,
                              total: entity.total,
                              taxRate: entity.tax_rate,
                              tax_rate: entity.tax_rate,
                              taxAmount: entity.tax_amount,
                              tax_amount: entity.tax_amount,
                              vatIncluded: entity.vat_included,
                              vat_included: entity.vat_included,
                              reference: (entity as any).reference || "", // Add reference field mapping
                              tarrifPosition:
                                (entity as any).tarrif_position || "", // Add tarrif position field mapping
                              customDuty: (entity as any).custom_duties,
                              custom_duty: (entity as any).custom_duties,
                              currency:
                                requestData.amount_summary.contract_currency,
                            };
                            console.log("🚀 Mapped entity with unit:", {
                              original: entity,
                              mapped: mappedEntity,
                            });
                            return mappedEntity;
                          }) || []
                        }
                        showActions={false}
                        currentTaxCategory={requestData.tax_category}
                      />
                    </div>
                  </div>
                </div>
                <div className="border border-secondary-30 bg-white rounded-lg">
                  <Typography size="base" weight="bold" className="p-4">
                    {t("history")}
                  </Typography>
                  <History items={history} />
                </div>
              </div>
            </div>
          </div>
        </AppLayout>
      )}

      {requestData && (
        <RequestDetailModal
          isOpen={isOpenRequestDetails}
          onClose={closeRequestDetails}
          requestDetails={requestData}
        />
      )}
    </div>
  );
};
export default TestRequestDetails;
