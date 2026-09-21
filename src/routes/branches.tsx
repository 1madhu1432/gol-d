import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/erp/ui";
import { useERPStore } from "@/lib/erp-store";
import { formatINR, branches } from "@/lib/erp-data";

export const Route = createFileRoute("/branches")({
  component: BranchesPage,
});

function BranchesPage() {
  const { transactions, customers, employees } = useERPStore();

  const branchStats = useMemo(() => {
    return branches.map((branch) => {
      const txns = transactions.filter((t) => t.branch === branch);
      const custs = customers.filter((c) => c.branch === branch);
      const emps = employees.filter((e) => e.branch === branch);
      const revenue = txns.reduce((a, t) => a + t.grossMetalValue, 0);
      const payout = txns.reduce((a, t) => a + t.customerPayable, 0);
      const completed = txns.filter((t) => ["Completed", "Customer Paid", "Inventory"].includes(t.status)).length;
      const pending = txns.filter((t) => ["Verification", "Approved", "Testing", "Valuation", "Settlement Pending"].includes(t.status)).length;

      return {
        name: branch,
        txnCount: txns.length,
        customerCount: custs.length,
        employeeCount: emps.length,
        revenue,
        payout,
        completed,
        pending,
      };
    });
  }, [transactions, customers, employees]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branch Network"
        subtitle="Performance summary across all AVP Gold branches"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {branchStats.map((b) => (
          <div key={b.name} className="bg-white border border-avp-border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-avp-warm to-white px-5 py-4 border-b border-avp-border flex items-center gap-3">
              <div className="h-10 w-10 bg-avp-gold/20 rounded-full flex items-center justify-center border border-avp-gold/30">
                <Building2 className="h-5 w-5 text-avp-gold" />
              </div>
              <div>
                <h3 className="font-semibold text-avp-charcoal">{b.name}</h3>
                <p className="text-xs text-avp-charcoal/60 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" /> Tamil Nadu · India
                </p>
              </div>
              <div className="ml-auto">
                <span className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  Active
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Transactions", value: b.txnCount, icon: TrendingUp, color: "text-violet-600" },
                  { label: "Customers", value: b.customerCount, icon: Users, color: "text-blue-600" },
                  { label: "Staff", value: b.employeeCount, icon: Users, color: "text-teal-600" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-avp-warm/60 rounded-lg p-3 border border-avp-border">
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-avp-charcoal/60 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-avp-charcoal/60">Gross Metal Value</span>
                  <span className="font-mono font-semibold text-avp-charcoal">{formatINR(b.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-avp-charcoal/60">Net Payout</span>
                  <span className="font-mono font-semibold text-emerald-700">{formatINR(b.payout)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-avp-charcoal/60 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Completed
                  </span>
                  <span className="font-medium text-emerald-700">{b.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-avp-charcoal/60 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-amber-500" /> In Progress
                  </span>
                  <span className="font-medium text-amber-700">{b.pending}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
