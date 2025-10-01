import { FC } from "react";
import { FileVioletIcon } from "../../../icons";
import Typography, { TypographyProps } from "../atoms/Typography";
import { formatAmount, formatNumberFrench } from "../../../utils/numberFormat";

interface DashBoardCardProps {
  icon?: React.ReactNode;
  count: number;
  title: string;
  onClick?: () => void;
  countSize?: TypographyProps["size"]; // optional override for count text size
  titleSize?: TypographyProps["size"]; // optional override for title text size
  className?: string; // optional container class overrides
  formatType?: "amount" | "count"; // determines whether to format as money (with decimals) or count (no decimals)
}

const DashBoardCard: FC<DashBoardCardProps> = ({
  icon = <FileVioletIcon width={36} height={36} />,
  count,
  title,
  onClick,
  countSize = "xl",
  titleSize = "xs",
  className = "",
  formatType = "amount", // default to amount for backward compatibility
}) => {
  return (
    <div
      onClick={onClick}
      className={`w-full bg-white rounded-[8px] shadow-light-20 px-4 py-5 flex items-center justify-center hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer hover:bg-gray-50 border border-secondary-30 hover:border-secondary-20 min-h-[100px] ${className}`}
    >
      <div className="flex items-center gap-4 w-full">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <Typography
            size={countSize}
            weight="extrabold"
            className="text-secondary-100"
          >
            {formatType === "count" ? formatNumberFrench(count, { maximumFractionDigits: 0 }) : formatAmount(count)}
          </Typography>
          <Typography size={titleSize} weight="normal" className="text-secondary-60 truncate">
            {title}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default DashBoardCard;
