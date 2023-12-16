import "./globals.css";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
// const inter = Inter({ subsets: ["latin"] });
import { Toaster } from "@/components/ui/toaster";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
export const metadata: Metadata = {
  title: "Quix.ai",
  description: "A modern way to Teach",
};

const fontCode = localFont({
  src: [
    {
      path: "../../assets/fonts/CalSans-SemiBold.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-code",
});

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6142492019505715"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body
        className={cn(
          `min-h-screen bg-background font-sans antialiased`,
          fontCode.variable,
          fontSans.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
