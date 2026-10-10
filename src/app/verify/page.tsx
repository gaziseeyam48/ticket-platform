import { connection } from "next/server";
import { createServerDbClient } from "@/lib/db/server";
import { redirect } from "next/navigation";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";
import { VerificationScanner } from "@/components/verification/verification-scanner";

export const metadata = {
  title: "Entrance Verification — Ticket Platform",
  description: "Atomic turnstile QR pass scanner and attendee admittance station",
};

export const instant = false;

export default async function VerifyPage() {
  await connection();
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const orgInfo = await getOrCreateUserOrganization(user.id, user.email);

  return (
    <VerificationScanner
      organizationName={orgInfo?.organization?.name || "Organization"}
    />
  );
}
