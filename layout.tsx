import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/components/locale-provider";

export const metadata: Metadata = {
  title: {
    default: "HRMS Portal - نظام إدارة الموارد البشرية",
    template: "%s | HRMS Portal",
  },
  description:
    "Enterprise-grade HRMS & Employee Self-Service Portal with full Arabic (RTL) and English (LTR) support.",
  applicationName: "HRMS Portal",
  authors: [{ name: "HRMS Team" }],
  keywords: [
    "HRMS",
    "HR",
    "Human Resources",
    "Employee Management",
    "Payroll",
    "Attendance",
    "Leave Management",
    "Arabic",
    "Saudi Arabia",
  ],
  robots: { index: false, follow: false }, // Internal system
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
    { media: "(prefers-color-scheme: dark)", color: "#4f46e5" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Cairo:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider defaultLocale="ar" supportedLocales={["ar", "en"]}>
            {children}
            <Toaster
              position="top-center"
              richColors
              closeButton
              toastOptions={{
                duration: 4000,
              }}
            />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
