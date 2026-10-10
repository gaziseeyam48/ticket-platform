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
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Organization Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Profile and workspace configuration.</p>
      </div>

      <Card className="border-zinc-200 bg-white shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Workspace Profile</CardTitle>
          <CardDescription>Details regarding your organization account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-zinc-500">
                <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                Organization Name
              </div>
              <div className="text-sm font-semibold text-zinc-900">{orgInfo.organization.name}</div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-zinc-500">
                <span className="text-xs font-mono">#</span>
                Organization Slug
              </div>
              <div className="text-sm font-mono text-zinc-800">{orgInfo.organization.slug}</div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-zinc-500">
                <UserCheck className="h-3.5 w-3.5 text-zinc-400" />
                Your Role
              </div>
              <div className="text-sm font-semibold text-zinc-900">{orgInfo.role}</div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-zinc-500">
                <Mail className="h-3.5 w-3.5 text-zinc-400" />
                Admin Email
              </div>
              <div className="text-sm text-zinc-800 truncate font-mono">{user.email}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
