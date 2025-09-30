import { useTranslation } from "react-i18next";
import Typography from "../../../lib/components/atoms/Typography";
import Label from "../../../lib/components/atoms/Label";
import { ContractReviewData } from "../../../pages/Dashboard/contractor/ContractCreatePage";
import { formatAmount as formatAmountUtil } from "../../../utils/numberFormat";

interface Address {
  id: string;
  country?: string;
  providence?: string;
  city?: string;
  municipality?: string;
}

interface ReviewFormProps {
  projectData: ContractReviewData;
}

const ContractReviewForm = ({ projectData }: ReviewFormProps) => {
  const { t } = useTranslation();
  const formatAmount = (amount: string) => {
    if (!amount) return "";
    return formatAmountUtil(amount);
  };

  const formatDate = (date: any) => {
    if (!date) return "-";
    if (date instanceof Date) {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
    if (typeof date === "string") {
      if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        return date;
      }
      try {
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          const day = dateObj.getDate().toString().padStart(2, "0");
          const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
          const year = dateObj.getFullYear();
          return `${day}-${month}-${year}`;
        }
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    }
    return date?.toString() || "-";
  };

  const renderFileList = (files: any[] | undefined) => {
    if (!files || files.length === 0) return "-";
    const filesData = Array.isArray(files) ? files : files ? [files] : [];
    console.log(filesData, "filesData");

    return (
      <div className="flex flex-wrap gap-2">
        {filesData.map((file, index) => (
          <div
            key={index}
            className="inline-flex items-center bg-white border border-gray-200 rounded-full py-1 pl-2 pr-3"
          >
            <div className="flex items-center">
              <div className="bg-red-500 p-0.5 rounded text-white mr-1.5">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="text-xs text-secondary-100">
{file.original_name || file.file.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <Typography
          size="lg"
          weight="semibold"
          className="text-secondary-100 mb-2"
        >
          {t("review")}
        </Typography>
        <Typography size="base" weight="normal" className="text-secondary-60">
          {t(
            "please_review_all_the_details_from_the_previous_steps_before_submitting"
          )}
        </Typography>
      </div>
      <div className="border border-secondary-30 rounded-lg bg-white">
        {/* Project Info Section */}
        <div className="p-4">
          <Typography
            size="base"
            weight="semibold"
            className="text-secondary-100 mb-4"
          >
            {t("project_info")}
          </Typography>

          <div className="space-y-3">
            <div className="flex">
              <div className="w-1/3 text-secondary-60">
                <Label>{t("project_name")}</Label>
              </div>
              <div className="w-2/3 text-secondary-100">
                {projectData.projectName || "-"}
              </div>
            </div>
            <div className="flex">
              <div className="w-1/3 text-secondary-60">
                <Label>{t("project_reference")}</Label>
              </div>
              <div className="w-2/3 text-secondary-100">
                {projectData.reference || "-"}
              </div>
            </div>
            <div className="flex">
              <div className="w-1/3 text-secondary-60">
                <Label>{t("amount")}</Label>
              </div>
              <div className="w-2/3 text-secondary-100">
                <span className="text-gray-400">
                  {projectData?.currency || "USD"}{" "}
                </span>
                {formatAmount(projectData?.projectAmount)}
              </div>
            </div>
            <div className="flex">
              <div className="w-1/3 text-secondary-60">
                <Label>{t("project_begin_date")}</Label>
              </div>
              <div className="w-2/3 text-secondary-100">
                {formatDate(projectData?.beginDate) || "-"}
              </div>
            </div>
            <div className="flex">
              <div className="w-1/3 text-secondary-60">
                <Label>{t("project_end_date")}</Label>
              </div>
              <div className="w-2/3 text-secondary-100">
                {formatDate(projectData?.endDate) || "-"}
              </div>
            </div>
            <div className="flex">
              <div className="w-1/3 text-secondary-60">
                <Label>{t("description")}</Label>
              </div>
              <div
                className="w-2/3 text-secondary-100"
                dangerouslySetInnerHTML={{
                  __html: projectData.description || "-",
                }}
              />
            </div>
            <div className="flex">
              <div className="w-1/3 text-secondary-60">
                <Label>{t("upload_files")}</Label>
              </div>
              <div className="w-2/3 text-secondary-100">
                {renderFileList(projectData.projectFiles)}
              </div>
            </div>
            <div className="flex flex-col">
              <Label className="mb-2 text-secondary-60">{t("address")}</Label>
              <div className="overflow-x-auto rounded-lg">
                <div className="min-w-[600px] border border-secondary-30 rounded-lg">
                  <div className="grid grid-cols-5 bg-gray-50 py-3 px-4 text-sm text-secondary-60 border-b border-secondary-30">
                    {/* <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-5 h-5 mr-4 border border-gray-300 rounded"
                        disabled
                      />
                      <span>{t("sr_no")}</span>
                    </div> */}
                    <div>{t("country")}</div>
                    <div>{t("province")}</div>
                    <div>{t("city")}</div>
                    <div>{t("municipality")}</div>
                  </div>

                  {projectData.address && projectData.address.length > 0 ? (
                    projectData.address.map((address: Address) => (
                      <div
                        key={address.id}
                        className="grid grid-cols-5 py-3 px-4 border-b border-secondary-30 last:border-0"
                      >
                        {/* <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="w-5 h-5 mr-4 border border-gray-300 rounded"
                              disabled
                            />
                            <span>{index + 1}</span>
                          </div> */}
                        <div>{address.country || "-"}</div>
                        <div>{address.providence || "-"}</div>
                        <div>{address.city || "-"}</div>
                        <div>{address.municipality || "-"}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-secondary-60">
                      {t("no_addresses_added")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-px bg-secondary-30"></div>
        <div className="p-4">
          <Typography
            size="base"
            weight="semibold"
            className="text-secondary-100 mb-6"
          >
            {t("contract_info")}
          </Typography>

          {/* Basic Contract Information */}
          <div className="mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border mb-4">
              <Typography
                size="base"
                weight="semibold"
                className="text-secondary-100 mb-3"
              >
                {t("basic_contract_info")}
              </Typography>
              
              <div className="space-y-4">
                <div className="flex">
                  <div className="w-1/3 text-secondary-60">
                    <Label>{t("contract_name")}</Label>
                  </div>
                  <div className="w-2/3 text-secondary-100">
                    {projectData.contractName || "-"}
                  </div>
                </div>
                
                <div className="flex">
                  <div className="w-1/3 text-secondary-60">
                    <Label>{t("contract_reference")}</Label>
                  </div>
                  <div className="w-2/3 text-secondary-100">
                    {projectData.contractReference || "-"}
                  </div>
                </div>
                
                <div className="flex">
                  <div className="w-1/3 text-secondary-60">
                    <Label>{t("contract_amount")}</Label>
                  </div>
                  <div className="w-2/3 text-secondary-100">
                    <span className="text-gray-400">
                      {projectData.currency || "USD"}{" "}
                    </span>
                    {formatAmount(projectData.amount) || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contracting/Executing Agency */}
          <div className="mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border mb-4">
              <Typography
                size="base"
                weight="semibold"
                className="text-secondary-100 mb-3"
              >
                {t("contracting_executing_agency")}
              </Typography>
              
              <div className="space-y-3">
                <div className="flex">
                  <div className="w-1/3 text-secondary-60">
                    <Label>{t("agency_name")}</Label>
                  </div>
                  <div className="w-2/3 text-secondary-100">
                    {projectData.contractingAgencyName || "-"}
                  </div>
                </div>
                
                <div className="flex">
                  <div className="w-1/3 text-secondary-60">
                    <Label>{t("authorized_person_name")}</Label>
                  </div>
                  <div className="w-2/3 text-secondary-100">
                    {projectData.contractingAuthorizedPersonName || "-"}
                  </div>
                </div>
                
                <div className="flex">
                  <div className="w-1/3 text-secondary-60">
                    <Label>{t("authorized_person_title")}</Label>
                  </div>
                  <div className="w-2/3 text-secondary-100">
                    {projectData.contractingAuthorizedPersonPosition || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rewarded Company */}
          <div className="mb-6">
            <div className="bg-green-50 p-4 rounded-lg border mb-4">
              <Typography
                size="base"
                weight="semibold"
                className="text-secondary-100 mb-3"
              >
                {t("rewarded_company")}
              </Typography>
              
              <div className="space-y-3">
                <div className="flex">
                  <div className="w-1/3 text-secondary-60">
                    <Label>{t("company_name")}</Label>
                  </div>
                  <div className="w-2/3 text-secondary-100">
                    {projectData.rewardedCompanyName || "-"}
                  </div>
                </div>
                
                <div className="flex">
                  <div className="w-1/3 text-secondary-60">
                    <Label>{t("authorized_person_name")}</Label>
                  </div>
                  <div className="w-2/3 text-secondary-100">
                    {projectData.rewardedAuthorizedPersonName || "-"}
                  </div>
                </div>
                
                <div className="flex">
                  <div className="w-1/3 text-secondary-60">
                    <Label>{t("authorized_person_title")}</Label>
                  </div>
                  <div className="w-2/3 text-secondary-100">
                    {projectData.rewardedAuthorizedPersonPosition || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signing Details */}
          <div className="mb-6">
            <div className="bg-yellow-50 p-4 rounded-lg border mb-4">
              <Typography
                size="base"
                weight="semibold"
                className="text-secondary-100 mb-3"
              >
                {t("signing_details")}
              </Typography>
              
              <div className="space-y-3">
                <div className="flex">
                  <div className="w-1/3 text-secondary-60">
                    <Label>{t("date_of_signing")}</Label>
                  </div>
                  <div className="w-2/3 text-secondary-100">
                    {formatDate(projectData.dateOfSigning)}
                  </div>
                </div>
                
                <div className="flex">
                  <div className="w-1/3 text-secondary-60">
                    <Label>{t("place_of_signing")}</Label>
                  </div>
                  <div className="w-2/3 text-secondary-100">
                    {projectData.place || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Documents */}
          <div className="mb-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <Typography
                size="base"
                weight="semibold"
                className="text-secondary-100 mb-3"
              >
                {t("contract_documents")}
              </Typography>
              
              <div className="flex">
                <div className="w-1/3 text-secondary-60">
                  <Label>{t("upload_contract_files")}</Label>
                </div>
                <div className="w-2/3 text-secondary-100">
                  {renderFileList(projectData.contractFiles)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractReviewForm;
