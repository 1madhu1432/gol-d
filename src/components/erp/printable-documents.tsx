import React from "react";
import { Printer, X, Gem, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatINR, formatGrams, type Transaction } from "@/lib/erp-data";

interface PrintableDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType:
    | "Purchase Receipt"
    | "Valuation Sheet"
    | "Settlement Statement"
    | "Payment Receipt"
    | "Bank Payment Proof"
    | "Packet Receipt"
    | "Branch Transfer Document"
    | "Inventory Receipt";
  transaction: Transaction;
}

export function PrintableDocumentModal({
  open,
  onOpenChange,
  documentType,
  transaction: t,
}: PrintableDocumentModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 border border-border">
        {/* Action bar (hidden in print) */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-3 no-print">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
              Print Preview
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              {documentType} · Ref: {t.id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="gap-1.5 text-xs font-bold">
              <Printer className="size-3.5" />
              Print Document
            </Button>
            <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>

        {/* PRINTABLE SHEET CONTAINER (A4 format styled) */}
        <div className="p-8 sm:p-10 bg-white text-slate-900 font-sans text-xs print:p-0">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center bg-slate-900 text-white rounded">
                  <Gem className="size-5 text-amber-400" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-black tracking-tight text-slate-900">
                    AVP GOLD PRIVATE LIMITED
                  </h1>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                    Precious Metals Division · Multi-Branch Operations
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 mt-2 max-w-sm">
                Corporate Office: Road No. 36, Jubilee Hills, Hyderabad - 500033. GSTIN: 36AABCA1234F1Z8 | CIN: U36911TG2020PTC148900
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded border border-slate-900 px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-slate-100">
                {documentType}
              </span>
              <p className="font-mono text-xs font-bold mt-2">DOC #: {t.id}</p>
              <p className="text-[10px] text-slate-600">Date: {t.date} · {t.time}</p>
              <p className="text-[10px] text-slate-600">Branch: {t.branch} Branch</p>
            </div>
          </div>

          {/* Customer & Bank Details */}
          <div className="grid grid-cols-2 gap-6 my-5 p-3.5 bg-slate-50 rounded border border-slate-200">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Customer Details</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{t.customerName}</p>
              <p className="text-[11px] text-slate-700">Customer ID: {t.customerId}</p>
              <p className="text-[11px] text-slate-700">Contact: {t.customerMobile}</p>
              <p className="text-[10px] text-slate-600">Branch: {t.branch}</p>
            </div>

            {t.type === "Bank Pledged" ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bank & Loan Redemption</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{t.bankName}</p>
                <p className="text-[11px] text-slate-700">Loan A/c: {t.loanAccountNumber}</p>
                <p className="text-[11px] text-slate-700">Pledge Ref: {t.pledgeReference}</p>
                <p className="text-[10px] text-slate-600">Bank UTR: {t.bankPaymentRef || "Pending"}</p>
              </div>
            ) : (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Transaction Classification</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">Old Precious Metal Purchase</p>
                <p className="text-[11px] text-slate-700">Assay Method: Niton XRF Spectrometer</p>
                <p className="text-[11px] text-slate-700">Assigned Appraiser: {t.assignedAppraiser}</p>
                <p className="text-[10px] text-slate-600">Packet Ref: {t.packetId}</p>
              </div>
            )}
          </div>

          {/* Metal Items Table */}
          <div className="my-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              Physical Metal Assay & Valuation Breakdown
            </p>
            <table className="w-full text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 text-left">Item Description</th>
                  <th className="p-2 text-right">Gross Wt</th>
                  <th className="p-2 text-right">Stone / Dross</th>
                  <th className="p-2 text-right">Net Wt</th>
                  <th className="p-2 text-right">Assayed Purity</th>
                  <th className="p-2 text-right">Fine Metal</th>
                  <th className="p-2 text-right">Rate / g</th>
                  <th className="p-2 text-right">Gross Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {t.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2 font-medium">{item.description}</td>
                    <td className="p-2 text-right font-mono">{formatGrams(item.grossWeight)}</td>
                    <td className="p-2 text-right font-mono">{formatGrams(item.stoneWeight)}</td>
                    <td className="p-2 text-right font-mono font-bold">{formatGrams(item.netWeight)}</td>
                    <td className="p-2 text-right font-mono font-bold text-amber-800">{item.purityPercent}% ({item.purityKarat})</td>
                    <td className="p-2 text-right font-mono font-bold">{formatGrams(item.fineWeight)}</td>
                    <td className="p-2 text-right font-mono">₹{item.ratePerGram.toLocaleString("en-IN")}</td>
                    <td className="p-2 text-right font-mono font-bold">{formatINR(item.grossValue)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-300">
                <tr>
                  <td className="p-2">TOTALS</td>
                  <td className="p-2 text-right font-mono">{formatGrams(t.totalGrossWeight)}</td>
                  <td className="p-2 text-right font-mono">—</td>
                  <td className="p-2 text-right font-mono">{formatGrams(t.totalNetWeight)}</td>
                  <td className="p-2 text-right font-mono">{t.averagePurity}% Avg</td>
                  <td className="p-2 text-right font-mono">{formatGrams(t.totalFineWeight)}</td>
                  <td className="p-2 text-right font-mono">—</td>
                  <td className="p-2 text-right font-mono text-sm text-slate-950">{formatINR(t.grossMetalValue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Transparent Valuation & Deductions Calculation */}
          <div className="my-5 border border-slate-300 rounded p-4 bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 mb-3">
              Transparent Financial Settlement Statement
            </h3>
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Gross Assayed Metal Value:</span>
                  <span className="font-mono font-bold text-slate-900">{formatINR(t.grossMetalValue)}</span>
                </div>
                {t.type === "Bank Pledged" && (
                  <div className="flex justify-between text-red-700 font-semibold">
                    <span>(−) Bank Loan Payoff Wired to {t.bankName}:</span>
                    <span className="font-mono">{formatINR(t.bankPaymentAmount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-red-700">
                  <span>(−) AVP Service Charge (1.5%):</span>
                  <span className="font-mono">{formatINR(t.serviceFee)}</span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>(−) Processing & Legal Check Fee:</span>
                  <span className="font-mono">{formatINR(t.processingFee)}</span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>(−) Laboratory XRF Assay Fee:</span>
                  <span className="font-mono">{formatINR(t.testingFee)}</span>
                </div>
                {t.type === "Bank Pledged" && (
                  <div className="flex justify-between text-red-700">
                    <span>(−) Bank Conveyance & Liaison Escort:</span>
                    <span className="font-mono">{formatINR(t.bankExpenses)}</span>
                  </div>
                )}
                <div className="flex justify-between text-red-700">
                  <span>(−) Operations Commission (0.75%):</span>
                  <span className="font-mono">{formatINR(t.commission)}</span>
                </div>
                {t.otherDeductions > 0 && (
                  <div className="flex justify-between text-red-700">
                    <span>(−) Other Approved Deductions:</span>
                    <span className="font-mono">{formatINR(t.otherDeductions)}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between border-l border-slate-200 pl-6">
                <div>
                  <div className="flex justify-between text-slate-600 text-xs">
                    <span>Total Authorized Deductions:</span>
                    <span className="font-mono font-bold text-red-800">{formatINR(t.totalDeductions)}</span>
                  </div>
                  <div className="mt-4 p-3 bg-amber-50 rounded border border-amber-300">
                    <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                      Net Amount Payable to Customer
                    </p>
                    <p className="font-display text-xl font-black text-amber-950 font-mono mt-0.5">
                      {formatINR(t.customerPayable)}
                    </p>
                    <p className="text-[10px] text-amber-800 mt-1">
                      Mode: {t.paymentMethod || "Bank Transfer"} | Ref: {t.paymentReference || "Direct Account Transfer"}
                    </p>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-3">
                  * All deductions have been verified against certified standards and agreed upon prior to metal receipt and payout.
                </div>
              </div>
            </div>
          </div>

          {/* Legal Declarations & Signatures */}
          <div className="mt-8 pt-4 border-t border-slate-300">
            <p className="text-[9px] text-slate-500 leading-relaxed">
              <strong>Customer Declaration:</strong> I hereby declare that the precious metals described above are my absolute property, free from any encumbrances, litigation, or criminal liability. I confirm receipt of the full settlement amount as detailed herein after all applicable bank payoff and service deductions.
            </p>
            <div className="grid grid-cols-3 gap-6 mt-12 text-center">
              <div className="border-t border-slate-400 pt-1.5">
                <p className="font-bold text-slate-900 text-xs">{t.customerName}</p>
                <p className="text-[10px] text-slate-500">Customer Signature / Thumb</p>
              </div>
              <div className="border-t border-slate-400 pt-1.5">
                <p className="font-bold text-slate-900 text-xs">{t.assignedAppraiser}</p>
                <p className="text-[10px] text-slate-500">Certified Assayer & Appraiser</p>
              </div>
              <div className="border-t border-slate-400 pt-1.5">
                <p className="font-bold text-slate-900 text-xs">{t.approvedBy || "R. Srinivas"}</p>
                <p className="text-[10px] text-slate-500">Authorized Branch Officer</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
