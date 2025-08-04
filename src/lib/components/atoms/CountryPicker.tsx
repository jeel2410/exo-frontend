import React from 'react';
import Select, { components } from 'react-select';
import * as Flags from 'country-flag-icons/react/3x2';
import { countries, CountryData } from '../../../utils/constant/countries';

interface CountryOption {
  value: string; // This will be the phone code (e.g., "+91")
  label: string; // This will be the country name
  code: string; // This will be the country code (e.g., "IN")
  phoneCode: string; // This will be the phone code (e.g., "+91")
}

// Custom option component with flag
const CustomOption = (props: any) => {
  const FlagComponent = (Flags as any)[props.data.code];
  return (
    <components.Option {...props}>
      <div className="flex items-center gap-2">
        {FlagComponent && (
          <div className="w-6 h-4 flex-shrink-0">
            <FlagComponent className="w-full h-full object-cover" />
          </div>
        )}
        <span className="text-xs text-gray-600 min-w-[40px]">{props.data.phoneCode}</span>
        <span className="text-sm truncate">{props.data.label}</span>
      </div>
    </components.Option>
  );
};

// Custom single value component with flag
const CustomSingleValue = (props: any) => {
  const FlagComponent = (Flags as any)[props.data.code];
  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-2">
        {FlagComponent && (
          <div className="w-6 h-4 flex-shrink-0">
            <FlagComponent className="w-full h-full object-cover" />
          </div>
        )}
        <span className="text-sm font-medium">{props.data.phoneCode}</span>
      </div>
    </components.SingleValue>
  );
};

const CountryPicker = ({
  value,
  onChange
}: {
  value: CountryOption | null;
  onChange: (value: CountryOption | null) => void;
}) => {
  const options = countries.map((country) => ({
    value: country.phoneCode, // Use phone code as value
    label: country.name, // Use country name as label
    code: country.code, // Country code for flag lookup
    phoneCode: country.phoneCode, // Phone code for display
  }));

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: '42px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      backgroundColor: '#f8fafc',
      '&:hover': {
        borderColor: '#94a3b8'
      },
      '&:focus-within': {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 1px #3b82f6'
      }
    }),
    menu: (provided: any) => ({
      ...provided,
      minWidth: '300px',
      maxWidth: '400px',
      zIndex: 9999
    }),
    menuList: (provided: any) => ({
      ...provided,
      maxHeight: '200px'
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      padding: '8px 12px',
      fontSize: '14px',
      '&:hover': {
        backgroundColor: '#f1f5f9'
      }
    }),
    singleValue: (provided: any) => ({
      ...provided,
      fontSize: '14px'
    }),
    placeholder: (provided: any) => ({
      ...provided,
      fontSize: '14px',
      color: '#94a3b8'
    })
  };

  return (
    <div className="min-w-[200px]">
      <Select
        options={options}
        value={value}
        onChange={onChange}
        isSearchable={true}
        placeholder="Select country"
        components={{
          Option: CustomOption,
          SingleValue: CustomSingleValue
        }}
        styles={customStyles}
        classNamePrefix="country-picker"
        menuPlacement="auto"
        menuPortalTarget={document.body}
      />
    </div>
  );
};

export default CountryPicker;

