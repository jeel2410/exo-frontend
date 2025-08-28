import React from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import Button from "../atoms/Button";
import DatePicker from "../atoms/DatePicker";
import Label from "../atoms/Label";
import Typography from "../atoms/Typography";

interface FilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onApply: (range: { startDate: Date | null; endDate: Date | null }) => void;
  onReset?: () => void;
}

const Filter: React.FC<FilterProps> = ({ startDate, endDate, onApply, onReset }) => {
  const { t } = useTranslation();
  const [localStartDate, setLocalStartDate] = React.useState<Date | null>(startDate);
  const [localEndDate, setLocalEndDate] = React.useState<Date | null>(endDate);
  const handleQuickSelect = (type: "today" | "week" | "month") => {
    let from: moment.Moment;
    let to: moment.Moment;

    switch (type) {
      case "today":
        from = moment().startOf("day");
        to = moment().endOf("day");
        break;
      case "week":
        from = moment().startOf("week");
        to = moment().endOf("week");
        break;
      case "month":
        from = moment().startOf("month");
        to = moment().endOf("month");
        break;
    }

    setLocalStartDate(from.toDate());
    setLocalEndDate(to.toDate());
  };

  const handleStartDateChange = (dates: Date[]) => {
    const date = dates?.[0];
    if (date) {
      setLocalStartDate(date);
    }
  };

  const handleEndDateChange = (dates: Date[]) => {
    const date = dates?.[0];
    if (date) {
      setLocalEndDate(date);
    }
  };

  const handleReset = () => {
    setLocalStartDate(null);
    setLocalEndDate(null);
    onApply({ startDate: null, endDate: null });
    onReset?.();
  };

  const handleApply = () => {
    onApply({ startDate: localStartDate, endDate: localEndDate });
  };

  return (
    <div className="w-full max-w-[450px] md:w-[450px] border border-secondary-30 rounded-lg p-4 md:p-5 bg-white">
      <Typography size="sm" weight="semibold" className="text-secondary-100">
        {t("date_range")}
      </Typography>
      <div className="mt-3">
        {/* Date Pickers - Stack on mobile, side by side on tablet+ */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Label htmlFor="fromDate">{t("from")}</Label>
            <DatePicker
              id="fromDate"
              placeholder="31-12-2025"
              defaultDate={localStartDate ?? undefined}
              onChange={handleStartDateChange}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="toDate">{t("to")}</Label>
            <DatePicker
              id="toDate"
              defaultDate={localEndDate ?? undefined}
              onChange={handleEndDateChange}
              placeholder="31-12-2025"
            />
          </div>
        </div>

        {/* Quick Filter Buttons - Stack on mobile, wrap on tablet */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
          <Button
            variant="outline"
            className="text-secondary-50 py-2 px-2 w-full sm:w-auto"
            onClick={() => handleQuickSelect("today")}>
            {t("today")}
          </Button>
          <Button
            variant="outline"
            className="text-secondary-50 py-2 px-2 w-full sm:w-auto"
            onClick={() => handleQuickSelect("week")}>
            {t("this_week")}
          </Button>
          <Button
            variant="outline"
            className="text-secondary-50 py-2 px-2 w-full sm:w-auto"
            onClick={() => handleQuickSelect("month")}>
            {t("this_month")}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-secondary-30 mt-6">
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:justify-end">
            <Button
              variant="secondary"
              className="w-full sm:w-fit py-3 order-2 sm:order-1"
              onClick={handleReset}
              disable={!localStartDate && !localEndDate}>
              {t("reset_all")}
            </Button>
            <Button
              variant="primary"
              className="w-full sm:w-fit py-3 order-1 sm:order-2"
              onClick={handleApply}
              disable={!localStartDate || !localEndDate}
              >
              {t("apply_filter")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filter;
