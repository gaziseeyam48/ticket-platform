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
        classes: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        icon: CheckCircle2,
      };
    }
    if (action.includes("REVOKED") || action.includes("CANCELLED") || action.includes("REJECTED")) {
      return {
        label: action.replace(/_/g, " "),
        classes: "bg-rose-50 text-rose-700 border-rose-200/80",
        icon: AlertTriangle,
      };
    }
    if (action.includes("APPROVED") || action.includes("ISSUED")) {
      return {
        label: action.replace(/_/g, " "),
        classes: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        icon: Ticket,
      };
    }
    if (action.includes("PAYMENT")) {
      return {
        label: action.replace(/_/g, " "),
        classes: "bg-amber-50 text-amber-800 border-amber-200/80",
        icon: CreditCard,
      };
    }
    if (action.includes("EVENT_")) {
      return {
        label: action.replace(/_/g, " "),
        classes: "bg-sky-50 text-sky-700 border-sky-200/80",
        icon: Calendar,
      };
    }
    if (action.includes("VERIFIER_")) {
      return {
        label: action.replace(/_/g, " "),
        classes: "bg-purple-50 text-purple-700 border-purple-200/80",
        icon: KeyRound,
      };
    }
    if (action.includes("FORM_")) {
      return {
        label: action.replace(/_/g, " "),
        classes: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
        icon: FileText,
      };
    }
    return {
      label: action.replace(/_/g, " "),
      classes: "bg-zinc-100 text-zinc-700 border-zinc-200",
      icon: Shield,
    };
  };

  const getActorBadge = (actorType: string, actorId: string | null) => {
    switch (actorType) {
      case "USER":
        return {
          label: actorId ? `Admin (${actorId.slice(0, 6)}...)` : "User",
          icon: User,
          classes: "text-zinc-700 bg-zinc-100 border-zinc-200",
        };
      case "VERIFIER":
        return {
          label: "Gate Staff",
          icon: KeyRound,
          classes: "text-purple-700 bg-purple-50 border-purple-200",
        };
      case "SYSTEM":
      default:
        return {
          label: "Automated System",
          icon: Cpu,
          classes: "text-sky-700 bg-sky-50 border-sky-200",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
              <ScrollText className="h-4 w-4 text-zinc-100" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Organization Audit Trail
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Immutable, cryptographically verifiable compliance trail for {organizationName}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 bg-white border border-zinc-200 px-3 py-1 rounded-lg font-medium shadow-2xs">
            <strong>{filteredLogs.length}</strong> of {logs.length} records shown
          </span>
        </div>
      </div>

      {/* 2. Controls & Multi-dimensional Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by action, ID, name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Event Filter */}
          <div>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-800 font-medium focus:outline-none"
            >
              <option value="ALL">All Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-800 font-medium focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="LIFECYCLE">Event Lifecycle</option>
              <option value="REGISTRATIONS">Registrations & Forms</option>
              <option value="PAYMENTS">Payment Verification</option>
              <option value="TICKETS">Ticket Issuance & Revocation</option>
              <option value="CHECKINS">Turnstile Check-ins</option>
              <option value="VERIFIERS">Gate Verifiers</option>
            </select>
          </div>

          {/* Actor Filter */}
          <div>
            <select
              value={selectedActorType}
              onChange={(e) => setSelectedActorType(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-800 font-medium focus:outline-none"
            >
              <option value="ALL">All Actors</option>
              <option value="USER">Admins & Organizers (USER)</option>
              <option value="VERIFIER">Gate Staff (VERIFIER)</option>
              <option value="SYSTEM">Automated Pipeline (SYSTEM)</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary Tag */}
        {(search || selectedEventId !== "ALL" || selectedCategory !== "ALL" || selectedActorType !== "ALL") && (
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 text-xs">
            <span className="text-zinc-400">Active filters:</span>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedEventId("ALL");
                setSelectedCategory("ALL");
                setSelectedActorType("ALL");
              }}
              className="text-[11px] text-zinc-600 hover:text-zinc-900 font-semibold underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* 3. Audit Logs Table */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-2xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
              <ScrollText className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-900">
              No audit records match your filters
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {search || selectedEventId !== "ALL" || selectedCategory !== "ALL" || selectedActorType !== "ALL"
                ? "Try adjusting your search criteria or resetting filters."
                : "Administrative actions, check-ins, and ticket transactions will be logged here automatically."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200/80 bg-zinc-50/70 text-zinc-600 font-semibold">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Event Context</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const actor = getActorBadge(log.actor_type, log.actor_id);
                  const Icon = badge.icon;
                  const ActorIcon = actor.icon;

                  return (
                    <tr key={log.id} className="hover:bg-zinc-50/70 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-semibold text-zinc-900">
                          {format(new Date(log.created_at), "MMM d, yyyy")}
                        </p>
                        <p className="text-[11px] text-zinc-400 font-mono">
                          {format(new Date(log.created_at), "h:mm:ss a")}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border font-mono uppercase tracking-tight",
                            badge.classes
                          )}
                        >
                          <Icon className="h-3 w-3 shrink-0" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Actor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border",
                            actor.classes
                          )}
                        >
                          <ActorIcon className="h-3 w-3 shrink-0" />
                          <span>{actor.label}</span>
                        </span>
                      </td>

                      {/* Target */}
                      <td className="py-3 px-4">
                        {log.target_type ? (
                          <div>
                            <span className="font-mono text-[10px] uppercase font-bold text-zinc-400">
                              {log.target_type}
                            </span>
                            <p className="font-mono text-xs text-zinc-800 truncate max-w-[150px]">
                              {log.metadata?.ticket_number
                                ? `#${log.metadata.ticket_number}`
                                : log.target_id
                                ? `${log.target_id.slice(0, 8)}...`
                                : "—"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>

                      {/* Event Context */}
                      <td className="py-3 px-4">
                        {log.events ? (
                          <span className="font-medium text-zinc-800 truncate max-w-[160px] block">
                            {log.events.name}
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">Organization Wide</span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[11px] font-medium h-7 px-2 gap-1 text-zinc-700"
                          onClick={() => setInspectingLog(log)}
                        >
                          <Eye className="h-3 w-3 text-zinc-400" />
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
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60">
                <span className="text-zinc-500 font-medium">Action:</span>
                <span className="font-mono font-bold text-zinc-900 bg-white px-2 py-0.5 rounded border border-zinc-200">
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
                <span className="font-mono text-zinc-800">
                  {inspectingLog.actor_type} · {inspectingLog.actor_id || "SYSTEM"}
                </span>
              </div>
              {inspectingLog.target_type && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Target Entity:</span>
                  <span className="font-mono text-zinc-800">
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
            <div className="space-y-1.5">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Metadata Payload (JSON)
              </h5>
              {inspectingLog.metadata && Object.keys(inspectingLog.metadata).length > 0 ? (
                <pre className="p-3.5 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed">
                  {JSON.stringify(inspectingLog.metadata, null, 2)}
                </pre>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-50 border border-dashed border-zinc-200 text-center text-xs text-zinc-500">
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
                className="text-xs font-medium"
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
