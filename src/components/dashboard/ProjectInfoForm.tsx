import { useState, useEffect } from "react";
import Input from "../../lib/components/atoms/Input";
import Label from "../../lib/components/atoms/Label";
import DatePicker from "../../lib/components/atoms/DatePicker";
import CurrencyInput from "../../lib/components/atoms/CurrencyInput";
import Typography from "../../lib/components/atoms/Typography";
import TextEditor from "../../lib/components/atoms/TextEditor";
import UploadFile, { UploadedFile } from "../common/UploadFile";
import { TrashIcon } from "../../icons";
import { USFlag, CDFFlag } from "../../icons";
import { useTranslation } from "react-i18next";

import projectService from "../../services/project.service";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface ProjectInfoFormProps {
  projectData: any;
  updateProjectData: (data: any) => void;
  highlightErrors?: boolean;
  fieldErrors?: {
    projectName: boolean;
    projectReference: boolean;
    amount: boolean;
    beginDate: boolean;
    endDate: boolean;
  };
}

interface Address {
  id: number;
  country: string;
  province: string;
  city: string;
  municipality: string;
}

interface EditingState {
  addressId: number;
  field: string | null;
}

interface ValidationErrors {
  projectName?: string;
  projectReference?: string;
  amount?: string;
  beginDate?: string;
  endDate?: string;
}

export interface UploadResponse {
  id: string;
  url: string;
}

export interface UploadArgs {
  file: File;
  onProgress: (percent: number) => void;
}

