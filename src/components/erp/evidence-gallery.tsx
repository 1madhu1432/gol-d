import React, { useState, useMemo } from "react";
import {
  Camera,
  Upload,
  ZoomIn,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Grid3X3,
  List,
  Eye,
  Download,
  Trash2,
  FileText,
  ShieldCheck,
  Building2,
  User,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useERPStore } from "@/lib/erp-store";
import { type EvidenceItem } from "@/lib/erp-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EvidenceGalleryProps {
  transactionId?: string;
  customerId?: string;
  title?: string;
  compact?: boolean;
}

const categories: (EvidenceItem["category"] | "All")[] = [
  "All",
  "Customer",
  "KYC",
  "Gold",
  "Silver",
  "Weight",
  "Testing",
  "Bank Pledge",
  "Receiving",
  "Packet",
  "Settlement",
];

export function EvidenceGallery({
  transactionId,
  customerId,
  title = "Evidence & Document Gallery",
  compact = false,
}: EvidenceGalleryProps) {
  const { evidence, addEvidence, verifyEvidence, selectedBranch } = useERPStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeItem, setActiveItem] = useState<EvidenceItem | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  // New evidence form state
  const [newCategory, setNewCategory] = useState<EvidenceItem["category"]>("Gold");
  const [newTitle, setNewTitle] = useState("");
  const [cameraSnapping, setCameraSnapping] = useState(false);

  const filteredEvidence = useMemo(() => {
    return evidence.filter((item) => {
      const matchTxn = transactionId ? item.transactionId === transactionId : true;
      const matchCust = customerId ? item.customerId === customerId : true;
      const matchCat = selectedCategory === "All" ? true : item.category === selectedCategory;
      return matchTxn && matchCust && matchCat;
    });
  }, [evidence, transactionId, customerId, selectedCategory]);

  const handleSimulateUpload = () => {
    if (!newTitle.trim()) {
      toast.error("Please enter a title for the evidence.");
      return;
    }

    const placeholderImages: Record<EvidenceItem["category"], string> = {
      Customer: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      KYC: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80",
      Gold: "https://images.unsplash.com/photo-1611591475102-44249a0d1f11?auto=format&fit=crop&w=400&q=80",
      Silver: "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=400&q=80",
      Weight: "https://images.unsplash.com/photo-1584267385494-9fdd9a71ad75?auto=format&fit=crop&w=400&q=80",
      Testing: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
      "Bank Pledge": "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80",
      Receiving: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80",
      Packet: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80",
      Settlement: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80",
    };

    const newItem: EvidenceItem = {
      id: `EVD-${Math.floor(200 + Math.random() * 800)}`,
      transactionId: transactionId || "AVP-BPG-001001",
      customerId: customerId || "AVP-C-01001",
      category: newCategory,
      title: newTitle,
      filename: `${newCategory.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.jpg`,
      url: placeholderImages[newCategory],
      uploadedBy: "R. Srinivas",
      branch: selectedBranch === "All Branches" ? "Hyderabad" : selectedBranch,
      timestamp: `${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST`,
      verificationStatus: "Verified",
    };

    addEvidence(newItem);
    setUploadOpen(false);
    setNewTitle("");
  };

  const handleSimulateCameraCapture = () => {
    setCameraSnapping(true);
    setTimeout(() => {
      setCameraSnapping(false);
      setCameraOpen(false);

      const newItem: EvidenceItem = {
        id: `EVD-${Math.floor(200 + Math.random() * 800)}`,
        transactionId: transactionId || "AVP-BPG-001001",
        customerId: customerId || "AVP-C-01001",
        category: newCategory,
        title: `${newCategory} Camera Capture (Live Desk)`,
        filename: `cam_snap_${Date.now()}.jpg`,
        url: "https://images.unsplash.com/photo-1584267385494-9fdd9a71ad75?auto=format&fit=crop&w=400&q=80",
        uploadedBy: "R. Srinivas",
        branch: selectedBranch === "All Branches" ? "Hyderabad" : selectedBranch,
        timestamp: `${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST`,
        verificationStatus: "Verified",
      };

      addEvidence(newItem);
    }, 1200);
  };

  return (
    <div className="border border-border bg-card shadow-xs rounded-md overflow-hidden">
      {/* Gallery Header */}
      <div className="flex flex-col gap-3 border-b border-border p-3.5 sm:flex-row sm:items-center sm:justify-between bg-muted/20">
        <div>
          <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            {title}
            <span className="rounded-full bg-primary/10 px-2 py-0.2 text-[10px] font-bold text-primary">
              {filteredEvidence.length} items
            </span>
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Tamper-evident photographic proof for appraisal, purity testing, bank release & settlement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="hidden sm:flex border border-border rounded-md p-0.5 bg-background">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("p-1 rounded text-xs", viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground")}
              title="Grid View"
            >
              <Grid3X3 className="size-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("p-1 rounded text-xs", viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground")}
              title="List View"
            >
              <List className="size-3.5" />
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setCameraOpen(true)}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <Camera className="size-3.5 text-primary" />
            Take Snapshot
          </Button>

          <Button
            size="sm"
            onClick={() => setUploadOpen(true)}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <Upload className="size-3.5" />
            Upload Evidence
          </Button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex overflow-x-auto border-b border-border p-2 gap-1.5 bg-background">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-2.5 py-1 text-[11px] font-medium rounded-full whitespace-nowrap transition-colors",
              selectedCategory === cat
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-3.5">
        {filteredEvidence.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            <Camera className="size-8 mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-foreground">No evidence records found in this category.</p>
            <p className="mt-1">Capture photos of metal items, weigh scale readings, or bank release papers.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredEvidence.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className="group relative cursor-pointer border border-border bg-card rounded-md overflow-hidden hover:border-primary/50 transition-all hover:shadow-xs"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-muted">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-1.5 left-1.5">
                    <span className="rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider backdrop-blur-xs">
                      {item.category}
                    </span>
                  </div>
                  <div className="absolute bottom-1.5 right-1.5">
                    {item.verificationStatus === "Verified" ? (
                      <span className="flex items-center gap-1 rounded bg-success/90 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
                        <CheckCircle2 className="size-2.5" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
                        <Clock className="size-2.5" /> Pending
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-2">
                  <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground mt-0.5">
                    {item.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-table-head text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Preview</th>
                  <th className="px-3 py-2 text-left font-semibold">Title & Category</th>
                  <th className="px-3 py-2 text-left font-semibold">Transaction / Customer</th>
                  <th className="px-3 py-2 text-left font-semibold">Uploaded By</th>
                  <th className="px-3 py-2 text-left font-semibold">Date & Time</th>
                  <th className="px-3 py-2 text-left font-semibold">Status</th>
                  <th className="px-3 py-2 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEvidence.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40 cursor-pointer" onClick={() => setActiveItem(item)}>
                    <td className="px-3 py-2">
                      <img src={item.url} alt="" className="size-10 object-cover rounded border border-border" />
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <span className="inline-block mt-0.5 rounded bg-muted px-1.5 py-0.2 text-[9px] font-semibold text-muted-foreground uppercase">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                      <p>{item.transactionId}</p>
                      <p className="text-[10px]">{item.customerId}</p>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{item.uploadedBy}</td>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{item.timestamp}</td>
                    <td className="px-3 py-2">
                      {item.verificationStatus === "Verified" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-success-muted px-2 py-0.5 text-[10px] font-bold text-success">
                          <CheckCircle2 className="size-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-warning-muted px-2 py-0.5 text-[10px] font-bold text-warning-strong">
                          <Clock className="size-3" /> Pending Review
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        <Eye className="size-3.5" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL / ZOOM MODAL */}
      <Dialog open={!!activeItem} onOpenChange={(open) => !open && setActiveItem(null)}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden border border-border">
          {activeItem && (
            <div className="flex flex-col md:flex-row">
              {/* Photo Area */}
              <div className="flex-1 bg-black flex items-center justify-center p-4 min-h-[360px]">
                <img
                  src={activeItem.url}
                  alt={activeItem.title}
                  className="max-h-[480px] w-auto object-contain rounded"
                />
              </div>

              {/* Metadata Panel */}
              <div className="w-full md:w-80 bg-card p-5 border-t md:border-t-0 md:border-l border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      {activeItem.category}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">{activeItem.id}</span>
                  </div>

                  <h3 className="mt-2 text-base font-bold text-foreground font-display">{activeItem.title}</h3>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{activeItem.filename}</p>

                  <div className="mt-4 space-y-2.5 text-xs divide-y divide-border/60">
                    <div className="pt-2 flex justify-between">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <span className="font-semibold text-foreground font-mono">{activeItem.transactionId}</span>
                    </div>
                    <div className="pt-2 flex justify-between">
                      <span className="text-muted-foreground">Customer ID:</span>
                      <span className="font-semibold text-foreground font-mono">{activeItem.customerId}</span>
                    </div>
                    <div className="pt-2 flex justify-between">
                      <span className="text-muted-foreground">Branch:</span>
                      <span className="font-semibold text-foreground">{activeItem.branch}</span>
                    </div>
                    <div className="pt-2 flex justify-between">
                      <span className="text-muted-foreground">Recorded By:</span>
                      <span className="font-semibold text-foreground">{activeItem.uploadedBy}</span>
                    </div>
                    <div className="pt-2 flex justify-between">
                      <span className="text-muted-foreground">Timestamp:</span>
                      <span className="font-semibold text-foreground">{activeItem.timestamp}</span>
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-muted-foreground">Audit Status:</span>
                      {activeItem.verificationStatus === "Verified" ? (
                        <span className="font-bold text-success flex items-center gap-1">
                          <CheckCircle2 className="size-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="font-bold text-warning-strong flex items-center gap-1">
                          <Clock className="size-3.5" /> Pending Review
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  {activeItem.verificationStatus !== "Verified" && (
                    <Button
                      size="sm"
                      className="w-full text-xs font-semibold gap-1.5"
                      onClick={() => {
                        verifyEvidence(activeItem.id);
                        setActiveItem({ ...activeItem, verificationStatus: "Verified" });
                      }}
                    >
                      <CheckCircle2 className="size-4" />
                      Mark as Verified
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs font-semibold gap-1.5"
                    onClick={() => {
                      toast.success("Evidence downloaded", {
                        description: `Downloaded ${activeItem.filename} with metadata hash.`,
                      });
                    }}
                  >
                    <Download className="size-3.5" /> Download Full Resolution
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* UPLOAD SIMULATION MODAL */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md border border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-display">Upload Photographic Evidence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Evidence Category</Label>
              <Select value={newCategory} onValueChange={(v) => setNewCategory(v as EvidenceItem["category"])}>
                <SelectTrigger className="mt-1 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter((c) => c !== "All").map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Evidence Description / Title</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Weigh scale tare verification 24.50g"
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div className="border-2 border-dashed border-border rounded-md p-6 text-center hover:border-primary/50 transition-colors bg-muted/20">
              <Upload className="size-8 mx-auto text-muted-foreground opacity-40 mb-2" />
              <p className="text-xs font-semibold text-foreground">Click to browse or drag file here</p>
              <p className="text-[10px] text-muted-foreground mt-1">Supports High-Resolution JPG, PNG, WEBP, PDF (Max 25MB)</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setUploadOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSimulateUpload} className="gap-1">
                <Upload className="size-3.5" /> Save Evidence
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CAMERA VIEWFINDER MODAL */}
      <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
        <DialogContent className="sm:max-w-md border border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-display flex items-center gap-2">
              <Camera className="size-4 text-primary" />
              Branch Desk Camera Live Viewfinder
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="relative aspect-4/3 w-full bg-slate-900 rounded-md overflow-hidden flex items-center justify-center border border-slate-700">
              {/* Simulated camera feed */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
              <div className="absolute top-3 left-3 text-[10px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                AVP WEIGH-BAY-CAM-01 (1080p 60fps)
              </div>
              <div className="absolute inset-x-8 inset-y-8 border border-white/20 rounded pointer-events-none flex items-center justify-center">
                <div className="size-12 border-t-2 border-l-2 border-primary absolute top-0 left-0" />
                <div className="size-12 border-t-2 border-r-2 border-primary absolute top-0 right-0" />
                <div className="size-12 border-b-2 border-l-2 border-primary absolute bottom-0 left-0" />
                <div className="size-12 border-b-2 border-r-2 border-primary absolute bottom-0 right-0" />
                <span className="text-white/40 text-xs font-mono">ALIGN ITEM / SCALE DISPLAY</span>
              </div>
              {cameraSnapping && (
                <div className="absolute inset-0 bg-white animate-fade-out" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <Label className="text-[11px] font-semibold">Select Evidence Category</Label>
                <Select value={newCategory} onValueChange={(v) => setNewCategory(v as EvidenceItem["category"])}>
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter((c) => c !== "All").map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSimulateCameraCapture}
                  disabled={cameraSnapping}
                  className="w-full h-8 text-xs font-bold gap-1.5"
                >
                  <Camera className="size-3.5" />
                  {cameraSnapping ? "Capturing…" : "Capture Now"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function EvidenceTimeline({ transactionId }: { transactionId: string }) {
  const { transactions } = useERPStore();
  const txn = transactions.find((t) => t.id === transactionId);

  const steps = [
    { title: "Customer Registered & Profile Checked", time: "09:42 AM", user: "K. Venkatesh", done: true },
    { title: "Biometric KYC Verification Approved", time: "09:46 AM", user: "R. Srinivas", done: true },
    { title: "Physical Ornament Macro Evidence Captured", time: "09:49 AM", user: "K. Venkatesh", done: true },
    { title: "Mettler Toledo Certified Weight Verified", time: "09:52 AM", user: "K. Venkatesh", done: true },
    {
      title: "Bank Loan Redemption Authorization",
      time: "10:05 AM",
      user: "R. Srinivas",
      done: txn?.type === "Bank Pledged",
      skipped: txn?.type !== "Bank Pledged",
    },
    {
      title: "Bank Outstanding RTGS Payment Executed",
      time: "10:18 AM",
      user: "T. Suresh",
      done: txn?.status !== "Bank Payment Pending" && txn?.status !== "Verification" && txn?.status !== "Draft",
      skipped: txn?.type !== "Bank Pledged",
    },
    {
      title: "Metal Released from Bank Safe Custody",
      time: "10:45 AM",
      user: "S. Raghunath",
      done: txn?.status === "Gold Received" || txn?.status === "Silver Received" || txn?.status === "Testing" || txn?.status === "Valuation" || txn?.status === "Completed",
      skipped: txn?.type !== "Bank Pledged",
    },
    { title: "Niton XRF Spectrometer Purity Assay Verified", time: "11:05 AM", user: "B. Haritha", done: true },
    { title: "Transparent Net Valuation & Deduction Approved", time: "11:15 AM", user: "R. Srinivas", done: true },
    { title: "Customer Settlement Disbursement Finalized", time: "11:28 AM", user: "T. Suresh", done: txn?.settlementStatus === "Paid" },
    { title: "Tamper-Proof Barcoded Packet Vaulted", time: "11:35 AM", user: "R. Chaitanya", done: true },
  ];

  return (
    <div className="border border-border bg-card p-4 rounded-md shadow-xs">
      <h4 className="font-display text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
        <Clock className="size-3.5 text-primary" />
        Custody & Operational Audit Timeline
      </h4>
      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {steps.filter((s) => !s.skipped).map((s, idx) => (
          <div key={idx} className="relative">
            <div
              className={cn(
                "absolute -left-6 top-0.5 size-4 rounded-full border-2 border-background flex items-center justify-center text-[8px]",
                s.done ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {s.done ? "✓" : "•"}
            </div>
            <div>
              <p className={cn("text-xs font-semibold", s.done ? "text-foreground" : "text-muted-foreground")}>
                {s.title}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {s.time} · Logged by {s.user}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
