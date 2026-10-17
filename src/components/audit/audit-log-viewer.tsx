"use client";

import { useState, useMemo } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  ScrollText,
  Search,
  Filter,
  Shield,
  Clock,
  User,
  KeyRound,
  Cpu,
  Ticket,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Eye,
  ChevronDown,
  X,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import { AuditLogRecord } from "@/lib/services/audit.service";

interface AuditLogViewerProps {
  initialLogs: AuditLogRecord[];
  events: Array<{ id: string; name: string }>;
  organizationName: string;
}

export function AuditLogViewer({
  initialLogs,
  events,
  organizationName,
}: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLogRecord[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedActorType, setSelectedActorType] = useState<string>("ALL");
  const [inspectingLog, setInspectingLog] = useState<AuditLogRecord | null>(null);

  // Filter categorization
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Event filter
      if (selectedEventId !== "ALL" && log.event_id !== selectedEventId) {
        return false;
      }

      // 2. Actor Type filter
      if (selectedActorType !== "ALL" && log.actor_type !== selectedActorType) {
        return false;
      }

      // 3. Category filter
      if (selectedCategory !== "ALL") {
        if (selectedCategory === "LIFECYCLE" && !log.action.startsWith("EVENT_")) {
          return false;
        }
        if (
          selectedCategory === "PAYMENTS" &&
          !log.action.includes("PAYMENT")
        ) {
          return false;
        }
        if (
          selectedCategory === "REGISTRATIONS" &&
          !log.action.startsWith("REGISTRATION_") &&
          !log.action.includes("FORM_")
        ) {
          return false;
        }
        if (
          selectedCategory === "TICKETS" &&
          !log.action.startsWith("TICKET_")
        ) {
          return false;
        }
        if (
          selectedCategory === "CHECKINS" &&
          log.action !== "TICKET_CHECKED_IN"
        ) {
          return false;
        }
        if (
          selectedCategory === "VERIFIERS" &&
          !log.action.startsWith("VERIFIER_")
        ) {
          return false;
        }
      }

      // 4. Search query
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const actionMatch = log.action.toLowerCase().includes(query);
        const actorMatch = log.actor_id?.toLowerCase().includes(query);
        const targetMatch = log.target_id?.toLowerCase().includes(query);
        const targetTypeMatch = log.target_type?.toLowerCase().includes(query);
        const eventMatch = log.events?.name?.toLowerCase().includes(query);
        const metaStr = log.metadata ? JSON.stringify(log.metadata).toLowerCase() : "";
        const metaMatch = metaStr.includes(query);

        return (
          actionMatch ||
          actorMatch ||
          targetMatch ||
          targetTypeMatch ||
          eventMatch ||
          metaMatch
        );
      }

      return true;
    });
  }, [logs, selectedEventId, selectedCategory, selectedActorType, search]);

  const getActionBadge = (action: string) => {
    if (action.includes("CHECKED_IN")) {
      return {
        label: "Check-in Admitted",
        classes: "bg-[#E6F7F0] text-[#06694A] border-[#A3E6CD]",
        icon: CheckCircle2,
      };
    }
    if (action.includes("REVOKED") || action.includes("CANCELLED") || action.includes("REJECTED")) {
      return {
        label: action.replace(/_/g, " "),
        classes: "bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]",
        icon: AlertTriangle,
      };
    }
    if (action.includes("APPROVED") || action.includes("ISSUED")) {
      return {
        label: action.replace(/_/g, " "),
        classes: "bg-[#E6F7F0] text-[#06694A] border-[#A3E6CD]",
        icon: Ticket,
      };
    }
    if (action.includes("PAYMENT")) {
      return {
        label: action.replace(/_/g, " "),
        classes: "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]",
        icon: CreditCard,
      };
    }
    if (action.includes("EVENT_")) {
      return {
        label: action.replace(/_/g, " "),
        classes: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
        icon: Calendar,
      };
    }
    if (action.includes("VERIFIER_")) {
      return {
        label: action.replace(/_/g, " "),
        classes: "bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]",
        icon: KeyRound,
      };
    }
    if (action.includes("FORM_")) {
      return {
        label: action.replace(/_/g, " "),
        classes: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
        icon: FileText,
      };
    }
    return {
      label: action.replace(/_/g, " "),
      classes: "bg-[#F1F4F8] text-[#171923] border-[#DCE1E8]",
      icon: Shield,
    };
  };

  const getActorBadge = (actorType: string, actorId: string | null) => {
    switch (actorType) {
      case "USER":
        return {
          label: actorId ? `Admin (${actorId.slice(0, 6)}...)` : "User",
          icon: User,
          classes: "text-[#171923] bg-[#F1F4F8] border-[#DCE1E8]",
        };
      case "VERIFIER":
        return {
          label: "Gate Staff",
          icon: KeyRound,
          classes: "text-[#6D28D9] bg-[#F5F3FF] border-[#DDD6FE]",
        };
      case "SYSTEM":
      default:
        return {
          label: "Automated System",
          icon: Cpu,
          classes: "text-[#1D4ED8] bg-[#EFF6FF] border-[#BFDBFE]",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE1E8]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#171923] flex items-center justify-center text-white shadow-2xs">
              <ScrollText className="h-4.5 w-4.5 text-zinc-100" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171923]">
              Organization Audit Trail
            </h1>
          </div>
          <p className="text-sm text-[#525B6B] mt-1.5">
            Immutable, cryptographically verifiable compliance trail for {organizationName}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[#525B6B] bg-white border border-[#DCE1E8] px-3.5 py-1.5 rounded-lg font-medium shadow-2xs">
            <strong className="text-[#171923] font-semibold">{filteredLogs.length}</strong> of {logs.length} records shown
          </span>
        </div>
      </div>

      {/* 2. Controls & Multi-dimensional Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#DCE1E8] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="h-4 w-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by action, ID, name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 h-10 text-sm font-medium rounded-xl border border-[#DCE1E8] bg-[#F8FAFC] text-[#171923] placeholder:text-[#8C96A5] shadow-[inset_0_1px_1px_rgba(0,0,0,0.03),0_1px_2px_rgba(23,25,35,0.03)] hover:border-[#B4BDC9] hover:bg-white focus:outline-none focus:border-[#171923] focus:ring-2 focus:ring-[#171923]/10 focus:bg-white transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#171923]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Event Filter */}
          <div>
            <Select
              value={selectedEventId}
              onChange={setSelectedEventId}
              placeholder="All Events"
              options={[
                { value: "ALL", label: "All Events" },
                ...events.map((ev) => ({
                  value: ev.id,
                  label: ev.name,
                })),
              ]}
            />
          </div>

          {/* Category Filter */}
          <div>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="All Categories"
              options={[
                { value: "ALL", label: "All Categories" },
                { value: "LIFECYCLE", label: "Event Lifecycle", indicatorColor: "#2563EB" },
                { value: "REGISTRATIONS", label: "Registrations & Forms", indicatorColor: "#087F5B" },
                { value: "PAYMENTS", label: "Payment Verification", indicatorColor: "#B96B08" },
                { value: "TICKETS", label: "Ticket Issuance & Revocation", indicatorColor: "#7356D8" },
                { value: "CHECKINS", label: "Turnstile Check-ins", indicatorColor: "#087F5B" },
                { value: "VERIFIERS", label: "Gate Verifiers", indicatorColor: "#0F8B8D" },
              ]}
            />
          </div>

          {/* Actor Filter */}
          <div>
            <Select
              value={selectedActorType}
              onChange={setSelectedActorType}
              placeholder="All Actors"
              options={[
                { value: "ALL", label: "All Actors" },
                { value: "USER", label: "Admins & Organizers (USER)", indicatorColor: "#171923" },
                { value: "VERIFIER", label: "Gate Staff (VERIFIER)", indicatorColor: "#7356D8" },
                { value: "SYSTEM", label: "Automated Pipeline (SYSTEM)", indicatorColor: "#2563EB" },
              ]}
            />
          </div>
        </div>

        {/* Active Filters Summary Tag */}
        {(search || selectedEventId !== "ALL" || selectedCategory !== "ALL" || selectedActorType !== "ALL") && (
          <div className="flex items-center gap-2 pt-2.5 border-t border-[#F1F4F8] text-sm">
            <span className="text-[#525B6B]">Active filters:</span>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedEventId("ALL");
                setSelectedCategory("ALL");
                setSelectedActorType("ALL");
              }}
              className="text-xs text-[#171923] hover:text-black font-semibold underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* 3. Audit Logs Table */}
      <div className="rounded-2xl border border-[#DCE1E8] bg-white shadow-2xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#F1F4F8] flex items-center justify-center text-[#667085]">
              <ScrollText className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold text-[#171923]">
              No audit records match your filters
            </h4>
            <p className="text-sm text-[#525B6B] max-w-sm mx-auto">
              {search || selectedEventId !== "ALL" || selectedCategory !== "ALL" || selectedActorType !== "ALL"
                ? "Try adjusting your search criteria or resetting filters."
                : "Administrative actions, check-ins, and ticket transactions will be logged here automatically."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#DCE1E8] bg-[#F1F4F8] text-[#525B6B] font-semibold">
                  <th className="py-3.5 px-4 font-semibold text-sm">Timestamp</th>
                  <th className="py-3.5 px-4 font-semibold text-sm">Action</th>
                  <th className="py-3.5 px-4 font-semibold text-sm">Actor</th>
                  <th className="py-3.5 px-4 font-semibold text-sm">Target Entity</th>
                  <th className="py-3.5 px-4 font-semibold text-sm">Event Context</th>
                  <th className="py-3.5 px-4 text-right font-semibold text-sm">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EDF2] text-[#171923]">
                {filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const actor = getActorBadge(log.actor_type, log.actor_id);
                  const Icon = badge.icon;
                  const ActorIcon = actor.icon;

                  return (
                    <tr key={log.id} className="hover:bg-[#F7F8FA] transition-colors">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-semibold text-[#171923] text-sm">
                          {format(new Date(log.created_at), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-[#525B6B] font-mono mt-0.5">
                          {format(new Date(log.created_at), "h:mm:ss a")}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border font-mono uppercase tracking-normal",
                            badge.classes
                          )}
                        >
                          <Icon className="h-3 w-3 shrink-0" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
                            actor.classes
                          )}
                        >
                          <ActorIcon className="h-3.5 w-3.5 shrink-0" />
                          <span>{actor.label}</span>
                        </span>
                      </td>

                      {/* Target */}
                      <td className="py-3.5 px-4">
                        {log.target_type ? (
                          <div>
                            <span className="font-mono text-xs uppercase font-bold text-[#667085]">
                              {log.target_type}
                            </span>
                            <p className="font-mono text-sm text-[#171923] truncate max-w-[160px] mt-0.5">
                              {log.metadata?.ticket_number
                                ? `#${log.metadata.ticket_number}`
                                : log.target_id
                                ? `${log.target_id.slice(0, 8)}...`
                                : "—"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[#667085]">—</span>
                        )}
                      </td>

                      {/* Event Context */}
                      <td className="py-3.5 px-4">
                        {log.events ? (
                          <span className="font-medium text-[#171923] truncate max-w-[180px] block text-sm">
                            {log.events.name}
                          </span>
                        ) : (
                          <span className="text-[#525B6B] text-xs">Organization Wide</span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs font-medium h-8 px-2.5 gap-1.5 text-[#171923] border-[#DCE1E8]"
                          onClick={() => setInspectingLog(log)}
                        >
                          <Eye className="h-3.5 w-3.5 text-[#525B6B]" />
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Log Inspection Modal */}
      {inspectingLog && (
        <Modal
          isOpen={!!inspectingLog}
          onClose={() => setInspectingLog(null)}
          title="Audit Log Entry Details"
          description={`Record ID: ${inspectingLog.id}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {/* Header parameter summary */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 text-sm space-y-2.5">
              <div className="flex justify-between items-center pb-2.5 border-b border-zinc-200/60">
                <span className="text-zinc-500 font-medium">Action:</span>
                <span className="font-mono font-bold text-zinc-900 bg-white px-2.5 py-1 rounded border border-zinc-200 text-xs">
                  {inspectingLog.action}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Timestamp:</span>
                <span className="font-semibold text-zinc-800">
                  {format(new Date(inspectingLog.created_at), "EEEE, MMMM d, yyyy 'at' h:mm:ss a")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Actor Type & ID:</span>
                <span className="font-mono text-zinc-800 text-xs">
                  {inspectingLog.actor_type} · {inspectingLog.actor_id || "SYSTEM"}
                </span>
              </div>
              {inspectingLog.target_type && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Target Entity:</span>
                  <span className="font-mono text-zinc-800 text-xs">
                    {inspectingLog.target_type} ({inspectingLog.target_id || "None"})
                  </span>
                </div>
              )}
              {inspectingLog.events && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Event:</span>
                  <span className="font-semibold text-zinc-900">
                    {inspectingLog.events.name}
                  </span>
                </div>
              )}
            </div>

            {/* Metadata Payload Box */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Metadata Payload (JSON)
              </h5>
              {inspectingLog.metadata && Object.keys(inspectingLog.metadata).length > 0 ? (
                <pre className="p-4 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto max-h-60 leading-relaxed">
                  {JSON.stringify(inspectingLog.metadata, null, 2)}
                </pre>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-50 border border-dashed border-zinc-200 text-center text-sm text-zinc-500">
                  No additional metadata was recorded for this entry.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInspectingLog(null)}
                className="text-sm font-medium"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
