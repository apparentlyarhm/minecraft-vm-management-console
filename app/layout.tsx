import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PrimeReactProvider } from "primereact/api";
import { ToastProvider } from "@/components/context/ToastContext";
import "./globals.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Randomass console",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-ember">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PrimeReactProvider value={{ unstyled: false }}>
          <ToastProvider>{children}</ToastProvider>
        </PrimeReactProvider>
      </body>
    </html>
  );
}
