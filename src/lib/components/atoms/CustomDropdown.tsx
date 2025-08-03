import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  flag?: React.ReactNode;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  showIcon?: boolean;
  showFlag?: boolean;
  autoFocus?: boolean;
  id?: string;
  name?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Select an option...",
  disabled = false,
  error = false,
  className = "",
  showIcon = false,
  showFlag = false,
  autoFocus = false,
  id,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    if (autoFocus && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [autoFocus]);

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

  const updateDropdownPosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setDropdownStyles({
        position: "absolute",
        top: `${rect.bottom + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
        width: `${rect.width}px`,
        zIndex: 9999,
      });
    }
  };

  const handleToggle = () => {
    if (!disabled) {
      if (!isOpen) updateDropdownPosition();
      setIsOpen(prev => !prev);
      setFocusedIndex(-1);
    }
  };

  const handleSelect = (option: DropdownOption) => {
    onChange(option.value);
    setIsOpen(false);
    setFocusedIndex(-1);
    onBlur?.();
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          updateDropdownPosition();
          setFocusedIndex(0);
        } else if (focusedIndex >= 0) {
          handleSelect(options[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        onBlur?.();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          updateDropdownPosition();
          setFocusedIndex(0);
        } else {
          setFocusedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
        }
        break;
      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
          setFocusedIndex(-1);
          onBlur?.();
        }
        break;
      default:
        break;
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

  const optionClasses = (index: number, isSelected: boolean) => `
    w-full px-3 py-2.5 text-left flex items-center gap-2 transition-colors duration-150
    ${isSelected 
      ? 'bg-blue-100 text-blue-900 font-medium' 
      : 'text-gray-900 hover:bg-gray-100'}
    ${focusedIndex === index ? 'bg-gray-100' : ''}
    cursor-pointer
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
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={id ? `${id}-label` : undefined}
      >
        <span className="flex items-center gap-2 min-w-0">
          {showFlag && selectedOption?.flag && (
            <span className="flex-shrink-0 w-5 h-4">{selectedOption.flag}</span>
          )}
          {showIcon && selectedOption?.icon && (
            <span className="flex-shrink-0 w-4 h-4">{selectedOption.icon}</span>
          )}
          <span className="block truncate">
            {selectedOption ? selectedOption.label : placeholder}
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
          <ul
            ref={listRef}
            className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto py-1"
            style={dropdownStyles}
            role="listbox"
            aria-labelledby={id ? `${id}-label` : undefined}
          >
            {options.length === 0 ? (
              <li className="px-3 py-2.5 text-gray-500 text-sm">
                No options available
              </li>
            ) : (
              options.map((option, index) => (
                <li
                  key={option.value}
                  className={optionClasses(index, option.value === value)}
                  onClick={() => handleSelect(option)}
                  role="option"
                  aria-selected={option.value === value}
                >
                  {showFlag && option.flag && (
                    <span className="flex-shrink-0 w-5 h-4">{option.flag}</span>
                  )}
                  {showIcon && option.icon && (
                    <span className="flex-shrink-0 w-4 h-4">{option.icon}</span>
                  )}
                  <span className="block truncate">{option.label}</span>
                </li>
              ))
            )}
          </ul>,
          document.body
        )}
    </div>
  );
};

export default CustomDropdown;
