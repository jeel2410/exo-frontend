import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "./CreateRequestTable.tsx";
import { USFlag, CDFFlag } from "../../icons";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

export interface ContractData {
  id: number;
  signedBy: string;
  position: string;
  amountByContract: number;
  organization: string;
  dateCreated: string;
  noOfRequest: number;
  contract_id: string;
  currency: string;
}

const ContractTable = ({ data }: { data: ContractData[] | [] }) => {
  const [tableData, setTableData] = useState<ContractData[]>(data);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const handleViewContract = (contractId: string) => {
    navigate(`/contract-details/${contractId}`);
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
      content: <div>{t("sr_no")}</div>,
      className: "w-16",
    },
    {
      content: <div>{t("signed_by")}</div>,
      className: "min-w-[120px]",
    },
    {
      content: <div>{t("position")}</div>,
      className: "min-w-[120px]",
    },
    {
      content: <div>{t("amount_by_contract")}</div>,
      className: "min-w-[140px]",
    },
    {
      content: <div>{t("organization")}</div>,
      className: "min-w-[140px]",
    },
    {
      content: <div>{t("date_created")}</div>,
      className: "w-28",
    },
    {
      content: <div>{t("no_of_request")}</div>,
      className: "w-24",
    },
    {
      content: <div>Actions</div>,
      className: "w-20",
    },
  ];

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
                      <span className="block font-medium text-secondary-100 text-sm">
                        {data.signedBy}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <span className="block font-medium text-secondary-100 text-sm">
                        {data.position}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
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
                          {data.amountByContract.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <span className="block font-medium text-secondary-100 text-sm">
                        {data.organization}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <span className="block font-medium text-secondary-100 text-sm">
                        {data.dateCreated}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <span className="block font-medium text-secondary-100 text-sm">
                        {data.noOfRequest}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-sm">
                      <div className="relative">
                        <button
                          onClick={() => handleViewContract(data.contract_id)}
                          className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          aria-label="View contract details"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                      </div>
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

export default ContractTable;
