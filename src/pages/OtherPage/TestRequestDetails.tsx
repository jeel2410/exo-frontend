import { useTranslation } from "react-i18next";
import {
  BlueCopyIcon,
  PdfIcon,
  // PdfIcon,
  UsdGreenIcon,
  UsdOrangeIcon,
  UsdVioletIcon,
} from "../../icons";
import AppLayout from "../../layout/AppLayout";
import Button from "../../lib/components/atoms/Button";
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
import moment from "moment";
import { useLoading } from "../../context/LoaderProvider";
import { useRoleRoute } from "../../hooks/useRoleRoute";
import Breadcrumbs from "../../components/common/Breadcrumbs";
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
}

export interface RequestDetails {
  id: string;
  unique_number: string;
  status: string;
  project_id: string;
  request_letter: string;
  address: RequestAddress;
  entities: RequestEntity[];
  amount_summary: AmountSummary;
  files?: any[];
  tracks: any[]; // Use a specific interface if `tracks` has a defined shape
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

export const progressSteps: ProgressStep[] = [
  { id: 1, title: "Secretariat Review", status: "current" },
  { id: 2, title: "Coordinator Review", status: "pending" },
  { id: 3, title: "Financial Review", status: "pending" },
  { id: 4, title: "Draft Report Preparation", status: "pending" },
  { id: 5, title: "Transmission Letter Drafting", status: "pending" },
  { id: 6, title: "Minister Validation", status: "pending" },
  { id: 7, title: "Document Generation", status: "pending" },
  { id: 8, title: "Final Delivery", status: "pending" },
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
  const [userData, setUserData] = useState<UserData | undefined>();
  const [requestData, setRequestData] = useState<RequestDetails | null>(null);
  const { setLoading } = useLoading();
  const [steps, setSteps] = useState<ProgressStep[]>(progressSteps);
  const {
    isOpen: isOpenRequestDetails,
    closeModal: closeRequestDetails,
    openModal: openRequestDetails,
  } = useModal();

  const { t } = useTranslation();
  const { requestId } = useParams();
  const [history, setHistory] = useState([]);
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

      const newSteps: ProgressStep[] = steps.map((step, index) => {
        let status: ProgressStep["status"];

        if (index < trackLength) {
          status = "completed";
        } else if (
          index === trackLength &&
          tracks[trackLength]?.status !== "Rejected"
        ) {
          status = "current";
        } else {
          status = "pending";
        }
        if (tracks[index]?.status === "Rejected") {
          status = "pending";
        }
        return {
          ...step,
          status,
        };
      });
      setSteps(newSteps);
      setRequestData(res.data.data);
      return res.data;
    },
  });

  useEffect(() => {
    if (!requestData?.tracks) return;

    const res = requestData.tracks.map((t, index) => ({
      id: index,
      date: moment(t.created_at).format("YYYY-MM-DD"),
      time: moment(t.created_at).format("HH:mm:ss"),
      title: t.status,
    })) as [];

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
        ? `/web/project-details/${requestData && requestData.project_id}`
        : "",
    },
    { label: "request_details", path: "" }, // current page, no link
  ];

  return (
    <div>
      {requestData && (
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
                      <Button
                        variant="outline"
                        className="px-4 py-2 w-fit"
                        onClick={openRequestDetails}
                      >
                        {t("view_more")}
                      </Button>
                    </div>
                  </div>

                  {/* Cards Grid */}
                  <div className="px-4 md:px-6 py-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <DashBoardCard
                        icon={<BlueCopyIcon width={44} height={44} />}
                        count={
                          requestData
                            ? requestData?.amount_summary?.total_quantity
                            : 0
                        }
                        title={t("total_quantity")}
                      />
                      <DashBoardCard
                        icon={<UsdGreenIcon width={44} height={44} />}
                        count={
                          requestData
                            ? requestData?.amount_summary?.total_amount
                            : 0
                        }
                        title={t("total_amount")}
                      />
                      <DashBoardCard
                        icon={<UsdVioletIcon width={44} height={44} />}
                        count={
                          requestData
                            ? requestData?.amount_summary?.total_tax
                            : 0
                        }
                        title={t("total_tax_amount")}
                      />
                      <DashBoardCard
                        icon={<UsdOrangeIcon width={44} height={44} />}
                        count={
                          requestData
                            ? requestData?.amount_summary?.vat_included
                            : 0
                        }
                        title={t("total_amount_with_tax")}
                      />
                    </div>

                    {/* Details List */}
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                        <Typography
                          className="text-secondary-60 min-w-[100px]"
                          size="sm"
                        >
                          {t("amount")}
                        </Typography>
                        <Typography className="text-secondary-100" size="sm">
                          {requestData
                            ? requestData.amount_summary.total_amount
                            : 0}
                        </Typography>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                        <Typography
                          className="text-secondary-60 min-w-[100px]"
                          size="sm"
                        >
                          {t("address")}
                        </Typography>
                        <Typography className="text-secondary-100" size="sm">
                          {requestData
                            ? [
                                requestData.address?.country,
                                requestData.address?.providence,
                                requestData.address?.city,
                                requestData.address?.municipality,
                              ]
                                .filter((val) => val && val.trim() !== "")
                                .join(", ")
                            : "-"}
                        </Typography>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
                        <Typography
                          className="text-secondary-60 min-w-[100px]"
                          size="sm"
                        >
                          {t("invoice_files")}
                        </Typography>
                        <div className="flex flex-wrap gap-2">
                          {requestData &&
                            requestData?.files?.map((f) => {
                              return (
                                <div className="inline-flex items-center gap-2 border border-secondary-60 rounded-full px-3 py-1.5 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                                  <PdfIcon width={12} height={12} />
                                  <Typography
                                    size="xs"
                                    weight="semibold"
                                    className="text-secondary-100 whitespace-nowrap"
                                  >
                                    {f.original_name}
                                    <span className="text-secondary-60 ml-1">
                                      {(f.size / (1024 * 1024)).toFixed(2)}MB
                                    </span>
                                  </Typography>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border border-secondary-30 bg-white rounded-lg">
                  <Typography size="base" weight="bold" className="p-4">
                    History
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
