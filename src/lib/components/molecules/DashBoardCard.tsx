import { FC } from "react";
import { FileVioletIcon } from "../../../icons";
import Typography, { TypographyProps } from "../atoms/Typography";
import { formatAmount } from "../../../utils/numberFormat";

interface DashBoardCardProps {
  icon?: React.ReactNode;
  count: number;
  title: string;
  onClick?: () => void;
  countSize?: TypographyProps["size"]; // optional override for count text size
  titleSize?: TypographyProps["size"]; // optional override for title text size
  className?: string; // optional container class overrides
}

const DashBoardCard: FC<DashBoardCardProps> = ({
  icon = <FileVioletIcon width={44} height={44} />,
  count,
  title,
  onClick,
  countSize = "xl_2",
  titleSize = "sm",
  className = "",
}) => {
  return (
    <div
      onClick={onClick}
      className={`w-full bg-white rounded-[8px] shadow-light-20 px-4 py-5 flex flex-col gap-5 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer hover:bg-gray-50 border border-secondary-30 hover:border-secondary-20 min-h-[100px] ${className}`}
    >
      <div className="flex gap-5">
        {icon}
        <div>
          <Typography
            size={countSize}
            weight="extrabold"
            className="text-secondary-100"
          >
            {formatAmount(count)}
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
