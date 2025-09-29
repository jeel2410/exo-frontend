import { useCallback } from "react";
import { Link, useLocation } from "react-router";

import { useSidebar } from "../context/SidebarContext";
import { Logo } from "../icons";
import { useRoleRoute } from "../hooks/useRoleRoute";

type NavItem = {
  name: string;
  path?: string;
};



const AppSidebar: React.FC = () => {
  const { isMobileOpen } = useSidebar();
  const location = useLocation();
  const { getRoute } = useRoleRoute();

  const navItems: NavItem[] = [
  {
    name: "Requests",
    path: "/requests",
  },
  {
    name: "Contracts",
    path: "/contract",
  },
  {
    name: "Help",
    path: getRoute("help"),
  },
];

  const isActive = useCallback(
    (path: string) => location.pathname === path || location.pathname.startsWith(path + '/'),
    [location.pathname]
  );

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-2">
      {items.map((nav, index) => (
        <li key={index}>
          {nav.path && (
            <Link
              to={nav.path}
              className={`menu-item group ${
                isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              ></span>
              {isMobileOpen && (
                <span className="menu-item-text">{nav.name}</span>
              )}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col top-0 px-5 left-0 bg-white text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isMobileOpen ? "w-[215px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:hidden`}
    >
      <div className={`pt-8 flex  justify-start`}>
        <Link to="/">
          {isMobileOpen && (
            <>
              <Logo width={179} height={40} />
            </>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav>
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 justify-start `}
              ></h2>
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
