import { ReactNode } from "react";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";

interface LayoutContentProps {
  children: ReactNode;
  className?: string;
}

const LayoutContent: React.FC<LayoutContentProps> = ({
  className,
  children,
}) => {
  const { isMobileOpen } = useSidebar();

  return (
    <div className={`min-h-screen xl:flex bg-primary-10 ${className}`}>
      <div className="relative">
        <AppSidebar />
        <Backdrop />
        
      </div>
      <div
        className={`w-full flex-1 transition-all duration-300 ease-in-out ${
          isMobileOpen ? "ml-0" : ""
        }`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          {children}
          <div className="w-full p-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            © {new Date().getFullYear()} ExoTrack, All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ className, children }) => {
  return (
    <SidebarProvider>
      <LayoutContent className={className}>{children}</LayoutContent>
    </SidebarProvider>
  );
};

export default AppLayout;
