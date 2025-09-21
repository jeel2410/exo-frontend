import { useEffect, useRef, useState } from "react";
import moment from "moment";
import {
  ArchiveIconDark,
  EyeDarkIcon,
  PencilIcon,
  PlusIcon,
  USFlag,
  CDFFlag,
} from "../../icons";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import contractService from "../../services/contract.service";
import { useLoading } from "../../context/LoaderProvider";
import { toast } from "react-toastify";

export interface TableHeader {
  content: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

interface TableProps {
  children: React.ReactNode;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  isHeader?: boolean;
  onClick?: (event: React.MouseEvent<HTMLTableCellElement>) => void;
}

// Mock Table components
export const Table: React.FC<TableProps> = ({ children }) => (
  <table className="w-full border-collapse min-w-[1200px]" role="grid">
    {children}
  </table>
);

export const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  className,
}) => <thead className={className}>{children}</thead>;

export const TableBody: React.FC<TableBodyProps> = ({
  children,
  className,
}) => <tbody className={className}>{children}</tbody>;

export const TableRow: React.FC<TableRowProps> = ({ children }) => (
  <tr>{children}</tr>
);

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className,
  isHeader = false,
  onClick,
}) => {
  const Tag = isHeader ? "th" : "td";
  return (
    <Tag
      className={className}
      onClick={onClick}
      {...(isHeader ? { scope: "col" } : {})}
    >
      {children}
    </Tag>
  );
};

export interface ContractData {
  id: number;
  projectName: string;
  contractName: string;
  signedBy: string;
  position: string;
  amountOfContract: number;
  currency: string;
  organization: string;
  dateOfSigning: string;
  numberOfRequests: number;
  contractId: string;
  projectId?: string;
  created_at: string | Date; // Assuming this is a date string
}

