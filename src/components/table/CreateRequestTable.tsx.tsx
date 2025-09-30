import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import Typography from "../../lib/components/atoms/Typography";
import { CrossRedIcon, RightGreenIcon, USFlag, CDFFlag } from "../../icons";
import { formatAmount } from "../../utils/numberFormat";

// Debug: Verify file is loading
console.log("🚀 CreateRequestTable.tsx loaded at:", new Date().toISOString());

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

export interface Order {
  id: number;
  reference?: string; // Add reference field for new Reference column
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
  tarrifPosition?: string;
  droit?: number;
}

type SortOrder = "asc" | "desc" | null;

const CreateRequestTable = ({
  data,
  onDataChange,
  // isEditable=true,
  showActions = true,
  autoEditId,
  onEditComplete,
  currentTaxCategory,
}: {
  data: Order[];
  onDataChange?: (newData: Order[]) => void;
  isEditable?: boolean;
  showActions?: boolean;
  autoEditId?: number | null;
  onEditComplete?: () => void;
  currentTaxCategory?: string;
}) => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState<Order[]>(data);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Order>>({});
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

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

  // Auto-enter edit mode for newly added entity
  useEffect(() => {
    if (autoEditId && !editingId) {
      const newEntity = tableData.find((order) => order.id === autoEditId);
      if (newEntity) {
        setEditingId(autoEditId);
        setEditFormData({ ...newEntity });
      }
    }
  }, [autoEditId, tableData, editingId]);
  const calculateTaxAndVat = (formData: Partial<Order>) => {
    const quantity = formData.quantity || 0;
    const unitPrice = formData.unitPrice || 0;
    const taxRate = formData.taxRate || 0;
    const total = quantity * unitPrice;
    const taxAmount = total * (taxRate / 100);
    const vatIncluded = total + taxAmount;

    return { total, taxAmount: Math.round(taxAmount * 100) / 100, vatIncluded };
  };

  const handleIncrement = (orderId: number) => {
    setTableData((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const newQuantity = Math.min(order.quantity + 1, 100);
          const total = newQuantity * order.unitPrice;
          const taxAmount = total * (order.taxRate / 100);
          const vatIncluded = total + taxAmount;
          return {
            ...order,
            quantity: newQuantity,
            total,
            taxAmount,
            vatIncluded,
          };
        }
        return order;
      })
    );

    if (editingId === orderId) {
      setEditFormData((prev) => {
        const newQuantity = Math.min((prev.quantity || 1) + 1, 100);
        const { total, taxAmount, vatIncluded } = calculateTaxAndVat({
          ...prev,
          quantity: newQuantity,
        });
        return {
          ...prev,
          quantity: newQuantity,
          total,
          taxAmount,
          vatIncluded,
        };
      });
    }
  };

  const handleDecrement = (orderId: number) => {
    setTableData((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const newQuantity = Math.max(order.quantity - 1, 1);
          const total = newQuantity * order.unitPrice;
          const taxAmount = total * (order.taxRate / 100);
          const vatIncluded = total + taxAmount;
          return {
            ...order,
            quantity: newQuantity,
            total,
            taxAmount,
            vatIncluded,
          };
        }
        return order;
      })
    );

    if (editingId === orderId) {
      setEditFormData((prev) => {
        const newQuantity = Math.max((prev.quantity || 1) - 1, 1);
        const { total, taxAmount, vatIncluded } = calculateTaxAndVat({
          ...prev,
          quantity: newQuantity,
        });
        return {
          ...prev,
          quantity: newQuantity,
          total,
          taxAmount,
          vatIncluded,
        };
      });
    }
  };

  const handleMenuToggle = (orderId: number) => {
    setOpenMenuId(openMenuId === orderId ? null : orderId);
  };

  const handleEdit = (order: Order) => {
    setEditingId(order.id);
    setEditFormData({ ...order });
    setOpenMenuId(null);
  };

  const handleSaveEdit = (orderId: number) => {
    // Debug: Log edit form data before save
    console.log("🚀 Edit form data before save:", editFormData);

    // Validation: Check if all required fields are filled
    const isLabelValid = editFormData.label && editFormData.label.trim() !== "";
    const isQuantityValid = editFormData.quantity && editFormData.quantity > 0;
    const isUnitPriceValid =
      editFormData.unitPrice !== undefined && editFormData.unitPrice > 0;
    const isTaxRateValid =
      editFormData.taxRate !== undefined &&
      editFormData.taxRate >= 0 &&
      isValidTaxRate(editFormData.taxRate, editFormData.customDuty);
    const isCustomDutyValid =
      editFormData.customDuty && editFormData.customDuty.trim() !== "";

    // Dynamic error messages based on tax category
    let priceFieldLabel = "Unit Price";
    if (currentTaxCategory === "importation") {
      priceFieldLabel = "CIF";
    }

    if (!isCustomDutyValid) {
      alert("Custom Duty selection is required.");
      return;
    }
    if (!isLabelValid) {
      alert("Nature Marchandise is required and cannot be empty.");
      return;
    }
    if (!isQuantityValid) {
      alert("Quantity is required and must be greater than 0.");
      return;
    }
    if (!isUnitPriceValid) {
      alert(`${priceFieldLabel} is required and must be greater than 0.`);
      return;
    }
    if (!isTaxRateValid) {
      const constraints = getTaxRateConstraints(editFormData.customDuty);
      const constraintText =
        constraints.fixed !== null
          ? `exactly ${constraints.fixed}%`
          : `between ${constraints.min}% and ${constraints.max}%`;
      alert(`Tax Rate must be ${constraintText} for the selected custom duty.`);
      return;
    }

    setTableData((prev) => {
      const newData = prev.map((order) => {
        if (order.id === orderId) {
          const { total, taxAmount, vatIncluded } =
            calculateTaxAndVat(editFormData);
          const updatedOrder = {
            ...order,
            reference: editFormData.reference || order.reference,
            label: editFormData.label || order.label,
            quantity: editFormData.quantity || order.quantity,
            unitPrice: editFormData.unitPrice ?? order.unitPrice,
            unit: editFormData.unit || order.unit,
            total,
            taxRate: editFormData.taxRate ?? order.taxRate,
            taxAmount,
            vatIncluded,
            customDuty: editFormData.customDuty || order.customDuty,
          };
          console.log("🚀 Updated order after save:", updatedOrder);
          return updatedOrder;
        }
        return order;
      });
      console.log("🚀 New table data after save:", newData);
      onDataChange?.(newData); // Notify parent of changes
      return newData;
    });

    setEditingId(null);
    setEditFormData({});
    onEditComplete?.();
  };

  const handleCancelEdit = () => {
    // If we're canceling the edit of a newly added entity (autoEditId), remove it from the table
    if (editingId === autoEditId && autoEditId) {
      // Check if the entity is essentially empty (no meaningful data entered)
      const isEmptyEntity =
        (!editFormData.label || editFormData.label.trim() === "") &&
        (!editFormData.unitPrice || editFormData.unitPrice === 0) &&
        (!editFormData.taxRate || editFormData.taxRate === 0) &&
        (!editFormData.customDuty || editFormData.customDuty.trim() === "");

      if (isEmptyEntity) {
        // Remove the empty entity from the table
        setTableData((prev) => prev.filter((order) => order.id !== autoEditId));
        onDataChange?.(tableData.filter((order) => order.id !== autoEditId));
      }
    }

    setEditingId(null);
    setEditFormData({});
    onEditComplete?.();
  };

  const handleDelete = (orderId: number) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setTableData((prev) => prev.filter((order) => order.id !== orderId));
      onDataChange?.(tableData.filter((order) => order.id !== orderId));
    }
    setOpenMenuId(null);
  };

  const handleInputChange = (field: keyof Order, value: string | number) => {
    // Debug: Log ALL input changes
    console.log("🚀 handleInputChange called:", {
      field,
      value,
      currentEditFormData: editFormData,
    });

    let parsedValue: string | number = value;
    if (
      [
        "quantity",
        "unitPrice",
        "taxRate",
        "total",
        "taxAmount",
        "vatIncluded",
        "cif",
        "totalCif",
        "droit",
      ].includes(field)
    ) {
      parsedValue = value === "" ? 0 : parseFloat(value as string);
      if (isNaN(parsedValue)) parsedValue = 0;
    }

    setEditFormData((prev) => {
      const updatedFormData = { ...prev, [field]: parsedValue };
      const { total, taxAmount, vatIncluded } =
        calculateTaxAndVat(updatedFormData);
      const finalFormData = {
        ...updatedFormData,
        total,
        taxAmount,
        vatIncluded,
      };

      // Debug: Log updated form data
      console.log("🚀 Final form data after change:", { field, finalFormData });

      return finalFormData;
    });
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

  // Tax rate validation based on custom duty selection
  const getTaxRateConstraints = (customDuty: string | undefined) => {
    if (!customDuty) return { min: 1, max: 100, fixed: null };

    switch (customDuty) {
      case "TVA":
        return { min: 16, max: 16, fixed: 16 }; // Fixed at 16%
      case "TVA à l'importation":
        return { min: 16, max: 16, fixed: 16 }; // Fixed at 16%
      case "Droits de douane":
      case "Taxes DGRAD à l'importation":
      default:
        return { min: 1, max: 100, fixed: null }; // Between 1% to 100%
    }
  };

  // Validate tax rate based on custom duty selection
  const isValidTaxRate = (taxRate: number, customDuty: string | undefined) => {
    const constraints = getTaxRateConstraints(customDuty);
    if (constraints.fixed !== null) {
      return taxRate === constraints.fixed;
    }
    return taxRate >= constraints.min && taxRate <= constraints.max;
  };

  // Get tax rate placeholder text
  const getTaxRatePlaceholder = (customDuty: string | undefined) => {
    const constraints = getTaxRateConstraints(customDuty);
    if (constraints.fixed !== null) {
      return `${constraints.fixed}% (Fixed)`;
    }
    return `${constraints.min}%-${constraints.max}%`;
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

  // Helper function to render dynamic columns based on tax category
  const renderDynamicColumns = (order: Order, index: number) => {
    const columns = [];

    // Always include SR No, Reference, and Custom Duties first
    columns.push(
      <TableCell key="sr_no" className="px-5 py-4 text-gray-500 text-sm">
        {index + 1}
      </TableCell>
    );

    columns.push(
      <TableCell key="reference" className="px-5 py-4 sm:px-6">
        {editingId === order.id ? (
          <div className="flex flex-col gap-1">
            <input
              type="text"
              value={editFormData.reference ?? ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange("reference", e.target.value)
              }
              className="block w-full px-2 py-1 text-sm rounded-md focus:border focus:outline-none bg-secondary-10 border-secondary-30"
              placeholder="Add Reference"
              aria-label="Reference"
            />
          </div>
        ) : (
          <span className="block font-medium text-secondary-100 text-sm">
            {order.reference || "-"}
          </span>
        )}
      </TableCell>
    );

    columns.push(
      <TableCell key="custom_duty" className="px-5 py-4 sm:px-6">
        {editingId === order.id ? (
          <div className="flex flex-col gap-1">
            <select
              value={editFormData.customDuty ?? ""}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                const newCustomDuty = e.target.value;
                handleInputChange("customDuty", newCustomDuty);

                // Auto-set tax rate if TVA is selected
                const constraints = getTaxRateConstraints(newCustomDuty);
                if (constraints.fixed !== null) {
                  handleInputChange("taxRate", constraints.fixed);
                }
              }}
              className={`px-2 py-1 text-sm border rounded-md bg-white ${
                editFormData.customDuty && editFormData.customDuty.trim() !== ""
                  ? "border-gray-300"
                  : "border-red-500"
              }`}
              aria-label="Custom Duty"
            >
              <option value="">Select Custom Duty *</option>
              {getCustomDutyOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span className="block font-medium text-secondary-100 text-sm">
            {(() => {
              // Try multiple field variations to find custom duty value
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
        )}
      </TableCell>
    );

    if (currentTaxCategory === "location_acquisition") {
      // Local acquisition columns: Nature Marchandise, Quantity, Unit, Unit Price, Total, Tax Rate, Tax Amount, TTC

      // Nature Marchandise
      columns.push(
        <TableCell key="nature_marchandise" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="flex flex-col gap-1">
              <input
                type="text"
                value={editFormData.label ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("label", e.target.value)
                }
                disabled={!editFormData.customDuty}
                className={`block w-full px-2 py-1 text-sm rounded-md focus:border focus:outline-none ${
                  !editFormData.customDuty
                    ? "bg-gray-100 cursor-not-allowed border-gray-200 text-gray-400"
                    : editFormData.label && editFormData.label.trim() !== ""
                    ? "bg-secondary-10 border-secondary-30"
                    : "bg-secondary-10 border-red-500"
                }`}
                placeholder={
                  editFormData.customDuty
                    ? "Add Nature Marchandise *"
                    : "Select Custom Duty first"
                }
                aria-label="Nature Marchandise"
              />
            </div>
          ) : (
            <span className="block font-medium text-secondary-100 text-sm">
              {order.label}
            </span>
          )}
        </TableCell>
      );

      // Quantity
      columns.push(
        <TableCell key="quantity" className="px-4 py-3 text-gray-500 text-sm">
          {editingId === order.id ? (
            <div
              className={`flex items-center border rounded-md overflow-hidden ${
                !editFormData.customDuty
                  ? "border-gray-200 bg-gray-100"
                  : "border-secondary-30"
              }`}
            >
              <button
                onClick={() => handleDecrement(order.id)}
                disabled={!editFormData.customDuty}
                className={`w-8 h-8 flex items-center justify-center border-r transition-colors focus:outline-none ${
                  !editFormData.customDuty
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200"
                    : "bg-white text-secondary-50 border-secondary-30 hover:bg-gray-100"
                }`}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <div
                className={`w-12 text-center font-medium px-2 py-1 text-sm ${
                  !editFormData.customDuty
                    ? "bg-gray-100 text-gray-400"
                    : "bg-secondary-10 text-secondary-100"
                }`}
              >
                {editFormData.quantity ?? order.quantity}
              </div>
              <button
                onClick={() => handleIncrement(order.id)}
                disabled={!editFormData.customDuty}
                className={`w-8 h-8 flex items-center justify-center border-l transition-colors focus:outline-none ${
                  !editFormData.customDuty
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200"
                    : "bg-white text-secondary-50 border-secondary-30 hover:bg-gray-100"
                }`}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          ) : (
            <span className="font-medium text-secondary-100">
              {order.quantity}
            </span>
          )}
        </TableCell>
      );

      // Unit
      columns.push(
        <TableCell key="unit" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="flex flex-col gap-1 relative">
              <select
                value={editFormData.unit ?? ""}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  handleInputChange("unit", e.target.value);
                }}
                disabled={!editFormData.customDuty}
                className={`block w-full min-w-[120px] px-3 py-2 text-sm border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none ${
                  !editFormData.customDuty
                    ? "bg-gray-100 cursor-not-allowed border-gray-300 text-gray-400"
                    : "border-gray-300 text-gray-900 hover:border-gray-400"
                }`}
                style={{
                  backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23666" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>')`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                  backgroundSize: "12px",
                  paddingRight: "32px",
                }}
                aria-label="Unit"
              >
                <option value="" className="text-gray-500">
                  {t("select_unit")}
                </option>
                <option value="Unité" className="text-gray-900">
                  Unité
                </option>
                <option value="kilogramme" className="text-gray-900">
                  kilogramme
                </option>
                <option value="mètre" className="text-gray-900">
                  mètre
                </option>
                <option value="litre" className="text-gray-900">
                  litre
                </option>
              </select>
            </div>
          ) : (
            <span className="block font-medium text-secondary-100 text-sm">
              {order.unit || "-"}
            </span>
          )}
        </TableCell>
      );

      // Unit Price
      columns.push(
        <TableCell key="unit_price" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="flex flex-col gap-1">
              <input
                type="text"
                value={editFormData.unitPrice ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("unitPrice", e.target.value)
                }
                disabled={!editFormData.customDuty}
                className={`block w-full px-2 py-1 text-sm rounded-md focus:border focus:outline-none ${
                  !editFormData.customDuty
                    ? "bg-gray-100 cursor-not-allowed border-gray-200 text-gray-400"
                    : editFormData.unitPrice !== undefined &&
                      editFormData.unitPrice >= 0
                    ? "bg-secondary-10 border-secondary-30"
                    : "bg-secondary-10 border-red-500"
                }`}
                placeholder={
                  editFormData.customDuty
                    ? "Add Price *"
                    : "Select Custom Duty first"
                }
                aria-label="Unit Price"
              />
            </div>
          ) : (
            renderAmountOnly(order.unitPrice || order.unit_price || 0)
          )}
        </TableCell>
      );

      // Total
      columns.push(
        <TableCell key="total" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="bg-secondary-10 border border-dotted border-secondary-30 w-full cursor-not-allowed">
              <Typography
                size="sm"
                weight="normal"
                className="text-secondary-30"
              >
                Not-allowed
              </Typography>
            </div>
          ) : (
            renderAmountOnly(order.total || 0)
          )}
        </TableCell>
      );

      // Tax Rate
      columns.push(
        <TableCell key="tax_rate" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="flex flex-col gap-1">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={editFormData.taxRate ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const constraints = getTaxRateConstraints(
                    editFormData.customDuty
                  );

                  // Validate against constraints
                  if (constraints.fixed !== null) {
                    // For fixed rate (TVA), don't allow manual entry but show the fixed value
                    return;
                  } else {
                    // For range validation, allow entry but validate
                    handleInputChange("taxRate", e.target.value);
                  }
                }}
                disabled={
                  !editFormData.customDuty ||
                  getTaxRateConstraints(editFormData.customDuty).fixed !== null
                }
                className={`block w-full px-2 py-1 text-sm rounded-md focus:border focus:outline-none ${
                  !editFormData.customDuty
                    ? "bg-gray-100 cursor-not-allowed border-gray-200 text-gray-400"
                    : getTaxRateConstraints(editFormData.customDuty).fixed !==
                      null
                    ? "bg-gray-100 cursor-not-allowed border-gray-300 text-gray-600"
                    : editFormData.taxRate !== undefined &&
                      isValidTaxRate(
                        editFormData.taxRate,
                        editFormData.customDuty
                      )
                    ? "bg-secondary-10 border-secondary-30"
                    : "bg-secondary-10 border-red-500"
                }`}
                placeholder={
                  !editFormData.customDuty
                    ? "Select Custom Duty first"
                    : getTaxRatePlaceholder(editFormData.customDuty)
                }
                aria-label="Tax Rate"
                title={
                  !editFormData.customDuty
                    ? "Select Custom Duty first"
                    : `Tax rate constraints: ${getTaxRatePlaceholder(
                        editFormData.customDuty
                      )}`
                }
              />
              {editFormData.customDuty &&
                editFormData.taxRate !== undefined &&
                !isValidTaxRate(
                  editFormData.taxRate,
                  editFormData.customDuty
                ) && (
                  <span className="text-xs text-red-500">
                    Rate must be{" "}
                    {getTaxRatePlaceholder(editFormData.customDuty)}
                  </span>
                )}
            </div>
          ) : (
            <span className="block font-medium text-secondary-100 text-sm">
              {order.taxRate || order.tax_rate}%
            </span>
          )}
        </TableCell>
      );

      // Tax Amount
      columns.push(
        <TableCell key="tax_amount" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="bg-secondary-10 border border-dotted border-secondary-30 w-full cursor-not-allowed">
              <Typography
                size="sm"
                weight="normal"
                className="text-secondary-30"
              >
                Not-allowed
              </Typography>
            </div>
          ) : (
            renderAmountOnly(order.taxAmount || order.tax_amount || 0)
          )}
        </TableCell>
      );

      // TTC (VAT Included)
      columns.push(
        <TableCell key="ttc" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="bg-secondary-10 border border-dotted border-secondary-30 w-full cursor-not-allowed">
              <Typography
                size="sm"
                weight="normal"
                className="text-secondary-30"
              >
                Not-allowed
              </Typography>
            </div>
          ) : (
            renderAmountOnly(order.vatIncluded || order.vat_included || 0)
          )}
        </TableCell>
      );
    } else if (currentTaxCategory === "importation") {
      // Importation columns: Nature Marchandise, Quantity, Unit, CIF, Total CIF, Tarrif Position, Droit, TTC

      // Nature Marchandise
      columns.push(
        <TableCell key="nature_marchandise" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="flex flex-col gap-1">
              <input
                type="text"
                value={editFormData.label ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("label", e.target.value)
                }
                disabled={!editFormData.customDuty}
                className={`block w-full px-2 py-1 text-sm rounded-md focus:border focus:outline-none ${
                  !editFormData.customDuty
                    ? "bg-gray-100 cursor-not-allowed border-gray-200 text-gray-400"
                    : editFormData.label && editFormData.label.trim() !== ""
                    ? "bg-secondary-10 border-secondary-30"
                    : "bg-secondary-10 border-red-500"
                }`}
                placeholder={
                  editFormData.customDuty
                    ? "Add Nature Marchandise *"
                    : "Select Custom Duty first"
                }
                aria-label="Nature Marchandise"
              />
            </div>
          ) : (
            <span className="block font-medium text-secondary-100 text-sm">
              {order.label}
            </span>
          )}
        </TableCell>
      );

      // Quantity (same as local acquisition)
      columns.push(
        <TableCell key="quantity" className="px-4 py-3 text-gray-500 text-sm">
          {editingId === order.id ? (
            <div
              className={`flex items-center border rounded-md overflow-hidden ${
                !editFormData.customDuty
                  ? "border-gray-200 bg-gray-100"
                  : "border-secondary-30"
              }`}
            >
              <button
                onClick={() => handleDecrement(order.id)}
                disabled={!editFormData.customDuty}
                className={`w-8 h-8 flex items-center justify-center border-r transition-colors focus:outline-none ${
                  !editFormData.customDuty
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200"
                    : "bg-white text-secondary-50 border-secondary-30 hover:bg-gray-100"
                }`}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <div
                className={`w-12 text-center font-medium px-2 py-1 text-sm ${
                  !editFormData.customDuty
                    ? "bg-gray-100 text-gray-400"
                    : "bg-secondary-10 text-secondary-100"
                }`}
              >
                {editFormData.quantity ?? order.quantity}
              </div>
              <button
                onClick={() => handleIncrement(order.id)}
                disabled={!editFormData.customDuty}
                className={`w-8 h-8 flex items-center justify-center border-l transition-colors focus:outline-none ${
                  !editFormData.customDuty
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200"
                    : "bg-white text-secondary-50 border-secondary-30 hover:bg-gray-100"
                }`}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          ) : (
            <span className="font-medium text-secondary-100">
              {order.quantity}
            </span>
          )}
        </TableCell>
      );

      // Unit (same as local acquisition)
      columns.push(
        <TableCell key="unit" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="flex flex-col gap-1 relative">
              <select
                value={editFormData.unit ?? ""}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  handleInputChange("unit", e.target.value);
                }}
                disabled={!editFormData.customDuty}
                className={`block w-full min-w-[120px] px-3 py-2 text-sm border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none ${
                  !editFormData.customDuty
                    ? "bg-gray-100 cursor-not-allowed border-gray-300 text-gray-400"
                    : "border-gray-300 text-gray-900 hover:border-gray-400"
                }`}
                style={{
                  backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23666" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>')`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                  backgroundSize: "12px",
                  paddingRight: "32px",
                }}
                aria-label="Unit"
              >
                <option value="" className="text-gray-500">
                  {t("select_unit")}
                </option>
                <option value="Unité" className="text-gray-900">
                  Unité
                </option>
                <option value="kilogramme" className="text-gray-900">
                  kilogramme
                </option>
                <option value="mètre" className="text-gray-900">
                  mètre
                </option>
                <option value="litre" className="text-gray-900">
                  litre
                </option>
              </select>
            </div>
          ) : (
            <span className="block font-medium text-secondary-100 text-sm">
              {order.unit || "-"}
            </span>
          )}
        </TableCell>
      );

      // CIF (using unitPrice field for backend compatibility)
      columns.push(
        <TableCell key="cif" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="flex flex-col gap-1">
              <input
                type="text"
                value={editFormData.unitPrice ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("unitPrice", e.target.value)
                }
                disabled={!editFormData.customDuty}
                className={`block w-full px-2 py-1 text-sm rounded-md focus:border focus:outline-none ${
                  !editFormData.customDuty
                    ? "bg-gray-100 cursor-not-allowed border-gray-200 text-gray-400"
                    : editFormData.unitPrice !== undefined &&
                      editFormData.unitPrice >= 0
                    ? "bg-secondary-10 border-secondary-30"
                    : "bg-secondary-10 border-red-500"
                }`}
                placeholder={
                  editFormData.customDuty
                    ? "Add CIF *"
                    : "Select Custom Duty first"
                }
                aria-label="CIF"
              />
            </div>
          ) : (
            renderAmountOnly(order.unitPrice || order.unit_price || 0)
          )}
        </TableCell>
      );

      // Total CIF (using total field)
      columns.push(
        <TableCell key="total_cif" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="bg-secondary-10 border border-dotted border-secondary-30 w-full cursor-not-allowed">
              <Typography
                size="sm"
                weight="normal"
                className="text-secondary-30"
              >
                Not-allowed
              </Typography>
            </div>
          ) : (
            renderAmountOnly(order.total || 0)
          )}
        </TableCell>
      );

      // Tarrif Position (using taxRate field for backend compatibility)
      columns.push(
        <TableCell key="tarrif_position" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="flex flex-col gap-1">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={editFormData.taxRate ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const constraints = getTaxRateConstraints(
                    editFormData.customDuty
                  );

                  // Validate against constraints
                  if (constraints.fixed !== null) {
                    // For fixed rate (TVA), don't allow manual entry but show the fixed value
                    return;
                  } else {
                    // For range validation, allow entry but validate
                    handleInputChange("taxRate", e.target.value);
                  }
                }}
                disabled={
                  !editFormData.customDuty ||
                  getTaxRateConstraints(editFormData.customDuty).fixed !== null
                }
                className={`block w-full px-2 py-1 text-sm rounded-md focus:border focus:outline-none ${
                  !editFormData.customDuty
                    ? "bg-gray-100 cursor-not-allowed border-gray-200 text-gray-400"
                    : getTaxRateConstraints(editFormData.customDuty).fixed !==
                      null
                    ? "bg-gray-100 cursor-not-allowed border-gray-300 text-gray-600"
                    : editFormData.taxRate !== undefined &&
                      isValidTaxRate(
                        editFormData.taxRate,
                        editFormData.customDuty
                      )
                    ? "bg-secondary-10 border-secondary-30"
                    : "bg-secondary-10 border-red-500"
                }`}
                placeholder={
                  !editFormData.customDuty
                    ? "Select Custom Duty first"
                    : getTaxRatePlaceholder(editFormData.customDuty)
                }
                aria-label="Tariff Position"
                title={
                  !editFormData.customDuty
                    ? "Select Custom Duty first"
                    : `Tax rate constraints: ${getTaxRatePlaceholder(
                        editFormData.customDuty
                      )}`
                }
              />
              {editFormData.customDuty &&
                editFormData.taxRate !== undefined &&
                !isValidTaxRate(
                  editFormData.taxRate,
                  editFormData.customDuty
                ) && (
                  <span className="text-xs text-red-500">
                    Rate must be{" "}
                    {getTaxRatePlaceholder(editFormData.customDuty)}
                  </span>
                )}
            </div>
          ) : (
            <span className="block font-medium text-secondary-100 text-sm">
              {order.taxRate || order.tax_rate}%
            </span>
          )}
        </TableCell>
      );

      // Droit (using taxAmount field)
      columns.push(
        <TableCell key="droit" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="bg-secondary-10 border border-dotted border-secondary-30 w-full cursor-not-allowed">
              <Typography
                size="sm"
                weight="normal"
                className="text-secondary-30"
              >
                Not-allowed
              </Typography>
            </div>
          ) : (
            renderAmountOnly(order.taxAmount || order.tax_amount || 0)
          )}
        </TableCell>
      );

      // TTC (VAT Included)
      columns.push(
        <TableCell key="ttc" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="bg-secondary-10 border border-dotted border-secondary-30 w-full cursor-not-allowed">
              <Typography
                size="sm"
                weight="normal"
                className="text-secondary-30"
              >
                Not-allowed
              </Typography>
            </div>
          ) : (
            renderAmountOnly(order.vatIncluded || order.vat_included || 0)
          )}
        </TableCell>
      );
    } else {
      // Default fallback (same as original structure but with reference)
      columns.push(
        <TableCell key="label" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="flex flex-col gap-1">
              <input
                type="text"
                value={editFormData.label ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("label", e.target.value)
                }
                disabled={!editFormData.customDuty}
                className={`block w-full px-2 py-1 text-sm rounded-md focus:border focus:outline-none ${
                  !editFormData.customDuty
                    ? "bg-gray-100 cursor-not-allowed border-gray-200 text-gray-400"
                    : editFormData.label && editFormData.label.trim() !== ""
                    ? "bg-secondary-10 border-secondary-30"
                    : "bg-secondary-10 border-red-500"
                }`}
                placeholder={
                  editFormData.customDuty
                    ? "Add Label *"
                    : "Select Custom Duty first"
                }
                aria-label="Label"
              />
            </div>
          ) : (
            <span className="block font-medium text-secondary-100 text-sm">
              {order.label}
            </span>
          )}
        </TableCell>,

        // Add all other default columns (quantity, unit, currency, unitPrice, total, taxRate, taxAmount, vatIncluded)
        <TableCell key="quantity" className="px-4 py-3 text-gray-500 text-sm">
          {editingId === order.id ? (
            <div
              className={`flex items-center border rounded-md overflow-hidden ${
                !editFormData.customDuty
                  ? "border-gray-200 bg-gray-100"
                  : "border-secondary-30"
              }`}
            >
              <button
                onClick={() => handleDecrement(order.id)}
                disabled={!editFormData.customDuty}
                className={`w-8 h-8 flex items-center justify-center border-r transition-colors focus:outline-none ${
                  !editFormData.customDuty
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200"
                    : "bg-white text-secondary-50 border-secondary-30 hover:bg-gray-100"
                }`}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <div
                className={`w-12 text-center font-medium px-2 py-1 text-sm ${
                  !editFormData.customDuty
                    ? "bg-gray-100 text-gray-400"
                    : "bg-secondary-10 text-secondary-100"
                }`}
              >
                {editFormData.quantity ?? order.quantity}
              </div>
              <button
                onClick={() => handleIncrement(order.id)}
                disabled={!editFormData.customDuty}
                className={`w-8 h-8 flex items-center justify-center border-l transition-colors focus:outline-none ${
                  !editFormData.customDuty
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200"
                    : "bg-white text-secondary-50 border-secondary-30 hover:bg-gray-100"
                }`}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          ) : (
            <span className="font-medium text-secondary-100">
              {order.quantity}
            </span>
          )}
        </TableCell>,

        <TableCell key="unit" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="flex flex-col gap-1 relative">
              <select
                value={editFormData.unit ?? ""}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  handleInputChange("unit", e.target.value);
                }}
                disabled={!editFormData.customDuty}
                className={`block w-full min-w-[120px] px-3 py-2 text-sm border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none ${
                  !editFormData.customDuty
                    ? "bg-gray-100 cursor-not-allowed border-gray-300 text-gray-400"
                    : "border-gray-300 text-gray-900 hover:border-gray-400"
                }`}
                style={{
                  backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23666" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>')`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                  backgroundSize: "12px",
                  paddingRight: "32px",
                }}
                aria-label="Unit"
              >
                <option value="" className="text-gray-500">
                  {t("select_unit")}
                </option>
                <option value="Unité" className="text-gray-900">
                  Unité
                </option>
                <option value="kilogramme" className="text-gray-900">
                  kilogramme
                </option>
                <option value="mètre" className="text-gray-900">
                  mètre
                </option>
                <option value="litre" className="text-gray-900">
                  litre
                </option>
              </select>
            </div>
          ) : (
            <span className="block font-medium text-secondary-100 text-sm">
              {order.unit || "-"}
            </span>
          )}
        </TableCell>,

        <TableCell key="currency" className="px-5 py-4 sm:px-6">
          {renderCurrencyDisplay(order.currency)}
        </TableCell>,

        <TableCell key="unitPrice" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="flex flex-col gap-1">
              <input
                type="text"
                value={editFormData.unitPrice ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("unitPrice", e.target.value)
                }
                disabled={!editFormData.customDuty}
                className={`block w-full px-2 py-1 text-sm rounded-md focus:border focus:outline-none ${
                  !editFormData.customDuty
                    ? "bg-gray-100 cursor-not-allowed border-gray-200 text-gray-400"
                    : editFormData.unitPrice !== undefined &&
                      editFormData.unitPrice >= 0
                    ? "bg-secondary-10 border-secondary-30"
                    : "bg-secondary-10 border-red-500"
                }`}
                placeholder={
                  editFormData.customDuty
                    ? "Add Price *"
                    : "Select Custom Duty first"
                }
                aria-label="Unit Price"
              />
            </div>
          ) : (
            renderAmountOnly(order.unitPrice || order.unit_price || 0)
          )}
        </TableCell>,

        <TableCell key="total" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="bg-secondary-10 border border-dotted border-secondary-30 w-full cursor-not-allowed">
              <Typography
                size="sm"
                weight="normal"
                className="text-secondary-30"
              >
                Not-allowed
              </Typography>
            </div>
          ) : (
            renderAmountOnly(order.total || 0)
          )}
        </TableCell>,

        <TableCell key="taxRate" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="flex flex-col gap-1">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={editFormData.taxRate ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const constraints = getTaxRateConstraints(
                    editFormData.customDuty
                  );

                  // Validate against constraints
                  if (constraints.fixed !== null) {
                    // For fixed rate (TVA), don't allow manual entry but show the fixed value
                    return;
                  } else {
                    // For range validation, allow entry but validate
                    handleInputChange("taxRate", e.target.value);
                  }
                }}
                disabled={
                  !editFormData.customDuty ||
                  getTaxRateConstraints(editFormData.customDuty).fixed !== null
                }
                className={`block w-full px-2 py-1 text-sm rounded-md focus:border focus:outline-none ${
                  !editFormData.customDuty
                    ? "bg-gray-100 cursor-not-allowed border-gray-200 text-gray-400"
                    : getTaxRateConstraints(editFormData.customDuty).fixed !==
                      null
                    ? "bg-gray-100 cursor-not-allowed border-gray-300 text-gray-600"
                    : editFormData.taxRate !== undefined &&
                      isValidTaxRate(
                        editFormData.taxRate,
                        editFormData.customDuty
                      )
                    ? "bg-secondary-10 border-secondary-30"
                    : "bg-secondary-10 border-red-500"
                }`}
                placeholder={
                  !editFormData.customDuty
                    ? "Select Custom Duty first"
                    : getTaxRatePlaceholder(editFormData.customDuty)
                }
                aria-label="Tax Rate"
                title={
                  !editFormData.customDuty
                    ? "Select Custom Duty first"
                    : `Tax rate constraints: ${getTaxRatePlaceholder(
                        editFormData.customDuty
                      )}`
                }
              />
              {editFormData.customDuty &&
                editFormData.taxRate !== undefined &&
                !isValidTaxRate(
                  editFormData.taxRate,
                  editFormData.customDuty
                ) && (
                  <span className="text-xs text-red-500">
                    Rate must be{" "}
                    {getTaxRatePlaceholder(editFormData.customDuty)}
                  </span>
                )}
            </div>
          ) : (
            <span className="block font-medium text-secondary-100 text-sm">
              {order.taxRate || order.tax_rate}%
            </span>
          )}
        </TableCell>,

        <TableCell key="taxAmount" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="bg-secondary-10 border border-dotted border-secondary-30 w-full cursor-not-allowed">
              <Typography
                size="sm"
                weight="normal"
                className="text-secondary-30"
              >
                Not-allowed
              </Typography>
            </div>
          ) : (
            renderAmountOnly(order.taxAmount || order.tax_amount || 0)
          )}
        </TableCell>,

        <TableCell key="vatIncluded" className="px-5 py-4 sm:px-6">
          {editingId === order.id ? (
            <div className="bg-secondary-10 border border-dotted border-secondary-30 w-full cursor-not-allowed">
              <Typography
                size="sm"
                weight="normal"
                className="text-secondary-30"
              >
                Not-allowed
              </Typography>
            </div>
          ) : (
            renderAmountOnly(order.vatIncluded || order.vat_included || 0)
          )}
        </TableCell>
      );
    }

    return columns;
  };

  // Dynamic table headers based on tax category
  const getDynamicTableHeaders = (): TableHeader[] => {
    const baseHeaders = [
      {
        content: <div>{t("sr_no")}</div>,
        className: "w-16",
      },
      {
        content: <div>{t("reference")}</div>,
        className: "w-32",
      },
      {
        content: <div>{t("custom_duties")}</div>,
        className: "w-32",
      },
    ];

    if (currentTaxCategory === "location_acquisition") {
      // Local acquisition columns
      return [
        ...baseHeaders,
        {
          content: <div>{t("nature_marchandise")}</div>,
          className: "min-w-[120px]",
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
          content: <div>{t("total")}</div>,
          className: "w-24",
        },
        {
          content: <div>{t("tax_rate")}</div>,
          className: "w-24",
        },
        {
          content: <div>{t("tax_amount")}</div>,
          className: "w-28",
        },
        {
          content: <div>{t("ttc")}</div>,
          className: "w-28",
        },
        ...(showActions
          ? [
              {
                content: <div>{t("actions")}</div>,
                className: "w-20",
              },
            ]
          : []),
      ];
    } else if (currentTaxCategory === "importation") {
      // Importation columns
      return [
        ...baseHeaders,
        {
          content: <div>{t("nature_marchandise")}</div>,
          className: "min-w-[120px]",
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
          content: <div>{t("tarrif_position")}</div>,
          className: "w-32",
        },
        {
          content: <div>{t("droit")}</div>,
          className: "w-24",
        },
        {
          content: <div>{t("ttc")}</div>,
          className: "w-28",
        },
        ...(showActions
          ? [
              {
                content: <div>{t("actions")}</div>,
                className: "w-20",
              },
            ]
          : []),
      ];
    }

    // Default fallback (same as original structure but with reference)
    return [
      ...baseHeaders,
      {
        content: <div>{t("label")}</div>,
        className: "min-w-[120px]",
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
        content: <div>{t("currency")}</div>,
        className: "w-24",
      },
      {
        content: <div>{t("unit_price")}</div>,
        className: "w-28",
      },
      {
        content: <div>{t("total")}</div>,
        className: "w-24",
      },
      {
        content: <div>{t("tax_rate")}</div>,
        className: "w-24",
      },
      {
        content: <div>{t("tax_amount")}</div>,
        className: "w-28",
      },
      {
        content: <div>{t("vat_included")}</div>,
        className: "w-28",
      },
      ...(showActions
        ? [
            {
              content: <div>{t("actions")}</div>,
              className: "w-20",
            },
          ]
        : []),
    ];
  };

  const tableHeader: TableHeader[] = getDynamicTableHeaders();

  return (
    <div className="relative rounded-lg border border-secondary-30 bg-white">
      <div className="relative min-h-[200px]">
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
            {tableData.map((order, index) => (
              <TableRow key={order.id}>
                {renderDynamicColumns(order, index)}
                {showActions && (
                  <TableCell className="px-4 py-3 text-gray-500 text-sm">
                    {editingId === order.id ? (
                      <div className="flex items-center space-x-4">
                        <RightGreenIcon
                          onClick={() => handleSaveEdit(order.id)}
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
                        ref={openMenuId === order.id ? menuRef : null}
                      >
                        <button
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            handleMenuToggle(order.id);
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
                            className="absolute right-0 top-full mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                            role="menu"
                          >
                            <button
                              onClick={(
                                e: React.MouseEvent<HTMLButtonElement>
                              ) => {
                                e.stopPropagation();
                                handleEdit(order);
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
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CreateRequestTable;
