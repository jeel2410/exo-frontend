import { useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;
import { CalenderIcon } from "../../../icons";

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[] | ((selectedDates: Date[]) => void);
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  error?: string | false | undefined;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
  error,
}: PropsType) {
  useEffect(() => {
    const flatPickr = flatpickr(`#${id}`, {
      mode: mode || "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate,
      onChange,
    });

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, onChange, id, defaultDate]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative bg-secondary-10 rounded-lg">
        <span className="absolute text-secondary-60 -translate-y-1/2 pointer-events-none left-3 top-1/2">
          <CalenderIcon className="size-6" />
        </span>
        <input
          id={id}
          placeholder={placeholder}
          className={`h-11 w-full rounded-lg border appearance-none pl-11 pr-4 py-2.5 text-sm placeholder:text-secondary-60 focus:outline-hidden bg-transparent text-secondary-100 ${
            error ? "border-red-500" : "border-secondary-30 focus:border-primary-50"
          } focus:ring-0`}
        />
      </div>
      {error && typeof error === "string" && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
