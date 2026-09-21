import React, { useState, useMemo } from "react";
import {
  Gem,
  Coins,
  Landmark,
  Calculator,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Scale,
  ShieldCheck,
  ReceiptIndianRupee,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useERPStore } from "@/lib/erp-store";
import {
  partnerBanks,
  formatINR,
  formatGrams,
  type Metal,
  type Transaction,
  type MetalItem,
} from "@/lib/erp-data";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

interface MetalPurchaseWizardProps {
  metal: Metal;
  onComplete?: () => void;
}

export function MetalPurchaseWizard({ metal, onComplete }: MetalPurchaseWizardProps) {
  const navigate = useNavigate();
  const { customers, rates, selectedBranch, createTransaction } = useERPStore();
  const [step, setStep] = useState(1);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || "");
  const [items, setItems] = useState<MetalItem[]>([
    {
      id: `ITM-TEMP-1`,
      description: metal === "Gold" ? "22K Traditional Gold Bangle" : "925 Sterling Silver Bowl",
      metal,
      grossWeight: metal === "Gold" ? 18.5 : 240,
      stoneWeight: metal === "Gold" ? 0.5 : 0,
      netWeight: metal === "Gold" ? 18.0 : 240,
      purityPercent: metal === "Gold" ? 91.6 : 92.5,
      purityKarat: metal === "Gold" ? "22K" : "925",
      fineWeight: metal === "Gold" ? 16.49 : 222,
      ratePerGram: metal === "Gold" ? 6850 : 87.2,
      grossValue: metal === "Gold" ? 112956 : 19358,
      hallmarked: true,
    },
  ]);

  const [serviceFeePercent, setServiceFeePercent] = useState(1.5);
  const [processingFee, setProcessingFee] = useState(1200);
  const [testingFee, setTestingFee] = useState(450);
  const [commissionPercent, setCommissionPercent] = useState(0.75);
  const [notes, setNotes] = useState("Direct counter purchase of family jewellery. Assayed with spectrometer.");

  const currentRate = useMemo(() => {
    const r = rates.find(
      (rate) => rate.metal === metal && (metal === "Gold" ? rate.purityPercent === 91.6 : rate.purityPercent === 92.5)
    );
    return r?.ratePerGram || (metal === "Gold" ? 6850 : 87.2);
  }, [rates, metal]);

  const customer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Live recalculations
  const summary = useMemo(() => {
    let totalGross = 0;
    let totalNet = 0;
    let totalFine = 0;
    let totalGrossValue = 0;

    items.forEach((item) => {
      totalGross += Number(item.grossWeight) || 0;
      totalNet += Number(item.netWeight) || 0;
      totalFine += Number(item.fineWeight) || 0;
      totalGrossValue += Number(item.grossValue) || 0;
    });

    const serviceFee = Math.round(totalGrossValue * (serviceFeePercent / 100));
    const commission = Math.round(totalGrossValue * (commissionPercent / 100));
    const totalDeductions = serviceFee + processingFee + testingFee + commission;
    const customerPayable = Math.max(0, totalGrossValue - totalDeductions);

    return {
      totalGross: Number(totalGross.toFixed(2)),
      totalNet: Number(totalNet.toFixed(2)),
      totalFine: Number(totalFine.toFixed(2)),
      totalGrossValue,
      serviceFee,
      processingFee,
      testingFee,
      commission,
      totalDeductions,
      customerPayable,
    };
  }, [items, serviceFeePercent, processingFee, testingFee, commissionPercent]);

  const updateItem = (index: number, field: keyof MetalItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (field === "grossWeight" || field === "stoneWeight" || field === "purityPercent" || field === "ratePerGram") {
        const gross = Number(field === "grossWeight" ? value : item.grossWeight) || 0;
        const stone = Number(field === "stoneWeight" ? value : item.stoneWeight) || 0;
        const purity = Number(field === "purityPercent" ? value : item.purityPercent) || 0;
        const rate = Number(field === "ratePerGram" ? value : item.ratePerGram) || 0;

        const net = Math.max(0, gross - stone);
        const fine = Number(((net * purity) / 100).toFixed(2));
        const grossVal = Math.round(fine * rate);

        item.netWeight = net;
        item.fineWeight = fine;
        item.grossValue = grossVal;
      }

      updated[index] = item;
      return updated;
    });
  };

  const addItem = () => {
    const newItem: MetalItem = {
      id: `ITM-TEMP-${items.length + 1}`,
      description: metal === "Gold" ? "Gold Jewellery Item" : "Silver Article",
      metal,
      grossWeight: metal === "Gold" ? 10.0 : 100.0,
      stoneWeight: 0,
      netWeight: metal === "Gold" ? 10.0 : 100.0,
      purityPercent: metal === "Gold" ? 91.6 : 92.5,
      purityKarat: metal === "Gold" ? "22K" : "925",
      fineWeight: metal === "Gold" ? 9.16 : 92.5,
      ratePerGram: currentRate,
      grossValue: Math.round((metal === "Gold" ? 9.16 : 92.5) * currentRate),
      hallmarked: true,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) {
      toast.error("At least one item is required.");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    const branch = selectedBranch === "All Branches" ? customer.branch : selectedBranch;
    const newTxnId = `AVP-PUR-${metal === "Gold" ? "G" : "S"}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newTxn: Transaction = {
      id: newTxnId,
      customerId: customer.id,
      customerName: customer.name,
      customerMobile: customer.mobile,
      branch,
      metal,
      type: "Old Metal Purchase",
      items,
      totalGrossWeight: summary.totalGross,
      totalNetWeight: summary.totalNet,
      averagePurity: items[0]?.purityPercent || 91.6,
      totalFineWeight: summary.totalFine,
      applicableRate: currentRate,
      grossMetalValue: summary.totalGrossValue,
      serviceFee: summary.serviceFee,
      processingFee: summary.processingFee,
      testingFee: summary.testingFee,
      bankExpenses: 0,
      commission: summary.commission,
      otherDeductions: 0,
      totalDeductions: summary.totalDeductions,
      customerPayable: summary.customerPayable,
      status: "Valuation",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST",
      assignedAppraiser: "K. Venkatesh",
      settlementStatus: "Ready for Payment",
      packetId: `PKT-${Math.floor(800 + Math.random() * 200)}`,
      vaultLocation: `${branch} Vault · Slot A-03`,
      notes,
    };

    createTransaction(newTxn);
    if (onComplete) onComplete();
    navigate({ to: metal === "Gold" ? "/gold-purchase" : "/silver-purchase" });
  };

  return (
    <div className="max-w-4xl mx-auto border border-border bg-card shadow-sm rounded-md p-6">
      {/* Wizard Step Indicator */}
      <div className="flex items-center justify-between border-b border-border pb-5 mb-6">
        <div>
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
            Step {step} of 4
          </span>
          <h2 className="font-display text-xl font-bold text-foreground mt-1 flex items-center gap-2">
            {metal === "Gold" ? <Gem className="size-5 text-primary" /> : <Coins className="size-5 text-slate-500" />}
            New {metal} Purchase Workflow
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`size-7 rounded-full flex items-center justify-center ${
                s === step
                  ? "bg-primary text-primary-foreground font-bold"
                  : s < step
                  ? "bg-success text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s < step ? "✓" : s}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Customer Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground">Step 1: Select & Verify Customer</h3>
          <div>
            <Label className="text-xs font-semibold">Customer</Label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className="mt-1 h-10 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.id}) · {c.mobile} · KYC: {c.kycStatus}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-muted/40 rounded-md border border-border grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Customer Name</p>
              <p className="font-bold text-foreground mt-0.5">{customer.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Mobile</p>
              <p className="font-bold text-foreground mt-0.5">{customer.mobile}</p>
            </div>
            <div>
              <p className="text-muted-foreground">KYC Status</p>
              <p className="font-bold text-success mt-0.5">{customer.kycStatus}</p>
            </div>
            <div>
              <p className="text-muted-foreground">ID Type & Number</p>
              <p className="font-mono text-foreground mt-0.5">{customer.idType}: {customer.idNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Home Branch</p>
              <p className="text-foreground mt-0.5">{customer.branch}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Prior Transactions</p>
              <p className="font-bold text-foreground mt-0.5">{customer.totalTransactions} completed</p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Metal Items & Weights */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Step 2: Enter Metal Items & Scale Weights</h3>
            <Button size="sm" variant="outline" onClick={addItem} className="h-8 gap-1 text-xs">
              <Plus className="size-3.5" /> Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id} className="p-3 border border-border rounded-md bg-muted/20 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Item #{idx + 1}</span>
                  {items.length > 1 && (
                    <Button size="icon" variant="ghost" className="size-6 text-destructive" onClick={() => removeItem(idx)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="sm:col-span-2">
                    <Label className="text-[11px]">Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(idx, "description", e.target.value)}
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px]">Gross Weight (g)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.grossWeight}
                      onChange={(e) => updateItem(idx, "grossWeight", e.target.value)}
                      className="h-8 text-xs mt-1 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px]">Stone/Dirt Wt (g)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.stoneWeight}
                      onChange={(e) => updateItem(idx, "stoneWeight", e.target.value)}
                      className="h-8 text-xs mt-1 font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
                  <div>
                    <Label className="text-[11px]">Net Weight</Label>
                    <div className="h-8 rounded border border-input bg-background px-2.5 flex items-center font-mono font-bold text-xs mt-1">
                      {item.netWeight} g
                    </div>
                  </div>
                  <div>
                    <Label className="text-[11px]">Purity %</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={item.purityPercent}
                      onChange={(e) => updateItem(idx, "purityPercent", e.target.value)}
                      className="h-8 text-xs mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px]">Fine Metal (g)</Label>
                    <div className="h-8 rounded border border-input bg-background px-2.5 flex items-center font-mono font-bold text-xs mt-1 text-primary">
                      {item.fineWeight} g
                    </div>
                  </div>
                  <div>
                    <Label className="text-[11px]">Gross Value</Label>
                    <div className="h-8 rounded border border-input bg-background px-2.5 flex items-center font-mono font-bold text-xs mt-1">
                      {formatINR(item.grossValue)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-muted rounded-md flex items-center justify-between text-xs font-bold">
            <span>Total Fine Metal: <span className="font-mono text-primary">{summary.totalFine} g</span></span>
            <span>Total Gross Value: <span className="font-mono">{formatINR(summary.totalGrossValue)}</span></span>
          </div>
        </div>
      )}

      {/* STEP 3: Charges & Transparent Deductions */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground">Step 3: Charges & Transparent Deductions</h3>
          <p className="text-xs text-muted-foreground">
            AVP Gold maintains 100% transparent fee disclosure. Every deduction is itemized before customer payout.
          </p>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <Label className="text-xs">Service Charge (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={serviceFeePercent}
                onChange={(e) => setServiceFeePercent(Number(e.target.value))}
                className="h-9 mt-1 text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Amount: {formatINR(summary.serviceFee)}</p>
            </div>

            <div>
              <Label className="text-xs">Processing Fee (₹ Flat)</Label>
              <Input
                type="number"
                value={processingFee}
                onChange={(e) => setProcessingFee(Number(e.target.value))}
                className="h-9 mt-1 text-xs font-mono"
              />
            </div>

            <div>
              <Label className="text-xs">Testing & Assay Fee (₹ Flat)</Label>
              <Input
                type="number"
                value={testingFee}
                onChange={(e) => setTestingFee(Number(e.target.value))}
                className="h-9 mt-1 text-xs font-mono"
              />
            </div>

            <div>
              <Label className="text-xs">Appraisal Commission (%)</Label>
              <Input
                type="number"
                step="0.05"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(Number(e.target.value))}
                className="h-9 mt-1 text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Amount: {formatINR(summary.commission)}</p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-md border border-amber-200 text-xs space-y-2">
            <div className="flex justify-between font-semibold text-slate-800">
              <span>Gross Metal Valuation:</span>
              <span className="font-mono">{formatINR(summary.totalGrossValue)}</span>
            </div>
            <div className="flex justify-between text-red-700">
              <span>Total Deductions (Fees & Commission):</span>
              <span className="font-mono">− {formatINR(summary.totalDeductions)}</span>
            </div>
            <div className="border-t border-amber-300 pt-2 flex justify-between font-bold text-sm text-amber-950">
              <span>Net Payable to Customer:</span>
              <span className="font-mono font-display text-base text-primary">{formatINR(summary.customerPayable)}</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Review & Confirm */}
      {step === 4 && (
        <div className="space-y-4 text-xs">
          <h3 className="text-sm font-bold text-foreground">Step 4: Final Summary & Submit to Valuation</h3>
          <div className="border border-border rounded-md p-4 bg-muted/20 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Customer</p>
                <p className="font-bold text-foreground">{customer.name} ({customer.id})</p>
                <p className="text-muted-foreground">{customer.mobile}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Branch Custody</p>
                <p className="font-bold text-foreground">{selectedBranch === "All Branches" ? customer.branch : selectedBranch}</p>
                <p className="text-muted-foreground">Assayed with Niton XRF Spectrometer</p>
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <p className="font-bold text-foreground mb-1">Metal Items Summary</p>
              <p>{items.length} item(s) · Gross Wt: {summary.totalGross}g · Net Wt: {summary.totalNet}g · Fine: {summary.totalFine}g</p>
            </div>

            <div className="border-t border-border pt-3 flex justify-between items-center bg-card p-3 rounded border">
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Total Customer Settlement</p>
                <p className="font-display text-xl font-black text-primary font-mono">{formatINR(summary.customerPayable)}</p>
              </div>
              <span className="rounded bg-success-muted px-2.5 py-1 text-xs font-bold text-success">
                Ready for Settlement
              </span>
            </div>
          </div>

          <div>
            <Label className="text-xs">Appraisal & Operational Notes</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 h-9 text-xs"
            />
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center border-t border-border pt-5 mt-6">
        <Button
          variant="outline"
          size="sm"
          disabled={step === 1}
          onClick={() => setStep((s) => s - 1)}
          className="gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="size-3.5" /> Back
        </Button>

        {step < 4 ? (
          <Button size="sm" onClick={() => setStep((s) => s + 1)} className="gap-1.5 text-xs font-semibold">
            Next Step <ArrowRight className="size-3.5" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleSubmit} className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground">
            <CheckCircle2 className="size-4" /> Create & Submit Purchase
          </Button>
        )}
      </div>
    </div>
  );
}

interface BankPledgedWizardProps {
  metal: Metal;
  onComplete?: () => void;
}

export function BankPledgedWizard({ metal, onComplete }: BankPledgedWizardProps) {
  const navigate = useNavigate();
  const { customers, rates, selectedBranch, createTransaction } = useERPStore();
  const [step, setStep] = useState(1);

  // Customer state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || "");
  const customer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Bank loan state
  const [bankName, setBankName] = useState(partnerBanks[0].name);
  const [bankBranch, setBankBranch] = useState("Hyderabad Somajiguda Branch");
  const [loanAccountNumber, setLoanAccountNumber] = useState(`GL/SBIN/${Math.floor(20260000 + Math.random() * 9999)}`);
  const [pledgeReference, setPledgeReference] = useState(`PLG-SBIN-${Math.floor(8000 + Math.random() * 1999)}`);
  const [originalLoanAmount, setOriginalLoanAmount] = useState(120000);
  const [bankInterestAmount, setBankInterestAmount] = useState(8500);
  const [bankConveyanceFee, setBankConveyanceFee] = useState(2500);

  // Metal state
  const [grossWeight, setGrossWeight] = useState(metal === "Gold" ? 28.5 : 450);
  const [stoneWeight, setStoneWeight] = useState(metal === "Gold" ? 0.8 : 0);
  const [expectedPurity, setExpectedPurity] = useState(metal === "Gold" ? 91.6 : 92.5);

  const ratePerGram = metal === "Gold" ? 6850 : 87.2;

  // Calculation summary
  const bankOutstanding = originalLoanAmount + bankInterestAmount;
  const netWeight = Math.max(0, grossWeight - stoneWeight);
  const fineWeight = Number(((netWeight * expectedPurity) / 100).toFixed(2));
  const grossMetalValue = Math.round(fineWeight * ratePerGram);

  const serviceFee = Math.round(grossMetalValue * 0.015);
  const processingFee = 1200;
  const testingFee = 450;
  const commission = Math.round(grossMetalValue * 0.0075);

  const totalDeductions = bankOutstanding + serviceFee + processingFee + testingFee + bankConveyanceFee + commission;
  const customerPayable = Math.max(0, grossMetalValue - totalDeductions);

  const handleSubmit = () => {
    const branch = selectedBranch === "All Branches" ? customer.branch : selectedBranch;
    const newTxnId = `AVP-BP${metal === "Gold" ? "G" : "S"}-${Math.floor(100000 + Math.random() * 900000)}`;

    const items: MetalItem[] = [
      {
        id: `ITM-BP-${Math.floor(5000 + Math.random() * 4000)}`,
        description: `${metal} Pledged Jewellery Packets released from ${bankName}`,
        metal,
        grossWeight,
        stoneWeight,
        netWeight,
        purityPercent: expectedPurity,
        purityKarat: metal === "Gold" ? "22K" : "925",
        fineWeight,
        ratePerGram,
        grossValue: grossMetalValue,
        hallmarked: true,
      },
    ];

    const newTxn: Transaction = {
      id: newTxnId,
      customerId: customer.id,
      customerName: customer.name,
      customerMobile: customer.mobile,
      branch,
      metal,
      type: "Bank Pledged",
      items,
      totalGrossWeight: grossWeight,
      totalNetWeight: netWeight,
      averagePurity: expectedPurity,
      totalFineWeight: fineWeight,
      applicableRate: ratePerGram,
      grossMetalValue,
      bankName,
      bankBranch,
      loanAccountNumber,
      pledgeReference,
      originalLoanAmount,
      bankOutstandingAmount: bankOutstanding,
      bankInterestAmount,
      bankPaymentAmount: bankOutstanding,
      serviceFee,
      processingFee,
      testingFee,
      bankExpenses: bankConveyanceFee,
      commission,
      otherDeductions: 0,
      totalDeductions,
      customerPayable,
      status: "Approved",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST",
      assignedAppraiser: "K. Venkatesh",
      approvedBy: "R. Srinivas",
      approvalDate: new Date().toLocaleDateString("en-GB"),
      settlementStatus: "Ready for Payment",
      packetId: `PKT-${Math.floor(800 + Math.random() * 200)}`,
      vaultLocation: `${branch} Vault · Slot B-07`,
      notes: `Bank-pledged loan payoff authorized. AVP liaison deployed to ${bankName} to clear outstanding of ₹${(bankOutstanding/100000).toFixed(2)}L and receive metal.`,
    };

    createTransaction(newTxn);
    if (onComplete) onComplete();
    navigate({ to: metal === "Gold" ? "/bank-pledged-gold" : "/bank-pledged-silver" });
  };

  return (
    <div className="max-w-4xl mx-auto border border-border bg-card shadow-sm rounded-md p-6">
      <div className="flex items-center justify-between border-b border-border pb-5 mb-6">
        <div>
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
            Bank Pledged {metal} Release Intake · Step {step} of 4
          </span>
          <h2 className="font-display text-xl font-bold text-foreground mt-1 flex items-center gap-2">
            <Landmark className="size-5 text-primary" />
            Bank-Pledged {metal} Acquisition & Settlement
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`size-7 rounded-full flex items-center justify-center ${
                s === step
                  ? "bg-primary text-primary-foreground font-bold"
                  : s < step
                  ? "bg-success text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s < step ? "✓" : s}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Customer */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground">Step 1: Borrower / Customer Verification</h3>
          <div>
            <Label className="text-xs font-semibold">Borrower Name & ID</Label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className="mt-1 h-10 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.id}) · {c.mobile} · {c.branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-muted/30 rounded-md border border-border grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Borrower</p>
              <p className="font-bold text-foreground mt-0.5">{customer.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Mobile Contact</p>
              <p className="font-bold text-foreground mt-0.5">{customer.mobile}</p>
            </div>
            <div>
              <p className="text-muted-foreground">KYC Status</p>
              <p className="font-bold text-success mt-0.5">{customer.kycStatus}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Identity Proof</p>
              <p className="font-mono text-foreground mt-0.5">{customer.idType}: {customer.idNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Current Branch</p>
              <p className="text-foreground mt-0.5">{customer.branch}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Pledged History</p>
              <p className="font-bold text-foreground mt-0.5">Eligible for Bank Payoff</p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Bank & Loan Details */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground">Step 2: Bank Loan Particulars & Payoff Wire Amount</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <Label className="text-xs">Financing Bank</Label>
              <Select value={bankName} onValueChange={setBankName}>
                <SelectTrigger className="mt-1 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {partnerBanks.map((b) => (
                    <SelectItem key={b.code} value={b.name}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Bank Branch Location</Label>
              <Input
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Bank Loan Account Number</Label>
              <Input
                value={loanAccountNumber}
                onChange={(e) => setLoanAccountNumber(e.target.value)}
                className="mt-1 h-9 text-xs font-mono"
              />
            </div>

            <div>
              <Label className="text-xs">Pledge Reference / Receipt No.</Label>
              <Input
                value={pledgeReference}
                onChange={(e) => setPledgeReference(e.target.value)}
                className="mt-1 h-9 text-xs font-mono"
              />
            </div>

            <div>
              <Label className="text-xs">Principal Loan Amount (₹)</Label>
              <Input
                type="number"
                value={originalLoanAmount}
                onChange={(e) => setOriginalLoanAmount(Number(e.target.value))}
                className="mt-1 h-9 text-xs font-mono"
              />
            </div>

            <div>
              <Label className="text-xs">Accrued Interest / Penalties (₹)</Label>
              <Input
                type="number"
                value={bankInterestAmount}
                onChange={(e) => setBankInterestAmount(Number(e.target.value))}
                className="mt-1 h-9 text-xs font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs flex items-center justify-between">
            <span className="text-red-900 font-semibold">Total Bank Payoff Wire Required:</span>
            <span className="font-mono text-base font-bold text-red-950">{formatINR(bankOutstanding)}</span>
          </div>
        </div>
      )}

      {/* STEP 3: Pledged Metal Estimates */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground">Step 3: Pledged Metal Appraisal & Value Estimation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <Label className="text-xs">Pledged Gross Weight (g)</Label>
              <Input
                type="number"
                step="0.01"
                value={grossWeight}
                onChange={(e) => setGrossWeight(Number(e.target.value))}
                className="mt-1 h-9 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <Label className="text-xs">Estimated Stone / Enamel (g)</Label>
              <Input
                type="number"
                step="0.01"
                value={stoneWeight}
                onChange={(e) => setStoneWeight(Number(e.target.value))}
                className="mt-1 h-9 text-xs font-mono"
              />
            </div>

            <div>
              <Label className="text-xs">Expected Purity (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={expectedPurity}
                onChange={(e) => setExpectedPurity(Number(e.target.value))}
                className="mt-1 h-9 text-xs font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-muted rounded-md grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Net Metal Weight</p>
              <p className="font-mono font-bold text-foreground">{netWeight} g</p>
            </div>
            <div>
              <p className="text-muted-foreground">Pure Fine Metal</p>
              <p className="font-mono font-bold text-primary">{fineWeight} g</p>
            </div>
            <div>
              <p className="text-muted-foreground">Market Gross Valuation</p>
              <p className="font-mono font-bold text-foreground">{formatINR(grossMetalValue)}</p>
            </div>
          </div>

          <div className="border border-border rounded p-3 text-xs space-y-1.5">
            <p className="font-bold text-foreground">AVP Deductions Breakdown</p>
            <div className="flex justify-between text-muted-foreground">
              <span>Service Fee (1.5%):</span>
              <span className="font-mono">{formatINR(serviceFee)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Processing & Legal Check:</span>
              <span className="font-mono">{formatINR(processingFee)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>XRF Spectrometer Assay Fee:</span>
              <span className="font-mono">{formatINR(testingFee)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Bank Liaison Escort & Conveyance:</span>
              <span className="font-mono">{formatINR(bankConveyanceFee)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Appraisal Commission (0.75%):</span>
              <span className="font-mono">{formatINR(commission)}</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Financial Settlement Summary */}
      {step === 4 && (
        <div className="space-y-4 text-xs">
          <h3 className="text-sm font-bold text-foreground">Step 4: Review Bank Settlement & Net Customer Surplus</h3>
          <div className="border border-border rounded-md p-4 bg-muted/20 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Financing Bank</p>
                <p className="font-bold text-foreground">{bankName} ({bankBranch})</p>
                <p className="font-mono text-muted-foreground">Loan A/c: {loanAccountNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">AVP Settlement Escort</p>
                <p className="font-bold text-foreground">Authorized Liaison Officer</p>
                <p className="text-muted-foreground">RTGS Payment to Bank Clearing A/c</p>
              </div>
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Metal Valuation:</span>
                <span className="font-mono font-bold text-foreground">{formatINR(grossMetalValue)}</span>
              </div>
              <div className="flex justify-between text-red-700 font-semibold">
                <span>(−) Bank Outstanding Payoff (Cleared by AVP):</span>
                <span className="font-mono">− {formatINR(bankOutstanding)}</span>
              </div>
              <div className="flex justify-between text-red-700">
                <span>(−) Total AVP Service & Conveyance Charges:</span>
                <span className="font-mono">− {formatINR(serviceFee + processingFee + testingFee + bankConveyanceFee + commission)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-sm bg-card p-3 rounded">
                <span className="text-amber-950 font-display">Remaining Surplus Payable to Customer:</span>
                <span className="font-mono text-primary text-base font-black">{formatINR(customerPayable)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center border-t border-border pt-5 mt-6">
        <Button
          variant="outline"
          size="sm"
          disabled={step === 1}
          onClick={() => setStep((s) => s - 1)}
          className="gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="size-3.5" /> Back
        </Button>

        {step < 4 ? (
          <Button size="sm" onClick={() => setStep((s) => s + 1)} className="gap-1.5 text-xs font-semibold">
            Next Step <ArrowRight className="size-3.5" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleSubmit} className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground">
            <CheckCircle2 className="size-4" /> Authorize Bank Payoff & Intake
          </Button>
        )}
      </div>
    </div>
  );
}
