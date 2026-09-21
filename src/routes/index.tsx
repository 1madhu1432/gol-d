import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  Banknote,
  Boxes,
  ChevronRight,
  IndianRupee,
  Coins,
  Gem,
  HandCoins,
  Landmark,
  ReceiptIndianRupee,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  FileSpreadsheet,
  ArrowUpRight,
  RefreshCw,
  Building2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  branches,
  chartData,
  monthlyProfitMarginData,
  formatINR,
  formatGrams,
  formatKg,
  type Transaction,
} from "@/lib/erp-data";
import { useERPStore } from "@/lib/erp-store";
import { MetricCard, PageHeader, Panel, StatusBadge } from "@/components/erp/ui";
import { PrintableDocumentModal } from "@/components/erp/printable-documents";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

const tipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  color: "var(--foreground)",
};

function DashboardPage() {
  const {
    selectedBranch,
    setSelectedBranch,
    filteredTransactions,
    filteredApprovals,
    filteredInventory,
    filteredPayments,
    approveTransaction,
  } = useERPStore();

  const [period, setPeriod] = useState<string>("month");
  const [metalFilter, setMetalFilter] = useState<string>("all");
  const [selectedTxnForPrint, setSelectedTxnForPrint] = useState<Transaction | null>(null);

  // Dynamic KPIs derived from active branch & transactions
  const kpis = useMemo(() => {
    let goldWeight = 0;
    let silverWeight = 0;
    let totalPurchaseVal = 0;
    let bankPledgedCount = 0;
    let customerPayouts = 0;
    let charges = 0;
    let commission = 0;
    let totalInventoryVal = 0;

    filteredTransactions.forEach((t) => {
      if (t.metal === "Gold") goldWeight += t.totalNetWeight;
      else silverWeight += t.totalNetWeight;

      totalPurchaseVal += t.grossMetalValue;
      if (t.type === "Bank Pledged") bankPledgedCount += 1;
      customerPayouts += t.customerPayable;
      charges += t.serviceFee + t.processingFee + t.testingFee + (t.bankExpenses || 0);
      commission += t.commission;
    });

    filteredInventory.forEach((inv) => {
      totalInventoryVal += inv.marketValue;
    });

    const expectedMargin = Math.round(charges + commission + totalPurchaseVal * 0.045);

    return {
      totalTransactions: filteredTransactions.length,
      goldWeightGrams: goldWeight,
      silverWeightKg: silverWeight / 1000,
      totalPurchaseValue: totalPurchaseVal,
      bankPledgedCount,
      customerPayouts,
      chargesCollected: charges,
      commissionCollected: commission,
      inventoryValue: totalInventoryVal,
      expectedMargin,
    };
  }, [filteredTransactions, filteredInventory]);

  // Branch performance data
  const branchData = useMemo(() => {
    return branches.map((b, i) => ({
      name: b.name.slice(0, 3).toUpperCase(),
      fullName: b.name,
      value: Math.round(b.achieved / 100000),
      target: Math.round(b.target / 100000),
      fill: ["#947116", "#475569", "#2563eb", "#059669", "#d97706"][i],
    }));
  }, []);

  // Status breakdown data for pie
  const statusPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTransactions.forEach((t) => {
      const group = t.status === "Completed" || t.status === "Customer Paid" ? "Settled" : t.status.includes("Bank") ? "Bank Workflow" : t.status.includes("Testing") ? "Assay Testing" : "Pending";
      counts[group] = (counts[group] || 0) + 1;
    });
    return [
      { name: "Settled & Vaulted", value: counts["Settled"] || 45, fill: "#15803d" },
      { name: "Bank Release Workflow", value: counts["Bank Workflow"] || 28, fill: "#947116" },
      { name: "Assay & Valuation", value: counts["Assay Testing"] || 22, fill: "#2563eb" },
      { name: "Pending Approval", value: counts["Pending"] || 15, fill: "#d97706" },
    ];
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        eyebrow="Executive Central Desk"
        title="Operations & Bullion Overview"
        description={`Active branch: ${selectedBranch} · Real-time bullion intake, bank pledged releases, custody inventory and financial settlements.`}
        actions={
          <>
            <div className="flex items-center gap-2">
              <Select value={metalFilter} onValueChange={setMetalFilter}>
                <SelectTrigger className="h-9 w-36 text-xs font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Metals</SelectItem>
                  <SelectItem value="gold">Gold Only</SelectItem>
                  <SelectItem value="silver">Silver Only</SelectItem>
                </SelectContent>
              </Select>

              <Tabs value={period} onValueChange={setPeriod}>
                <TabsList className="h-9">
                  <TabsTrigger value="today" className="text-xs">Today</TabsTrigger>
                  <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
                  <TabsTrigger value="month" className="text-xs">Month</TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs"
                onClick={() => toast.success("Dashboard metrics synchronized with branch vaults.")}
              >
                <RefreshCw className="size-3.5 text-muted-foreground" />
                Sync
              </Button>
            </div>
          </>
        }
      />

      {/* 10 KPI CARDS */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          label="Total Transactions"
          value={String(kpis.totalTransactions)}
          delta="+14.2%"
          icon={<Activity />}
        />
        <MetricCard
          label="Gold Acquired"
          value={formatGrams(kpis.goldWeightGrams)}
          delta="+9.8%"
          icon={<Gem />}
          accent
        />
        <MetricCard
          label="Silver Acquired"
          value={formatKg(kpis.silverWeightKg)}
          delta="+6.4%"
          icon={<Coins />}
        />
        <MetricCard
          label="Total Purchase Value"
          value={formatINR(kpis.totalPurchaseValue)}
          delta="+11.5%"
          icon={<IndianRupee />}
        />
        <MetricCard
          label="Bank-Pledged Redemptions"
          value={String(kpis.bankPledgedCount)}
          delta="+8.1%"
          icon={<Landmark />}
          accent
        />
        <MetricCard
          label="Customer Payouts"
          value={formatINR(kpis.customerPayouts)}
          delta="+10.2%"
          icon={<HandCoins />}
        />
        <MetricCard
          label="Charges Collected"
          value={formatINR(kpis.chargesCollected)}
          delta="+7.4%"
          icon={<ReceiptIndianRupee />}
        />
        <MetricCard
          label="Commission Earned"
          value={formatINR(kpis.commissionCollected)}
          delta="+5.2%"
          icon={<Banknote />}
        />
        <MetricCard
          label="Vault Inventory Value"
          value={formatINR(kpis.inventoryValue)}
          delta="+8.9%"
          icon={<Boxes />}
        />
        <MetricCard
          label="Expected Gross Margin"
          value={formatINR(kpis.expectedMargin)}
          delta="+12.8%"
          icon={<TrendingUp />}
          accent
        />
      </div>

      {/* CHARTS ROW 1: Trend & Branch Performance */}
      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <Panel
          title="Daily Purchase Value Trend"
          subtitle="Direct Counter Purchases vs Bank Pledged Wire Settlements (₹ Lakhs)"
        >
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#947116" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#947116" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pledgedArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `₹${v}L`} />
                <Tooltip contentStyle={tipStyle} />
                <Area type="monotone" dataKey="value" stroke="#947116" strokeWidth={2.5} fill="url(#goldArea)" name="Total Value (₹L)" />
                <Area type="monotone" dataKey="pledged" stroke="#2563eb" strokeWidth={2} fill="url(#pledgedArea)" name="Bank Pledged Wire (₹L)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="Branch Target vs Realized"
          subtitle="Monthly target performance across 5 regional hubs (₹ Lakhs)"
        >
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `₹${v}L`} />
                <Tooltip contentStyle={tipStyle} />
                <Bar dataKey="target" fill="var(--muted)" radius={[3, 3, 0, 0]} name="Target (₹L)" />
                <Bar dataKey="value" radius={[3, 3, 0, 0]} name="Achieved (₹L)">
                  {branchData.map((x, i) => (
                    <Cell key={i} fill={x.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* CHARTS ROW 2: Mix, Status & Operations Queue */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Metal Mix */}
        <Panel title="Metal & Status Distribution" subtitle="Active transactions by operational stage">
          <div className="h-64 p-3 flex items-center">
            <div className="h-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 pr-3 text-xs">
              {statusPieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                  <span className="text-muted-foreground truncate max-w-28">{item.name}:</span>
                  <span className="font-bold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* Pending Approvals */}
        <Panel
          title="Central Approval Queue"
          subtitle={`${filteredApprovals.filter((a) => a.status === "Pending").length} high-priority authorizations`}
          action={
            <Link to="/approvals">
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 font-semibold text-primary">
                View Queue <ChevronRight className="size-3.5" />
              </Button>
            </Link>
          }
        >
          <div className="divide-y divide-border">
            {filteredApprovals
              .filter((a) => a.status === "Pending")
              .slice(0, 4)
              .map((a) => (
                <div key={a.id} className="p-3 flex items-center justify-between hover:bg-muted/40 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-primary">{a.id}</span>
                      <span className="rounded bg-warning-muted px-1.5 py-0.2 text-[9px] font-bold text-warning-strong uppercase">
                        {a.priority}
                      </span>
                    </div>
                    <p className="truncate text-xs font-semibold text-foreground mt-0.5">{a.customerName} · {a.type}</p>
                    <p className="text-[11px] text-muted-foreground">{a.branch} · {formatINR(a.amount)}</p>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 text-xs font-bold gap-1 ml-2"
                    onClick={() => approveTransaction(a.transactionId)}
                  >
                    Approve
                  </Button>
                </div>
              ))}
          </div>
        </Panel>

        {/* Operations Queue Checklist */}
        <Panel title="Desk Operational Queue" subtitle="Actionable items across current branch">
          <div className="divide-y divide-border text-xs">
            <Link to="/bank-pledged-gold" className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="grid size-8 place-items-center rounded bg-blue-50 text-blue-700">
                  <Landmark className="size-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Bank Payoff Pending</p>
                  <p className="text-[11px] text-muted-foreground">Authorize RTGS wire to banks</p>
                </div>
              </div>
              <span className="font-mono text-sm font-bold text-blue-700">14 loans</span>
            </Link>

            <Link to="/settlements" className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="grid size-8 place-items-center rounded bg-amber-50 text-amber-700">
                  <HandCoins className="size-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Customer Settlements</p>
                  <p className="text-[11px] text-muted-foreground">Ready for payout disbursement</p>
                </div>
              </div>
              <span className="font-mono text-sm font-bold text-amber-700">9 vouchers</span>
            </Link>

            <Link to="/testing" className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="grid size-8 place-items-center rounded bg-purple-50 text-purple-700">
                  <Activity className="size-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">XRF Spectrometer Assay</p>
                  <p className="text-[11px] text-muted-foreground">Pending metal lab verification</p>
                </div>
              </div>
              <span className="font-mono text-sm font-bold text-purple-700">6 lots</span>
            </Link>

            <Link to="/transfers" className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="grid size-8 place-items-center rounded bg-emerald-50 text-emerald-700">
                  <Boxes className="size-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Branch Escort Transfers</p>
                  <p className="text-[11px] text-muted-foreground">Armored transit packets</p>
                </div>
              </div>
              <span className="font-mono text-sm font-bold text-emerald-700">3 in transit</span>
            </Link>
          </div>
        </Panel>
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <Panel
        title="Recent Precious Metal Transactions"
        subtitle={`Showing latest intake and loan redemption records for ${selectedBranch}`}
        action={
          <div className="flex gap-2">
            <Link to="/gold-purchase">
              <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                Gold Purchases
              </Button>
            </Link>
            <Link to="/bank-pledged-gold">
              <Button size="sm" className="h-8 text-xs font-semibold gap-1">
                Bank Pledged Desk <ChevronRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-table-head text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Txn ID</th>
                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                <th className="px-4 py-3 text-left font-semibold">Branch</th>
                <th className="px-4 py-3 text-left font-semibold">Classification</th>
                <th className="px-4 py-3 text-right font-semibold">Net Weight</th>
                <th className="px-4 py-3 text-right font-semibold">Purity</th>
                <th className="px-4 py-3 text-right font-semibold">Gross Value</th>
                <th className="px-4 py-3 text-right font-semibold">Customer Payable</th>
                <th className="px-4 py-3 text-center font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.slice(0, 8).map((t) => (
                <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-primary">{t.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{t.customerName}</p>
                    <p className="text-[10px] text-muted-foreground">{t.customerMobile}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.branch}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{t.metal}</span>
                    <span className="block text-[10px] text-muted-foreground">{t.type}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold">{formatGrams(t.totalNetWeight)}</td>
                  <td className="px-4 py-3 text-right font-mono text-amber-900 font-semibold">{t.averagePurity}%</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">{formatINR(t.grossMetalValue)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-foreground">{formatINR(t.customerPayable)}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge value={t.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 font-semibold"
                      onClick={() => setSelectedTxnForPrint(t)}
                    >
                      <Printer className="size-3 text-muted-foreground" /> Receipt
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Printable Sheet Modal */}
      {selectedTxnForPrint && (
        <PrintableDocumentModal
          open={!!selectedTxnForPrint}
          onOpenChange={(open) => !open && setSelectedTxnForPrint(null)}
          documentType="Settlement Statement"
          transaction={selectedTxnForPrint}
        />
      )}
    </div>
  );
}
