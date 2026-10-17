"use client";

import { useState } from "react";
import { OrgSidebar } from "@/components/layout/org-sidebar";
import { OrgHeader } from "@/components/layout/org-header";
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider";

interface OrgShellProps {
  organizationName: string;
  userEmail: string;
  activeEventsCount?: number;
  children: React.ReactNode;
}

export function OrgShell({
  organizationName,
  userEmail,
  activeEventsCount = 0,
  children,
}: OrgShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-[#F7F8FA] flex font-sans antialiased">
        {/* Sidebar for Desktop & Mobile Overlay */}
        <OrgSidebar
          organizationName={organizationName}
          userEmail={userEmail}
          activeEventsCount={activeEventsCount}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Work Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <OrgHeader onMenuToggle={() => setSidebarOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1536px] mx-auto space-y-8">
            {children}
          </main>
        </div>
      </div>
    </OnboardingProvider>
  );
}
