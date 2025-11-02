import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AppLayout from "../../../layout/AppLayout";
import Stepper from "../../../components/common/Stepper";
import { useModal } from "../../../hooks/useModal";
import { ArrowLeftIcon, ArrowRightIconButton } from "../../../icons";
import Typography from "../../../lib/components/atoms/Typography";
import Button from "../../../lib/components/atoms/Button";
import ContractInfoForm from "../../../components/dashboard/contractor/ContractInfoForm";
import ContractReviewForm from "../../../components/dashboard/contractor/ContractReviewForm";
import CreateContractConfirmationModal from "../../../components/modal/CreateContractConfirmationModal";
import projectService from "../../../services/project.service";
import { UploadedFile } from "../../../components/common/UploadFile";
import { useLoading } from "../../../context/LoaderProvider";
import { useMutation } from "@tanstack/react-query";
import contractService from "../../../services/contract.service";
import moment from "moment";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { useRoleRoute } from "../../../hooks/useRoleRoute";
interface Address {
  id: string;
  country?: string;
  providence?: string;
  city?: string;
  municipality?: string;
}

export interface ContractReviewData {
  // Project info
  projectName: string;
  reference: string;
  projectAmount: string;
  projectCurrency: string;
  beginDate: string;
  endDate: string;
  description: string;
  projectFiles: UploadedFile[];
  address: Address[];

  // Contract basic info
  contractName: string;
  contractReference: string;
  amount: string;
  currency: string;

  // Contracting/Executing Agency
  contractingAgencyName: string;
  contractingAuthorizedPersonName: string;
  contractingAuthorizedPersonPosition: string;

  // Rewarded Company
  rewardedCompanyName: string;
  rewardedAuthorizedPersonName: string;
  rewardedAuthorizedPersonPosition: string;

  // Signing details
  dateOfSigning: string;
  place: string;
  contractFiles: UploadedFile[];

  // Legacy fields for backward compatibility
  signedBy?: string;
  position?: string;
  organization?: string;
}

const ContractReviewInitialValue = {
  // Project info
  projectName: "",
  reference: "",
  projectAmount: "",
  projectCurrency: "",
  beginDate: "",
  endDate: "",
  description: "",
  projectFiles: [],
  address: [],

  // Contract basic info
  contractName: "",
  contractReference: "",
  amount: "",
  currency: "",

  // Contracting/Executing Agency
  contractingAgencyName: "",
  contractingAuthorizedPersonName: "",
  contractingAuthorizedPersonPosition: "",

  // Rewarded Company
  rewardedCompanyName: "",
  rewardedAuthorizedPersonName: "",
  rewardedAuthorizedPersonPosition: "",

  // Signing details
  dateOfSigning: "",
  place: "",
  contractFiles: [],

  // Legacy fields
  signedBy: "",
  position: "",
  organization: "",
};

interface FormDataProps {
  // Contract basic info
  name: string;
  reference: string;
  amount: string;
  currency: string;

  // Contracting/Executing Agency
  contractingAgencyName: string;
  contractingAuthorizedPersonName: string;
  contractingAuthorizedPersonPosition: string;

  // Rewarded Company
  rewardedCompanyName: string;
  rewardedAuthorizedPersonName: string;
  rewardedAuthorizedPersonPosition: string;

  // Signing details
  dateOfSigning: string;
  place: string;
  contractFiles: UploadedFile[];

  // Legacy fields for backward compatibility
  signedBy?: string;
  position?: string;
  organization?: string;
}

const initialValue = {
  // Contract basic info
  name: "",
  reference: "",
  amount: "",
  currency: "USD",

  // Contracting/Executing Agency
  contractingAgencyName: "",
  contractingAuthorizedPersonName: "",
  contractingAuthorizedPersonPosition: "",

  // Rewarded Company
  rewardedCompanyName: "",
  rewardedAuthorizedPersonName: "",
  rewardedAuthorizedPersonPosition: "",

  // Signing details
  dateOfSigning: "",
  place: "",
  contractFiles: [],

  // Legacy fields
  signedBy: "",
  position: "",
  organization: "",
};

