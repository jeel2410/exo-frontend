import { useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "./CreateRequestTable.tsx";
import {
  CrossRedIcon,
  EyeDarkIcon,
  PluseDarkIcon,
  RightGreenIcon,
} from "../../icons";
import { useNavigate } from "react-router-dom";
// import projectService from "../../services/project.service.ts";
// import { useMutation } from "@tanstack/react-query";
import StatusBadge, { StatusCode } from "../common/StatusBadge.tsx";
import moment from "moment";
import { useTranslation } from "react-i18next";

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
  financeBy: string;
  projectManager?: string;
}

const ContractProjectListTable = ({
  data,
  onDataChange,
}: {
  data: Data[];
  onDataChange?: (newData: Data[]) => void;
}) => {
  const [tableData, setTableData] = useState<Data[]>(data);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Data>>({});
  // const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const menuRef = useRef<HTMLDivElement | null>(null);
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
  }, [data]);

  const handleMenuToggle = (orderId: number) => {
    setOpenMenuId(openMenuId === orderId ? null : orderId);
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

  // const handleInputChange = (field: keyof Data, value: string | number) => {
  //   // Handle numeric fields
  //   if (field === "amount" || field === "noOfRequest" || field === "id") {
  //     const parsedValue = value === "" ? 0 : parseFloat(value as string);
  //     setEditFormData((prev) => ({
  //       ...prev,
  //       [field]: isNaN(parsedValue) ? 0 : parsedValue,
  //     }));
  //   }
  //   // Handle string fields
  //   else {
  //     setEditFormData((prev) => ({
  //       ...prev,
  //       [field]: value,
  //     }));
  //   }
  // };

  // const getSortIcon = () => {
  //   if (sortOrder === "asc") {
  //     return "↑";
  //   } else if (sortOrder === "desc") {
  //     return "↓";
  //   }
  //   return "↕";
  // };
  // const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.checked) {
  //     setSelectedRows(tableData.map((order) => order.id));
  //   } else {
  //     setSelectedRows([]);
  //   }
  // };

  // const handleSelectRow = (orderId: number) => {
  //   setSelectedRows((prev) => {
  //     if (prev.includes(orderId)) {
  //       return prev.filter((id) => id !== orderId);
  //     } else {
  //       return [...prev, orderId];
  //     }
  //   });
  // };

  // Handler for viewing project details
  const handleViewProject = (projectId: string = "") => {
    navigate(`/project-details/${projectId}`);
  };
  const addContract = (projectId: string = "") => {
    navigate(`/create-contract/${projectId}`);
  };

  const tableHeader: TableHeader[] = [
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
      content: <div className="text-nowrap">Sr No</div>,
      className: "w-16",
    },
    {
      content: <div className="text-nowrap">Project ID</div>,
      className: "min-w-[120px]",
    },
    {
      content: <div className="text-nowrap">Project Name</div>,
      className: "min-w-[120px]",
    },
    {
      content: <div className="text-nowrap">Currency</div>,
      className: "min-w-[120px]",
    },
    {
      content: <div>End Date</div>,
      className: "w-24",
    },
    {
      content: <div>Status</div>,
      className: "w-24",
    },
    {
      content: <div className="text-nowrap">Project Manager</div>,
      className: "w-24",
    },
    {
      content: <div>Actions</div>,
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
                    onClick={header.onClick}>
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
                      <span className="block font-medium text-secondary-100 text-sm text-nowrap truncate">
                        {data.projectId|| "-"}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <span className="block font-medium text-secondary-100 text-sm text-nowrap truncate">
                        {data.projectName || "-"}
                      </span>
                    </TableCell>

                    
                    <TableCell className="px-5 py-4 sm:px-6">
                      <div className="font-medium text-secondary-100 text-sm flex gap-2 items-center">                        
                        <span className="text-gray-500">{data.currency}</span>
                        <span className="block font-medium text-secondary-100 text-sm">
                          {Number(data.amount).toLocaleString()}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-5 py-4 sm:px-6">
                      <span className="block font-medium text-secondary-100 text-sm text-nowrap">
                        {moment(data.endDate).format("YYYY/MM/DD")}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <span className="block font-medium text-secondary-100 text-sm">
                        <StatusBadge code={data.status} />
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <span className={`block font-medium text-secondary-100 text-sm ${data.projectManager?.trim()?"":"text-center"}`}>
                        {data.projectManager?.trim() || "-"}
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
                          ref={openMenuId === data.id ? menuRef : null}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuToggle(data.id);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="Open actions menu"
                            aria-haspopup="true"
                            aria-expanded={openMenuId === data.id}>
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          {openMenuId === data.id && (
                            <div
                              className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-2"
                              role="menu">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProject(data?.projectUuid);
                                }}
                                className="rounded-sm flex items-center gap-2 w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                role="menuitem"
                                aria-label="View Project">
                                <EyeDarkIcon />
                                {t("view_project")}
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addContract(data?.projectUuid);
                                }}
                                className="rounded-sm flex items-center gap-2 w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                role="menuitem"
                                aria-label="Edit">
                                <PluseDarkIcon />
                                {t("add_contract")}
                              </button>
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

export default ContractProjectListTable;
