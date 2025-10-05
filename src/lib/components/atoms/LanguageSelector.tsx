import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import Typography from "./Typography";
import { useTranslation } from "react-i18next";

interface Language {
  code: string;
  name: string;
  Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

interface Props {
  className?: string;
  languages: Language[];
  defaultLanguage?: Language;
  onLanguageChange?: (language: Language) => void;
}

const LanguageSelector: React.FC<Props> = ({
  className,
  languages,
  defaultLanguage,
  onLanguageChange,
}) => {
  const { i18n } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    if (defaultLanguage) return defaultLanguage;
    const currentLanguage = languages.find(
      (lang) => lang.code === i18n.language
    );
    return currentLanguage || languages[0];
  });

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
    onLanguageChange?.(language);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={twMerge(
          "flex items-center space-x-2 px-4 py-2  hover:border-gray-300 transition-all duration-200",
          className
        )}
      >
        {selectedLanguage.Icon && <selectedLanguage.Icon className="w-7 h-4" />}
        <Typography
          element="span"
          weight="semibold"
          size="base"
          className="text-secondary-100"
        >
          {selectedLanguage.name}
        </Typography>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute mt-2 w-fit bg-white rounded-lg shadow-lg border border-gray-200 py-1" style={{zIndex: 2147483648}}>
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language)}
              className={`w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition-colors duration-150 ${
                selectedLanguage.code === language.code ? "bg-gray-50" : ""
              }`}
            >
              {language.Icon && <language.Icon className="w-7 h-4" />}
              <Typography
                element="span"
                weight="semibold"
                size="base"
                className="text-secondary-100"
              >
                {language.name}
              </Typography>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
