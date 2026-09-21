import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ChartNoAxesCombined,
  TrendingUp,
  Percent,
  IndianRupee,
  Gem,
  Coins,
  Building2,
  ReceiptIndianRupee,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader, MetricCard } from "@/components/erp/ui";
import { branches, formatINR } from "@/lib/erp-data";
import { useERPStore } from "@/lib/erp-store";

export const Route = createFileRoute("/profit-margin")({
  component: ProfitMarginPage,
});

function ProfitMarginPage() {
  const { selectedBranch, filteredTransactions } = useERPStore();

  const totalGrossValue = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + (t.grossMetalValue || 0), 0);
  }, [filteredTransactions]);

  const totalDeductions = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + (t.totalDeductions || 0), 0);
  }, [filteredTransactions]);

  const estimatedOperatingCost = Math.round(totalGrossValue * 0.008);
  const netMargin = Math.max(0, totalDeductions - estimatedOperatingCost);
  const marginPercentage = totalGrossValue > 0 ? ((totalDeductions / totalGrossValue) * 100).toFixed(2) : "3.15";

  const branchBreakdown = useMemo(() => {
    return branches.map((b) => {
      const bTxns = filteredTransactions.filter((t) => t.branch === b.name);
      const gross = bTxns.reduce((s, t) => s + t.grossMetalValue, 0);
      const fees = bTxns.reduce((s, t) => s + t.totalDeductions, 0);
      const cost = Math.round(gross * 0.0075);
      const net = Math.max(0, fees - cost);
      const yieldPerGram = 138 + Math.floor(Math.random() * 15);

      return {
        ...b,
        txnCount: bTxns.length,
        gross,
        fees,
        net,
        yieldPerGram,
      };
    });
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Commercial & Strategy"
        title="Profit, Yield & Margin Analytics"
        description={`Unit economics per fine gram, spread between spot bullion and customer procurement, fee capture, and branch net contribution for ${
          selectedBranch === "All Branches" ? "all branches" : selectedBranch
        }.`}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Average Yield per Gram Gold"
          value="₹148.50 /g"
          delta="+₹12/g vs target"
          icon={<Gem className="size-5" />}
          accent
        />
        <MetricCard
          label="Blended Gross Fee Margin"
          value={`${marginPercentage}%`}
          delta="+0.22% optimization"
          icon={<Percent className="size-5" />}
        />
        <MetricCard
          label="Gross Revenue (Fees & Spread)"
          value={formatINR(totalDeductions)}
          delta="Includes service & processing"
          icon={<ReceiptIndianRupee className="size-5" />}
        />
        <MetricCard
          label="Estimated Net Contribution"
          value={formatINR(netMargin)}
          delta="After branch operating costs"
          icon={<TrendingUp className="size-5" />}
        />
      </div>

      {/* Revenue Streams Contribution */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Bank Pledged Release Spread</span>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              62% Share
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Higher yield stream with 2.5% service margin, bank liaison recovery (₹1,200/case) and higher ticket size.
          </p>
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Avg Net Yield:</span>
              <span className="font-bold text-foreground">₹168 / gram</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Direct Old Gold Purchase</span>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              28% Share
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Fast turnaround retail purchases with 1.5% fee margin, XRF assay fee (₹350), and instant customer settlement.
          </p>
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Avg Net Yield:</span>
              <span className="font-bold text-foreground">₹122 / gram</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Silver Bullion & Articles</span>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              10% Share
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Bulk volume turnover with ₹1.25/g melting processing deduction and wholesale refinery consolidation.
          </p>
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Avg Net Yield:</span>
              <span className="font-bold text-foreground">₹1.85 / gram</span>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Profitability Table */}
      <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground">Branch Unit Economics & Profit Contribution</h3>
          <span className="text-xs text-muted-foreground">Updated in real-time</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3 font-semibold">Branch</th>
                <th className="p-3 font-semibold text-right">Transactions</th>
                <th className="p-3 font-semibold text-right">Gross Metal Capitalized</th>
                <th className="p-3 font-semibold text-right">Fees & Deductions Earned</th>
                <th className="p-3 font-semibold text-right">Estimated Net Profit</th>
                <th className="p-3 font-semibold text-right">Gold Yield / g</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {branchBreakdown.map((b) => (
                <tr key={b.code} className="hover:bg-muted/40 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-foreground">{b.name}</div>
                    <div className="text-[10px] text-muted-foreground">{b.code} · {b.region}</div>
                  </td>
                  <td className="p-3 text-right font-medium text-foreground">{b.txnCount} deals</td>
                  <td className="p-3 text-right font-mono font-semibold text-foreground">
                    {formatINR(b.gross)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-primary">
                    {formatINR(b.fees)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">
                    {formatINR(b.net)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-foreground">
                    ₹{b.yieldPerGram}/g
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
