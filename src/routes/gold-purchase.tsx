import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Gem,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  Scale,
  ArrowUpRight,
  ReceiptIndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, StatusBadge } from "@/components/erp/ui";
import { useERPStore } from "@/lib/erp-store";
import { formatINR, formatGrams, type Transaction } from "@/lib/erp-data";
import { MetalPurchaseWizard } from "@/components/erp/workflow-wizards";
import { PrintableDocumentModal } from "@/components/erp/printable-documents";
import { EvidenceGallery } from "@/components/erp/evidence-gallery";
import { toast } from "sonner";

export const Route = createFileRoute("/gold-purchase")({
  component: GoldPurchasePage,
});

function GoldPurchasePage() {
  const { filteredTransactions } = useERPStore();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [printTxn, setPrintTxn] = useState<Transaction | null>(null);

  const goldPurchases = useMemo(() => {
    return filteredTransactions.filter(
      (t) => t.metal === "Gold" && t.type === "Old Metal Purchase"
    );
  }, [filteredTransactions]);

  const filtered = useMemo(() => {
    return goldPurchases.filter((t) => {
      const matchQ =
        t.id.toLowerCase().includes(query.toLowerCase()) ||
        t.customerName.toLowerCase().includes(query.toLowerCase()) ||
        t.customerMobile.includes(query) ||
        t.packetId?.toLowerCase().includes(query.toLowerCase());
      const matchStatus = statusFilter === "All" || t.status === statusFilter;
      return matchQ && matchStatus;
    });
  }, [goldPurchases, query, statusFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    let weight = 0;
    let fine = 0;
    let value = 0;
    let payable = 0;

    goldPurchases.forEach((t) => {
      weight += t.totalNetWeight;
      fine += t.totalFineWeight;
      value += t.grossMetalValue;
      payable += t.customerPayable;
    });

    return {
      count: goldPurchases.length,
      netWeight: weight,
      fineWeight: fine,
      grossValue: value,
      customerPayable: payable,
    };
  }, [goldPurchases]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Commercial · Old Precious Metal Desk"
        title="Old Gold Direct Purchase Register"
        description="Direct counter acquisition of old gold jewellery, assay valuation, service deductions, and customer settlement payouts."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs font-semibold"
              onClick={() => toast.success("Exported Gold Purchase Register to CSV")}
            >
              <Download className="size-3.5" /> Export Register
            </Button>
            <Button
              size="sm"
              className="h-9 gap-1.5 text-xs font-bold"
              onClick={() => setWizardOpen(true)}
            >
              <Plus className="size-3.5" /> New Gold Purchase
            </Button>
          </>
        }
      />

      {/* Summary KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="border border-border p-3.5 rounded-md bg-card">
          <p className="text-muted-foreground font-semibold">Total Purchases</p>
          <p className="font-display text-xl font-bold text-foreground mt-1">{stats.count} lots</p>
        </div>
        <div className="border border-border p-3.5 rounded-md bg-card">
          <p className="text-muted-foreground font-semibold">Net Gold Weight</p>
          <p className="font-display text-xl font-bold text-primary mt-1">{formatGrams(stats.netWeight)}</p>
        </div>
        <div className="border border-border p-3.5 rounded-md bg-card">
          <p className="text-muted-foreground font-semibold">Fine Pure Gold</p>
          <p className="font-display text-xl font-bold text-amber-900 mt-1">{formatGrams(stats.fineWeight)}</p>
        </div>
        <div className="border border-border p-3.5 rounded-md bg-card">
          <p className="text-muted-foreground font-semibold">Total Paid to Customers</p>
          <p className="font-display text-xl font-bold text-foreground mt-1">{formatINR(stats.customerPayable)}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border border-border bg-card p-3 rounded-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by transaction ID, customer, mobile, packet ID…"
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-40 text-xs font-semibold">
              <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Valuation">Valuation</SelectItem>
              <SelectItem value="Settlement Pending">Settlement Pending</SelectItem>
              <SelectItem value="Testing">Testing</SelectItem>
              <SelectItem value="Inventory">Inventory</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border bg-card shadow-xs rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-table-head text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Transaction ID</th>
                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                <th className="px-4 py-3 text-left font-semibold">Branch</th>
                <th className="px-4 py-3 text-right font-semibold">Gross Wt</th>
                <th className="px-4 py-3 text-right font-semibold">Net Wt</th>
                <th className="px-4 py-3 text-right font-semibold">Purity</th>
                <th className="px-4 py-3 text-right font-semibold">Fine Gold</th>
                <th className="px-4 py-3 text-right font-semibold">Rate/g</th>
                <th className="px-4 py-3 text-right font-semibold">Gross Value</th>
                <th className="px-4 py-3 text-right font-semibold">Customer Payable</th>
                <th className="px-4 py-3 text-center font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-primary">{t.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{t.customerName}</p>
                    <p className="text-[10px] text-muted-foreground">{t.customerMobile}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.branch}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatGrams(t.totalGrossWeight)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold">{formatGrams(t.totalNetWeight)}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-amber-900">{t.averagePurity}%</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-primary">{formatGrams(t.totalFineWeight)}</td>
                  <td className="px-4 py-3 text-right font-mono">₹{t.applicableRate.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">{formatINR(t.grossMetalValue)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-foreground">{formatINR(t.customerPayable)}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge value={t.status} />
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => setSelectedTxn(t)}
                      >
                        <Eye className="size-3 text-muted-foreground" /> View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => setPrintTxn(t)}
                      >
                        <Printer className="size-3 text-muted-foreground" /> Receipt
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW GOLD PURCHASE WIZARD MODAL */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 border border-border">
          <MetalPurchaseWizard
            metal="Gold"
            onComplete={() => setWizardOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* DETAIL MODAL */}
      <Dialog open={!!selectedTxn} onOpenChange={(open) => !open && setSelectedTxn(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto border border-border">
          {selectedTxn && (
            <div className="space-y-4 text-xs">
              <DialogHeader>
                <DialogTitle className="font-display text-base font-bold flex items-center justify-between">
                  <span>Gold Purchase Details · {selectedTxn.id}</span>
                  <StatusBadge value={selectedTxn.status} />
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 p-3.5 bg-muted/20 rounded border border-border">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-bold text-foreground text-sm mt-0.5">{selectedTxn.customerName}</p>
                  <p className="text-muted-foreground">{selectedTxn.customerMobile}</p>
                  <p className="text-muted-foreground">Branch: {selectedTxn.branch}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Packet & Custody</p>
                  <p className="font-bold text-foreground mt-0.5">{selectedTxn.packetId}</p>
                  <p className="text-muted-foreground">{selectedTxn.vaultLocation}</p>
                  <p className="text-muted-foreground">Appraiser: {selectedTxn.assignedAppraiser}</p>
                </div>
              </div>

              <div className="border border-border rounded p-3 space-y-2">
                <p className="font-bold text-foreground">Transparent Deductions Breakdown</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross Gold Valuation:</span>
                  <span className="font-mono font-bold">{formatINR(selectedTxn.grossMetalValue)}</span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>(−) AVP Service Charge:</span>
                  <span className="font-mono">− {formatINR(selectedTxn.serviceFee)}</span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>(−) Processing Fee:</span>
                  <span className="font-mono">− {formatINR(selectedTxn.processingFee)}</span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>(−) Testing & Assay Fee:</span>
                  <span className="font-mono">− {formatINR(selectedTxn.testingFee)}</span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>(−) Commission:</span>
                  <span className="font-mono">− {formatINR(selectedTxn.commission)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-sm bg-muted/30 p-2 rounded">
                  <span>Customer Payout:</span>
                  <span className="font-mono text-primary">{formatINR(selectedTxn.customerPayable)}</span>
                </div>
              </div>

              <EvidenceGallery transactionId={selectedTxn.id} compact />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PRINTABLE RECEIPT MODAL */}
      {printTxn && (
        <PrintableDocumentModal
          open={!!printTxn}
          onOpenChange={(open) => !open && setPrintTxn(null)}
          documentType="Purchase Receipt"
          transaction={printTxn}
        />
      )}
    </div>
  );
}