const ProjectInfoForm = ({
  projectData,
  updateProjectData,
  highlightErrors = false,
  fieldErrors = {
    projectName: false,
    projectReference: false,
    amount: false,
    beginDate: false,
    endDate: false,
  },
}: ProjectInfoFormProps) => {
  const [addresses, setAddresses] = useState<Address[]>(
    projectData.addresses || [
      {
        id: 1,
        country: "DRC",
        province: "Eldara",
        city: "Velmont",
        municipality: "West Arindale",
      },
      {
        id: 2,
        country: "DRC",
        province: "Eldara",
        city: "Velmont 12",
        municipality: "East Arindale",
      },
    ]
  );

  const { t } = useTranslation();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [editingState, setEditingState] = useState<EditingState>({
    addressId: 0,
    field: null,
  });

  const currencyOptions = [
    {
      value: "USD",
      label: "USD",
      flag: <USFlag className="w-5 h-4" />,
    },
    {
      value: "CDF",
      label: "CDF",
      flag: <CDFFlag className="w-5 h-4" />,
    },
  ];

  useEffect(() => {
    if (!projectData.addresses || projectData.addresses.length === 0) {
      updateProjectData({ addresses });
    }
  }, []);
  useEffect(() => {
    if (highlightErrors) {
      setTouched({
        projectName: true,
        projectReference: true,
        amount: true,
        beginDate: true,
        endDate: true,
      });

      validate("projectName", projectData.projectName || "");
      validate("projectReference", projectData.projectReference || "");
      validate("amount", projectData.amount || "");
      validate("beginDate", projectData.beginDate || "");
      validate("endDate", projectData.endDate || "");
    }
  }, [highlightErrors]);

  const validate = (name: string, value: string) => {
    const newErrors = { ...errors };

    if (name === "projectName") {
      if (!value.trim()) {
        newErrors.projectName = `${t("project_name_is_required")}`;
      } else {
        delete newErrors.projectName;
      }
    }

    if (name === "projectReference") {
      if (!value.trim()) {
        newErrors.projectReference = `${t("project_reference_is_required")}`;
      } else {
        delete newErrors.projectReference;
      }
    }

    if (name === "amount") {
      if (!value || Number(value) <= 0) {
        newErrors.amount = `${t(
          "amount_is_required_and_must_be_greater_than_zero"
        )}`;
      } else {
        delete newErrors.amount;
      }
    }

    if (name === "beginDate") {
      if (!value) {
        newErrors.beginDate = `${t("begin_date_is_required")}`;
      } else {
        delete newErrors.beginDate;
      }
    }

    if (name === "endDate") {
      if (!value) {
        newErrors.endDate = `${t("end_date_is_required")}`;
      } else {
        delete newErrors.endDate;
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

  const handleDescriptionChange = (value: string) => {
    updateProjectData({ description: value });
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
    updateProjectData({ files });
  };

  const handleCurrencyChange = (value: string, currency: string) => {
    updateProjectData({ amount: value, currency });
    validate("amount", value);
    setTouched({ ...touched, amount: true });
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    validate(field, projectData[field] || "");
  };

  const addAddress = () => {
    const newAddress: Address = {
      id:
        addresses.length > 0
          ? Math.max(...addresses.map((addr) => addr.id)) + 1
          : 1,
      country: "",
      province: "",
      city: "",
      municipality: "",
    };
    const updatedAddresses = [...addresses, newAddress];
    setAddresses(updatedAddresses);
    updateProjectData({ addresses: updatedAddresses });
    setEditingState({ addressId: newAddress.id, field: "country" });
  };

  const deleteAddress = (id: number) => {
    const updatedAddresses = addresses.filter((addr) => addr.id !== id);
    setAddresses(updatedAddresses);
    updateProjectData({ addresses: updatedAddresses });
    if (editingState.addressId === id) {
      setEditingState({ addressId: 0, field: null });
    }
  };

  const updateAddress = (id: number, field: keyof Address, value: string) => {
    const updatedAddresses = addresses.map((addr) =>
      addr.id === id ? { ...addr, [field]: value } : addr
    );
    setAddresses(updatedAddresses);
    updateProjectData({ addresses: updatedAddresses });
  };

  const startEditing = (id: number, field: string) => {
    setEditingState({ addressId: id, field });
  };

  const stopEditing = () => {
    setEditingState({ addressId: 0, field: null });
  };

  const isFieldEditing = (id: number, field: string) => {
    return editingState.addressId === id && editingState.field === field;
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      stopEditing();
    }
  };
  const shouldShowError = (fieldName: keyof ValidationErrors) => {
    return (
      (touched[fieldName] && !!errors[fieldName]) ||
      (highlightErrors && fieldErrors[fieldName])
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
    onSuccess: (data) => {
      // toast.success("File uploaded successfully!");
      console.log("Upload result:", data);
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

  const handleDeleteFile = async (fileId: string) => {
    const response = await removeFileMutation.mutateAsync(fileId);
    if (response.status) {
      const filteredFiles = projectData.files.filter(
        (file: any) => file.id !== fileId
      );
      updateProjectData({ files: filteredFiles });
      return { status: true };
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Typography size="lg" weight="semibold" className="text-secondary-100">
          {t("project_info")}
        </Typography>
        <Typography size="base" weight="normal" className="text-secondary-60">
          {t("enter_key_details_about_your_project_to_continue")}
        </Typography>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="projectName">
            {t("project_name")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="projectName"
            name="projectName"
            placeholder={t("renovation_project")}
            value={projectData.projectName}
            onChange={handleInputChange}
            onBlur={() => handleBlur("projectName")}
            error={shouldShowError("projectName")}
          />
          {shouldShowError("projectName") && (
            <p className="mt-1 text-sm text-red-500">
              {errors.projectName || t("project_name_is_required")}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="projectReference">
              {t("project_reference")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="projectReference"
              name="projectReference"
              placeholder="PRJ-2023-001"
              value={projectData.projectReference}
              onChange={handleInputChange}
              onBlur={() => handleBlur("projectReference")}
              error={shouldShowError("projectReference")}
            />
            {shouldShowError("projectReference") && (
              <p className="mt-1 text-sm text-red-500">
                {errors.projectReference || t("project_reference_is_required")}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="amount">
              {t("amount")} <span className="text-red-500">*</span>
            </Label>
            <CurrencyInput
              id="amount"
              value={projectData.amount}
              currency={projectData.currency || "USD"}
              options={currencyOptions}
              onChange={handleCurrencyChange}
              onBlur={() => handleBlur("amount")}
              error={shouldShowError("amount")}
            />
            {shouldShowError("amount") && (
              <p className="mt-1 text-sm text-red-500">
                {errors.amount || t("amount_is_required")}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="startDate">
              {t("project_start_date")} <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              id="beginDate"
              defaultDate={projectData.beginDate}
              onChange={(selectedDates: Date[]) =>
                handleDateChange("beginDate", selectedDates[0])
              }
              placeholder="01-06-2025"
              error={
                shouldShowError("beginDate")
                  ? errors.beginDate || "Invalid date"
                  : false
              }
            />
            {/* {shouldShowError("beginDate") && (
              <p className="mt-1 text-sm text-red-500">
                {errors.beginDate || t("start_date_is_required")}
              </p>
            )} */}
          </div>

          <div>
            <Label htmlFor="endDate">
              {t("project_end_date")} <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              id="endDate"
              defaultDate={projectData.endDate}
              onChange={(selectedDates: Date[]) =>
                handleDateChange("endDate", selectedDates[0])
              }
              placeholder="31-12-2025"
              error={
                shouldShowError("endDate")
                  ? errors.endDate || "End date is required"
                  : false
              }
            />
            {/* {shouldShowError("endDate") && (
              <p className="mt-1 text-sm text-red-500">
                {errors.endDate || "End date is required"}
              </p>
            )} */}
          </div>
        </div>
        <div>
          <Label htmlFor="description">{t("description")}</Label>
          <TextEditor
            placeholder={t("write_here")}
            maxLength={100}
            initialValue={projectData.description || ""}
            onChange={handleDescriptionChange}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <Label>{t("address")}</Label>
            <button
              className="flex items-center gap-1 text-primary-150 text-sm font-medium px-3 py-1 border border-primary-150 rounded-lg hover:bg-blue-50"
              onClick={addAddress}
            >
              <span className="text-base">+</span>
              {t("add_address")}
            </button>
          </div>
          <div className="overflow-x-auto border border-secondary-30 rounded-lg">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-secondary-30 text-xs text-secondary-60">
                  <th className="p-2 text-left">{t("sr_no")}</th>
                  <th className="p-2 text-left">{t("country")}</th>
                  <th className="p-2 text-left">{t("province")}</th>
                  <th className="p-2 text-left">{t("city")}</th>
                  <th className="p-2 text-left">{t("municipality")}</th>
                  <th className="p-2 text-left">{t("action")}</th>
                </tr>
              </thead>
              <tbody>
                {addresses.map((address, index) => (
                  <tr
                    key={address.id}
                    className="border-b border-secondary-30 last:border-0"
                  >
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">
                      {isFieldEditing(address.id, "country") ? (
                        <Input
                          value={address.country}
                          onChange={(e) =>
                            updateAddress(address.id, "country", e.target.value)
                          }
                          onBlur={stopEditing}
                          onKeyDown={handleKeyDown}
                          size={12}
                          autoFocus
                        />
                      ) : (
                        <div
                          onClick={() => startEditing(address.id, "country")}
                          className="cursor-pointer hover:bg-secondary-5 p-1 rounded"
                        >
                          {address.country || "—"}
                        </div>
                      )}
                    </td>
                    <td className="p-2">
                      {isFieldEditing(address.id, "province") ? (
                        <Input
                          value={address.province}
                          onChange={(e) =>
                            updateAddress(
                              address.id,
                              "province",
                              e.target.value
                            )
                          }
                          onBlur={stopEditing}
                          onKeyDown={handleKeyDown}
                          size={12}
                          autoFocus
                        />
                      ) : (
                        <div
                          onClick={() => startEditing(address.id, "province")}
                          className="cursor-pointer hover:bg-secondary-5 p-1 rounded"
                        >
                          {address.province || "—"}
                        </div>
                      )}
                    </td>
                    <td className="p-2">
                      {isFieldEditing(address.id, "city") ? (
                        <Input
                          value={address.city}
                          onChange={(e) =>
                            updateAddress(address.id, "city", e.target.value)
                          }
                          onBlur={stopEditing}
                          onKeyDown={handleKeyDown}
                          size={12}
                          autoFocus
                        />
                      ) : (
                        <div
                          onClick={() => startEditing(address.id, "city")}
                          className="cursor-pointer hover:bg-secondary-5 p-1 rounded"
                        >
                          {address.city || "—"}
                        </div>
                      )}
                    </td>
                    <td className="p-2">
                      {isFieldEditing(address.id, "municipality") ? (
                        <Input
                          value={address.municipality}
                          onChange={(e) =>
                            updateAddress(
                              address.id,
                              "municipality",
                              e.target.value
                            )
                          }
                          onBlur={stopEditing}
                          onKeyDown={handleKeyDown}
                          size={12}
                          autoFocus
                        />
                      ) : (
                        <div
                          onClick={() =>
                            startEditing(address.id, "municipality")
                          }
                          className="cursor-pointer hover:bg-secondary-5 p-1 rounded"
                        >
                          {address.municipality || "—"}
                        </div>
                      )}
                    </td>
                    <td className="p-2">
                      <button
                        className="text-red-500"
                        onClick={() => deleteAddress(address.id)}
                      >
                        <TrashIcon width={20} height={20} />
                      </button>
                    </td>
                  </tr>
                ))}
                {addresses.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-4 text-center text-secondary-60"
                    >
                      {t("no_addresses_added_yet")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <Label>{t("upload_files")}</Label>
          <UploadFile
            maxSize={10}
            acceptedFormats={[".pdf", ".doc", ".txt", ".ppt"]}
            onFilesSelect={handleFilesSelect}
            files={projectData.files}
            onUploadFile={handleUploadFile}
            onDeleteFile={handleDeleteFile}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoForm;
