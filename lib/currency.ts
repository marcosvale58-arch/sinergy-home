// Mock conversion rates for MVP (Base: USD)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  VES: 36.5, // Tasa simulada
};

export const convertToBase = (amount: number, fromCurrency: string, baseCurrency: string): number => {
  if (fromCurrency === baseCurrency) return amount;
  
  const amountInUsd = amount / (EXCHANGE_RATES[fromCurrency] || 1);
  const rateToBase = EXCHANGE_RATES[baseCurrency] || 1;
  
  return amountInUsd * rateToBase;
};
