import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useToast } from "@/components/context/ToastContext";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
