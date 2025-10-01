import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import UploadFile, { UploadedFile } from "../../common/UploadFile";
import Label from "../../../lib/components/atoms/Label";
import Input from "../../../lib/components/atoms/Input";
import CurrencyInput from "../../../lib/components/atoms/CurrencyInput";
import DatePicker from "../../../lib/components/atoms/DatePicker";
import { ArrowRightIconButton, CDFFlag, USFlag } from "../../../icons";
import Button from "../../../lib/components/atoms/Button";
import Typography from "../../../lib/components/atoms/Typography";
import moment from "moment";
import { useMutation } from "@tanstack/react-query";
import projectService from "../../../services/project.service";

interface ContractFormValues {
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
  
  // Legacy fields for backward compatibility (can be removed later)
  signedBy?: string;
  position?: string;
  organization?: string;
}

interface StepProps {
  initialValues?: ContractFormValues;
  onSubmit: (values: ContractFormValues) => void;
  isProjectSelected?: boolean;
  projectAmount?: string;
}

const ContractInfoForm = ({
  initialValues,
  onSubmit,
  isProjectSelected = false,
  projectAmount,
}: StepProps) => {
  const { t } = useTranslation();

  const defaultValues: ContractFormValues = {
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

  const validationSchema = Yup.object().shape({
    // Contract basic info
    name: Yup.string().required(t("name_required")),
    reference: Yup.string().required(t("reference_required")),
    amount: Yup.string()
      .required(t("amount_required"))
      .test("is-positive-number", t("amount_must_be_positive"), (value) => {
        if (!value) return false;
        // Value is now raw digits only (e.g., "456" instead of "456.00")
        const num = parseFloat(value);
        return !isNaN(num) && num > 0;
      })
      .test(
        "amount-less-than-project",
        t("contract_amount_exceeds_project"),
        (value) => {
          if (!projectAmount || !value) return true;
          // Value is now raw digits only 
          const contractAmount = parseFloat(value);
          // Project amount might still come formatted, so clean it
          const projAmount = parseFloat(projectAmount.replace(/[^0-9.]/g, ""));
          return (
            !isNaN(contractAmount) &&
            !isNaN(projAmount) &&
            contractAmount <= projAmount
          );
        }
      ),
    
    // Contracting/Executing Agency
    contractingAgencyName: Yup.string().required(t("contracting_agency_name_required")),
    contractingAuthorizedPersonName: Yup.string().required(t("contracting_authorized_person_name_required")),
    contractingAuthorizedPersonPosition: Yup.string().required(t("contracting_authorized_person_position_required")),
    
    // Rewarded Company
    rewardedCompanyName: Yup.string().required(t("rewarded_company_name_required")),
    rewardedAuthorizedPersonName: Yup.string().required(t("rewarded_authorized_person_name_required")),
    rewardedAuthorizedPersonPosition: Yup.string().required(t("rewarded_authorized_person_position_required")),
    
    // Signing details
    dateOfSigning: Yup.string().required(t("date_required")),
    place: Yup.string().required(t("place_required")),
  });

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
    formData.append("object_type", "contract");

    const response = await projectService.uploadFile(formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        // VAuthorization: `Bearer ${user?.token}`,
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
    setFieldValue: FormikHelpers<ContractFormValues>["setFieldValue"],
    files: UploadedFile[]
  ) => {
    const response = await removeFileMutation.mutateAsync(fileId);
    if (response.status) {
      const filteredFiles = files.filter(
        (file: UploadedFile) => file.id !== fileId
      );
      setFieldValue("contractFiles", filteredFiles);
      return { status: true };
    }
    return { status: false };
  };

  const handleRenameFile = async (
    fileId: string,
    newName: string,
    setFieldValue: FormikHelpers<ContractFormValues>["setFieldValue"],
    files: UploadedFile[]
  ) => {
    try {
      const response = await projectService.changeDocumentName(newName, fileId);
      console.log("File renamed successfully:", response);

      // Update the file name in the local state
      const updatedFiles = files.map((file: UploadedFile) => {
        if (file.id === fileId) {
          return {
            ...file,
            file: {
              ...file.file,
              name: response.data?.new_name || newName,
            },
            original_name: response.data?.new_name || newName,
          };
        }
        return file;
      });

      setFieldValue("contractFiles", updatedFiles);

      return { status: true, newName: response.data?.new_name || newName };
    } catch (error) {
      console.error("Failed to rename file:", error);
      return { status: false };
    }
  };

  console.log("Initial values:", initialValues);

  return (
    <Formik
      initialValues={initialValues || defaultValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, touched, errors, validateField }) => (
        <Form className="space-y-6">
          <div className="mb-6">
            <Typography
              size="lg"
              weight="semibold"
              className="text-secondary-100"
            >
              {t("contract_info")}
            </Typography>
            <Typography
              size="base"
              weight="normal"
              className="text-secondary-60"
            >
              {t("contract_info_description")}
            </Typography>
          </div>

          {/* Contract Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <Typography size="lg" weight="semibold" className="text-secondary-100 mb-4">
              {t("basic_contract_info")}
            </Typography>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">
                  {t("contract_name")}
                  <span className="text-red-500">*</span>
                </Label>
                <Field
                  id="name"
                  as={Input}
                  name="name"
                  placeholder={t("contract_name_placeholder")}
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="reference">
                  {t("contract_reference")}
                  <span className="text-red-500">*</span>
                </Label>
                <Field
                  id="reference"
                  as={Input}
                  name="reference"
                  placeholder={t("contract_reference_placeholder")}
                />
                <ErrorMessage
                  name="reference"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="amount">
                  {t("contract_amount")}
                  <span className="text-red-500">*</span>
                </Label>
                <CurrencyInput
                  id="amount"
                  options={currencyOptions}
                  value={values.amount}
                  currency={values.currency}
                  currencyDisabled={isProjectSelected}
                  onChange={(amount: string, currency: string) => {
                    setFieldValue("amount", amount);
                    if (!isProjectSelected) {
                      setFieldValue("currency", currency);
                    }
                    validateField("amount");
                  }}
                />
                {isProjectSelected && (
                  <Typography size="sm" className="text-secondary-60 mt-1">
                    {t("currency_fixed_based_on_project")}
                  </Typography>
                )}
                <ErrorMessage
                  name="amount"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            </div>
          </div>

          {/* Contracting/Executing Agency Information */}
          <div className="bg-blue-50 p-4 rounded-lg border">
            <Typography size="lg" weight="semibold" className="text-secondary-100 mb-4">
              {t("contracting_executing_agency")}
            </Typography>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="contractingAgencyName">
                  {t("agency_name")}
                  <span className="text-red-500">*</span>
                </Label>
                <Field
                  id="contractingAgencyName"
                  as={Input}
                  name="contractingAgencyName"
                  placeholder={t("agency_name_placeholder")}
                />
                <ErrorMessage
                  name="contractingAgencyName"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contractingAuthorizedPersonName">
                    {t("authorized_person_name")}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Field
                    id="contractingAuthorizedPersonName"
                    as={Input}
                    name="contractingAuthorizedPersonName"
                    placeholder={t("authorized_person_name_placeholder")}
                  />
                  <ErrorMessage
                    name="contractingAuthorizedPersonName"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contractingAuthorizedPersonPosition">
                    {t("authorized_person_title")}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Field
                    id="contractingAuthorizedPersonPosition"
                    as={Input}
                    name="contractingAuthorizedPersonPosition"
                    placeholder={t("authorized_person_title_placeholder")}
                  />
                  <ErrorMessage
                    name="contractingAuthorizedPersonPosition"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rewarded Company Information */}
          <div className="bg-green-50 p-4 rounded-lg border">
            <Typography size="lg" weight="semibold" className="text-secondary-100 mb-4">
              {t("rewarded_company")}
            </Typography>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="rewardedCompanyName">
                  {t("company_name")}
                  <span className="text-red-500">*</span>
                </Label>
                <Field
                  id="rewardedCompanyName"
                  as={Input}
                  name="rewardedCompanyName"
                  placeholder={t("company_name_placeholder")}
                />
                <ErrorMessage
                  name="rewardedCompanyName"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rewardedAuthorizedPersonName">
                    {t("authorized_person_name")}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Field
                    id="rewardedAuthorizedPersonName"
                    as={Input}
                    name="rewardedAuthorizedPersonName"
                    placeholder={t("authorized_person_name_placeholder")}
                  />
                  <ErrorMessage
                    name="rewardedAuthorizedPersonName"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="rewardedAuthorizedPersonPosition">
                    {t("authorized_person_title")}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Field
                    id="rewardedAuthorizedPersonPosition"
                    as={Input}
                    name="rewardedAuthorizedPersonPosition"
                    placeholder={t("authorized_person_title_placeholder")}
                  />
                  <ErrorMessage
                    name="rewardedAuthorizedPersonPosition"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Signing Details */}
          <div className="bg-yellow-50 p-4 rounded-lg border">
            <Typography size="lg" weight="semibold" className="text-secondary-100 mb-4">
              {t("signing_details")}
            </Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfSigning">
                  {t("date_of_signing")}
                  <span className="text-red-500">*</span>
                </Label>
                <DatePicker
                  id="dateOfSigning"
                  defaultDate={
                    values.dateOfSigning
                      ? moment(
                          values.dateOfSigning,
                          ["DD-MM-YYYY", "YYYY-MM-DD"],
                          true
                        ).toDate()
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
                      setFieldValue("dateOfSigning", formattedDate);
                    }
                  }}
                  placeholder="2025-07-13"
                  error={
                    touched.dateOfSigning && errors.dateOfSigning
                      ? errors.dateOfSigning
                      : false
                  }
                />
                <ErrorMessage
                  name="dateOfSigning"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="place">
                  {t("place_of_signing")}
                  <span className="text-red-500">*</span>
                </Label>
                <Field
                  as={Input}
                  name="place"
                  id="place"
                  placeholder={t("place_of_signing_placeholder")}
                />
                <ErrorMessage
                  name="place"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <Typography size="lg" weight="semibold" className="text-secondary-100 mb-4">
              {t("contract_documents")}
            </Typography>
            
            <div>
              <Label>{t("upload_contract_files")}</Label>
              <Typography size="sm" className="text-secondary-60 mb-2">
                {t("contract_document_description")}
              </Typography>
              <UploadFile
                files={values.contractFiles}
                onFilesSelect={(files) => setFieldValue("contractFiles", files)}
                onUploadFile={handleUploadFile}
                context="create-contract"
                onRenameFile={async (fileId: string, newName: string) => {
                  console.log("Renaming file:", fileId, newName);
                  return await handleRenameFile(
                    fileId,
                    newName,
                    setFieldValue,
                    values.contractFiles
                  );
                }}
                onDeleteFile={async (fileId: string) => {
                  return handleDeleteFile(
                    fileId,
                    setFieldValue,
                    values.contractFiles
                  );
                }}
                maxSize={5}
                acceptedFormats={[".pdf", ".doc", ".docx"]}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              variant="primary"
              type="submit"
              //   form="project-form"
              className="px-6 py-3 bg-primary-150 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-primary-200 w-full md:w-auto"
            >
              {t("next")}
              <ArrowRightIconButton
                width={18}
                height={18}
                className="text-white"
              />
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ContractInfoForm;
