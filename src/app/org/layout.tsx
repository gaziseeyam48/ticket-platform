import { ReactNode } from "react";
import { connection } from "next/server";
import { createServerDbClient } from "@/lib/db/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";

export const instant = false;

export default async function OrgLayout({ children }: { children: ReactNode }) {
  await connection();
  const supabase = await createServerDbClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch or auto-provision organization for this user
  const orgInfo = await getOrCreateUserOrganization(user.id, user.email);
  const organization = orgInfo?.organization || null;

  return (
    <div className="min-h-screen bg-zinc-50/60 flex flex-col font-sans">
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/org" className="font-editorial text-xl font-bold tracking-tight text-zinc-900">
              TicketPlatform
            </Link>
            {organization && (
              <span className="text-xs font-mono font-medium text-zinc-600 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-sm">
                {organization.name}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-5">
            <nav className="flex items-center gap-5 text-xs font-medium text-zinc-600">
              <Link href="/org" className="hover:text-zinc-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/org/events" className="hover:text-zinc-900 transition-colors">
                Events
              </Link>
              <Link href="/org/settings" className="hover:text-zinc-900 transition-colors">
                Settings
              </Link>
            </nav>
            
            <div className="h-4 w-px bg-zinc-200" />
            
            <form action={logoutAction}>
              <Button variant="outline" size="sm" type="submit" className="text-xs text-zinc-700">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
