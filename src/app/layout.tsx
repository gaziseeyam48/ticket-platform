import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TicketKoi | Event Ticket Generation & Verification",
  description: "Production-grade, lean event ticketing and atomic entrance verification system.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500;1,6..72,600&display=swap"
        />
      </head>
      <body className="min-h-screen bg-[#fbfbf9] text-zinc-900 flex flex-col antialiased selection:bg-zinc-900 selection:text-zinc-50">
        {children}
      </body>
    </html>
  );
}
