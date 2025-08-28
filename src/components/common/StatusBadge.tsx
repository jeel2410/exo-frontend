import { useTranslation } from 'react-i18next';

export interface StatusBadgeProps {
  code: StatusCode;
}
export const statusList = {
  progress: "status_progress",
  draft: "status_draft",
  expired: "status_expired",
  schedule: "status_schedule",
  publish: "status_publish",
  rejected: "status_rejected",
  approved: "status_approved"
} as const;


export type StatusCode = keyof typeof statusList;
// "progress" | "draft" | "expired" | "schedule" | "publish" | "rejected" | "approved"


const statusColors: Record<StatusCode, string> = {
  progress: "bg-blue-100 text-blue-600",
  draft: "bg-gray-200 text-gray-600",
  expired: "bg-red-100 text-red-600",
  schedule: "bg-yellow-100 text-yellow-600",
  publish: "bg-green-100 text-green-600",
  approved: "bg-green-100 text-green-600",
  rejected: "bg-red-100 text-red-600",
};

const StatusBadge=({ code }: StatusBadgeProps) =>{
  const { t } = useTranslation();
  
  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-md inline-block ${statusColors[code]}`}
    >
      {t(statusList[code])}
    </span>
  );
}

export default StatusBadge