const ContractListTable = ({
  data,
}: // onDataChange,
{
  data: ContractData[];
  onDataChange?: (newData: ContractData[]) => void;
}) => {
  const [tableData, setTableData] = useState<ContractData[]>(data);
  // const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();
  const { setLoading } = useLoading();

  const { t, i18n } = useTranslation();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleArchiveClick = async (contractId: string) => {
    const confirmArchive = window.confirm(t("confirm_archive_contract"));

    if (!confirmArchive) {
      setOpenMenuId(null);
      return;
    }

    try {
      const payload = {
        contract_ids: contractId,
      };
      setLoading(true);
      const response = await contractService.archiveContract(payload);
      console.log("Contract archived successfully:", response);

      // Remove the archived contract from the table data
      const updatedData = tableData.filter(
        (contract) => contract.contractId !== contractId
      );
      setTableData(updatedData);

      // You can add a success notification here if you have a notification system
      toast.success(t("contract_archived_success"));

      setLoading(false);
    } catch (error) {
      console.error("Error archiving contract:", error);
      // You can add an error notification here
      // toast.error('Failed to archive contract');
      setLoading(false);
    }

    setOpenMenuId(null); // Ensure the menu is closed after action
  };

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

  const handleViewContract = (contractId: string) => {
    navigate("/contract-details/" + contractId);
  };

  const handelEditContract = (contractId: string) => {
    navigate("/edit-contract/" + contractId);
  };

  const handleMenuToggle = (orderId: number) => {
    setOpenMenuId(openMenuId === orderId ? null : orderId);
  };

  const handleAddRequest = (projectId: string, contractId: string) => {
    console.log(projectId, "projectId in contract list table");
    console.log(contractId, "contractId in contract list table");

    navigate(`/add-request/${projectId}/${contractId}`);
  };

  useEffect(() => {
    setTableData(data);
  }, [data]);

  console.log(data, "data in contract list table");

  // Mobile Card Component
  const MobileContractCard = ({ contract }: { contract: ContractData }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm relative">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-2">
          <h3 className="font-semibold text-secondary-100 text-sm mb-1 line-clamp-2">
            {contract.projectName}
          </h3>
          <p className="text-xs text-secondary-60 mb-2 line-clamp-1">
            {contract.contractName}
          </p>
          <div className="flex items-center space-x-2 mb-2 flex-wrap">
            {contract.currency === "USD" ? (
              <USFlag width={16} height={10} />
            ) : contract.currency === "CDF" ? (
              <CDFFlag width={16} height={10} />
            ) : null}
            <span className="text-xs text-gray-600">{contract.currency}</span>
            <span className="font-medium text-secondary-100 text-sm">
              {Number(contract.amountOfContract).toLocaleString(
                i18n.language === "fr" ? "fr-FR" : "en-US"
              )}
            </span>
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMenuToggle(contract.id);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          {openMenuId === contract.id && (
            <div
              ref={menuRef}
              className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-2"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewContract(contract.contractId);
                }}
                className="flex items-center gap-2 w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 rounded-sm"
              >
                <EyeDarkIcon />
                {t("view_contract")}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handelEditContract(contract.contractId);
                }}
                className="flex items-center gap-2 w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 rounded-sm"
              >
                <PencilIcon />
                {t("edit")}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddRequest(
                    contract.projectId || "",
                    contract.contractId
                  );
                }}
                className="flex items-center gap-2 w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 rounded-sm"
              >
                <PlusIcon />
                {t("add_request")}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleArchiveClick(contract.contractId);
                }}
                className="flex items-center gap-2 w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 rounded-sm"
              >
                <ArchiveIconDark />
                {t("archive")}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-secondary-60 block mb-1">{t("signed_by")}</span>
          <span className="text-secondary-100 font-medium">
            {contract.signedBy}
          </span>
        </div>
        <div>
          <span className="text-secondary-60 block mb-1">{t("position")}</span>
          <span className="text-secondary-100 font-medium">
            {contract.position}
          </span>
        </div>
        <div>
          <span className="text-secondary-60 block mb-1">
            {t("organization")}
          </span>
          <span className="text-secondary-100 font-medium line-clamp-1">
            {contract.organization}
          </span>
        </div>
        <div>
          <span className="text-secondary-60 block mb-1">
            {t("created_date")}
          </span>
          <span className="text-secondary-100 font-medium">
            {moment(contract.created_at).format("YYYY/MM/DD")}
          </span>
        </div>
        <div>
          <span className="text-secondary-60 block mb-1">
            {t("number_of_equests")}
          </span>
          <span className="text-secondary-100 font-medium">
            {contract.numberOfRequests}
          </span>
        </div>
      </div>
    </div>
  );

  const tableHeader: TableHeader[] = [
    {
      content: <div className="text-nowrap">{t("sr_no")}</div>,
      className: "w-16",
    },
    {
      content: <div className="text-nowrap">{t("project_name")}</div>,
      className: "min-w-[180px] max-w-[220px]",
    },
    {
      content: <div className="text-nowrap">{t("contract_name")}</div>,
      className: "min-w-[180px] max-w-[220px]",
    },
    {
      content: <div className="text-nowrap">{t("signed_by")}</div>,
      className: "min-w-[140px]",
    },
    {
      content: <div className="text-nowrap">{t("position")}</div>,
      className: "min-w-[120px]",
    },
    {
      content: <div className="text-nowrap">{t("amount_of_contract")}</div>,
      className: "min-w-[150px]",
    },
    {
      content: <div className="text-nowrap">{t("organization")}</div>,
      className: "min-w-[130px]",
    },
    {
      content: <div className="text-nowrap">{t("created_date")}</div>,
      className: "min-w-[120px]",
    },
    {
      content: <div className="text-nowrap">{t("number_of_equests")}</div>,
      className: "min-w-[120px]",
    },
    {
      content: <div>{t("actions")}</div>,
      className: "w-20",
    },
  ];
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
  // Mobile Layout
  if (isMobile) {
    return (
      <div className="space-y-4">
        {tableData && tableData.length > 0 ? (
          tableData.map((contract) => (
            <MobileContractCard key={contract.id} contract={contract} />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">{t("no_contracts_available")}</p>
          </div>
        )}
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="relative rounded-lg bg-white">
      <div className="relative min-h-[225px]">
        <div className="overflow-x-auto custom-scrollbar">
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
                      <TableCell className="px-5 py-4 text-gray-500 text-sm">
                        {data.id}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 min-w-[180px] max-w-[220px]">
                        <span className="block font-medium text-secondary-100 text-sm truncate">
                          {data.projectName}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 min-w-[180px] max-w-[220px]">
                        <span className="block font-medium text-secondary-100 text-sm truncate">
                          {data.contractName}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 min-w-[140px]">
                        <span className="block font-medium text-secondary-100 text-sm truncate">
                          {data.signedBy}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 min-w-[120px]">
                        <span className="block font-medium text-secondary-100 text-sm truncate">
                          {data.position}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 min-w-[150px]">
                        <div className="font-medium text-secondary-100 text-sm flex gap-2 items-center">
                          {data.currency === "USD" ? (
                            <USFlag width={20} height={12} />
                          ) : data.currency === "CDF" ? (
                            <CDFFlag width={20} height={12} />
                          ) : null}
                          <span className="text-gray-600 text-xs">
                            {data.currency}
                          </span>
                          <span className="block font-medium text-secondary-100 text-sm truncate">
                            {Number(data.amountOfContract).toLocaleString(
                              i18n.language === "fr" ? "fr-FR" : "en-US"
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 min-w-[130px]">
                        <span className="block font-medium text-secondary-100 text-sm truncate">
                          {data.organization}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6">
                        <span className="block font-medium text-secondary-100 text-sm text-nowrap">
                          {moment(data.created_at).format("YYYY/MM/DD")}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6">
                        <span className="block font-medium text-secondary-100 text-sm text-nowrap ">
                          {data.numberOfRequests}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-sm">
                        <div
                          className="relative"
                          ref={openMenuId === data.id ? menuRef : null}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuToggle(data.id);
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
                              className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-2"
                              role="menu"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewContract(data?.contractId);
                                }}
                                className="rounded-sm flex items-center gap-2 w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                role="menuitem"
                                aria-label="View Contract"
                              >
                                <EyeDarkIcon />
                                {t("view_contract")}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handelEditContract(data.contractId);
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
                                  handleAddRequest(
                                    data.projectId || "",
                                    data.contractId
                                  );
                                }}
                                className="rounded-sm flex items-center gap-2 w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                role="menuitem"
                                aria-label="Edit"
                              >
                                <PlusIcon />
                                {t("add_request")}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchiveClick(data.contractId);
                                }}
                                className="rounded-sm flex items-center gap-2 w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                role="menuitem"
                                aria-label="Archive"
                              >
                                <ArchiveIconDark />
                                {t("archive")}
                              </button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ContractListTable;
