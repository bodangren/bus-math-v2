import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { HeaderSimple } from "@/components/header-simple";
import { Footer } from "@/components/footer";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Math for Business Operations: Applied Accounting with Excel",
  description:
    "A comprehensive Grade 12 textbook integrating accounting principles, spreadsheet modeling, and entrepreneurship.",
  authors: [{ name: "Daniel Bodanske" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`antialiased min-h-screen flex flex-col font-sans`}
      >
        <ConvexClientProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <HeaderSimple />
              <main className="flex-1">{children}</main>
              <Footer />
            </ThemeProvider>
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
