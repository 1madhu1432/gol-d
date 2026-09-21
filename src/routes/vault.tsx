import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  LockKeyhole,
  Search,
  Filter,
  Package,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Layers,
  Weight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, StatusBadge } from "@/components/erp/ui";
import { useERPStore } from "@/lib/erp-store";
import { formatINR, formatGrams } from "@/lib/erp-data";

export const Route = createFileRoute("/vault")({
  component: VaultPage,
});

function VaultPage() {
  const { vaults, filteredInventory, filteredPackets, selectedBranch } = useERPStore();
  const [query, setQuery] = useState("");
  const [metalFilter, setMetalFilter] = useState("All");
  const [tab, setTab] = useState<"inventory" | "packets" | "vaults">("inventory");

  const filteredInv = useMemo(() => {
    return filteredInventory.filter((item) => {
      const matchQ = item.id.toLowerCase().includes(query.toLowerCase()) || item.description.toLowerCase().includes(query.toLowerCase());
      const matchM = metalFilter === "All" || item.metal === metalFilter;
      return matchQ && matchM;
    });
  }, [filteredInventory, query, metalFilter]);

  const filteredPkt = useMemo(() => {
    return filteredPackets.filter((p) => {
      const matchQ = p.id.toLowerCase().includes(query.toLowerCase()) || p.customerName.toLowerCase().includes(query.toLowerCase());
      const matchM = metalFilter === "All" || p.metal === metalFilter;
      return matchQ && matchM;
    });
  }, [filteredPackets, query, metalFilter]);

  const branchVaults = useMemo(() => {
    if (selectedBranch === "All Branches") return vaults;
    return vaults.filter((v) => v.branch === selectedBranch);
  }, [vaults, selectedBranch]);

  const totalWeight = filteredInv.reduce((a, i) => a + i.netWeight, 0);
  const totalValue = filteredInv.reduce((a, i) => a + i.marketValue, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vault & Custody"
        subtitle="Physical metal inventory, packets, and secure vault management"
        action={
          <Button className="bg-avp-gold hover:bg-avp-gold/90 text-avp-charcoal">
            <Package className="h-4 w-4 mr-2" />
            Create Packet
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Inventory Items", value: filteredInv.length, icon: Layers, color: "bg-violet-100 text-violet-600" },
          { label: "Sealed Packets", value: filteredPkt.length, icon: Package, color: "bg-amber-100 text-amber-700" },
          { label: "Total Custody Weight", value: formatGrams(totalWeight), icon: Weight, color: "bg-blue-100 text-blue-600" },
          { label: "Custody Value", value: formatINR(totalValue), icon: ShieldCheck, color: "bg-emerald-100 text-emerald-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white p-5 rounded-xl border border-avp-border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-avp-charcoal/70">{kpi.label}</p>
              <p className="text-xl font-bold text-avp-charcoal mt-0.5">{kpi.value}</p>
            </div>
            <div className={`h-11 w-11 rounded-full flex items-center justify-center ${kpi.color}`}>
              <kpi.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-avp-border rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-avp-border">
          {(["inventory", "packets", "vaults"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "border-b-2 border-avp-gold text-avp-charcoal bg-avp-warm/40"
                  : "text-avp-charcoal/60 hover:text-avp-charcoal hover:bg-avp-warm/20"
              }`}
            >
              {t === "inventory" ? "Inventory Items" : t === "packets" ? "Sealed Packets" : "Vault Locations"}
            </button>
          ))}
        </div>

        {tab !== "vaults" && (
          <div className="flex flex-col sm:flex-row gap-4 p-4 border-b border-avp-border">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-avp-charcoal/40" />
              <Input placeholder="Search items..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Select value={metalFilter} onValueChange={setMetalFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <Filter className="h-4 w-4 mr-2 text-avp-charcoal/50" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Metals</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="overflow-x-auto">
          {tab === "inventory" && (
            <table className="w-full text-sm text-left">
              <thead className="bg-avp-warm text-avp-charcoal/70 uppercase font-semibold text-xs">
                <tr>
                  <th className="px-6 py-4">Item ID</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Metal</th>
                  <th className="px-6 py-4">Net Weight</th>
                  <th className="px-6 py-4">Purity</th>
                  <th className="px-6 py-4">Vault / Slot</th>
                  <th className="px-6 py-4">Market Value</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-avp-border/50">
                {filteredInv.slice(0, 50).map((item) => (
                  <tr key={item.id} className="hover:bg-avp-warm/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-avp-charcoal">{item.id}</td>
                    <td className="px-6 py-4">{item.description}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${item.metal === "Gold" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                        {item.metal}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">{formatGrams(item.netWeight)}</td>
                    <td className="px-6 py-4">{item.purity}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs text-avp-charcoal/70">
                        <MapPin className="h-3 w-3 mr-1 text-avp-gold" />
                        {item.vaultName} · {item.shelfSlot}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium">{formatINR(item.marketValue)}</td>
                    <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "packets" && (
            <table className="w-full text-sm text-left">
              <thead className="bg-avp-warm text-avp-charcoal/70 uppercase font-semibold text-xs">
                <tr>
                  <th className="px-6 py-4">Packet ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Metal</th>
                  <th className="px-6 py-4">Net Weight</th>
                  <th className="px-6 py-4">Purity</th>
                  <th className="px-6 py-4">Vault / Slot</th>
                  <th className="px-6 py-4">Seal No.</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-avp-border/50">
                {filteredPkt.slice(0, 50).map((pkt) => (
                  <tr key={pkt.id} className="hover:bg-avp-warm/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-avp-charcoal">{pkt.id}</div>
                      <div className="text-xs text-avp-charcoal/60 font-mono">{pkt.qrCode}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{pkt.customerName}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${pkt.metal === "Gold" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                        {pkt.metal}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">{formatGrams(pkt.totalNetWeight)}</td>
                    <td className="px-6 py-4">{pkt.purity}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs text-avp-charcoal/70">
                        <MapPin className="h-3 w-3 mr-1 text-avp-gold" />
                        {pkt.vaultName} · {pkt.slotNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{pkt.sealNumber}</td>
                    <td className="px-6 py-4"><StatusBadge status={pkt.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "vaults" && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {branchVaults.map((vault) => (
                <div key={vault.id} className="bg-avp-warm/40 border border-avp-border rounded-xl p-5 space-y-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 bg-avp-gold/20 rounded-full flex items-center justify-center">
                        <LockKeyhole className="h-4 w-4 text-avp-gold" />
                      </div>
                      <div>
                        <div className="font-semibold text-avp-charcoal text-sm">{vault.name}</div>
                        <div className="text-xs text-avp-charcoal/60">{vault.branch}</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${vault.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                      {vault.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white border border-avp-border rounded-lg p-2">
                      <div className="text-avp-charcoal/60">Gold Weight</div>
                      <div className="font-mono font-medium text-avp-charcoal">{formatGrams(vault.totalGoldWeight)}</div>
                    </div>
                    <div className="bg-white border border-avp-border rounded-lg p-2">
                      <div className="text-avp-charcoal/60">Silver Weight</div>
                      <div className="font-mono font-medium text-avp-charcoal">{formatGrams(vault.totalSilverWeight)}</div>
                    </div>
                    <div className="bg-white border border-avp-border rounded-lg p-2">
                      <div className="text-avp-charcoal/60">Packets</div>
                      <div className="font-medium text-avp-charcoal">{vault.packetCount}</div>
                    </div>
                    <div className="bg-white border border-avp-border rounded-lg p-2">
                      <div className="text-avp-charcoal/60">Capacity</div>
                      <div className="font-medium text-avp-charcoal">{vault.capacityKg} kg</div>
                    </div>
                  </div>
                  <div className="text-xs text-avp-charcoal/60 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" /> {vault.location}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
