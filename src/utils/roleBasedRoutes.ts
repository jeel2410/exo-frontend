import { User } from "../context/AuthContext";

type UserRole = "project_manager" | "user";
export type RouteKey = "dashboard" | "projectList" | "profile" | "help" | "projectDetails" | "contractDetails";

type RoleBasedPathMap = Partial<Record<UserRole, string>> & {
  default: string;
};

const roleBasedRoutes: Record<RouteKey, RoleBasedPathMap> = {
  dashboard: {
    project_manager: "/project-dashboard",
    user: "/requests",
    default: "/sign-in",
  },
  projectList: {
    project_manager: "/project-home",
    user: "/contract-project-list",
    default: "/sign-in",
  },
  projectDetails: {
    project_manager: "/project-details",
    user: "/project-details",
    default: "/sign-in",
  },
  contractDetails: {
    project_manager: "/contract-details",
    user: "/contract-details",
    default: "/sign-in",
  },  
  profile: {
    project_manager: "/edit-profile",
    user: "/edit-profile",
    default: "/sign-in",
  },
  help: {
    default: "/help",
  },
  // Add more routes as needed
};

export const getRoute = (key: RouteKey, user: User | null): string => {
  const route = roleBasedRoutes[key];
  const role = user?.type;

  // ✅ Type guard to restrict indexing to known roles
  if (role === "project_manager" || role === "user") {
    return route[role] ?? route.default;
  }

  return route.default;
};
