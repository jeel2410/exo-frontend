import { useState } from "react";
import Typography from "../../lib/components/atoms/Typography";
import Stepper from "../../components/common/Stepper";
import ProjectInfoForm from "../../components/dashboard/ProjectInfoForm";
import ContactInfoForm from "../../components/dashboard/ContactInfoForm";
import ReviewForm from "../../components/dashboard/ReviewForm";
import {
  ArrowLeftIcon,
  SaveDraftIcon,
  ArrowRightIconButton,
} from "../../icons";
import CreateRequest from "../../components/dashboard/CreateRequest";
import CreateProjectConfirmationModal from "../../components/modal/CreateProjectConfirmationModal";
import { useModal } from "../../hooks/useModal";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { useMutation } from "@tanstack/react-query";
import projectService from "../../services/project.service";
import { toast } from "react-toastify";
import localStorageService from "../../services/local.service";

export interface UserData {
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

interface ProjectData {
  projectName: string;
  projectReference: string;
  amount: string;
  currency: string;
  beginDate: string;
  endDate: string;
  description: string;
  addresses: any[];
  files: any[];
  contactName: string;
  position: string;
  company: string;
  phone: string;
  signingDate: string;
  contractFiles: any[];
}

interface FieldValidation {
  projectInfo: {
    projectName: boolean;
    projectReference: boolean;
    amount: boolean;
    beginDate: boolean;
    endDate: boolean;
  };
  contactInfo: {
    contactName: boolean;
    position: boolean;
    company: boolean;
    phone: boolean;
    signingDate: boolean;
  };
}

const CreateProject = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpenStepperForm, setIsOpenStepperForm] = useState(false);
  const [highlightErrors, setHighlightErrors] = useState(false);
  const [fieldValidation, setFieldValidation] = useState<FieldValidation>({
    projectInfo: {
      projectName: false,
      projectReference: false,
      amount: false,
      beginDate: false,
      endDate: false,
    },
    contactInfo: {
      contactName: false,
      position: false,
      company: false,
      phone: false,
      signingDate: false,
    },
  });

  const [projectData, setProjectData] = useState<ProjectData>({
    projectName: "",
    projectReference: "",
    amount: "",
    currency: "USD",
    beginDate: "",
    endDate: "",
    description: "",
    addresses: [],
    files: [],
    contactName: "",
    position: "",
    company: "",
    phone: "",
    signingDate: "",
    contractFiles: [],
  });

  const steps = [
    { id: 1, title: "Project Info" },
    { id: 2, title: "Contract Info" },
    { id: 3, title: "Review" },
  ];

  const { isOpen, openModal, closeModal } = useModal();

  const validateProjectInfoForm = () => {
    const requiredFields: (keyof typeof fieldValidation.projectInfo)[] = [
      "projectName",
      "projectReference",
      "amount",
      "beginDate",
      "endDate",
    ];

    const newValidation = { ...fieldValidation };
    requiredFields.forEach((field) => {
      newValidation.projectInfo[field] = !projectData[field];
    });

    setFieldValidation(newValidation);
    return requiredFields.every((field) => !!projectData[field]);
  };

  const validateContactInfoForm = () => {
    const requiredFields: (keyof typeof fieldValidation.contactInfo)[] = [
      "contactName",
      "position",
      "company",
      "phone",
      "signingDate",
    ];

    const newValidation = { ...fieldValidation };
    requiredFields.forEach((field) => {
      newValidation.contactInfo[field] = !projectData[field];
    });

    setFieldValidation(newValidation);
    return requiredFields.every((field) => !!projectData[field]);
  };

  const handleNextStep = async () => {
    setHighlightErrors(true);

    if (currentStep === 0) {
      if (!validateProjectInfoForm()) {
        return;
      }
    } else if (currentStep === 1) {
      if (!validateContactInfoForm()) {
        return;
      }
    }
    setHighlightErrors(false);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (currentStep === 0 && stepIndex > 0) {
      setHighlightErrors(true);
      if (!validateProjectInfoForm()) return;
    } else if (currentStep === 1 && stepIndex > 1) {
      setHighlightErrors(true);
      if (!validateContactInfoForm()) return;
    }

    setHighlightErrors(false);
    setCurrentStep(stepIndex);
  };

  const updateProjectData = (data: Partial<ProjectData>) => {
    setProjectData((projectData) => ({ ...projectData, ...data }));
    if (currentStep === 0) {
      const newValidation = { ...fieldValidation };
      Object.keys(data).forEach((key) => {
        if (key in newValidation.projectInfo) {
          newValidation.projectInfo[
            key as keyof typeof newValidation.projectInfo
          ] = false;
        }
      });
      setFieldValidation(newValidation);
    } else if (currentStep === 1) {
      const newValidation = { ...fieldValidation };
      Object.keys(data).forEach((key) => {
        if (key in newValidation.contactInfo) {
          newValidation.contactInfo[
            key as keyof typeof newValidation.contactInfo
          ] = false;
        }
      });
      setFieldValidation(newValidation);
    }
  };

  const handleSaveAsDraft = () => {
    console.log("Saving as draft:", projectData);
    // Save draft logic
  };

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      return await projectService.createProject(data);
    },
    onSuccess: (data) => {
      openModal();
      localStorageService.setProjectId(data.data.data.id)
    },
    onError: (error) => {
      console.error("Error during project creation:", error);
      // return toast.error("Failed to create project.");
    },
  });

  const handleSubmit = async () => {
    const filesId = projectData.files.map((file) => file.id);
    const contractFilesID = projectData.contractFiles.map((file) => file.id);

    const data = {
      name: projectData.projectName || "",
      reference: projectData.projectReference || "",
      amount: projectData.amount || "",
      currency: projectData.currency || "",
      begin_date:
        moment(projectData.beginDate, "DD-MM-YYYY").format("YYYY-MM-DD") || "",
      end_date:
        moment(projectData.endDate, "DD-MM-YYYY").format("YYYY-MM-DD") || "",
      description: projectData.description || "",
      signed_by: projectData.contactName || "",
      finance_by: "Bank",
      position: projectData.position || "",
      organization: projectData.company || "",
      place: "Testing",
      date_of_signing:
        moment(projectData.signingDate, "DD-MM-YYYY").format("YYYY-MM-DD") ||
        "",
      address:
        JSON.stringify(
          projectData.addresses.map((address) => ({
            city: address.city,
            country: address.country,
            municipality: address.municipality,
            providence: address.province,
          }))
        ) || [],
      status: "publish",
      document_ids: [...filesId, ...contractFilesID].join(","),
    };
    createProjectMutation.mutate(data);
  };

  return (
    <div className="bg-secondary-5 h-full p-4 md:p-6">
      <div className="max-w-[900px] mx-auto">
        {!isOpenStepperForm && (
          <CreateRequest onClick={() => setIsOpenStepperForm(true)} />
        )}
        {isOpenStepperForm && (
          <div className="rounded-lg overflow-hidden bg-white shadow-md border border-gray-100">
            <div className="h-1 w-full bg-primary-150"></div>
            <div className="p-4 md:p-6">
              <div
                className="flex items-center gap-2 cursor-pointer mb-2"
                onClick={() => window.history.back()}
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
                {t("create_request")}
              </Typography>
            </div>
            <div className="h-[1px] w-full bg-gray-200"></div>
            <div className="px-4 md:px-6 mt-4">
              <Stepper
                steps={steps}
                currentStep={currentStep}
                onStepClick={handleStepClick}
              />
            </div>
            <div className="p-4 md:p-6">
              {currentStep === 0 && (
                <ProjectInfoForm
                  projectData={projectData}
                  updateProjectData={updateProjectData}
                  highlightErrors={highlightErrors}
                  fieldErrors={fieldValidation.projectInfo}
                />
              )}
              {currentStep === 1 && (
                <ContactInfoForm
                  projectData={projectData}
                  updateProjectData={updateProjectData}
                  highlightErrors={highlightErrors}
                  fieldErrors={fieldValidation.contactInfo}
                />
              )}
              {currentStep === 2 && <ReviewForm projectData={projectData} />}
              <div className="flex flex-col-reverse md:flex-row justify-end gap-4 mt-8">
                <button
                  onClick={handleSaveAsDraft}
                  className="px-6 py-3 bg-white rounded-lg text-primary-150 font-medium flex items-center justify-center gap-2 shadow-md hover:bg-gray-50 w-full md:w-auto"
                >
                  <SaveDraftIcon
                    width={20}
                    height={20}
                    className="text-primary-150"
                  />
                  {t("save_as_draft")}
                </button>

                <button
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-primary-150 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-primary-200 w-full md:w-auto"
                >
                  {currentStep === steps.length - 1
                    ? `${t("create_project")}`
                    : `${t("next")}`}
                  <ArrowRightIconButton
                    width={18}
                    height={18}
                    className="text-white"
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <CreateProjectConfirmationModal isOpen={isOpen} onClose={closeModal} />
    </div>
  );
};

export default CreateProject;
