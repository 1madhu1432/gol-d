import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Files,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Gem,
  Coins,
  Landmark,
  Building2,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/erp/ui";
import { useERPStore } from "@/lib/erp-store";
import { formatINR, formatGrams } from "@/lib/erp-data";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

function StatCard({ label, value, sub, icon: Icon, iconClass }: {
  label: string; value: string; sub?: string; icon: React.ElementType; iconClass: string;
}) {
  return (
    <div className="bg-white border border-avp-border rounded-xl shadow-sm p-5 flex items-start justify-between">
      <div>
        <p className="text-xs text-avp-charcoal/60 uppercase font-semibold">{label}</p>
        <p className="text-2xl font-bold text-avp-charcoal mt-1 font-mono">{value}</p>
        {sub && <p className="text-xs text-avp-charcoal/50 mt-0.5">{sub}</p>}
      </div>
      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${iconClass}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h3 className="font-semibold text-avp-charcoal text-base">{title}</h3>
      <div className="flex-1 h-px bg-avp-border" />
    </div>
  );
}

function ReportsPage() {
  const { transactions, customers, filteredTransactions, filteredCustomers, selectedBranch } = useERPStore();

  const stats = useMemo(() => {
    const scope = selectedBranch === "All Branches" ? transactions : filteredTransactions;
    const custScope = selectedBranch === "All Branches" ? customers : filteredCustomers;

    const goldPurchase = scope.filter((t) => t.type === "Old Metal Purchase" && t.metal === "Gold");
    const silverPurchase = scope.filter((t) => t.type === "Old Metal Purchase" && t.metal === "Silver");
    const bankGold = scope.filter((t) => t.type === "Bank Pledged" && t.metal === "Gold");
    const bankSilver = scope.filter((t) => t.type === "Bank Pledged" && t.metal === "Silver");

    const totalRevenue = scope.reduce((a, t) => a + t.grossMetalValue, 0);
    const totalPayout = scope.reduce((a, t) => a + t.customerPayable, 0);
    const totalDeductions = scope.reduce((a, t) => a + t.totalDeductions, 0);
    const goldWeight = scope.filter((t) => t.metal === "Gold").reduce((a, t) => a + t.totalNetWeight, 0);
    const silverWeight = scope.filter((t) => t.metal === "Silver").reduce((a, t) => a + t.totalNetWeight, 0);
    const completedTxns = scope.filter((t) => ["Completed", "Customer Paid", "Inventory"].includes(t.status)).length;

    return {
      totalTxns: scope.length,
      completedTxns,
      totalRevenue,
      totalPayout,
      totalDeductions,
      goldWeight,
      silverWeight,
      goldPurchase: { count: goldPurchase.length, value: goldPurchase.reduce((a, t) => a + t.grossMetalValue, 0), weight: goldPurchase.reduce((a, t) => a + t.totalNetWeight, 0) },
      silverPurchase: { count: silverPurchase.length, value: silverPurchase.reduce((a, t) => a + t.grossMetalValue, 0), weight: silverPurchase.reduce((a, t) => a + t.totalNetWeight, 0) },
      bankGold: { count: bankGold.length, value: bankGold.reduce((a, t) => a + t.grossMetalValue, 0), bankPaid: bankGold.reduce((a, t) => a + (t.bankPaymentAmount || 0), 0) },
      bankSilver: { count: bankSilver.length, value: bankSilver.reduce((a, t) => a + t.grossMetalValue, 0), bankPaid: bankSilver.reduce((a, t) => a + (t.bankPaymentAmount || 0), 0) },
      totalCustomers: custScope.length,
      kycVerified: custScope.filter((c) => c.kycStatus === "Verified").length,
    };
  }, [transactions, customers, filteredTransactions, filteredCustomers, selectedBranch]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        subtitle={`Summary report for ${selectedBranch}`}
        action={
          <Button className="bg-avp-gold hover:bg-avp-gold/90 text-avp-charcoal">
            <Files className="h-4 w-4 mr-2" /> Export PDF
          </Button>
        }
      />

      {/* Overall */}
      <div>
        <SectionHeader title="Overall Performance" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Transactions" value={String(stats.totalTxns)} sub={`${stats.completedTxns} completed`} icon={CheckCircle2} iconClass="bg-violet-100 text-violet-600" />
          <StatCard label="Gross Metal Value" value={formatINR(stats.totalRevenue)} icon={IndianRupee} iconClass="bg-amber-100 text-amber-700" />
          <StatCard label="Total Deductions" value={formatINR(stats.totalDeductions)} icon={TrendingDown} iconClass="bg-red-100 text-red-500" />
          <StatCard label="Net Paid to Customers" value={formatINR(stats.totalPayout)} icon={TrendingUp} iconClass="bg-emerald-100 text-emerald-600" />
        </div>
      </div>

      {/* Gold Purchase */}
      <div>
        <SectionHeader title="Old Gold Purchase" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Transactions" value={String(stats.goldPurchase.count)} icon={Gem} iconClass="bg-amber-100 text-amber-700" />
          <StatCard label="Net Weight Acquired" value={formatGrams(stats.goldPurchase.weight)} icon={Gem} iconClass="bg-amber-100 text-amber-700" />
          <StatCard label="Gross Metal Value" value={formatINR(stats.goldPurchase.value)} icon={IndianRupee} iconClass="bg-amber-100 text-amber-700" />
        </div>
      </div>

      {/* Silver Purchase */}
      <div>
        <SectionHeader title="Old Silver Purchase" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Transactions" value={String(stats.silverPurchase.count)} icon={Coins} iconClass="bg-slate-100 text-slate-600" />
          <StatCard label="Net Weight Acquired" value={formatGrams(stats.silverPurchase.weight)} icon={Coins} iconClass="bg-slate-100 text-slate-600" />
          <StatCard label="Gross Metal Value" value={formatINR(stats.silverPurchase.value)} icon={IndianRupee} iconClass="bg-slate-100 text-slate-600" />
        </div>
      </div>

      {/* Bank Pledged */}
      <div>
        <SectionHeader title="Bank Pledged — Gold" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Cases" value={String(stats.bankGold.count)} icon={Landmark} iconClass="bg-blue-100 text-blue-600" />
          <StatCard label="Bank Amount Released" value={formatINR(stats.bankGold.bankPaid)} icon={IndianRupee} iconClass="bg-blue-100 text-blue-600" />
          <StatCard label="Gross Metal Value" value={formatINR(stats.bankGold.value)} icon={IndianRupee} iconClass="bg-blue-100 text-blue-600" />
        </div>
      </div>

      <div>
        <SectionHeader title="Bank Pledged — Silver" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Cases" value={String(stats.bankSilver.count)} icon={Landmark} iconClass="bg-indigo-100 text-indigo-600" />
          <StatCard label="Bank Amount Released" value={formatINR(stats.bankSilver.bankPaid)} icon={IndianRupee} iconClass="bg-indigo-100 text-indigo-600" />
          <StatCard label="Gross Metal Value" value={formatINR(stats.bankSilver.value)} icon={IndianRupee} iconClass="bg-indigo-100 text-indigo-600" />
        </div>
      </div>

      {/* Customers */}
      <div>
        <SectionHeader title="Customer Summary" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total Customers" value={String(stats.totalCustomers)} icon={Users} iconClass="bg-teal-100 text-teal-600" />
          <StatCard label="KYC Verified" value={String(stats.kycVerified)} sub={`${Math.round((stats.kycVerified / Math.max(stats.totalCustomers, 1)) * 100)}% compliance`} icon={CheckCircle2} iconClass="bg-emerald-100 text-emerald-600" />
          <StatCard label="Branches Reporting" value={selectedBranch === "All Branches" ? "All" : "1"} icon={Building2} iconClass="bg-violet-100 text-violet-600" />
        </div>
      </div>

      {/* Metal Custody Summary */}
      <div className="bg-white border border-avp-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-avp-border">
          <h3 className="font-semibold text-avp-charcoal">Metal Custody Summary</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { metal: "Gold", weight: stats.goldWeight, icon: Gem, color: "text-amber-600 bg-amber-50 border-amber-100" },
            { metal: "Silver", weight: stats.silverWeight, icon: Coins, color: "text-slate-600 bg-slate-50 border-slate-100" },
          ].map(({ metal, weight, icon: Icon, color }) => (
            <div key={metal} className={`rounded-xl border p-6 flex items-center justify-between ${color}`}>
              <div>
                <p className="text-sm font-medium opacity-70">{metal} in Custody</p>
                <p className="text-3xl font-bold font-mono mt-1">{formatGrams(weight)}</p>
              </div>
              <Icon className="h-12 w-12 opacity-30" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
