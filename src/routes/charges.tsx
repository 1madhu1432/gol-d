import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ReceiptIndianRupee,
  Calculator,
  Sliders,
  Plus,
  Percent,
  Coins,
  Gem,
  CheckCircle2,
  Info,
  Layers,
  IndianRupee,
  Building2,
  ShieldCheck,
  Edit2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, MetricCard, Panel } from "@/components/erp/ui";
import { formatINR } from "@/lib/erp-data";
import { useERPStore } from "@/lib/erp-store";
import { toast } from "sonner";

export const Route = createFileRoute("/charges")({
  component: ChargesPage,
});

type ChargeRule = {
  id: string;
  name: string;
  category: "Service Fee" | "Processing" | "Testing" | "Bank Liaison" | "Commission" | "Documentation";
  type: "Percentage" | "Fixed Amount" | "Per Gram";
  value: number;
  appliesTo: "All Metals" | "Gold Only" | "Silver Only" | "Bank Pledged Only";
  minAmount?: number;
  maxAmount?: number;
  taxGstPercent: number;
  effectiveFrom: string;
  status: "Active" | "Inactive";
};

const initialRules: ChargeRule[] = [
  {
    id: "CHG-001",
    name: "Standard Direct Purchase Service Margin",
    category: "Service Fee",
    type: "Percentage",
    value: 1.5,
    appliesTo: "All Metals",
    minAmount: 500,
    maxAmount: 25000,
    taxGstPercent: 18,
    effectiveFrom: "01 Apr 2026",
    status: "Active",
  },
  {
    id: "CHG-002",
    name: "Bank Pledged Release Service Fee",
    category: "Service Fee",
    type: "Percentage",
    value: 2.5,
    appliesTo: "Bank Pledged Only",
    minAmount: 1500,
    maxAmount: 50000,
    taxGstPercent: 18,
    effectiveFrom: "01 Apr 2026",
    status: "Active",
  },
  {
    id: "CHG-003",
    name: "XRF Spectrometer Purity Assay Fee",
    category: "Testing",
    type: "Fixed Amount",
    value: 350,
    appliesTo: "All Metals",
    taxGstPercent: 18,
    effectiveFrom: "01 Jan 2026",
    status: "Active",
  },
  {
    id: "CHG-004",
    name: "Acid & Touchstone Physical Scratch Assay",
    category: "Testing",
    type: "Fixed Amount",
    value: 150,
    appliesTo: "All Metals",
    taxGstPercent: 18,
    effectiveFrom: "01 Jan 2026",
    status: "Active",
  },
  {
    id: "CHG-005",
    name: "Bank Liaison Travel & Conveyance",
    category: "Bank Liaison",
    type: "Fixed Amount",
    value: 1200,
    appliesTo: "Bank Pledged Only",
    taxGstPercent: 18,
    effectiveFrom: "15 May 2026",
    status: "Active",
  },
  {
    id: "CHG-006",
    name: "High Value Processing Surcharge (> ₹5 Lakhs)",
    category: "Processing",
    type: "Percentage",
    value: 0.5,
    appliesTo: "All Metals",
    minAmount: 1000,
    maxAmount: 15000,
    taxGstPercent: 18,
    effectiveFrom: "01 Feb 2026",
    status: "Active",
  },
  {
    id: "CHG-007",
    name: "Silver Bulk Refining & Melting Deduction",
    category: "Processing",
    type: "Per Gram",
    value: 1.25,
    appliesTo: "Silver Only",
    taxGstPercent: 18,
    effectiveFrom: "10 Jan 2026",
    status: "Active",
  },
  {
    id: "CHG-008",
    name: "Legal Indemnity & Notary Documentation",
    category: "Documentation",
    type: "Fixed Amount",
    value: 450,
    appliesTo: "Bank Pledged Only",
    taxGstPercent: 18,
    effectiveFrom: "01 Mar 2026",
    status: "Active",
  },
];

