import { useEffect, useState, useCallback } from "react";
import {
  FileVioletIcon,
  WhitePlusIcon,
  UsdGreenIcon,
  UsdOrangeIcon,
  UsdVioletIcon,
} from "../../../icons";
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
    name: "Location Acquisition",
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
  const [autoEditId, setAutoEditId] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    address?: string;
    requestLetter?: string;
    contractAmount?: string;
    fileUpload?: string;
  }>({});
  const [contractData, setContractData] = useState<{
    amount?: string | number;
    currency?: string;
  }>({});
  const [requestSubStatus, setRequestSubStatus] = useState<string>("");

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

  const handleAddEntity = () => {
    const newId = new Date().getTime();
    const newOrder: Order = {
      id: newId,
      // id: data.length + 1,
      label: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
      taxRate: 0,
      taxAmount: 0,
      vatIncluded: 0,
      customDuty: "",
    };
    setData(recalculateTableData([...data, newOrder]));
    setAutoEditId(newId); // Set the newly added entity to auto-edit mode
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
        customDuty: entity.custom_duties || "",
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

  const handleEditComplete = () => {
    setAutoEditId(null); // Clear auto-edit mode when editing is complete
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
      toast.success(t("request_updated_successfully"));

      // Extract request ID from response and redirect to request details
      const requestId =
        response?.data?.data?.id || response?.data?.data?.request_id;
      if (requestId) {
        navigate(`/request-details/${requestId}`);
      } else {
        // Fallback to contract project list if no request ID
        navigate("/contract-project-list");
      }
    },
    onError: (error: unknown) => {
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
      mandatoryDocNames = ["Facture e`mise par le fournisseur"];
      requiredFileCount = 1;
      errorMessage =
        t("location_acquisition_file_required") ||
        "Location Acquisition requires 1 document: Facture émise par le fournisseur";
    } else if (financialAuthority === "importation") {
      mandatoryDocNames = [
        "Letter de transport, note de fret, note d'assurance",
        "De`claration pour I'importation Conditionnelle <<IC>>",
        "Facture e`mise par le fournisseur",
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

    const apiData: CreateRequestPayload = {
      project_id: projectId,
      address_id: selectedAddresses.join(","), // Convert array to comma-separated string
      request_letter: requestLetter,
      document_ids:
        uploadedFiles.length > 0
          ? uploadedFiles.map((file) => file.id)?.join(",")
          : undefined,
      request_entity: JSON.stringify(
        data.map((d) => ({
          label: d.label,
          quantity: d.quantity.toString(),
          unit_price: d.unitPrice.toString(),
          total: d.total.toString(),
          tax_rate: d.taxRate.toString(),
          tax_amount: d.taxAmount.toString(),
          vat_included: d.vatIncluded.toString(),
          custom_duties: d.customDuty || "",
        }))
      ),
      tax_category: financialAuthority, // separate field outside entity JSON
      ...(requestId && { request_id: requestId }),
      contract_id: contractId || "",
    };
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
  const handleFinancialAuthority = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newFinancialAuthority = event.target.value;
    setFinancialAuthority(newFinancialAuthority);

    // Update all existing entities with the new financial authority
    if (data.length > 0) {
      const updatedData = data.map((item) => ({
        ...item,
        financialAuthority: newFinancialAuthority,
      }));
      setData(updatedData);
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

        {/* Form Fields */}
        <div className="mt-4 md:mt-6">
          <Label htmlFor="address">{t("address")}</Label>
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
                      Select All ({addressData.data.length})
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
              {selectedAddresses.length} address
              {selectedAddresses.length > 1 ? "es" : ""} selected
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
          <Button
            variant="primary"
            className="flex items-center w-full md:w-fit gap-1 py-2 mt-4 justify-center"
            onClick={handleAddEntity}
          >
            <WhitePlusIcon />
            <Typography>{t("add_item")}</Typography>
          </Button>
        </div>

        {/* Entity Section */}
        <div>
          <Typography size="base" weight="normal" className="text-secondary-60">
            {t("items")}
          </Typography>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mt-3 md:mt-5">
            <DashBoardCard
              icon={<FileVioletIcon width={44} height={44} />}
              count={totals.totalEntity}
              title={t("total_items")}
            />
            <DashBoardCard
              icon={<UsdGreenIcon width={44} height={44} />}
              count={totals.totalAmount}
              title={t("total_amount")}
            />
            <DashBoardCard
              icon={<UsdVioletIcon width={44} height={44} />}
              count={totals.totalTaxAmount}
              title={t("total_tax_amount")}
            />
            <DashBoardCard
              icon={<UsdOrangeIcon width={44} height={44} />}
              count={totals.totalAmountWithTax}
              title={t("total_amount_with_tax")}
            />
          </div>

          {/* Table Section */}
          <div className="mt-3 md:mt-5 mb-2">
            <CreateRequestTable
              data={data}
              onDataChange={handleTableDataChange}
              autoEditId={autoEditId}
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
                maxSize={10}
                acceptedFormats={[".pdf", ".doc", ".txt", ".ppt"]}
                files={uploadedFiles}
                onFilesSelect={handleFilesSelect}
                onUploadFile={handleUploadFile}
                onDeleteFile={handleDeleteFile}
                onRenameFile={handleRenameFile}
                showAdditionalDocs={
                  requestId
                    ? requestSubStatus === "hold" ||
                      requestSubStatus === "Request Info"
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
            disable={createRequestMutation.isPending}
            loading={createRequestMutation.isPending}
            variant="primary"
            className="flex items-center w-full md:w-fit gap-1 py-2 mt-4 justify-center"
          >
            {requestId ? t("update_request") : t("submit_request")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddRequest;
