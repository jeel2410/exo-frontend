// import React from "react";
import { useState, useCallback, useMemo, memo } from 'react';
import Select, { components } from "react-select";
import * as Flags from "country-flag-icons/react/3x2";
import { countries } from "../../../utils/constant/optimizedCountries";

interface CountryOption {
  value: string; // This will be the phone code (e.g., "+91")
  label: string; // This will be the country name
  code: string; // This will be the country code (e.g., "IN")
  phoneCode: string; // This will be the phone code (e.g., "+91")
}

// Custom option component with flag - memoized for performance
const CustomOption = memo((props: any) => {
  const FlagComponent = (Flags as any)[props.data.code];
  return (
    <components.Option {...props}>
      <div className="flex items-center gap-2">
        {FlagComponent && (
          <div className="w-5 h-3.5 flex-shrink-0">
            <FlagComponent className="w-full h-full object-cover" />
          </div>
        )}
        <span className="text-xs text-gray-600 min-w-[40px]">
          {props.data.phoneCode}
        </span>
        <span className="text-sm truncate">{props.data.label}</span>
      </div>
    </components.Option>
  );
});

// Custom single value component with flag - memoized for performance
const CustomSingleValue = memo((props: any) => {
  const FlagComponent = (Flags as any)[props.data.code];
  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-1">
        {FlagComponent && (
          <div className="w-4 h-3 flex-shrink-0">
            <FlagComponent className="w-full h-full object-cover" />
          </div>
        )}
        <span className="text-xs font-medium">{props.data.phoneCode}</span>
      </div>
    </components.SingleValue>
  );
});

// Optimize the country options creation with useMemo
const createCountryOptions = () => {
  return countries.map((country) => ({
    value: country.phoneCode, // Use phone code as value
    label: country.name, // Use country name as label
    code: country.code, // Country code for flag lookup
    phoneCode: country.phoneCode, // Phone code for display
  }));
};

const CountryPicker = ({
  value,
  onChange,
}: {
  value: CountryOption | null;
  onChange: (value: CountryOption | null) => void;
}) => {
  // Cache options to avoid recalculation on each render
  const options = useMemo(() => createCountryOptions(), []);
  
  // Use a state to track if the menu is open to optimize rendering
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  
  const handleMenuOpen = useCallback(() => {
    setMenuIsOpen(true);
  }, []);
  
  const handleMenuClose = useCallback(() => {
    setMenuIsOpen(false);
  }, []);

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      height: "44px",
      minHeight: "44px",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      backgroundColor: "#f8fafc",
      paddingLeft: "4px",
      paddingRight: "4px",
      "&:hover": {
        borderColor: "#94a3b8",
      },
      "&:focus-within": {
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 1px #3b82f6",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      minWidth: "250px", // Reduced width
      maxWidth: "300px", // Reduced width
      zIndex: 9999,
    }),
    menuList: (provided: any) => ({
      ...provided,
      maxHeight: "200px",
    }),
    option: (provided: any) => ({
      ...provided,
      padding: "6px 10px", // Reduced padding
      fontSize: "14px",
      "&:hover": {
        backgroundColor: "#f1f5f9",
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      fontSize: "14px",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      fontSize: "14px",
      color: "#94a3b8",
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      height: "42px",
      padding: "0 8px",
      display: "flex",
      alignItems: "center",
    }),
    indicatorsContainer: (provided: any) => ({
      ...provided,
      height: "42px",
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      padding: "4px",
    }),
  };

  return (
    <div className="min-w-[100px] max-w-[120px]">
      <Select
        options={options}
        value={value}
        onChange={onChange}
        isSearchable={true}
        placeholder="Select country"
        components={{
          Option: CustomOption,
          SingleValue: CustomSingleValue,
        }}
        styles={customStyles}
        classNamePrefix="country-picker"
        menuPlacement="auto"
        menuPortalTarget={document.body}
        onMenuOpen={handleMenuOpen}
        onMenuClose={handleMenuClose}
        menuIsOpen={menuIsOpen}
      />
    </div>
  );
};

// Export as memoized component to prevent unnecessary re-renders
export default memo(CountryPicker);
