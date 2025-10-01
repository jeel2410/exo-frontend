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
import { formatAmount } from "../../utils/numberFormat";

export interface ContractData {
  id: number;
  // Modern contract structure
  contractName?: string;
  contractingAgencyName?: string;
  contractingAgencyPersonName?: string;
  contractingAgencyPersonPosition?: string;
  awardedCompanyName?: string;
  awardedCompanyPersonName?: string;
  awardedCompanyPersonPosition?: string;
  amountByContract: number;
  currency: string;
  place?: string;
  dateOfSigning?: string;
  numberOfRequests?: number;
  contract_id: string;
  // Legacy fields for backward compatibility
  signedBy?: string;
  position?: string;
  organization?: string;
  dateCreated?: string;
  noOfRequest?: number;
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
    {
      content: <div>{t("sr_no")}</div>,
      className: "w-16",
    },
    {
      content: <div className="text-nowrap">{t("contract_name")}</div>,
      className: "min-w-[160px]",
    },
    {
      content: <div className="text-nowrap">{t("contracting_agency")}</div>,
      className: "min-w-[180px]",
    },
    {
      content: <div className="text-nowrap">{t("awarded_company")}</div>,
      className: "min-w-[180px]",
    },
    {
      content: <div className="text-nowrap">{t("contract_amount")}</div>,
      className: "min-w-[140px]",
    },
    {
      content: <div className="text-nowrap">{t("place")}</div>,
      className: "min-w-[120px]",
    },
    {
      content: <div className="text-nowrap">{t("date_of_signing")}</div>,
      className: "min-w-[120px]",
    },
    {
      content: <div className="text-nowrap">{t("number_of_requests")}</div>,
      className: "w-24",
    },
    {
      content: <div>{t("actions")}</div>,
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
                    <TableCell className="px-5 py-4 text-gray-500 text-sm">
                      {data.id}
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 min-w-[160px]">
                      <span className="block font-medium text-secondary-100 text-sm truncate" title={data.contractName}>
                        {data.contractName || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 min-w-[180px]">
                      <div className="text-sm">
                        <div className="font-medium text-secondary-100 truncate" title={data.contractingAgencyName || data.organization}>
                          {data.contractingAgencyName || data.organization || data.signedBy || "-"}
                        </div>
                        <div className="text-xs text-gray-600 truncate" title={data.contractingAgencyPersonName}>
                          {data.contractingAgencyPersonName || data.position || "-"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 min-w-[180px]">
                      <div className="text-sm">
                        <div className="font-medium text-secondary-100 truncate" title={data.awardedCompanyName}>
                          {data.awardedCompanyName || "-"}
                        </div>
                        <div className="text-xs text-gray-600 truncate" title={data.awardedCompanyPersonName}>
                          {data.awardedCompanyPersonName || "-"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 min-w-[140px]">
                      <div className="font-medium text-secondary-100 text-sm flex gap-2 items-center">
                        {data.currency === "USD" ? (
                          <USFlag width={20} height={12} />
                        ) : data.currency === "CDF" ? (
                          <CDFFlag width={20} height={12} />
                        ) : null}
                        <span className="text-gray-600 text-xs">
                          {data.currency || "USD"}
                        </span>
                        <span className="block font-medium text-secondary-100 text-sm truncate">
                          {formatAmount(data.amountByContract)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 min-w-[120px]">
                      <span className="block font-medium text-secondary-100 text-sm truncate" title={data.place}>
                        {data.place || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 min-w-[120px]">
                      <span className="block font-medium text-secondary-100 text-sm text-nowrap">
                        {data.dateOfSigning || data.dateCreated || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <span className="block font-medium text-secondary-100 text-sm text-nowrap">
                        {data.numberOfRequests || data.noOfRequest || 0}
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
