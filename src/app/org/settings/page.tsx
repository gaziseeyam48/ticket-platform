import { connection } from "next/server";
import { getCachedSession } from "@/lib/db/cached-session";
import { OrgSettingsForm } from "@/components/settings/org-settings-form";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { SignOutButton } from "@/components/settings/sign-out-button";

export const metadata = {
  title: "Organization Settings — TicketKoi",
  description: "Manage organization workspace, login credentials, and account settings",
};

export const instant = false;

export default async function SettingsPage() {
  await connection();

  // Reuses deduplicated session from OrgLayout — zero extra DB call
  const { user, orgInfo } = await getCachedSession();
  if (!user || !orgInfo) return null;

  return (
    <div className="max-w-3xl space-y-6 mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Organization Settings
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your organization information and account security
          </p>
        </div>

        <SignOutButton />
      </div>

      {/* 1. Organization Details (Editable Name & Slug) */}
      <OrgSettingsForm
        initialName={orgInfo.organization.name}
        slug={orgInfo.organization.slug}
      />

      {/* 2. Account Details */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-zinc-100">
          <h2 className="text-base font-semibold text-zinc-900">
            Account Details
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Your login email and workspace permission level
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="text-sm text-zinc-600 font-medium">
              Email Address
            </div>
            <div className="text-base font-semibold text-zinc-900 truncate">
              {user.email}
            </div>
            <div className="text-xs text-zinc-500">
              Primary account for login and notifications
            </div>
          </div>

          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="text-sm text-zinc-600 font-medium">
              Role
            </div>
            <div className="text-base font-semibold text-zinc-900">
              {orgInfo.role === "OWNER" ? "Owner" : "Administrator"}
            </div>
            <div className="text-xs text-zinc-500">
              Can manage events, customize forms, and issue tickets
            </div>
          </div>
        </div>
      </div>

      {/* 3. Password Management */}
      <ChangePasswordForm />

      {/* 4. Ticket Security & Protection (Plain English, Clean Layout) */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-zinc-100">
          <h2 className="text-base font-semibold text-zinc-900">
            Ticket Protection & Security
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            How tickets and event check-ins are kept secure
          </p>
        </div>

        <div className="space-y-3 text-sm text-zinc-600">
          <div className="flex items-start gap-2.5">
            <span className="font-semibold text-zinc-900 min-w-[140px]">No Double Entry:</span>
            <span className="text-zinc-600">Each ticket pass can only be checked in once. Second scan attempts are flagged immediately at the gate.</span>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="font-semibold text-zinc-900 min-w-[140px]">Tamper-Proof QR:</span>
            <span className="text-zinc-600">Ticket links and QR codes use encrypted tokens so attendees cannot guess or duplicate others&apos; passes.</span>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="font-semibold text-zinc-900 min-w-[140px]">Staff Scanner Links:</span>
            <span className="text-zinc-600">Volunteers use a single-click magic link to scan tickets on their phone camera without needing an account.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
