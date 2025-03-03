import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Loader from "@/components/shared/loader";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

export const metadata = {
  title: "Biddi Dashboard | Contractor Project Management",
  description: "Centralized platform for contractors to manage bids, track projects, and monitor financials with real-time analytics and profitability insights.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.className} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="biddi-theme"
        >
          <Suspense fallback={<Loader />}>
            {children}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}