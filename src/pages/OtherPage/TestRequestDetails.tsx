import { useTranslation } from "react-i18next";
import {
  BlueCopyIcon,
  PdfIcon,
  USFlag,
  CDFFlag,
  // PdfIcon,
} from "../../icons";
import AppLayout from "../../layout/AppLayout";
import Typography from "../../lib/components/atoms/Typography";
import DashBoardCard from "../../lib/components/molecules/DashBoardCard";
import { useQuery } from "@tanstack/react-query";
import projectService from "../../services/project.service";

import { useEffect, useState } from "react";
import localStorageService from "../../services/local.service";
import { useParams } from "react-router";
import RequestProgress from "../../components/dashboard/ProgressStep";
import { useModal } from "../../hooks/useModal";
import RequestDetailModal from "../../components/modal/RequestDetailModal";
import History from "../../components/dashboard/History";
import { useLoading } from "../../context/LoaderProvider";
import { transformTracksToHistory, TrackItem } from "../../utils/historyUtils";
import { HistoryItem } from "../../components/dashboard/History";
import { useRoleRoute } from "../../hooks/useRoleRoute";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import CreateRequestTable from "../../components/table/CreateRequestTable.tsx";
import { RequestDetailsSkeleton } from "../../components/common/skeletons";
import CurrencyBadge from "../../components/common/CurrencyBadge";
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
  unit_price: number;
  total: number;
  tax_rate: number;
  tax_amount: number;
  vat_included: number;
  financial_authority: string;
  status: string;
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
  request_letter: string;
  address?: RequestAddress; // Single address (for backward compatibility)
  addresses?: RequestAddress[]; // Multiple addresses (new format)
  address_ids?: string; // Comma-separated string of address IDs
  entities: RequestEntity[];
  amount_summary: AmountSummary;
  files?: any[];
  tracks: TrackItem[];
  contract_currency?: string; // Currency from contract
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
  const { t } = useTranslation();
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

      const tracks = res.data.data.tracks;
      const trackLength = tracks.length;

      const newSteps: ProgressStep[] = getProgressSteps(t).map(
        (step, index) => {
          let status: ProgressStep["status"];

          // Application Submission (index 0) is always completed since API starts from Secretariat Review
          if (index === 0) {
            status = "completed";
          }
          // Map API tracks to steps starting from index 1 (Secretariat Review)
          else if (index - 1 < trackLength) {
            const currentTrack = tracks[index - 1]; // Offset by 1 since API starts from Secretariat Review
            if (currentTrack?.status === "Rejected") {
              status = "pending"; // If rejected, mark as pending
            } else {
              status = "completed"; // Otherwise completed
            }
          } else if (index - 1 === trackLength) {
            // This is the current step (next step to be processed)
            status = "current";
          } else {
            // Future steps are pending
            status = "pending";
          }

          return {
            ...step,
            status,
          };
        }
      );
      setSteps(newSteps);
      setRequestData(res.data.data);
      return res.data;
    },
  });

  useEffect(() => {
    if (!requestData?.tracks) return;

    const res = transformTracksToHistory(requestData.tracks);
    setHistory(res);
  }, [requestData]);

  useEffect(() => {
    const user = localStorageService.getUser() || "";
    setUserData(JSON.parse(user));
  }, []);

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
                  title={t("total_tax_amount")}
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
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                        <Typography
                          className="text-secondary-60 min-w-[100px]"
                          size="sm"
                        >
                          {t("amount")}
                        </Typography>
                        <div className="flex items-center gap-2">
                          {(requestData?.amount_summary.contract_currency || "USD") === "USD" ? (
                            <USFlag width={20} height={12} />
                          ) : (
                            <CDFFlag width={20} height={12} />
                          )}
                          <span className="text-gray-600 text-sm">
                            {requestData?.amount_summary.contract_currency || "USD"}
                          </span>
                          <Typography className="text-secondary-100" size="sm">
                            {requestData
                              ? requestData.amount_summary.total_amount
                              : 0}
                          </Typography>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-2 md:gap-8">
                        <Typography
                          className="text-secondary-60 min-w-[100px] flex-shrink-0"
                          size="sm"
                        >
                          {t("address")}
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
                          requestData.entities?.map((entity, index) => ({
                            id: index + 1,
                            label: entity.label,
                            quantity: entity.quantity,
                            unitPrice: entity.unit_price,
                            unit_price: entity.unit_price,
                            total: entity.total,
                            taxRate: entity.tax_rate,
                            tax_rate: entity.tax_rate,
                            taxAmount: entity.tax_amount,
                            tax_amount: entity.tax_amount,
                            vatIncluded: entity.vat_included,
                            vat_included: entity.vat_included,
                            customDuty: (entity as any).custom_duties,
                            custom_duty: (entity as any).custom_duties,
                            currency: requestData.amount_summary.contract_currency,
                          })) || []
                        }
                        showActions={false}
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
