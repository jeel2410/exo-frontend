import React from 'react';

interface NavTabProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const NavTab: React.FC<NavTabProps> = ({ 
  children, 
  isActive = false, 
  onClick, 
  className = '' 
}) => {
  return (
    <button
      className={`
        relative px-5 py-3 text-sm font-medium transition-all duration-300 ease-in-out
        rounded-lg text-nowrap
        ${isActive 
          ? 'nav-button-active text-brand-700 font-semibold' 
          : 'nav-button-inactive text-gray-700 hover:text-brand-700 hover:bg-gray-50/50'
        }
        ${className}
      `}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
};

export default NavTab;
