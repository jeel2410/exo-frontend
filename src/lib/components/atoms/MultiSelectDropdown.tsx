import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Checkbox from './Checkbox';

interface DropdownOption {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: DropdownOption[];
  value: string[]; // Array of selected values
  onChange: (values: string[]) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
  name?: string;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onOpen?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  value = [],
  onChange,
  onBlur,
  placeholder = "Select options...",
  disabled = false,
  error = false,
  className = "",
  id,
  name,
  searchable = false,
  searchValue = "",
  onSearchChange,
  onOpen,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Get selected options for display
  const selectedOptions = options.filter(option => value.includes(option.value));
  const displayText = selectedOptions.length > 0 
    ? selectedOptions.map(opt => opt.label).join(', ')
    : placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        listRef.current &&
        !listRef.current.contains(event.target as Node)
      ) {
        if (isOpen) {
          setIsOpen(false);
          onBlur?.();
        }
      }
    };

    const handleScrollOrResize = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, onBlur]);

  useEffect(() => {
    if (isOpen && onOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);

  const updateDropdownPosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setDropdownStyles({
        position: "absolute",
        top: `${rect.bottom + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
        width: `${rect.width}px`,
        zIndex: 2147483648,
      });
    }
  };

  const handleToggle = () => {
    if (!disabled) {
      if (!isOpen) updateDropdownPosition();
      setIsOpen(prev => !prev);
    }
  };

  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    let newValues: string[];
    if (checked) {
      newValues = [...value, optionValue];
    } else {
      newValues = value.filter(v => v !== optionValue);
    }
    onChange(newValues);
  };

  const handleListScroll = () => {
    if (!listRef.current || !onLoadMore || !hasMore || loadingMore) return;
    const el = listRef.current;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      onLoadMore();
    }
  };

  const buttonClasses = `
    relative w-full flex items-center justify-between px-3 py-2.5 text-left
    border rounded-lg bg-transparent transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
    ${error 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'}
    ${disabled 
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
      : 'cursor-pointer hover:bg-gray-50'}
    ${className}
  `.trim();

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        name={name}
        className={buttonClasses}
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className={`block truncate ${selectedOptions.length === 0 ? 'text-gray-400' : ''}`}>
            {displayText}
          </span>
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen &&
        ReactDOM.createPortal(
          <div
            ref={listRef}
            className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto py-1"
            style={dropdownStyles}
            onScroll={handleListScroll}
          >
            {searchable && (
              <div className="px-2 pb-1 sticky top-0 bg-white z-10">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {options.length === 0 ? (
              <div className="px-3 py-2.5 text-gray-500 text-sm">
                No options available
              </div>
            ) : (
              options.map((option, index) => (
                <div
                  key={`${option.value}-${index}`}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCheckboxChange(option.value, !value.includes(option.value));
                  }}
                >
                  <Checkbox
                    checked={value.includes(option.value)}
                    onChange={(checked) => handleCheckboxChange(option.value, checked)}
                    label={option.label}
                  />
                </div>
              ))
            )}

            {hasMore && (
              <div className="px-3 py-2 text-center text-sm text-gray-500">
                {loadingMore ? 'Loading more...' : 'Scroll to load more'}
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

export default MultiSelectDropdown;
