import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { 
  Beaker, 
  Search, 
  Filter, 
  CheckCircle2, 
  Activity, 
  Thermometer, 
  ShieldCheck, 
  FileSignature 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader, StatusBadge } from "@/components/erp/ui";
import { useERPStore } from "@/lib/erp-store";
import { formatINR, formatGrams, type Transaction } from "@/lib/erp-data";
import { EvidenceGallery } from "@/components/erp/evidence-gallery";
import { toast } from "sonner";

export const Route = createFileRoute("/testing")({
  component: TestingCenterPage,
});

function TestingCenterPage() {
  const { filteredTransactions, recordPurityTestResult, updateTransactionStatus } = useERPStore();

  const [query, setQuery] = useState("");
  const [metalFilter, setMetalFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Testing");
  
  const [activeTxn, setActiveTxn] = useState<Transaction | null>(null);
  const [testedPurity, setTestedPurity] = useState<string>("91.6");
  const [testedBy, setTestedBy] = useState<string>("Dr. Sharma (Senior Metallurgist)");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter transactions for Testing / Valuation
  const testableTransactions = useMemo(() => {
    return filteredTransactions.filter((t) => 
      ["Testing", "Valuation", "Settlement Pending"].includes(t.status)
    );
  }, [filteredTransactions]);

  const filtered = useMemo(() => {
    return testableTransactions.filter((t) => {
      const matchQ = 
        t.id.toLowerCase().includes(query.toLowerCase()) || 
        t.customerName.toLowerCase().includes(query.toLowerCase());
      const matchMetal = metalFilter === "All" || t.metal === metalFilter;
      const matchStatus = statusFilter === "All" || t.status === statusFilter;
      return matchQ && matchMetal && matchStatus;
    });
  }, [testableTransactions, query, metalFilter, statusFilter]);

  const stats = useMemo(() => {
    const pending = testableTransactions.filter(t => t.status === "Testing").length;
    const completed = testableTransactions.filter(t => t.status !== "Testing").length;
    return { pending, completed, total: testableTransactions.length };
  }, [testableTransactions]);

  const handleTestComplete = () => {
    if (!activeTxn) return;
    setIsSubmitting(true);
    setTimeout(() => {
      // In a real app, this would update each item's purity. 
      // For this MVP, we use the store's simplified mutator.
      recordPurityTestResult(activeTxn.id, parseFloat(testedPurity), testedBy);
      updateTransactionStatus(activeTxn.id, "Valuation", `XRF testing completed by ${testedBy} with average purity ${testedPurity}%`);
      toast.success("Testing completed and certified");
      setIsSubmitting(false);
      setActiveTxn(null);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="XRF & Testing Center" 
        subtitle="Precision purity testing and metallurgical certification"
        action={
          <Button className="bg-avp-gold hover:bg-avp-gold/90 text-avp-charcoal">
            <Beaker className="h-4 w-4 mr-2" />
            Calibrate XRF Machine
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-avp-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-avp-charcoal/70">Pending Tests</p>
            <p className="text-2xl font-bold text-avp-charcoal">{stats.pending}</p>
          </div>
          <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Activity className="h-6 w-6 text-amber-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-avp-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-avp-charcoal/70">Completed Today</p>
            <p className="text-2xl font-bold text-avp-charcoal">{stats.completed}</p>
          </div>
          <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-avp-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-avp-charcoal/70">Average Process Time</p>
            <p className="text-2xl font-bold text-avp-charcoal">8 mins</p>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Thermometer className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-avp-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-avp-charcoal/40" />
          <Input 
            placeholder="Scan packet barcode or search ID..." 
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={metalFilter} onValueChange={setMetalFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Filter className="h-4 w-4 mr-2 text-avp-charcoal/50" />
            <SelectValue placeholder="Metal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Metals</SelectItem>
            <SelectItem value="Gold">Gold</SelectItem>
            <SelectItem value="Silver">Silver</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2 text-avp-charcoal/50" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Testing">Pending Test</SelectItem>
            <SelectItem value="Valuation">Tested (Pending Value)</SelectItem>
            <SelectItem value="Settlement Pending">Tested (Settlement)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-avp-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-avp-warm text-avp-charcoal/70 uppercase font-semibold text-xs">
              <tr>
                <th className="px-6 py-4">Ref / Branch</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Metal & Type</th>
                <th className="px-6 py-4">Net Weight</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-avp-border/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-avp-charcoal/50">
                    No packets pending testing matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((txn) => (
                  <tr key={txn.id} className="hover:bg-avp-warm/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-avp-charcoal">{txn.id}</div>
                      <div className="text-xs text-avp-charcoal/60">{txn.branch}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{txn.customerName}</div>
                      <div className="text-xs text-avp-charcoal/60">Assigned: {txn.assignedAppraiser}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{txn.metal}</div>
                      <div className="text-xs text-avp-charcoal/60">{txn.type}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium">
                      {formatGrams(txn.totalNetWeight)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={txn.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {txn.status === "Testing" ? (
                        <Button 
                          size="sm" 
                          className="bg-avp-gold hover:bg-avp-gold/90 text-avp-charcoal font-medium"
                          onClick={() => setActiveTxn(txn)}
                        >
                          <Activity className="h-4 w-4 mr-1.5" />
                          Start Test
                        </Button>
                      ) : (
                        <div className="text-emerald-600 flex items-center justify-end text-sm font-medium">
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />
                          Tested
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Testing Modal */}
      {activeTxn && (
        <Dialog open={!!activeTxn} onOpenChange={(open) => !open && setActiveTxn(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl">
                <Beaker className="h-5 w-5 mr-2 text-avp-gold" />
                XRF Spectrometer Analysis
              </DialogTitle>
              <DialogDescription>
                Testing Packet {activeTxn.id} for {activeTxn.customerName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {/* Items Summary */}
              <div className="space-y-4">
                <div className="bg-avp-warm/50 p-4 rounded-xl border border-avp-border space-y-2">
                  <h4 className="font-medium text-avp-charcoal border-b border-avp-border pb-2 mb-2">
                    Metal Declaration
                  </h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-avp-charcoal/70">Metal</span>
                    <span className="font-medium">{activeTxn.metal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-avp-charcoal/70">Expected Purity</span>
                    <span className="font-medium">{activeTxn.averagePurity}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-avp-charcoal/70">Declared Net Weight</span>
                    <span className="font-medium font-mono">{formatGrams(activeTxn.totalNetWeight)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-avp-charcoal">Items to Test</h4>
                  {activeTxn.items.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 border border-avp-border rounded-lg flex justify-between items-center shadow-sm">
                      <div className="text-sm">
                        <span className="font-medium block">{item.description}</span>
                        <span className="text-xs text-avp-charcoal/60">{formatGrams(item.netWeight)}</span>
                      </div>
                      <div className="text-xs px-2 py-1 bg-avp-warm rounded text-avp-charcoal/80 font-mono border border-avp-border">
                        {item.id}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Results Entry */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-avp-gold/30 shadow-sm space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-avp-gold"></div>
                    <h4 className="font-medium text-avp-charcoal flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-avp-gold" />
                      Record Results
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-avp-charcoal/70 mb-1 block">XRF Machine Status</label>
                        <div className="flex items-center text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1.5 rounded w-fit border border-emerald-100">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Calibrated & Ready (XRF-402)
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-avp-charcoal/70 mb-1 block">Verified Purity (%)</label>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={testedPurity}
                          onChange={(e) => setTestedPurity(e.target.value)}
                          className="font-mono text-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-avp-charcoal/70 mb-1 block">Verified By (Assayer)</label>
                        <Select value={testedBy} onValueChange={setTestedBy}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Dr. Sharma (Senior Metallurgist)">Dr. Sharma</SelectItem>
                            <SelectItem value="A. Kumar (Assayer)">A. Kumar</SelectItem>
                            <SelectItem value="R. Patel (Quality Check)">R. Patel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-avp-warm/50 p-4 rounded-xl border border-avp-border">
                    <EvidenceGallery
                      transactionId={activeTxn.id}
                      category="testing"
                      title="Upload Test Certificate / Photo"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleTestComplete} 
                  disabled={isSubmitting}
                  className="w-full bg-avp-charcoal hover:bg-avp-charcoal/90 text-white"
                >
                  {isSubmitting ? (
                    "Certifying..."
                  ) : (
                    <>
                      <FileSignature className="h-4 w-4 mr-2" />
                      Certify & Forward to Valuation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
