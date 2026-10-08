import { ReactNode } from "react";
import { createServerDbClient } from "@/lib/db/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";

export const instant = false;

export default async function OrgLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerDbClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the organization for this user
  const { data: orgUsers } = await supabase
    .from("organization_users")
    .select("role, organizations(name, slug)")
    .eq("user_id", user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const organization = (orgUsers as any)?.organizations as any; // Type workaround for now
  
  if (!organization) {
    // If they have no org for some reason, we might want to handle it (e.g. redirect to an org creation page). 
    // For now we just display a generic header.
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/org" className="font-bold text-xl tracking-tight text-zinc-100">
              Ticket<span className="text-zinc-500">Platform</span>
            </Link>
            {organization && (
              <span className="text-sm font-medium text-zinc-400 bg-zinc-800/50 px-2.5 py-1 rounded-md">
                {organization.name}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-4 text-sm font-medium text-zinc-400">
              <Link href="/org" className="hover:text-zinc-100 transition-colors">
                Dashboard
              </Link>
              <Link href="/org/events" className="hover:text-zinc-100 transition-colors">
                Events
              </Link>
              <Link href="/org/settings" className="hover:text-zinc-100 transition-colors">
                Settings
              </Link>
            </nav>
            
            <div className="h-6 w-px bg-zinc-800 mx-2" />
            
            <form action={logoutAction}>
              <Button variant="outline" size="sm" type="submit" className="text-zinc-300">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
