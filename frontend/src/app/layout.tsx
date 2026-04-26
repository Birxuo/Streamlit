import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FinanceProvider } from "@/context/FinanceContext";
import { Sidebar, TopBar } from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Streamlit — AI Financial Intelligence",
  description:
    "Upload your bank statement and uncover hidden financial leaks with institutional-grade AI analysis. Privacy-first, local-first.",
  keywords: ["finance", "budgeting", "AI", "spending analysis", "Streamlit"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-screen bg-slate-950 text-slate-50 flex flex-col overflow-x-hidden">
        <FinanceProvider>
          <Sidebar />
          <div className="lg:pl-64 flex flex-col min-h-screen">
            <TopBar />
            <main className="flex-1 p-8">
              {children}
            </main>
          </div>
        </FinanceProvider>
      </body>
    </html>
  );
}
