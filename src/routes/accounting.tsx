import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  BookOpenCheck,
  Search,
  Filter,
  Download,
  IndianRupee,
  Building2,
  ReceiptIndianRupee,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, MetricCard } from "@/components/erp/ui";
import { formatINR } from "@/lib/erp-data";
import { useERPStore } from "@/lib/erp-store";
import { toast } from "sonner";

export const Route = createFileRoute("/accounting")({
  component: AccountingPage,
});

type JournalEntry = {
  voucherNo: string;
  date: string;
  accountHead: string;
  accountCode: string;
  type: "Debit" | "Credit";
  amount: number;
  narration: string;
  referenceId: string;
  branch: string;
};

const initialJournals: JournalEntry[] = [
  {
    voucherNo: "JV-2026-0891",
    date: "21 Sep 2026",
    accountHead: "Physical Gold Inventory (Stock in Vault)",
    accountCode: "1100",
    type: "Debit",
    amount: 512000,
    narration: "Direct purchase 75.2g 22K Gold from K. Rama Rao",
    referenceId: "TXN-PUR-001",
    branch: "Hyderabad",
  },
  {
    voucherNo: "JV-2026-0892",
    date: "21 Sep 2026",
    accountHead: "Customer Net Settlement Payable",
    accountCode: "2200",
    type: "Credit",
    amount: 504320,
    narration: "Net payable after 1.5% fee to K. Rama Rao via RTGS",
    referenceId: "TXN-PUR-001",
    branch: "Hyderabad",
  },
  {
    voucherNo: "JV-2026-0893",
    date: "21 Sep 2026",
    accountHead: "Service Fee & Commission Income",
    accountCode: "4100",
    type: "Credit",
    amount: 7680,
    narration: "Service margin earned on gold purchase TXN-PUR-001",
    referenceId: "TXN-PUR-001",
    branch: "Hyderabad",
  },
  {
    voucherNo: "JV-2026-0894",
    date: "21 Sep 2026",
    accountHead: "Bank Loan Pledged Clearing (SBI Hub)",
    accountCode: "2150",
    type: "Credit",
    amount: 320000,
    narration: "Direct bank payout for release of pledged ornaments A/c 381920",
    referenceId: "TXN-BPG-002",
    branch: "Vijayawada",
  },
  {
    voucherNo: "JV-2026-0895",
    date: "21 Sep 2026",
    accountHead: "Physical Gold Inventory (Stock in Vault)",
    accountCode: "1100",
    type: "Debit",
    amount: 485000,
    narration: "Received released bank pledged ornaments 68.4g fine gold",
    referenceId: "TXN-BPG-002",
    branch: "Vijayawada",
  },
  {
    voucherNo: "JV-2026-0896",
    date: "21 Sep 2026",
    accountHead: "Customer Net Settlement Payable",
    accountCode: "2200",
    type: "Credit",
    amount: 152875,
    narration: "Balance net settlement disbursed to customer S. V. Prasad",
    referenceId: "TXN-BPG-002",
    branch: "Vijayawada",
  },
  {
    voucherNo: "JV-2026-0897",
    date: "21 Sep 2026",
    accountHead: "Bank Liaison & Conveyance Recovery",
    accountCode: "4120",
    type: "Credit",
    amount: 1650,
    narration: "Bank liaison travel & verification fee recovery",
    referenceId: "TXN-BPG-002",
    branch: "Vijayawada",
  },
  {
    voucherNo: "JV-2026-0898",
    date: "20 Sep 2026",
    accountHead: "Physical Silver Inventory (Stock in Vault)",
    accountCode: "1120",
    type: "Debit",
    amount: 142000,
    narration: "Intake of 1.5kg fine silver articles",
    referenceId: "TXN-BPS-003",
    branch: "Visakhapatnam",
  },
];

