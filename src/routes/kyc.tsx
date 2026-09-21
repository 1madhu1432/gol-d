import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  FileCheck,
  ShieldAlert,
  UserCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, StatusBadge } from "@/components/erp/ui";
import { useERPStore } from "@/lib/erp-store";
import { type Customer } from "@/lib/erp-data";
import { toast } from "sonner";

export const Route = createFileRoute("/kyc")({
  component: KYCPage,
});

function KYCPage() {
  const { filteredCustomers, updateCustomerKYC } = useERPStore();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [inspectCustomer, setInspectCustomer] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    return filteredCustomers.filter((c) => {
      const matchQ =
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.id.toLowerCase().includes(query.toLowerCase()) ||
        c.mobile.includes(query) ||
        c.idNumber.toLowerCase().includes(query.toLowerCase());
      const matchStatus =
        statusFilter === "All"
          ? true
          : statusFilter === "Pending"
          ? c.kycStatus === "Pending" || c.kycStatus === "Submitted"
          : c.kycStatus === statusFilter;
      return matchQ && matchStatus;
    });
  }, [filteredCustomers, query, statusFilter]);

  const handleVerify = (id: string) => {
    updateCustomerKYC(id, "Verified");
    if (inspectCustomer && inspectCustomer.id === id) {
      setInspectCustomer({ ...inspectCustomer, kycStatus: "Verified" });
    }
  };

  const handleReject = (id: string) => {
    updateCustomerKYC(id, "Rejected");
    if (inspectCustomer && inspectCustomer.id === id) {
      setInspectCustomer({ ...inspectCustomer, kycStatus: "Rejected" });
    }
  };

  const handleRequestCorrection = (id: string) => {
    updateCustomerKYC(id, "Correction Required");
    if (inspectCustomer && inspectCustomer.id === id) {
      setInspectCustomer({ ...inspectCustomer, kycStatus: "Correction Required" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compliance & Legal · KYC Verification Desk"
        title="Customer KYC Verification Queue"
        description="Physical identification check, UIDAI Aadhaar XML audit, and photo-counter biometric verification."
      />

      {/* Filter and stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="border border-border p-3.5 rounded-md bg-card">
          <p className="text-muted-foreground font-semibold">Pending Verification</p>
          <p className="font-display text-xl font-bold text-amber-600 mt-1">
            {filteredCustomers.filter((c) => c.kycStatus === "Submitted" || c.kycStatus === "Pending").length}
          </p>
        </div>
        <div className="border border-border p-3.5 rounded-md bg-card">
          <p className="text-muted-foreground font-semibold">Verified Customers</p>
          <p className="font-display text-xl font-bold text-success mt-1">
            {filteredCustomers.filter((c) => c.kycStatus === "Verified").length}
          </p>
        </div>
        <div className="border border-border p-3.5 rounded-md bg-card">
          <p className="text-muted-foreground font-semibold">Corrections Required</p>
          <p className="font-display text-xl font-bold text-amber-700 mt-1">
            {filteredCustomers.filter((c) => c.kycStatus === "Correction Required").length}
          </p>
        </div>
        <div className="border border-border p-3.5 rounded-md bg-card">
          <p className="text-muted-foreground font-semibold">Rejected Documents</p>
          <p className="font-display text-xl font-bold text-destructive mt-1">
            {filteredCustomers.filter((c) => c.kycStatus === "Rejected").length}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border border-border bg-card p-3 rounded-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by customer, mobile, ID proof number…"
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-44 text-xs font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending / Submitted Queue</SelectItem>
              <SelectItem value="All">All Records</SelectItem>
              <SelectItem value="Verified">Verified Only</SelectItem>
              <SelectItem value="Correction Required">Correction Required</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border bg-card shadow-xs rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-table-head text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                <th className="px-4 py-3 text-left font-semibold">Branch</th>
                <th className="px-4 py-3 text-left font-semibold">Document Type</th>
                <th className="px-4 py-3 text-left font-semibold">Document Number</th>
                <th className="px-4 py-3 text-left font-semibold">Submitted On</th>
                <th className="px-4 py-3 text-center font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Quick Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.id} · {c.mobile}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.branch}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{c.idType}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{c.idNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.createdDate}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge value={c.kycStatus} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 font-semibold"
                      onClick={() => setInspectCustomer(c)}
                    >
                      <Eye className="size-3.5" /> Inspect Document
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT MODAL */}
      <Dialog open={!!inspectCustomer} onOpenChange={(open) => !open && setInspectCustomer(null)}>
        <DialogContent className="sm:max-w-3xl border border-border">
          {inspectCustomer && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="font-display text-base font-bold flex items-center gap-2">
                  <BadgeCheck className="size-4 text-primary" />
                  KYC Document Assay & Compliance Review
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 text-xs bg-muted/20 p-4 rounded-md border border-border">
                <div>
                  <p className="text-muted-foreground">Customer Name</p>
                  <p className="font-bold text-foreground text-sm mt-0.5">{inspectCustomer.name}</p>
                  <p className="text-muted-foreground mt-1">Mobile: {inspectCustomer.mobile}</p>
                  <p className="text-muted-foreground">Branch: {inspectCustomer.branch}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Government Proof</p>
                  <p className="font-bold text-foreground mt-0.5">{inspectCustomer.idType}</p>
                  <p className="font-mono font-bold text-primary mt-1">{inspectCustomer.idNumber}</p>
                  <p className="text-muted-foreground">Registered: {inspectCustomer.createdDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-border rounded p-3 text-center bg-card">
                  <p className="text-xs font-bold text-foreground mb-2">UIDAI Aadhaar / ID Card Scan</p>
                  <img
                    src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80"
                    alt="ID Proof"
                    className="h-44 w-full object-cover rounded border border-border"
                  />
                  <span className="inline-block mt-2 rounded bg-success-muted px-2 py-0.5 text-[10px] font-bold text-success">
                    OCR Match: 99.4% Valid
                  </span>
                </div>

                <div className="border border-border rounded p-3 text-center bg-card">
                  <p className="text-xs font-bold text-foreground mb-2">Branch Counter Photo Capture</p>
                  <img
                    src={inspectCustomer.photoUrl}
                    alt="Portrait"
                    className="h-44 w-full object-cover rounded border border-border"
                  />
                  <span className="inline-block mt-2 rounded bg-success-muted px-2 py-0.5 text-[10px] font-bold text-success">
                    Live Face Biometric Match
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-destructive border-destructive/30 hover:bg-destructive-muted"
                    onClick={() => handleReject(inspectCustomer.id)}
                  >
                    <XCircle className="size-3.5 mr-1" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                    onClick={() => handleRequestCorrection(inspectCustomer.id)}
                  >
                    <AlertTriangle className="size-3.5 mr-1" /> Request Correction
                  </Button>
                </div>

                <Button
                  size="sm"
                  className="text-xs font-bold bg-success hover:bg-success/90 text-white gap-1.5"
                  onClick={() => handleVerify(inspectCustomer.id)}
                >
                  <CheckCircle2 className="size-4" /> Approve & Verify Customer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
