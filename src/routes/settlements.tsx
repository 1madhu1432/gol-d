import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Handshake,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  IndianRupee,
  Printer,
  ChevronRight,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader, StatusBadge } from "@/components/erp/ui";
import { useERPStore } from "@/lib/erp-store";
import { formatINR, formatGrams, type Transaction } from "@/lib/erp-data";
import { toast } from "sonner";

export const Route = createFileRoute("/settlements")({
  component: SettlementsPage,
});

function SettlementsPage() {
  const { filteredTransactions, completeCustomerSettlement } = useERPStore();
  const [query, setQuery] = useState("");
  const [metalFilter, setMetalFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Settlement Pending");
  const [activeTxn, setActiveTxn] = useState<Transaction | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<Transaction["paymentMethod"]>("Bank Transfer");
  const [paymentRef, setPaymentRef] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const settlementQueue = useMemo(() =>
    filteredTransactions.filter((t) =>
      ["Settlement Pending", "Customer Paid", "Completed"].includes(t.status)
    ),
    [filteredTransactions]
  );

  const filtered = useMemo(() => {
    return settlementQueue.filter((t) => {
      const matchQ = t.id.toLowerCase().includes(query.toLowerCase()) || t.customerName.toLowerCase().includes(query.toLowerCase());
      const matchM = metalFilter === "All" || t.metal === metalFilter;
      const matchS = statusFilter === "All" || t.status === statusFilter;
      return matchQ && matchM && matchS;
    });
  }, [settlementQueue, query, metalFilter, statusFilter]);

  const totals = useMemo(() => {
    const pending = settlementQueue.filter(t => t.status === "Settlement Pending");
    return {
      count: pending.length,
      amount: pending.reduce((a, t) => a + t.customerPayable, 0),
    };
  }, [settlementQueue]);

  const handleSettle = () => {
    if (!activeTxn) return;
    setIsSubmitting(true);
    const ref = paymentRef.trim() || `AVP-PAY-${Date.now()}`;
    setTimeout(() => {
      completeCustomerSettlement(activeTxn.id, paymentMethod!, ref);
      toast.success(`Settlement ${activeTxn.id} — ${formatINR(activeTxn.customerPayable)} disbursed via ${paymentMethod}`);
      setIsSubmitting(false);
      setActiveTxn(null);
      setPaymentRef("");
    }, 900);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Settlement"
        subtitle="Disburse final payouts to customers after valuation approval"
      />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-700 font-medium">Pending Settlements</p>
            <p className="text-3xl font-bold text-amber-800 mt-1">{totals.count}</p>
          </div>
          <Clock className="h-10 w-10 text-amber-400" />
        </div>
        <div className="bg-emerald-50 border-2 border-emerald-200 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm text-emerald-700 font-medium">Amount to be Disbursed</p>
            <p className="text-3xl font-bold font-mono text-emerald-800 mt-1">{formatINR(totals.amount)}</p>
          </div>
          <IndianRupee className="h-10 w-10 text-emerald-400" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-avp-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-avp-charcoal/40" />
          <Input placeholder="Search by ID or customer..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2 text-avp-charcoal/50" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Settlement Pending">Pending Settlement</SelectItem>
            <SelectItem value="Customer Paid">Customer Paid</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={metalFilter} onValueChange={setMetalFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Filter className="h-4 w-4 mr-2 text-avp-charcoal/50" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Metals</SelectItem>
            <SelectItem value="Gold">Gold</SelectItem>
            <SelectItem value="Silver">Silver</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white border border-avp-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-avp-warm text-avp-charcoal/70 uppercase font-semibold text-xs">
              <tr>
                <th className="px-6 py-4">Ref</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Metal / Type</th>
                <th className="px-6 py-4">Net Weight</th>
                <th className="px-6 py-4">Gross Value</th>
                <th className="px-6 py-4">Deductions</th>
                <th className="px-6 py-4">Net Payout</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-avp-border/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-avp-charcoal/50">
                    No settlement records found.
                  </td>
                </tr>
              ) : (
                filtered.map((txn) => (
                  <tr key={txn.id} className="hover:bg-avp-warm/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-avp-charcoal">{txn.id}</div>
                      <div className="text-xs text-avp-charcoal/60">{txn.branch}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 bg-avp-warm rounded-full border border-avp-border flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-avp-charcoal/60" />
                        </div>
                        <div>
                          <div className="font-medium">{txn.customerName}</div>
                          <div className="text-xs text-avp-charcoal/60">{txn.customerMobile}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${txn.metal === "Gold" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                        {txn.metal}
                      </span>
                      <div className="text-xs text-avp-charcoal/60 mt-1">{txn.type}</div>
                    </td>
                    <td className="px-6 py-4 font-mono">{formatGrams(txn.totalNetWeight)}</td>
                    <td className="px-6 py-4 font-mono">{formatINR(txn.grossMetalValue)}</td>
                    <td className="px-6 py-4 font-mono text-red-600">- {formatINR(txn.totalDeductions)}</td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-700 text-base">{formatINR(txn.customerPayable)}</td>
                    <td className="px-6 py-4"><StatusBadge status={txn.status} /></td>
                    <td className="px-6 py-4 text-right">
                      {txn.status === "Settlement Pending" ? (
                        <Button
                          size="sm"
                          className="bg-avp-gold hover:bg-avp-gold/90 text-avp-charcoal font-medium"
                          onClick={() => setActiveTxn(txn)}
                        >
                          <Handshake className="h-4 w-4 mr-1.5" /> Settle
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setActiveTxn(txn)}>
                          <Printer className="h-4 w-4 mr-1.5" /> Receipt
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settlement Modal */}
      {activeTxn && (
        <Dialog open={!!activeTxn} onOpenChange={(open) => !open && setActiveTxn(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Handshake className="h-5 w-5 text-avp-gold" />
                Disburse Payment — {activeTxn.id}
              </DialogTitle>
              <DialogDescription>{activeTxn.customerName} · {activeTxn.metal}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Payout Summary */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-emerald-700">Net Customer Payout</p>
                  <p className="text-3xl font-bold font-mono text-emerald-800">{formatINR(activeTxn.customerPayable)}</p>
                </div>
                <CheckCircle2 className="h-9 w-9 text-emerald-400" />
              </div>

              {/* Deductions Breakdown */}
              <div className="bg-avp-warm/60 rounded-xl border border-avp-border p-4 space-y-2 text-sm">
                {[
                  ["Gross Value", formatINR(activeTxn.grossMetalValue)],
                  ...(activeTxn.type === "Bank Pledged"
                    ? [["Bank Outstanding Paid by AVP", `- ${formatINR(activeTxn.bankPaymentAmount || activeTxn.bankOutstandingAmount || 0)}`]]
                    : []),
                  ["Service Fee", `- ${formatINR(activeTxn.serviceFee)}`],
                  ["Processing Fee", `- ${formatINR(activeTxn.processingFee)}`],
                  ["Testing Fee", `- ${formatINR(activeTxn.testingFee)}`],
                  ["Bank Expenses", `- ${formatINR(activeTxn.bankExpenses)}`],
                  ["Commission", `- ${formatINR(activeTxn.commission)}`],
                  ["Other Deductions", `- ${formatINR(activeTxn.otherDeductions)}`],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between border-b border-avp-border/40 pb-1.5">
                    <span className="text-avp-charcoal/60">{l}</span>
                    <span className="font-mono font-medium text-avp-charcoal">{v}</span>
                  </div>
                ))}
                <div className="pt-2 text-[11px] font-mono text-muted-foreground border-t border-border">
                  Formula: {formatINR(activeTxn.grossMetalValue)} (Metal) - {formatINR(activeTxn.bankPaymentAmount || 0)} (Bank) - {formatINR(activeTxn.serviceFee + activeTxn.processingFee + activeTxn.testingFee + activeTxn.bankExpenses)} (AVP Charges) - {formatINR(activeTxn.commission)} (Commission) = <strong className="text-emerald-800">{formatINR(activeTxn.customerPayable)} (Payable)</strong>
                </div>
              </div>

              {activeTxn.status === "Settlement Pending" && (
                <>
                  <div>
                    <label className="text-xs font-medium text-avp-charcoal/70 mb-1 block">Payment Method</label>
                    <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as Transaction["paymentMethod"])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="RTGS">RTGS</SelectItem>
                        <SelectItem value="NEFT">NEFT</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-avp-charcoal/70 mb-1 block">Payment Reference / UTR</label>
                    <Input
                      placeholder="e.g. NEFT/AVP/2026/..."
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      className="font-mono"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setActiveTxn(null)}>Cancel</Button>
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={handleSettle}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : (
                        <><CheckCircle2 className="h-4 w-4 mr-1.5" /> Confirm Payment</>
                      )}
                    </Button>
                  </div>
                </>
              )}

              {activeTxn.status !== "Settlement Pending" && (
                <div className="bg-emerald-100 text-emerald-700 rounded-xl p-4 text-center font-semibold">
                  ✓ Payment settled via {activeTxn.paymentMethod || "Bank Transfer"}
                  {activeTxn.paymentReference && (
                    <div className="text-xs font-mono mt-1 text-emerald-600">{activeTxn.paymentReference}</div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
