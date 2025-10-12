import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { USFlag, CDFFlag } from "../../icons";
import { formatAmount } from "../../utils/numberFormat";
import EntityFormModal from "../modals/EntityFormModal";
import Button from "../../lib/components/atoms/Button";
import Typography from "../../lib/components/atoms/Typography";

// Debug: Verify file is loading
console.log("🚀 CreateRequestTable.tsx loaded at:", new Date().toISOString());

export interface TableHeader {
  content: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

interface TableProps {
  children: React.ReactNode;
  className?: string;
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
  colSpan?: number;
}

// Mock Table components
export const Table: React.FC<TableProps> = ({ children, className }) => (
  <table className={`w-full border-collapse ${className ?? ""}`} role="grid">
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
  colSpan,
}) => {
  const Tag = isHeader ? "th" : "td";
  return (
    <Tag
      className={className}
      onClick={onClick}
      colSpan={colSpan}
      {...(isHeader ? { scope: "col" } : {})}
    >
      {children}
    </Tag>
  );
};

export interface Order {
  id: number;
  reference?: string; // Reference field
  tarrifPosition?: string; // Tarrif Position field
  issueDate?: string | Date; // Issue Date field (only for local acquisition)
  natureOfOperations?: string; // Nature of Operations field (only for local acquisition)
  label: string;
  quantity: number;
  unitPrice: number;
  unit?: string; // Add unit field
  total: number;
  taxRate: number;
  taxAmount: number;
  vatIncluded: number;
  customDuty?: string;
  currency?: string;
  unit_price?: number;
  tax_rate?: number;
  tax_amount?: number;
  vat_included?: number;
  custom_duty?: string;
  custom_duties?: string; // Add this for backward compatibility with API response
  // Fields for importation tax category
  cif?: number;
  totalCif?: number;
  droit?: number;
  itIc?: string; // IT/IC field for importation ("IT" or "IC")
}

type SortOrder = "asc" | "desc" | null;

