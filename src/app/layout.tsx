import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "./styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Local Bricolage Grotesque font for headings
const bricolageGrotesque = localFont({
  src: [
    {
      path: '../../public/fonts/BricolageGrotesque-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/BricolageGrotesque-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/BricolageGrotesque-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-bricolage',
});

export const metadata: Metadata = {
  title: "Veridie - Connect with Elite College Consultants",
  description: "Get personalized guidance from top-tier mentors who've been there, done that.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bricolageGrotesque.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