function ChargesPage() {
  const { filteredTransactions } = useERPStore();
  const [rules, setRules] = useState<ChargeRule[]>(initialRules);
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Calculator State
  const [calcMetal, setCalcMetal] = useState<"Gold" | "Silver">("Gold");
  const [calcType, setCalcType] = useState<"Direct Purchase" | "Bank Pledged">("Bank Pledged");
  const [calcWeight, setCalcWeight] = useState(65);
  const [calcPurity, setCalcPurity] = useState(91.6);
  const [calcRate, setCalcRate] = useState(6850);
  const [calcBankOutstanding, setCalcBankOutstanding] = useState(320000);

  // Computed totals from transactions
  const totalDeductionsCollected = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + (t.totalDeductions || 0), 0);
  }, [filteredTransactions]);

  const totalGrossValue = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + (t.grossMetalValue || 0), 0);
  }, [filteredTransactions]);

  const avgFeePercent = totalGrossValue > 0 ? ((totalDeductionsCollected / totalGrossValue) * 100).toFixed(2) : "2.40";

  // Calculation simulation
  const calcGrossValue = useMemo(() => {
    const fineWeight = calcWeight * (calcPurity / 100);
    return Math.round(fineWeight * calcRate);
  }, [calcWeight, calcPurity, calcRate]);

  const calcServiceFee = useMemo(() => {
    const rate = calcType === "Bank Pledged" ? 0.025 : 0.015;
    return Math.round(calcGrossValue * rate);
  }, [calcGrossValue, calcType]);

  const calcProcessingFee = useMemo(() => {
    return calcGrossValue > 500000 ? Math.round(calcGrossValue * 0.005) : 750;
  }, [calcGrossValue]);

  const calcTestingFee = 350; // standard XRF
  const calcBankLiaisonFee = calcType === "Bank Pledged" ? 1200 : 0;
  const calcDocFee = calcType === "Bank Pledged" ? 450 : 0;

  const calcTotalCharges = calcServiceFee + calcProcessingFee + calcTestingFee + calcBankLiaisonFee + calcDocFee;
  const calcGst = Math.round(calcTotalCharges * 0.18);
  const calcTotalDeductions = calcTotalCharges + calcGst + (calcType === "Bank Pledged" ? calcBankOutstanding : 0);
  const calcCustomerNetPayout = Math.max(0, calcGrossValue - calcTotalDeductions);

  // Filtered Rules
  const filteredRules = useMemo(() => {
    if (categoryFilter === "All") return rules;
    return rules.filter((r) => r.category === categoryFilter);
  }, [rules, categoryFilter]);

  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: r.status === "Active" ? "Inactive" : "Active" } : r))
    );
    toast.success("Rule status updated");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Commercial"
        title="Charges, Fees & Commission Engine"
        description="Master configuration for service fees, assay testing charges, bank liaison travel & documentation recovery, and real-time net settlement calculations."
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={() => setRuleModalOpen(true)} className="gap-1.5 shadow-sm">
              <Plus className="size-4" />
              Add Fee Rule
            </Button>
          </div>
        }
      />

      {/* KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Deductions Processed"
          value={formatINR(totalDeductionsCollected)}
          delta="+14.2% vs last mo"
          icon={<ReceiptIndianRupee className="size-5" />}
          accent
        />
        <MetricCard
          label="Average Fee Margin"
          value={`${avgFeePercent}%`}
          delta="+0.15% yield"
          icon={<Percent className="size-5" />}
        />
        <MetricCard
          label="Active Fee Rules"
          value={String(rules.filter((r) => r.status === "Active").length)}
          icon={<Sliders className="size-5" />}
        />
        <MetricCard
          label="Bank Liaison Recovered"
          value={formatINR(filteredTransactions.filter((t) => t.type === "Bank Pledged").length * 1650)}
          delta="100% cost recovered"
          icon={<Building2 className="size-5" />}
        />
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="rules" className="gap-2">
            <Layers className="size-4" />
            Active Fee Rules & Slabs ({rules.length})
          </TabsTrigger>
          <TabsTrigger value="calculator" className="gap-2">
            <Calculator className="size-4" />
            Live Deduction & Net Payout Simulator
          </TabsTrigger>
          <TabsTrigger value="policy" className="gap-2">
            <ShieldCheck className="size-4" />
            Regulatory Transparency Policy
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: RULES TABLE */}
        <TabsContent value="rules" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Filter Category:</span>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 w-44 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Service Fee">Service Fee</SelectItem>
                  <SelectItem value="Processing">Processing Charges</SelectItem>
                  <SelectItem value="Testing">Testing & Assay</SelectItem>
                  <SelectItem value="Bank Liaison">Bank Liaison</SelectItem>
                  <SelectItem value="Documentation">Documentation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">All deductions are printed on customer settlement vouchers.</p>
          </div>

          <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="p-3 font-semibold">Rule ID & Name</th>
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold">Calculation Basis</th>
                    <th className="p-3 font-semibold">Rate / Value</th>
                    <th className="p-3 font-semibold">Applies To</th>
                    <th className="p-3 font-semibold">GST %</th>
                    <th className="p-3 font-semibold">Effective</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{rule.name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{rule.id}</div>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {rule.category}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-foreground">{rule.type}</td>
                      <td className="p-3 font-bold text-foreground">
                        {rule.type === "Percentage"
                          ? `${rule.value}%`
                          : rule.type === "Fixed Amount"
                          ? formatINR(rule.value)
                          : `₹${rule.value}/g`}
                        {rule.minAmount && (
                          <div className="text-[10px] font-normal text-muted-foreground">
                            Min: {formatINR(rule.minAmount)} · Max: {rule.maxAmount ? formatINR(rule.maxAmount) : "None"}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="text-muted-foreground">{rule.appliesTo}</span>
                      </td>
                      <td className="p-3 font-medium">{rule.taxGstPercent}%</td>
                      <td className="p-3 text-muted-foreground">{rule.effectiveFrom}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            rule.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <span className={`size-1.5 rounded-full ${rule.status === "Active" ? "bg-emerald-600" : "bg-muted-foreground"}`} />
                          {rule.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleRule(rule.id)}
                          className="h-7 text-[11px]"
                        >
                          {rule.status === "Active" ? "Deactivate" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: INTERACTIVE SIMULATOR */}
        <TabsContent value="calculator" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Input Form */}
            <div className="lg:col-span-6 rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Calculator className="size-4 text-primary" />
                <h3 className="font-semibold text-sm">Simulation Parameters</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Transaction Type</label>
                  <Select value={calcType} onValueChange={(v: any) => setCalcType(v)}>
                    <SelectTrigger className="mt-1 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Direct Purchase">Direct Purchase</SelectItem>
                      <SelectItem value="Bank Pledged">Bank Pledged Release</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Precious Metal</label>
                  <Select value={calcMetal} onValueChange={(v: any) => setCalcMetal(v)}>
                    <SelectTrigger className="mt-1 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Gross Wt (grams)</label>
                  <Input
                    type="number"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Number(e.target.value))}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Assay Purity %</label>
                  <Input
                    type="number"
                    value={calcPurity}
                    onChange={(e) => setCalcPurity(Number(e.target.value))}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Rate / Gram (₹)</label>
                  <Input
                    type="number"
                    value={calcRate}
                    onChange={(e) => setCalcRate(Number(e.target.value))}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              {calcType === "Bank Pledged" && (
                <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3">
                  <label className="text-xs font-semibold text-amber-900">
                    Bank Loan Outstanding Amount (Principal + Accrued Interest)
                  </label>
                  <div className="relative mt-1">
                    <IndianRupee className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                    <Input
                      type="number"
                      value={calcBankOutstanding}
                      onChange={(e) => setCalcBankOutstanding(Number(e.target.value))}
                      className="h-9 pl-8 text-xs font-bold"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-amber-800">
                    This amount is disbursed directly to the lending bank by AVP Gold via RTGS/NEFT to release customer metal.
                  </p>
                </div>
              )}

              <div className="pt-2">
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-muted-foreground">Computed Fine Weight:</span>
                  <span className="font-bold text-foreground">{(calcWeight * (calcPurity / 100)).toFixed(3)} grams</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Gross Metal Value:</span>
                  <span className="font-bold text-foreground text-sm">{formatINR(calcGrossValue)}</span>
                </div>
              </div>
            </div>

            {/* Calculated Breakdown Card */}
            <div className="lg:col-span-6 rounded-lg border border-primary/20 bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <ReceiptIndianRupee className="size-4 text-primary" />
                  <h3 className="font-semibold text-sm">Settlement Summary Breakdown</h3>
                </div>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {calcType}
                </span>
              </div>

              <div className="space-y-2 text-xs divide-y divide-border/40">
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">1. Gross Metal Valuation</span>
                  <span className="font-semibold text-foreground">{formatINR(calcGrossValue)}</span>
                </div>

                {calcType === "Bank Pledged" && (
                  <div className="flex justify-between py-1.5 text-amber-900 font-medium">
                    <span className="flex items-center gap-1">
                      <Building2 className="size-3.5 text-amber-700" />
                      2. Less: Bank Outstanding Paid by AVP
                    </span>
                    <span className="font-bold">- {formatINR(calcBankOutstanding)}</span>
                  </div>
                )}

                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">3. Service Margin ({calcType === "Bank Pledged" ? "2.5%" : "1.5%"})</span>
                  <span className="font-medium text-foreground">- {formatINR(calcServiceFee)}</span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">4. Processing & Custody Handling</span>
                  <span className="font-medium text-foreground">- {formatINR(calcProcessingFee)}</span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">5. XRF Spectrometer Purity Assay Fee</span>
                  <span className="font-medium text-foreground">- {formatINR(calcTestingFee)}</span>
                </div>

                {calcType === "Bank Pledged" && (
                  <>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">6. Bank Liaison Officer Conveyance</span>
                      <span className="font-medium text-foreground">- {formatINR(calcBankLiaisonFee)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">7. Legal Authorization & Indemnity</span>
                      <span className="font-medium text-foreground">- {formatINR(calcDocFee)}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">8. GST on Service & Processing (18%)</span>
                  <span className="font-medium text-foreground">- {formatINR(calcGst)}</span>
                </div>

                <div className="flex justify-between py-2 border-t border-border font-bold text-foreground">
                  <span>Total Deductions & Bank Pay</span>
                  <span className="text-destructive">- {formatINR(calcTotalDeductions)}</span>
                </div>
              </div>

              {/* Net Payout Banner */}
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-950 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                    Customer Net Receivable Amount
                  </p>
                  <p className="text-2xl font-bold font-display text-emerald-900 mt-0.5">
                    {formatINR(calcCustomerNetPayout)}
                  </p>
                  <p className="text-[10px] text-emerald-700 mt-1">
                    Disbursed instantly to customer bank account via IMPS/RTGS after verification.
                  </p>
                </div>
                <CheckCircle2 className="size-8 text-emerald-600 shrink-0" />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: POLICY */}
        <TabsContent value="policy">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-base font-semibold">AVP Gold Fair Value & Deductions Code of Conduct</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              In strict accordance with precious metal acquisition guidelines and consumer protection protocols:
            </p>
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded border border-border p-3">
                <div className="font-semibold text-foreground">1. Zero Hidden Haircuts</div>
                <div className="text-muted-foreground mt-1">
                  Purity is calculated strictly from XRF assay certified fine metal weight. Melting losses and wastage are never arbitrarily deducted.
                </div>
              </div>
              <div className="rounded border border-border p-3">
                <div className="font-semibold text-foreground">2. Itemized Bank Reconciliation</div>
                <div className="text-muted-foreground mt-1">
                  Bank payments are verified against the bank loan closure certificate with exact loan reference number, counterfoil, and zero unverified surcharges.
                </div>
              </div>
              <div className="rounded border border-border p-3">
                <div className="font-semibold text-foreground">3. Live Screen Valuation</div>
                <div className="text-muted-foreground mt-1">
                  The entire calculation formula is shown to the customer on the dual-display terminal before obtaining physical signature or OTP consent.
                </div>
              </div>
              <div className="rounded border border-border p-3">
                <div className="font-semibold text-foreground">4. GST Compliant Tax Invoices</div>
                <div className="text-muted-foreground mt-1">
                  GST is levied strictly on actual processing and liaison service charges, never on the base precious metal payout value.
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Rule Dialog */}
      <Dialog open={ruleModalOpen} onOpenChange={setRuleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configure New Charge Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-medium">Rule Name</label>
              <Input placeholder="e.g. Special Festival Processing Waiver" className="mt-1 h-9 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium">Category</label>
                <Select defaultValue="Processing">
                  <SelectTrigger className="mt-1 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Service Fee">Service Fee</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Testing">Testing</SelectItem>
                    <SelectItem value="Bank Liaison">Bank Liaison</SelectItem>
                    <SelectItem value="Commission">Commission</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-medium">Basis</label>
                <Select defaultValue="Percentage">
                  <SelectTrigger className="mt-1 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percentage">Percentage (%)</SelectItem>
                    <SelectItem value="Fixed Amount">Fixed Amount (₹)</SelectItem>
                    <SelectItem value="Per Gram">Per Gram (₹/g)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium">Value</label>
                <Input type="number" placeholder="e.g. 1.75" className="mt-1 h-9 text-xs" />
              </div>
              <div>
                <label className="font-medium">GST Rate %</label>
                <Input type="number" defaultValue="18" className="mt-1 h-9 text-xs" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRuleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setRuleModalOpen(false);
                toast.success("Charge rule created and logged in audit trail");
              }}
            >
              Save Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
