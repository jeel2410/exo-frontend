import clsx from "clsx";
import React, { useRef, useState, KeyboardEvent, ClipboardEvent, useEffect } from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<unknown, Element>) => void;
  error?: boolean;
  hint?: string;
}

const OtpInput: React.FC<Props> = ({
  value = "",
  onChange,
  error,
  hint,
  onBlur,
}) => {
  const [otp, setOtp] = useState<string[]>(
    value.split("").slice(0, 6).concat(Array(6).fill("")).slice(0, 6)
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync internal state with external value prop changes
  useEffect(() => {
    const newOtp = value.split("").slice(0, 6).concat(Array(6).fill("")).slice(0, 6);
    setOtp(newOtp);
  }, [value]);

  const handleChange = (index: number, value: string) => {
    // Extract only numeric characters from the input
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue && value !== '') return; // Allow empty string for deletion

    const newOtp = [...otp];
    newOtp[index] = numericValue.slice(-1); // Take only the last numeric character
    setOtp(newOtp);

    onChange?.(newOtp.join(""));

    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedNumbers = pastedData.replace(/\D/g, "").slice(0, 6);

    if (pastedNumbers) {
      const newOtp = [...Array(6)].map(
        (_, index) => pastedNumbers[index] || ""
      );
      setOtp(newOtp);
      onChange?.(newOtp.join(""));
      const lastIndex = Math.min(pastedNumbers.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const inputClasses = twMerge(
    clsx(
      "w-[45px] h-[45px] lg:w-[74px] lg:h-[74px]",
      "text-center text-lg",
      "border rounded-lg",
      "bg-secondary-10",
      "focus:outline-none focus:ring-2",
      {
        "border-secondary-30 focus:ring-secondary-50": !error,
        "border-red focus:ring-red": error,
      }
    )
  );

  return (
    <div className="flex flex-col gap-1">
      <div>
        <div className="flex gap-3 lg:gap-6 justify-center w-fit">
          {[...Array(6)].map((_, index) => (
            <input
              key={index}
              ref={(element: HTMLInputElement | null) => {
                inputRefs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={otp[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onBlur={onBlur}
              className={inputClasses}
            />
          ))}
        </div>
      </div>
      {error && hint && <p className="text-sm text-red mt-1">{hint}</p>}
    </div>
  );
};

export default OtpInput;
