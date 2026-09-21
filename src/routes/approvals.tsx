import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ListChecks,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  User,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader } from "@/components/erp/ui";
import { useERPStore } from "@/lib/erp-store";
import { formatINR, type ApprovalRequest } from "@/lib/erp-data";
import { toast } from "sonner";

export const Route = createFileRoute("/approvals")({
  component: ApprovalsPage,
});

const priorityColors: Record<string, string> = {
  Urgent: "bg-red-100 text-red-700 border-red-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Normal: "bg-blue-100 text-blue-700 border-blue-200",
  Low: "bg-slate-100 text-slate-600 border-slate-200",
};

const statusIcon: Record<string, React.ReactNode> = {
  Pending: <Clock className="h-4 w-4 text-amber-500" />,
  Approved: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  Rejected: <XCircle className="h-4 w-4 text-red-500" />,
  "Correction Required": <AlertCircle className="h-4 w-4 text-orange-500" />,
};

function ApprovalsPage() {
  const { filteredApprovals } = useERPStore();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedApp, setSelectedApp] = useState<ApprovalRequest | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, ApprovalRequest["status"]>>({});

  const filtered = useMemo(() => {
    return filteredApprovals.filter((a) => {
      const effectiveStatus = localStatuses[a.id] ?? a.status;
      const matchQ =
        a.id.toLowerCase().includes(query.toLowerCase()) ||
        a.customerName.toLowerCase().includes(query.toLowerCase()) ||
        a.transactionId.toLowerCase().includes(query.toLowerCase());
      const matchS = statusFilter === "All" || effectiveStatus === statusFilter;
      const matchT = typeFilter === "All" || a.type === typeFilter;
      return matchQ && matchS && matchT;
    });
  }, [filteredApprovals, query, statusFilter, typeFilter, localStatuses]);

  const counts = useMemo(() => {
    const pending = filteredApprovals.filter((a) => (localStatuses[a.id] ?? a.status) === "Pending").length;
    const approved = filteredApprovals.filter((a) => (localStatuses[a.id] ?? a.status) === "Approved").length;
    const rejected = filteredApprovals.filter((a) => (localStatuses[a.id] ?? a.status) === "Rejected").length;
    return { pending, approved, rejected };
  }, [filteredApprovals, localStatuses]);

  const handleAction = (id: string, action: "Approved" | "Rejected" | "Correction Required") => {
    setLocalStatuses((prev) => ({ ...prev, [id]: action }));
    const label = action === "Approved" ? "Approved ✓" : action === "Rejected" ? "Rejected" : "Sent for correction";
    toast.success(`Approval ${id} — ${label}`);
    setSelectedApp(null);
  };

  const allTypes = Array.from(new Set(filteredApprovals.map((a) => a.type)));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approvals Desk"
        subtitle="Review and authorise pending transactions, payments, and branch transfers"
      />

      {/* Summary Tabs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Review", value: counts.pending, color: "border-amber-300 bg-amber-50 text-amber-800", filter: "Pending" },
          { label: "Approved", value: counts.approved, color: "border-emerald-300 bg-emerald-50 text-emerald-800", filter: "Approved" },
          { label: "Rejected", value: counts.rejected, color: "border-red-200 bg-red-50 text-red-700", filter: "Rejected" },
        ].map((item) => (
          <button
            key={item.filter}
            onClick={() => setStatusFilter(item.filter)}
            className={`p-5 rounded-xl border-2 text-left transition-all shadow-sm hover:shadow-md ${
              statusFilter === item.filter ? item.color + " shadow-md" : "bg-white border-avp-border"
            }`}
          >
            <p className="text-3xl font-bold">{item.value}</p>
            <p className="text-sm mt-1 opacity-80">{item.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-avp-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-avp-charcoal/40" />
          <Input placeholder="Search by ID, customer, or transaction..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2 text-avp-charcoal/50" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Correction Required">Correction Required</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <Filter className="h-4 w-4 mr-2 text-avp-charcoal/50" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            {allTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Approvals List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-avp-border rounded-xl p-10 text-center text-avp-charcoal/50">
            No approvals matching your criteria.
          </div>
        ) : (
          filtered.map((app) => {
            const effectiveStatus = localStatuses[app.id] ?? app.status;
            return (
              <div
                key={app.id}
                className="bg-white border border-avp-border rounded-xl p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedApp(app)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-avp-warm flex items-center justify-center border border-avp-border flex-shrink-0">
                    {statusIcon[effectiveStatus] ?? <Clock className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-avp-charcoal">{app.id}</span>
                      <span className="text-xs text-avp-charcoal/60">{app.transactionId}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityColors[app.priority]}`}>{app.priority}</span>
                    </div>
                    <div className="text-sm text-avp-charcoal/70 mt-0.5">
                      {app.type} · {app.customerName} · {app.branch}
                    </div>
                    <div className="text-xs text-avp-charcoal/50 mt-0.5">Requested by {app.requestedBy} on {app.requestedDate}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="font-mono font-semibold text-avp-charcoal">{formatINR(app.amount)}</div>
                    <div className={`text-xs mt-0.5 font-medium ${
                      effectiveStatus === "Approved" ? "text-emerald-600" :
                      effectiveStatus === "Rejected" ? "text-red-500" :
                      effectiveStatus === "Correction Required" ? "text-orange-500" :
                      "text-amber-600"
                    }`}>{effectiveStatus}</div>
                  </div>
                  {effectiveStatus === "Pending" && (
                    <ChevronRight className="h-5 w-5 text-avp-charcoal/40" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Approval Detail Dialog */}
      {selectedApp && (
        <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-avp-gold" />
                Approval — {selectedApp.id}
              </DialogTitle>
              <DialogDescription>{selectedApp.type}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-avp-warm/60 rounded-xl border border-avp-border p-4 space-y-3 text-sm">
                {[
                  ["Transaction Ref", selectedApp.transactionId],
                  ["Customer", selectedApp.customerName],
                  ["Branch", selectedApp.branch],
                  ["Requested By", selectedApp.requestedBy],
                  ["Date", selectedApp.requestedDate],
                  ["Priority", selectedApp.priority],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-avp-border/40 pb-2">
                    <span className="text-avp-charcoal/60">{label}</span>
                    <span className="font-medium text-avp-charcoal">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-1">
                  <span className="text-avp-charcoal/60 flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" />Amount</span>
                  <span className="font-bold font-mono text-avp-charcoal text-base">{formatINR(selectedApp.amount)}</span>
                </div>
              </div>

              {selectedApp.reason && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm">
                  <p className="font-medium text-amber-800 mb-1 flex items-center gap-1"><AlertCircle className="h-4 w-4" />Reason / Notes</p>
                  <p className="text-amber-700">{selectedApp.reason}</p>
                </div>
              )}

              {(localStatuses[selectedApp.id] ?? selectedApp.status) === "Pending" ? (
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50" onClick={() => handleAction(selectedApp.id, "Correction Required")}>
                    <AlertCircle className="h-4 w-4 mr-1.5" /> Correction
                  </Button>
                  <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleAction(selectedApp.id, "Rejected")}>
                    <XCircle className="h-4 w-4 mr-1.5" /> Reject
                  </Button>
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAction(selectedApp.id, "Approved")}>
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve
                  </Button>
                </div>
              ) : (
                <div className={`rounded-xl p-4 text-center font-semibold ${
                  (localStatuses[selectedApp.id] ?? selectedApp.status) === "Approved" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                }`}>
                  This approval is {localStatuses[selectedApp.id] ?? selectedApp.status}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
