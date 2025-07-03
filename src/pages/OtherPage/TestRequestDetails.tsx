import { useTranslation } from "react-i18next";
import {
  BlueCopyIcon,
  CommentRemarkIcon,
  CommentRemarkIconFrench,
  MenuListIcon,
  MenuListIconFrench,
  PdfIcon,
  RequestProgressIcon,
  RequestProgressIconFrench,
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
import CommentData from "../../components/dashboard/CommentData";
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

interface CommentDataProps {
  data: CommentProps[];
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
    comment: "Not eligible for exemption as the applicant is a for-profit entity. Rejected with appropriate reasoning.",
    timestamp: "Yesterday",
  },
  {
    initial: "JW",
    username: "Jenny Wilson",
    comment: "Request under review. Pending legal team's clarification on eligibility criteria for one-time event-based exemptions.",
    timestamp: "May 28, 2025",
  },
  {
    initial: "CF",
    username: "Cody Fisher",
    comment: "Verified PAN and registration certificate. Cause is genuine and aligns with approved tax-exempt activities. Forwarded to accounts team for further processing.",
    timestamp: "May 21, 2025",
  },
];

const TestRequestDetails = () => {
  const [userData, setUserData] = useState<UserData | undefined>();
  const [requestData,setRequestData]=useState<RequestDetails|null>(null)
  const [loading, setLoading] = useState(true);

  const { t, i18n } = useTranslation();
  const {requestId} = useParams();

  
  const { data: _requestDetails } =
    useQuery<any>({
      queryKey: [`project-${requestId}-address`],
      enabled: !!requestId && !!userData?.token,
      queryFn: async () => {
        setLoading(true)
        const res = await projectService.requestDetails({
          request_id: requestId,
        });      
        setLoading(false)          
        console.log(res.data.data);
          
        setRequestData(res.data.data)
        return res.data;
      },
    });

  useEffect(() => {
    const user = localStorageService.getUser() || "";
    setUserData(JSON.parse(user));
  }, []);
  if (loading) return <div className="p-8">Loading...</div>;
  return (
    <div>
      <AppLayout>
        <div className="px-4 md:px-8 py-6">
          <div className="mb-6">
            <div className="cursor-pointer mb-4">
              {i18n.language === "en" ? (
                <MenuListIcon
                  width="100%"
                  height={30}
                  className="max-w-[700px]"
                />
              ) : (
                <MenuListIconFrench
                  width="100%"
                  height={30}
                  className="max-w-[700px]"
                />
              )}
            </div>
            <Typography
              size="xl_2"
              weight="extrabold"
              className="text-secondary-100">
              {t("request_details")} # {requestData?requestData.unique_number:""}
            </Typography>
          </div>
          <div className="flex gap-6">
            <div>
              {/* {i18n.language === "en" ? (
                <RequestProgressIcon
                  width="100%"
                  height="100%"
                  viewBox="0 0 307 870"
                />
              ) : (
                <RequestProgressIconFrench
                  width="100%"
                  height="100%"
                  viewBox="0 0 307 870"
                />
              )} */}
              <RequestProgress steps={progressSteps} />
            </div>
            <div className="flex flex-col gap-6">
              <div className="border border-secondary-30 bg-white rounded-lg">
                <div className="px-4 md:px-6 py-5 ">
                  <div className="flex justify-between items-center">
                    <Typography
                      size="base"
                      weight="bold"
                      className="text-secondary-100">
                      {t("request_details")}
                    </Typography>
                    <Button variant="outline" className="px-4 py-2 w-fit">
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
                      title={t("total_entity")}
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
                        requestData ? requestData?.amount_summary?.total_tax : 0
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
                        size="sm">
                        {t("amount")}
                      </Typography>
                      <Typography className="text-secondary-100" size="sm">
                        {requestData?requestData.amount_summary.total_amount:0}
                      </Typography>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                      <Typography
                        className="text-secondary-60 min-w-[100px]"
                        size="sm">
                        {t("address")}
                      </Typography>
                      <Typography className="text-secondary-100" size="sm">
                        {requestData?[
                          requestData.address?.country,
                          requestData.address?.providence,
                          requestData.address?.city,
                          requestData.address?.municipality,
                        ]
                          .filter((val) => val && val.trim() !== "")
                          .join(", ") : "-"}
                      </Typography>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
                      <Typography
                        className="text-secondary-60 min-w-[100px]"
                        size="sm">
                        {t("invoice_files")}
                      </Typography>
                      <div className="flex flex-wrap gap-2">
                        <div className="inline-flex items-center gap-2 border border-secondary-60 rounded-full px-3 py-1.5 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                          <PdfIcon width={12} height={12} />
                          <Typography
                            size="xs"
                            weight="semibold"
                            className="text-secondary-100 whitespace-nowrap">
                            Taxe 2025_fichier.pdf
                            <span className="text-secondary-60 ml-1">
                              (5.3MB)
                            </span>
                          </Typography>
                        </div>
                        {/* Add more invoice files here if needed */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div>
                {i18n.language === "en" ? (
                  <CommentRemarkIcon width="100%" height="100%" />
                ) : (
                  <CommentRemarkIconFrench width="100%" height="100%" />
                )} */}
                {/* <CommentData data={comments}/>                 */}
              {/* </div> */}
            </div>
          </div>
        </div>
      </AppLayout>
    </div>
  );
};
export default TestRequestDetails;
