import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Download,
  Building2,
  Gem,
  Coins,
  ReceiptIndianRupee,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, MetricCard } from "@/components/erp/ui";
import { formatINR, partnerBanks } from "@/lib/erp-data";
import { useERPStore } from "@/lib/erp-store";
import { toast } from "sonner";

export const Route = createFileRoute("/reconciliation")({
  component: ReconciliationPage,
});

type BankReconciliationItem = {
  id: string;
  transactionId: string;
  bankName: string;
  loanAccountNumber: string;
  amountDisbursed: number;
  utrNumber: string;
  payoutDate: string;
  closureCertReceived: boolean;
  bankAckNumber: string;
  status: "Matched" | "Pending Bank Ack" | "Discrepancy";
  variance: number;
};

const initialBankMatches: BankReconciliationItem[] = [
  {
    id: "REC-BNK-01",
    transactionId: "TXN-BPG-002",
    bankName: "State Bank of India",
    loanAccountNumber: "GL-SBIN-381920",
    amountDisbursed: 320000,
    utrNumber: "SBIN202609210081290",
    payoutDate: "21 Sep 2026",
    closureCertReceived: true,
    bankAckNumber: "ACK-SBI-99120",
    status: "Matched",
    variance: 0,
  },
  {
    id: "REC-BNK-02",
    transactionId: "TXN-BPS-003",
    bankName: "Canara Bank",
    loanAccountNumber: "GL-CNRB-441890",
    amountDisbursed: 85000,
    utrNumber: "CNRB202609200049182",
    payoutDate: "20 Sep 2026",
    closureCertReceived: true,
    bankAckNumber: "ACK-CAN-51829",
    status: "Matched",
    variance: 0,
  },
  {
    id: "REC-BNK-03",
    transactionId: "TXN-BPG-006",
    bankName: "HDFC Bank",
    loanAccountNumber: "GL-HDFC-910248",
    amountDisbursed: 450000,
    utrNumber: "HDFC202609210091823",
    payoutDate: "21 Sep 2026",
    closureCertReceived: false,
    bankAckNumber: "Pending Liaison Delivery",
    status: "Pending Bank Ack",
    variance: 0,
  },
];

const initialWeightMatches = [
  {
    id: "REC-WT-01",
    itemId: "ITM-HYD-901",
    packetId: "PKT-HYD-901",
    metal: "Gold",
    bookGrossGrams: 75.24,
    scaleGrossGrams: 75.238,
    varianceGrams: -0.002,
    toleranceGrams: 0.01,
    scaleDevice: "Mettler Toledo Precision ME204",
    calibrationStatus: "Valid (ISO 17025)",
    status: "Matched",
  },
  {
    id: "REC-WT-02",
    itemId: "ITM-VJA-902",
    packetId: "PKT-VJA-902",
    metal: "Gold",
    bookGrossGrams: 68.4,
    scaleGrossGrams: 68.405,
    varianceGrams: 0.005,
    toleranceGrams: 0.01,
    scaleDevice: "Mettler Toledo Precision ME204",
    calibrationStatus: "Valid (ISO 17025)",
    status: "Matched",
  },
  {
    id: "REC-WT-03",
    itemId: "ITM-VSK-903",
    packetId: "PKT-VSK-903",
    metal: "Silver",
    bookGrossGrams: 1520.0,
    scaleGrossGrams: 1519.8,
    varianceGrams: -0.2,
    toleranceGrams: 1.0,
    scaleDevice: "Shimadzu High Capacity Scale",
    calibrationStatus: "Valid (ISO 17025)",
    status: "Matched",
  },
];

