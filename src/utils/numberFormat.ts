/**
 * Formats numbers with French thousand separators (spaces)
 * Example: 1234567 -> "1 234 567"
 */
export const formatNumberFrench = (
  value: number | string | null | undefined,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  // Handle null, undefined, or empty string
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if it's a valid number
  if (isNaN(numValue)) {
    return '0';
  }

  // Use French locale to get space separators
  const formatter = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: options.minimumFractionDigits || 0,
    maximumFractionDigits: options.maximumFractionDigits || 0,
  });

  return formatter.format(numValue);
};

/**
 * Formats currency amounts with French thousand separators
 * Example: 1234567 -> "1 234 567"
 */
export const formatCurrencyFrench = (
  value: number | string | null | undefined
): string => {
  return formatNumberFrench(value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Formats currency amounts with French thousand separators and decimal places
 * Example: 1234567.89 -> "1 234 567,89"
 * Example: 1234567 -> "1 234 567,00"
 */
export const formatCurrencyFrenchWithDecimals = (
  value: number | string | null | undefined,
  decimalPlaces: number = 2
): string => {
  return formatNumberFrench(value, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
};

/**
 * Formats currency amounts with French thousand separators (spaces) but English decimal separator (dot)
 * Example: 1234567.89 -> "1 234 567.89"
 * Example: 1234567 -> "1 234 567.00"
 */
export const formatCurrencyFrenchSpacesEnglishDecimals = (
  value: number | string | null | undefined,
  decimalPlaces: number = 2
): string => {
  // Handle null, undefined, or empty string
  if (value === null || value === undefined || value === '') {
    return '0.00';
  }

  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if it's a valid number
  if (isNaN(numValue)) {
    return '0.00';
  }

  // Format with French locale first to get spaces for thousands
  const frenchFormatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(numValue);

  // Replace French decimal comma with English decimal dot
  return frenchFormatted.replace(',', '.');
};

/**
 * MAIN FORMATTING FUNCTION - Use this for all amount displays
 * Formats amounts with French thousand separators (spaces) and English decimal separator (dot)
 * Always displays exactly 2 decimal places
 * Example: 1234567.89 -> "1 234 567.89"
 * Example: 1234567 -> "1 234 567.00"
 */
export const formatAmount = (
  value: number | string | null | undefined
): string => {
  return formatCurrencyFrenchSpacesEnglishDecimals(value, 2);
};

/**
 * Parse a French-formatted number string back to a number
 * Example: "1 234 567" -> 1234567
 */
export const parseFrenchNumber = (value: string): number => {
  if (!value || typeof value !== 'string') {
    return 0;
  }
  
  // Remove spaces and other French formatting
  const cleanedValue = value.replace(/\s/g, '').replace(/[^\d.,]/g, '');
  
  // Handle comma as decimal separator (French style)
  const normalizedValue = cleanedValue.replace(',', '.');
  
  const parsed = parseFloat(normalizedValue);
  return isNaN(parsed) ? 0 : parsed;
};
