import { connection } from "next/server";
import { getCachedSession } from "@/lib/db/cached-session";
import { getAdminClient } from "@/lib/db/admin";
import {
  Building2,
  ShieldCheck,
  UserCheck,
  Mail,
  Calendar,
  Ticket,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";
import { OrgSettingsForm } from "@/components/settings/org-settings-form";
import { QuickActionLinks } from "@/components/settings/quick-action-links";
import { SignOutButton } from "@/components/settings/sign-out-button";

export const metadata = {
  title: "Organization Settings — TicketKoi",
  description: "Manage organization workspace, admin credentials, and gate permissions",
};

export const instant = false;

export default async function SettingsPage() {
  await connection();

  // Reuses deduplicated session from OrgLayout — zero extra DB call
  const { user, orgInfo } = await getCachedSession();
  if (!user || !orgInfo) return null;

  const adminDb = getAdminClient();

  // Gather workspace counts in parallel
  const [eventsRes, ticketsRes] = await Promise.all([
    adminDb
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgInfo.organizationId),
    adminDb
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgInfo.organizationId),
  ]);

  const totalEvents = eventsRes.count || 0;
  const totalTickets = ticketsRes.count || 0;

  return (
    <div className="max-w-4xl space-y-8 mx-auto pb-12">
      {/* Header with Title and Quick Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-zinc-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Workspace Settings
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Manage your organization name, see your account details, and check security status.
          </p>
        </div>

        <SignOutButton />
      </div>

      {/* Workspace Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium">Total Events</span>
            <Calendar className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-900">{totalEvents}</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Created under this account</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium">Tickets Issued</span>
            <Ticket className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-900">{totalTickets}</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Across all events</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium">Your Role</span>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-zinc-900 truncate">{orgInfo.role}</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Full workspace privileges</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium">Security</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-emerald-700">Protected</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Zero duplicate check-ins</div>
        </div>
      </div>

      {/* 1. Editable Organization Profile Card */}
      <OrgSettingsForm
        initialName={orgInfo.organization.name}
        slug={orgInfo.organization.slug}
        role={orgInfo.role}
        userEmail={user.email || ""}
      />

      {/* 2. Account Details Card */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
          <div className="h-8 w-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-medium">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              Account & Sign-in
            </h2>
            <p className="text-xs text-zinc-500">
              The credentials and role you use to sign in to TicketKoi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
              <Mail className="h-3.5 w-3.5 text-zinc-400" />
              Primary Email
            </div>
            <div className="text-sm font-medium text-zinc-900 truncate">
              {user.email}
            </div>
            <div className="text-[11px] text-zinc-400">Used for login and event notifications</div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
              <Lock className="h-3.5 w-3.5 text-zinc-400" />
              Access Level
            </div>
            <div className="text-sm font-medium text-zinc-900 flex items-center gap-2">
              <span>{orgInfo.role === "OWNER" ? "Workspace Owner" : "Administrator"}</span>
              <span className="text-[10px] bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded font-mono">
                {orgInfo.role}
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">Can create events, manage forms, and issue tickets</div>
          </div>
        </div>
      </div>

      {/* 3. Quick Shortcuts */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-900">
            Quick Actions
          </h2>
        </div>
        <QuickActionLinks slug={orgInfo.organization.slug} />
      </div>

      {/* 4. Security & Protection Details (Plain English) */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-medium">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Ticket Security & Protection
              </h2>
              <p className="text-xs text-zinc-500">
                How TicketKoi keeps your passes secure and prevents fraud
              </p>
            </div>
          </div>
          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
            All Systems Good
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              No Duplicate Scans
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              When a pass is scanned, the entrance gate locks it instantly in milliseconds. The same ticket cannot be scanned twice.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              Cryptographic QR Codes
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              QR codes use encrypted, hashed tokens so tickets cannot be guessed, faked, or generated by outsiders.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              Passwordless Staff Entry
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Send gate scanners a one-click magic link. Volunteers scan tickets directly on mobile without needing passwords or app installs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
