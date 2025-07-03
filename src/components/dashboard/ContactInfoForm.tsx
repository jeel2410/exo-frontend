import { useState, useEffect } from "react";
import Typography from "../../lib/components/atoms/Typography";
import Input from "../../lib/components/atoms/Input";
import Label from "../../lib/components/atoms/Label";
import DatePicker from "../../lib/components/atoms/DatePicker";
import UploadFile, { UploadedFile } from "../common/UploadFile";
import { useTranslation } from "react-i18next";

import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import projectService from "../../services/project.service";

interface ContactInfoFormProps {
  projectData: any;
  updateProjectData: (data: any) => void;
  highlightErrors?: boolean;
  fieldErrors?: {
    contactName: boolean;
    position: boolean;
    company: boolean;
    phone: boolean;
    signingDate: boolean;
  };
}

interface ValidationErrors {
  contactName?: string;
  position?: string;
  company?: string;
  phone?: string;
  signingDate?: string;
}

interface UploadResponse {
  id: string;
  url: string;
}

interface UploadArgs {
  file: File;
  onProgress: (percent: number) => void;
}
const ContactInfoForm = ({
  projectData,
  updateProjectData,
  highlightErrors = false,
  fieldErrors = {
    contactName: false,
    position: false,
    company: false,
    phone: false,
    signingDate: false,
  },
}: ContactInfoFormProps) => {
  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { t } = useTranslation();

  const positions = [
    "Project Manager",
    "Site Engineer",
    "Contract Manager",
    "Finance Manager",
    "Technical Lead",
  ];
  useEffect(() => {
    const defaultValues = {
      position: projectData.position || "Project Manager",
      company: projectData.company || "ABC Construction Ltd.",
      contactName: projectData.contactName || "",
      phone: projectData.phone || "",
      signingDate: projectData.signingDate || "",
      contractFiles: projectData.contractFiles || [],
    };

    const updatedValues: Record<string, any> = {};
    Object.entries(defaultValues).forEach(([key, value]) => {
      if (!projectData[key]) {
        updatedValues[key] = value;
      }
    });

    if (Object.keys(updatedValues).length > 0) {
      updateProjectData(updatedValues);
    }
  }, []);
  useEffect(() => {
    if (highlightErrors) {
      setTouched({
        contactName: true,
        position: true,
        company: true,
        phone: true,
        signingDate: true,
      });

      validate("contactName", projectData.contactName || "");
      validate("position", projectData.position || "");
      validate("company", projectData.company || "");
      validate("phone", projectData.phone || "");
      validate("signingDate", projectData.signingDate || "");
    }
  }, [highlightErrors]);

  const validate = (name: string, value: string) => {
    const newErrors = { ...errors };

    if (name === "contactName") {
      if (!value.trim()) {
        newErrors.contactName = `${t("name_is_required")}`;
      } else {
        delete newErrors.contactName;
      }
    }

    if (name === "position") {
      if (!value.trim()) {
        newErrors.position = `${t("position_is_required")}`;
      } else {
        delete newErrors.position;
      }
    }

    if (name === "company") {
      if (!value.trim()) {
        newErrors.company = `${t("company_is_required")}`;
      } else {
        delete newErrors.company;
      }
    }

    if (name === "phone") {
      if (!value.trim()) {
        newErrors.phone = `${t("phone_number_is_required")}`;
      } else {
        delete newErrors.phone;
      }
    }

    if (name === "signingDate") {
      if (!value) {
        newErrors.signingDate = `${t("signing_date_is_required")}`;
      } else {
        delete newErrors.signingDate;
      }
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateProjectData({ [name]: value });
    validate(name, value);
    setTouched({ ...touched, [name]: true });
  };

  const handlePositionSelect = (position: string) => {
    updateProjectData({ position });
    validate("position", position);
    setTouched({ ...touched, position: true });
    setIsPositionDropdownOpen(false);
  };

  const handleDateChange = (field: string, date: Date) => {
    if (!date) return;
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    updateProjectData({ [field]: formattedDate });
    validate(field, formattedDate);
    setTouched({ ...touched, [field]: true });
  };

  const handleFilesSelect = (files: UploadedFile[]) => {
    updateProjectData({ contractFiles: files });
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    validate(field, projectData[field] || "");
  };
  const shouldShowError = (fieldName: string) => {
    return (
      (touched[fieldName] && !!errors[fieldName as keyof ValidationErrors]) ||
      (highlightErrors && fieldErrors[fieldName as keyof typeof fieldErrors])
    );
  };

  const fileUploadMutation = async ({
    file,
    onProgress,
  }: UploadArgs): Promise<UploadResponse> => {
    console.log("Inside mutation file:", file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "document");
    formData.append("object_type", "project");

    const response = await projectService.uploadFile(formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (event: ProgressEvent) => {
        if (event.total) {
          const percent = Math.round((event.loaded * 100) / event.total);
          onProgress(percent);
        }
      },
    });

    return {
      id: response.data.data?.id ?? Date.now().toString(),
      url: response.data.data?.url ?? "",
    };
  };

  const uploadMutation = useMutation({
    mutationFn: fileUploadMutation,
    onSuccess: () => {
      // toast.success("File uploaded successfully!");
    },
    onError: () => {
      // toast.error("Failed to upload file.");
    },
  });

  const handleUploadFile = async (file: any, onProgress: any) => {
    const response = await uploadMutation.mutateAsync({ file, onProgress });
    return response;
  };

  const removeFileMutation = useMutation({
    mutationFn: async (id: any) => {
      await projectService.removeFile(id);
      return { status: true };
    },
    onSuccess: () => {
      // toast.success("File removed successfully!");
    },
    onError: () => {
      // toast.error("Failed to remove file.");
    },
  });
  console.log(projectData);
  const handleDeleteFile = async (fileId: string) => {
    const response = await removeFileMutation.mutateAsync(fileId);
    if (response.status) {
      const filteredFiles = projectData.contractFiles.filter(
        (file: any) => file.id !== fileId
      );
      updateProjectData({ contractFiles: filteredFiles });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Typography size="lg" weight="semibold" className="text-secondary-100">
          {t("contract_info")}
        </Typography>
        <Typography size="base" weight="normal" className="text-secondary-60">
          {t("fill_in_details_to_complete_the_contract_information_form")}
        </Typography>
      </div>

      <div className="space-y-6">
        {/* Name Field */}
        <div>
          <Label htmlFor="contactName">
            {t("name")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contactName"
            name="contactName"
            placeholder={t("john_doe")}
            value={projectData.contactName || ""}
            onChange={handleInputChange}
            onBlur={() => handleBlur("contactName")}
            error={shouldShowError("contactName")}
          />
          {shouldShowError("contactName") && (
            <p className="mt-1 text-sm text-red-500">
              {errors.contactName || t("name_is_required")}
            </p>
          )}
        </div>

        {/* Position Field */}
        <div>
          <Label htmlFor="position">
            {t("position")} <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <button
              type="button"
              className={`flex items-center justify-between w-full h-11 px-4 py-2 text-left border rounded-lg bg-secondary-10 
                ${
                  shouldShowError("position")
                    ? "border-red-500"
                    : "border-secondary-30"
                }`}
              onClick={() => setIsPositionDropdownOpen(!isPositionDropdownOpen)}
              onBlur={() => handleBlur("position")}
            >
              <span className="text-secondary-100">
                {projectData.position || t("project_manager")}
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${
                  isPositionDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isPositionDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-secondary-30 rounded-lg shadow-lg">
                {positions.map((position) => (
                  <div
                    key={position}
                    className="px-4 py-2 cursor-pointer hover:bg-secondary-10"
                    onClick={() => handlePositionSelect(position)}
                  >
                    {position}
                  </div>
                ))}
              </div>
            )}
          </div>
          {shouldShowError("position") && (
            <p className="mt-1 text-sm text-red-500">
              {errors.position || t("position_is_required")}
            </p>
          )}
        </div>

        {/* Company Field */}
        <div>
          <Label htmlFor="company">
            {t("company")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="company"
            name="company"
            placeholder={t("abc_construction_ltd")}
            value={projectData.company || ""}
            onChange={handleInputChange}
            onBlur={() => handleBlur("company")}
            error={shouldShowError("company")}
          />
          {shouldShowError("company") && (
            <p className="mt-1 text-sm text-red-500">
              {errors.company || "Company is required"}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="phone">
              {t("phone")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 123 456 7890"
              value={projectData.phone || ""}
              onChange={handleInputChange}
              onBlur={() => handleBlur("phone")}
              error={shouldShowError("phone")}
            />
            {shouldShowError("phone") && (
              <p className="mt-1 text-sm text-red-500">
                {errors.phone || "Phone number is required"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="signingDate">
              {t("date_of_signing")} <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              id="signingDate"
              onChange={(selectedDates: Date[]) =>
                handleDateChange("signingDate", selectedDates[0])
              }
              placeholder="01-06-2025"
              error={
                shouldShowError("signingDate")
                  ? errors.signingDate || "Signing date is required"
                  : false
              }
            />
            {shouldShowError("signingDate") && (
              <p className="mt-1 text-sm text-red-500">
                {errors.signingDate || "Signing date is required"}
              </p>
            )}
          </div>
        </div>

        {/* Upload Files */}
        <div>
          <Label>{t("upload_files")}</Label>
          <UploadFile
            maxSize={5}
            acceptedFormats={[".pdf", ".doc", ".docx"]}
            onFilesSelect={handleFilesSelect}
            files={projectData.contractFiles}
            onUploadFile={handleUploadFile}
            onDeleteFile={handleDeleteFile}
          />
        </div>
      </div>
    </div>
  );
};

export default ContactInfoForm;
