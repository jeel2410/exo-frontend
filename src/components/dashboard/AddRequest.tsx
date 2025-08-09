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
  const [financialAuthority, setFinancialAuthority] = useState<string>("DGI");
  const [autoEditId, setAutoEditId] = useState<number | null>(null);
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
    const newOrder: Order[] = entitys.map((entity: Entity, index: number) => ({
      id: new Date().getTime() + index + 1,
      label: entity.label,
      quantity: entity.quantity,
      unitPrice: entity.unit_price,
      total: entity.total,
      taxRate: entity.tax_rate,
      taxAmount: entity.tax_amount,
      vatIncluded: entity.vat_included,
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
      toast.success(t("request_updated_successfully"));
      
      // Extract request ID from response and redirect to request details
      const requestId = response?.data?.data?.id || response?.data?.data?.request_id;
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
    const apiData: CreateRequestPayload = {
      project_id: projectId,
      address_id: selectedAddress,
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
          financial_authority: financialAuthority,
        }))
      ),
      ...(requestId && { request_id: requestId }),
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
    { name: "DGI: Invoice Files", value: "DGI" },
    { name: "DGDA: DGDA Files", value: "DGDA" },
    { name: "DGRAD: DGRAD Files", value: "DGRAD" },
  ];
  const handleFinancialAuthority = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFinancialAuthority(event.target.value);
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
              {/* <option value="">
                  {isLoadingAddresses ? t("loading") : t("select_address")}
                </option> */}
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
              icon={<FileVioletIcon width={44} height={44} />}
              count={totals.totalEntity}
              title={t("total_entity")}
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
              />
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
    </AppLayout>
  );
};

export default AddRequest;
