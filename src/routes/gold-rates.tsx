import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  Edit3,
  Check,
  X,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/erp/ui";
import { useERPStore } from "@/lib/erp-store";
import { formatINR, branches } from "@/lib/erp-data";
import { toast } from "sonner";

export const Route = createFileRoute("/gold-rates")({
  component: GoldRatesPage,
});

function GoldRatesPage() {
  return <MetalRatesPage metal="Gold" />;
}

// Shared component used by both /gold-rates and /silver-rates
export function MetalRatesPage({ metal }: { metal: "Gold" | "Silver" }) {
  const { rates, updateRate } = useERPStore();
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const metalRates = useMemo(() =>
    rates.filter((r) => r.metal === metal),
    [rates, metal]
  );

  const handleEdit = (rateId: string, currentRate: number) => {
    setEditingRate(rateId);
    setEditValue(String(currentRate));
  };

  const handleSave = (purityKarat: string) => {
    const newRate = parseFloat(editValue);
    if (isNaN(newRate) || newRate <= 0) {
      toast.error("Invalid rate value");
      return;
    }
    updateRate(metal, purityKarat, newRate);
    toast.success(`${metal} ${purityKarat} rate updated to ${formatINR(newRate)}/g`);
    setEditingRate(null);
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${metal} Rates`}
        subtitle={`Live and branch-adjusted ${metal.toLowerCase()} rates by purity`}
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-avp-charcoal/60 bg-white border border-avp-border rounded-lg px-3 py-2 shadow-sm">
              <Clock className="h-4 w-4 text-avp-gold" />
              Last sync: {timeStr} · {dateStr}
            </div>
            <Button className="bg-avp-gold hover:bg-avp-gold/90 text-avp-charcoal">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Live Rates
            </Button>
          </div>
        }
      />

      {/* Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metalRates.map((rate) => {
          const isEditing = editingRate === `${rate.metal}-${rate.purityKarat}`;
          const isUp = rate.change24h >= 0;

          return (
            <div
              key={`${rate.metal}-${rate.purityKarat}`}
              className="bg-white border border-avp-border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className={`px-5 py-3 flex items-center justify-between ${metal === "Gold" ? "bg-amber-50 border-b border-amber-100" : "bg-slate-50 border-b border-slate-100"}`}>
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${metal === "Gold" ? "bg-avp-gold/20 text-avp-gold" : "bg-slate-200 text-slate-600"}`}>
                    {rate.purityKarat}
                  </div>
                  <div>
                    <p className="font-semibold text-avp-charcoal">{rate.purityKarat}</p>
                    <p className="text-xs text-avp-charcoal/60">{rate.purityPercent}% pure</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isUp ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                  {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {isUp ? "+" : ""}{rate.change24h.toFixed(1)}%
                </div>
              </div>

              {/* Rate Display */}
              <div className="px-5 py-4 space-y-3">
                <div>
                  <p className="text-xs text-avp-charcoal/60 mb-1">Rate per gram</p>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-avp-charcoal/40" />
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="pl-8 font-mono text-lg font-bold"
                          autoFocus
                        />
                      </div>
                      <Button size="icon" variant="outline" className="border-emerald-300 text-emerald-600 hover:bg-emerald-50" onClick={() => handleSave(rate.purityKarat)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="border-red-200 text-red-500 hover:bg-red-50" onClick={() => setEditingRate(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold font-mono text-avp-charcoal">{formatINR(rate.ratePerGram)}</p>
                      <Button size="sm" variant="ghost" className="text-avp-charcoal/50 hover:text-avp-charcoal" onClick={() => handleEdit(`${rate.metal}-${rate.purityKarat}`, rate.ratePerGram)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Source */}
                <div className="text-xs text-avp-charcoal/50 border-t border-avp-border pt-2">
                  Source: {rate.source} · {rate.effectiveTime}
                </div>

                {/* Branch Adjustments */}
                {Object.keys(rate.branchAdjustments).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-avp-charcoal/60 mb-1.5">Branch Adjustments</p>
                    <div className="space-y-1">
                      {Object.entries(rate.branchAdjustments).slice(0, 3).map(([branch, adj]) => (
                        <div key={branch} className="flex justify-between text-xs">
                          <span className="text-avp-charcoal/70 truncate max-w-[60%]">{branch}</span>
                          <span className={`font-mono font-medium ${adj >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {adj >= 0 ? "+" : ""}{adj}/g
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rate History Table */}
      <div className="bg-white border border-avp-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-avp-border">
          <h3 className="font-semibold text-avp-charcoal">All {metal} Rates — Current Session</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-avp-warm text-avp-charcoal/70 uppercase font-semibold text-xs">
              <tr>
                <th className="px-6 py-4">Purity</th>
                <th className="px-6 py-4">% Pure</th>
                <th className="px-6 py-4">Rate/g</th>
                <th className="px-6 py-4">24h Change</th>
                <th className="px-6 py-4">Effective From</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-avp-border/50">
              {metalRates.map((rate) => (
                <tr key={`${rate.metal}-${rate.purityKarat}-tbl`} className="hover:bg-avp-warm/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-avp-charcoal">{rate.purityKarat}</td>
                  <td className="px-6 py-4">{rate.purityPercent}%</td>
                  <td className="px-6 py-4 font-mono font-medium">{formatINR(rate.ratePerGram)}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 text-sm font-medium w-fit ${rate.change24h >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {rate.change24h >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {rate.change24h >= 0 ? "+" : ""}{rate.change24h.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-avp-charcoal/70">{rate.effectiveDate} {rate.effectiveTime}</td>
                  <td className="px-6 py-4 text-avp-charcoal/70">{rate.source}</td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(`${rate.metal}-${rate.purityKarat}`, rate.ratePerGram)}>
                      <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Override
                    </Button>
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
