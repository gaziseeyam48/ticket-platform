"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth.actions";

interface OrgHeaderProps {
  onMenuToggle?: () => void;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function OrgHeader({
  onMenuToggle,
  title,
  breadcrumbs,
}: OrgHeaderProps) {
  const pathname = usePathname();

  // Dynamically resolve page title and breadcrumbs based on the active route
  const resolveRoute = () => {
    if (breadcrumbs && breadcrumbs.length > 0) {
      return { activeTitle: title || "Dashboard", activeBreadcrumbs: breadcrumbs };
    }

    if (pathname === "/org") {
      return { activeTitle: "Dashboard", activeBreadcrumbs: [] };
    }
    if (pathname === "/org/events") {
      return { activeTitle: "Events", activeBreadcrumbs: [] };
    }
    if (pathname === "/org/events/new") {
      return {
        activeTitle: "Create Event",
        activeBreadcrumbs: [
          { label: "Events", href: "/org/events" },
          { label: "Create Event" },
        ],
      };
    }
    if (pathname.endsWith("/form")) {
      return {
        activeTitle: "Form Builder",
        activeBreadcrumbs: [
          { label: "Events", href: "/org/events" },
          { label: "Form Builder" },
        ],
      };
    }
    if (pathname.endsWith("/edit")) {
      return {
        activeTitle: "Edit Event",
        activeBreadcrumbs: [
          { label: "Events", href: "/org/events" },
          { label: "Edit Event" },
        ],
      };
    }
    if (pathname.startsWith("/org/events/")) {
      return {
        activeTitle: "Event Workspace",
        activeBreadcrumbs: [
          { label: "Events", href: "/org/events" },
          { label: "Event Workspace" },
        ],
      };
    }
    if (pathname === "/org/audit-logs") {
      return { activeTitle: "Audit Logs", activeBreadcrumbs: [] };
    }
    if (pathname === "/org/settings") {
      return { activeTitle: "Settings", activeBreadcrumbs: [] };
    }
    if (pathname.startsWith("/verify")) {
      return { activeTitle: "Verify Entrance", activeBreadcrumbs: [] };
    }

    return { activeTitle: title || "Dashboard", activeBreadcrumbs: [] };
  };

  const { activeTitle, activeBreadcrumbs } = resolveRoute();

  return (
    <header className="sticky top-0 z-20 h-15 border-b border-[#DCE1E8] bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu & Breadcrumbs / Dynamic Title */}
      <div className="flex items-center gap-3 min-w-0">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-[#525B6B] hover:text-[#171923] hover:bg-[#F1F4F8] transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {activeBreadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm font-medium text-[#525B6B] truncate">
            {activeBreadcrumbs.map((crumb, idx) => {
              const isLast = idx === activeBreadcrumbs.length - 1;
              return (
                <span key={idx} className="flex items-center gap-1.5 truncate">
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-[#171923] transition-colors truncate"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-[#171923] truncate">{crumb.label}</span>
                  )}
                  {!isLast && <span className="text-[#DCE1E8]">/</span>}
                </span>
              );
            })}
          </nav>
        ) : (
          <h1 className="text-base font-bold text-[#171923] truncate">{activeTitle}</h1>
        )}
      </div>

      {/* Right: Sign Out Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <form action={logoutAction}>
          <button
            type="submit"
            title="Sign Out"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#DCE1E8] bg-[#F8FAFC] text-xs font-semibold text-[#525B6B] hover:text-[#C2415D] hover:bg-[#FFF1F2] hover:border-[#FECDD3] transition-all shadow-[inset_0_1px_1px_rgba(0,0,0,0.03),0_1px_2px_rgba(23,25,35,0.03)] cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