const chartOfAccounts = [
  { code: "1100", name: "Physical Gold Inventory (Vault)", category: "Asset", balance: 34520000, nature: "Debit" },
  { code: "1120", name: "Physical Silver Inventory (Vault)", category: "Asset", balance: 8940000, nature: "Debit" },
  { code: "1200", name: "HDFC Commercial Operating A/c", category: "Asset", balance: 14500000, nature: "Debit" },
  { code: "1210", name: "SBI Enterprise Disbursement A/c", category: "Asset", balance: 9800000, nature: "Debit" },
  { code: "2150", name: "Bank Pledged Loan Release Escrow", category: "Liability", balance: 4200000, nature: "Credit" },
  { code: "2200", name: "Customer Net Settlement Payable", category: "Liability", balance: 1850000, nature: "Credit" },
  { code: "4100", name: "Service Fee & Commission Income", category: "Revenue", balance: 3420000, nature: "Credit" },
  { code: "4110", name: "XRF Purity Assay Fee Income", category: "Revenue", balance: 485000, nature: "Credit" },
  { code: "4120", name: "Bank Liaison Recovery Income", category: "Revenue", balance: 642000, nature: "Credit" },
  { code: "5100", name: "GST Output Payable (18%)", category: "Liability", balance: 818000, nature: "Credit" },
];

