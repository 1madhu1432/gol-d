import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ChartColumnBig,
  TrendingUp,
  Gem,
  Coins,
  Building2,
  Users,
  Clock,
  ArrowUpRight,
  PieChart as PieChartIcon,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { PageHeader, MetricCard } from "@/components/erp/ui";
import { formatINR } from "@/lib/erp-data";
import { useERPStore } from "@/lib/erp-store";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

const volumeTrendData = [
  { day: "15 Sep", gold: 1250, silver: 18000, value: 8900000 },
  { day: "16 Sep", gold: 1420, silver: 22000, value: 10400000 },
  { day: "17 Sep", gold: 1680, silver: 19500, value: 12100000 },
  { day: "18 Sep", gold: 1390, silver: 24000, value: 10800000 },
  { day: "19 Sep", gold: 1890, silver: 31000, value: 14200000 },
  { day: "20 Sep", gold: 2100, silver: 28000, value: 15600000 },
  { day: "21 Sep", gold: 2450, silver: 34500, value: 18200000 },
];

const purityMixData = [
  { name: "22K Gold (916)", value: 68, color: "#d97706" },
  { name: "24K Gold (999)", value: 14, color: "#f59e0b" },
  { name: "18K Gold (750)", value: 8, color: "#b45309" },
  { name: "999 Silver", value: 7, color: "#94a3b8" },
  { name: "925 Sterling", value: 3, color: "#64748b" },
];

const bankShareData = [
  { name: "State Bank of India", count: 42, value: 13440000 },
  { name: "Canara Bank", count: 28, value: 8960000 },
  { name: "HDFC Bank", count: 24, value: 7680000 },
  { name: "Union Bank of India", count: 18, value: 5760000 },
  { name: "APGVB & Others", count: 14, value: 4480000 },
];

function AnalyticsPage() {
  const { selectedBranch, filteredTransactions, filteredCustomers } = useERPStore();

  const totalGoldGrams = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.metal === "Gold")
      .reduce((sum, t) => sum + (t.totalFineWeight || 0), 0);
  }, [filteredTransactions]);

  const bankPledgeCount = filteredTransactions.filter((t) => t.type === "Bank Pledged").length;
  const directPurchaseCount = filteredTransactions.filter((t) => t.type === "Old Metal Purchase").length;
  const totalDeals = filteredTransactions.length || 1;

  const bankSharePct = Math.round((bankPledgeCount / totalDeals) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Executive Control"
        title="Enterprise Business Analytics"
        description={`Procurement volume trends, purity distribution, bank pledge market share, and operational velocity for ${
          selectedBranch === "All Branches" ? "all branches" : selectedBranch
        }.`}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Gold Fine Volume"
          value={`${totalGoldGrams.toFixed(1)}g`}
          delta="+19.4% week-on-week"
          icon={<Gem className="size-5" />}
          accent
        />
        <MetricCard
          label="Bank Pledged Deal Share"
          value={`${bankSharePct}%`}
          delta={`${bankPledgeCount} bank release deals`}
          icon={<Building2 className="size-5" />}
        />
        <MetricCard
          label="Avg Deal Turnaround Time"
          value="24 mins"
          delta="From KYC to RTGS payout"
          icon={<Clock className="size-5" />}
        />
        <MetricCard
          label="Active Customer Base"
          value={String(filteredCustomers.length)}
          delta="100% KYC verified"
          icon={<Users className="size-5" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Daily Procurement Volume Chart */}
        <div className="lg:col-span-8 rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-semibold text-sm text-foreground">7-Day Metal Procurement Volume Trend</h3>
              <p className="text-xs text-muted-foreground">Fine gold grams and silver grams procured across network</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span className="size-2 rounded-full bg-amber-500" /> Gold (g)
              </span>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span className="size-2 rounded-full bg-slate-400" /> Silver (g)
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="gold" orientation="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="silver" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.95)", borderRadius: 6, fontSize: 12, border: "1px solid #e2e8f0" }}
                />
                <Bar yAxisId="gold" dataKey="gold" fill="#d97706" radius={[4, 4, 0, 0]} name="Gold (g)" />
                <Bar yAxisId="silver" dataKey="silver" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Silver (g)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Purity Mix Pie Chart */}
        <div className="lg:col-span-4 rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-semibold text-sm text-foreground">Metal Purity Distribution</h3>
            <p className="text-xs text-muted-foreground">Share of assayed intake by purity</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={purityMixData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {purityMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {purityMixData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-bold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lending Bank Pledged Volume Share */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-foreground">Lending Partner Bank Pledged Settlement Share</h3>
            <p className="text-xs text-muted-foreground">Distribution of bank release transactions by lending institution</p>
          </div>
          <span className="text-xs font-semibold text-primary">Top 5 Banks = 88% of Bank Volumes</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {bankShareData.map((b) => (
            <div key={b.name} className="rounded border border-border bg-muted/30 p-3 space-y-1">
              <span className="text-xs font-semibold text-foreground line-clamp-1">{b.name}</span>
              <p className="text-base font-bold font-display text-primary">{formatINR(b.value)}</p>
              <div className="text-[10px] text-muted-foreground flex justify-between">
                <span>{b.count} Releases</span>
                <span className="font-medium text-emerald-700">100% UTR Match</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
