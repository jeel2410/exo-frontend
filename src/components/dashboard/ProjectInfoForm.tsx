import { ReactNode, useState } from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import Input from "../../lib/components/atoms/Input";
import Label from "../../lib/components/atoms/Label";
import DatePicker from "../../lib/components/atoms/DatePicker";
import CurrencyInput from "../../lib/components/atoms/CurrencyInput";
import Typography from "../../lib/components/atoms/Typography";
import TextEditor from "../../lib/components/atoms/TextEditor";
import UploadFile, { UploadedFile } from "../common/UploadFile";
import { ArrowRightIconButton, SaveDraftIcon, TrashIcon } from "../../icons";
import { USFlag, CDFFlag } from "../../icons";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import projectService from "../../services/project.service";
import { useAuth } from "../../context/AuthContext";
import Button from "../../lib/components/atoms/Button";

interface ProjectInfoFormProps {
  initialValues?: ProjectFormValues;
  onSubmit: (values: ProjectFormValues, resetForm?: () => void) => void;
  children?: ReactNode;
  loading?: boolean;
}

interface Address {
  id: number;
  country: string;
  province: string;
  city: string;
  municipality: string;
}

interface ProjectFormValues {
  projectName: string;
  fundedBy: string;
  projectReference: string;
  amount: string;
  currency: string;
  beginDate: string | Date;
  endDate: string | Date;
  description: string;
  addresses: Address[];
  files: UploadedFile[];
  status: "publish" | "draft";
}

export interface UploadResponse {
  id: string;
  url: string;
}

export interface UploadArgs {
  file: File;
  onProgress: (percent: number) => void;
}

export interface Data {
  id: number;
  requestNo: string;
  amount: string;
  createdDate: string;
  status: string;
  request_id: string;
}