function AccountingPage() {
  const { selectedBranch } = useERPStore();
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState("All");

  const filteredJournals = useMemo(() => {
    return initialJournals.filter((j) => {
      const matchBranch = selectedBranch === "All Branches" || j.branch === selectedBranch;
      const matchSearch =
        search === "" ||
        j.voucherNo.toLowerCase().includes(search.toLowerCase()) ||
        j.accountHead.toLowerCase().includes(search.toLowerCase()) ||
        j.narration.toLowerCase().includes(search.toLowerCase()) ||
        j.referenceId.toLowerCase().includes(search.toLowerCase());

      const matchAccount = accountFilter === "All" || j.accountCode === accountFilter;

      return matchBranch && matchSearch && matchAccount;
    });
  }, [selectedBranch, search, accountFilter]);

  const totalDebit = filteredJournals
    .filter((j) => j.type === "Debit")
    .reduce((sum, j) => sum + j.amount, 0);

  const totalCredit = filteredJournals
    .filter((j) => j.type === "Credit")
    .reduce((sum, j) => sum + j.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance & Control"
        title="Accounting & General Ledgers"
        description={`Double-entry journal ledgers, bullion inventory capitalization, bank loan release debits, and customer settlement balances for ${
          selectedBranch === "All Branches" ? "all branches" : selectedBranch
        }.`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => toast.success("Tally / ERP Ledger XML export generated successfully")}
              className="gap-1.5"
            >
              <Download className="size-4" />
              Export Tally XML
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Gold Inventory Capitalized"
          value={formatINR(34520000)}
          icon={<IndianRupee className="size-5" />}
          accent
        />
        <MetricCard
          label="Bank Pledged Escrow Disbursed"
          value={formatINR(4200000)}
          delta="Direct to Lending Banks"
          icon={<Building2 className="size-5" />}
        />
        <MetricCard
          label="Service & Fee Revenue Recognized"
          value={formatINR(4547000)}
          delta="+18.4% month-to-date"
          icon={<TrendingUp className="size-5" />}
        />
        <MetricCard
          label="Pending Customer Payables"
          value={formatINR(1850000)}
          delta="Queued for RTGS Release"
          icon={<ReceiptIndianRupee className="size-5" />}
        />
      </div>

      <Tabs defaultValue="journals" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="journals" className="gap-2">
            <BookOpenCheck className="size-4" />
            General Ledger Journal Entries ({filteredJournals.length})
          </TabsTrigger>
          <TabsTrigger value="chart" className="gap-2">
            <Layers className="size-4" />
            Chart of Accounts & Balances ({chartOfAccounts.length})
          </TabsTrigger>
          <TabsTrigger value="bankbook" className="gap-2">
            <Building2 className="size-4" />
            Operating Bank & Cash Accounts
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: JOURNALS */}
        <TabsContent value="journals" className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search voucher, account, narration, txn..."
                className="pl-8 text-xs h-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger className="h-9 w-48 text-xs">
                  <SelectValue placeholder="Account Head" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Account Heads</SelectItem>
                  {chartOfAccounts.map((a) => (
                    <SelectItem key={a.code} value={a.code}>
                      {a.code} - {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="p-3 font-semibold">Voucher & Date</th>
                    <th className="p-3 font-semibold">Account Head</th>
                    <th className="p-3 font-semibold">Narration</th>
                    <th className="p-3 font-semibold">Ref Txn</th>
                    <th className="p-3 font-semibold text-right">Debit (Dr ₹)</th>
                    <th className="p-3 font-semibold text-right">Credit (Cr ₹)</th>
                    <th className="p-3 font-semibold">Branch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredJournals.map((j) => (
                    <tr key={j.voucherNo} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold font-mono text-foreground">{j.voucherNo}</div>
                        <div className="text-[10px] text-muted-foreground">{j.date}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{j.accountHead}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">Code: {j.accountCode}</div>
                      </td>
                      <td className="p-3 text-muted-foreground max-w-xs">{j.narration}</td>
                      <td className="p-3">
                        <span className="font-mono text-[11px] rounded bg-muted px-1.5 py-0.5 text-foreground font-medium">
                          {j.referenceId}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-foreground">
                        {j.type === "Debit" ? (
                          <span className="text-emerald-700">
                            +{formatINR(j.amount)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-foreground">
                        {j.type === "Credit" ? (
                          <span className="text-amber-700">
                            {formatINR(j.amount)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-3">
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                          {j.branch}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/30 border-t border-border font-bold text-xs">
                  <tr>
                    <td colSpan={4} className="p-3 text-right text-muted-foreground">
                      Total Ledger Summary:
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-800 font-bold">
                      {formatINR(totalDebit)}
                    </td>
                    <td className="p-3 text-right font-mono text-amber-800 font-bold">
                      {formatINR(totalCredit)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: CHART OF ACCOUNTS */}
        <TabsContent value="chart" className="space-y-4">
          <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-3 font-semibold">Account Code</th>
                  <th className="p-3 font-semibold">Account Head Title</th>
                  <th className="p-3 font-semibold">Classification</th>
                  <th className="p-3 font-semibold">Normal Balance</th>
                  <th className="p-3 text-right font-semibold">Current Ledger Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {chartOfAccounts.map((ac) => (
                  <tr key={ac.code} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-primary">{ac.code}</td>
                    <td className="p-3 font-semibold text-foreground">{ac.name}</td>
                    <td className="p-3">
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                        {ac.category}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{ac.nature}</td>
                    <td className="p-3 text-right font-mono font-bold text-foreground">
                      {formatINR(ac.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* TAB 3: OPERATING BANK & CASH */}
        <TabsContent value="bankbook">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">HDFC Current A/c - 50200031892</span>
                <Building2 className="size-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Primary RTGS/NEFT settlement disbursement account</p>
              <div className="pt-2 border-t border-border">
                <span className="text-[10px] text-muted-foreground">Available Cleared Balance</span>
                <p className="text-xl font-bold font-display text-emerald-700">{formatINR(14500000)}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">SBI Escrow Payout - 390128490</span>
                <Building2 className="size-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Dedicated bank pledged loan closure transfer account</p>
              <div className="pt-2 border-t border-border">
                <span className="text-[10px] text-muted-foreground">Available Cleared Balance</span>
                <p className="text-xl font-bold font-display text-emerald-700">{formatINR(9800000)}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Branch Petty Cash Float</span>
                <ReceiptIndianRupee className="size-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Regulated cash counter float (max ₹10,000 / customer)</p>
              <div className="pt-2 border-t border-border">
                <span className="text-[10px] text-muted-foreground">Current Counter Cash</span>
                <p className="text-xl font-bold font-display text-foreground">{formatINR(48500)}</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
