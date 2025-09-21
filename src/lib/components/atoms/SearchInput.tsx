import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { SearchIcon } from "../../../icons";
import Input from "./Input";
import Button from "./Button";

interface SearchInputProps {
  placeholder?: string;
  onSearch: (searchTerm: string) => void;
  className?: string;
  containerClassName?: string;
  initialValue?: string;
  disabled?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  onSearch,
  className = "",
  containerClassName = "",
  initialValue = "",
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (!disabled) {
      onSearch(searchTerm.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className={`relative flex ${containerClassName}`}>
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-2.5 sm:left-3 flex items-center pointer-events-none">
          <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-50" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder || t("search_placeholder")}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className={`pl-8 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base w-full h-9 sm:h-10 rounded-r-none border-r-0 ${className}`}
          disabled={disabled}
        />
      </div>
      <Button
        variant="outline"
        onClick={handleSearch}
        disabled={disabled}
        className="h-9 sm:h-10 px-3 sm:px-4 rounded-l-none border-l-0 hover:bg-primary-50 hover:border-primary-200 flex items-center justify-center min-w-[80px] sm:min-w-[100px]"
      >
        <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
        <span className="text-sm sm:text-base font-medium">{t("search")}</span>
      </Button>
    </div>
  );
};

export default SearchInput;
