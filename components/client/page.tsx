'use client';

import { ThemeProvider } from "../theme/provider";
import { TranslationProvider, useTranslation } from "../../contexts/translation-context";
import { AuthProvider } from "../auth/auth-provider";
import { MLProvider } from "../../contexts/ml-context";
import { Sidebar } from "@/components/sidebar/page";
import { Toaster } from "sonner";
import { LanguageSettings } from "@/components/settings/language";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { currentLanguage } = useTranslation();

  // Update html lang attribute when language changes
  if (typeof document !== 'undefined') {
    document.documentElement.lang = currentLanguage;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <MLProvider>
          <div className="relative flex min-h-screen flex-col bg-background">
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-4 pt-16 pb-20 md:pt-4 md:pb-4">
                  {children}
                </div>
              </main>
            </div>
          </div>
          <Toaster richColors closeButton position="top-right" />
        </MLProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <TranslationProvider>
      <LayoutContent>{children}</LayoutContent>
    </TranslationProvider>
  );
}
