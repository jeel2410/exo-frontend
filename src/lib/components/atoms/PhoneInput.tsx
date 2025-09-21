import { useTranslation } from "react-i18next";
import Input, { InputProps } from "./Input";
import CustomDropdown from "./CustomDropdown";

type Options = {
  value: string;
  label: string;
};

interface Props extends InputProps {
  error?: boolean;
  hint?: string;
  options?: Options[];
  onOptionChange?: (countryCode: string) => void;
  countryCode?: string; // Callback for country code changes
}

const PhoneInput = ({
  value,
  options,
  error,
  hint,
  onChange,
  onOptionChange,
  countryCode,
  ...props
}: Props) => {
  const { t } = useTranslation();
  console.log(countryCode, "countryCode in PhoneInput");

  // Handle country code change
  const handleCountryCodeChange = (selectedCountryCode: string) => {
    onOptionChange?.(selectedCountryCode); // Pass the selected country code to the parent
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow special keys (backspace, tab, enter, escape, delete, arrows)
    if (
      [8, 9, 13, 27, 46].includes(e.keyCode) ||
      (e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode)) ||
      (e.keyCode >= 35 && e.keyCode <= 39)
    ) {
      return;
    }

    // Check if the key produces a numeric character
    // This handles both QWERTY and AZERTY keyboards properly
    const isNumericKey = /[0-9]/.test(e.key);
    
    if (!isNumericKey) {
      e.preventDefault();
    }

    const input = e.currentTarget.value;
    if (input.length >= 12) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData("text");
    const isNumeric = /^\d*$/.test(pastedData);
    const currentValue = e.currentTarget.value;
    const newLength = currentValue.length + pastedData.length;

    if (!isNumeric || newLength > 12) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Extract only numeric characters and limit to 12 digits
    const numericValue = newValue.replace(/\D/g, '').slice(0, 12);
    
    if (numericValue !== newValue) {
      // If the value had non-numeric characters, create a new event with cleaned value
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: numericValue
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
    } else {
      onChange?.(e);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div
        className={`flex items-center gap-2 border rounded-lg bg-secondary-10 ${
          error
            ? "border-red focus-within:border-red"
            : "border-secondary-30 focus-within:border-secondary-50"
        }`}
      >
        {options && options.length > 0 && (
          <>
            <div className="min-w-[80px]">
              <CustomDropdown
                options={options.map(opt => ({
                  value: opt.value,
                  label: opt.label
                }))}
                value={countryCode || ""}
                onChange={handleCountryCodeChange}
                placeholder="Code"
                className="border-none bg-transparent focus:ring-0 focus:border-transparent"
                error={error}
              />
            </div>
            <div className="h-6 w-px bg-secondary-30"></div>
          </>
        )}
        <Input
          value={value}
          type="tel"
          maxLength={12}
          placeholder={t("phone_number")}
          className="border-none flex-1 min-w-[180px] w-full"
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onChange={handleChange}
          {...props}
        />
      </div>
      {error && hint && <p className="text-xs text-red ml-3">{hint}</p>}
    </div>
  );
};

export default PhoneInput;
