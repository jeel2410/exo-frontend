export interface StatusBadgeProps {
  code: StatusCode;
}
export const statusList = {
  progress: "In Progress",
  draft: "Draft",
  expired: "Expired",
  schedule: "Schedule",
  publish: "Published",
  rejected: "Rejected",
} as const;


export type StatusCode = keyof typeof statusList;
// "progress" | "draft" | "expired" | "schedule" | "publish" | "rejected"


const statusColors: Record<StatusCode, string> = {
  progress: "bg-blue-100 text-blue-600",
  draft: "bg-gray-200 text-gray-600",
  expired: "bg-red-100 text-red-600",
  schedule: "bg-yellow-100 text-yellow-600",
  publish: "bg-green-100 text-green-600",
  rejected: "bg-red-100 text-red-700",
};

const StatusBadge=({ code }: StatusBadgeProps) =>{
  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-md inline-block ${statusColors[code]}`}
    >
      {statusList[code]}
    </span>
  );
}

export default StatusBadge