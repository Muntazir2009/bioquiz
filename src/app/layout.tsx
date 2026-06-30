import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Inter } from "next/font/google";
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

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BioQuiz — The Biology Workspace",
  description: "A beautifully crafted biology workspace — AI research, a 3D cell viewer, organelles, slides and solutions, all in one calm place.",
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
        {/* Cache-bust: poll for version changes every 60s and force reload */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var INTERVAL=60000;var KEY="_bq_v";var CV="${Date.now().toString(36)}";function check(){try{var sv=localStorage.getItem(KEY);if(!sv){localStorage.setItem(KEY,CV);return}if(sv!==CV){localStorage.setItem(KEY,CV);window.location.reload(true)}}catch(e){}}check();setInterval(check,INTERVAL);window.addEventListener("focus",function(){check()});})();` }} />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}