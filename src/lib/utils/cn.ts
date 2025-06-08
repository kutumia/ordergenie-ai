// src/lib/utils/cn.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines Tailwind and conditional class names,
 * automatically merging conflicting Tailwind classes.
 * Usage: cn("p-4", isActive && "bg-green-500", customClass)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs.filter(Boolean)))
}
