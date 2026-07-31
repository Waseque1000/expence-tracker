"use client";

import React from "react";
import { AuthProvider } from "@/lib/auth";
import { StoreProvider } from "@/lib/store";
import { ThemeProvider } from "@/lib/theme";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StoreProvider>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
