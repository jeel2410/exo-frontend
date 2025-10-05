import { useTranslation } from "react-i18next";
import {
  ArrowLeftIcon,
  FileVioletIcon,
  PlusBlueIcon,
  UsdGreenIcon,
  UsdOrangeIcon,
  UsdVioletIcon,
} from "../../icons";
import Label from "../../lib/components/atoms/Label";
import TextEditor from "../../lib/components/atoms/TextEditor";
import Typography from "../../lib/components/atoms/Typography";
import DashBoardCard from "../../lib/components/molecules/DashBoardCard";
import UploadFile, { UploadedFile } from "../common/UploadFile";
import CreateRequestTable, { Order } from "../table/CreateRequestTable.tsx";
import Button from "../../lib/components/atoms/Button";
import { useEffect, useState } from "react";
import AppLayout from "../../layout/AppLayout.tsx";
import localStorageService from "../../services/local.service.ts";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import projectService from "../../services/project.service.ts";
import { useNavigate, useParams } from "react-router";
import Loader from "../common/Loader.tsx";
import { toast } from "react-toastify";
import { useRoleRoute } from "../../hooks/useRoleRoute.ts";
import CreateRequestConfirmationModal from "../modal/CreateRequestConfirmationModal.tsx";
import { useModal } from "../../hooks/useModal.ts";

// Type for address data structure
interface AddressData {
  id: string;
  city: string;
  country: string;
  municipality: string;
  project_id: string;
  providence: string;
  user_id: number;
}

interface Entity {
  financial_authority: string;
  label: string;
  quantity: number;
  status: string;
  tax_amount: number;
  tax_rate: number;
  total: number;
  unit_price: number;
  vat_included: number;
  unit?: string;
  reference?: string; // Add reference field for API compatibility
  tarrif_position?: string; // Add tarrif position field for API compatibility
  issue_date?: string; // Add issue_date field for local acquisition
  nature_of_operation?: string; // Add nature_of_operations field for local acquisition
  custom_duties?: string; // Add custom_duties field
}

// Type for create request payload
interface CreateRequestPayload {
  project_id: string;
  address_id: string;
  request_letter: string;
  document_ids?: string;
  request_entity: string; // must be stringified JSON
  request_id?: string;
}