function ReconciliationPage() {
  const { selectedBranch } = useERPStore();
  const [bankMatches, setBankMatches] = useState(initialBankMatches);
  const [weightMatches, setWeightMatches] = useState(initialWeightMatches);
  const [isReconciling, setIsReconciling] = useState(false);

  const handleRunReconciliation = () => {
    setIsReconciling(true);
    setTimeout(() => {
      setIsReconciling(false);
      toast.success("Triple-Way Reconciliation Complete: 100% Transactions Reconciled with Zero Discrepancies");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance & Custody Control"
        title="Reconciliation & Audit Matching"
        description={`Triple-way validation: Bank loan payouts vs closure certificates, electronic scale weights vs packet assay records, and customer RTGS settlements for ${
          selectedBranch === "All Branches" ? "all branches" : selectedBranch
        }.`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => toast.success("Bank statement MT940 / CSV uploaded for auto-matching")}
              className="gap-1.5"
            >
              Upload Bank Statement
            </Button>
            <Button onClick={handleRunReconciliation} disabled={isReconciling} className="gap-1.5">
              <RefreshCw className={`size-4 ${isReconciling ? "animate-spin" : ""}`} />
              Run Auto-Reconciliation
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Bank Pledged Loan Match Rate"
          value="100%"
          delta="32 of 32 Settled with Banks"
          icon={<Building2 className="size-5" />}
          accent
        />
        <MetricCard
          label="Physical Metal Variance"
          value="0.002g"
          delta="Well within ±0.010g limit"
          icon={<Scale className="size-5" />}
        />
        <MetricCard
          label="Customer Payment Matching"
          value="99.4%"
          delta="Matched with HDFC/SBI UTR"
          icon={<FileCheck2 className="size-5" />}
        />
        <MetricCard
          label="Unresolved Discrepancies"
          value="0"
          delta="Zero Financial Leakage"
          icon={<ShieldCheck className="size-5" />}
        />
      </div>

      <Tabs defaultValue="bank" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="bank" className="gap-2">
            <Building2 className="size-4" />
            Bank Loan Closure vs Payout Matching
          </TabsTrigger>
          <TabsTrigger value="weight" className="gap-2">
            <Scale className="size-4" />
            Digital Scale vs Book Weight Audit
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: BANK MATCHES */}
        <TabsContent value="bank" className="space-y-4">
          <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-3 font-semibold">Ref & Txn</th>
                  <th className="p-3 font-semibold">Lending Bank & Loan A/c</th>
                  <th className="p-3 font-semibold text-right">Disbursed by AVP</th>
                  <th className="p-3 font-semibold">Bank RTGS UTR #</th>
                  <th className="p-3 font-semibold">Closure Certificate</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bankMatches.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold font-mono text-foreground">{item.id}</div>
                      <div className="text-[10px] text-muted-foreground">{item.transactionId}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-foreground">{item.bankName}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{item.loanAccountNumber}</div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-foreground">
                      {formatINR(item.amountDisbursed)}
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-[11px] text-foreground">{item.utrNumber}</div>
                      <div className="text-[10px] text-muted-foreground">Date: {item.payoutDate}</div>
                    </td>
                    <td className="p-3">
                      {item.closureCertReceived ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          Received & Sealed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                          <AlertTriangle className="size-3 text-amber-600" />
                          Awaiting Counterfoil
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          item.status === "Matched"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            item.status === "Matched" ? "bg-emerald-600" : "bg-amber-600"
                          }`}
                        />
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.success(`Bank closure document verified for ${item.loanAccountNumber}`)}
                        className="h-7 text-[11px]"
                      >
                        Inspect Proof
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* TAB 2: WEIGHT MATCHES */}
        <TabsContent value="weight" className="space-y-4">
          <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-3 font-semibold">Item & Packet ID</th>
                  <th className="p-3 font-semibold">Precious Metal</th>
                  <th className="p-3 font-semibold text-right">Book Gross Wt</th>
                  <th className="p-3 font-semibold text-right">Scale Tare/Net Wt</th>
                  <th className="p-3 font-semibold text-right">Variance (g)</th>
                  <th className="p-3 font-semibold">Scale Calibration</th>
                  <th className="p-3 font-semibold">Audit Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {weightMatches.map((w) => (
                  <tr key={w.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold font-mono text-foreground">{w.itemId}</div>
                      <div className="font-mono text-[10px] text-primary">{w.packetId}</div>
                    </td>
                    <td className="p-3 font-medium text-foreground">{w.metal}</td>
                    <td className="p-3 text-right font-mono font-semibold text-foreground">
                      {w.bookGrossGrams.toFixed(3)}g
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-foreground">
                      {w.scaleGrossGrams.toFixed(3)}g
                    </td>
                    <td className="p-3 text-right font-mono font-bold">
                      <span className={Math.abs(w.varianceGrams) <= w.toleranceGrams ? "text-emerald-700" : "text-destructive"}>
                        {w.varianceGrams > 0 ? `+${w.varianceGrams.toFixed(3)}` : w.varianceGrams.toFixed(3)}g
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="text-foreground font-medium">{w.scaleDevice}</div>
                      <div className="text-[10px] text-muted-foreground">{w.calibrationStatus}</div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                        <CheckCircle2 className="size-3" />
                        Within Tolerance
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
