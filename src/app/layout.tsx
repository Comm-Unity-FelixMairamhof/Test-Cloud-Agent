import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME ?? "IoT-Wizard Temperatursteuerung",
  description:
    "Mobile PWA zur Steuerung von Raumtemperaturen über ThingsBoard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "de"}>
      <body className={`${fraunces.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
