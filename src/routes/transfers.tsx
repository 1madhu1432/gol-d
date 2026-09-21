import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ArrowLeftRight,
  Search,
  Filter,
  Plus,
  Package,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader, StatusBadge } from "@/components/erp/ui";
import { useERPStore } from "@/lib/erp-store";
import { formatINR, formatGrams, branches, type BranchTransfer } from "@/lib/erp-data";
import { toast } from "sonner";

export const Route = createFileRoute("/transfers")({
  component: TransfersPage,
});

function TransfersPage() {
  const { transfers, updateTransferStatus } = useERPStore();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [metalFilter, setMetalFilter] = useState("All");
  const [newOpen, setNewOpen] = useState(false);

  // New transfer form
  const [fromBranch, setFromBranch] = useState(branches[0]);
  const [toBranch, setToBranch] = useState(branches[1]);
  const [metalType, setMetalType] = useState<"Gold" | "Silver">("Gold");
  const [weight, setWeight] = useState("100");
  const [courier, setCourier] = useState("AVP Internal Logistics");
  const [localTransfers, setLocalTransfers] = useState<BranchTransfer[]>(transfers);

  const filtered = useMemo(() => {
    return [...localTransfers].reverse().filter((t) => {
      const matchQ =
        t.id.toLowerCase().includes(query.toLowerCase()) ||
        t.fromBranch.toLowerCase().includes(query.toLowerCase()) ||
        t.toBranch.toLowerCase().includes(query.toLowerCase());
      const matchS = statusFilter === "All" || t.status === statusFilter;
      const matchM = metalFilter === "All" || t.metal === metalFilter;
      return matchQ && matchS && matchM;
    });
  }, [localTransfers, query, statusFilter, metalFilter]);

  const inTransitCount = localTransfers.filter((t) => t.status === "In Transit").length;
  const totalWeight = localTransfers.reduce((a, t) => a + t.netWeight, 0);

  const handleStatusAdvance = (id: string, current: BranchTransfer["status"]) => {
    const next: Record<string, BranchTransfer["status"]> = {
      "Pending": "In Transit",
      "In Transit": "Delivered",
      "Delivered": "Verified",
    };
    if (!next[current]) return;
    updateTransferStatus(id, next[current]);
    setLocalTransfers((prev) => prev.map((t) => t.id === id ? { ...t, status: next[current] } : t));
    toast.success(`Transfer ${id} → ${next[current]}`);
  };

  const handleCreateTransfer = () => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) { toast.error("Invalid weight"); return; }
    if (fromBranch === toBranch) { toast.error("Source and destination must differ"); return; }
    const newTrf: BranchTransfer = {
      id: `TRF-2026-${Date.now().toString().slice(-5)}`,
      fromBranch,
      toBranch,
      metal: metalType,
      grossWeight: w * 1.02,
      netWeight: w,
      fineWeight: w * 0.916,
      estimatedValue: w * (metalType === "Gold" ? 6800 : 95),
      packetIds: [],
      initiatedBy: "Current User",
      initiatedDate: new Date().toISOString().split("T")[0],
      approvedBy: "Ops Manager",
      courierName: courier,
      trackingNumber: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      status: "Pending",
    };
    setLocalTransfers((prev) => [...prev, newTrf]);
    toast.success(`Transfer ${newTrf.id} created`);
    setNewOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branch Transfers"
        subtitle="Initiate, track and verify inter-branch metal movements"
        action={
          <Button className="bg-avp-gold hover:bg-avp-gold/90 text-avp-charcoal" onClick={() => setNewOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Transfer
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "In Transit", value: inTransitCount, icon: Truck, color: "bg-blue-100 text-blue-600" },
          { label: "Total Transfers", value: localTransfers.length, icon: ArrowLeftRight, color: "bg-violet-100 text-violet-600" },
          { label: "Total Weight Moved", value: formatGrams(totalWeight), icon: Package, color: "bg-amber-100 text-amber-700" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white p-5 rounded-xl border border-avp-border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-avp-charcoal/70">{kpi.label}</p>
              <p className="text-2xl font-bold text-avp-charcoal mt-0.5">{kpi.value}</p>
            </div>
            <div className={`h-11 w-11 rounded-full flex items-center justify-center ${kpi.color}`}>
              <kpi.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-avp-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-avp-charcoal/40" />
          <Input placeholder="Search by ID or branch..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2 text-avp-charcoal/50" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Transit">In Transit</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Verified">Verified</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={metalFilter} onValueChange={setMetalFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <Filter className="h-4 w-4 mr-2 text-avp-charcoal/50" />
            <SelectValue placeholder="Metal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Metals</SelectItem>
            <SelectItem value="Gold">Gold</SelectItem>
            <SelectItem value="Silver">Silver</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white border border-avp-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-avp-warm text-avp-charcoal/70 uppercase font-semibold text-xs">
              <tr>
                <th className="px-6 py-4">Transfer ID</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Metal</th>
                <th className="px-6 py-4">Net Weight</th>
                <th className="px-6 py-4">Est. Value</th>
                <th className="px-6 py-4">Courier / Tracking</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-avp-border/50">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-8 text-center text-avp-charcoal/50">No transfers found.</td></tr>
              ) : filtered.map((trf) => (
                <tr key={trf.id} className="hover:bg-avp-warm/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-avp-charcoal">{trf.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-avp-gold flex-shrink-0" />
                      <span className="truncate max-w-[100px]" title={trf.fromBranch}>{trf.fromBranch}</span>
                      <ArrowLeftRight className="h-3.5 w-3.5 text-avp-charcoal/40 flex-shrink-0" />
                      <span className="truncate max-w-[100px]" title={trf.toBranch}>{trf.toBranch}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${trf.metal === "Gold" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                      {trf.metal}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono">{formatGrams(trf.netWeight)}</td>
                  <td className="px-6 py-4 font-mono">{formatINR(trf.estimatedValue)}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{trf.courierName}</div>
                    <div className="text-xs font-mono text-avp-charcoal/60">{trf.trackingNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-avp-charcoal/70">{trf.initiatedDate}</td>
                  <td className="px-6 py-4"><StatusBadge status={trf.status} /></td>
                  <td className="px-6 py-4 text-right">
                    {["Pending", "In Transit", "Delivered"].includes(trf.status) ? (
                      <Button size="sm" variant="outline" onClick={() => handleStatusAdvance(trf.id, trf.status)}>
                        {trf.status === "Pending" ? <><Truck className="h-3.5 w-3.5 mr-1.5" />Dispatch</> :
                         trf.status === "In Transit" ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Mark Delivered</> :
                         <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Verify</>}
                      </Button>
                    ) : (
                      <span className="text-xs text-emerald-600 font-medium flex items-center justify-end gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {trf.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Transfer Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-avp-gold" /> New Branch Transfer
            </DialogTitle>
            <DialogDescription>Initiate an inter-branch metal movement</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-avp-charcoal/70 mb-1 block">From Branch</label>
                <Select value={fromBranch} onValueChange={setFromBranch}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{branches.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-avp-charcoal/70 mb-1 block">To Branch</label>
                <Select value={toBranch} onValueChange={setToBranch}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{branches.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-avp-charcoal/70 mb-1 block">Metal</label>
                <Select value={metalType} onValueChange={(v) => setMetalType(v as "Gold" | "Silver")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-avp-charcoal/70 mb-1 block">Net Weight (g)</label>
                <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="font-mono" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-avp-charcoal/70 mb-1 block">Courier / Logistics</label>
              <Input value={courier} onChange={(e) => setCourier(e.target.value)} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setNewOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-avp-charcoal hover:bg-avp-charcoal/90 text-white" onClick={handleCreateTransfer}>
                <Plus className="h-4 w-4 mr-2" /> Create Transfer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
