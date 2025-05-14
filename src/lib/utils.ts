import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeString(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .trim();
}

export function sanitizePhoneNumber(number: string) {
  return number.replace(/\s/g, "");
}

export function capitalizeWords(string: string) {
  return string
    .split("-")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function extractStringParts(sanitizedString: string) {
  const parts = sanitizedString.split("-");
  const idPart = parts.pop(); // Extracts the last segment (ID)
  const namePart = capitalizeWords(parts.join(" ")); // Joins the rest back as the project name with spaces

  return { namePart, idPart };
}

export function toTitleCase(text: string) {
  return text
    .toLowerCase()
    .replace(/(?<!\S)\S/gu, (match) => match.toUpperCase());
}

export const pdfToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data.split(",")[1]); // Return only the base64 part
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Convert an ISO currency code to its full name using Intl.DisplayNames,
 * with a fallback map for older environments.
 *
 * @param {string} code - The three-letter ISO currency code (e.g. "USD").
 * @param {string} [locale='en'] - BCP 47 language tag for localization.
 * @returns {string} - Full currency name (e.g. "US Dollar").
 */
export function currencyCodeToName(code: string, locale = "en") {
  // Fallback map for environments without Intl.DisplayNames
  const fallback = {
    USD: "United States Dollar",
    EUR: "Euro",
    JPY: "Japanese Yen",
    GBP: "British Pound Sterling",
    AUD: "Australian Dollar",
    CAD: "Canadian Dollar",
    CHF: "Swiss Franc",
    CNY: "Chinese Yuan",
    SEK: "Swedish Krona",
    NZD: "New Zealand Dollar",
    UGX: "Uganda Shilling",
    // …add more as needed
  };

  if (typeof Intl.DisplayNames === "function") {
    try {
      const displayNames = new Intl.DisplayNames([locale], {
        type: "currency",
      });
      const name = displayNames.of(code.toUpperCase());
      if (name) return name;
    } catch {
      // silently fall through to fallback map
    }
  }

  // Use fallback if Intl API is unavailable or returns undefined
  return fallback[code.toUpperCase() as keyof typeof fallback] || code;
}
