/**
 * Format price based on currency
 */
export function formatCurrency(
  price: number,
  currency: 'USD' | 'VES',
  exchangeRate: number | null
): string {
  if (currency === 'USD') {
    return `$${price.toFixed(2)}`;
  }

  if (!exchangeRate) {
    return `$${price.toFixed(2)}`;
  }

  const vesPrice = price * exchangeRate;
  return `Bs. ${vesPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

/**
 * Convert USD to VES
 */
export function convertToVes(usdPrice: number, exchangeRate: number): number {
  return usdPrice * exchangeRate;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: 'USD' | 'VES'): string {
  return currency === 'USD' ? '$' : 'Bs.';
}
