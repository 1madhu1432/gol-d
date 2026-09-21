import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Settings,
  Building2,
  Sliders,
  ShieldCheck,
  Printer,
  Camera,
  Scale,
  Save,
  Bell,
  Lock,
  Globe,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, MetricCard } from "@/components/erp/ui";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [saveLoading, setSaveLoading] = useState(false);

  // Settings states
  const [companyName, setCompanyName] = useState("AVP Gold Enterprises Pvt. Ltd.");
  const [gstin, setGstin] = useState("36AAACA1234F1Z8");
  const [cinNumber, setCinNumber] = useState("U27205TG2020PTC148920");
  const [maxCashLimit, setMaxCashLimit] = useState(10000);
  const [dualApprovalThreshold, setDualApprovalThreshold] = useState(500000);
  const [scaleTolerance, setScaleTolerance] = useState(0.01);
  const [autoRateRefresh, setAutoRateRefresh] = useState(true);
  const [requirePhotoEvidence, setRequirePhotoEvidence] = useState(true);
  const [sendCustomerSMS, setSendCustomerSMS] = useState(true);
  const [enforceGeofencing, setEnforceGeofencing] = useState(true);

  const handleSave = () => {
    setSaveLoading(true);
    setTimeout(() => {
      setSaveLoading(false);
      toast.success("Master settings saved and applied to all branches");
    }, 600);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System Configuration"
        title="Master Settings & Enterprise Parameters"
        description="Configure entity licenses, statutory cash disbursement limits, digital scale COM ports, XRF spectrometer bridges, and dual-custody vault security."
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={saveLoading} className="gap-1.5 shadow-sm">
              <Save className="size-4" />
              {saveLoading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="size-4" />
            Company & License Profile
          </TabsTrigger>
          <TabsTrigger value="thresholds" className="gap-2">
            <Sliders className="size-4" />
            Operational & Statutory Limits
          </TabsTrigger>
          <TabsTrigger value="hardware" className="gap-2">
            <Printer className="size-4" />
            Hardware & Lab Device Integrations
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <ShieldCheck className="size-4" />
            Security & Audit Controls
          </TabsTrigger>
          <TabsTrigger value="pwa" className="gap-2">
            <Smartphone className="size-4" />
            PWA & Offline Readiness
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: COMPANY PROFILE */}
        <TabsContent value="general" className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
            <h3 className="font-semibold text-sm text-foreground border-b border-border pb-3">
              Precious Metal Enterprise Entity Details
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="font-medium text-muted-foreground">Registered Business Name</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1 h-9 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-medium text-muted-foreground">GSTIN (Telangana / Andhra Pradesh)</label>
                <Input
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="mt-1 h-9 text-xs font-mono font-semibold"
                />
              </div>

              <div>
                <label className="font-medium text-muted-foreground">Corporate Identification Number (CIN)</label>
                <Input
                  value={cinNumber}
                  onChange={(e) => setCinNumber(e.target.value)}
                  className="mt-1 h-9 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-muted-foreground">BIS Precious Metal Assay Registration</label>
                <Input defaultValue="BIS-HM-AP-2024-9182" className="mt-1 h-9 text-xs font-mono" />
              </div>

              <div className="sm:col-span-2">
                <label className="font-medium text-muted-foreground">Headquarters Registered Address</label>
                <Input
                  defaultValue="AVP Towers, Road No. 36, Jubilee Hills, Hyderabad, Telangana - 500033"
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-muted-foreground">Customer Grievance & Toll-Free Desk</label>
                <Input defaultValue="1800-425-AVP-GOLD (1800-425-2874)" className="mt-1 h-9 text-xs font-mono" />
              </div>

              <div>
                <label className="font-medium text-muted-foreground">Finance & Bank Escrow Desk Email</label>
                <Input defaultValue="treasury@avpgold.com" className="mt-1 h-9 text-xs font-mono" />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: OPERATIONAL THRESHOLDS */}
        <TabsContent value="thresholds" className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
            <h3 className="font-semibold text-sm text-foreground border-b border-border pb-3">
              Risk & Approval Threshold Configuration
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded border border-border p-3 space-y-2">
                <div className="font-semibold text-foreground">Cash Disbursement Statutory Ceiling</div>
                <p className="text-[11px] text-muted-foreground">
                  Under Income Tax Section 269ST, physical cash payout to any customer per day must not exceed ₹10,000. All remaining balances are disbursed electronically via IMPS/RTGS.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-bold text-sm">₹</span>
                  <Input
                    type="number"
                    value={maxCashLimit}
                    onChange={(e) => setMaxCashLimit(Number(e.target.value))}
                    className="h-9 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="rounded border border-border p-3 space-y-2">
                <div className="font-semibold text-foreground">High-Value Dual-Approval Trigger</div>
                <p className="text-[11px] text-muted-foreground">
                  Transactions with gross metal value exceeding this limit automatically require secondary authorization by a Super Admin / Zonal Head before bank or customer disbursement.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-bold text-sm">₹</span>
                  <Input
                    type="number"
                    value={dualApprovalThreshold}
                    onChange={(e) => setDualApprovalThreshold(Number(e.target.value))}
                    className="h-9 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="rounded border border-border p-3 space-y-2">
                <div className="font-semibold text-foreground">Digital Scale Tolerance Limit (Grams)</div>
                <p className="text-[11px] text-muted-foreground">
                  Maximum allowable variance between branch intake electronic scale and lab spectrometer assay weight before flagging an audit mismatch.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-bold text-sm">±</span>
                  <Input
                    type="number"
                    step="0.001"
                    value={scaleTolerance}
                    onChange={(e) => setScaleTolerance(Number(e.target.value))}
                    className="h-9 text-xs font-bold"
                  />
                  <span className="text-muted-foreground font-semibold">g</span>
                </div>
              </div>

              <div className="rounded border border-border p-3 space-y-2">
                <div className="font-semibold text-foreground">Automated Rate Syncing</div>
                <p className="text-[11px] text-muted-foreground">
                  Periodically poll the Indian Bullion and Jewellers Association (IBJA) & MCX spot metal feeds every 15 minutes during trading hours.
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-medium text-foreground">Live Feed Active</span>
                  <Switch checked={autoRateRefresh} onCheckedChange={setAutoRateRefresh} />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: HARDWARE INTEGRATIONS */}
        <TabsContent value="hardware" className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
            <h3 className="font-semibold text-sm text-foreground border-b border-border pb-3">
              Lab Testing Equipment & Branch Peripherals
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between rounded border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded bg-primary/10 text-primary">
                    <Scale className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Mettler Toledo Precision Electronic Scale</p>
                    <p className="text-muted-foreground text-[11px]">COM Port 3 · Baud Rate 9600 · Automatic tare & read on weight settle</p>
                  </div>
                </div>
                <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Connected & Calibrated
                </span>
              </div>

              <div className="flex items-center justify-between rounded border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded bg-primary/10 text-primary">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Thermo Scientific Niton XRF Spectrometer Assay</p>
                    <p className="text-muted-foreground text-[11px]">IP 192.168.10.84 · Automated JSON assay spectra import directly into ERP item ledger</p>
                  </div>
                </div>
                <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Online (Ready)
                </span>
              </div>

              <div className="flex items-center justify-between rounded border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded bg-primary/10 text-primary">
                    <Printer className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Zebra ZD421 Thermal Barcode & QR Label Printer</p>
                    <p className="text-muted-foreground text-[11px]">USB001 · 2" x 1" Tamper-evident packet sticker printing</p>
                  </div>
                </div>
                <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Ready
                </span>
              </div>

              <div className="flex items-center justify-between rounded border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded bg-primary/10 text-primary">
                    <Camera className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">HD Dual-Camera Counter & Customer Proof Station</p>
                    <p className="text-muted-foreground text-[11px]">Camera 1: Customer Portrait · Camera 2: Macro Overhead Scale Plate</p>
                  </div>
                </div>
                <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Active
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: SECURITY & AUDIT */}
        <TabsContent value="security" className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
            <h3 className="font-semibold text-sm text-foreground border-b border-border pb-3">
              Compliance, Geofencing & Dual-Custody Policies
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between rounded border border-border p-3">
                <div>
                  <p className="font-semibold text-foreground">Mandatory Photo & Video Evidence Capture</p>
                  <p className="text-muted-foreground text-[11px]">
                    Requires live photo of customer, original photo ID, ornaments on digital scale, and tamper seal prior to voucher generation.
                  </p>
                </div>
                <Switch checked={requirePhotoEvidence} onCheckedChange={setRequirePhotoEvidence} />
              </div>

              <div className="flex items-center justify-between rounded border border-border p-3">
                <div>
                  <p className="font-semibold text-foreground">Customer SMS & WhatsApp Notifications</p>
                  <p className="text-muted-foreground text-[11px]">
                    Dispatch automated OTP verification, valuation summary, and bank payout receipt directly to customer mobile.
                  </p>
                </div>
                <Switch checked={sendCustomerSMS} onCheckedChange={setSendCustomerSMS} />
              </div>

              <div className="flex items-center justify-between rounded border border-border p-3">
                <div>
                  <p className="font-semibold text-foreground">Branch Geofencing & IP Restriction</p>
                  <p className="text-muted-foreground text-[11px]">
                    Restrict appraiser and cashier workstation logins to authorized branch static IP subnets and physical GPS radius.
                  </p>
                </div>
                <Switch checked={enforceGeofencing} onCheckedChange={setEnforceGeofencing} />
              </div>

              <div className="rounded border border-emerald-200 bg-emerald-50/50 p-3 text-emerald-950">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="size-4 text-emerald-700" />
                  Immutable Audit Trail Active
                </div>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  All rate modifications, approval events, custody transfers, and settlement payouts are cryptographically signed and logged with operator ID, IP address, and timestamp.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 5: PWA & OFFLINE READINESS */}
        <TabsContent value="pwa" className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-semibold text-sm text-foreground">
                  Progressive Web App (PWA) & Offline Shell
                </h3>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Run AVP Gold ERP as an installed standalone native application on Windows, macOS, Android, and iOS.
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold">
                PWA Enabled
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-md border border-border p-3.5 bg-muted/30 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Smartphone className="size-4 text-primary" />
                  <span>Installation Manifest</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Web App Manifest configured at <code className="font-mono bg-muted px-1 py-0.2 rounded">/manifest.json</code> with high-res 192px and 512px icons, maskable icons, and quick shortcuts for Valuation, Pledged Gold, and Vault.
                </p>
                <div className="pt-1 flex items-center gap-2 text-[11px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="size-3.5" /> Standalone Display Mode Active
                </div>
              </div>

              <div className="rounded-md border border-border p-3.5 bg-muted/30 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>Service Worker Caching</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Cache-first strategy for static assets and network-first for navigation. Critical shell routes and rate indices are cached for instant desk loading.
                </p>
                <div className="pt-1 flex items-center gap-2 text-[11px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="size-3.5" /> Cache Name: avp-gold-erp-v1
                </div>
              </div>
            </div>

            <div className="rounded-md border border-amber-200/80 bg-amber-50/60 p-4 text-xs text-amber-950 space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <span>Desktop & Mobile App Installation Instructions</span>
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-900">
                <li><strong>Chrome / Edge (Desktop):</strong> Click the <strong>"Install App"</strong> button in the top navigation bar or the install icon in the address bar to add to your desktop/taskbar.</li>
                <li><strong>Android (Chrome):</strong> Tap the three-dot menu and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                <li><strong>iOS (Safari):</strong> Tap the Share button at the bottom and select <strong>"Add to Home Screen"</strong>.</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-border">
              <span className="text-[11px] text-muted-foreground">
                Need to force reload all cached assets across all branch desks?
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (typeof window !== "undefined" && "caches" in window) {
                    caches.keys().then((names) => {
                      for (let name of names) caches.delete(name);
                    });
                  }
                  toast.success("Service Worker cache cleared. Application refreshed.");
                  setTimeout(() => window.location.reload(), 600);
                }}
                className="text-xs"
              >
                Clear PWA Cache & Reload
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
