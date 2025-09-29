import Input, { InputProps } from "./Input";
import { useState, useEffect } from "react";
import Typography from "./Typography";
import CustomDropdown from "./CustomDropdown";
import { formatCurrencyFrench } from "../../../utils/numberFormat";

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

  // Update selected currency when currency prop changes
  useEffect(() => {
    if (currency) {
      setSelectedCurrency(currency);
    }
  }, [currency]);

  const formatNumber = (num: string) => {
    const numStr = num.replace(/[^0-9]/g, "");
    if (!numStr) return "";
    const number = parseInt(numStr, 10);
    return formatCurrencyFrench(number);
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    onChange?.(value, currency);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove spaces (French thousand separators) and other non-digit characters except digits
    const newValue = e.target.value.replace(/\s/g, "").replace(/[^\d]/g, "");
    if (/^\d*$/.test(newValue)) {
      onChange?.(newValue, selectedCurrency);
    }
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
          value={formatNumber(value)}
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
