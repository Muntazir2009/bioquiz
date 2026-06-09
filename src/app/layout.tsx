import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/site/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BioQuiz — The Biology Workspace",
  description: "Six beautifully crafted modules — AI research, a 3D cell viewer, organelles, slides and solutions, all in one calm workspace.",
  keywords: ["BioQuiz", "biology", "AI", "3D cell viewer", "organelles"],
  authors: [{ name: "BioQuiz Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Synchronous theme script — runs before paint, no flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="brown"){document.documentElement.className="brown"}else if(t==="dark"){document.documentElement.className="dark"}else{document.documentElement.className="dark"}}catch(e){}})();(function(){if(typeof window.rePaintPoll==="undefined"){window.rePaintPoll=function(){};}})();` }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <div aria-hidden className="grain-overlay" />
        <Toaster />
      </body>
    </html>
  );
}
