import Input, { InputProps } from "./Input";
import { useState, useEffect } from "react";
import Typography from "./Typography";
import CustomDropdown from "./CustomDropdown";

type CurrencyOption = {
  value: string;
  label: string;
  flag: React.ReactNode; // Changed from string to ReactNode to accept SVG components
};

interface Props extends Omit<InputProps, "value" | "onChange"> {
  error?: boolean;
  hint?: string;
  options: CurrencyOption[];
  currency?: string;
  value?: string;
  onChange?: (value: string, currency: string) => void;
  currencyDisabled?: boolean;
}

const CurrencyInput = ({
  value = "",
  options,
  error,
  hint,
  onChange,
  className = "",
  currency,
  currencyDisabled = false,
  ...props
}: Props) => {
  const [selectedCurrency, setSelectedCurrency] = useState(
    currency || options[0]?.value || "USD"
  );
  const [displayValue, setDisplayValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Update selected currency when currency prop changes
  useEffect(() => {
    if (currency) {
      setSelectedCurrency(currency);
    }
  }, [currency]);

  // Update display value when value prop changes (but not while typing)
  useEffect(() => {
    if (!isTyping && value) {
      const formatted = getDisplayValue(value);
      setDisplayValue(formatted);
    } else if (!value) {
      setDisplayValue("");
    }
  }, [value, isTyping]);

  // Format display value - this should only be used for display, never for processing input
  const getDisplayValue = (rawValue: string) => {
    if (!rawValue || rawValue === "") return "";
    // rawValue can contain digits and one decimal point
    const number = parseFloat(rawValue);
    if (isNaN(number)) return "";

    // If the input contains a decimal point, preserve it in formatting
    if (rawValue.includes(".")) {
      const parts = rawValue.split(".");
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
      return new Intl.NumberFormat("fr-FR").format(number);
    }
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    onChange?.(value, currency);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setIsTyping(true);

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
    setDisplayValue(inputValue);

    // Always pass the clean numeric string to onChange
    if (onChange) {
      onChange(cleanValue, selectedCurrency);
    }

    // Stop typing mode after a short delay
    setTimeout(() => setIsTyping(false), 500);
  };

  // const selectedOption = options.find((opt) => opt.value === selectedCurrency);

  return (
    <div className="flex flex-col gap-1 w-full bg-secondary-10">
      <div
        className={`flex items-center gap-2 rounded-lg bg-secondary-10 ${
          error
            ? "border border-red focus-within:border-red"
            : "border border-secondary-30 focus-within:border-secondary-50"
        } ${className}`}
      >
        <div className="min-w-[100px]">
          <CustomDropdown
            options={options.map((option) => ({
              value: option.value,
              label: option.label,
              flag: option.flag,
            }))}
            value={selectedCurrency}
            onChange={handleCurrencyChange}
            placeholder="Currency"
            disabled={currencyDisabled}
            className="border-none bg-transparent focus:ring-0 focus:border-transparent"
            showFlag={true}
            error={error}
          />
        </div>
        <div className="h-6 w-px bg-secondary-30" />
        <Input
          value={isTyping ? displayValue : getDisplayValue(value)}
          type="text"
          placeholder="0"
          className="border-none flex-1 pr-4"
          onChange={handleAmountChange}
          {...props}
        />
      </div>
      {error && hint && (
        <Typography className="text-sm text-red ml-3 bg-secondary-10">
          {hint}
        </Typography>
      )}
    </div>
  );
};

export default CurrencyInput;
