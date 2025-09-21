import React from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import Button from "../../lib/components/atoms/Button";
import { ContractDetails } from "../../pages/Dashboard/contractor/ContractListPage";

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

// Table components
export const Table: React.FC<TableProps> = ({ children }) => (
  <table className="w-full border-collapse" role="grid">
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

interface SelectContractTableProps {
  data: ContractDetails[];
  onSelectContract: (contractId: string, projectId: string) => void;
}

const SelectContractTable: React.FC<SelectContractTableProps> = ({
  data,
  onSelectContract,
}) => {
  const { t, i18n } = useTranslation();

  const tableHeader: TableHeader[] = [
    {
      content: <div className="text-nowrap">{t("sr_no")}</div>,
      className: "w-16",
    },
    {
      content: <div className="text-nowrap">{t("project_name")}</div>,
      className: "min-w-[150px]",
    },
    {
      content: <div className="text-nowrap">{t("signed_by")}</div>,
      className: "min-w-[120px]",
    },
    {
      content: <div className="text-nowrap">{t("position")}</div>,
      className: "min-w-[100px]",
    },
    {
      content: <div className="text-nowrap">{t("amount")}</div>,
      className: "min-w-[120px]",
    },
    {
      content: <div className="text-nowrap">{t("organization")}</div>,
      className: "min-w-[120px]",
    },
    {
      content: <div className="text-nowrap">{t("created_date")}</div>,
      className: "min-w-[100px]",
    },
    {
      content: <div>{t("action")}</div>,
      className: "w-20",
    },
  ];

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">
          {t("no_contracts_found")}
        </div>
        <div className="text-gray-400 text-sm">
          {t("please_create_a_contract_first")}
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg bg-white border border-secondary-30 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          <Table>
            <TableHeader className="border-b border-gray-100 bg-secondary-10 rounded-t-lg">
              <TableRow>
                {tableHeader.map((header, index) => {
                  return (
                    <TableCell
                      key={index}
                      isHeader
                      className={`px-5 py-4 font-semibold text-secondary-50 text-left text-sm ${header.className || ''}`}
                      onClick={header.onClick}
                    >
                      {header.content}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100">
              {data.map((contract, index) => {
                return (
                  <TableRow key={contract.id}>
                    <TableCell className="px-5 py-4 text-gray-500 text-sm w-16">
                      {index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 min-w-[150px]">
                      <span className="block font-medium text-secondary-100 text-sm">
                        {contract.project_name}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 min-w-[120px]">
                      <span className="block font-medium text-secondary-100 text-sm">
                        {contract.signed_by}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 min-w-[100px]">
                      <span className="block font-medium text-secondary-100 text-sm">
                        {contract.position}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 min-w-[120px]">
                      <div className="font-medium text-secondary-100 text-sm flex gap-2 items-center">
                        <span className="text-gray-600">{contract.currency}</span>
                        <span className="block font-medium text-secondary-100 text-sm">
                          {Number(contract.amount).toLocaleString(
                            i18n.language === 'fr' ? 'fr-FR' : 'en-US'
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 min-w-[120px]">
                      <span className="block font-medium text-secondary-100 text-sm">
                        {contract.organization}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 min-w-[100px]">
                      <span className="block font-medium text-secondary-100 text-sm whitespace-nowrap">
                        {moment(contract.created_at).format("YYYY/MM/DD")}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-3 text-center w-20">
                      <Button
                        variant="primary"
                        onClick={() =>
                          onSelectContract(contract.id, contract.project_id)
                        }
                        className="text-xs px-3 py-1.5 min-w-[60px] h-7 whitespace-nowrap"
                      >
                        {t("select")}
                      </Button>
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

export default SelectContractTable;
