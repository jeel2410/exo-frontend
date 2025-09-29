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
