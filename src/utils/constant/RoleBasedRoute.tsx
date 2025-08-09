import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LoaderProvider } from "../../context/LoaderProvider";

interface RoleBasedRouteProps {
  children: React.ReactElement;
  allowedRoles: ("project_manager" | "user")[];
  fallbackPath?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  fallbackPath = "/project-dashboard",
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  // Check if user has the required role
  const hasRequiredRole = user.type && allowedRoles.includes(user.type);

  if (!hasRequiredRole) {
    // Redirect to appropriate dashboard based on user type
    let redirectPath = fallbackPath;

    if (user.type === "project_manager") {
      redirectPath = "/project-dashboard";
    } else {
      redirectPath = "/requests";
    }

    return <Navigate to={redirectPath} replace />;
  }

  return <LoaderProvider>{children}</LoaderProvider>;
};

export default RoleBasedRoute;
