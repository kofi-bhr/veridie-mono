import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { LoadingGuard } from "@/components/loading-guard"
import Script from "next/script"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Veridie - Student-to-Student College Consulting",
  description: "Connect with current university students to help you achieve your academic goals",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="loading-timeout" strategy="beforeInteractive">
          {`
            // Set a global timeout to redirect to fallback page if app doesn't load
            window.appLoadTimeout = setTimeout(function() {
              // Only redirect if we're not already on the fallback page
              if (window.location.pathname !== '/fallback') {
                console.log('Application load timeout, redirecting to fallback page');
                window.location.href = '/fallback';
              }
            }, 15000); // 15 seconds
            
            // Clear the timeout when the page is fully loaded
            window.addEventListener('load', function() {
              if (window.appLoadTimeout) {
                clearTimeout(window.appLoadTimeout);
                console.log('Page loaded successfully, cleared timeout');
              }
            });
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <LoadingGuard>
            <AuthProvider>
              <div className="flex min-h-screen flex-col">
                <NavBar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </AuthProvider>
          </LoadingGuard>
        </ThemeProvider>
      </body>
    </html>
  )
}
