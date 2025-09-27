import { useLocation } from "react-router";
import RequestListSkeleton from "./skeletons/RequestListSkeleton";
import ContractListSkeleton from "./skeletons/ContractListSkeleton";
import ContractDetailsSkeleton from "./skeletons/ContractDetailsSkeleton";
import ProjectDetailsSkeleton from "./skeletons/ProjectDetailsSkeleton";
import HelpSkeleton from "./skeletons/HelpSkeleton";
import SkeletonLoader from "./SkeletonLoader";

interface SmartSkeletonLoaderProps {
  variant?: "auto" | "page" | "card" | "table" | "dashboard";
}

const SmartSkeletonLoader = ({ variant = "auto" }: SmartSkeletonLoaderProps) => {
  const location = useLocation();
  
  // If variant is not auto, use the original SkeletonLoader
  if (variant !== "auto") {
    return <SkeletonLoader variant={variant} />;
  }
  
  // Auto-detect based on current route
  const path = location.pathname;
  
  // Route-specific skeleton mapping
  if (path === "/requests") {
    return <RequestListSkeleton />;
  }
  
  if (path === "/contract") {
    return <ContractListSkeleton />;
  }
  
  if (path.startsWith("/project-details/")) {
    return <ProjectDetailsSkeleton />;
  }
  
  if (path.startsWith("/contract-details/")) {
    return <ContractDetailsSkeleton />; // Use dedicated contract details skeleton
  }
  
  if (path.startsWith("/request-details/")) {
    return <ProjectDetailsSkeleton />; // Reuse for details pages
  }
  
  if (path === "/help") {
    return <HelpSkeleton />;
  }
  
  // Edit profile and form pages
  if (path === "/edit-profile" || path.includes("/edit-") || path.includes("/create-") || path.includes("/add-")) {
    return <SkeletonLoader variant="card" />;
  }
  
  // Table-heavy pages
  if (path.includes("/project-dashboard") || path.includes("/contract-project-list") || path.includes("/select-contract")) {
    return <SkeletonLoader variant="table" />;
  }
  
  // Dashboard pages
  if (path.includes("/dashboard") || path === "/" || path === "/project-home") {
    return <SkeletonLoader variant="dashboard" />;
  }
  
  // Default fallback
  return <SkeletonLoader variant="page" />;
};

export default SmartSkeletonLoader;
