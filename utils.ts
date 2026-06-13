import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date for display
 */
export function formatDate(
  date: Date | string | null | undefined,
  locale: string = "ar-SA",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * Format a date-time for display
 */
export function formatDateTime(
  date: Date | string | null | undefined,
  locale: string = "ar-SA"
): string {
  return formatDate(date, locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a currency value
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = "SAR",
  locale: string = "ar-SA"
): string {
  if (amount === null || amount === undefined) return "-";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a number
 */
export function formatNumber(
  num: number | string | null | undefined,
  locale: string = "ar-SA"
): string {
  if (num === null || num === undefined) return "-";
  const n = typeof num === "string" ? parseFloat(num) : num;
  return new Intl.NumberFormat(locale).format(n);
}

/**
 * Calculate days between two dates
 */
export function daysBetween(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get relative time (e.g., "2 hours ago") - alias for relative time
 */
export function formatRelativeTime(date: Date | string, locale: string = "ar"): string {
  return getRelativeTime(date, locale);
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string, locale: string = "ar"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (seconds < 60) return rtf.format(-seconds, "second");
  if (minutes < 60) return rtf.format(-minutes, "minute");
  if (hours < 24) return rtf.format(-hours, "hour");
  if (days < 30) return rtf.format(-days, "day");
  const months = Math.floor(days / 30);
  if (months < 12) return rtf.format(-months, "month");
  const years = Math.floor(days / 365);
  return rtf.format(-years, "year");
}

/**
 * Generate a random string
 */
export function generateRandomString(length: number = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a unique ID with prefix
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${randomStr}`;
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate Saudi national ID (10 digits starting with 1 or 2)
 */
export function validateSaudiNationalId(id: string): boolean {
  return /^[12]\d{9}$/.test(id);
}

/**
 * Validate IBAN (Saudi format)
 */
export function validateSaudiIBAN(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, "").toUpperCase();
  return /^SA\d{22}$/.test(cleaned);
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

/**
 * Get initials from name
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Check if running on server
 */
export const isServer = typeof window === "undefined";

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get locale-aware text
 */
export function getLocalizedText(
  ar: string,
  en: string,
  locale: string
): string {
  return locale === "ar" ? ar : en;
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date | string): number {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Paginate array
 */
export function paginate<T>(array: T[], page: number = 1, pageSize: number = 10) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return {
    data: array.slice(startIndex, endIndex),
    total: array.length,
    page,
    pageSize,
    totalPages: Math.ceil(array.length / pageSize),
    hasNext: endIndex < array.length,
    hasPrev: page > 1,
  };
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
