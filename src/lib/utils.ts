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
