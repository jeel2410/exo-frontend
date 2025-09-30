import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHeader as TableHeaderType,
} from "./CreateRequestTable.tsx.tsx";
import { CrossRedIcon, RightGreenIcon, USFlag, CDFFlag } from "../../icons";
import Typography from "../../lib/components/atoms/Typography.tsx";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import projectService from "../../services/project.service.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import { useTranslation } from "react-i18next";
import StatusBadge, { StatusCode } from "../common/StatusBadge.tsx";
import { formatAmount } from "../../utils/numberFormat";

// Map API status values to StatusBadge codes
const mapStatusToCode = (status: string): StatusCode => {
  const normalizedStatus = status.toLowerCase().replace(/[_\s]/g, "");

  switch (normalizedStatus) {
    case "inprogress":
    case "progress":
    case "pending":
      return "progress";
    case "draft":
      return "draft";
    case "expired":
      return "expired";
    case "scheduled":
    case "schedule":
      return "schedule";
    case "published":
    case "publish":
      return "publish";
    case "rejected":
    case "reject":
      return "rejected";
    case "approved":
    case "completed":
    case "success":
      return "approved";
    case "requestinfo":
    case "request_info":
      return "request_info";
    default:
      return "progress"; // default fallback
  }
};

// Map API stage values to translation keys
const mapStageToTranslationKey = (stage: string): string => {
  const normalizedStage = stage.toLowerCase().replace(/[_\s]/g, "");

  switch (normalizedStage) {
    case "secretariatreview":
    case "secretariat":
      return "secretariat_review";
    case "coordinatorreview":
    case "coordinator":
      return "coordinator_review";
    case "financialreview":
    case "financial":
      return "financial_review";
    case "calculationnotestransmission":
      return "calculation_notes_transmission";
    case "fopreparation":
      return "fo_preparation";
    case "transmissiontosecretariat":
      return "transmission_to_secretariat";
    case "coordinatorfinalvalidation":
      return "coordinator_final_validation";
    case "applicationsubmission":
      return "application_submission";
    case "ministerialreview":
      return "ministerial_review";
    case "titlegeneration":
      return "title_generation";
    default:
      return stage; // return original if no mapping found
  }
};

export interface Data {
  id: number;
  requestNo: string;
  amount: string;
  total_amount?: string;
  currency?: string;
  createdDate: string;
  status: string;
  sub_status?: string;
  request_id: string;
  contract_id: string;
  total_tax_amount?: string;
}