const ProjectInfoForm = ({
  initialValues,
  onSubmit,
  loading,
}: // children,
ProjectInfoFormProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [editingState, setEditingState] = useState<{
    addressId: number;
    field: string | null;
  }>({
    addressId: 0,
    field: null,
  });
  const [formResetKey, setFormResetKey] = useState(Date.now().toString());

  const locationData = {
    countries: [{ value: "RD Congo", label: "RD Congo" }],
    provinces: [
      { value: "Kinshasa", label: "Kinshasa" },
      { value: "Nord-Kivu", label: "Nord-Kivu" },
      { value: "Kasai", label: "Kasai" },
    ],
    cities: [
      { value: "Kinshasa", label: "Kinshasa" },
      { value: "Goma", label: "Goma" },
      { value: "Mbuji-Mayi", label: "Mbuji-Mayi" },
    ],
    municipalities: [
      { value: "Munic", label: "Munic" },
      { value: "Gombe", label: "Gombe" },
      { value: "Kintambo", label: "Kintambo" },
      { value: "Karisimbi", label: "Karisimbi" },
      { value: "Dibindi", label: "Dibindi" },
    ],
  };

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

  const defaultInitialValues: ProjectFormValues = {
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

  // Validation schema
  const validationSchema = Yup.object().shape({
    projectName: Yup.string()
      .required(t("project_name_is_required"))
      .min(3, t("project_name_must_be_at_least_3_characters")),
    fundedBy: Yup.string()
      .required(t("funded_by_is_required"))
      .min(2, t("finance_by_must_be_at_least_2_characters")),
    projectReference: Yup.string().required(t("project_reference_is_required")),
    amount: Yup.string()
      .required(t("amount_is_required"))
      .test("is-positive-number", t("amount_must_be_positive"), (value) => {
        if (!value) return false;
        const num = parseFloat(value.replace(/,/g, ""));
        return !isNaN(num) && num > 0;
      }),
    currency: Yup.string().required(t("currency_is_required")),
    beginDate: Yup.string().required(t("begin_date_is_required")),
    endDate: Yup.string()
      .required(t("end_date_is_required"))
      .test(
        "is-after-begin-date",
        t("end_date_must_be_after_begin_date"),
        function (value) {
          const { beginDate } = this.parent;
          if (!value || !beginDate) return false;
          const endDate = new Date(value.split("-").reverse().join("-"));
          const startDate = new Date(beginDate.split("-").reverse().join("-"));
          return endDate > startDate;
        }
      ),
    description: Yup.string().max(500, t("description_max_500_characters")),
    addresses: Yup.array().of(
      Yup.object().shape({
        country: Yup.string().required(t("country_is_required")),
        province: Yup.string().required(t("province_is_required")),
        city: Yup.string().required(t("city_is_required")),
        municipality: Yup.string().required(t("municipality_is_required")),
      })
    ),
  });

  const handleSubmit = (
    values: ProjectFormValues,
    { resetForm }: FormikHelpers<ProjectFormValues>
  ) => {
    onSubmit(values, () => {
      resetForm();
      setFormResetKey(Date.now().toString());
    });
  };

  // Address management functions
  const addAddress = (
    setFieldValue: FormikHelpers<ProjectFormValues>["setFieldValue"],
    addresses: Address[]
  ) => {
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
    setFieldValue("addresses", updatedAddresses);
    setEditingState({ addressId: newAddress.id, field: "country" });
  };

  const deleteAddress = (
    setFieldValue: FormikHelpers<ProjectFormValues>["setFieldValue"],
    addresses: Address[],
    id: number
  ) => {
    const updatedAddresses = addresses.filter((addr) => addr.id !== id);
    setFieldValue("addresses", updatedAddresses);
    if (editingState.addressId === id) {
      setEditingState({ addressId: 0, field: null });
    }
  };

  const updateAddress = (
    setFieldValue: FormikHelpers<ProjectFormValues>["setFieldValue"],
    addresses: Address[],
    id: number,
    field: keyof Address,
    value: string
  ) => {
    const updatedAddresses = addresses.map((addr) => {
      if (addr.id === id) {
        const updatedAddr = { ...addr, [field]: value };

        // Clear dependent fields when parent field changes
        if (field === "country") {
          updatedAddr.province = "";
          updatedAddr.city = "";
          updatedAddr.municipality = "";
        } else if (field === "province") {
          updatedAddr.city = "";
          updatedAddr.municipality = "";
        } else if (field === "city") {
          updatedAddr.municipality = "";
        }

        return updatedAddr;
      }
      return addr;
    });
    setFieldValue("addresses", updatedAddresses);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
    if (e.key === "Enter" || e.key === "Escape") {
      stopEditing();
    }
  };

  const fileUploadMutation = async ({
    file,
    onProgress,
  }: {
    file: File;
    onProgress: (percent: number) => void;
  }): Promise<{ id: string; url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "document");
    formData.append("object_type", "project");

    const response = await projectService.uploadFile(formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        VAuthorization: `Bearer ${user?.token}`,
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
      // file:response.data.data ?? ""
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
  const handleUploadFile = async (
    file: File,
    onProgress: (percent: number) => void
  ) => {
    const response = await uploadMutation.mutateAsync({ file, onProgress });
    return response;
  };
  const CustomSelect = ({
    value,
    options,
    onChange,
    onBlur,
    onKeyDown,
    placeholder = "Select...",
    autoFocus = false,
    disabled = false,
  }: {
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    onBlur: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLSelectElement>) => void;
    placeholder?: string;
    autoFocus?: boolean;
    disabled?: boolean;
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      autoFocus={autoFocus}
      disabled={disabled || options.length === 0}
      className={`w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
        disabled || options.length === 0 ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
    >
      <option value="">
        {options.length === 0 ? "No options available" : placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  //  const fileUploadMutation = async ({
  //    file,
  //    onProgress,
  //  }: UploadArgs): Promise<UploadResponse> => {
  //    console.log("Inside mutation file:", file);
  //    const formData = new FormData();
  //    formData.append("file", file);
  //    formData.append("type", "document");
  //    formData.append("object_type", "project");

  //    const response = await projectService.uploadFile(formData, {
  //      headers: {
  //        "Content-Type": "multipart/form-data",
  //      },
  //      onUploadProgress: (event: ProgressEvent) => {
  //        if (event.total) {
  //          const percent = Math.round((event.loaded * 100) / event.total);
  //          onProgress(percent);
  //        }
  //      },
  //    });

  //    return {
  //      id: response.data.data?.id ?? Date.now().toString(),
  //      url: response.data.data?.url ?? "",
  //    };
  //  };

  //  const uploadMutation = useMutation({
  //    mutationFn: fileUploadMutation,
  //    onSuccess: (data) => {
  //      // toast.success("File uploaded successfully!");
  //      console.log("Upload result:", data);
  //    },
  //    onError: () => {
  //      // toast.error("Failed to upload file.");
  //    },
  //  });
  //  const handleUploadFile = async (file: any, onProgress: any) => {
  //    const response = await uploadMutation.mutateAsync({ file, onProgress });
  //    return response;
  //  };

  const removeFileMutation = useMutation({
    mutationFn: async (id: string) => {
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
  const handleDeleteFile = async (
    fileId: string,
    setFieldValue: FormikHelpers<ProjectFormValues>["setFieldValue"],
    files: UploadedFile[]
  ) => {
    const response = await removeFileMutation.mutateAsync(fileId);
    if (response.status) {
      const filteredFiles = files.filter(
        (file: UploadedFile) => file.id !== fileId
      );
      setFieldValue("files", filteredFiles);
      return { status: true };
    }
    return { status: false };
  };

  const handleRenameFile = async (
    newName: string,
    documentId: string
  ) => {
    try {
      const response = await projectService.changeDocumentName(newName, documentId);
      console.log("File renamed successfully:", response);
      return { status: true };
    } catch (error) {
      console.error("Failed to rename file:", error);
      return { status: false };
    }
  };
  return (
    <Formik
      initialValues={initialValues || defaultInitialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={true}
    >
      {({ values, setFieldValue, errors, touched, handleBlur, submitForm }) => (
        <Form>
          <div>
            <div className="mb-6">
              <Typography
                size="lg"
                weight="semibold"
                className="text-secondary-100"
              >
                {t("call_for_tenders")}
              </Typography>
              <Typography
                size="base"
                weight="normal"
                className="text-secondary-60"
              >
                {t("enter_key_details_about_your_project_to_continue")}
              </Typography>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="projectName">
                  {t("project_name")} <span className="text-red-500">*</span>
                </Label>
                <Field
                  as={Input}
                  id="projectName"
                  name="projectName"
                  placeholder={t("renovation_project")}
                  error={touched.projectName && !!errors.projectName}
                />
                <ErrorMessage
                  name="projectName"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>

              <div>
                <Label htmlFor="fundedBy">
                  {t("finance_by")} <span className="text-red-500">*</span>
                </Label>
                <Field
                  as={Input}
                  id="fundedBy"
                  name="fundedBy"
                  placeholder={t("finance_by")}
                  error={touched.fundedBy && !!errors.fundedBy}
                />
                <ErrorMessage
                  name="fundedBy"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="projectReference">
                    {t("project_reference")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Field
                    as={Input}
                    id="projectReference"
                    name="projectReference"
                    placeholder="PRJ-2023-001"
                    error={
                      touched.projectReference && !!errors.projectReference
                    }
                  />
                  <ErrorMessage
                    name="projectReference"
                    component="p"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>

                <div>
                  <Label htmlFor="amount">
                    {t("amount")} <span className="text-red-500">*</span>
                  </Label>
                  <CurrencyInput
                    id="amount"
                    value={values.amount}
                    currency={values.currency}
                    options={currencyOptions}
                    onChange={(value: string, currency: string) => {
                      setFieldValue("amount", value);
                      setFieldValue("currency", currency);
                    }}
                    onBlur={() => handleBlur("amount")}
                    error={touched.amount && !!errors.amount}
                  />
                  <ErrorMessage
                    name="amount"
                    component="p"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="beginDate">
                    {t("project_start_date")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <DatePicker
                    key={`beginDate-${formResetKey}`}
                    id="beginDate"
                    defaultDate={
                      values.beginDate ? new Date(values.beginDate) : undefined
                    }
                    onChange={(selectedDates: Date[]) => {
                      if (selectedDates[0]) {
                        const day = selectedDates[0]
                          .getDate()
                          .toString()
                          .padStart(2, "0");
                        const month = (selectedDates[0].getMonth() + 1)
                          .toString()
                          .padStart(2, "0");
                        const year = selectedDates[0].getFullYear();
                        const formattedDate = `${day}-${month}-${year}`;
                        setFieldValue("beginDate", formattedDate);
                      }
                    }}
                    placeholder="01-06-2025"
                    error={
                      touched.beginDate && errors.beginDate
                        ? errors.beginDate
                        : false
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">
                    {t("project_end_date")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <DatePicker
                    key={`beginDate-${formResetKey}`}
                    id="endDate"
                    defaultDate={
                      values.endDate ? new Date(values.endDate) : undefined
                    }
                    onChange={(selectedDates: Date[]) => {
                      if (selectedDates[0]) {
                        const day = selectedDates[0]
                          .getDate()
                          .toString()
                          .padStart(2, "0");
                        const month = (selectedDates[0].getMonth() + 1)
                          .toString()
                          .padStart(2, "0");
                        const year = selectedDates[0].getFullYear();
                        const formattedDate = `${day}-${month}-${year}`;
                        setFieldValue("endDate", formattedDate);
                      }
                    }}
                    placeholder="31-12-2025"
                    error={
                      touched.endDate && errors.endDate ? errors.endDate : false
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">{t("description")}</Label>
                <TextEditor
                  key={`description-${formResetKey}`}
                  placeholder={t("write_here")}
                  maxLength={100}
                  initialValue={values.description || ""}
                  onChange={(value: string) =>
                    setFieldValue("description", value)
                  }
                />
                <ErrorMessage
                  name="description"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label>{t("address")}</Label>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-primary-150 text-sm font-medium px-3 py-1 border border-primary-150 rounded-lg hover:bg-blue-50"
                    onClick={() => addAddress(setFieldValue, values.addresses)}
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
                      {values.addresses.map((address, index) => (
                        <tr
                          key={address.id}
                          className="border-b border-secondary-30 last:border-0"
                        >
                          <td className="p-2">{index + 1}</td>

                          {/* Country */}
                          <td className="p-2">
                            {isFieldEditing(address.id, "country") ? (
                              <CustomSelect
                                value={address.country}
                                options={locationData.countries}
                                onChange={(value) =>
                                  updateAddress(
                                    setFieldValue,
                                    values.addresses,
                                    address.id,
                                    "country",
                                    value
                                  )
                                }
                                onBlur={stopEditing}
                                onKeyDown={handleKeyDown}
                                placeholder="Select country"
                                autoFocus
                              />
                            ) : (
                              <div
                                onClick={() =>
                                  startEditing(address.id, "country")
                                }
                                className="cursor-pointer hover:bg-secondary-5 p-1 rounded"
                              >
                                {address.country || "—"}
                              </div>
                            )}
                          </td>

                          {/* Province */}
                          <td className="p-2">
                            {isFieldEditing(address.id, "province") ? (
                              <CustomSelect
                                value={address.province}
                                options={locationData.provinces}
                                onChange={(value) =>
                                  updateAddress(
                                    setFieldValue,
                                    values.addresses,
                                    address.id,
                                    "province",
                                    value
                                  )
                                }
                                onBlur={stopEditing}
                                onKeyDown={handleKeyDown}
                                placeholder="Select province"
                                disabled={!address.country}
                                autoFocus
                              />
                            ) : (
                              <div
                                onClick={() =>
                                  address.country &&
                                  startEditing(address.id, "province")
                                }
                                className={`p-1 rounded ${
                                  address.country
                                    ? "cursor-pointer hover:bg-secondary-5"
                                    : "cursor-not-allowed text-gray-400"
                                }`}
                              >
                                {address.province || "—"}
                              </div>
                            )}
                          </td>

                          {/* City */}
                          <td className="p-2">
                            {isFieldEditing(address.id, "city") ? (
                              <CustomSelect
                                value={address.city}
                                options={locationData.cities}
                                onChange={(value) =>
                                  updateAddress(
                                    setFieldValue,
                                    values.addresses,
                                    address.id,
                                    "city",
                                    value
                                  )
                                }
                                onBlur={stopEditing}
                                onKeyDown={handleKeyDown}
                                placeholder="Select city"
                                disabled={!address.province}
                                autoFocus
                              />
                            ) : (
                              <div
                                onClick={() =>
                                  address.province &&
                                  startEditing(address.id, "city")
                                }
                                className={`p-1 rounded ${
                                  address.province
                                    ? "cursor-pointer hover:bg-secondary-5"
                                    : "cursor-not-allowed text-gray-400"
                                }`}
                              >
                                {address.city || "—"}
                              </div>
                            )}
                          </td>

                          {/* Municipality */}
                          <td className="p-2">
                            {isFieldEditing(address.id, "municipality") ? (
                              <CustomSelect
                                value={address.municipality}
                                options={locationData.municipalities}
                                onChange={(value) =>
                                  updateAddress(
                                    setFieldValue,
                                    values.addresses,
                                    address.id,
                                    "municipality",
                                    value
                                  )
                                }
                                onBlur={stopEditing}
                                onKeyDown={handleKeyDown}
                                placeholder="Select municipality"
                                disabled={!address.city}
                                autoFocus
                              />
                            ) : (
                              <div
                                onClick={() =>
                                  address.city &&
                                  startEditing(address.id, "municipality")
                                }
                                className={`p-1 rounded ${
                                  address.city
                                    ? "cursor-pointer hover:bg-secondary-5"
                                    : "cursor-not-allowed text-gray-400"
                                }`}
                              >
                                {address.municipality || "—"}
                              </div>
                            )}
                          </td>

                          {/* Action */}
                          <td className="p-2">
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700"
                              onClick={() =>
                                deleteAddress(
                                  setFieldValue,
                                  values.addresses,
                                  address.id
                                )
                              }
                            >
                              <TrashIcon width={20} height={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {values.addresses.length === 0 && (
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
                  onFilesSelect={(files: UploadedFile[]) =>
                    setFieldValue("files", files)
                  }
                  files={values.files}
                  context="create-project"
                  onUploadFile={handleUploadFile}
                  onDeleteFile={async (fileId: string) => {
                    return handleDeleteFile(
                      fileId,
                      setFieldValue,
                      values.files
                    );
                  }}
                  onRenameFile={handleRenameFile}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col-reverse md:flex-row justify-end gap-4 mt-8">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setFieldValue("status", "draft");
                submitForm();
              }}
              loading={loading && values.status === "draft"}
              className="px-6 py-3 bg-white rounded-lg text-primary-150 font-medium flex items-center justify-center gap-2 shadow-md hover:bg-gray-50 w-full md:w-auto"
            >
              <SaveDraftIcon
                width={20}
                height={20}
                className="text-primary-150"
              />
              {t("save_as_draft")}
            </Button>

            <Button
              variant="primary"
              type="button"
              onClick={() => {
                setFieldValue("status", "publish");
                submitForm();
              }}
              loading={loading && values.status === "publish"}
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
          {/* {children && <>{children}</>} */}
        </Form>
      )}
    </Formik>
  );
};

export default ProjectInfoForm;
