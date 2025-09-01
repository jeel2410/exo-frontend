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
  projectName: string;
  reference: string;
  projectAmount: string;
  projectCurrency: string;
  signedBy: string;
  position: string;
  beginDate: string;
  endDate: string;
  description: string;
  projectFiles: UploadedFile[];
  address: Address[];
  // projectManager: string;
  organization: string;
  amount: string;
  currency: string;
  dateOfSigning: string;
  contractFiles: UploadedFile[];
  place: string;
  contractReference: string;
  contractName: string;
}

const ContractReviewInitialValue = {
  projectName: "",
  reference: "",
  projectAmount: "",
  projectCurrency: "",
  signedBy: "",
  position: "",
  beginDate: "",
  endDate: "",
  description: "",
  projectFiles: [],
  address: [],
  // projectManager: "",
  organization: "",
  amount: "",
  currency: "",
  dateOfSigning: "",
  contractFiles: [],
  place: "",
  contractReference: "",
  contractName: "",
};

interface FormDataProps {
  signedBy: string;
  position: string;
  // projectManager: string,
  organization: string;
  amount: string;
  currency: string;
  dateOfSigning: string;
  contractFiles: UploadedFile[];
  place: string;
  reference: string;
  name: string;
}

const initialValue = {
  signedBy: "",
  position: "",
  // projectManager: "",
  organization: "",
  amount: "",
  currency: "USD",
  dateOfSigning: "",
  contractFiles: [],
  place: "",
  reference: "",
  name: "",
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

  const { projectId, contractId } = useParams();
  const [newContractId, setNewContractId] = useState();
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
      ...values,
      contractReference: values.reference,
      contractName: values.name,
    }));
    setFormData(values);
    setCurrentStep(1);
  };

  const contractCreateMutation = useMutation({
    mutationFn: async (data: any) => {
      const files = data.contractFiles;
      const filesData = Array.isArray(files) ? files : files ? [files] : [];

      const payload = new FormData();
      payload.append("signed_by", data.signedBy);
      payload.append("position", data.position);
      payload.append("currency", data.currency);
      payload.append("amount", data.amount);
      payload.append("organization", data.organization);
      payload.append("place", data.place);
      payload.append(
        "date_of_signing",
        moment(data.dateOfSigning, ["DD-MM-YYYY", "YYYY-MM-DD"], true).format(
          "YYYY-MM-DD"
        )
      );
      payload.append(
        "document_ids",
        filesData.map((file: any) => file.id).join(",")
      );
      // Add required fields
      payload.append("reference", data.reference);
      payload.append("name", data.name);
      if (projectId) {
        payload.append("project_id", projectId);
      }
      if (contractId && editProjectId) {
        payload.append("project_id", editProjectId);
        payload.append("contract_id", contractId);
      }
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
        const contractData: {
          project_id: string;
          signed_by: string;
          position: string;
          currency: string;
          amount: string;
          organization: string;
          place: string;
          date_of_signing: string;
          documents: UploadedFile[] | [];
          reference?: string;
          name?: string;
        } = response.data.data;
        setEditProjectId(contractData.project_id);
        fetchProject(contractData.project_id);

        console.log(contractData, "contract data");

        setFormData((prev: FormDataProps) => ({
          ...prev,
          amount: parseFloat(contractData.amount).toString(),
          contractFiles: contractData.documents || [],
          currency: contractData.currency,
          dateOfSigning: contractData.date_of_signing,
          organization: contractData.organization,
          place: contractData.place,
          signedBy: contractData.signed_by,
          position: contractData.position,
          reference: contractData.reference || "",
          name: contractData.name || "",
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
                  <div className="bg-gradient-to-r from-primary-50 to-primary-25 border border-primary-100 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary-150 rounded-xl flex items-center justify-center shadow-sm">
                            <svg
                              width="24"
                              height="24"
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
                                fill="currentColor"
                                fillOpacity="0.2"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Typography
                              size="xs"
                              weight="semibold"
                              className="text-primary-150 uppercase tracking-wider"
                            >
                              {t("selected_project")}
                            </Typography>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          </div>
                          <Typography
                            size="lg"
                            weight="bold"
                            className="text-gray-900 truncate"
                          >
                            {contractReview.projectName}
                          </Typography>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            {contractReview.projectAmount && (
                              <div className="flex items-center space-x-1">
                                <svg
                                  width="14"
                                  height="14"
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
                                <span>
                                  {contractReview.projectAmount}{" "}
                                  {contractReview.projectCurrency}
                                </span>
                              </div>
                            )}
                            {contractReview.reference && (
                              <div className="flex items-center space-x-1">
                                <svg
                                  width="14"
                                  height="14"
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
                                <span className="truncate max-w-32">
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
                          className="px-4 py-2.5 bg-white text-primary-150 border-2 border-primary-150 rounded-lg hover:bg-primary-150 hover:text-white transition-all duration-200 flex items-center space-x-2 font-medium shadow-sm hover:shadow-md group"
                        >
                          <svg
                            width="16"
                            height="16"
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
                />
              )}

              {currentStep === 1 && (
                <>
                  <ContractReviewForm projectData={contractReview} />
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
