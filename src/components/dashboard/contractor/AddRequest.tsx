import { useEffect, useState, useCallback } from "react";
import { FileVioletIcon } from "../../../icons";
import CurrencyBadge from "../../common/CurrencyBadge";
import Label from "../../../lib/components/atoms/Label";
import Typography from "../../../lib/components/atoms/Typography";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import projectService from "../../../services/project.service";
import contractService from "../../../services/contract.service";
import TextEditor from "../../../lib/components/atoms/TextEditor";
import Button from "../../../lib/components/atoms/Button";
import CreateRequestTable, { Order } from "../../table/CreateRequestTable.tsx";
import DashBoardCard from "../../../lib/components/molecules/DashBoardCard.tsx";
import UploadFile, { UploadedFile } from "../../common/UploadFile.tsx";
import axios from "axios";
import localStorageService from "../../../services/local.service.ts";
import { useLocation, useNavigate, useParams } from "react-router";
import { useRoleRoute } from "../../../hooks/useRoleRoute.ts";
import { toast } from "react-toastify";
import Loader from "../../common/Loader.tsx";
import Breadcrumbs from "../../common/Breadcrumbs.tsx";
import CreateRequestConfirmationModal from "../../modal/CreateRequestConfirmationModal.tsx";
import { useModal } from "../../../hooks/useModal.ts";

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
  label: string;
  quantity: number;
  status: string;
  tax_amount: number;
  tax_rate: number;
  total: number;
  unit_price: number;
  vat_included: number;
  custom_duties?: string;
  reference?: string; // Add reference field for API compatibility
  tarrif_position?: string; // Add tarrif_position field for API compatibility
  issue_date?: string; // Issue date field for local acquisition
  nature_of_operation?: string; // Nature of operation field for local acquisition
  it_ic?: string; // IT/IC code field for importation
}

interface CreateRequestPayload {
  project_id: string;
  contract_id: string;
  address_id: string;
  request_letter: string;
  document_ids?: string;
  request_entity: string; // must be stringified JSON
  tax_category: string; // separate field outside entity JSON
  request_id?: string;
}

const financialAuthorityList: {
  name: string;
  value: string;
  shortName: string;
  bgColor: string;
  textColor: string;
}[] = [
  {
    name: "Acquisition locale",
    value: "location_acquisition",
    shortName: "D",
    bgColor: "bg-green-500",
    textColor: "text-white",
  },
  {
    name: "Importation",
    value: "importation",
    shortName: "R",
    bgColor: "bg-teal-500",
    textColor: "text-white",
  },
];

