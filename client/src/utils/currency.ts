// Currency formatting utilities

/**
 * Formats a number as currency in USD
 * @param amount - The amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  options: {
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    locale?: string;
  } = {}
): string => {
  const {
    currency = "USD",
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    locale = "en-US",
  } = options;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
};

/**
 * Formats a number as currency with default USD formatting (no decimals)
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "$1,000")
 */
export const formatCurrencyUSD = (amount: number): string => {
  return formatCurrency(amount);
};

/**
 * Formats a number as currency with decimal places
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "$1,000.00")
 */
export const formatCurrencyWithDecimals = (
  amount: number,
  decimals: number = 2
): string => {
  return formatCurrency(amount, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
