import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Order } from "../table/CreateRequestTable.tsx.tsx";
import DatePicker from "../../lib/components/atoms/DatePicker";
import CustomDropdown from "../../lib/components/atoms/CustomDropdown";
import Input from "../../lib/components/atoms/Input";
import Label from "../../lib/components/atoms/Label";
import Button from "../../lib/components/atoms/Button";
import Modal from "../../lib/components/atoms/Modal";
import { formatAmount } from "../../utils/numberFormat";

interface EntityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Order>) => void;
  initialData?: Partial<Order>;
  currentTaxCategory: string;
  mode: "add" | "edit";
}

const EntityFormModal: React.FC<EntityFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  currentTaxCategory,
  mode,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Order>>(initialData || {});
  const [quantityDisplay, setQuantityDisplay] = useState("");
  const [isQuantityTyping, setIsQuantityTyping] = useState(false);
  const [priceDisplay, setPriceDisplay] = useState("");
  const [isPriceTyping, setIsPriceTyping] = useState(false);

  // Format quantity display value - similar to CurrencyInput getDisplayValue
  const getQuantityDisplayValue = (rawValue: number | string | undefined) => {
    if (!rawValue || rawValue === "") return "";
    const numValue = typeof rawValue === "string" ? parseFloat(rawValue) : rawValue;
    if (isNaN(numValue)) return "";

    // If the input contains a decimal point, preserve it in formatting
    const stringValue = rawValue.toString();
    if (stringValue.includes(".")) {
      const parts = stringValue.split(".");
      const integerPart = parseInt(parts[0]) || 0;
      const decimalPart = parts[1] || "";

      // Format the integer part with spaces
      const formattedInteger = new Intl.NumberFormat("fr-FR").format(
        integerPart
      );

      // Return with decimal part (limit to 2 decimal places)
      return formattedInteger + "." + decimalPart.substring(0, 2);
    } else {
      // Format without decimals for whole numbers
      return new Intl.NumberFormat("fr-FR").format(numValue);
    }
  };

  // Format price display value - similar to CurrencyInput getDisplayValue
  const getPriceDisplayValue = (rawValue: number | string | undefined) => {
    if (!rawValue || rawValue === "") return "";
    const numValue = typeof rawValue === "string" ? parseFloat(rawValue) : rawValue;
    if (isNaN(numValue)) return "";

    // If the input contains a decimal point, preserve it in formatting
    const stringValue = rawValue.toString();
    if (stringValue.includes(".")) {
      const parts = stringValue.split(".");
      const integerPart = parseInt(parts[0]) || 0;
      const decimalPart = parts[1] || "";

      // Format the integer part with spaces
      const formattedInteger = new Intl.NumberFormat("fr-FR").format(
        integerPart
      );

      // Return with decimal part (limit to 2 decimal places)
      return formattedInteger + "." + decimalPart.substring(0, 2);
    } else {
      // Format without decimals for whole numbers
      return new Intl.NumberFormat("fr-FR").format(numValue);
    }
  };

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
      // Update quantity display when form resets
      const quantity = initialData?.quantity;
      if (quantity) {
        setQuantityDisplay(getQuantityDisplayValue(quantity));
      } else {
        setQuantityDisplay('');
      }
      setIsQuantityTyping(false);
      
      // Update price display when form resets
      const price = initialData?.unitPrice || initialData?.cif;
      if (price) {
        setPriceDisplay(getPriceDisplayValue(price));
      } else {
        setPriceDisplay('');
      }
      setIsPriceTyping(false);
    }
  }, [isOpen, initialData]);

  // Update quantity display when quantity value changes (but not while typing)
  useEffect(() => {
    if (!isQuantityTyping && formData.quantity) {
      setQuantityDisplay(getQuantityDisplayValue(formData.quantity));
    } else if (!formData.quantity) {
      setQuantityDisplay('');
    }
  }, [formData.quantity, isQuantityTyping]);

  // Update price display when price values change (but not while typing)
  useEffect(() => {
    if (!isPriceTyping) {
      const price = formData.unitPrice || formData.cif;
      if (price) {
        setPriceDisplay(getPriceDisplayValue(price));
      } else {
        setPriceDisplay('');
      }
    }
  }, [formData.unitPrice, formData.cif, isPriceTyping]);

  const calculateTaxAndVat = (data: Partial<Order>) => {
    const quantity = data.quantity || 0;
    const unitPrice = data.unitPrice || data.cif || 0;
    const taxRate = data.taxRate || 0;
    const total = quantity * unitPrice;

    // If IT is selected for importation, tax amount should be 0
    const isItSelected =
      currentTaxCategory === "importation" && data.itIc === "IT";
    const taxAmount = isItSelected ? 0 : total * (taxRate / 100);
    const vatIncluded = total + taxAmount;

    return { total, taxAmount, vatIncluded };
  };

  // Custom duty options based on tax category
  const getCustomDutyOptions = () => {
    if (currentTaxCategory === "location_acquisition") {
      return [{ value: "TVA", label: t("vat") }];
    } else if (currentTaxCategory === "importation") {
      return [
        { value: "TVA à l'importation", label: t("import_vat") },
        {
          value: "Taxes DGRAD à l'importation",
          label: t("import_dgrad_taxes"),
        },
        { value: "Droits d'entrée", label: t("entry_duties") },
        { value: "Droit de consommation", label: t("consumption_duty") },
      ];
    }
    return [{ value: "TVA", label: t("vat") }];
  };

  // Tax rate constraints
  const getTaxRateConstraints = (customDuty: string | undefined, itIcValue?: string) => {
    // If IT is selected for importation, allow 0 tax rate (override normal constraints)
    const isItSelected =
      currentTaxCategory === "importation" && (itIcValue || formData.itIc) === "IT";
    if (isItSelected) {
      return { min: 0, max: 0, fixed: 0, allowedValues: null };
    }
    
    if (!customDuty)
      return { min: 1, max: 100, fixed: null, allowedValues: null };

    switch (customDuty) {
      case "TVA":
        // For local acquisition TVA, only allow 8% or 16%
        if (currentTaxCategory === "location_acquisition") {
          return { min: 8, max: 16, fixed: null, allowedValues: [8, 16] };
        }
        return { min: 16, max: 16, fixed: 16, allowedValues: null }; // Fixed at 16%
      case "TVA à l'importation":
        return { min: 16, max: 16, fixed: 16, allowedValues: null }; // Fixed at 16%
      default:
        return { min: 1, max: 100, fixed: null, allowedValues: null };
    }
  };

  const isValidTaxRate = (taxRate: number, customDuty: string | undefined) => {
    // If IT is selected for importation, allow 0 tax rate (override normal validation)
    const isItSelected =
      currentTaxCategory === "importation" && formData.itIc === "IT";
    if (isItSelected && taxRate === 0) {
      return true;
    }
    
    const constraints = getTaxRateConstraints(customDuty);
    if (constraints.fixed !== null) {
      return taxRate === constraints.fixed;
    }
    if (constraints.allowedValues) {
      return constraints.allowedValues.includes(taxRate);
    }
    return taxRate >= constraints.min && taxRate <= constraints.max;
  };

  const handleInputChange = (field: keyof Order, value: string | number) => {
    let parsedValue: string | number | undefined = value as any;

    // Parse numeric fields
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
      if (value === "") {
        parsedValue = undefined;
      } else {
        const n =
          typeof value === "number" ? value : parseFloat(value as string);
        parsedValue = Number.isNaN(n) ? undefined : n;
      }
    }

    setFormData((prev) => {
      const updated = { ...prev, [field]: parsedValue };

      // Handle IT/IC selection for importation
      if (
        field === "itIc" &&
        currentTaxCategory === "importation"
      ) {
        if (parsedValue === "IT") {
          // IT selected: set tax rate to 0
          updated.taxRate = 0;
        } else if (parsedValue === "IC") {
          // IC selected: ensure a valid non-zero tax rate is applied based on custom duty
          const constraints = updated.customDuty
            ? getTaxRateConstraints(updated.customDuty as string, "IC")
            : { min: 1, max: 100, fixed: null as number | null, allowedValues: null as number[] | null };

          if (constraints.fixed !== null) {
            updated.taxRate = constraints.fixed;
          } else {
            // If current taxRate is 0 or undefined (likely after switching from IT), set to minimum allowed
            const current = typeof updated.taxRate === "number" ? updated.taxRate : undefined;
            updated.taxRate = current && current > 0 ? current : (constraints.min ?? 1);
          }
        }
      }

      // Auto-recalculate for relevant fields
      if (["quantity", "unitPrice", "taxRate", "cif", "itIc"].includes(field)) {
        const { total, taxAmount, vatIncluded } = calculateTaxAndVat(updated);
        updated.total = total;
        updated.taxAmount = taxAmount;
        updated.vatIncluded = vatIncluded;
      }

      return updated;
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setIsQuantityTyping(true);

    // Remove spaces and other formatting characters but keep digits and one decimal point
    let cleanValue = inputValue.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point is allowed
    const parts = cleanValue.split(".");
    if (parts.length > 2) {
      cleanValue = parts[0] + "." + parts.slice(1).join("");
    }

    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      cleanValue = parts[0] + "." + parts[1].substring(0, 2);
    }

    // Update display value immediately while typing
    setQuantityDisplay(inputValue);

    // Parse and update form data
    const numericValue = cleanValue === "" ? undefined : parseFloat(cleanValue);
    if (numericValue !== undefined && !isNaN(numericValue)) {
      handleInputChange("quantity", numericValue);
    } else if (cleanValue === "") {
      handleInputChange("quantity", "");
    }

    // Stop typing mode after a delay
    setTimeout(() => setIsQuantityTyping(false), 500);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "unitPrice" | "cif") => {
    const inputValue = e.target.value;
    setIsPriceTyping(true);

    // Remove spaces and other formatting characters but keep digits and one decimal point
    let cleanValue = inputValue.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point is allowed
    const parts = cleanValue.split(".");
    if (parts.length > 2) {
      cleanValue = parts[0] + "." + parts.slice(1).join("");
    }

    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      cleanValue = parts[0] + "." + parts[1].substring(0, 2);
    }

    // Update display value immediately while typing
    setPriceDisplay(inputValue);

    // Parse and update form data
    const numericValue = cleanValue === "" ? undefined : parseFloat(cleanValue);
    if (numericValue !== undefined && !isNaN(numericValue)) {
      handleInputChange(fieldName, numericValue);
    } else if (cleanValue === "") {
      handleInputChange(fieldName, "");
    }

    // Stop typing mode after a delay
    setTimeout(() => setIsPriceTyping(false), 500);
  };

  const handleCustomDutyChange = (newCustomDuty: string) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        customDuty: newCustomDuty,
      };
      
      // Get constraints after updating custom duty
      const constraints = getTaxRateConstraints(newCustomDuty, updated.itIc);
      
      // Auto-set tax rate if fixed (including IT case which sets to 0)
      if (constraints.fixed !== null) {
        updated.taxRate = constraints.fixed;
      } else {
        // If IC (not IT) and taxRate is 0/undefined (possibly after switching from IT), set to minimum allowed
        const isIC = currentTaxCategory === "importation" && updated.itIc === "IC";
        if (isIC && (!updated.taxRate || updated.taxRate === 0)) {
          if (constraints.allowedValues && constraints.allowedValues.length > 0) {
            updated.taxRate = constraints.allowedValues[0];
          } else if (typeof constraints.min === "number") {
            updated.taxRate = constraints.min;
          } else {
            updated.taxRate = 1; // sensible default
          }
        }
      }

      // Recalculate if tax rate was auto-set or adjusted
      if (constraints.fixed !== null || (updated.itIc === "IC" && (updated.taxRate ?? 0) > 0)) {
        const { total, taxAmount, vatIncluded } = calculateTaxAndVat(updated);
        updated.total = total;
        updated.taxAmount = taxAmount;
        updated.vatIncluded = vatIncluded;
      }

      return updated;
    });
  };

  const handleSave = () => {
    // Validation
    const isLabelValid = formData.label && formData.label.trim() !== "";
    const isQuantityValid = formData.quantity && formData.quantity > 0;
    const isUnitPriceValid =
      (formData.unitPrice !== undefined && formData.unitPrice > 0) ||
      (formData.cif !== undefined && formData.cif > 0);
    const isTaxRateValid =
      formData.taxRate !== undefined &&
      formData.taxRate >= 0 &&
      isValidTaxRate(formData.taxRate, formData.customDuty);
    const isCustomDutyValid =
      formData.customDuty && formData.customDuty.trim() !== "";
    const isIssueDateValid =
      currentTaxCategory !== "location_acquisition" ||
      (formData.issueDate && formData.issueDate.toString().trim() !== "");

    const priceFieldLabel =
      currentTaxCategory === "importation" ? t("cif") : t("unit_price");

    if (!isCustomDutyValid) {
      alert(t("custom_duty_required"));
      return;
    }
    if (!isIssueDateValid) {
      alert(t("issue_date_required_local_acquisition"));
      return;
    }
    if (!isLabelValid) {
      alert(t("nature_marchandise_required"));
      return;
    }
    if (!isQuantityValid) {
      alert(t("quantity_required_greater_than_zero"));
      return;
    }
    if (!isUnitPriceValid) {
      alert(
        t("price_field_required_greater_than_zero", { field: priceFieldLabel })
      );
      return;
    }
    if (!isTaxRateValid) {
      const constraints = getTaxRateConstraints(formData.customDuty, formData.itIc);
      const constraintText =
        constraints.fixed !== null
          ? t("exactly_percent", { rate: constraints.fixed })
          : constraints.allowedValues
          ? t("either_percent", {
              rates: constraints.allowedValues.join(t("percent_or")),
            })
          : t("between_percent", {
              min: constraints.min,
              max: constraints.max,
            });
      alert(t("tax_rate_constraint_message", { constraint: constraintText }));
      return;
    }

    // Calculate final values
    const { total, taxAmount, vatIncluded } = calculateTaxAndVat(formData);
    const finalData = {
      ...formData,
      total,
      taxAmount,
      vatIncluded,
    };

    onSave(finalData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl w-full max-h-[90vh] overflow-hidden"
      showCloseButton={false} // We'll use custom header with close button
    >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === "add" ? t("add_new_entity") : t("edit_entity")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reference */}
            <div>
              <Label htmlFor="reference">{t("reference")}</Label>
              <Input
                id="reference"
                name="reference"
                type="text"
                value={formData.reference || ""}
                onChange={(e) => handleInputChange("reference", e.target.value)}
                placeholder={t("add_reference")}
              />
            </div>

            {/* Issue Date (Local Acquisition only) */}
            {currentTaxCategory === "location_acquisition" && (
              <div>
                <DatePicker
                  key={`modal-issue-date-${mode}-${formData.id || "new"}`}
                  id="modal-issue-date"
                  label={t("issue_date_required")}
                  placeholder={t("select_issue_date")}
                  mode="single"
                  defaultDate={
                    formData.issueDate
                      ? typeof formData.issueDate === "string"
                        ? formData.issueDate
                        : formData.issueDate.toISOString().split("T")[0]
                      : undefined
                  }
                  onChange={(selectedDates: Date[]) => {
                    if (selectedDates && selectedDates[0]) {
                      const formattedDate = selectedDates[0]
                        .toISOString()
                        .split("T")[0]; // YYYY-MM-DD format
                      handleInputChange("issueDate", formattedDate);
                    }
                  }}
                />
              </div>
            )}

            {/* Tariff Position (Importation only) */}
            {currentTaxCategory === "importation" && (
              <div>
                <Label htmlFor="tariff-position">{t("tariff_position")}</Label>
                <Input
                  id="tariff-position"
                  name="tarrifPosition"
                  type="text"
                  value={formData.tarrifPosition || ""}
                  onChange={(e) =>
                    handleInputChange("tarrifPosition", e.target.value)
                  }
                  placeholder={t("add_tariff_position")}
                />
              </div>
            )}

            {/* IT/IC Field (Importation only) */}
            {currentTaxCategory === "importation" && (
              <div>
                <Label htmlFor="it-ic">{t("it_ic_required")}</Label>
                <CustomDropdown
                  id="it-ic"
                  options={[
                    { value: "", label: t("select_it_ic") },
                    { value: "IT", label: "IT" },
                    { value: "IC", label: "IC" },
                  ]}
                  value={formData.itIc || ""}
                  onChange={(value) => handleInputChange("itIc", value)}
                  placeholder={t("select_it_ic")}
                />
              </div>
            )}

            {/* Custom Duties */}
            <div>
              <Label htmlFor="custom-duties">
                {t("custom_duties_required")}
              </Label>
              <CustomDropdown
                id="custom-duties"
                options={getCustomDutyOptions()}
                value={formData.customDuty || ""}
                onChange={handleCustomDutyChange}
                placeholder={t("select_custom_duties_required")}
              />
            </div>

            {/* Nature Marchandise */}
            <div className="md:col-span-2">
              <Label htmlFor="nature-marchandise">{t("description")}</Label>
              <Input
                id="description"
                name="label"
                type="text"
                value={formData.label || ""}
                onChange={(e) => handleInputChange("label", e.target.value)}
                disabled={!formData.customDuty}
                placeholder={
                  formData.customDuty
                    ? t("description")
                    : t("select_custom_duties_first")
                }
              />
            </div>

            {/* Nature of Operations (Local Acquisition only) */}
            {currentTaxCategory === "location_acquisition" && (
              <div>
                <Label htmlFor="nature-operations">
                  {t("nature_of_operations")}
                </Label>
                <CustomDropdown
                  id="nature-operations"
                  options={[
                    { value: "", label: t("select_nature_of_operations") },
                    {
                      value: "Acquisition de biens",
                      label: t("acquisition_of_goods"),
                    },
                    {
                      value: "Prestation de services",
                      label: t("service_provision"),
                    },
                    {
                      value: "Travaux immobiliers",
                      label: t("real_estate_work"),
                    },
                  ]}
                  value={formData.natureOfOperations || ""}
                  onChange={(value) =>
                    handleInputChange("natureOfOperations", value)
                  }
                  placeholder={t("select_nature_of_operations")}
                />
              </div>
            )}

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">{t("quantity_required")}</Label>
              <Input
                id="quantity"
                name="quantity"
                type="text"
                value={isQuantityTyping ? quantityDisplay : getQuantityDisplayValue(formData.quantity)}
                onChange={handleQuantityChange}
                placeholder={t("enter_quantity")}
              />
            </div>

            {/* Unit */}
            <div>
              <Label htmlFor="unit">{t("unit")}</Label>
              <CustomDropdown
                id="unit"
                options={[
                  { value: "", label: t("select_unit") },
                  { value: "Unité", label: t("unit_piece") },
                  { value: "kilogramme", label: t("kilogram") },
                  { value: "mètre", label: t("meter") },
                  { value: "litre", label: t("liter") },
                  { value: "m²", label: t("square_meter") },
                  { value: "m³", label: t("cubic_meter") },
                  { value: "Other", label: t("other") },
                ]}
                value={formData.unit || ""}
                onChange={(value) => handleInputChange("unit", value)}
                placeholder={t("select_unit")}
              />
            </div>

            {/* Unit Price / CIF */}
            <div>
              <Label htmlFor="unit-price">
                {currentTaxCategory === "importation"
                  ? t("cif_required")
                  : t("unit_price_required")}
              </Label>
              <Input
                id="unit-price"
                name={
                  currentTaxCategory === "importation" ? "cif" : "unitPrice"
                }
                type="text"
                value={
                  isPriceTyping 
                    ? priceDisplay 
                    : currentTaxCategory === "importation"
                    ? getPriceDisplayValue(formData.cif)
                    : getPriceDisplayValue(formData.unitPrice)
                }
                onChange={(e) => handlePriceChange(e, currentTaxCategory === "importation" ? "cif" : "unitPrice")}
                placeholder={t("enter_price", {
                  type:
                    currentTaxCategory === "importation"
                      ? t("cif")
                      : t("unit_price"),
                })}
              />
            </div>

            {/* Tax Rate */}
            <div>
              <Label htmlFor="tax-rate">{t("tax_rate_percent_required")}</Label>
              {currentTaxCategory === "location_acquisition" &&
              formData.customDuty === "TVA" ? (
                <CustomDropdown
                  id="tax-rate"
                  options={[
                    { value: "", label: t("select_tax_rate") },
                    { value: "8", label: "8%" },
                    { value: "16", label: "16%" },
                  ]}
                  value={formData.taxRate?.toString() || ""}
                  onChange={(value) => handleInputChange("taxRate", value)}
                  disabled={!formData.customDuty}
                  placeholder={t("select_tax_rate")}
                />
              ) : (
                <Input
                  id="tax-rate"
                  name="taxRate"
                  type="number"
                  value={
                    currentTaxCategory === "importation" &&
                    formData.itIc === "IT"
                      ? "0"
                      : formData.taxRate || ""
                  }
                  onChange={(e) => handleInputChange("taxRate", e.target.value)}
                  disabled={
                    !formData.customDuty ||
                    (currentTaxCategory === "importation" &&
                      formData.itIc === "IT")
                  }
                  placeholder={
                    currentTaxCategory === "importation" &&
                    formData.itIc === "IT"
                      ? t("tax_rate_disabled_for_it")
                      : formData.customDuty
                      ? (() => {
                          const constraints = getTaxRateConstraints(
                            formData.customDuty
                          );
                          return constraints.fixed !== null
                            ? t("rate_fixed", { rate: constraints.fixed })
                            : constraints.allowedValues
                            ? t("choose_rate_options", {
                                rates: constraints.allowedValues.join(
                                  t("percent_or")
                                ),
                              })
                            : t("rate_range", {
                                min: constraints.min,
                                max: constraints.max,
                              });
                        })()
                      : t("select_custom_duties_first")
                  }
                  min="0"
                  max="100"
                  step={0.01}
                  className={
                    currentTaxCategory === "importation" &&
                    formData.itIc === "IT"
                      ? "bg-gray-50 text-gray-600"
                      : ""
                  }
                />
              )}
            </div>

            {/* Calculated Fields - Read Only */}
            <div>
              <Label htmlFor="total-amount">{t("total_amount")}</Label>
              <Input
                id="total-amount"
                type="text"
                value={formData.total ? formatAmount(formData.total) : formatAmount(0)}
                disabled
                className="bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="tax-amount">{t("tax_amount")}</Label>
              <Input
                id="tax-amount"
                type="text"
                value={formData.taxAmount ? formatAmount(formData.taxAmount) : formatAmount(0)}
                disabled
                className="bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="total-with-tax">{t("total_with_tax")}</Label>
              <Input
                id="total-with-tax"
                type="text"
                value={formData.vatIncluded ? formatAmount(formData.vatIncluded) : formatAmount(0)}
                disabled
                className="bg-gray-50 text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            className="py-2 px-6 w-auto min-w-fit"
          >
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            className="py-2 px-6 w-auto min-w-fit whitespace-nowrap"
          >
            {mode === "add" ? t("add_entity") : t("save_changes")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EntityFormModal;
