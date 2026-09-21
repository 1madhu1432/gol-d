import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Calculator,
  Search,
  Filter,
  CheckCircle2,
  ChevronRight,
  IndianRupee,
  Percent,
  Layers,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader, StatusBadge } from "@/components/erp/ui";
import { useERPStore } from "@/lib/erp-store";
import { formatINR, formatGrams, type Transaction } from "@/lib/erp-data";
import { toast } from "sonner";

export const Route = createFileRoute("/valuation")({
  component: ValuationPage,
});

function ValuationPage() {
  const { filteredTransactions, rates, updateTransactionStatus } = useERPStore();
  const [query, setQuery] = useState("");
  const [metalFilter, setMetalFilter] = useState("All");
  const [activeTxn, setActiveTxn] = useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const valuationQueue = useMemo(() =>
    filteredTransactions.filter((t) => ["Valuation", "Testing"].includes(t.status)),
    [filteredTransactions]
  );

  const filtered = useMemo(() => {
    return valuationQueue.filter((t) => {
      const matchQ = t.id.toLowerCase().includes(query.toLowerCase()) || t.customerName.toLowerCase().includes(query.toLowerCase());
      const matchM = metalFilter === "All" || t.metal === metalFilter;
      return matchQ && matchM;
    });
  }, [valuationQueue, query, metalFilter]);

  const totals = useMemo(() => {
    return {
      items: valuationQueue.length,
      grossValue: valuationQueue.reduce((a, t) => a + t.grossMetalValue, 0),
      netPayout: valuationQueue.reduce((a, t) => a + t.customerPayable, 0),
    };
  }, [valuationQueue]);

  const handleFinalise = () => {
    if (!activeTxn) return;
    setIsSubmitting(true);
    setTimeout(() => {
      updateTransactionStatus(
        activeTxn.id,
        "Settlement Pending",
        "Valuation finalised and forwarded for settlement approval."
      );
      toast.success("Valuation certified — moved to Settlement Pending");
      setIsSubmitting(false);
      setActiveTxn(null);
    }, 900);
  };

  const getLiveRate = (txn: Transaction) => {
    const match = rates.find((r) => r.metal === txn.metal);
    return match ? match.ratePerGram : txn.applicableRate;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Valuation Desk"
        subtitle="Apply certified rates to tested metal and compute net customer payouts"
        action={
          <Button className="bg-avp-gold hover:bg-avp-gold/90 text-avp-charcoal">
            <Calculator className="h-4 w-4 mr-2" />
            Bulk Valuate
          </Button>
        }
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "In Queue", value: totals.items, icon: Layers, color: "bg-violet-100 text-violet-600" },
          { label: "Total Gross Value", value: formatINR(totals.grossValue), icon: IndianRupee, color: "bg-amber-100 text-amber-700" },
          { label: "Estimated Net Payout", value: formatINR(totals.netPayout), icon: Percent, color: "bg-emerald-100 text-emerald-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white p-6 rounded-xl border border-avp-border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-avp-charcoal/70">{kpi.label}</p>
              <p className="text-2xl font-bold text-avp-charcoal mt-0.5">{kpi.value}</p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${kpi.color}`}>
              <kpi.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-avp-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-avp-charcoal/40" />
          <Input placeholder="Search by ID or customer..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={metalFilter} onValueChange={setMetalFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Filter className="h-4 w-4 mr-2 text-avp-charcoal/50" />
            <SelectValue placeholder="Metal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Metals</SelectItem>
            <SelectItem value="Gold">Gold</SelectItem>
            <SelectItem value="Silver">Silver</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Queue Table */}
      <div className="bg-white border border-avp-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-avp-warm text-avp-charcoal/70 uppercase font-semibold text-xs">
              <tr>
                <th className="px-6 py-4">Ref / Branch</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Metal</th>
                <th className="px-6 py-4">Net Weight</th>
                <th className="px-6 py-4">Live Rate</th>
                <th className="px-6 py-4">Gross Value</th>
                <th className="px-6 py-4">Net Payout</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-avp-border/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-avp-charcoal/50">
                    No transactions pending valuation.
                  </td>
                </tr>
              ) : (
                filtered.map((txn) => (
                  <tr key={txn.id} className="hover:bg-avp-warm/30 transition-colors cursor-pointer" onClick={() => setActiveTxn(txn)}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-avp-charcoal">{txn.id}</div>
                      <div className="text-xs text-avp-charcoal/60">{txn.branch}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{txn.customerName}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${txn.metal === "Gold" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                        {txn.metal}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium">{formatGrams(txn.totalNetWeight)}</td>
                    <td className="px-6 py-4 font-mono">{formatINR(getLiveRate(txn))}/g</td>
                    <td className="px-6 py-4 font-mono font-medium text-avp-charcoal">{formatINR(txn.grossMetalValue)}</td>
                    <td className="px-6 py-4 font-mono font-medium text-emerald-700">{formatINR(txn.customerPayable)}</td>
                    <td className="px-6 py-4"><StatusBadge status={txn.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <Button size="sm" variant="outline" className="border-avp-gold/50 text-avp-charcoal hover:bg-avp-gold/10">
                        Review <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Valuation Detail Modal */}
      {activeTxn && (
        <Dialog open={!!activeTxn} onOpenChange={(open) => !open && setActiveTxn(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl">
                <Calculator className="h-5 w-5 mr-2 text-avp-gold" />
                Valuation Sheet — {activeTxn.id}
              </DialogTitle>
              <DialogDescription>{activeTxn.customerName} · {activeTxn.metal} · {activeTxn.branch}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Metal Details */}
              <div className="bg-avp-warm/60 p-4 rounded-xl border border-avp-border space-y-2">
                <h4 className="font-semibold text-avp-charcoal border-b border-avp-border pb-2 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-avp-gold" />
                  Metal Summary
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Total Gross Weight", formatGrams(activeTxn.totalGrossWeight)],
                    ["Total Net Weight", formatGrams(activeTxn.totalNetWeight)],
                    ["Average Purity", `${activeTxn.averagePurity}%`],
                    ["Fine Weight", formatGrams(activeTxn.totalFineWeight)],
                    ["Rate Applied", `${formatINR(getLiveRate(activeTxn))}/g`],
                    ["Gross Metal Value", formatINR(activeTxn.grossMetalValue)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between border-b border-avp-border/40 pb-1.5">
                      <span className="text-avp-charcoal/70">{label}</span>
                      <span className="font-medium font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-red-50/80 p-4 rounded-xl border border-red-200/70 space-y-3">
                <div className="flex items-center justify-between border-b border-red-200 pb-2">
                  <h4 className="font-semibold text-red-800">Deductions & Bank Settlements</h4>
                  <span className="text-[11px] text-red-700 font-mono">100% Transparent Slabs</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ...(activeTxn.type === "Bank Pledged"
                      ? [["Bank Outstanding Paid by AVP", formatINR(activeTxn.bankPaymentAmount || activeTxn.bankOutstandingAmount || 0)]]
                      : []),
                    ["Service Fee", formatINR(activeTxn.serviceFee)],
                    ["Processing Fee", formatINR(activeTxn.processingFee)],
                    ["Testing Fee", formatINR(activeTxn.testingFee)],
                    ["Bank Expenses", formatINR(activeTxn.bankExpenses)],
                    ["Commission", formatINR(activeTxn.commission)],
                    ["Other Deductions", formatINR(activeTxn.otherDeductions)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between border-b border-red-200/50 pb-1.5">
                      <span className="text-red-900/80">{label}</span>
                      <span className="font-medium text-red-900 font-mono">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-red-200">
                  <span className="text-red-900">Total Deductions</span>
                  <span className="text-red-900 font-mono">{formatINR(activeTxn.totalDeductions)}</span>
                </div>
                <div className="rounded bg-white/80 p-2 border border-red-200 text-[11px] text-red-950 font-mono">
                  Formula: {formatINR(activeTxn.grossMetalValue)} (Metal Value) - {formatINR(activeTxn.bankPaymentAmount || 0)} (Bank Paid) - {formatINR(activeTxn.serviceFee)} (Service) - {formatINR(activeTxn.commission)} (Commission) = <strong>{formatINR(activeTxn.customerPayable)} (Customer Payable)</strong>
                </div>
              </div>

              {/* Net Payout */}
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex justify-between items-center">
                <div>
                  <p className="text-sm text-emerald-700">Net Customer Payout</p>
                  <p className="text-3xl font-bold text-emerald-800 font-mono mt-0.5">{formatINR(activeTxn.customerPayable)}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold text-avp-charcoal mb-2 text-sm">Items in Batch</h4>
                <div className="space-y-2">
                  {activeTxn.items.map((item, i) => (
                    <div key={i} className="bg-white border border-avp-border rounded-lg p-3 flex justify-between items-center text-sm shadow-sm">
                      <div>
                        <span className="font-medium text-avp-charcoal">{item.description}</span>
                        <span className="text-xs text-avp-charcoal/60 ml-2">{item.purityKarat} · {formatGrams(item.netWeight)}</span>
                      </div>
                      <span className="font-mono font-medium text-avp-charcoal">{formatINR(item.grossValue)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setActiveTxn(null)}>Cancel</Button>
                <Button
                  className="flex-1 bg-avp-charcoal hover:bg-avp-charcoal/90 text-white"
                  onClick={handleFinalise}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Finalising..." : "Certify & Send to Settlement"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
