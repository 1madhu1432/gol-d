import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ScrollText,
  Search,
  Filter,
  CheckCircle2,
  Flag,
  XCircle,
  ShieldAlert,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/erp/ui";
import { useERPStore } from "@/lib/erp-store";
import { type AuditLogEntry } from "@/lib/erp-data";

export const Route = createFileRoute("/audit-logs")({
  component: AuditLogsPage,
});

const statusIcon: Record<AuditLogEntry["status"], React.ReactNode> = {
  Success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  Flagged: <Flag className="h-4 w-4 text-amber-500" />,
  Rejected: <XCircle className="h-4 w-4 text-red-500" />,
};

const statusColors: Record<AuditLogEntry["status"], string> = {
  Success: "bg-emerald-100 text-emerald-700",
  Flagged: "bg-amber-100 text-amber-700",
  Rejected: "bg-red-100 text-red-600",
};

function AuditLogsPage() {
  const { auditLogs } = useERPStore();
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const allModules = useMemo(() =>
    Array.from(new Set(auditLogs.map((l) => l.module))).sort(),
    [auditLogs]
  );

  const filtered = useMemo(() => {
    return [...auditLogs].reverse().filter((log) => {
      const matchQ =
        log.user.toLowerCase().includes(query.toLowerCase()) ||
        log.action.toLowerCase().includes(query.toLowerCase()) ||
        log.referenceId.toLowerCase().includes(query.toLowerCase());
      const matchM = moduleFilter === "All" || log.module === moduleFilter;
      const matchS = statusFilter === "All" || log.status === statusFilter;
      return matchQ && matchM && matchS;
    });
  }, [auditLogs, query, moduleFilter, statusFilter]);

  const flaggedCount = auditLogs.filter((l) => l.status === "Flagged").length;
  const rejectedCount = auditLogs.filter((l) => l.status === "Rejected").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        subtitle="Immutable trail of all system actions across modules and branches"
        action={
          <div className="flex gap-2">
            {flaggedCount > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <ShieldAlert className="h-4 w-4" />
                {flaggedCount} flagged
              </div>
            )}
            <Button variant="outline" className="border-avp-border text-avp-charcoal">
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Entries", value: auditLogs.length, color: "bg-white" },
          { label: "Flagged", value: flaggedCount, color: "bg-amber-50 border-amber-200" },
          { label: "Rejected", value: rejectedCount, color: "bg-red-50 border-red-200" },
        ].map((s) => (
          <div key={s.label} className={`p-5 rounded-xl border ${s.color} shadow-sm text-center`}>
            <p className="text-2xl font-bold text-avp-charcoal">{s.value}</p>
            <p className="text-sm text-avp-charcoal/60 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-avp-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-avp-charcoal/40" />
          <Input placeholder="Search by user, action, or reference..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2 text-avp-charcoal/50" />
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Modules</SelectItem>
            {allModules.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter className="h-4 w-4 mr-2 text-avp-charcoal/50" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Success">Success</SelectItem>
            <SelectItem value="Flagged">Flagged</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white border border-avp-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-avp-warm text-avp-charcoal/70 uppercase font-semibold text-xs">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">IP</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-avp-border/50 font-mono text-xs">
              {filtered.slice(0, 200).map((log) => (
                <tr key={log.id} className={`hover:bg-avp-warm/30 transition-colors ${log.status === "Flagged" ? "bg-amber-50/40" : log.status === "Rejected" ? "bg-red-50/30" : ""}`}>
                  <td className="px-6 py-3 whitespace-nowrap text-avp-charcoal/70">{log.timestamp}</td>
                  <td className="px-6 py-3">
                    <div className="font-sans font-medium text-avp-charcoal">{log.user}</div>
                    <div className="text-avp-charcoal/50">{log.role}</div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="bg-avp-warm border border-avp-border text-avp-charcoal font-sans text-xs px-2 py-0.5 rounded">
                      {log.module}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-sans max-w-[200px] truncate">{log.action}</td>
                  <td className="px-6 py-3 text-avp-charcoal/70">{log.referenceId}</td>
                  <td className="px-6 py-3 font-sans text-avp-charcoal/70">{log.branch}</td>
                  <td className="px-6 py-3 text-avp-charcoal/50">{log.ipAddress}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium font-sans ${statusColors[log.status]}`}>
                      {statusIcon[log.status]}
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-avp-border bg-avp-warm/30 text-xs text-avp-charcoal/60">
          Showing {Math.min(filtered.length, 200)} of {filtered.length} entries (newest first)
        </div>
      </div>
    </div>
  );
}