// Helper function to create contract API payload
const createContractPayload = (
  data: FormDataProps,
  projectId?: string,
  contractId?: string,
  editProjectId?: string,
  projectExchangeRate?: number
): FormData => {
  const files = data.contractFiles;
  const filesData = Array.isArray(files) ? files : files ? [files] : [];

  const payload = new FormData();

  // Calculate CDF amount and exchange rate
  const amount = parseFloat(data.amount.replace(/,/g, ""));
  let amountCdf: number;
  let exchangeRateUsed: number;

  if (data.currency === "CDF") {
    // For CDF currency
    amountCdf = amount;
    exchangeRateUsed = 1.0;
  } else {
    // For non-CDF currency, use project's exchange rate
    exchangeRateUsed = projectExchangeRate || 1.0;
    amountCdf = amount * exchangeRateUsed;
  }

  // Map new form fields to API fields
  payload.append("currency", data.currency);
  payload.append("amount", data.amount);
  payload.append("amount_cdf", amountCdf.toString());
  payload.append("exchange_rate_used", exchangeRateUsed.toString());
  payload.append("place", data.place);
  payload.append(
    "date_of_signing",
    moment(data.dateOfSigning, ["DD-MM-YYYY", "YYYY-MM-DD"], true).format(
      "YYYY-MM-DD"
    )
  );

  // Contracting/Executing Agency fields
  payload.append("contracting_agency_name", data.contractingAgencyName || "");
  payload.append(
    "contracting_agency_person_name",
    data.contractingAuthorizedPersonName || ""
  );
  payload.append(
    "contracting_agency_person_position",
    data.contractingAuthorizedPersonPosition || ""
  );

  // Awarded Company fields
  payload.append("awarded_company_name", data.rewardedCompanyName || "");
  payload.append(
    "awarded_company_person_name",
    data.rewardedAuthorizedPersonName || ""
  );
  payload.append(
    "awarded_company_person_position",
    data.rewardedAuthorizedPersonPosition || ""
  );

  // Document files
  payload.append(
    "document_ids",
    filesData.map((file: any) => file.id).join(",")
  );

  // Contract basic info (keeping for backward compatibility)
  payload.append("reference", data.reference);
  payload.append("name", data.name);

  // Project ID
  if (projectId) {
    payload.append("project_id", projectId);
  }
  if (contractId && editProjectId) {
    payload.append("project_id", editProjectId);
    payload.append("contract_id", contractId);
  }

  return payload;
};

// Function to map backend error messages to translation keys
const getContractErrorTranslationKey = (errorMessage: string): string => {
  console.log("error message", errorMessage);

  const normalizedError = errorMessage.toLowerCase();

  // Check for specific contract amount validation that exceeds project budget
  if (
    normalizedError.includes("contract amount") &&
    normalizedError.includes("exceed") &&
    normalizedError.includes("budget")
  ) {
    return "contract_amount_validation_failed";
  }
  if (
    normalizedError.includes("total amount") &&
    normalizedError.includes("exceed") &&
    normalizedError.includes("budget")
  ) {
    return "contract_amount_validation_failed";
  }
  if (
    normalizedError.includes("amount") &&
    (normalizedError.includes("exceed") || normalizedError.includes("budget"))
  ) {
    return "contract_amount_validation_failed";
  }

  if (
    normalizedError.includes("validation") ||
    normalizedError.includes("invalid")
  ) {
    return "contract_validation_error";
  }
  if (
    normalizedError.includes("already exists") ||
    normalizedError.includes("duplicate")
  ) {
    return "contract_already_exists";
  }
  if (
    normalizedError.includes("amount") &&
    (normalizedError.includes("invalid") || normalizedError.includes("exceed"))
  ) {
    return "contract_amount_invalid";
  }
  if (
    normalizedError.includes("date") &&
    (normalizedError.includes("invalid") || normalizedError.includes("past"))
  ) {
    return "contract_date_invalid";
  }
  if (
    normalizedError.includes("required") ||
    normalizedError.includes("missing")
  ) {
    return "required_fields_missing";
  }
  if (normalizedError.includes("file") || normalizedError.includes("upload")) {
    return "file_upload_error";
  }
  if (normalizedError.includes("reference")) {
    return "contract_already_exists";
  }

  // Default fallback
  return "contract_save_error";
};

const ContractCreatePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isOpen, openModal, closeModal } = useModal();
  const { getRoute } = useRoleRoute();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormDataProps>(initialValue);
  const [contractReview, setContractReview] = useState<ContractReviewData>(
    ContractReviewInitialValue
  );

  useEffect(() => {
    const resetFilesListener = () => {
      setFormData((prev) => ({ ...prev, contractFiles: [] }));
      setContractReview((prev) => ({ ...prev, contractFiles: [] }));
    };

    window.addEventListener("form-reset", resetFilesListener);

    return () => {
      window.removeEventListener("form-reset", resetFilesListener);
    };
  }, []);
  const [editProjectId, setEditProjectId] = useState("");
  const [projectExchangeRate, setProjectExchangeRate] = useState<
    number | undefined
  >();
  const [remainingAmount, setRemainingAmount] = useState<string | undefined>();

  const { projectId, contractId } = useParams();
  const [newContractId, setNewContractId] = useState<string>();
  const { loading, setLoading } = useLoading();

  const steps = [
    { id: 1, title: t("contract_info") },
    { id: 2, title: t("review") },
  ];

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const handleFormSubmit = (values: any) => {
    setContractReview((preve) => ({
      ...preve,
      // Contract basic info
      contractName: values.name,
      contractReference: values.reference,
      amount: values.amount,
      currency: values.currency,

      // Contracting/Executing Agency
      contractingAgencyName: values.contractingAgencyName,
      contractingAuthorizedPersonName: values.contractingAuthorizedPersonName,
      contractingAuthorizedPersonPosition:
        values.contractingAuthorizedPersonPosition,

      // Rewarded Company
      rewardedCompanyName: values.rewardedCompanyName,
      rewardedAuthorizedPersonName: values.rewardedAuthorizedPersonName,
      rewardedAuthorizedPersonPosition: values.rewardedAuthorizedPersonPosition,

      // Signing details
      dateOfSigning: values.dateOfSigning,
      place: values.place,
      contractFiles: values.contractFiles,

      // Legacy fields for backward compatibility
      signedBy: values.signedBy,
      position: values.position,
      organization: values.organization,
    }));
    setFormData(values);
    setCurrentStep(1);
  };

  const contractCreateMutation = useMutation({
    mutationFn: async (data: FormDataProps) => {
      const payload = createContractPayload(
        data,
        projectId,
        contractId,
        editProjectId,
        projectExchangeRate
      );
      const response = await contractService.creteContract(payload);
      setNewContractId(response.data.data.id);
      return response.data;
    },
    onSuccess: async () => {
      openModal();
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{
        message?: string;
        error?: string;
        errors?: any;
      }>;
      console.error("Contract creation error:", error);

      let errorMessage = "contract_creation_failed";

      // Handle 422 validation errors specifically
      if (axiosError?.response?.status === 422) {
        const backendMessage =
          axiosError?.response?.data?.message ||
          axiosError?.response?.data?.error ||
          "Validation failed";

        errorMessage = getContractErrorTranslationKey(backendMessage);

        // Check if contractId exists for edit mode
        if (contractId) {
          errorMessage = "contract_update_failed";
        }
      } else {
        // Handle other status codes
        if (axiosError?.response?.data?.message) {
          errorMessage = getContractErrorTranslationKey(
            axiosError.response.data.message
          );
        }
      }

      // Show translated error message
      toast.error(t(errorMessage));
    },
  });

  const handleFinalSubmit = () => {
    contractCreateMutation.mutate(formData);
    // openModal();
  };

  const fetchProject = async (projectId: string) => {
    try {
      setLoading(true);
      const data = await projectService.getProjectDetails(projectId!);
      const project = data.data;
      const summary = data.summary;
      setContractReview((preve) => ({
        ...preve,
        projectAmount: project.amount,
        projectName: project.name,
        currency: project.currency,
        projectCurrency: project.currency,
        beginDate: project.begin_date,
        endDate: project.end_date,
        description: project.description,
        projectFiles: project.documents,
        reference: project.reference,
        address: project.address.map((address: Address, index: number) => ({
          id: index + 1,
          city: address.city,
          providence: address.providence,
          municipality: address.municipality,
          country: address.country,
        })),
      }));

      // Set the project currency in formData to fix the currency selection
      setFormData((prev) => ({
        ...prev,
        currency: project.currency,
      }));

      // Store project exchange rate if available
      if (project.exchange_rate_used) {
        setProjectExchangeRate(parseFloat(project.exchange_rate_used));
      }

      // Store remaining amount from summary if available
      if (summary && summary.remaining_amount !== undefined) {
        setRemainingAmount(summary.remaining_amount.toString());
      }

      return project;
    } catch (err: any) {
      console.error(err, "erro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchProject(projectId);
  }, [projectId, t]);

  const getContractMutation = useMutation({
    mutationFn: async (contractId: string) => {
      setLoading(true);
      const response = await contractService.getContractDetails({
        contract_id: contractId,
      });
      if (response.data.status === 200) {
        const contractData = response.data.data;
        setEditProjectId(contractData.project_id);
        fetchProject(contractData.project_id);

        console.log(contractData, "contract data");

        setFormData((prev: FormDataProps) => ({
          ...prev,
          // Contract basic info
          name: contractData.name || "",
          reference: contractData.reference || "",
          amount: contractData.amount
            ? contractData.amount.toString().replace(/[^0-9]/g, "")
            : "",
          currency: contractData.currency,

          // Contracting/Executing Agency
          contractingAgencyName: contractData.contracting_agency_name || "",
          contractingAuthorizedPersonName:
            contractData.contracting_agency_person_name || "",
          contractingAuthorizedPersonPosition:
            contractData.contracting_agency_person_position || "",

          // Rewarded Company
          rewardedCompanyName: contractData.awarded_company_name || "",
          rewardedAuthorizedPersonName:
            contractData.awarded_company_person_name || "",
          rewardedAuthorizedPersonPosition:
            contractData.awarded_company_person_position || "",

          // Signing details
          dateOfSigning: contractData.date_of_signing,
          place: contractData.place,
          contractFiles: (contractData.documents as UploadedFile[]) || [],

          // Legacy fields for backward compatibility
          signedBy: contractData.signed_by || "",
          position: contractData.position || "",
          organization: contractData.organization || "",
        }));
      }
    },
    onError: async (error) => {
      setLoading(true);
      console.error(error);
    },
  });

  useEffect(() => {
    if (contractId) {
      getContractMutation.mutate(contractId);
    }
  }, [contractId]);

  return (
    <AppLayout>
      <div className="bg-secondary-5 h-full p-4 md:p-6">
        <div className="max-w-[900px] mx-auto">
          <div className="rounded-lg overflow-hidden bg-white shadow-md border border-gray-100">
            <div className="h-1 w-full bg-primary-150"></div>
            <div className="p-4 md:p-6">
              <div
                className="flex items-center gap-2 cursor-pointer mb-2"
                onClick={() => navigate("/project-home")}
              >
                <ArrowLeftIcon
                  width={16}
                  height={16}
                  className="text-primary-150"
                />
                <Typography
                  size="base"
                  weight="semibold"
                  className="text-primary-150"
                >
                  {t("back_to_dashboard")}
                </Typography>
              </div>

              <Typography
                size="xl"
                weight="bold"
                className="text-secondary-100"
              >
                {t("create_contract")}
              </Typography>

              {/* Project Info Section */}
              {(projectId || editProjectId) && contractReview.projectName && (
                <div className="mt-6 mb-2">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
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
                            className="text-gray-900 truncate"
                          >
                            {contractReview.projectName}
                          </Typography>
                          <div className="flex items-center space-x-3 mt-1">
                            {contractReview.projectAmount && (
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="text-gray-400"
                                >
                                  <path
                                    d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <span className="font-medium">
                                  {contractReview.projectAmount}{" "}
                                  {contractReview.projectCurrency}
                                </span>
                              </div>
                            )}
                            {contractReview.reference && (
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="text-gray-400"
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
                                <span className="truncate max-w-28 font-medium">
                                  {contractReview.reference}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Button
                          variant="outline"
                          onClick={() =>
                            navigate(
                              `${getRoute("projectDetails")}/${
                                projectId || editProjectId
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
                </div>
              )}
            </div>
            <div className="h-[1px] w-full bg-gray-200"></div>
            <div className="p-4 md:p-6">
              <Stepper
                variant="outline"
                steps={steps}
                currentStep={currentStep}
                onStepClick={handleStepClick}
              />
              {currentStep === 0 && !loading && (
                <ContractInfoForm
                  initialValues={formData}
                  onSubmit={handleFormSubmit}
                  isProjectSelected={!!projectId || !!editProjectId}
                  projectAmount={contractReview.projectAmount}
                  projectCurrency={contractReview.projectCurrency}
                  projectExchangeRate={projectExchangeRate}
                  remainingAmount={remainingAmount}
                />
              )}

              {currentStep === 1 && (
                <>
                  <ContractReviewForm
                    projectData={contractReview}
                    projectExchangeRate={projectExchangeRate}
                  />
                  <div className="flex justify-end pt-4">
                    <Button
                      variant="primary"
                      type="submit"
                      loading={contractCreateMutation.isPending}
                      onClick={handleFinalSubmit}
                      //   form="project-form"
                      className="px-6 py-3 bg-primary-150 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-primary-200 w-full md:w-auto"
                    >
                      {t("submit")}
                      <ArrowRightIconButton
                        width={18}
                        height={18}
                        className="text-white"
                      />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <CreateContractConfirmationModal
          isOpen={isOpen}
          onClose={closeModal}
          projectId={`${projectId || editProjectId}/${newContractId}`}
        />
      </div>
    </AppLayout>
  );
};

export default ContractCreatePage;
