import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Landmark,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  Banknote,
  ShieldCheck,
  Send,
  PackageCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, StatusBadge } from "@/components/erp/ui";
import { useERPStore } from "@/lib/erp-store";
import { formatINR, formatGrams, type Transaction } from "@/lib/erp-data";
import { BankPledgedWizard } from "@/components/erp/workflow-wizards";
import { PrintableDocumentModal } from "@/components/erp/printable-documents";
import { EvidenceGallery, EvidenceTimeline } from "@/components/erp/evidence-gallery";
import { toast } from "sonner";

export const Route = createFileRoute("/bank-pledged-gold")({
  component: BankPledgedGoldPage,
});

function BankPledgedGoldPage() {
  const {
    filteredTransactions,
    recordBankPayment,
    recordMetalRelease,
    recordMetalReceived,
    recordPurityTestResult,
    completeCustomerSettlement,
  } = useERPStore();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [printTxn, setPrintTxn] = useState<Transaction | null>(null);
  const [actionModalTxn, setActionModalTxn] = useState<Transaction | null>(null);
  const [activeActionStep, setActiveActionStep] = useState<string>("");
  const [utrRef, setUtrRef] = useState("");
  const [officerName, setOfficerName] = useState("S. Raghunath (Liaison Officer)");

  const pledgedTransactions = useMemo(() => {
    return filteredTransactions.filter(
      (t) => t.metal === "Gold" && t.type === "Bank Pledged"
    );
  }, [filteredTransactions]);

  const filtered = useMemo(() => {
    return pledgedTransactions.filter((t) => {
      const matchQ =
        t.id.toLowerCase().includes(query.toLowerCase()) ||
        t.customerName.toLowerCase().includes(query.toLowerCase()) ||
        t.bankName?.toLowerCase().includes(query.toLowerCase()) ||
        t.loanAccountNumber?.toLowerCase().includes(query.toLowerCase()) ||
        t.customerMobile.includes(query);
      const matchStatus = statusFilter === "All" || t.status === statusFilter;
      return matchQ && matchStatus;
    });
  }, [pledgedTransactions, query, statusFilter]);

  const stats = useMemo(() => {
    let loanPayoffTotal = 0;
    let goldValuationTotal = 0;
    let customerSurplusTotal = 0;

    pledgedTransactions.forEach((t) => {
      loanPayoffTotal += t.bankPaymentAmount || t.bankOutstandingAmount || 0;
      goldValuationTotal += t.grossMetalValue;
      customerSurplusTotal += t.customerPayable;
    });

    return {
      count: pledgedTransactions.length,
      loanPayoffTotal,
      goldValuationTotal,
      customerSurplusTotal,
    };
  }, [pledgedTransactions]);

  const handleExecuteAction = () => {
    if (!actionModalTxn) return;

    if (activeActionStep === "bank-pay") {
      const ref = utrRef.trim() || `RTGS/AVP/${Math.floor(10000000 + Math.random() * 90000000)}`;
      recordBankPayment(actionModalTxn.id, ref, actionModalTxn.bankPaymentAmount || 120000);
      setActionModalTxn(null);
      setUtrRef("");
    } else if (activeActionStep === "release") {
      recordMetalRelease(actionModalTxn.id, officerName);
      setActionModalTxn(null);
    } else if (activeActionStep === "receive") {
      recordMetalReceived(actionModalTxn.id, "K. Venkatesh (Vault Officer)");
      setActionModalTxn(null);
    } else if (activeActionStep === "test") {
      recordPurityTestResult(actionModalTxn.id, 91.6, "B. Haritha (Certified Assayer)");
      setActionModalTxn(null);
    } else if (activeActionStep === "settle") {
      const ref = `CMS/AVP/${Math.floor(9000000 + Math.random() * 999999)}`;
      completeCustomerSettlement(actionModalTxn.id, "Bank Transfer", ref);
      setActionModalTxn(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Core Operations · Bank Pledged Gold Desk"
        title="Bank-Pledged Gold Redemption & Acquisition"
        description="Clear bank loan outstandings, secure metal release from bank strongrooms, conduct spectrometer assay, and settle net surplus with borrowers."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs font-semibold"
              onClick={() => toast.success("Exported Bank Pledged Gold pipeline to CSV")}
            >
              <Download className="size-3.5" /> Export Pipeline
            </Button>
            <Button
              size="sm"
              className="h-9 gap-1.5 text-xs font-bold"
              onClick={() => setWizardOpen(true)}
            >
              <Plus className="size-3.5" /> New Bank Pledged Gold
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="border border-border p-3.5 rounded-md bg-card">
          <p className="text-muted-foreground font-semibold">Active Bank Loans</p>
          <p className="font-display text-xl font-bold text-foreground mt-1">{stats.count} pledges</p>
        </div>
        <div className="border border-border p-3.5 rounded-md bg-card">
          <p className="text-muted-foreground font-semibold">Bank Payoffs Cleared</p>
          <p className="font-display text-xl font-bold text-red-700 mt-1">{formatINR(stats.loanPayoffTotal)}</p>
        </div>
        <div className="border border-border p-3.5 rounded-md bg-card">
          <p className="text-muted-foreground font-semibold">Gross Gold Valuation</p>
          <p className="font-display text-xl font-bold text-primary mt-1">{formatINR(stats.goldValuationTotal)}</p>
        </div>
        <div className="border border-border p-3.5 rounded-md bg-card">
          <p className="text-muted-foreground font-semibold">Net Customer Surplus Settled</p>
          <p className="font-display text-xl font-bold text-success mt-1">{formatINR(stats.customerSurplusTotal)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border border-border bg-card p-3 rounded-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by loan A/c, bank name, customer name, mobile…"
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-44 text-xs font-semibold">
              <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Workflow Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Stages</SelectItem>
              <SelectItem value="Bank Payment Pending">Bank Payment Pending</SelectItem>
              <SelectItem value="Bank Paid">Bank Paid</SelectItem>
              <SelectItem value="Gold Release Pending">Gold Release Pending</SelectItem>
              <SelectItem value="Gold Received">Gold Received</SelectItem>
              <SelectItem value="Testing">Assay Testing</SelectItem>
              <SelectItem value="Valuation">Valuation</SelectItem>
              <SelectItem value="Settlement Pending">Settlement Pending</SelectItem>
              <SelectItem value="Completed">Completed & In Vault</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pipeline Table */}
      <div className="border border-border bg-card shadow-xs rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-table-head text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Txn ID</th>
                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                <th className="px-4 py-3 text-left font-semibold">Financing Bank</th>
                <th className="px-4 py-3 text-left font-semibold">Loan Account #</th>
                <th className="px-4 py-3 text-right font-semibold">Bank Payoff</th>
                <th className="px-4 py-3 text-right font-semibold">Gross Gold Value</th>
                <th className="px-4 py-3 text-right font-semibold">Net Customer Surplus</th>
                <th className="px-4 py-3 text-center font-semibold">Pipeline Stage</th>
                <th className="px-4 py-3 text-right font-semibold">Workflow Action</th>
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
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{t.bankName}</p>
                    <p className="text-[10px] text-muted-foreground">{t.bankBranch}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{t.loanAccountNumber}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-red-700">
                    {formatINR(t.bankPaymentAmount || t.bankOutstandingAmount || 0)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">{formatINR(t.grossMetalValue)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-success">{formatINR(t.customerPayable)}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge value={t.status} />
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {t.status === "Bank Payment Pending" && (
                        <Button
                          size="sm"
                          className="h-7 text-xs font-bold gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            setActionModalTxn(t);
                            setActiveActionStep("bank-pay");
                          }}
                        >
                          <Send className="size-3" /> Pay Bank RTGS
                        </Button>
                      )}

                      {t.status === "Gold Release Pending" && (
                        <Button
                          size="sm"
                          className="h-7 text-xs font-bold gap-1 bg-amber-600 hover:bg-amber-700 text-white"
                          onClick={() => {
                            setActionModalTxn(t);
                            setActiveActionStep("release");
                          }}
                        >
                          Release from Bank
                        </Button>
                      )}

                      {t.status === "Gold Received" && (
                        <Button
                          size="sm"
                          className="h-7 text-xs font-bold gap-1 bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => {
                            setActionModalTxn(t);
                            setActiveActionStep("receive");
                          }}
                        >
                          Queue for Testing
                        </Button>
                      )}

                      {t.status === "Testing" && (
                        <Button
                          size="sm"
                          className="h-7 text-xs font-bold gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={() => {
                            setActionModalTxn(t);
                            setActiveActionStep("test");
                          }}
                        >
                          Record Assay Result
                        </Button>
                      )}

                      {t.status === "Settlement Pending" && (
                        <Button
                          size="sm"
                          className="h-7 text-xs font-bold gap-1 bg-success hover:bg-success/90 text-white"
                          onClick={() => {
                            setActionModalTxn(t);
                            setActiveActionStep("settle");
                          }}
                        >
                          Disburse Settlement
                        </Button>
                      )}

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
                        <Printer className="size-3 text-muted-foreground" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW BANK PLEDGED WIZARD */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 border border-border">
          <BankPledgedWizard
            metal="Gold"
            onComplete={() => setWizardOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* WORKFLOW ACTION MODAL */}
      <Dialog open={!!actionModalTxn} onOpenChange={(open) => !open && setActionModalTxn(null)}>
        <DialogContent className="sm:max-w-md border border-border">
          {actionModalTxn && (
            <div className="space-y-4 text-xs">
              <DialogHeader>
                <DialogTitle className="font-display text-base font-bold">
                  {activeActionStep === "bank-pay" && "Execute Bank Loan Payoff via RTGS"}
                  {activeActionStep === "release" && "Confirm Gold Release from Bank Strongroom"}
                  {activeActionStep === "receive" && "Receive Metal into Branch Custody"}
                  {activeActionStep === "test" && "Submit Spectrometer Laboratory Assay"}
                  {activeActionStep === "settle" && "Disburse Final Customer Settlement"}
                </DialogTitle>
              </DialogHeader>

              <div className="p-3 bg-muted/30 rounded border border-border space-y-1">
                <p className="font-bold text-foreground">{actionModalTxn.id} · {actionModalTxn.customerName}</p>
                <p className="text-muted-foreground">Bank: {actionModalTxn.bankName} (Loan A/c: {actionModalTxn.loanAccountNumber})</p>
                <p className="font-mono text-primary font-semibold">Bank Payoff Amount: {formatINR(actionModalTxn.bankPaymentAmount || 0)}</p>
              </div>

              {activeActionStep === "bank-pay" && (
                <div className="space-y-2">
                  <p className="text-muted-foreground leading-relaxed">
                    AVP Gold wires the full redemption amount directly to the bank clearing account. Enter bank RTGS reference number to proceed:
                  </p>
                  <Label className="text-[11px] font-semibold">RTGS UTR Reference *</Label>
                  <Input
                    value={utrRef}
                    onChange={(e) => setUtrRef(e.target.value)}
                    placeholder="e.g. UTRSBIN2609004289"
                    className="h-8 font-mono text-xs"
                  />
                </div>
              )}

              {activeActionStep === "release" && (
                <div className="space-y-2">
                  <p className="text-muted-foreground leading-relaxed">
                    The bank loan is fully cleared. Authorized AVP Liaison officer visits the bank counter to inspect seals and receive gold packets.
                  </p>
                  <Label className="text-[11px] font-semibold">Liaison Escort Officer Name</Label>
                  <Input
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              )}

              {activeActionStep === "receive" && (
                <p className="text-muted-foreground leading-relaxed">
                  Confirm physical custody arrival of gold lot at branch intake bay. The metal will be transferred to the XRF testing laboratory.
                </p>
              )}

              {activeActionStep === "test" && (
                <p className="text-muted-foreground leading-relaxed">
                  Niton XRF Spectrometer assay confirmed purity at 91.6% (22 Karat Standard). Gross valuation updated.
                </p>
              )}

              {activeActionStep === "settle" && (
                <div className="p-3 bg-amber-50 rounded border border-amber-200">
                  <p className="font-bold text-amber-950 text-sm">Disbursement Amount: {formatINR(actionModalTxn.customerPayable)}</p>
                  <p className="text-[10px] text-amber-800 mt-1">
                    Direct account disbursement will be wired to customer bank account.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setActionModalTxn(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleExecuteAction} className="font-bold">
                  Confirm & Advance Stage
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DETAIL MODAL */}
      <Dialog open={!!selectedTxn} onOpenChange={(open) => !open && setSelectedTxn(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto border border-border">
          {selectedTxn && (
            <div className="space-y-4 text-xs">
              <DialogHeader>
                <DialogTitle className="font-display text-base font-bold flex items-center justify-between">
                  <span>Bank Pledged Gold Loan Case · {selectedTxn.id}</span>
                  <StatusBadge value={selectedTxn.status} />
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 p-3.5 bg-muted/20 rounded border border-border">
                <div>
                  <p className="text-muted-foreground">Borrower Details</p>
                  <p className="font-bold text-foreground text-sm mt-0.5">{selectedTxn.customerName}</p>
                  <p className="text-muted-foreground">{selectedTxn.customerMobile}</p>
                  <p className="text-muted-foreground">Branch: {selectedTxn.branch}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Financing Bank Particulars</p>
                  <p className="font-bold text-foreground text-sm mt-0.5">{selectedTxn.bankName}</p>
                  <p className="font-mono text-muted-foreground">Loan A/c: {selectedTxn.loanAccountNumber}</p>
                  <p className="font-mono text-muted-foreground">Pledge Ref: {selectedTxn.pledgeReference}</p>
                </div>
              </div>

              <div className="border border-border rounded p-3 space-y-2">
                <p className="font-bold text-foreground">Complete Transparent Financial Settlement</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross Gold Valuation ({selectedTxn.totalNetWeight}g @ {selectedTxn.averagePurity}%):</span>
                  <span className="font-mono font-bold">{formatINR(selectedTxn.grossMetalValue)}</span>
                </div>
                <div className="flex justify-between text-red-700 font-semibold">
                  <span>(−) Bank Payoff Amount Wired by AVP:</span>
                  <span className="font-mono">− {formatINR(selectedTxn.bankPaymentAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>(−) AVP Service & Conveyance Charges:</span>
                  <span className="font-mono">− {formatINR(selectedTxn.serviceFee + selectedTxn.processingFee + selectedTxn.testingFee + (selectedTxn.bankExpenses || 0) + selectedTxn.commission)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-sm bg-muted/30 p-2 rounded">
                  <span>Customer Surplus Disbursed:</span>
                  <span className="font-mono text-primary">{formatINR(selectedTxn.customerPayable)}</span>
                </div>
              </div>

              <EvidenceTimeline transactionId={selectedTxn.id} />
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
          documentType="Settlement Statement"
          transaction={printTxn}
        />
      )}
    </div>
  );
}
