import { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 p-6 sm:p-8 font-sans">
      <header className="max-w-md w-full mx-auto">
        <Link href="/" className="text-2xl font-bold tracking-tight text-zinc-900 hover:opacity-80 transition-opacity">
          TicketPlatform
        </Link>
      </header>

      <div className="w-full max-w-md mx-auto my-auto py-8">
        {children}
      </div>

      <footer className="max-w-md w-full mx-auto text-xs text-zinc-400 text-center">
        &copy; 2026 TicketPlatform • Autonomous Event Ticketing
      </footer>
    </div>
  );
}
