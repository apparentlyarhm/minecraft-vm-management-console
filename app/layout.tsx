import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PrimeReactProvider } from "primereact/api";
import { ToastProvider } from "@/components/context/ToastContext";
import "./globals.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import AppWrapper from "@/lib/AppWrapper";
import { isServerUp } from "@/lib/component-utils/pingUtils";

export const metadata: Metadata = {
  title: "Control panel",
  description: "it does something",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isFallbackMode = !(await isServerUp());

  return (
    <html lang="en" className="font-ember">
      <body
        className={``}
      >
        <PrimeReactProvider value={{ unstyled: false }}>
          <ToastProvider>

            <AppWrapper isFallbackMode={isFallbackMode}>
              {children}
            </AppWrapper>

          </ToastProvider>
        </PrimeReactProvider>
      </body>
    </html>
  );
}
