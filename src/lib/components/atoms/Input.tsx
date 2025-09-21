import type React from "react";
import { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
  type?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "date"
    | "time"
    | "tel"
    | string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  size?: number;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
  ...props
}, ref) => {
  let inputClasses = `h-11 w-full border px-2 py-3 text-base placeholder:text-secondary-50 focus:outline-hidden rounded-lg ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 bg-gray-100 cursor-not-allowed `;
  } else if (error) {
    inputClasses += `  border-red focus:border-red`;
  } else if (success) {
    inputClasses += `  border-success-500 focus:border-success-300 `;
  } else {
    inputClasses += ` bg-secondary-10 text-gray-800 border-secondary-30 focus:border-primary-50`;
  }

  return (
    <>
      <input
        ref={ref}
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />

      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-red"
              : success
              ? "text-success-500"
              : "text-secondary-30"
          }`}
        >
          {hint}
        </p>
      )}
    </>
  );
});

Input.displayName = "Input";

export default Input;