const AddRequest = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { requestId, contractId, projectId: newProjectId } = useParams();

  const [data, setData] = useState<Order[]>([]);
  const [userData, setUserData] = useState<{ token: string } | undefined>();
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [originalFiles, setOriginalFiles] = useState<UploadedFile[]>([]); // Track original files from API
  // const [mandatoryFiles, setMandatoryFiles] = useState<UploadedFile[]>([]);
  // const [additionalFiles, setAdditionalFiles] = useState<UploadedFile[]>([]);
  const [requestLetter, setRequestLetter] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [projectId, setProjectId] = useState<string>("");
  const [totals, setTotals] = useState({
    totalEntity: 0,
    totalAmount: 0,
    totalTaxAmount: 0,
    totalAmountWithTax: 0,
  });
  const { getRoute } = useRoleRoute();
  const [financialAuthority, setFinancialAuthority] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<{
    address?: string;
    requestLetter?: string;
    contractAmount?: string;
    fileUpload?: string;
  }>({});
  const [contractData, setContractData] = useState<{
    amount?: string | number;
    currency?: string;
    name?: string;
    reference?: string;
  }>({});
  const [requestSubStatus, setRequestSubStatus] = useState<string>("");
  const [createdRequestId, setCreatedRequestId] = useState<string>("");
  const { isOpen, openModal, closeModal } = useModal();

  const pathName: string = pathname.split("/")[1];

  const crumbs = [
    { label: "dashboard", path: getRoute("dashboard") },
    {
      label: "contract_details",
      path: `${getRoute("contractDetails")}/${contractId}`,
    },
    { label: pathName === "add-request" ? "create_request" : "edit_request" },
  ];

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
    return tableData.map((row) => {
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
  };

  const updateEntitys = (entitys: Entity[]) => {
    const newOrder: Order[] = entitys.map((entity: Entity, index: number) => {
      console.log("🔍 Processing entity:", {
        label: entity.label,
        custom_duties: entity.custom_duties,
        mapped_customDuty: entity.custom_duties || "",
      });
      return {
        id: new Date().getTime() + index + 1,
        label: entity.label,
        quantity: entity.quantity,
        unitPrice: entity.unit_price,
        total: entity.total,
        taxRate: entity.tax_rate,
        taxAmount: entity.tax_amount,
        vatIncluded: entity.vat_included,
        reference: entity.reference || "", // Map reference field from API response
        tarrifPosition: entity.tarrif_position || "", // Map tarrif_position field from API response
        customDuty: entity.custom_duties || "",
        custom_duties: entity.custom_duties || "", // Add this for backward compatibility
        issueDate: entity.issue_date || "", // Map issue_date from API response
        natureOfOperations: entity.nature_of_operation || "", // Map nature_of_operation from API response
        itIc: entity.it_ic || "", // Map it_ic from API response for importation
      };
    });
    // Note: For editing existing requests, tax_category will be fetched separately
    // and the financialAuthority state will be updated accordingly
    setData(recalculateTableData([...data, ...newOrder]));
  };

  // Multiple address selection handlers
  const toggleAddressSelection = (addressId: string) => {
    setSelectedAddresses((prev) => {
      if (prev.includes(addressId)) {
        return prev.filter((id) => id !== addressId);
      } else {
        return [...prev, addressId];
      }
    });
  };

  const handleSelectAllAddresses = () => {
    if (selectedAddresses.length === addressData?.data?.length) {
      setSelectedAddresses([]);
    } else {
      setSelectedAddresses(
        addressData?.data?.map((addr: AddressData) => addr.id) || []
      );
    }
  };

  const handleTableDataChange = (newData: Order[]) => {
    setData(recalculateTableData(newData));
  };

  // Function to check if all required fields are filled
  const isFormValid = () => {
    // Check if addresses are selected
    if (selectedAddresses.length === 0) return false;
    
    // Check if request letter is filled
    if (!requestLetter || requestLetter.trim() === "") return false;
    
    // Check if tax category is selected
    if (!financialAuthority) return false;
    
    // Check if at least one entity is added
    if (data.length === 0) return false;
    
    // Check if all entities have required fields filled
    const hasInvalidEntities = data.some(entity => {
      if (!entity.label || !entity.quantity || !entity.unitPrice) return true;
      
      // Additional validation based on tax category
      if (financialAuthority === "location_acquisition") {
        return !entity.customDuty || !entity.natureOfOperations;
      }
      
      if (financialAuthority === "importation") {
        return !entity.customDuty || !entity.tarrifPosition;
      }
      
      return false;
    });
    
    if (hasInvalidEntities) return false;
    
    // Check mandatory file requirements
    if (financialAuthority === "location_acquisition") {
      const mandatoryDocNames = ["Facture émise par le fournisseur"];
      const mandatoryFilesUploaded = uploadedFiles.filter((file) => {
        const fileName = file.original_name || "";
        return mandatoryDocNames.some((docName) => 
          fileName.toLowerCase().includes(docName.toLowerCase()) ||
          docName.toLowerCase().includes(fileName.toLowerCase())
        );
      });
      if (mandatoryFilesUploaded.length < 1) return false;
    } else if (financialAuthority === "importation") {
      const mandatoryDocNames = [
        "Letter de transport, note de fret, note d'assurance",
        "Déclaration pour I'importation Conditionnelle <<IC>>",
        "Facture émise par le fournisseur",
      ];
      const mandatoryFilesUploaded = uploadedFiles.filter((file) => {
        const fileName = file.original_name || "";
        return mandatoryDocNames.some((docName) => 
          fileName.toLowerCase().includes(docName.toLowerCase()) ||
          docName.toLowerCase().includes(fileName.toLowerCase())
        );
      });
      if (mandatoryFilesUploaded.length < 3) return false;
    }
    
    return true;
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

  // --- Contract Details Mutation ---
  const contractMutation = useMutation({
    mutationFn: async (contractId: string) => {
      const formData = new FormData();
      formData.append("contract_id", contractId);
      const response = await contractService.getContractDetails(formData);
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.data) {
        setContractData({
          amount: data.data.amount,
          currency: data.data.currency,
          name: data.data.name,
          reference: data.data.reference,
        });
      }
    },
    onError: (error) => {
      console.error("Failed to fetch contract details:", error);
    },
  });

  // --- Create Request Mutation with correct types ---
  const createRequestMutation = useMutation({
    mutationFn: async (data: CreateRequestPayload) => {
      return await axios.post(
        "https://exotrack.makuta.cash/api/V1/request/create",
        data,
        {
          headers: {
            VAuthorization: `Bearer ${userData?.token}`,
          },
        }
      );
    },
    onSuccess: (response) => {
      console.log(response, "response");

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
      const errorMessage =
        error && typeof error === "object" && "error" in error
          ? (error as { error: { message: string } }).error.message
          : t("contract_amount_exceeded");
      toast.error(errorMessage);
    },
  });

  const handleSubmit = () => {
    const errors: {
      address?: string;
      requestLetter?: string;
      contractAmount?: string;
      fileUpload?: string;
    } = {};
    if (selectedAddresses.length === 0) {
      errors.address = t("address_is_required");
    }
    if (!requestLetter || requestLetter.trim() === "") {
      errors.requestLetter = t("request_letter_is_required");
    }

    let mandatoryDocNames: string[] = [];
    let requiredFileCount = 0;
    let errorMessage = "";

    if (financialAuthority === "location_acquisition") {
      // For Location Acquisition: only 1 document is required
      mandatoryDocNames = ["Facture émise par le fournisseur"];
      requiredFileCount = 1;
      errorMessage =
        t("location_acquisition_file_required") ||
        "Location Acquisition requires 1 document: Facture émise par le fournisseur";
    } else if (financialAuthority === "importation") {
      mandatoryDocNames = [
        "Letter de transport, note de fret, note d'assurance",
        "Déclaration pour I'importation Conditionnelle <<IC>>",
        "Facture émise par le fournisseur",
      ];
      requiredFileCount = 3;
      errorMessage =
        t("importation_files_required") ||
        "Importation requires 3 documents: Letter de transport, Déclaration IC, and Facture émise";
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

    if (
      contractData.amount !== undefined &&
      totals.totalAmount > Number(contractData.amount)
    ) {
      errors.contractAmount = t("contract_amount_exceeded");
    }
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    // Helper function to check if files have changed
    const getDocumentIdsForSubmission = () => {
      // For new requests (no requestId), always pass all document IDs
      if (!requestId) {
        return uploadedFiles.length > 0
          ? uploadedFiles.map((file) => file.id)?.join(",")
          : undefined;
      }

      // For edit requests, compare current files with original files
      const originalFileIds = new Set(originalFiles.map((f) => f.id));
      const currentFileIds = new Set(uploadedFiles.map((f) => f.id));

      // Check if files have changed
      const filesChanged =
        originalFiles.length !== uploadedFiles.length ||
        !Array.from(currentFileIds).every((id) => originalFileIds.has(id)) ||
        !Array.from(originalFileIds).every((id) => currentFileIds.has(id));

      // Only pass document_ids if files have changed
      if (filesChanged && uploadedFiles.length > 0) {
        return uploadedFiles.map((file) => file.id)?.join(",");
      }

      // Return undefined if no changes (this prevents the field from being sent to API)
      return undefined;
    };

    const documentIds = getDocumentIdsForSubmission();

    // Debug: Log the current data state before API call
    console.log("🚀 Form data before API call:", data);
    console.log(
      "🚀 Reference and TarrifPosition fields in data:",
      data.map((d) => ({
        id: d.id,
        reference: d.reference,
        tarrifPosition: d.tarrifPosition,
        label: d.label,
      }))
    );
    console.log(
      "🚀 Individual entities for request_entity:",
      data.map((d) => {
        const entityData: any = {
          label: d.label,
          quantity: d.quantity.toString(),
          unit_price: d.unitPrice.toString(),
          unit: d?.unit?.toString(),
          total: d.total.toString(),
          tax_rate: d.taxRate.toString(),
          tax_amount: d.taxAmount.toString(),
          vat_included: d.vatIncluded.toString(),
          reference: d.reference || "",
          custom_duties: d.customDuty || d.custom_duty || "",
        };

        // Add specific fields for location acquisition
        if (financialAuthority === "location_acquisition") {
          entityData.issue_date = d.issueDate || "";
          entityData.nature_of_operation = d.natureOfOperations || "";
        }

        // Only include tariff position and IT/IC for importation tax category
        if (financialAuthority === "importation") {
          entityData.tarrif_position = d.tarrifPosition || "";
          entityData.it_ic = d.itIc || "";
        }

        return entityData;
      })
    );

    const apiData: CreateRequestPayload = {
      project_id: projectId,
      address_id: selectedAddresses.join(","), // Convert array to comma-separated string
      request_letter: requestLetter,
      ...(documentIds !== undefined && { document_ids: documentIds }),
      request_entity: JSON.stringify(
        data.map((d) => {
          const entityData: any = {
            label: d.label,
            quantity: d.quantity.toString(),
            unit_price: d.unitPrice.toString(),
            unit: d?.unit?.toString(),
            total: d.total.toString(),
            tax_rate: d.taxRate.toString(),
            tax_amount: d.taxAmount.toString(),
            vat_included: d.vatIncluded.toString(),
            reference: d.reference || "", // Add reference field for API compatibility
            custom_duties: d.customDuty || d.custom_duty || "",
          };

          // Add specific fields for location acquisition
          if (financialAuthority === "location_acquisition") {
            entityData.issue_date = d.issueDate || "";
            entityData.nature_of_operation = d.natureOfOperations || "";
          }

          // Only include tariff position and IT/IC for importation tax category
          if (financialAuthority === "importation") {
            entityData.tarrif_position = d.tarrifPosition || "";
            entityData.it_ic = d.itIc || "";
          }

          return entityData;
        })
      ),
      tax_category: financialAuthority, // separate field outside entity JSON
      ...(requestId && { request_id: requestId }),
      contract_id: contractId || "",
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

  const handleRenameFile = async (fileId: string, newName: string) => {
    try {
      const response = await projectService.changeDocumentName(newName, fileId);
      console.log("File renamed successfully:", response);
      return { status: true, newName: response.data?.new_name || newName };
    } catch (error) {
      console.error("Failed to rename file:", error);
      return { status: false };
    }
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
      const {
        project_id,
        request_letter,
        entities,
        address,
        addresses,
        address_ids,
        files,
        tax_category,
        sub_status,
      } = response.data;

      updateEntitys(entities);
      setProjectId(project_id);
      setRequestLetter(request_letter);
      setFinancialAuthority(tax_category);
      setRequestSubStatus(sub_status || "");

      // Handle existing documents
      if (files && files.length > 0) {
        const existingFiles = files.map((doc: any) => ({
          id: doc.id,
          url: doc.url,
          original_name: doc.original_name || doc.name,
          size: doc.size,
          file: undefined,
        }));
        setUploadedFiles(existingFiles);
        setOriginalFiles(existingFiles); // Store original files for comparison
      } else {
        setOriginalFiles([]); // No original files
      }

      const res = await fetchProjectAddressesAsync(project_id);
      if (res.status === 200) {
        // Handle multiple address selection for edit mode
        let selectedAddressIds: string[] = [];

        if (addresses && Array.isArray(addresses)) {
          // If addresses array exists, extract IDs from it
          selectedAddressIds = addresses.map((addr: any) => addr.id);
        } else if (address_ids && typeof address_ids === "string") {
          // If address_ids exists as comma-separated string, split it
          selectedAddressIds = address_ids.split(",").filter((id) => id.trim());
        } else if (address && address.id) {
          // Fallback to single address for backward compatibility
          selectedAddressIds = [address.id];
        }

        setSelectedAddresses(selectedAddressIds);
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

  // Fetch contract details when contractId is available
  useEffect(() => {
    if (contractId && contractId !== "") {
      contractMutation.mutate(contractId);
    }
  }, [contractId]);

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
  const handleFilesSelect = useCallback((newFiles: UploadedFile[]) => {
    setUploadedFiles((currentFiles) => {
      if (newFiles.length !== currentFiles.length) {
        return newFiles;
      }

      const currentFileIds = new Set(currentFiles.map((f) => f.id));
      const newFileIds = new Set(newFiles.map((f) => f.id));

      if (currentFileIds.size !== newFileIds.size) {
        return newFiles;
      }

      for (const id of currentFileIds) {
        if (!newFileIds.has(id)) {
          return newFiles;
        }
      }

      return currentFiles;
    });
  }, []);

  // const handleCardClick = (cardId: string) => {
  //   setSelectedCard(selectedCard === cardId ? null : cardId);
  // };

  const handleFinancialAuthority = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newTaxCategory = event.target.value;
    const previousTaxCategory = financialAuthority;
    console.log(
      "🚀 Tax category changing from",
      previousTaxCategory,
      "to",
      newTaxCategory
    );

    try {
      // If there are existing entities and the tax category is actually changing
      if (
        data.length > 0 &&
        previousTaxCategory !== newTaxCategory &&
        previousTaxCategory !== ""
      ) {
        const confirmMessage =
          t("tax_category_change_warning") ||
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
    <div>
      <div className="px-4 md:px-0">
        <Breadcrumbs crumbs={crumbs} />
        <Typography
          size="xl_2"
          weight="extrabold"
          className="text-secondary-100 text-2xl md:text-3xl"
        >
          {requestId ? t("edit_request") : t("create_request")}
        </Typography>

        {/* Contract Info Section */}
        {contractId && contractData.name && (
          <div className="mt-6 mb-2">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-150 rounded-lg flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-white"
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
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Typography
                        size="xs"
                        weight="semibold"
                        className="text-primary-150 uppercase tracking-wide"
                      >
                        {t("selected_contract")}
                      </Typography>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                    <Typography
                      size="base"
                      weight="semibold"
                      className="text-gray-900 truncate"
                    >
                      {contractData.name}
                    </Typography>
                    <div className="flex items-center space-x-3 mt-1">
                      {contractData.amount && contractData.currency && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <svg
                            width="12"
                            height="12"
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
                          <span className="font-medium">
                            {contractData.amount} {contractData.currency}
                          </span>
                        </div>
                      )}
                      {contractData.reference && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <svg
                            width="12"
                            height="12"
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
                          <span className="truncate max-w-28 font-medium">
                            {contractData.reference}
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
                      navigate(`${getRoute("contractDetails")}/${contractId}`)
                    }
                    className="px-3 py-2 text-primary-150 border border-primary-150 rounded-md hover:bg-primary-150 hover:text-white transition-all duration-200 flex items-center space-x-2 text-sm font-medium group"
                  >
                    <svg
                      width="14"
                      height="14"
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
                    <span>{t("view_contract")}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="mt-4 md:mt-6">
          <Label htmlFor="address">{t("location")}</Label>
          <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
            {isLoadingAddresses ? (
              <Typography className="text-gray-500">{t("loading")}</Typography>
            ) : addressData?.data?.length > 0 ? (
              <>
                <div className="mb-3 pb-2 border-b border-gray-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        selectedAddresses.length === addressData.data.length
                      }
                      onChange={handleSelectAllAddresses}
                      className="rounded focus:ring-2 focus:ring-primary-30"
                    />
                    <Typography
                      size="sm"
                      weight="normal"
                      className="text-primary-70"
                    >
                      {t("select_all")} ({addressData.data.length})
                    </Typography>
                  </label>
                </div>
                {addressData.data.map((address: AddressData) => (
                  <label
                    key={address.id}
                    className="flex items-start gap-2 cursor-pointer mb-2 last:mb-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAddresses.includes(address.id)}
                      onChange={() => toggleAddressSelection(address.id)}
                      className="mt-1 rounded focus:ring-2 focus:ring-primary-30"
                    />
                    <div>
                      <Typography size="sm" weight="normal">
                        {`${address.city}, ${address.municipality}, ${address.country}`}
                      </Typography>
                      <Typography size="xs" className="text-gray-500">
                        {address.providence}
                      </Typography>
                    </div>
                  </label>
                ))}
              </>
            ) : (
              <Typography className="text-gray-500">
                {t("no_addresses_available")}
              </Typography>
            )}
          </div>
          {selectedAddresses.length > 0 && (
            <Typography size="sm" className="text-primary-70 mt-2">
              {selectedAddresses.length} {t("location")}
              {selectedAddresses.length > 1 ? "s" : ""} {t("selected")}
            </Typography>
          )}
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
            maxLength={2500}
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

        <div>
          <Label htmlFor="address">{t("tax_category")}</Label>
          <select
            id="financialAuthority"
            name="financialAuthority"
            value={financialAuthority}
            onChange={handleFinancialAuthority}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-30 focus:border-transparent"
            disabled={isLoadingAddresses}
          >
            <option value="">
              {isLoadingAddresses
                ? t("loading")
                : t("select_tax_category") || "Select Tax Category"}
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

        {/* Add Entity Button */}
        <div className="mb-3 md:mb-5 flex gap-2 justify-end">
          {/* <Button
            variant="primary"
            className="flex items-center w-full md:w-fit gap-1 py-2 mt-4 justify-center"
            onClick={handleAddEntity}
          >
            <WhitePlusIcon />
            <Typography>{t("add_entity")}</Typography>
          </Button> */}
        </div>

        {/* Entity Section */}
        <div>
          <Typography size="base" weight="normal" className="text-secondary-60">
            {t("items")}
          </Typography>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mt-3 md:mt-5">
            <DashBoardCard
              icon={<FileVioletIcon width={36} height={36} />}
              count={totals.totalEntity}
              title={t("total_items")}
              formatType="count"
              isSelected={false}
              // onClick={() => handleCardClick("total_items")}
            />
            <DashBoardCard
              icon={
                <CurrencyBadge
                  currency={(contractData?.currency as "USD" | "CDF") || "USD"}
                  variant="green"
                  width={36}
                  height={36}
                />
              }
              count={totals.totalAmount}
              title={t("total_amount")}
              isSelected={false}
              // onClick={() => handleCardClick("total_amount")}
            />
            <DashBoardCard
              icon={
                <CurrencyBadge
                  currency={(contractData?.currency as "USD" | "CDF") || "USD"}
                  variant="violet"
                  width={36}
                  height={36}
                />
              }
              count={totals.totalTaxAmount}
              title={t("total_covered_amount")}
              isSelected={true}
              // onClick={() => handleCardClick("total_covered_amount")}
            />
            <DashBoardCard
              icon={
                <CurrencyBadge
                  currency={(contractData?.currency as "USD" | "CDF") || "USD"}
                  variant="orange"
                  width={36}
                  height={36}
                />
              }
              count={totals.totalAmountWithTax}
              title={t("total_amount_with_tax")}
              isSelected={false}
              // onClick={() => handleCardClick("total_amount_with_tax")}
            />
          </div>

          {/* Table Section */}
          <div className="mt-3 md:mt-5 mb-2">
            <CreateRequestTable
              data={data.map((item) => ({
                ...item,
                currency: contractData?.currency || "USD",
              }))}
              onDataChange={handleTableDataChange}
              onEditComplete={handleEditComplete}
              currentTaxCategory={financialAuthority}
            />
            {validationErrors.contractAmount && (
              <Typography size="sm" className="text-red-500 mt-2">
                {validationErrors.contractAmount}
              </Typography>
            )}
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
                onRenameFile={handleRenameFile}
                showAdditionalDocs={
                  requestId
                    ? ["hold", "request_info"].includes(
                        (requestSubStatus || "").toLowerCase()
                      )
                    : false
                }
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
            disable={createRequestMutation.isPending || !isFormValid()}
            loading={createRequestMutation.isPending}
            variant="primary"
            className={`flex items-center w-full md:w-fit gap-1 py-2 mt-4 justify-center ${
              !isFormValid() && !createRequestMutation.isPending 
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
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
    </div>
  );
};

export default AddRequest;
