import { useState, useEffect, useRef, ChangeEvent } from "react";
import Typography from "../../lib/components/atoms/Typography";
import { CrossRedIcon, RightGreenIcon } from "../../icons";

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
  label: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate: number;
  taxAmount: number;
  vatIncluded: number;
  customDuty?: string;
  unit_price?: number;
  tax_rate?: number;
  tax_amount?: number;
  vat_included?: number;
  custom_duty?: string;
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
    // Validation: Check if all required fields are filled
    const isLabelValid = editFormData.label && editFormData.label.trim() !== "";
    const isQuantityValid = editFormData.quantity && editFormData.quantity > 0;
    const isUnitPriceValid = editFormData.unitPrice !== undefined && editFormData.unitPrice > 0;
    const isTaxRateValid = editFormData.taxRate !== undefined && editFormData.taxRate >= 0;
    const isCustomDutyValid = editFormData.customDuty && editFormData.customDuty.trim() !== "";

    if (!isLabelValid) {
      alert("Label is required and cannot be empty.");
      return;
    }
    if (!isQuantityValid) {
      alert("Quantity is required and must be greater than 0.");
      return;
    }
    if (!isUnitPriceValid) {
      alert("Unit Price is required and must be greater than 0.");
      return;
    }
    if (!isTaxRateValid) {
      alert("Tax Rate is required and must be 0 or greater.");
      return;
    }
    if (!isCustomDutyValid) {
      alert("Custom Duty selection is required.");
      return;
    }

    setTableData((prev) => {
      const newData = prev.map((order) => {
        if (order.id === orderId) {
          const { total, taxAmount, vatIncluded } =
            calculateTaxAndVat(editFormData);
          return {
            ...order,
            label: editFormData.label || order.label,
            quantity: editFormData.quantity || order.quantity,
            unitPrice: editFormData.unitPrice ?? order.unitPrice,
            total,
            taxRate: editFormData.taxRate ?? order.taxRate,
            taxAmount,
            vatIncluded,
            customDuty: editFormData.customDuty || order.customDuty,
          };
        }
        return order;
      });
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
    let parsedValue: string | number = value;
    if (
      [
        "quantity",
        "unitPrice",
        "taxRate",
        "total",
        "taxAmount",
        "vatIncluded",
      ].includes(field)
    ) {
      parsedValue = value === "" ? 0 : parseFloat(value as string);
      if (isNaN(parsedValue)) parsedValue = 0;
    }

    setEditFormData((prev) => {
      const updatedFormData = { ...prev, [field]: parsedValue };
      const { total, taxAmount, vatIncluded } =
        calculateTaxAndVat(updatedFormData);
      return { ...updatedFormData, total, taxAmount, vatIncluded };
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
      return [
        { value: "tva", label: "TVA" },
      ];
    } else if (currentTaxCategory === "importation") {
      return [
        { value: "droits_de_douanes", label: "Droits de douanes" },
        { value: "taxes_dgrad_importation", label: "Taxes DGRAD à l'importation" },
        { value: "tva_importation", label: "TVA à l'importation" },
      ];
    }
    // Default fallback for DGI, DGDA, DGRAD (legacy values)
    return [
      { value: "tva", label: "TVA" },
    ];
  };

  const tableHeader: TableHeader[] = [
    // {
    //   content: (
    //     <input
    //       type="checkbox"
    //       checked={selectedRows.length === tableData.length}
    //       onChange={handleSelectAll}
    //       className="w-4 h-4 rounded border-secondary-30 text-blue-600 focus:ring-blue-500"
    //       aria-label="Select all rows"
    //     />
    //   ),
    //   className: "w-10", // Fixed width for checkbox
    // },
    {
      content: <div>Sr No</div>,
      className: "w-16",
    },
    {
      content: <div>Label</div>,
      className: "min-w-[120px]",
    },
    {
      content: (
        <div className="flex items-center gap-1">
          Quantity
          <span className="text-xs">{getSortIcon()}</span>
        </div>
      ),
      onClick: handleQuantitySort,
      className: "w-24",
    },
    {
      content: <div>Unit Price</div>,
      className: "w-28",
    },
    {
      content: <div>Total</div>,
      className: "w-24",
    },
    {
      content: <div>Tax Rate</div>,
      className: "w-24",
    },
    {
      content: <div>Tax Amount</div>,
      className: "w-28",
    },
    {
      content: <div>VAT Included</div>,
      className: "w-28",
    },
    {
      content: <div>Custom Duties</div>,
      className: "w-32",
    },
    ...(showActions
      ? [
          {
            content: <div>Actions</div>,
            className: "w-20",
          },
        ]
      : []),
  ];

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
                {/* <TableCell className="px-5 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(order.id)}
                    onChange={() => handleSelectRow(order.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label={`Select row ${order.id}`}
                  />
                </TableCell> */}
                <TableCell className="px-5 py-4 text-gray-500 text-sm">
                  {index + 1}
                </TableCell>
                <TableCell className="px-5 py-4 sm:px-6">
                  {editingId === order.id ? (
                    <div className="flex flex-col gap-1">
                      <input
                        type="text"
                        value={editFormData.label ?? ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleInputChange("label", e.target.value)
                        }
                        className={`block w-full px-2 py-1 text-sm rounded-md bg-secondary-10 focus:border focus:outline-none ${
                          editFormData.label && editFormData.label.trim() !== "" 
                            ? "border-secondary-30" 
                            : "border-red-500"
                        }`}
                        placeholder="Add Label *"
                        aria-label="Label"
                      />
                    </div>
                  ) : (
                    <span className="block font-medium text-secondary-100 text-sm">
                      {order.label}
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-sm">
                  {editingId === order.id ? (
                    <div className="flex items-center border border-secondary-30 rounded-md overflow-hidden">
                      <button
                        onClick={() => handleDecrement(order.id)}
                        className="w-8 h-8 flex items-center justify-center bg-white text-secondary-50 border-r border-secondary-30 hover:bg-gray-100 transition-colors focus:outline-none"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <div className="w-12 text-center font-medium bg-secondary-10 px-2 py-1 text-secondary-100 text-sm">
                        {editFormData.quantity ?? order.quantity}
                      </div>
                      <button
                        onClick={() => handleIncrement(order.id)}
                        className="w-8 h-8 flex items-center justify-center bg-white text-secondary-50 border-l border-secondary-30 hover:bg-gray-100 transition-colors focus:outline-none"
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
                <TableCell className="px-5 py-4 sm:px-6">
                  {editingId === order.id ? (
                    <div className="flex flex-col gap-1">
                      <input
                        type="text"
                        value={editFormData.unitPrice ?? ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleInputChange("unitPrice", e.target.value)
                        }
                        className={`block w-full px-2 py-1 text-sm rounded-md bg-secondary-10 focus:border focus:outline-none ${
                          editFormData.unitPrice !== undefined && editFormData.unitPrice >= 0 
                            ? "border-secondary-30" 
                            : "border-red-500"
                        }`}
                        placeholder="Add Price *"
                        aria-label="Unit Price"
                      />
                    </div>
                  ) : (
                    <span className="block font-medium text-secondary-100 text-sm">
                      {order.unitPrice || order.unit_price}
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-5 py-4 sm:px-6">
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
                    <span className="block font-medium text-secondary-100 text-sm">
                      {order.total}
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-5 py-4 sm:px-6">
                  {editingId === order.id ? (
                    <div className="flex flex-col gap-1">
                      <input
                        type="text"
                        value={editFormData.taxRate ?? ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleInputChange("taxRate", e.target.value)
                        }
                        className={`block w-full px-2 py-1 text-sm rounded-md bg-secondary-10 focus:border focus:outline-none ${
                          editFormData.taxRate !== undefined && editFormData.taxRate >= 0 
                            ? "border-secondary-30" 
                            : "border-red-500"
                        }`}
                        placeholder="Add Tax Rate *"
                        aria-label="Tax Rate"
                      />
                    </div>
                  ) : (
                    <span className="block font-medium text-secondary-100 text-sm">
                      {order.taxRate || order.tax_rate}%
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-5 py-4 sm:px-6">
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
                    <span className="block font-medium text-secondary-100 text-sm">
                      {order.taxAmount || order.tax_amount}
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-5 py-4 sm:px-6">
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
                    <span className="block font-medium text-secondary-100 text-sm">
                      {order.vatIncluded || order.vat_included}
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-5 py-4 sm:px-6">
                  {editingId === order.id ? (
                    <div className="flex flex-col gap-1">
                      <select
                        value={editFormData.customDuty ?? ""}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                          handleInputChange("customDuty", e.target.value)
                        }
                        className={`px-2 py-1 text-sm border rounded-md bg-white ${
                          editFormData.customDuty && editFormData.customDuty.trim() !== "" 
                            ? "border-gray-300" 
                            : "border-red-500"
                        }`}
                        aria-label="Custom Duty"
                      >
                        <option value="">Select Custom Duty</option>
                        {getCustomDutyOptions().map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="block font-medium text-secondary-100 text-sm">
                      {getCustomDutyOptions().find(opt => opt.value === (order.customDuty || order.custom_duty))?.label || "-"}
                    </span>
                  )}
                </TableCell>
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
