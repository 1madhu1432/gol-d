import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  PackageCheck,
  Search,
  Filter,
  QrCode,
  ShieldCheck,
  Plus,
  Lock,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  Gem,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PageHeader, MetricCard } from "@/components/erp/ui";
import { formatINR, type Packet } from "@/lib/erp-data";
import { useERPStore } from "@/lib/erp-store";
import { toast } from "sonner";

export const Route = createFileRoute("/packets")({
  component: PacketsPage,
});

function PacketsPage() {
  const { filteredPackets, selectedBranch } = useERPStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [newPacketOpen, setNewPacketOpen] = useState(false);
  const [verifySealOpen, setVerifySealOpen] = useState(false);
  const [scanSealInput, setScanSealInput] = useState("");

  const packets = useMemo(() => {
    return filteredPackets.filter((p) => {
      const matchSearch =
        search === "" ||
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.sealNumber.toLowerCase().includes(search.toLowerCase()) ||
        p.customerName.toLowerCase().includes(search.toLowerCase()) ||
        p.transactionId.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "All" || p.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [filteredPackets, search, statusFilter]);

  const totalGoldGrams = filteredPackets
    .filter((p) => p.metal === "Gold")
    .reduce((sum, p) => sum + p.fineWeight, 0);

  const totalSilverGrams = filteredPackets
    .filter((p) => p.metal === "Silver")
    .reduce((sum, p) => sum + p.fineWeight, 0);

  const inVaultCount = filteredPackets.filter((p) => p.status === "In Vault").length;
  const inTransitCount = filteredPackets.filter((p) => p.status === "In Transit" || p.status === "Dispatched").length;

  const handleVerifySeal = () => {
    if (!scanSealInput.trim()) return;
    const found = filteredPackets.find(
      (p) => p.sealNumber.toLowerCase() === scanSealInput.trim().toLowerCase() || p.id.toLowerCase() === scanSealInput.trim().toLowerCase()
    );

    if (found) {
      toast.success(`Seal Verified: ${found.sealNumber} matches Packet ${found.id} (${found.status})`);
      setSelectedPacket(found);
      setVerifySealOpen(false);
      setScanSealInput("");
    } else {
      toast.error(`Invalid or Unrecognized Seal Number: ${scanSealInput}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Custody & Sealing"
        title="Tamper-Evident Packets"
        description={`Secure physical packet custody with tamper-evident serial seals, QR/barcode labeling, and dual-custody verification for ${
          selectedBranch === "All Branches" ? "all branches" : selectedBranch
        }.`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setVerifySealOpen(true)}
              className="gap-1.5"
            >
              <QrCode className="size-4" />
              Scan / Verify Seal
            </Button>
            <Button onClick={() => setNewPacketOpen(true)} className="gap-1.5">
              <Plus className="size-4" />
              Create & Seal Packet
            </Button>
          </div>
        }
      />

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Tracked Packets"
          value={String(filteredPackets.length)}
          icon={<PackageCheck className="size-5" />}
          accent
        />
        <MetricCard
          label="Gold in Sealed Packets"
          value={`${totalGoldGrams.toFixed(1)}g`}
          delta="Assayed Fine Purity"
          icon={<Gem className="size-5" />}
        />
        <MetricCard
          label="Packets in Strong Vault"
          value={String(inVaultCount)}
          icon={<Lock className="size-5" />}
        />
        <MetricCard
          label="Packets in Transit"
          value={String(inTransitCount)}
          delta={inTransitCount > 0 ? "Under Armored Escort" : "All Secured"}
          icon={<ShieldCheck className="size-5" />}
        />
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search packet ID, seal number, customer..."
            className="pl-8 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-40 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="In Vault">In Vault</SelectItem>
              <SelectItem value="Sealed">Sealed</SelectItem>
              <SelectItem value="In Transit">In Transit</SelectItem>
              <SelectItem value="Verified">Verified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Packets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packets.map((packet) => (
          <div
            key={packet.id}
            className="rounded-lg border border-border bg-card p-4 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground font-mono">{packet.id}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        packet.status === "In Vault"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : packet.status === "In Transit"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {packet.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Customer: <span className="font-medium text-foreground">{packet.customerName}</span>
                  </div>
                </div>

                <div className="grid size-8 place-items-center rounded bg-primary/10 text-primary">
                  <QrCode className="size-4" />
                </div>
              </div>

              {/* Seal details badge */}
              <div className="mt-3 rounded border border-amber-200 bg-amber-50/60 p-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="size-3 text-amber-700" />
                    Security Seal #
                  </span>
                  <span className="font-mono font-bold text-amber-950">{packet.sealNumber}</span>
                </div>
                <div className="text-[10px] text-amber-800 mt-0.5">
                  Sealed by: {packet.sealedBy} on {packet.createdDate}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded bg-muted/40 p-2">
                  <span className="text-[10px] text-muted-foreground">Contents</span>
                  <p className="font-bold text-foreground">
                    {packet.itemCount} items ({packet.metal})
                  </p>
                  <p className="text-[10px] text-muted-foreground">{packet.purity}</p>
                </div>
                <div className="rounded bg-muted/40 p-2">
                  <span className="text-[10px] text-muted-foreground">Fine Weight</span>
                  <p className="font-bold text-primary">{packet.fineWeight}g</p>
                  <p className="text-[10px] text-muted-foreground">Gross: {packet.totalGrossWeight}g</p>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-muted-foreground flex items-center justify-between">
                <span>Vault Location:</span>
                <span className="font-medium text-foreground">
                  {packet.vaultName} (Slot {packet.slotNumber})
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.success(`Packet seal sticker generated for ${packet.id} (Seal ${packet.sealNumber})`);
                }}
                className="h-7 text-[11px] gap-1"
              >
                <Printer className="size-3" />
                Label
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedPacket(packet)}
                className="h-7 text-[11px] gap-1"
              >
                <Eye className="size-3" />
                Inspect
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Packet Inspection Modal */}
      {selectedPacket && (
        <Dialog open={!!selectedPacket} onOpenChange={(open) => !open && setSelectedPacket(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Packet Custody Record</span>
                <span className="font-mono text-xs text-primary">{selectedPacket.id}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="rounded border border-border p-3 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-semibold text-foreground">{selectedPacket.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Linked Transaction:</span>
                  <span className="font-mono font-medium text-foreground">{selectedPacket.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Branch Custody:</span>
                  <span className="font-medium text-foreground">{selectedPacket.branch}</span>
                </div>
              </div>

              <div className="rounded border border-primary/20 bg-primary/5 p-3 space-y-1 text-foreground">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tamper-Evident Seal:</span>
                  <span className="font-mono font-bold text-primary">{selectedPacket.sealNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vault Location:</span>
                  <span className="font-medium">{selectedPacket.vaultName} (Slot #{selectedPacket.slotNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assayed Fine Weight:</span>
                  <span className="font-bold">{selectedPacket.fineWeight}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Valuation:</span>
                  <span className="font-bold">{formatINR(selectedPacket.estimatedValue)}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.success(`Packet seal sticker sent to thermal printer`);
                  setSelectedPacket(null);
                }}
              >
                Print Barcode Sticker
              </Button>
              <Button size="sm" onClick={() => setSelectedPacket(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Verify Seal Modal */}
      <Dialog open={verifySealOpen} onOpenChange={setVerifySealOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Dual-Custody Seal Verification</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">
              Scan barcode or enter physical tamper-evident seal serial number to verify packet integrity.
            </p>
            <div>
              <label className="font-medium">Seal Number or Packet ID</label>
              <Input
                placeholder="e.g. SEAL-AVP-78129 or PKT-HYD-901"
                value={scanSealInput}
                onChange={(e) => setScanSealInput(e.target.value)}
                className="mt-1 h-9 text-xs"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifySealOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleVerifySeal}>Verify Integrity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Packet Modal */}
      <Dialog open={newPacketOpen} onOpenChange={setNewPacketOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assemble & Seal Physical Packet</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium">Precious Metal</label>
                <Select defaultValue="Gold">
                  <SelectTrigger className="mt-1 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-medium">Item Count</label>
                <Input type="number" defaultValue="3" className="mt-1 h-9 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium">Gross Weight (g)</label>
                <Input type="number" defaultValue="42.5" className="mt-1 h-9 text-xs" />
              </div>
              <div>
                <label className="font-medium">Fine Weight (g)</label>
                <Input type="number" defaultValue="38.9" className="mt-1 h-9 text-xs" />
              </div>
            </div>

            <div>
              <label className="font-medium">Tamper-Evident Seal Serial Number</label>
              <Input placeholder="e.g. SEAL-AVP-89201" className="mt-1 h-9 text-xs font-mono" />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Read directly from the physical tamper-evident seal strip.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium">Assigned Vault</label>
                <Input defaultValue="Hyderabad Central Strongroom" readOnly className="mt-1 h-9 text-xs bg-muted" />
              </div>
              <div>
                <label className="font-medium">Shelf Slot</label>
                <Input defaultValue="A-14" className="mt-1 h-9 text-xs" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewPacketOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setNewPacketOpen(false);
                toast.success("Packet assembled, sealed, and entered into vault custody log");
              }}
            >
              Seal & Inward to Vault
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
