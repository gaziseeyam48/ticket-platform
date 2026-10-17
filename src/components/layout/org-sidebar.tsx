"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Settings,
  QrCode,
  Building2,
  Ticket,
  X,
  ExternalLink,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface OrgSidebarProps {
  organizationName?: string;
  userEmail?: string;
  isOpen?: boolean;
  onClose?: () => void;
  activeEventsCount?: number;
}

export function OrgSidebar({
  organizationName = "My Organization",
  userEmail = "admin@example.com",
  isOpen = false,
  onClose,
  activeEventsCount = 0,
}: OrgSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      group: "Operations",
      items: [
        {
          label: "Dashboard",
          href: "/org",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          label: "Events",
          href: "/org/events",
          icon: Calendar,
          badge: activeEventsCount > 0 ? activeEventsCount : undefined,
          exact: false,
        },
      ],
    },
    {
      group: "Gate Control",
      items: [
        {
          label: "Verify Entrance",
          href: "/verify",
          icon: QrCode,
          exact: false,
        },
      ],
    },
    {
      group: "Administration",
      items: [
        {
          label: "Audit Logs",
          href: "/org/audit-logs",
          icon: ScrollText,
          exact: false,
        },
        {
          label: "Org Settings",
          href: "/org/settings",
          icon: Settings,
          exact: false,
        },
      ],
    },
  ];

  const isItemActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const userInitial = (userEmail[0] || "U").toUpperCase();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#DCE1E8] flex items-center justify-between">
        <Link href="/org" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-[#171923] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Ticket className="h-4.5 w-4.5 text-zinc-100" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-[#171923] leading-none flex items-center gap-1.5">
              <span>TicketKoi</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#087F5B]" />
            </div>
            <div className="text-xs text-[#525B6B] mt-1 flex items-center gap-1.5 truncate max-w-[140px]">
              <Building2 className="h-3 w-3 text-[#667085] shrink-0" />
              <span className="truncate">{organizationName}</span>
            </div>
          </div>
        </Link>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[#667085] hover:text-[#171923] hover:bg-[#F1F4F8] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        {navItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-2.5 pb-1.5 text-[11px] uppercase tracking-wider text-[#667085] font-semibold">
              {group.group}
            </div>

            {group.items.map((item) => {
              const active = isItemActive(item.href, item.exact);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    active
                      ? "bg-[#171923] text-white font-semibold shadow-xs"
                      : "text-[#525B6B] hover:text-[#171923] hover:bg-[#F1F4F8]"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors shrink-0",
                        active
                          ? "text-white"
                          : "text-[#667085] group-hover:text-[#171923]"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded-full shrink-0",
                        active
                          ? "bg-zinc-800 text-zinc-200"
                          : "bg-[#F1F4F8] text-[#525B6B] border border-[#DCE1E8]"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Quick Link to Public Portal */}
        <div className="pt-2 px-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between p-2.5 rounded-xl border border-dashed border-[#DCE1E8] text-[#525B6B] hover:text-[#171923] hover:border-[#9AA4B2] hover:bg-[#F1F4F8] transition-all text-sm font-medium"
          >
            <span>Public Portal</span>
            <ExternalLink className="h-3.5 w-3.5 text-[#667085]" />
          </Link>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-[#DCE1E8] bg-[#F7F8FA]">
        <div className="p-2.5 rounded-xl bg-white border border-[#DCE1E8] shadow-2xs flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#171923] text-white font-bold text-xs flex items-center justify-center shrink-0">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#171923] truncate">
              {userEmail.split("@")[0]}
            </p>
            <p className="text-xs text-[#525B6B] truncate">
              Organizer Admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-[#DCE1E8] bg-white shrink-0 sticky top-0 h-screen z-30 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