const RequestTable = ({
  data,
  onDataChange,
}: {
  data: Data[] | [];
  onDataChange?: (newData: Data[]) => void;
}) => {
  const [tableData, setTableData] = useState<Data[]>(data);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Data>>({});
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const handleMenuToggle = (orderId: number, event?: React.MouseEvent) => {
    if (openMenuId === orderId) {
      setOpenMenuId(null);
      return;
    }

    if (event) {
      // Calculate dropdown position
      const buttonRect = (
        event.currentTarget as HTMLElement
      ).getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const dropdownWidth = 128; // w-32 = 128px
      const dropdownHeight = 150; // Approximate height
      const margin = 16;

      // Calculate horizontal position
      const wouldOverflowRight =
        buttonRect.right + dropdownWidth > windowWidth - margin;
      const wouldOverflowLeft = buttonRect.left - dropdownWidth < margin;

      let left =
        wouldOverflowRight && !wouldOverflowLeft
          ? buttonRect.left - dropdownWidth + buttonRect.width
          : buttonRect.left;

      // Calculate vertical position
      const wouldOverflowBottom =
        buttonRect.bottom + dropdownHeight > windowHeight - margin;
      const top =
        wouldOverflowBottom && buttonRect.top > dropdownHeight
          ? buttonRect.top - dropdownHeight
          : buttonRect.bottom;

      left = Math.max(
        margin,
        Math.min(left, windowWidth - dropdownWidth - margin)
      );

      setDropdownStyle({
        position: "fixed",
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 9999,
      });
    }

    setOpenMenuId(orderId);
  };

  // const handleEdit = (order: Data) => {
  //   setEditingId(order.id);
  //   setEditFormData({ ...order });
  //   setOpenMenuId(null);
  // };

  const handleSaveEdit = (orderId: number) => {
    setTableData((prev) => {
      const newData = prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            requestNo: editFormData.requestNo || order.requestNo,
            amount: editFormData.amount ?? order.amount,
            total_amount: editFormData.total_amount ?? order.total_amount,
            total_tax_amount:
              editFormData.total_tax_amount ?? order.total_tax_amount,
            createdDate: editFormData.createdDate ?? order.createdDate,
            status: editFormData.status ?? order.status,
          };
        }
        return order;
      });
      onDataChange?.(newData); // Notify parent of changes
      return newData;
    });

    setEditingId(null);
    setEditFormData({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };
  const deleteRequestMutation = useMutation({
    mutationFn: async (requestIds: any) => {
      const res = await projectService.deleteRequest(requestIds);
      return res;
    },
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleDelete = async (orderId: number, request_id: string) => {
    if (window.confirm(t("confirm_delete_request"))) {
      const response = await deleteRequestMutation.mutateAsync(request_id);
      if (response.data.status === 200) {
        setTableData((prev) => prev.filter((order) => order.id !== orderId));
      }
    }
    setOpenMenuId(null);
  };

  const handleInputChange = (field: keyof Data, value: string | number) => {
    // Handle numeric fields
    if (
      field === "amount" ||
      field === "total_amount" ||
      field === "total_tax_amount" ||
      field === "requestNo" ||
      field === "id"
    ) {
      const parsedValue = value === "" ? 0 : parseFloat(value as string);
      setEditFormData((prev) => ({
        ...prev,
        [field]: isNaN(parsedValue) ? 0 : parsedValue,
      }));
    }
    // Handle string fields
    else {
      setEditFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const tableHeader: TableHeaderType[] = [
    // {
    //   content: (
    //     <input
    //       type="checkbox"
    //       checked={tableData && selectedRows.length === tableData.length}
    //       onChange={handleSelectAll}
    //       className="w-4 h-4 rounded border-secondary-30 text-blue-600 focus:ring-blue-500"
    //       aria-label="Select all rows"
    //     />
    //   ),
    //   className: "w-10", // Fixed width for checkbox
    // },
    {
      content: <div>{t("sr_no")}</div>,
      className: "w-16",
    },
    {
      content: <div>{t("request_no")}</div>,
      className: "min-w-[120px]",
    },
    {
      content: <div>{t("amount")}</div>,
      className: "min-w-[120px]",
    },

    {
      content: <div>{t("creation_date")}</div>,
      className: "w-28",
    },
    {
      content: <div>{t("stage")}</div>,
      className: "w-24",
    },
    {
      content: <div>{t("status")}</div>,
      className: "w-24",
    },
    {
      content: <div>{t("actions")}</div>,
      className: "w-20",
    },
  ];

  console.log(data, "data");

  return (
    <div className="relative rounded-lg border border-secondary-30 bg-white ">
      <div className="relative">
        <Table>
          <TableHeader className="border-b border-gray-100 bg-secondary-10 rounded-lg">
            <TableRow>
              {tableHeader.map((header, index) => {
                return (
                  <TableCell
                    key={index}
                    isHeader
                    className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm cursor-pointer"
                    onClick={header.onClick}
                  >
                    {header.content}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100">
            {tableData &&
              tableData.map((data) => {
                return (
                  <TableRow key={data.id}>
                    {/* <TableCell className="px-5 py-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(data.id)}
                        onChange={() => handleSelectRow(data.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        aria-label={`Select row ${data.id}`}
                      />
                    </TableCell> */}
                    <TableCell className="px-5 py-4 text-gray-500 text-sm">
                      {data.id}
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      {editingId === data.id ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            value={editFormData.requestNo ?? ""}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleInputChange("requestNo", e.target.value)
                            }
                            className="block w-full px-2 py-1 text-sm rounded-md bg-secondary-10 focus:border focus:outline-none border-secondary-30"
                            placeholder="Add Label"
                            aria-label="Label"
                          />
                        </div>
                      ) : (
                        <span className="block font-medium text-secondary-100 text-sm">
                          #{data.requestNo}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="px-5 py-4 sm:px-6">
                      {editingId === data.id ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            value={
                              editFormData.total_tax_amount ??
                              editFormData.amount ??
                              (data.total_tax_amount || data.amount) ??
                              ""
                            }
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleInputChange(
                                data.total_tax_amount
                                  ? "total_tax_amount"
                                  : "amount",
                                e.target.value
                              )
                            }
                            className="block w-full px-2 py-1 text-sm rounded-md bg-secondary-10 focus:border focus:outline-none border-secondary-30"
                            placeholder="Add Tax Rate"
                            aria-label="Tax Rate"
                          />
                        </div>
                      ) : (
                        <div className="font-medium text-secondary-100 text-sm flex gap-2 items-center">
                          {data.currency === "USD" ? (
                            <USFlag width={24} height={14} />
                          ) : data.currency === "CDF" ? (
                            <CDFFlag width={24} height={14} />
                          ) : null}
                          <span className="text-gray-600">
                            {data.currency || "USD"}
                          </span>
                          <span className="block font-medium text-secondary-100 text-sm">
                            {(() => {
                              // Use total_amount if available, otherwise fallback to amount
                              const amountToDisplay =
                                data.total_tax_amount || data.amount || "0";
                              const amount = parseFloat(amountToDisplay);
                              return isNaN(amount)
                                ? "0.00"
                                : formatAmount(amount);
                            })()}
                          </span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="px-5 py-4 sm:px-6">
                      {editingId === data.id ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            value={editFormData.createdDate ?? ""}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleInputChange("createdDate", e.target.value)
                            }
                            className="block w-full px-2 py-1 text-sm rounded-md bg-secondary-10 focus:border focus:outline-none border-secondary-30"
                            placeholder="Add Project Name"
                            aria-label="Label"
                          />
                        </div>
                      ) : (
                        <span className="block font-medium text-secondary-100 text-sm">
                          {data.createdDate}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="px-5 py-4 sm:px-6">
                      {editingId === data.id ? (
                        <div className="flex flex-col gap-1">
                          <select
                            value={editFormData.status ?? ""}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                              handleInputChange("status", e.target.value)
                            }
                            className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white"
                            aria-label="Financial Authority"
                          >
                            <option value="pending">Pending</option>
                            <option value="success">Success</option>
                            <option value="error">Error</option>
                          </select>
                        </div>
                      ) : (
                        <div className="w-fit">
                          {data.status ? (
                            <div className="px-3 py-1.5 rounded-md bg-blue-100 text-blue-700">
                              <Typography size="sm" weight="semibold">
                                {t(mapStageToTranslationKey(data.status))}
                              </Typography>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">-</span>
                          )}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="px-5 py-4 sm:px-6">
                      {editingId === data.id ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            value={editFormData.sub_status ?? ""}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleInputChange("sub_status", e.target.value)
                            }
                            className="block w-full px-2 py-1 text-sm rounded-md bg-secondary-10 focus:border focus:outline-none border-secondary-30"
                            placeholder="Add Status"
                            aria-label="Status"
                          />
                        </div>
                      ) : (
                        <div className="w-fit">
                          {data.sub_status ? (
                            <StatusBadge
                              code={mapStatusToCode(data.sub_status)}
                            />
                          ) : (
                            <span className="text-gray-500 text-sm">-</span>
                          )}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-sm">
                      {editingId === data.id ? (
                        <div className="flex items-center space-x-4">
                          <RightGreenIcon
                            onClick={() => handleSaveEdit(data.id)}
                            width={24}
                            height={24}
                            className="cursor-pointer"
                          />

                          <CrossRedIcon
                            onClick={handleCancelEdit}
                            width={24}
                            height={24}
                            className="cursor-pointer"
                          />
                        </div>
                      ) : (
                        <div
                          className="relative"
                          ref={openMenuId === data.id ? menuRef : null}
                        >
                          <button
                            onClick={(
                              e: React.MouseEvent<HTMLButtonElement>
                            ) => {
                              e.stopPropagation();
                              handleMenuToggle(data.id, e);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="Open actions menu"
                            aria-haspopup="true"
                            aria-expanded={openMenuId === data.id}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          {openMenuId === data.id && (
                            <div
                              className="w-32 bg-white border border-gray-200 rounded-md shadow-lg"
                              style={dropdownStyle}
                              role="menu"
                            >
                              <button
                                onClick={(
                                  e: React.MouseEvent<HTMLButtonElement>
                                ) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/request-details/${data.request_id}`
                                  );
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                role="menuitem"
                                aria-label="Edit row"
                              >
                                {t("view_request")}
                              </button>
                              {user?.type === "user" && (
                                <button
                                  onClick={(
                                    e: React.MouseEvent<HTMLButtonElement>
                                  ) => {
                                    e.stopPropagation();
                                    navigate(
                                      `/edit-request/${data.contract_id}/${data.request_id}`
                                    );
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                  role="menuitem"
                                  aria-label="Edit row"
                                >
                                  {t("edit")}
                                </button>
                              )}

                              {user?.type === "user" && (
                                <button
                                  onClick={(
                                    e: React.MouseEvent<HTMLButtonElement>
                                  ) => {
                                    e.stopPropagation();
                                    handleDelete(data.id, data.request_id);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 transition-colors"
                                  role="menuitem"
                                  aria-label="Delete row"
                                >
                                  {t("delete")}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RequestTable;
