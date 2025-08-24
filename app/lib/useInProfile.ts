// lib/useInProfile.ts
"use client";
import { usePathname } from "next/navigation";
export function useInProfile() {
  const pathname = usePathname();
  return pathname.startsWith("/profile");
}
