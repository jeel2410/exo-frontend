import { useTranslation } from "react-i18next";
import Input, { InputProps } from "./Input";

type Options = {
  value: string;
  label: string;
};

interface Props extends InputProps {
  error?: boolean;
  hint?: string;
  options: Options[];
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
  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountryCode = e.target.value;
    onOptionChange?.(selectedCountryCode); // Pass the selected country code to the parent
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      [8, 9, 13, 27, 46].includes(e.keyCode) ||
      (e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode)) ||
      (e.keyCode >= 35 && e.keyCode <= 39)
    ) {
      return;
    }

    if (
      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105)
    ) {
      e.preventDefault();
    }

    const input = e.currentTarget.value;
    if (input.length >= 10) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData("text");
    const isNumeric = /^\d*$/.test(pastedData);
    const currentValue = e.currentTarget.value;
    const newLength = currentValue.length + pastedData.length;

    if (!isNumeric || newLength > 10) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (/^\d{0,10}$/.test(newValue)) {
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
        <div className="pl-1">
          <select
            className={`focus-visible:border-none focus-visible:outline-none ${
              error ? "text-error-500" : ""
            }`}
            onChange={handleCountryCodeChange}
            value={countryCode} // Add onChange handler
          >
            {options.map((opt, index) => (
              <option key={index} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="h-3 w-px bg-secondary-30"></div>
        <Input
          value={value}
          type="tel"
          maxLength={10}
          placeholder={t("phone_number")}
          className="border-none"
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
