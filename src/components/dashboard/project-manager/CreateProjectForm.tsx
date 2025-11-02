import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import Typography from "../../../lib/components/atoms/Typography";
import ProjectInfoForm from "../ProjectInfoForm";
import { ArrowLeftIcon } from "../../../icons";
import { useModal } from "../../../hooks/useModal";
import CreateProjectConfirmationModal from "../../modal/CreateProjectConfirmationModal";
import { UploadedFile } from "../../common/UploadFile";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import projectService from "../../../services/project.service";
import moment from "moment";
import { toast } from "react-toastify";
import { useLoading } from "../../../context/LoaderProvider";

interface ProjectFormValues {
  projectName: string;
  fundedBy: string[]; // Changed to array for multiple selection
  projectReference: string;
  amount: string;
  currency: string;
  beginDate: string | Date;
  endDate: string | Date;
  description: string | null;
  addresses: Array<{
    id: number;
    country: string;
    province: string;
    city: string;
    municipality: string;
  }>;
  files: UploadedFile[];
  status: "publish" | "draft";
}

interface ExchangeRates {
  [key: string]: number;
}

const initialValues: ProjectFormValues = {
  projectName: "",
  fundedBy: [], // Changed to empty array
  projectReference: "",
  amount: "",
  currency: "USD",
  beginDate: "",
  endDate: "",
  description: "",
  addresses: [],
  files: [],
  status: "draft",
};

const CreateProjectForm = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isOpen, openModal, closeModal } = useModal();
  const [formValue, setFormValue] = useState<ProjectFormValues>(initialValues);
  const { projectId } = useParams();
  const { setLoading, loading } = useLoading();
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [existingExchangeRate, setExistingExchangeRate] = useState<number | null>(null);

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      return await projectService.createProject(data);
    },
    onSuccess: () => {
      openModal();
      setFormValue(initialValues); // Clear the form after successful creation
      setReferenceError(null); // Clear any existing reference error
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to create project.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      const Errors = {
        en: "The reference has already been taken.",
        fr: "La référence a déjà été utilisée.",
      };

      console.error("Error during project creation:", errorMessage);

      if (errorMessage === "The reference has already been taken.") {
        const translatedError = i18n.language === "en" ? Errors.en : Errors.fr;
        setReferenceError(translatedError);
        return toast.error(translatedError);
      }
      setReferenceError(null); // Clear reference error for other errors
      return toast.error(t(errorMessage || "failed_to_create_project"));
    },
  });

  const createProject = (values: ProjectFormValues, resetForm?: () => void) => {
    // Clear any existing reference error when submitting
    setReferenceError(null);

    // Calculate CDF amount and exchange rate
    const amount = parseFloat(values.amount.replace(/,/g, ""));
    let amountCdf: number;
    let exchangeRateUsed: number;

    if (values.currency === "CDF") {
      // For CDF currency
      amountCdf = amount;
      exchangeRateUsed = 1.00;
    } else {
      // For non-CDF currency, use exchange rate
      // If editing, use existing exchange rate, otherwise use current rate
      exchangeRateUsed = existingExchangeRate || exchangeRates[values.currency] || 1.00;
      amountCdf = amount * exchangeRateUsed;
    }

    const payload = {
      name: values.projectName,
      funded_by: values.fundedBy.join(','), // Convert array to comma-separated string
      reference: values.projectReference,
      currency: values.currency,
      amount: values.amount,
      begin_date: moment(
        values.beginDate,
        ["DD-MM-YYYY", "YYYY-MM-DD"],
        true
      ).format("YYYY-MM-DD"),
      end_date: moment(
        values.endDate,
        ["DD-MM-YYYY", "YYYY-MM-DD"],
        true
      ).format("YYYY-MM-DD"),
      description: values.description,
      address: JSON.stringify(
        values.addresses.map((address) => ({
          country: address.country,
          city: address.city,
          providence: address.province,
          municipality: address.municipality,
        }))
      ),
      document_ids: values.files.map((file) => file.id).join(","),
      status: values.status,
      amount_cdf: amountCdf,
      exchange_rate_used: exchangeRateUsed,
      ...(projectId && { project_id: projectId }),
    };
    createProjectMutation.mutate(payload, {
      onSuccess: () => {
        if (resetForm) {
          resetForm();
          setFormValue(initialValues);
        }
      },
    });
  };

  const handleSubmit = (values: ProjectFormValues, resetForm?: () => void) => {
    createProject(values, resetForm);
  };

  const handelCloseModal = () => {
    closeModal();
    navigate("/create-project");
  };

  const fetchProject = async (projectId: string) => {
    try {
      setLoading(true);
      const data = await projectService.getProjectDetails(projectId);
      const projectData = data.data;

      // Store existing exchange rate if available
      if (projectData.exchange_rate_used) {
        setExistingExchangeRate(parseFloat(projectData.exchange_rate_used));
      }

      const newData = {
        projectName: projectData.name,
        fundedBy: projectData.funded_by ? projectData.funded_by.split(',').map((s: string) => s.trim()) : [], // Convert comma-separated string to array
        projectReference: projectData.reference,
        amount: projectData.amount.toString(),
        currency: projectData.currency,
        beginDate: moment(projectData.begin_date, "YYYY-MM-DD").toDate(),
        endDate: moment(projectData.end_date, "YYYY-MM-DD").toDate(),
        description: projectData.description || "",
        addresses:
          projectData.address && projectData.address?.length
            ? [...(projectData.address && projectData.address)]?.map(
                (address: any, index: number) => ({
                  id: index + 1,
                  country: address.country,
                  province: address.providence,
                  city: address.city,
                  municipality: address.municipality,
                })
              )
            : [],
        files: projectData.documents,
        status: projectData.status,
      };
      setFormValue(newData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch exchange rates on component mount (only when creating new project)
  const fetchExchangeRates = async () => {
    try {
      const response = await projectService.getExchangeRates();
      if (response.data && response.data.data) {
        setExchangeRates(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
      toast.error(t("failed_to_fetch_exchange_rates"));
    }
  };

  useEffect(() => {
    if (projectId) {
      // When editing, fetch project details (which includes existing exchange rate)
      fetchProject(projectId);
    } else {
      // When creating new project, fetch current exchange rates
      fetchExchangeRates();
    }
  }, []);

  return (
    <div className="bg-secondary-5 h-full p-4 md:p-6">
      <div className="max-w-[900px] mx-auto">
        <div className="rounded-lg overflow-hidden bg-white shadow-md border border-gray-100">
          <div className="h-1 w-full bg-primary-150"></div>
          <div className="p-4 md:p-6">
            <div
              className="flex items-center gap-2 cursor-pointer mb-2"
              onClick={() => navigate("/project-dashboard")}
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

            <Typography size="xl" weight="bold" className="text-secondary-100">
              {t("create_project")}
            </Typography>
          </div>
          <div className="h-[1px] w-full bg-gray-200"></div>

          <div className="p-4 md:p-6">
            {!loading && (
              <ProjectInfoForm
                initialValues={formValue}
                onSubmit={handleSubmit}
                loading={createProjectMutation.isPending}
                referenceError={referenceError}
                onClearReferenceError={() => setReferenceError(null)}
                exchangeRates={exchangeRates}
                existingExchangeRate={existingExchangeRate}
              />
            )}
          </div>
        </div>
      </div>
      <CreateProjectConfirmationModal
        isOpen={isOpen}
        onClose={handelCloseModal}
        projectId=""
      />
    </div>
  );
};

export default CreateProjectForm;
