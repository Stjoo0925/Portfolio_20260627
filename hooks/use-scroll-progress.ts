"use client";

import { useContext } from "react";
import { ScrollProgressContext } from "@/providers/smooth-scroll-provider";

export function useScrollProgress() {
  return useContext(ScrollProgressContext);
}
