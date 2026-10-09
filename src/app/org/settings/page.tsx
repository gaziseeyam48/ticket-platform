import { connection } from "next/server";
import { createServerDbClient } from "@/lib/db/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";
import { Building2, UserCheck, Mail } from "lucide-react";

export const metadata = {
  title: "Settings - Ticket Platform",
  description: "Manage organization settings",
};

export const instant = false;


export default async function SettingsPage() {
  await connection();
  const supabase = await createServerDbClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const orgInfo = await getOrCreateUserOrganization(user.id, user.email);
  if (!orgInfo) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Organization Settings</h1>
        <p className="text-zinc-400 mt-1">View and manage your organization profile.</p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg">Organization Profile</CardTitle>
          <CardDescription>Details about your organization workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800/80 space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                <Building2 className="h-4 w-4 text-zinc-500" />
                Organization Name
              </div>
              <div className="text-base font-semibold text-zinc-100">{orgInfo.organization.name}</div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800/80 space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                <span className="text-xs font-mono">#</span>
                Organization Slug
              </div>
              <div className="text-base font-mono text-zinc-300">{orgInfo.organization.slug}</div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800/80 space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                <UserCheck className="h-4 w-4 text-zinc-500" />
                Your Role
              </div>
              <div className="text-base font-semibold text-indigo-400">{orgInfo.role}</div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800/80 space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                <Mail className="h-4 w-4 text-zinc-500" />
                User Email
              </div>
              <div className="text-base text-zinc-300 truncate">{user.email}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
