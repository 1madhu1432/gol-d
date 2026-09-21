import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  CreditCard,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, StatusBadge } from "@/components/erp/ui";
import { useERPStore } from "@/lib/erp-store";
import { formatINR, type PaymentRecord } from "@/lib/erp-data";

export const Route = createFileRoute("/payments")({
  component: PaymentsPage,
});

const statusIcon: Record<PaymentRecord["status"], React.ReactNode> = {
  Completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  Pending: <Clock className="h-4 w-4 text-amber-500" />,
  Failed: <XCircle className="h-4 w-4 text-red-500" />,
  "Reconciliation Pending": <Clock className="h-4 w-4 text-violet-500" />,
};

function PaymentsPage() {
  const { filteredPayments } = useERPStore();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [partyFilter, setPartyFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");

  const filtered = useMemo(() => {
    return filteredPayments.filter((p) => {
      const matchQ =
        p.id.toLowerCase().includes(query.toLowerCase()) ||
        p.partyName.toLowerCase().includes(query.toLowerCase()) ||
        p.referenceNumber.toLowerCase().includes(query.toLowerCase()) ||
        p.transactionId.toLowerCase().includes(query.toLowerCase());
      const matchS = statusFilter === "All" || p.status === statusFilter;
      const matchP = partyFilter === "All" || p.partyType === partyFilter;
      const matchM = methodFilter === "All" || p.paymentMethod === methodFilter;
      return matchQ && matchS && matchP && matchM;
    });
  }, [filteredPayments, query, statusFilter, partyFilter, methodFilter]);

  const totals = useMemo(() => {
    const total = filtered.reduce((a, p) => a + p.amount, 0);
    const completed = filtered.filter((p) => p.status === "Completed").reduce((a, p) => a + p.amount, 0);
    const pending = filtered.filter((p) => p.status === "Pending").reduce((a, p) => a + p.amount, 0);
    return { total, completed, pending };
  }, [filtered]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Customer payouts, bank payments, and payment reference tracking"
        action={
          <Button variant="outline" className="border-avp-border text-avp-charcoal">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total in View", value: formatINR(totals.total), icon: CreditCard, color: "bg-violet-100 text-violet-600" },
          { label: "Cleared", value: formatINR(totals.completed), icon: CheckCircle2, color: "bg-emerald-100 text-emerald-600" },
          { label: "Pending", value: formatINR(totals.pending), icon: Clock, color: "bg-amber-100 text-amber-700" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white p-6 rounded-xl border border-avp-border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-avp-charcoal/70">{kpi.label}</p>
              <p className="text-2xl font-bold font-mono text-avp-charcoal mt-0.5">{kpi.value}</p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${kpi.color}`}>
              <kpi.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-avp-border shadow-sm flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-avp-charcoal/40" />
          <Input placeholder="Search by ID, party, or reference..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2 text-avp-charcoal/50" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
            <SelectItem value="Reconciliation Pending">Reconciliation Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={partyFilter} onValueChange={setPartyFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Filter className="h-4 w-4 mr-2 text-avp-charcoal/50" />
            <SelectValue placeholder="Party" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Parties</SelectItem>
            <SelectItem value="Customer">Customer</SelectItem>
            <SelectItem value="Bank">Bank</SelectItem>
          </SelectContent>
        </Select>
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Filter className="h-4 w-4 mr-2 text-avp-charcoal/50" />
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Methods</SelectItem>
            <SelectItem value="RTGS">RTGS</SelectItem>
            <SelectItem value="NEFT">NEFT</SelectItem>
            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-avp-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-avp-warm text-avp-charcoal/70 uppercase font-semibold text-xs">
              <tr>
                <th className="px-6 py-4">Payment ID</th>
                <th className="px-6 py-4">Txn Ref</th>
                <th className="px-6 py-4">Party</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Reference No.</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Approved By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-avp-border/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-avp-charcoal/50">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 100).map((pmt) => (
                  <tr key={pmt.id} className="hover:bg-avp-warm/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-avp-charcoal">{pmt.id}</td>
                    <td className="px-6 py-4 font-mono text-xs text-avp-charcoal/70">{pmt.transactionId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {pmt.partyType === "Bank" ? (
                          <Building2 className="h-3.5 w-3.5 text-avp-charcoal/50" />
                        ) : (
                          <User className="h-3.5 w-3.5 text-avp-charcoal/50" />
                        )}
                        <span>{pmt.partyName}</span>
                      </div>
                      <div className="text-xs text-avp-charcoal/50 mt-0.5">{pmt.partyType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-avp-warm border border-avp-border text-avp-charcoal">
                        {pmt.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-avp-charcoal/70">{pmt.referenceNumber}</td>
                    <td className="px-6 py-4 font-mono font-semibold text-avp-charcoal">{formatINR(pmt.amount)}</td>
                    <td className="px-6 py-4 text-avp-charcoal/70">{pmt.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {statusIcon[pmt.status]}
                        <span className={`text-sm font-medium ${
                          pmt.status === "Completed" ? "text-emerald-600" :
                          pmt.status === "Failed" ? "text-red-500" :
                          pmt.status === "Reconciliation Pending" ? "text-violet-600" :
                          "text-amber-600"
                        }`}>{pmt.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-avp-charcoal/70">{pmt.approvedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-avp-border bg-avp-warm/30 text-xs text-avp-charcoal/60">
          Showing {Math.min(filtered.length, 100)} of {filtered.length} records
        </div>
      </div>
    </div>
  );
}
