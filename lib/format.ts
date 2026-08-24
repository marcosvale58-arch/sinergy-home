// Consistent formatting utilities to prevent SSR / Client hydration mismatches in Next.js

export function formatNumber(
  amount: number | string | undefined | null,
  options?: Intl.NumberFormatOptions
): string {
  if (amount === undefined || amount === null) return "0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("en-US", options).format(num);
}

export function formatCurrency(
  amount: number | string | undefined | null,
  currency = "USD",
  decimals = 2
): string {
  if (amount === undefined || amount === null) return "$0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatDate(
  date: string | Date | undefined | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
    ...options,
  };

  return new Intl.DateTimeFormat("es-ES", defaultOptions).format(d);
}

export function formatDateMonthYear(
  date: string | Date | undefined | null,
  locale = "es-ES"
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}
