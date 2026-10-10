import { connection } from "next/server";
import { createServerDbClient } from "@/lib/db/server";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";
import { Building2, UserCheck, Mail, ShieldCheck, Key } from "lucide-react";

export const metadata = {
  title: "Organization Settings — Ticket Platform",
  description: "Manage organization workspace, admin credentials, and gate permissions",
};

export const instant = false;

export default async function SettingsPage() {
  await connection();
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const orgInfo = await getOrCreateUserOrganization(user.id, user.email);
  if (!orgInfo) return null;

  return (
    <div className="max-w-3xl space-y-6 mx-auto">
      <div className="pb-4 border-b border-zinc-200/60">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Organization Profile
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Identity, permissions, and security parameters for this workspace.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-900">
              Workspace Profile
            </h2>
          </div>
          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
            Active Tenant
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
              <Building2 className="h-3.5 w-3.5 text-zinc-400" />
              Organization Name
            </div>
            <div className="text-sm font-semibold text-zinc-900">
              {orgInfo.organization.name}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
              <span className="font-mono text-zinc-400">#</span>
              Workspace Identifier
            </div>
            <div className="text-sm font-mono text-zinc-800 font-medium">
              /{orgInfo.organization.slug}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
              <UserCheck className="h-3.5 w-3.5 text-zinc-400" />
              Assigned Role
            </div>
            <div className="text-sm font-semibold text-zinc-900">
              {orgInfo.role}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
              <Mail className="h-3.5 w-3.5 text-zinc-400" />
              Primary Administrator
            </div>
            <div className="text-sm text-zinc-800 truncate">
              {user.email}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
          <ShieldCheck className="h-4 w-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-900">
            Verification Protocol Security
          </h2>
        </div>

        <p className="text-xs text-zinc-500 leading-relaxed">
          Public ticket tokens are salted and hashed using one-way cryptographic SHA-256 before persistence. Entrance check-ins enforce atomic single-use state transitions with zero race window concurrency.
        </p>

        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between text-xs text-zinc-600">
          <span className="font-medium">Concurrency Engine: Atomic Postgres Row Locks</span>
          <span className="text-emerald-700 font-semibold">Active</span>
        </div>
      </div>
    </div>
  );
}
