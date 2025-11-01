import { ChangeEvent, useEffect, useRef, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "./CreateRequestTable.tsx";
import {
  ArchiveIconDark,
  CrossRedIcon,
  EyeDarkIcon,
  PencilIcon,
  RightGreenIcon,
  USFlag,
  CDFFlag,
  EURFlag,
  GBPFlag,
} from "../../icons";
import { useNavigate } from "react-router-dom";
import StatusBadge, { StatusCode } from "../common/StatusBadge.tsx";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { formatAmount } from "../../utils/numberFormat";
export interface Data {
  id: number;
  projectId: string;
  projectName: string;
  currency: string;
  amount: number;
  createdDate: string;
  noOfRequest: number;
  projectUuid: string;
  status: StatusCode;
  endDate: string;
  fundedBy: string;
}

const ListDashBoardTable = ({
  data,
  onDataChange,
  onSelectedProjectsChange,
  onSingleArchive,
  isArchiving = false,
}: {
  data: Data[];
  onDataChange?: (newData: Data[]) => void;
  onSelectedProjectsChange?: (selectedProjectUuids: string[]) => void;
  onSingleArchive?: (projectUuid: string) => void;
  isArchiving?: boolean;
}) => {
  const [tableData, setTableData] = useState<Data[]>(data);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Data>>({});
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const menuRef = useRef<HTMLDivElement | null>(null);
  // const selectAllRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
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
    // Clear selections when data changes (e.g., after archive)
    setSelectedRows([]);
  }, [data]);

  const handleMenuToggle = (orderId: number, event?: React.MouseEvent) => {
    if (openMenuId === orderId) {
      setOpenMenuId(null);
      return;
    }
    
    if (event) {
      // Calculate dropdown position
      const buttonRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const dropdownWidth = 160; // w-40 = 160px
      const dropdownHeight = 200; // Approximate height
      const margin = 16;
      
      // Calculate horizontal position
      const wouldOverflowRight = buttonRect.right + dropdownWidth > windowWidth - margin;
      const wouldOverflowLeft = buttonRect.left - dropdownWidth < margin;
      
      let left = wouldOverflowRight && !wouldOverflowLeft 
        ? buttonRect.left - dropdownWidth + buttonRect.width
        : buttonRect.left;
      
      // Calculate vertical position
      const wouldOverflowBottom = buttonRect.bottom + dropdownHeight > windowHeight - margin;
      const top = wouldOverflowBottom && buttonRect.top > dropdownHeight
        ? buttonRect.top - dropdownHeight
        : buttonRect.bottom;
      
      left = Math.max(margin, Math.min(left, windowWidth - dropdownWidth - margin));
      
      setDropdownStyle({
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 9999
      });
    }
    
    setOpenMenuId(orderId);
  };

  const handleEdit = (order: Data) => {
    navigate(`/edit-project/${order.projectUuid}`);
  };

  const handleSaveEdit = (orderId: number) => {
    setTableData((prev) => {
      const newData = prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            projectId: editFormData.projectId || order.projectId,
            projectName: editFormData.projectName || order.projectName,
            amount: editFormData.amount ?? order.amount,
            createdDate: editFormData.createdDate ?? order.createdDate,
            currency: editFormData.currency ?? order.currency,
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
  // const deleteProjectMutation = useMutation({
  //   mutationFn: async (projectIds: any) => {
  //     const res = await projectService.deleteProject(projectIds);
  //     return res;
  //   },
  //   onSuccess: (data) => {
  //     console.log(data);
  //   },
  //   onError: (error) => {
  //     console.error(error);
  //   },
  // });
  // const handleDelete = async (orderId: number, projectId: string) => {
  //   if (window.confirm("Are you sure you want to delete this record?")) {
  //     const response = await deleteProjectMutation.mutateAsync(projectId);
  //     if (response.data.status === 200) {
  //       setTableData((prev) => prev.filter((order) => order.id !== orderId));
  //       setSelectedRows((prev) => prev.filter((id) => id !== orderId));
  //     }
  //   }
  //   setOpenMenuId(null);
  // };

  const handleInputChange = (field: keyof Data, value: string | number) => {
    // Handle numeric fields
    if (field === "amount" || field === "noOfRequest" || field === "id") {
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

  // const getSortIcon = () => {
  //   if (sortOrder === "asc") {
  //     return "↑";
  //   } else if (sortOrder === "desc") {
  //     return "↓";
  //   }
  //   return "↕";
  // };
  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows(tableData.map((order) => order.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (orderId: number) => {
    setSelectedRows((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  // Memoize selected project UUIDs to prevent unnecessary re-renders
  const selectedProjectUuids = useMemo(() => {
    return selectedRows
      .map((rowId) => {
        const project = tableData.find((item) => item.id === rowId);
        return project?.projectUuid;
      })
      .filter(Boolean) as string[];
  }, [selectedRows, tableData]);

  // Notify parent when selection changes
  useEffect(() => {
    onSelectedProjectsChange?.(selectedProjectUuids);
  }, [selectedProjectUuids, onSelectedProjectsChange]);

  // Handler for viewing project details
  const handleViewProject = (projectId: string = "") => {
    navigate(`/project-details/${projectId}`);
  };

  const tableHeader: TableHeader[] = [
    {
      content: (
        <input
          type="checkbox"
          checked={
            tableData &&
            tableData.length > 0 &&
            selectedRows.length === tableData.length
          }
          onChange={handleSelectAll}
          className="w-4 h-4 rounded border-secondary-30 text-blue-600 focus:ring-blue-500"
          aria-label="Select all rows"
        />
      ),
      className: "w-10", // Fixed width for checkbox
    },
    {
      content: <div className="text-nowrap">{t("sr_no")}</div>,
      className: "w-16",
    },
    {
      content: <div className="text-nowrap">{t("project_id")}</div>,
      className: "min-w-[120px]",
    },
    {
      content: <div className="text-nowrap">{t("project_name")}</div>,
      className: "min-w-[120px]",
    },
    {
      content: <div className="text-nowrap">{t("funded_by")}</div>,
      className: "w-24",
    },
    {
      content: <div className="text-nowrap">{t("currency")}</div>,
      className: "min-w-[120px]",
    },

    // {
    //   content: (
    //     <div className="flex items-center gap-1 cursor-pointer">
    //       Amount
    //       <span className="text-xs">{getSortIcon()}</span>
    //     </div>
    //   ),
    //   onClick: handleAmountSort,
    //   className: "w-24",
    // },
    // {
    //   content: <div>Created Date</div>,
    //   className: "w-28",
    // },
    // {
    //   content: <div>No. of Request</div>,
    //   className: "w-24",
    // },
    {
      content: <div>{t("created_date")}</div>,
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

  return (
    <div className="relative rounded-lg bg-white ">
      <div className="relative min-h-[225px]">
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
                    <TableCell className="px-5 py-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(data.id)}
                        onChange={() => handleSelectRow(data.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        aria-label={`Select row ${data.id}`}
                      />
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-sm">
                      {data.id}
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      {editingId === data.id ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            value={editFormData.projectId ?? ""}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleInputChange("projectId", e.target.value)
                            }
                            className="block w-full px-2 py-1 text-sm rounded-md bg-secondary-10 focus:border focus:outline-none border-secondary-30"
                            placeholder="Add Label"
                            aria-label="Label"
                          />
                        </div>
                      ) : (
                        <span className="block font-medium text-secondary-100 text-sm text-nowrap truncate">
                          {data.projectId}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      {editingId === data.id ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            value={editFormData.projectName ?? ""}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleInputChange("projectName", e.target.value)
                            }
                            className="block w-full px-2 py-1 text-sm rounded-md bg-secondary-10 focus:border focus:outline-none border-secondary-30"
                            placeholder="Add Project Name"
                            aria-label="Label"
                          />
                        </div>
                      ) : (
                        <span className="block font-medium text-secondary-100 text-sm text-nowrap truncate">
                          {data.projectName}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="px-5 py-4 sm:px-6">
                      <span className="block font-medium text-secondary-100 text-sm text-nowrap truncate">
                        {data.fundedBy}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      {editingId === data.id ? (
                        <div className="flex flex-col gap-1">
                          <select
                            value={editFormData.currency ?? ""}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                              handleInputChange("currency", e.target.value)
                            }
                            className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white"
                            aria-label="Financial Authority"
                          >
                            <option value="USD">USD</option>
                            <option value="CDF">CDF</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                          </select>
                        </div>
                      ) : (
                        <div className="font-medium text-secondary-100 text-sm flex gap-2 items-center">
                          {data.currency === "USD" && <USFlag width={24} height={14} />}
                          {data.currency === "CDF" && <CDFFlag width={24} height={14} />}
                          {data.currency === "EUR" && <EURFlag width={24} height={14} />}
                          {data.currency === "GBP" && <GBPFlag width={24} height={14} />}
                          <span className="text-gray-500">{data.currency}</span>
                          <span className="block font-medium text-secondary-100 text-sm">
                            {formatAmount(data.amount)}
                          </span>
                        </div>
                      )}
                    </TableCell>

                    {/* <TableCell className="px-5 py-4 sm:px-6">
                      {editingId === data.id ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            value={editFormData.amount ?? ""}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleInputChange("amount", e.target.value)
                            }
                            className="block w-full px-2 py-1 text-sm rounded-md bg-secondary-10 focus:border focus:outline-none border-secondary-30"
                            placeholder="Add Tax Rate"
                            aria-label="Tax Rate"
                          />
                        </div>
                      ) : (
                        <span className="block font-medium text-secondary-100 text-sm">
                          {formatAmount(data.amount)}
                        </span>
                      )}
                    </TableCell> */}

                    {/* <TableCell className="px-5 py-4 sm:px-6">
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
                          {data.createdDate
                            ? new Date(data.createdDate).toLocaleDateString(
                                "en-US"
                              )
                            : ""}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      {editingId === data.id ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            value={editFormData.noOfRequest ?? ""}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleInputChange("noOfRequest", e.target.value)
                            }
                            className="block w-full px-2 py-1 text-sm rounded-md bg-secondary-10 focus:border focus:outline-none border-secondary-30"
                            placeholder="Add Project Name"
                            aria-label="Label"
                          />
                        </div>
                      ) : (
                        <span className="block font-medium text-secondary-100 text-sm">
                          {data.noOfRequest}
                        </span>
                      )}
                    </TableCell> */}

                    <TableCell className="px-5 py-4 sm:px-6">
                      <span className="block font-medium text-secondary-100 text-sm text-nowrap">
                        {moment(data.createdDate).format("YYYY/MM/DD")}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <span className="block font-medium text-secondary-100 text-sm">
                        <StatusBadge code={data.status} />
                      </span>
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
                            onClick={(e) => {
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
                              className="w-40 bg-white border border-gray-200 rounded-md shadow-lg p-2"
                              style={dropdownStyle}
                              role="menu"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProject(data?.projectUuid);
                                }}
                                className="rounded-sm flex items-center gap-2 w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                role="menuitem"
                                aria-label="View Project"
                              >
                                <EyeDarkIcon />
                                {t("view_project")}
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(data);
                                }}
                                className="rounded-sm flex items-center gap-2 w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                role="menuitem"
                                aria-label="Edit"
                              >
                                <PencilIcon />
                                {t("edit")}
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSingleArchive?.(data.projectUuid);
                                  setOpenMenuId(null);
                                }}
                                className="rounded-sm flex items-center gap-2 w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors disabled:opacity-50"
                                role="menuitem"
                                aria-label="Archive"
                                disabled={isArchiving}
                              >
                                <ArchiveIconDark />
                                {isArchiving ? t("archiving") : t("archive")}
                              </button>

                              {/* <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // handleSuspend(data.id);
                                }}
                                className="rounded-sm flex items-center gap-2 w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                role="menuitem"
                                aria-label="Suspend"
                              >
                                <BanIcon />
                                Suspend
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(data.id, data.projectUuid);
                                }}
                                className="rounded-sm flex items-center gap-2 w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                role="menuitem"
                                aria-label="Close"
                              >
                                <XCircleIcon />
                                Close
                              </button> */}
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

export default ListDashBoardTable;