const AddRequest = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { requestId, projectId: newProjectId } = useParams();

  const [data, setData] = useState<Order[]>([]);
  const [userData, setUserData] = useState<{ token: string } | undefined>();
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [requestLetter, setRequestLetter] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [projectId, setProjectId] = useState<string>(
    "9f6e1e82-4a59-4a19-8200-dabac1239021"
  );
  const [totals, setTotals] = useState({
    totalEntity: 0,
    totalAmount: 0,
    totalTaxAmount: 0,
    totalAmountWithTax: 0,
  });
  const { getRoute } = useRoleRoute();
  const [financialAuthority, setFinancialAuthority] = useState<string>(
    ""
  );
  const [validationErrors, setValidationErrors] = useState<{
    address?: string;
    requestLetter?: string;
    fileUpload?: string;
  }>({});
  const [createdRequestId, setCreatedRequestId] = useState<string>("");
  const { isOpen, openModal, closeModal } = useModal();
  useEffect(() => {
    const user = localStorageService.getUser() || "";
    setUserData(JSON.parse(user));
  }, []);

  // let projectId = localStorageService.getProjectId() || null;

  // const { data: addressData, isLoading: isLoadingAddresses } = useQuery<any>({
  //   queryKey: [`project-${projectId}-address`],
  //   enabled: !!projectId && !!userData?.token,
  //   queryFn: async () => {
  //     const res = await axios.post(
  //       "https://exotrack.makuta.cash/api/V1/project/list-address",
  //       { project_id: projectId },
  //       {
  //         headers: {
  //           VAuthorization: `Bearer ${userData?.token}`,
  //         },
  //       }
  //     );
  //     return res.data;
  //   },
  // });
  const {
    mutate: fetchProjectAddresses,
    mutateAsync: fetchProjectAddressesAsync,
    data: addressData,
    isPending: isLoadingAddresses,
  } = useMutation({
    mutationFn: async (projectId: string) => {
      const res = await projectService.getAddressList(projectId);
      // const res = await axios.post(
      //   "https://exotrack.makuta.cash/api/V1/project/list-address",
      //   { project_id: projectId },
      //   {
      //     headers: {
      //       VAuthorization: `Bearer ${userData?.token}`,
      //     },
      //   }
      // );
      return res.data;
    },
  });

  const recalculateTableData = (tableData: Order[]): Order[] => {
    const result = tableData.map((row) => {
      const total = row.quantity * row.unitPrice;
      const taxAmount = (total * row.taxRate) / 100;
      const vatIncluded = total + taxAmount;
      return {
        ...row,
        total,
        taxAmount,
        vatIncluded,
      };
    });
    console.log(
      "🚀 recalculateTableData preserving units:",
      result.map((r) => ({ id: r.id, unit: r.unit }))
    );
    return result;
  };

  const handleAddEntity = () => {
    try {
      console.log("🚀 handleAddEntity called with financialAuthority:", financialAuthority);
      const newId = new Date().getTime();
      
      // Base order object
      const baseOrder: Order = {
        id: newId,
        label: "",
        quantity: 1,
        unitPrice: 0,
        unit: "",
        total: 0,
        taxRate: 0,
        taxAmount: 0,
        vatIncluded: 0,
        customDuty: "",
        reference: "", // Initialize reference field for new entities
        tarrifPosition: "", // Initialize tarrif position field for new entities
      };
      
      // Add location_acquisition specific fields if needed
      const newOrder: Order = financialAuthority === "location_acquisition" 
        ? {
            ...baseOrder,
            issueDate: "", // Initialize issue_date field for local acquisition
            natureOfOperations: "", // Initialize nature_of_operations field for local acquisition
          }
        : baseOrder;
      
      console.log("🚀 Created new order:", newOrder);
      setData(recalculateTableData([...data, newOrder]));
    } catch (error) {
      console.error("🚨 Error in handleAddEntity:", error);
    }
  };

  const updateEntitys = (entitys: Entity[]) => {
    const newOrder: Order[] = entitys.map((entity: Entity, index: number) => ({
      id: new Date().getTime() + index + 1,
      label: entity.label,
      quantity: entity.quantity,
      unitPrice: entity.unit_price,
      unit: entity.unit || "",
      total: entity.total,
      taxRate: entity.tax_rate,
      taxAmount: entity.tax_amount,
      vatIncluded: entity.vat_included,
      reference: entity.reference || "", // Map reference field from API response
      tarrifPosition: entity.tarrif_position || "", // Map tarrif position field from API response
      issueDate: entity.issue_date || "", // Map issue_date field from API response
      natureOfOperations: entity.nature_of_operation || "", // Map nature_of_operations field from API response
      customDuty: entity.custom_duties || "", // Map custom_duties field from API response
      financialAuthority: entity.financial_authority,
    }));
    setFinancialAuthority(
      entitys.length !== 0 ? entitys[0]?.financial_authority : "DGI"
    );
    setData(recalculateTableData([...data, ...newOrder]));
  };

  const handleAddressChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAddress(event.target.value);
  };

  const handleTableDataChange = (newData: Order[]) => {
    console.log("🚀 handleTableDataChange called with data:", newData);
    console.log(
      "🚀 Unit values in received data:",
      newData.map((d) => ({ id: d.id, unit: d.unit }))
    );
    console.log(
      "🚀 TarrifPosition values in received data:",
      newData.map((d) => ({ id: d.id, tarrifPosition: d.tarrifPosition }))
    );
    setData(recalculateTableData(newData));
  };

  const handleEditComplete = () => {
    // Previously cleared auto-edit mode, now just a placeholder for completion callback
    console.log("Edit complete");
  };

  // const totalEntity = data.length;
  // const totalAmount = data.reduce((sum, row) => sum + (row.total || 0), 0);
  // const totalTaxAmount = data.reduce(
  //   (sum, row) => sum + (row.taxAmount || 0),
  //   0
  // );
  // const totalAmountWithTax = data.reduce(
  //   (sum, row) => sum + (row.vatIncluded || 0),
  //   0
  // );

  // --- Create Request Mutation with correct types ---
  const createRequestMutation = useMutation({
    mutationFn: async (data: CreateRequestPayload) => {
      return await axios.post(
        "https://exotrack.makuta.cash/api/V1/project/create-request",
        data,
        {
          headers: {
            VAuthorization: `Bearer ${userData?.token}`,
          },
        }
      );
    },
    onSuccess: (response) => {
      console.log(response, "response in req");
      toast.success(t("request_updated_successfully"));

      // Extract request ID from response and show confirmation modal
      const requestId =
        response?.data?.data?.id || response?.data?.data?.request_id;
      if (requestId) {
        setCreatedRequestId(requestId);
        openModal();
      } else {
        // Fallback to requests listing if no request ID
        navigate("/requests");
      }
    },
    onError: (error: unknown) => {
      console.log(error, "error");

      const errorMessage =
        error && typeof error === "object" && "error" in error
          ? (error as { error: { message: string } }).error.message
          : "Failed to upload file.";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = () => {
    const errors: {
      address?: string;
      requestLetter?: string;
      fileUpload?: string;
    } = {};

    if (!selectedAddress) {
      errors.address = t("address_is_required");
    }
    if (!requestLetter || requestLetter.trim() === "") {
      errors.requestLetter = t("request_letter_is_required");
    }

    // Validate mandatory files based on financial authority
    let mandatoryDocNames: string[] = [];
    let requiredFileCount = 0;
    let errorMessage = "";

    if (financialAuthority === "location_acquisition") {
      // For Location Acquisition: only 1 document is required
      mandatoryDocNames = ["Facture émise par le fournisseur"];
      requiredFileCount = 1;
      errorMessage =
        t("location_acquisition_file_required") ||
        "Location Acquisition requires 1 document: Invoice issued by supplier";
    } else if (financialAuthority === "importation") {
      mandatoryDocNames = [
        "Letter de transport, note de fret, note d'assurance",
        "Déclaration pour I'importation Conditionnelle <<IC>>",
        "Facture émise par le fournisseur",
      ];
      requiredFileCount = 3;
      errorMessage =
        t("importation_files_required") ||
        "Importation requires 3 documents: Transport letter, IC Declaration, and Invoice issued by supplier";
    }

    if (financialAuthority && mandatoryDocNames.length > 0) {
      const mandatoryFilesUploaded = uploadedFiles.filter((file) => {
        const fileName = file.original_name || "";
        return mandatoryDocNames.some((docName) => {
          return (
            fileName.toLowerCase().includes(docName.toLowerCase()) ||
            docName.toLowerCase().includes(fileName.toLowerCase())
          );
        });
      });

      if (mandatoryFilesUploaded.length < requiredFileCount) {
        errors.fileUpload = errorMessage;
      }
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    // Debug: Log the current data state before API call
    console.log("🚀 Form data before API call:", data);
    console.log(
      "🚀 Reference fields in data:",
      data.map((d) => ({ id: d.id, reference: d.reference, label: d.label }))
    );
    console.log(
      "🚀 TarrifPosition fields in data:",
      data.map((d) => ({
        id: d.id,
        tarrifPosition: d.tarrifPosition,
        label: d.label,
      }))
    );

    const requestEntities = data.map((d) => {
      const entityData: any = {
        label: d.label,
        quantity: d.quantity.toString(),
        unit: d.unit || "",
        unit_price: d.unitPrice.toString(),
        total: d.total.toString(),
        tax_rate: d.taxRate.toString(),
        tax_amount: d.taxAmount.toString(),
        vat_included: d.vatIncluded.toString(),
        reference: d.reference || "", // Add reference field for API compatibility
        financial_authority: financialAuthority,
        custom_duties: d.customDuty || "", // Add custom_duties field
      };
      
      // Only include tariff position and IT/IC for importation tax category
      if (financialAuthority === "importation") {
        entityData.tarrif_position = d.tarrifPosition || "";
        entityData.it_ic = d.itIc || "";
      }
      
      // Add new fields for location_acquisition tax category
      if (financialAuthority === "location_acquisition") {
        entityData.issue_date = d.issueDate || ""; // Add issue_date field for local acquisition
        entityData.nature_of_operation = d.natureOfOperations || ""; // Add nature_of_operations field for local acquisition
      }
      
      return entityData;
    });

    console.log("🚀 Request entities before stringify:", requestEntities);

    const apiData: CreateRequestPayload = {
      project_id: projectId,
      address_id: selectedAddress,
      request_letter: requestLetter,
      document_ids:
        uploadedFiles.length > 0
          ? uploadedFiles.map((file) => file.id)?.join(",")
          : undefined,
      request_entity: JSON.stringify(requestEntities),
      ...(requestId && { request_id: requestId }),
    };

    console.log("🚀 Final API payload:", apiData);
    console.log("🚀 Stringified request_entity:", apiData.request_entity);
    createRequestMutation.mutate(apiData);
  };
  const fileUploadMutation = async ({
    file,
    onProgress,
  }: {
    file: File;
    onProgress: (percent: number) => void;
  }): Promise<{ id: string; url: string }> => {
    console.log("Inside mutation file:", file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "document");
    formData.append("object_type", "project");

    const response = await projectService.uploadFile(formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        VAuthorization: `Bearer ${userData?.token}`,
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
  const handleDeleteFile = async (fileId: string) => {
    const response = await removeFileMutation.mutateAsync(fileId);
    if (response.status) {
      const filteredFiles = uploadedFiles.filter(
        (file: UploadedFile) => file.id !== fileId
      );
      setUploadedFiles(filteredFiles);
      return { status: true };
    }
    return { status: false };
  };

  const requestMutaion = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await projectService.requestDetails({
        request_id: requestId,
      });
      setIsLoading(false);
      return res.data;
    },
    onSuccess: () => {
      setIsLoading(false);
    },
    onError: (error) => {
      setIsLoading(false);
      console.error(error);
    },
  });

  const getRequestData = async (requestId: string) => {
    const response = await requestMutaion.mutateAsync(requestId);
    if (response.status === 200) {
      const { project_id, request_letter, entities, address } = response.data;

      updateEntitys(entities);
      setProjectId(project_id);
      setRequestLetter(request_letter);
      const res = await fetchProjectAddressesAsync(project_id);
      if (res.status === 200) {
        setSelectedAddress(address.id);
      }
    }
  };

  useEffect(() => {
    if (newProjectId && newProjectId !== "") {
      fetchProjectAddresses(newProjectId);
      setProjectId(newProjectId);
    }
  }, [newProjectId]);

  useEffect(() => {
    if (requestId && requestId !== "") {
      getRequestData(requestId);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) {
      setTotals({
        totalEntity: 0,
        totalAmount: 0,
        totalTaxAmount: 0,
        totalAmountWithTax: 0,
      });
      return;
    }

    const totalEntity = data.length;
    const totalAmount = data.reduce((sum, row) => sum + (row.total || 0), 0);

    const totalTaxAmount = data.reduce(
      (sum, row) => sum + (row.taxAmount || 0),
      0
    );

    const totalAmountWithTax = data.reduce(
      (sum, row) => sum + (row.vatIncluded || 0),
      0
    );

    setTotals({
      totalEntity,
      totalAmount,
      totalTaxAmount,
      totalAmountWithTax,
    });
  }, [data]);
  const handleFilesSelect = (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  const financialAuthorityList: { name: string; value: string }[] = [
    { name: "Location Acquisition", value: "location_acquisition" },
    { name: "Importation", value: "importation" },
  ];
  const handleFinancialAuthority = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newTaxCategory = event.target.value;
    const previousTaxCategory = financialAuthority;
    console.log("🚀 Tax category changing from", previousTaxCategory, "to", newTaxCategory);
    
    try {
      // If there are existing entities and the tax category is actually changing
      if (data.length > 0 && previousTaxCategory !== newTaxCategory && previousTaxCategory !== "") {
        const confirmMessage = t("tax_category_change_warning") || 
          "Changing the tax category will clear all existing entities from the table. Do you want to continue?";
        const shouldClearEntities = window.confirm(confirmMessage);
        
        if (!shouldClearEntities) {
          // User cancelled, don't change the tax category
          console.log("🚀 Tax category change cancelled by user");
          return;
        }
        
        // Clear all entities
        console.log("🚀 Clearing all entities due to tax category change");
        setData([]);
      }
      
      setFinancialAuthority(newTaxCategory);
      console.log("🚀 Tax category change completed successfully");
    } catch (error) {
      console.error("🚨 Error changing tax category:", error);
    }
  };
  if (isLoading) return <Loader />;

  return (
    <AppLayout className="bg-white">
      <div className="px-4 md:px-0">
        <div
          className="flex items-center gap-2 cursor-pointer mb-2"
          onClick={() => navigate(getRoute("dashboard"))}
        >
          <ArrowLeftIcon width={16} height={16} className="text-primary-150" />
          <Typography
            size="base"
            weight="semibold"
            className="text-primary-150"
          >
            {t("back_to_dashboard")}
          </Typography>
        </div>
        <Typography
          size="xl_2"
          weight="extrabold"
          className="text-secondary-100 text-2xl md:text-3xl"
        >
          {requestId ? t("edit_request") : t("create_request")}
        </Typography>

        {/* Form Fields */}
        <div className="mt-4 md:mt-6">
          <Label htmlFor="address">{t("address")}</Label>
          <select
            id="address"
            name="address"
            value={selectedAddress}
            onChange={handleAddressChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-30 focus:border-transparent"
            disabled={isLoadingAddresses}
          >
            <option value="">
              {isLoadingAddresses ? t("loading") : t("select_address")}
            </option>
            {addressData?.data?.map((address: AddressData) => (
              <option key={address.id} value={address.id}>
                {`${address.city}, ${address.municipality}, ${address.country}`}
              </option>
            ))}
          </select>
          {validationErrors.address && (
            <Typography size="sm" className="text-red-500 mt-1">
              {validationErrors.address}
            </Typography>
          )}
        </div>

        <div className="mt-4 md:mt-6">
          <Label htmlFor="requestLetter">{t("request_letter")}</Label>
          <TextEditor
            placeholder="Write here..."
            maxLength={100}
            initialValue={requestLetter}
            onChange={(value) => {
              setRequestLetter(value);
            }}
          />
          {validationErrors.requestLetter && (
            <Typography size="sm" className="text-red-500 mt-1">
              {validationErrors.requestLetter}
            </Typography>
          )}
        </div>

        {/* Add Entity Button */}
        <div className="mb-3 md:mb-5 flex gap-2 justify-end">
          <div className="mt-4 w-full md:w-fit">
            <select
              id="financialAuthority"
              name="financialAuthority"
              value={financialAuthority}
              onChange={handleFinancialAuthority}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-30 focus:border-transparent"
            >
              <option value="">
                {isLoadingAddresses ? t("loading") : t("select_tax_category")}
              </option>
              {financialAuthorityList.map(
                (list: { name: string; value: string }) => (
                  <option key={list.value} value={list.value}>
                    {`${list.name}`}
                  </option>
                )
              )}
            </select>
          </div>
          <Button
            variant="primary"
            className="flex items-center w-full md:w-fit gap-1 py-2 mt-4 justify-center"
            onClick={handleAddEntity}
          >
            <PlusBlueIcon />
            <Typography>{t("add_entity")}</Typography>
          </Button>
        </div>

        {/* Entity Section */}
        <div>
          <Typography size="base" weight="normal" className="text-secondary-60">
            {t("entity")}
          </Typography>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mt-3 md:mt-5">
            <DashBoardCard
              icon={<FileVioletIcon width={36} height={36} />}
              count={totals.totalEntity}
              title={t("total_entity")}
              formatType="count"
            />
            <DashBoardCard
              icon={<UsdGreenIcon width={36} height={36} />}
              count={totals.totalAmount}
              title={t("total_amount")}
            />
            <DashBoardCard
              icon={<UsdVioletIcon width={36} height={36} />}
              count={totals.totalTaxAmount}
              title={t("total_tax_amount")}
            />
            <DashBoardCard
              icon={<UsdOrangeIcon width={36} height={36} />}
              count={totals.totalAmountWithTax}
              title={t("total_amount_with_tax")}
            />
          </div>

          {/* Table Section */}
          <div className="mt-3 md:mt-5 mb-2">
            <CreateRequestTable
              data={data}
              onDataChange={handleTableDataChange}
              onEditComplete={handleEditComplete}
              currentTaxCategory={financialAuthority}
            />
          </div>

          {/* Upload Section */}
          <div>
            <div className="mt-5 md:mt-7 mb-4 md:mb-6">
              <Label>{t("invoice_files")}</Label>
              <UploadFile
                maxSize={2}
                acceptedFormats={[".pdf"]}
                files={uploadedFiles}
                onFilesSelect={handleFilesSelect}
                onUploadFile={handleUploadFile}
                onDeleteFile={handleDeleteFile}
                context="create-request"
                showAdditionalDocs={false}
                taxCategory={financialAuthority}
              />
              {validationErrors.fileUpload && (
                <Typography size="sm" className="text-red-500 mt-1">
                  {validationErrors.fileUpload}
                </Typography>
              )}
            </div>
          </div>
        </div>
        <div className="mb-3 md:mb-5 flex justify-end">
          <Button
            type="submit"
            onClick={handleSubmit}
            disable={createRequestMutation.isPending}
            loading={createRequestMutation.isPending}
            variant="primary"
            className="flex items-center w-full md:w-fit gap-1 py-2 mt-4 justify-center"
          >
            {requestId ? t("update_request") : t("submit_request")}
          </Button>
        </div>
      </div>

      {/* Request Success Confirmation Modal */}
      <CreateRequestConfirmationModal
        isOpen={isOpen}
        onClose={closeModal}
        requestId={createdRequestId}
      />
    </AppLayout>
  );
};

export default AddRequest;
