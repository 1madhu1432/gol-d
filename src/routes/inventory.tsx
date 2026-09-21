import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Boxes,
  Search,
  Filter,
  Download,
  Gem,
  Coins,
  ShieldCheck,
  MapPin,
  Lock,
  ArrowLeftRight,
  Eye,
  CheckCircle2,
  TrendingUp,
  Tag,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PageHeader, MetricCard } from "@/components/erp/ui";
import { formatINR, type InventoryItem } from "@/lib/erp-data";
import { useERPStore } from "@/lib/erp-store";
import { toast } from "sonner";

export const Route = createFileRoute("/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  const { filteredInventory, selectedBranch } = useERPStore();
  const [search, setSearch] = useState("");
  const [metalFilter, setMetalFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Filtered rows
  const items = useMemo(() => {
    return filteredInventory.filter((item) => {
      const matchSearch =
        search === "" ||
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.packetId.toLowerCase().includes(search.toLowerCase()) ||
        item.sourceTransactionId.toLowerCase().includes(search.toLowerCase());

      const matchMetal = metalFilter === "All" || item.metal === metalFilter;
      const matchStatus = statusFilter === "All" || item.status === statusFilter;

      return matchSearch && matchMetal && matchStatus;
    });
  }, [filteredInventory, search, metalFilter, statusFilter]);

  // Aggregate Metrics
  const goldItems = filteredInventory.filter((i) => i.metal === "Gold");
  const silverItems = filteredInventory.filter((i) => i.metal === "Silver");

  const totalGoldGross = goldItems.reduce((sum, i) => sum + i.grossWeight, 0);
  const totalGoldFine = goldItems.reduce((sum, i) => sum + i.fineWeight, 0);

  const totalSilverGross = silverItems.reduce((sum, i) => sum + i.grossWeight, 0);
  const totalSilverFine = silverItems.reduce((sum, i) => sum + i.fineWeight, 0);

  const totalCost = filteredInventory.reduce((sum, i) => sum + i.costValue, 0);
  const totalMarket = filteredInventory.reduce((sum, i) => sum + i.marketValue, 0);
  const unrealizedGain = totalMarket - totalCost;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Custody & Bullion"
        title="Physical Metal Inventory"
        description={`Real-time custody tracking for assayed gold & silver bars, ornaments, and sealed packets across ${
          selectedBranch === "All Branches" ? "all 5 branch vaults" : selectedBranch + " Vault"
        }.`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => toast.success("Inventory stock manifest downloaded (PDF & CSV)")}
              className="gap-1.5"
            >
              <Download className="size-4" />
              Export Manifest
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Gold in Custody"
          value={`${totalGoldGross.toFixed(1)}g`}
          delta={`${totalGoldFine.toFixed(1)}g fine net`}
          icon={<Gem className="size-5" />}
          accent
        />
        <MetricCard
          label="Silver in Custody"
          value={`${(totalSilverGross / 1000).toFixed(2)} kg`}
          delta={`${(totalSilverFine / 1000).toFixed(2)} kg fine net`}
          icon={<Coins className="size-5" />}
        />
        <MetricCard
          label="Book Value (Acquisition Cost)"
          value={formatINR(totalCost)}
          icon={<Boxes className="size-5" />}
        />
        <MetricCard
          label="Current Market Valuation"
          value={formatINR(totalMarket)}
          delta={`+${formatINR(unrealizedGain)} margin gain`}
          icon={<TrendingUp className="size-5" />}
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by item ID, description, packet or txn..."
            className="pl-8 text-xs h-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={metalFilter} onValueChange={setMetalFilter}>
            <SelectTrigger className="h-9 w-32 text-xs">
              <SelectValue placeholder="Metal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Metals</SelectItem>
              <SelectItem value="Gold">Gold</SelectItem>
              <SelectItem value="Silver">Silver</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-36 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="In Vault">In Vault</SelectItem>
              <SelectItem value="Packeted">Packeted</SelectItem>
              <SelectItem value="Testing">Testing</SelectItem>
              <SelectItem value="In Transfer">In Transfer</SelectItem>
              <SelectItem value="Verified">Verified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inventory Items Table */}
      <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3 font-semibold">Item & Description</th>
                <th className="p-3 font-semibold">Metal / Karat</th>
                <th className="p-3 font-semibold text-right">Gross Wt (g)</th>
                <th className="p-3 font-semibold text-right">Fine Wt (g)</th>
                <th className="p-3 font-semibold text-right">Cost Value</th>
                <th className="p-3 font-semibold text-right">Market Value</th>
                <th className="p-3 font-semibold">Location / Vault</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    No physical metal items match the selected filter.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-foreground">{item.description}</div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground font-mono">
                        <span>{item.id}</span>
                        <span>•</span>
                        <span className="text-primary">{item.packetId}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 font-medium">
                        {item.metal === "Gold" ? (
                          <span className="inline-block size-2 rounded-full bg-amber-500" />
                        ) : (
                          <span className="inline-block size-2 rounded-full bg-slate-400" />
                        )}
                        <span className="text-foreground">{item.metal}</span>
                        <span className="rounded bg-muted px-1 py-0.2 text-[10px] font-bold text-muted-foreground">
                          {item.purity}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{item.purityPercent}% pure</div>
                    </td>
                    <td className="p-3 text-right font-semibold text-foreground">
                      {item.grossWeight.toFixed(2)}g
                    </td>
                    <td className="p-3 text-right font-bold text-primary">
                      {item.fineWeight.toFixed(3)}g
                    </td>
                    <td className="p-3 text-right text-muted-foreground font-mono">
                      {formatINR(item.costValue)}
                    </td>
                    <td className="p-3 text-right font-semibold text-foreground font-mono">
                      {formatINR(item.marketValue)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-foreground font-medium">
                        <Lock className="size-3 text-muted-foreground" />
                        {item.vaultName}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {item.branch} · Slot {item.shelfSlot}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          item.status === "In Vault"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status === "Packeted"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : item.status === "In Transfer"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            item.status === "In Vault"
                              ? "bg-emerald-600"
                              : item.status === "Packeted"
                              ? "bg-blue-600"
                              : item.status === "In Transfer"
                              ? "bg-amber-600"
                              : "bg-muted-foreground"
                          }`}
                        />
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedItem(item)}
                        className="h-7 gap-1 text-[11px]"
                      >
                        <Eye className="size-3.5" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Inventory Item Inspection</span>
                <span className="font-mono text-xs font-normal text-muted-foreground">
                  {selectedItem.id}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-xs py-2">
              <div className="rounded-md border border-border bg-muted/40 p-3">
                <div className="font-semibold text-sm text-foreground">{selectedItem.description}</div>
                <div className="mt-1 flex items-center gap-4 text-muted-foreground">
                  <span>Metal: <strong className="text-foreground">{selectedItem.metal}</strong></span>
                  <span>Purity: <strong className="text-foreground">{selectedItem.purity} ({selectedItem.purityPercent}%)</strong></span>
                  <span>Intake: <strong className="text-foreground">{selectedItem.intakeDate}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded border border-border p-2.5">
                  <div className="text-muted-foreground text-[11px]">Weight Analysis</div>
                  <div className="mt-1 flex justify-between">
                    <span>Gross Weight:</span>
                    <span className="font-bold">{selectedItem.grossWeight}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Weight:</span>
                    <span className="font-bold">{selectedItem.netWeight}g</span>
                  </div>
                  <div className="flex justify-between text-primary font-bold">
                    <span>Assayed Fine Wt:</span>
                    <span>{selectedItem.fineWeight}g</span>
                  </div>
                </div>

                <div className="rounded border border-border p-2.5">
                  <div className="text-muted-foreground text-[11px]">Financial Valuation</div>
                  <div className="mt-1 flex justify-between">
                    <span>Acquisition Cost:</span>
                    <span className="font-mono font-medium">{formatINR(selectedItem.costValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Market Value:</span>
                    <span className="font-mono font-bold text-foreground">{formatINR(selectedItem.marketValue)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Unrealized Spread:</span>
                    <span>+{formatINR(selectedItem.marketValue - selectedItem.costValue)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded border border-border p-2.5 space-y-1.5">
                <div className="text-muted-foreground text-[11px] font-semibold">Custody & Traceability</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Vault / Custodian:</span>
                    <p className="font-medium text-foreground">{selectedItem.vaultName} ({selectedItem.branch})</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Assigned Slot:</span>
                    <p className="font-medium text-foreground">Shelf Slot #{selectedItem.shelfSlot}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Packet Reference:</span>
                    <p className="font-mono font-medium text-primary">{selectedItem.packetId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Source Transaction:</span>
                    <p className="font-mono font-medium text-foreground">{selectedItem.sourceTransactionId}</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.success(`Bar code label printed for ${selectedItem.id}`);
                }}
              >
                Print Barcode Tag
              </Button>
              <Button size="sm" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
