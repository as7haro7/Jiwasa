import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFullImageUrl(path: string | undefined | null): string {
  if (!path) return ""; // Or a default placeholder URL

  // 1. Fix corrupted "undefined" prefix from previous bugs
  let cleanPath = path;
  if (cleanPath.startsWith("undefined")) {
      cleanPath = cleanPath.replace("undefined", "");
  }

  // 2. If it's already a full URL, return it
  if (cleanPath.startsWith("http") || cleanPath.startsWith("https")) {
      return cleanPath;
  }

  // 3. Normalize slashes (fix Windows backslashes)
  cleanPath = cleanPath.replace(/\\/g, "/");

  // 4. Ensure it starts with / if not present
  if (!cleanPath.startsWith("/")) {
      cleanPath = `/${cleanPath}`;
  }

  // 5. Prepend Backend URL
  // We explicitly check environment variable, otherwise fallback to localhost:4000
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  // Remove '/api' from the end to get the base domain
  const baseUrl = apiUrl.replace(/\/api$/, "");

  return `${baseUrl}${cleanPath}`;
}
