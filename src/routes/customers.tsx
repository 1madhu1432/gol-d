import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  MapPin,
  FileText,
  Gem,
  Coins,
  Landmark,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PageHeader, StatusBadge } from "@/components/erp/ui";
import { useERPStore } from "@/lib/erp-store";
import { formatINR, formatGrams, formatKg, type Customer } from "@/lib/erp-data";
import { EvidenceGallery, EvidenceTimeline } from "@/components/erp/evidence-gallery";
import { toast } from "sonner";

export const Route = createFileRoute("/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const { filteredCustomers, selectedBranch, addCustomer, updateCustomerKYC, transactions } = useERPStore();

  const [query, setQuery] = useState("");
  const [kycFilter, setKycFilter] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "kyc" | "transactions" | "evidence" | "timeline">("overview");

  // New customer form state
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState(selectedBranch === "All Branches" ? "Hyderabad" : selectedBranch);
  const [idType, setIdType] = useState<Customer["idType"]>("Aadhaar");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");

  const filtered = useMemo(() => {
    return filteredCustomers.filter((c) => {
      const matchQuery =
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.id.toLowerCase().includes(query.toLowerCase()) ||
        c.mobile.includes(query) ||
        c.idNumber.toLowerCase().includes(query.toLowerCase());
      const matchKyc = kycFilter === "All" || c.kycStatus === kycFilter;
      return matchQuery && matchKyc;
    });
  }, [filteredCustomers, query, kycFilter]);

  const customerTransactions = useMemo(() => {
    if (!selectedCustomer) return [];
    return transactions.filter((t) => t.customerId === selectedCustomer.id);
  }, [transactions, selectedCustomer]);

  const handleCreateCustomer = () => {
    if (!name.trim() || !mobile.trim() || !idNumber.trim()) {
      toast.error("Please fill in required fields (Name, Mobile, ID Number)");
      return;
    }

    const newCust: Customer = {
      id: `AVP-C-${Math.floor(1100 + Math.random() * 8900)}`,
      name,
      mobile: mobile.startsWith("+91") ? mobile : `+91 ${mobile}`,
      email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      address: address || "H.No. 4-12/A, Main Bazar, Hyderabad",
      city: branch,
      state: branch === "Hyderabad" ? "Telangana" : "Andhra Pradesh",
      pin: "500034",
      dob: "15-Aug-1988",
      idType,
      idNumber,
      branch,
      kycStatus: "Submitted",
      kycType: "Full Physical & Biometric Assay",
      createdDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      status: "Active",
      totalTransactions: 0,
      goldWeight: 0,
      silverWeight: 0,
      totalValue: 0,
      lastTransaction: "Just Registered",
    };

    addCustomer(newCust);
    setCreateModalOpen(false);
    setName("");
    setMobile("");
    setIdNumber("");
    setAddress("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations · Customer Registry"
        title="Customer Master Database"
        description="Verified customer profiles, KYC compliance records, past metal transactions and pledged loan histories."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs font-semibold"
              onClick={() => toast.success("Exported customer ledger to CSV")}
            >
              <Download className="size-3.5" /> Export Records
            </Button>
            <Button
              size="sm"
              className="h-9 gap-1.5 text-xs font-bold"
              onClick={() => setCreateModalOpen(true)}
            >
              <UserPlus className="size-3.5" /> Add New Customer
            </Button>
          </>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between border border-border bg-card p-3 rounded-md shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by customer name, ID, mobile number, Aadhaar…"
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={kycFilter} onValueChange={setKycFilter}>
            <SelectTrigger className="h-9 w-40 text-xs font-medium">
              <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="KYC Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All KYC Statuses</SelectItem>
              <SelectItem value="Verified">Verified</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Correction Required">Correction Required</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground whitespace-nowrap pl-2">
            Showing <strong className="text-foreground">{filtered.length}</strong> customers
          </span>
        </div>
      </div>

      {/* Customers Table */}
      <div className="border border-border bg-card shadow-xs rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-table-head text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Customer ID</th>
                <th className="px-4 py-3 text-left font-semibold">Customer Name</th>
                <th className="px-4 py-3 text-left font-semibold">Mobile</th>
                <th className="px-4 py-3 text-left font-semibold">Branch</th>
                <th className="px-4 py-3 text-center font-semibold">KYC Status</th>
                <th className="px-4 py-3 text-right font-semibold">Gold Volume</th>
                <th className="px-4 py-3 text-right font-semibold">Silver Volume</th>
                <th className="px-4 py-3 text-right font-semibold">Total Turnovers</th>
                <th className="px-4 py-3 text-left font-semibold">Last Txn</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => {
                    setSelectedCustomer(c);
                    setActiveTab("overview");
                  }}
                  className="hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-bold text-primary">{c.id}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.mobile}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.branch}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge value={c.kycStatus} />
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium">{formatGrams(c.goldWeight)}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium">{formatGrams(c.silverWeight)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-foreground">{formatINR(c.totalValue)}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.lastTransaction}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 font-semibold">
                      <Eye className="size-3.5 text-muted-foreground" /> View Profile
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER DETAIL MODAL / DRAWER */}
      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 border border-border">
          {selectedCustomer && (
            <div>
              {/* Profile Header */}
              <div className="bg-muted/30 border-b border-border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="grid size-14 place-items-center rounded-full bg-primary/15 text-primary text-xl font-bold font-display">
                    {selectedCustomer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-lg font-bold text-foreground">{selectedCustomer.name}</h2>
                      <span className="font-mono text-xs text-muted-foreground">({selectedCustomer.id})</span>
                      <StatusBadge value={selectedCustomer.kycStatus} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Phone className="size-3" /> {selectedCustomer.mobile}</span>
                      <span className="flex items-center gap-1"><MapPin className="size-3" /> {selectedCustomer.branch}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedCustomer.kycStatus !== "Verified" && (
                    <Button
                      size="sm"
                      className="h-8 text-xs font-bold gap-1 bg-success text-white"
                      onClick={() => {
                        updateCustomerKYC(selectedCustomer.id, "Verified");
                        setSelectedCustomer({ ...selectedCustomer, kycStatus: "Verified" });
                      }}
                    >
                      <CheckCircle2 className="size-3.5" /> Mark KYC Verified
                    </Button>
                  )}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b border-border px-6 flex gap-4 text-xs font-semibold bg-card">
                {(["overview", "kyc", "transactions", "evidence", "timeline"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 border-b-2 capitalize transition-colors ${
                      activeTab === tab
                        ? "border-primary text-primary font-bold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "kyc" ? "KYC Compliance" : tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-md bg-muted/20 border border-border">
                      <div>
                        <p className="text-muted-foreground">ID Type</p>
                        <p className="font-bold text-foreground mt-0.5">{selectedCustomer.idType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ID Number</p>
                        <p className="font-mono font-bold text-foreground mt-0.5">{selectedCustomer.idNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date of Birth</p>
                        <p className="text-foreground mt-0.5">{selectedCustomer.dob}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Member Since</p>
                        <p className="text-foreground mt-0.5">{selectedCustomer.createdDate}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-foreground mb-1">Residential Address</p>
                      <p className="text-muted-foreground">
                        {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state} - {selectedCustomer.pin}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 border border-border rounded-md bg-card">
                        <p className="text-muted-foreground">Gold Cumulative</p>
                        <p className="font-display text-base font-bold text-primary mt-1">{formatGrams(selectedCustomer.goldWeight)}</p>
                      </div>
                      <div className="p-4 border border-border rounded-md bg-card">
                        <p className="text-muted-foreground">Silver Cumulative</p>
                        <p className="font-display text-base font-bold text-slate-700 mt-1">{formatGrams(selectedCustomer.silverWeight)}</p>
                      </div>
                      <div className="p-4 border border-border rounded-md bg-card">
                        <p className="text-muted-foreground">Total Turnovers</p>
                        <p className="font-display text-base font-bold text-foreground mt-1">{formatINR(selectedCustomer.totalValue)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "kyc" && (
                  <div className="space-y-4 text-xs">
                    <div className="border border-border p-4 rounded-md bg-muted/20 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-foreground">KYC Assay Verification Status: {selectedCustomer.kycStatus}</p>
                        <p className="text-muted-foreground mt-0.5">Physical document verified against central UIDAI / Income Tax database.</p>
                      </div>
                      <StatusBadge value={selectedCustomer.kycStatus} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-border rounded p-3 text-center">
                        <p className="font-semibold text-foreground mb-2">Government ID Front Preview</p>
                        <img
                          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80"
                          alt="ID Front"
                          className="h-40 w-full object-cover rounded border border-border"
                        />
                      </div>
                      <div className="border border-border rounded p-3 text-center">
                        <p className="font-semibold text-foreground mb-2">Customer Photograph (Counter Assay)</p>
                        <img
                          src={selectedCustomer.photoUrl}
                          alt="Customer Photo"
                          className="h-40 w-full object-cover rounded border border-border"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "transactions" && (
                  <div className="space-y-3 text-xs">
                    {customerTransactions.length === 0 ? (
                      <p className="py-8 text-center text-muted-foreground">No transactions recorded for this customer yet.</p>
                    ) : (
                      <table className="w-full text-xs">
                        <thead className="bg-table-head text-muted-foreground">
                          <tr>
                            <th className="p-2 text-left">Txn ID</th>
                            <th className="p-2 text-left">Type</th>
                            <th className="p-2 text-left">Metal</th>
                            <th className="p-2 text-right">Net Wt</th>
                            <th className="p-2 text-right">Payable</th>
                            <th className="p-2 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {customerTransactions.map((t) => (
                            <tr key={t.id}>
                              <td className="p-2 font-mono font-bold text-primary">{t.id}</td>
                              <td className="p-2">{t.type}</td>
                              <td className="p-2 font-semibold">{t.metal}</td>
                              <td className="p-2 text-right font-mono">{formatGrams(t.totalNetWeight)}</td>
                              <td className="p-2 text-right font-mono font-bold">{formatINR(t.customerPayable)}</td>
                              <td className="p-2 text-center"><StatusBadge value={t.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {activeTab === "evidence" && (
                  <EvidenceGallery customerId={selectedCustomer.id} />
                )}

                {activeTab === "timeline" && (
                  <EvidenceTimeline transactionId={customerTransactions[0]?.id || "AVP-PUR-G-1001"} />
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CREATE NEW CUSTOMER MODAL */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-lg border border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-base font-bold">Register New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] font-semibold">Full Legal Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ramesh Reddy" className="h-8 text-xs mt-1" />
              </div>
              <div>
                <Label className="text-[11px] font-semibold">Mobile Number *</Label>
                <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="e.g. 9849012345" className="h-8 text-xs mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] font-semibold">ID Proof Type *</Label>
                <Select value={idType} onValueChange={(v) => setIdType(v as Customer["idType"])}>
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aadhaar">Aadhaar Card</SelectItem>
                    <SelectItem value="PAN">PAN Card</SelectItem>
                    <SelectItem value="Voter ID">Voter ID Card</SelectItem>
                    <SelectItem value="Passport">Indian Passport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] font-semibold">ID Document Number *</Label>
                <Input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="e.g. 3400 5600 7800" className="h-8 text-xs mt-1 font-mono" />
              </div>
            </div>

            <div>
              <Label className="text-[11px] font-semibold">Assigned Branch *</Label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hyderabad">Hyderabad Branch</SelectItem>
                  <SelectItem value="Vijayawada">Vijayawada Branch</SelectItem>
                  <SelectItem value="Tirupati">Tirupati Branch</SelectItem>
                  <SelectItem value="Kurnool">Kurnool Branch</SelectItem>
                  <SelectItem value="Visakhapatnam">Visakhapatnam Branch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[11px] font-semibold">Residential Address</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House/Flat number, Street, Landmark" className="h-8 text-xs mt-1" />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateCustomer} className="font-bold">
                Save & Enrol Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
