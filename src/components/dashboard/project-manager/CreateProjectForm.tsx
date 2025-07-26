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
  fundedBy: string;
  projectReference: string;
  amount: string;
  currency: string;
  beginDate: string | Date;
  endDate: string | Date;
  description: string;
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

const initialValues: ProjectFormValues = {
  projectName: "",
  fundedBy: "",
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
  const { t,i18n } = useTranslation();
  const { isOpen, openModal, closeModal } = useModal();
  const [formValue, setFormValue] = useState<ProjectFormValues>(initialValues);
  const { projectId } = useParams();
  const { setLoading, loading } = useLoading();

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      return await projectService.createProject(data);
    },
    onSuccess: () => {
      openModal();
      setFormValue(initialValues); // Clear the form after successful creation
    },
    onError: async (error:any) => {
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

      if(errorMessage==="The reference has already been taken."){
        
        return toast.error(i18n.language==="en"?Errors.en:Errors.fr);
      }
      return toast.error(t(errorMessage||"failed_to_create_project"));
    },
  });    

  const createProject = (values: ProjectFormValues, resetForm?: () => void) => {
    const payload = {
      name: values.projectName,
      funded_by: values.fundedBy,
      reference: values.projectReference,
      currency: values.currency,
      amount: values.amount,
      begin_date: moment(values.beginDate, "DD-MM-YYYY").format("YYYY-MM-DD"),
      end_date: moment(values.endDate, "DD-MM-YYYY").format("YYYY-MM-DD"),
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

      const newData = {
        projectName: projectData.name,
        fundedBy: projectData.funded_by,
        projectReference: projectData.reference,
        amount: Number(projectData.amount).toFixed(0).toString(),
        currency: projectData.currency,
        beginDate: moment(projectData.begin_date, "YYYY-MM-DD").toDate(),
        endDate: moment(projectData.end_date, "YYYY-MM-DD").toDate(),
        description: projectData.description,
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
        files: [],
        status: projectData.status,
      };
      setFormValue(newData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
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
