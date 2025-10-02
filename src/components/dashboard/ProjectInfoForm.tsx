import { ReactNode, useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import Input from "../../lib/components/atoms/Input";
import Label from "../../lib/components/atoms/Label";
import DatePicker from "../../lib/components/atoms/DatePicker";
import CurrencyInput from "../../lib/components/atoms/CurrencyInput";
import Typography from "../../lib/components/atoms/Typography";
import TextEditor from "../../lib/components/atoms/TextEditor";
import UploadFile, { UploadedFile } from "../common/UploadFile";
import {
  ArrowRightIconButton,
  SaveDraftIcon,
  TrashIcon,
  WhitePlusIcon,
} from "../../icons";
import { USFlag, CDFFlag } from "../../icons";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import projectService from "../../services/project.service";
import { useAuth } from "../../context/AuthContext";
import Button from "../../lib/components/atoms/Button";
import CustomDropdown from "../../lib/components/atoms/CustomDropdown";
import fundedByOptionsService from "../../services/fundedByOptions.service";

interface ProjectInfoFormProps {
  initialValues?: ProjectFormValues;
  onSubmit: (values: ProjectFormValues, resetForm?: () => void) => void;
  children?: ReactNode;
  loading?: boolean;
  referenceError?: string | null;
  onClearReferenceError?: () => void;
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
  description: string | null;
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
  referenceError,
  onClearReferenceError,
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
  const [isFormResetRequested, setIsFormResetRequested] = useState(false);
  const [cityData, setCityData] = useState<any>(null);

  useEffect(() => {
    const resetFilesListener = () => {
      setIsFormResetRequested(true);
    };

    window.addEventListener("form-reset", resetFilesListener);

    return () => {
      window.removeEventListener("form-reset", resetFilesListener);
    };
  }, []);

  // Load city data from JSON file
  useEffect(() => {
    const loadCityData = async () => {
      try {
        const response = await fetch("/city/city_data.json");
        const data = await response.json();
        setCityData(data);
      } catch (error) {
        console.error("Failed to load city data:", error);
        // Fallback to empty object if loading fails
        setCityData({});
      }
    };
    loadCityData();
  }, []);

  // Helper function to check if a city has any available municipalities
  const hasAvailableMunicipalities = (
    provinceName: string,
    cityName: string,
    currentAddressId?: number,
    existingAddresses: Address[] = []
  ) => {
    if (
      !cityData ||
      !cityData[provinceName] ||
      !cityData[provinceName][cityName]
    ) {
      return false;
    }

    const municipalities = cityData[provinceName][cityName];
    const usedMunicipalities = existingAddresses
      .filter(
        (addr) =>
          addr.id !== currentAddressId &&
          addr.province === provinceName &&
          addr.city === cityName &&
          addr.municipality
      )
      .map((addr) => addr.municipality);

    return municipalities.some(
      (municipality: string) => !usedMunicipalities.includes(municipality)
    );
  };

  // Helper function to check if a province has any cities with available municipalities
  const hasAvailableCities = (
    provinceName: string,
    currentAddressId?: number,
    existingAddresses: Address[] = []
  ) => {
    if (!cityData || !cityData[provinceName]) {
      return false;
    }

    const cities = Object.keys(cityData[provinceName]);
    return cities.some((city) =>
      hasAvailableMunicipalities(
        provinceName,
        city,
        currentAddressId,
        existingAddresses
      )
    );
  };

  // Dynamic location data from JSON with intelligent filtering
  const getProvinceOptions = (
    currentAddressId?: number,
    existingAddresses: Address[] = []
  ) => {
    if (!cityData) return [];

    // Only show provinces that have at least one city with available municipalities
    return Object.keys(cityData)
      .filter((province) =>
        hasAvailableCities(province, currentAddressId, existingAddresses)
      )
      .map((province) => ({
        value: province,
        label: province,
      }));
  };

  const getCityOptions = (
    selectedProvince: string,
    currentAddressId?: number,
    existingAddresses: Address[] = []
  ) => {
    if (!selectedProvince || !cityData || !cityData[selectedProvince]) {
      return [];
    }

    // Only show cities that have at least one available municipality
    return Object.keys(cityData[selectedProvince])
      .filter((city) =>
        hasAvailableMunicipalities(
          selectedProvince,
          city,
          currentAddressId,
          existingAddresses
        )
      )
      .map((city) => ({
        value: city,
        label: city,
      }));
  };

  const getMunicipalityOptions = (
    selectedProvince: string,
    selectedCity: string,
    currentAddressId?: number,
    existingAddresses: Address[] = []
  ) => {
    if (
      !selectedProvince ||
      !selectedCity ||
      !cityData ||
      !cityData[selectedProvince]
    ) {
      return [];
    }
    const provinceData = cityData[selectedProvince];
    const municipalities = provinceData[selectedCity];
    if (!municipalities) {
      return [];
    }

    // Only show municipalities that are not already used for this province + city combination
    const usedMunicipalities = existingAddresses
      .filter(
        (addr) =>
          addr.id !== currentAddressId &&
          addr.province === selectedProvince &&
          addr.city === selectedCity &&
          addr.municipality
      )
      .map((addr) => addr.municipality);

    return municipalities
      .filter(
        (municipality: string) => !usedMunicipalities.includes(municipality)
      )
      .map((municipality: string) => ({
        value: municipality,
        label: municipality,
      }));
  };

  const locationData = {
    countries: [{ value: "RD Congo", label: "RD Congo" }],
    provinces: [], // Will be populated dynamically with filtering
    cities: [], // Will be populated dynamically
    municipalities: [], // Will be populated dynamically
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

  // API-driven Funded By options state
  const [fundedByOptions, setFundedByOptions] = useState<{ value: string; label: string }[]>([]);
  const [fundedBySearch, setFundedBySearch] = useState("");
  const [fundedByTotal, setFundedByTotal] = useState(0);
  const [fundedByLimit] = useState(15);
  const [fundedByOffset, setFundedByOffset] = useState(0);
  const [fundedByLoadingMore, setFundedByLoadingMore] = useState(false);
  const hasMoreFundedBy = fundedByOptions.length < fundedByTotal;

  const loadFundedBy = async (opts?: { reset?: boolean; search?: string }) => {
    const reset = opts?.reset ?? false;
    const search = opts?.search ?? fundedBySearch;
    const nextOffset = reset ? 0 : fundedByOffset;
    if (!reset) setFundedByLoadingMore(true);
    try {
      const res = await fundedByOptionsService.getOptions({
        search: search || undefined,
        active: true,
        limit: fundedByLimit,
        offset: nextOffset,
      });
      const list = (res.data || []).map((it: any) => ({ value: it.name, label: it.name }));
      setFundedByTotal(res.total ?? list.length);

      setFundedByOptions(prev => {
        const base = reset ? [] : prev;
        // avoid duplicates by value
        const seen = new Set(base.map(o => o.value));
        const merged = [...base];
        list.forEach(o => { if (!seen.has(o.value)) { merged.push(o); seen.add(o.value); } });
        return merged;
      });
      setFundedByOffset(nextOffset + (res.limit ?? fundedByLimit));
    } catch (e) {
      console.error("Failed to load funded by options", e);
    } finally {
      if (!reset) setFundedByLoadingMore(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => {
      // reset list when searching
      setFundedByOffset(0);
      loadFundedBy({ reset: true, search: fundedBySearch });
    }, 300);
    return () => clearTimeout(id);
  }, [fundedBySearch]);

  // Prefetch on mount
  useEffect(() => {
    loadFundedBy({ reset: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      .required(t("finance_by_is_required"))
      .min(2, t("funded_by_must_be_at_least_2_characters")),
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
          // Handle both formats: YYYY-MM-DD and DD-MM-YYYY
          const endDate = new Date(value);
          const startDate = new Date(beginDate);
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
    { resetForm, setFieldValue }: FormikHelpers<ProjectFormValues>
  ) => {
    onSubmit(values, () => {
      resetForm();
      setFormResetKey(Date.now().toString());
      setFieldValue("files", []);
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

  // const handleKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
  //   if (e.key === "Enter" || e.key === "Escape") {
  //     stopEditing();
  //   }
  // };

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
    console.log(response, "response");

    return response;
  };

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

  const handleRenameFile = async (newName: string, documentId: string) => {
    try {
      const response = await projectService.changeDocumentName(
        documentId,
        newName
      );
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
      {({
        values,
        setFieldValue,
        errors,
        touched,
        handleBlur,
        submitForm,
        resetForm,
      }) => {
        useEffect(() => {
          if (isFormResetRequested) {
            resetForm();
            setFieldValue("files", []);
            setFormResetKey(Date.now().toString());
            setIsFormResetRequested(false);
          }
        }, [isFormResetRequested, resetForm, setFieldValue]);

        return (
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
                  <CustomDropdown
                    id="fundedBy"
                    name="fundedBy"
                    options={(function(){
                      // Ensure current value is present so label renders, even if not in the fetched page
                      const exists = fundedByOptions.some(o => o.value === values.fundedBy);
                      return exists || !values.fundedBy
                        ? fundedByOptions
                        : [{ value: values.fundedBy, label: values.fundedBy }, ...fundedByOptions];
                    })()}
                    value={values.fundedBy}
                    onChange={(value) => setFieldValue("fundedBy", value)}
                    onBlur={() => handleBlur("fundedBy")}
                    placeholder={t("select_finance_by")}
                    error={touched.fundedBy && !!errors.fundedBy}
                    searchable
                    searchValue={fundedBySearch}
                    onSearchChange={(v) => {
                      setFundedBySearch(v);
                    }}
                    onOpen={() => {
                      if (fundedByOptions.length === 0) {
                        loadFundedBy({ reset: true });
                      }
                    }}
                    onLoadMore={() => {
                      if (!fundedByLoadingMore && (fundedByOptions.length < fundedByTotal)) {
                        loadFundedBy();
                      }
                    }}
                    hasMore={hasMoreFundedBy}
                    loadingMore={fundedByLoadingMore}
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
                        (touched.projectReference &&
                          !!errors.projectReference) ||
                        !!referenceError
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue("projectReference", e.target.value);
                        // Clear reference error when user starts typing
                        if (referenceError && onClearReferenceError) {
                          onClearReferenceError();
                        }
                      }}
                    />
                    <ErrorMessage
                      name="projectReference"
                      component="p"
                      className="mt-1 text-sm text-red-500"
                    />
                    {referenceError && (
                      <p className="mt-1 text-sm text-red-500">
                        {referenceError}
                      </p>
                    )}
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
                        values.beginDate
                          ? new Date(values.beginDate)
                          : undefined
                      }
                      onChange={(selectedDates: Date[]) => {
                        if (selectedDates[0]) {
                          const year = selectedDates[0].getFullYear();
                          const month = (selectedDates[0].getMonth() + 1)
                            .toString()
                            .padStart(2, "0");
                          const day = selectedDates[0]
                            .getDate()
                            .toString()
                            .padStart(2, "0");
                          const formattedDate = `${year}-${month}-${day}`;
                          setFieldValue("beginDate", formattedDate);
                        }
                      }}
                      placeholder="2025-07-13"
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
                          const year = selectedDates[0].getFullYear();
                          const month = (selectedDates[0].getMonth() + 1)
                            .toString()
                            .padStart(2, "0");
                          const day = selectedDates[0]
                            .getDate()
                            .toString()
                            .padStart(2, "0");
                          const formattedDate = `${year}-${month}-${day}`;
                          setFieldValue("endDate", formattedDate);
                        }
                      }}
                      placeholder="2025-07-13"
                      error={
                        touched.endDate && errors.endDate
                          ? errors.endDate
                          : false
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
                    <Button
                      type="button"
                      variant="primary"
                      className="flex items-center gap-1 text-white text-sm font-medium px-3 py-2 rounded-lg w-auto"
                      onClick={() =>
                        addAddress(setFieldValue, values.addresses)
                      }
                    >
                      <WhitePlusIcon width={16} height={16} />
                      {t("add_address")}
                    </Button>
                  </div>
                  <div className="overflow-x-auto border border-secondary-30 rounded-lg">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-secondary-30 text-xs text-secondary-60">
                          <th className="p-2 text-left w-16">{t("sr_no")}</th>
                          <th className="p-2 text-left w-1/5">
                            {t("country")}
                          </th>
                          <th className="p-2 text-left w-1/5">
                            {t("province")}
                          </th>
                          <th className="p-2 text-left w-1/5">{t("city")}</th>
                          <th className="p-2 text-left w-1/5">
                            {t("municipality")}
                          </th>
                          <th className="p-2 text-left w-16">{t("action")}</th>
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
                                <CustomDropdown
                                  options={locationData.countries}
                                  value={address.country}
                                  onChange={(value) => {
                                    updateAddress(
                                      setFieldValue,
                                      values.addresses,
                                      address.id,
                                      "country",
                                      value
                                    );
                                    // Auto-open next dropdown (province)
                                    setTimeout(() => {
                                      startEditing(address.id, "province");
                                    }, 100);
                                  }}
                                  onBlur={stopEditing}
                                  placeholder={t("select_country")}
                                  autoFocus
                                  className="text-sm"
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
                                <CustomDropdown
                                  options={getProvinceOptions(
                                    address.id,
                                    values.addresses
                                  )}
                                  value={address.province}
                                  onChange={(value) => {
                                    updateAddress(
                                      setFieldValue,
                                      values.addresses,
                                      address.id,
                                      "province",
                                      value
                                    );
                                    // Auto-open next dropdown (city)
                                    setTimeout(() => {
                                      startEditing(address.id, "city");
                                    }, 100);
                                  }}
                                  onBlur={stopEditing}
                                  placeholder={t("select_province")}
                                  disabled={!address.country}
                                  autoFocus
                                  className="text-sm"
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
                                <CustomDropdown
                                  options={getCityOptions(
                                    address.province,
                                    address.id,
                                    values.addresses
                                  )}
                                  value={address.city}
                                  onChange={(value) => {
                                    updateAddress(
                                      setFieldValue,
                                      values.addresses,
                                      address.id,
                                      "city",
                                      value
                                    );
                                    // Auto-open next dropdown (municipality)
                                    setTimeout(() => {
                                      startEditing(address.id, "municipality");
                                    }, 100);
                                  }}
                                  onBlur={stopEditing}
                                  placeholder={t("select_city")}
                                  disabled={!address.province}
                                  autoFocus
                                  className="text-sm"
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
                                <CustomDropdown
                                  options={getMunicipalityOptions(
                                    address.province,
                                    address.city,
                                    address.id,
                                    values.addresses
                                  )}
                                  value={address.municipality}
                                  onChange={(value) => {
                                    updateAddress(
                                      setFieldValue,
                                      values.addresses,
                                      address.id,
                                      "municipality",
                                      value
                                    );
                                    stopEditing();
                                  }}
                                  onBlur={stopEditing}
                                  placeholder={t("select_municipality")}
                                  disabled={!address.city}
                                  autoFocus
                                  className="text-sm"
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
                    maxSize={2}
                    acceptedFormats={[".pdf"]}
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
        );
      }}
    </Formik>
  );
};

export default ProjectInfoForm;
