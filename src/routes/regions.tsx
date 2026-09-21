import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  MapPin,
  Building2,
  Users,
  Target,
  TrendingUp,
  Plus,
  Gem,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Phone,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PageHeader, MetricCard } from "@/components/erp/ui";
import { regions as initialRegions, branches, formatINR } from "@/lib/erp-data";
import { toast } from "sonner";

export const Route = createFileRoute("/regions")({
  component: RegionsPage,
});

function RegionsPage() {
  const [regionsList, setRegionsList] = useState(initialRegions);
  const [newRegionOpen, setNewRegionOpen] = useState(false);

  // Aggregate stats
  const totalTarget = regionsList.reduce((sum, r) => sum + r.targetRupees, 0);
  const totalAchieved = regionsList.reduce((sum, r) => sum + r.achievedRupees, 0);
  const overallAchievementPercent = ((totalAchieved / totalTarget) * 100).toFixed(1);

  const totalGoldGrams = regionsList.reduce((sum, r) => sum + r.goldVolumeGrams, 0);
  const totalSilverKg = regionsList.reduce((sum, r) => sum + r.silverVolumeKg, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organisation"
        title="Regional Zones & Network"
        description="Zonal hierarchy governing multi-branch operations across Telangana and Andhra Pradesh, with procurement targets and regional bullion custody."
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={() => setNewRegionOpen(true)} className="gap-1.5">
              <Plus className="size-4" />
              Add Regional Zone
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Regional Operating Zones"
          value={String(regionsList.length)}
          icon={<MapPin className="size-5" />}
          accent
        />
        <MetricCard
          label="Consolidated Achievement"
          value={`${overallAchievementPercent}%`}
          delta={`${formatINR(totalAchieved)} / ${formatINR(totalTarget)}`}
          icon={<Target className="size-5" />}
        />
        <MetricCard
          label="Total Gold Intake"
          value={`${(totalGoldGrams / 1000).toFixed(2)} kg`}
          delta="Assayed across zones"
          icon={<Gem className="size-5" />}
        />
        <MetricCard
          label="Total Silver Intake"
          value={`${totalSilverKg.toFixed(1)} kg`}
          delta="Assayed across zones"
          icon={<Coins className="size-5" />}
        />
      </div>

      {/* Regions Grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {regionsList.map((region) => {
          const regionBranches = branches.filter((b) => b.region === region.name || (region.id === "REG-TS" && b.region === "Telangana"));
          const pct = Math.min(100, Math.round((region.achievedRupees / region.targetRupees) * 100));

          return (
            <div
              key={region.id}
              className="rounded-lg border border-border bg-card p-5 shadow-xs hover:border-primary/40 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-foreground">{region.name}</h3>
                    <span className="font-mono text-[10px] rounded bg-muted px-1.5 py-0.5 text-muted-foreground font-semibold">
                      {region.id}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="size-3.5" />
                    <span>Regional Head: <strong className="text-foreground">{region.head}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-primary">{pct}% Target</span>
                  <div className="text-[10px] text-muted-foreground">{regionBranches.length} Branch{regionBranches.length > 1 ? "es" : ""}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Procurement Achievement</span>
                  <span className="font-semibold text-foreground">
                    {formatINR(region.achievedRupees)} / {formatINR(region.targetRupees)}
                  </span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>

              {/* Metals Breakdown */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded border border-amber-200/60 bg-amber-50/40 p-2.5">
                  <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-[11px]">
                    <Gem className="size-3.5 text-amber-700" />
                    Gold Procurement
                  </div>
                  <div className="mt-1 text-base font-bold text-amber-950 font-display">
                    {(region.goldVolumeGrams / 1000).toFixed(2)} kg
                  </div>
                  <div className="text-[10px] text-amber-800 font-mono">
                    {region.goldVolumeGrams.toLocaleString()} grams
                  </div>
                </div>

                <div className="rounded border border-slate-200 bg-slate-50/60 p-2.5">
                  <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-[11px]">
                    <Coins className="size-3.5 text-slate-600" />
                    Silver Procurement
                  </div>
                  <div className="mt-1 text-base font-bold text-slate-900 font-display">
                    {region.silverVolumeKg} kg
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">
                    {(region.silverVolumeKg * 1000).toLocaleString()} grams
                  </div>
                </div>
              </div>

              {/* Connected Branches */}
              <div className="border-t border-border pt-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Operating Branches in Zone
                </p>
                <div className="space-y-1.5">
                  {regionBranches.map((b) => (
                    <div
                      key={b.code}
                      className="flex items-center justify-between rounded bg-muted/40 px-2.5 py-1.5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="size-3.5 text-primary" />
                        <span className="font-semibold text-foreground">{b.name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">({b.code})</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                        <span>Manager: {b.manager}</span>
                        <span className="font-medium text-foreground">{formatINR(b.achieved)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Region Dialog */}
      <Dialog open={newRegionOpen} onOpenChange={setNewRegionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configure New Regional Zone</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-medium">Zone Name</label>
              <Input placeholder="e.g. Karnataka Border & Rayalaseema West" className="mt-1 h-9 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium">Zone ID Code</label>
                <Input placeholder="e.g. REG-KA-W" className="mt-1 h-9 text-xs font-mono" />
              </div>
              <div>
                <label className="font-medium">Regional Head</label>
                <Input placeholder="e.g. V. Ramesh" className="mt-1 h-9 text-xs" />
              </div>
            </div>
            <div>
              <label className="font-medium">Monthly Procurement Target (₹)</label>
              <Input type="number" placeholder="e.g. 30000000" className="mt-1 h-9 text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewRegionOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setNewRegionOpen(false);
                toast.success("Regional zone created successfully");
              }}
            >
              Create Zone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