const CreateRequestTable = ({
  data,
  onDataChange,
  showActions = true,
  showAddButton = true,
  onEditComplete,
  currentTaxCategory,
}: {
  data: Order[];
  onDataChange?: (newData: Order[]) => void;
  isEditable?: boolean;
  showActions?: boolean;
  showAddButton?: boolean;
  onEditComplete?: () => void;
  currentTaxCategory?: string;
}) => {
  const { t } = useTranslation();

  // All hooks must be declared before any conditional returns
  const [tableData, setTableData] = useState<Order[]>(data);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // Modal state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [modalData, setModalData] = useState<Partial<Order>>({});

  // Ref for the dropdown menu container
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Handle outside click to close dropdown menu
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

  // Safe translation function that handles missing keys
  const safeTrans = (key: string, fallback?: string) => {
    try {
      const result = t(key);
      return result !== key ? result : fallback || key;
    } catch (error) {
      console.warn(`Translation error for key '${key}':`, error);
      return fallback || key;
    }
  };

  console.log(
    "🚀 CreateRequestTable rendering with tax category:",
    currentTaxCategory
  );

  // Guard against undefined or empty tax category AFTER all hooks
  if (!currentTaxCategory || currentTaxCategory.trim() === "") {
    console.log(
      "🚨 Warning: currentTaxCategory is empty or undefined, using fallback"
    );
    return (
      <div className="relative rounded-lg border border-yellow-300 bg-yellow-50 p-4">
        <h3 className="text-yellow-800 font-bold">
          {t("please_select_a_tax_category")}
        </h3>
        <p className="text-yellow-600">
          {t(
            "the_table_will_be_displayed_once_you_select_a_tax_category_from_the_dropdown_above"
          )}
        </p>
      </div>
    );
  }

  // Date helper functions for issue date
  const formatDateForDisplay = (date: string | Date | undefined): string => {
    if (!date) return "-";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "-";
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleMenuToggle = (orderId: number, event?: React.MouseEvent) => {
    if (openMenuId === orderId) {
      setOpenMenuId(null);
      return;
    }

    if (event) {
      const buttonRect = (
        event.currentTarget as HTMLElement
      ).getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const dropdownWidth = 128; // w-32
      const dropdownHeight = 120; // approx
      const margin = 16;

      const wouldOverflowRight =
        buttonRect.right + dropdownWidth > windowWidth - margin;
      const wouldOverflowLeft = buttonRect.left - dropdownWidth < margin;
      let left =
        wouldOverflowRight && !wouldOverflowLeft
          ? buttonRect.left - dropdownWidth + buttonRect.width
          : buttonRect.left;

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

  // Modal handlers
  const handleAddEntity = () => {
    setModalMode("add");
    setModalData({});
    setIsModalOpen(true);
  };

  const handleEditEntity = (order: Order) => {
    setModalMode("edit");
    setModalData({ ...order });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalData({});
  };

  const handleModalSave = (data: Partial<Order>) => {
      if (modalMode === "add") {
        // Add new entity
        const newId = Math.max(...tableData.map((item) => item.id), 0) + 1;
        const isImportation = currentTaxCategory === "importation";
        const computedUnitPrice = isImportation
          ? (data.cif ?? data.unitPrice ?? 0)
          : (data.unitPrice ?? 0);
        const newEntity: Order = {
          id: newId,
          reference: data.reference || "",
          tarrifPosition: data.tarrifPosition || "",
          issueDate: data.issueDate,
          natureOfOperations: data.natureOfOperations,
          label: data.label || "",
          quantity: data.quantity || 0,
          unitPrice: computedUnitPrice,
          unit: data.unit,
          total: data.total || 0,
          taxRate: data.taxRate || 0,
          taxAmount: data.taxAmount || 0,
          vatIncluded: data.vatIncluded || 0,
          customDuty: data.customDuty,
          currency: data.currency,
          cif: data.cif ?? (isImportation ? (data.unitPrice ?? undefined) : undefined),
          totalCif: data.totalCif,
          droit: isImportation ? (data.taxAmount || 0) : (data.droit || 0),
          itIc: data.itIc,
        };

      const newTableData = [...tableData, newEntity];
      setTableData(newTableData);
      onDataChange?.(newTableData);
    } else {
      // Edit existing entity
      const updatedTableData = tableData.map((order) => {
        if (order.id === modalData.id) {
          return {
            ...order,
            reference: data.reference || order.reference,
            tarrifPosition: data.tarrifPosition || order.tarrifPosition,
            issueDate:
              data.issueDate !== undefined ? data.issueDate : order.issueDate,
            natureOfOperations:
              data.natureOfOperations !== undefined
                ? data.natureOfOperations
                : order.natureOfOperations,
            label: data.label || order.label,
            quantity: data.quantity || order.quantity,
            unitPrice: data.unitPrice ?? order.unitPrice,
            unit: data.unit || order.unit,
            total: data.total || order.total,
            taxRate: data.taxRate ?? order.taxRate,
            taxAmount: data.taxAmount || order.taxAmount,
            vatIncluded: data.vatIncluded || order.vatIncluded,
            customDuty: data.customDuty || order.customDuty,
            cif: data.cif ?? order.cif,
            totalCif: data.totalCif ?? order.totalCif,
            droit: data.droit ?? order.droit,
            itIc: data.itIc !== undefined ? data.itIc : order.itIc,
          };
        }
        return order;
      });

      setTableData(updatedTableData);
      onDataChange?.(updatedTableData);
    }

    handleModalClose();
    onEditComplete?.();
  };

  const handleDelete = (orderId: number) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setTableData((prev) => prev.filter((order) => order.id !== orderId));
      onDataChange?.(tableData.filter((order) => order.id !== orderId));
    }
    setOpenMenuId(null);
  };

  const handleQuantitySort = () => {
    let newSortOrder: SortOrder;
    if (sortOrder === null || sortOrder === "desc") {
      newSortOrder = "asc";
    } else {
      newSortOrder = "desc";
    }

    setSortOrder(newSortOrder);

    const sortedData = [...tableData].sort((a, b) => {
      if (newSortOrder === "asc") {
        return a.quantity - b.quantity;
      } else {
        return b.quantity - b.quantity;
      }
    });

    setTableData(sortedData);
  };

  const getSortIcon = () => {
    if (sortOrder === "asc") {
      return "↑";
    } else if (sortOrder === "desc") {
      return "↓";
    }
    return "↕️";
  };

  // Dynamic custom duty options based on tax category
  const getCustomDutyOptions = () => {
    if (currentTaxCategory === "location_acquisition") {
      return [{ value: "TVA", label: "TVA" }];
    } else if (currentTaxCategory === "importation") {
      return [
        { value: "TVA à l'importation", label: "TVA à l'importation" },
        {
          value: "Taxes DGRAD à l'importation",
          label: "Taxes DGRAD à l'importation",
        },
        { value: "Droits d'entrée", label: "Droits d'entrée" },
        { value: "Droit de consommation", label: "Droit de consommation" },
      ];
    }
    // Default fallback for DGI, DGDA, DGRAD (legacy values)
    return [{ value: "TVA", label: "TVA" }];
  };

  // Helper function to render currency with flag (for currency column)
  const renderCurrencyDisplay = (currency?: string) => {
    const currencyType = currency || "USD";
    return (
      <div className="font-medium text-secondary-100 text-sm flex gap-2 items-center">
        {currencyType === "USD" ? (
          <USFlag width={20} height={12} />
        ) : currencyType === "CDF" ? (
          <CDFFlag width={20} height={12} />
        ) : null}
        <span className="text-gray-600">{currencyType}</span>
      </div>
    );
  };

  // Helper function to render amounts as numbers only
  const renderAmountOnly = (amount: number | string) => {
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    const formattedAmount = isNaN(numericAmount)
      ? "0.00"
      : formatAmount(numericAmount);

    return (
      <span className="block font-medium text-secondary-100 text-sm">
        {formattedAmount}
      </span>
    );
  };

  // Helper function to render display-only columns (no inline editing)
  const renderDisplayOnlyColumns = (order: Order, index: number) => {
    try {
      const columns = [];

      // Always include SR No, Reference, and Custom Duties first
      columns.push(
        <TableCell key="sr_no" className="px-5 py-4 text-gray-500 text-sm">
          {index + 1}
        </TableCell>
      );

      columns.push(
        <TableCell key="reference" className="px-5 py-4 sm:px-6">
          <span className="block font-medium text-secondary-100 text-sm">
            {order.reference || "-"}
          </span>
        </TableCell>
      );

      // Issue Date (only for local acquisition)
      if (currentTaxCategory === "location_acquisition") {
        columns.push(
          <TableCell key="issue_date" className="px-5 py-4 sm:px-6">
            <span className="block font-medium text-secondary-100 text-sm">
              {formatDateForDisplay(order.issueDate)}
            </span>
          </TableCell>
        );
      }

      // Tariff Position (only for importation)
      if (currentTaxCategory === "importation") {
        columns.push(
          <TableCell key="tarrif_position" className="px-5 py-4 sm:px-6">
            <span className="block font-medium text-secondary-100 text-sm">
              {order.tarrifPosition || "-"}
            </span>
          </TableCell>
        );
      }

      // Custom Duties
      columns.push(
        <TableCell key="custom_duty" className="px-5 py-4 sm:px-6">
          <span className="block font-medium text-secondary-100 text-sm">
            {(() => {
              const customDutyValue =
                order.customDuty ||
                order.custom_duty ||
                order.custom_duties ||
                "";
              const matchedOption = getCustomDutyOptions().find(
                (opt) => opt.value === customDutyValue
              );
              return matchedOption?.label || customDutyValue || "-";
            })()}
          </span>
        </TableCell>
      );

      if (currentTaxCategory === "location_acquisition") {
        // Nature Marchandise
        columns.push(
          <TableCell key="nature_marchandise" className="px-5 py-4 sm:px-6">
            <span className="block font-medium text-secondary-100 text-sm">
              {order.label}
            </span>
          </TableCell>
        );

        // Nature of Operations
        columns.push(
          <TableCell key="nature_of_operations" className="px-5 py-4 sm:px-6">
            <span className="block font-medium text-secondary-100 text-sm">
              {order.natureOfOperations || "-"}
            </span>
          </TableCell>
        );

        // Quantity
        columns.push(
          <TableCell key="quantity" className="px-4 py-3 text-gray-500 text-sm">
            <span className="font-medium text-secondary-100">
              {formatAmount(order.quantity).replace(".00", "")}
            </span>
          </TableCell>
        );

        // Unit
        columns.push(
          <TableCell key="unit" className="px-5 py-4 sm:px-6">
            <span className="block font-medium text-secondary-100 text-sm">
              {order.unit || "-"}
            </span>
          </TableCell>
        );

        // Unit Price
        columns.push(
          <TableCell key="unit_price" className="px-5 py-4 sm:px-6">
            {renderAmountOnly(order.unitPrice || order.unit_price || 0)}
          </TableCell>
        );

        // Total
        columns.push(
          <TableCell key="total" className="px-5 py-4 sm:px-6">
            {renderAmountOnly(order.total || 0)}
          </TableCell>
        );

        // Tax Rate
        columns.push(
          <TableCell key="tax_rate" className="px-5 py-4 sm:px-6">
            <span className="block font-medium text-secondary-100 text-sm">
              {order.taxRate || order.tax_rate}%
            </span>
          </TableCell>
        );

        // Tax Amount
        columns.push(
          <TableCell key="tax_amount" className="px-5 py-4 sm:px-6 bg-green-100 border-l-4 border-green-500 border-r-2 border-green-300 relative shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-green-200">
            <div className="absolute inset-0 bg-gradient-to-r from-green-50 via-green-100 to-green-50 opacity-60 animate-pulse"></div>
            <div className="relative z-10 font-bold text-green-900 text-center">
              <div className="bg-white bg-opacity-80 rounded px-2 py-1 shadow-sm">
                {renderAmountOnly(order.taxAmount || order.tax_amount || 0)}
              </div>
            </div>
          </TableCell>
        );

        // TTC (VAT Included)
        columns.push(
          <TableCell key="ttc" className="px-5 py-4 sm:px-6">
            {renderAmountOnly(order.vatIncluded || order.vat_included || 0)}
          </TableCell>
        );
      } else if (currentTaxCategory === "importation") {
        // IT/IC
        columns.push(
          <TableCell key="it_ic" className="px-5 py-4 sm:px-6">
            <span className="block font-medium text-secondary-100 text-sm">
              {order.itIc || "-"}
            </span>
          </TableCell>
        );

        // Nature Marchandise
        columns.push(
          <TableCell key="nature_marchandise" className="px-5 py-4 sm:px-6">
            <span className="block font-medium text-secondary-100 text-sm">
              {order.label}
            </span>
          </TableCell>
        );

        // Quantity
        columns.push(
          <TableCell key="quantity" className="px-4 py-3 text-gray-500 text-sm">
            <span className="font-medium text-secondary-100">
              {formatAmount(order.quantity).replace(".00", "")}
            </span>
          </TableCell>
        );

        // Unit
        columns.push(
          <TableCell key="unit" className="px-5 py-4 sm:px-6">
            <span className="block font-medium text-secondary-100 text-sm">
              {order.unit || "-"}
            </span>
          </TableCell>
        );

        // CIF
        columns.push(
          <TableCell key="cif" className="px-5 py-4 sm:px-6">
            {renderAmountOnly(
              (order.cif ?? order.unitPrice ?? order.unit_price ?? 0)
            )}
          </TableCell>
        );

        // Total CIF
        columns.push(
          <TableCell key="total_cif" className="px-5 py-4 sm:px-6">
            {renderAmountOnly(order.total || 0)}
          </TableCell>
        );

        // Rate
        columns.push(
          <TableCell key="rate" className="px-5 py-4 sm:px-6">
            <span className="block font-medium text-secondary-100 text-sm">
              {order.taxRate || order.tax_rate}%
            </span>
          </TableCell>
        );

        // Droit
        columns.push(
          <TableCell key="droit" className="px-5 py-4 sm:px-6 bg-green-100 border-l-4 border-green-500 border-r-2 border-green-300 relative shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-green-200">
            <div className="absolute inset-0 bg-gradient-to-r from-green-50 via-green-100 to-green-50 opacity-60 animate-pulse"></div>
            <div className="relative z-10 font-bold text-green-900 text-center">
              <div className="bg-white bg-opacity-80 rounded px-2 py-1 shadow-sm">
                {renderAmountOnly(order.taxAmount || order.tax_amount || 0)}
              </div>
            </div>
          </TableCell>
        );

        // TTC
        columns.push(
          <TableCell key="ttc" className="px-5 py-4 sm:px-6">
            {renderAmountOnly(order.vatIncluded || order.vat_included || 0)}
          </TableCell>
        );
      } else {
        // Default columns
        columns.push(
          <TableCell key="label" className="px-5 py-4 sm:px-6">
            <span className="block font-medium text-secondary-100 text-sm">
              {order.label}
            </span>
          </TableCell>,
          <TableCell key="quantity" className="px-4 py-3 text-gray-500 text-sm">
            <span className="font-medium text-secondary-100">
              {formatAmount(order.quantity).replace(".00", "")}
            </span>
          </TableCell>,
          <TableCell key="unit" className="px-5 py-4 sm:px-6">
            <span className="block font-medium text-secondary-100 text-sm">
              {order.unit || "-"}
            </span>
          </TableCell>,
          <TableCell key="currency" className="px-5 py-4 sm:px-6">
            {renderCurrencyDisplay(order.currency)}
          </TableCell>,
          <TableCell key="unitPrice" className="px-5 py-4 sm:px-6">
            {renderAmountOnly(order.unitPrice || order.unit_price || 0)}
          </TableCell>,
          <TableCell key="total" className="px-5 py-4 sm:px-6">
            {renderAmountOnly(order.total || 0)}
          </TableCell>,
          <TableCell key="taxRate" className="px-5 py-4 sm:px-6">
            <span className="block font-medium text-secondary-100 text-sm">
              {order.taxRate || order.tax_rate}%
            </span>
          </TableCell>,
          <TableCell key="taxAmount" className="px-5 py-4 sm:px-6 bg-green-100 border-l-4 border-green-500 border-r-2 border-green-300 relative shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-green-200">
            <div className="absolute inset-0 bg-gradient-to-r from-green-50 via-green-100 to-green-50 opacity-60 animate-pulse"></div>
            <div className="relative z-10 font-bold text-green-900 text-center">
              <div className="bg-white bg-opacity-80 rounded px-2 py-1 shadow-sm">
                {renderAmountOnly(order.taxAmount || order.tax_amount || 0)}
              </div>
            </div>
          </TableCell>,
          <TableCell key="vatIncluded" className="px-5 py-4 sm:px-6">
            {renderAmountOnly(order.vatIncluded || order.vat_included || 0)}
          </TableCell>
        );
      }

      return columns;
    } catch (error) {
      console.error("🚨 Error in renderDisplayOnlyColumns:", error);
      return [
        <TableCell key="sr_no" className="px-5 py-4 text-gray-500 text-sm">
          {index + 1}
        </TableCell>,
        <TableCell key="label" className="px-5 py-4 sm:px-6">
          <span className="block font-medium text-secondary-100 text-sm">
            {order.label || "Error loading"}
          </span>
        </TableCell>,
      ];
    }
  };

  // Dynamic table headers based on tax category
  const getDynamicTableHeaders = (): TableHeader[] => {
    try {
      const baseHeaders = [
        {
          content: <div>{safeTrans("sr_no", "Sr No")}</div>,
          className: "w-16",
        },
        {
          content: <div>{safeTrans("reference", "Reference")}</div>,
          className: "w-36 min-w-[140px]",
        },
        // Add Issue Date column only for local acquisition
        ...(currentTaxCategory === "location_acquisition"
          ? [
              {
                content: <div>{safeTrans("issue_date", "Issue Date")}</div>,
                className: "w-32 min-w-[120px]",
              },
            ]
          : []),
        // Add Tariff Position column only for importation
        ...(currentTaxCategory === "importation"
          ? [
              {
                content: (
                  <div>{safeTrans("tarrif_position", "Tarrif Position")}</div>
                ),
                className: "w-36 min-w-[140px]",
              },
            ]
          : []),
        {
          content: <div>{safeTrans("custom_duties", "Custom Duties")}</div>,
          className: "w-40 min-w-[160px]",
        },
      ];

      console.log("🚀 Base headers generated:", baseHeaders.length);

      if (currentTaxCategory === "location_acquisition") {
        console.log("🚀 Generating headers for location_acquisition");
        // Local acquisition columns: Ref, Issue Date, Tarrif Position, Custom Duties, Nature Marchandise, Nature of Operations, Quantity, Unit, Unit Price, Total, Rate, Tax Amount, TTC
        return [
          ...baseHeaders,
          {
            content: (
              <div>{safeTrans("nature_marchandise", "Nature Marchandise")}</div>
            ),
            className: "w-40 min-w-[160px]",
          },
          {
            content: (
              <div>
                {safeTrans("nature_of_operations", "Nature of Operations")}
              </div>
            ),
            className: "w-40 min-w-[160px]",
          },
          {
            content: (
              <div className="flex items-center gap-1">
                {t("quantity")}
                <span className="text-xs">{getSortIcon()}</span>
              </div>
            ),
            onClick: handleQuantitySort,
            className: "w-24",
          },
          {
            content: <div>{t("unit")}</div>,
            className: "w-20",
          },
          {
            content: <div>{t("unit_price")}</div>,
            className: "w-28",
          },
          {
            content: <div>{t("total_amount")}</div>,
            className: "w-24",
          },
          {
            content: <div>{t("rate")}</div>,
            className: "w-32 min-w-[120px]",
          },
          {
            content: (
              <div className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold text-center shadow-md border-2 border-green-700">
                <span>{t("tax_amount")}</span>
              </div>
            ),
            className: "w-28 bg-green-100 border-l-4 border-green-500 border-r-2 border-green-300",
          },
          {
            content: <div>{t("ttc")}</div>,
            className: "w-28",
          },
          ...(showActions
            ? [
                {
                  content: <div>{t("actions")}</div>,
                  className: "w-32 min-w-[120px]",
                },
              ]
            : []),
        ];
      } else if (currentTaxCategory === "importation") {
        // Importation columns: Ref, Tarrif Position, Custom Duties, IT/IC, Nature Marchandise, Quantity, Unit, CIF, Total CIF, Rate, Droit, TTC
        return [
          ...baseHeaders,
          {
            content: <div>{t("it_ic")}</div>,
            className: "w-20 min-w-[80px]",
          },
          {
            content: <div>{t("nature_marchandise")}</div>,
            className: "w-40 min-w-[160px]",
          },
          {
            content: (
              <div className="flex items-center gap-1">
                {t("quantity")}
                <span className="text-xs">{getSortIcon()}</span>
              </div>
            ),
            onClick: handleQuantitySort,
            className: "w-24",
          },
          {
            content: <div>{t("unit")}</div>,
            className: "w-20",
          },
          {
            content: <div>{t("cif")}</div>,
            className: "w-24",
          },
          {
            content: <div>{t("total_cif")}</div>,
            className: "w-28",
          },
          {
            content: <div>Taux</div>,
            className: "w-32 min-w-[120px]",
          },
          {
            content: (
              <div className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold text-center shadow-md border-2 border-green-700">
                <span>{t("droit")}</span>
              </div>
            ),
            className: "w-24 bg-green-100 border-l-4 border-green-500 border-r-2 border-green-300",
          },
          {
            content: <div>{t("ttc")}</div>,
            className: "w-28",
          },
          ...(showActions
            ? [
                {
                  content: <div>{t("actions")}</div>,
                  className: "w-32 min-w-[120px]",
                },
              ]
            : []),
        ];
      }

      // Default fallback (same as original structure but with reference)
      console.log("🚀 Generating default headers");
      return [
        ...baseHeaders,
        {
          content: <div>{safeTrans("label", "Label")}</div>,
          className: "w-40 min-w-[160px]",
        },
        {
          content: (
            <div className="flex items-center gap-1">
              {safeTrans("quantity", "Quantity")}
              <span className="text-xs">{getSortIcon()}</span>
            </div>
          ),
          onClick: handleQuantitySort,
          className: "w-24",
        },
        {
          content: <div>{safeTrans("unit", "Unit")}</div>,
          className: "w-20",
        },
        {
          content: <div>{safeTrans("currency", "Currency")}</div>,
          className: "w-24",
        },
        {
          content: <div>{safeTrans("unit_price", "Unit Price")}</div>,
          className: "w-28",
        },
        {
          content: <div>{safeTrans("total", "Total")}</div>,
          className: "w-24",
        },
        {
          content: <div>{safeTrans("tax_rate", "Tax Rate")}</div>,
          className: "w-32 min-w-[120px]",
        },
        {
          content: (
            <div className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold text-center shadow-md border-2 border-green-700">
              <span>{safeTrans("tax_amount", "Tax Amount")}</span>
            </div>
          ),
          className: "w-28 bg-green-100 border-l-4 border-green-500 border-r-2 border-green-300",
        },
        {
          content: <div>{safeTrans("vat_included", "VAT Included")}</div>,
          className: "w-28",
        },
        ...(showActions
          ? [
              {
                content: <div>{safeTrans("actions", "Actions")}</div>,
                className: "w-32 min-w-[120px]",
              },
            ]
          : []),
      ];
    } catch (error) {
      console.error("🚨 Error in getDynamicTableHeaders:", error);
      // Return basic headers as fallback
      return [
        {
          content: <div>Sr No</div>,
          className: "w-16",
        },
        {
          content: <div>Label</div>,
          className: "w-40",
        },
      ];
    }
  };

  let tableHeader: TableHeader[] = [];
  try {
    tableHeader = getDynamicTableHeaders();
    console.log("🚀 Table headers generated successfully:", tableHeader.length);
  } catch (error) {
    console.error("🚨 Failed to generate table headers:", error);
    tableHeader = [
      {
        content: <div>Error Loading</div>,
        className: "w-full",
      },
    ];
  }

  try {
    return (
      <>
        <div className="relative rounded-lg border border-secondary-30 bg-white">
          {/* Add Entity Button - only show if showAddButton is true */}
          {showAddButton && (
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Entities</h3>
              <Button
                variant="primary"
                className="flex items-center w-full md:w-fit gap-2 py-2 mt-4 justify-center"
                onClick={handleAddEntity}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <Typography>{t("add_entity")}</Typography>
              </Button>
            </div>
          )}

          <div className="relative min-h-[200px] max-h-[400px] overflow-x-auto overflow-y-auto">
            <Table className="min-w-[1200px]">
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
                {tableData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={tableHeader.length}
                      className="px-5 py-8 text-center text-gray-500"
                    >
                      {t("no_entities_added_yet_click_add_entity_to_get_started")}
                    </TableCell>
                  </TableRow>
                ) : (
                  tableData.map((order, index) => {
                    try {
                      return (
                        <TableRow key={order.id}>
                          {renderDisplayOnlyColumns(order, index)}
                          {showActions && (
                            <TableCell className="px-2 py-3 text-gray-500 text-sm min-w-[120px]">
                              <div
                                className="relative"
                                ref={openMenuId === order.id ? menuRef : null}
                              >
                                <button
                                  onClick={(
                                    e: React.MouseEvent<HTMLButtonElement>
                                  ) => {
                                    e.stopPropagation();
                                    handleMenuToggle(order.id, e);
                                  }}
                                  className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                  aria-label="Open actions menu"
                                  aria-haspopup="true"
                                  aria-expanded={openMenuId === order.id}
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                </button>
                                {openMenuId === order.id && (
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
                                        handleEditEntity(order);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                      role="menuitem"
                                      aria-label="Edit row"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={(
                                        e: React.MouseEvent<HTMLButtonElement>
                                      ) => {
                                        e.stopPropagation();
                                        handleDelete(order.id);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 transition-colors"
                                      role="menuitem"
                                      aria-label="Delete row"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    } catch (rowError) {
                      console.error(
                        "🚨 Error rendering table row:",
                        order.id,
                        rowError
                      );
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="px-5 py-4 text-red-500 text-sm">
                            Error loading row {order.id}
                          </TableCell>
                        </TableRow>
                      );
                    }
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Entity Form Modal */}
        <EntityFormModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          initialData={modalData}
          currentTaxCategory={currentTaxCategory || ""}
          mode={modalMode}
        />
      </>
    );
  } catch (renderError) {
    console.error(
      "🚨 Critical error in CreateRequestTable render:",
      renderError
    );
    return (
      <div className="relative rounded-lg border border-red-300 bg-red-50 p-4">
        <h3 className="text-red-800 font-bold">Table Rendering Error</h3>
        <p className="text-red-600">
          There was an error rendering the table. Please check the console for
          details.
        </p>
        <p className="text-sm text-red-500 mt-2">
          Tax Category: {currentTaxCategory}
        </p>
      </div>
    );
  }
};

export default CreateRequestTable;
