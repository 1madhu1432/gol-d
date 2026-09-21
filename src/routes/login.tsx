import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Gem,
  ShieldCheck,
  Building2,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { branches } from "@/lib/erp-data";
import { useERPStore, DEMO_USERS } from "@/lib/erp-store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useERPStore();

  const [employeeId, setEmployeeId] = useState("ADM001");
  const [password, setPassword] = useState("Admin@123");
  const [branch, setBranch] = useState("All Branches");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim() || !password.trim()) {
      toast.error("Please enter both Employee ID and Password.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = login(employeeId, password, branch);
      if (res.success) {
        toast.success("Authentication successful. Welcome to AVP Gold ERP.");
        navigate({ to: "/" });
      } else {
        toast.error(res.error || "Authentication failed. Check your credentials.");
      }
    }, 450);
  };

  const handleQuickFill = (empId: string, pass: string, assignedBranch: string) => {
    setEmployeeId(empId);
    setPassword(pass);
    setBranch(assignedBranch);
    toast.info(`Loaded demo credentials for ${empId} (${assignedBranch})`);
  };

  return (
    <div className="min-h-screen w-full bg-[#fbfbfa] text-[#1c1917] flex flex-col justify-between selection:bg-amber-500/20">
      {/* Header bar */}
      <header className="border-b border-border/80 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded border border-primary/40 bg-primary/10 text-primary shadow-xs">
            <Gem className="size-5 text-primary" />
          </div>
          <div>
            <div className="font-display font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
              AVP GOLD
              <span className="rounded bg-primary/15 px-1 py-0.2 text-[9px] font-bold uppercase tracking-wider text-primary">ERP</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Multi-Branch Precious Metal & Bank Settlement System
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-600" />
          <span className="font-medium text-foreground">ISO 27001 Secure Access</span>
        </div>
      </header>

      {/* Center login container */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-4xl grid gap-8 lg:grid-cols-12 items-center">
          {/* Left panel: Info & Demo Credentials */}
          <div className="lg:col-span-6 space-y-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50/70 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                <span className="size-1.5 rounded-full bg-amber-600 animate-pulse" />
                Role-Based Branch Access Control
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Authorized Personnel Portal
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sign in with your designated Employee ID and assign your active operational branch context. Branch Managers are strictly restricted to their designated branch data.
              </p>
            </div>

            {/* Quick Demo Credentials Switcher */}
            <div className="rounded-lg border border-border bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <KeyRound className="size-3.5 text-primary" />
                  Select Demo User Credentials
                </span>
                <span className="text-[10px] text-muted-foreground">Click to autofill</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickFill("ADM001", "Admin@123", "All Branches")}
                  className={`flex w-full items-center justify-between rounded-md p-2 text-left transition-colors border ${
                    employeeId === "ADM001" ? "border-primary/50 bg-primary/5" : "border-border/60 hover:bg-muted/50"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      ADM001 · R. Srinivas
                      <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-primary">Super Admin</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">Access: All 5 Branches & Consolidated HQ</div>
                  </div>
                  <ArrowRight className="size-3 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("BM001", "Branch@123", "Hyderabad")}
                  className={`flex w-full items-center justify-between rounded-md p-2 text-left transition-colors border ${
                    employeeId === "BM001" ? "border-primary/50 bg-primary/5" : "border-border/60 hover:bg-muted/50"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      BM001 · K. Satyanarayana
                      <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">Hyderabad BM</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">Data isolated strictly to Hyderabad Branch</div>
                  </div>
                  <ArrowRight className="size-3 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("BM002", "Branch@123", "Vijayawada")}
                  className={`flex w-full items-center justify-between rounded-md p-2 text-left transition-colors border ${
                    employeeId === "BM002" ? "border-primary/50 bg-primary/5" : "border-border/60 hover:bg-muted/50"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      BM002 · M. Lakshmi
                      <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">Vijayawada BM</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">Data isolated strictly to Vijayawada Branch</div>
                  </div>
                  <ArrowRight className="size-3 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("BM003", "Branch@123", "Tirupati")}
                  className={`flex w-full items-center justify-between rounded-md p-2 text-left transition-colors border ${
                    employeeId === "BM003" ? "border-primary/50 bg-primary/5" : "border-border/60 hover:bg-muted/50"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      BM003 · S. Karthik
                      <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">Tirupati BM</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">Data isolated strictly to Tirupati Branch</div>
                  </div>
                  <ArrowRight className="size-3 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("FIN001", "Finance@123", "All Branches")}
                  className={`flex w-full items-center justify-between rounded-md p-2 text-left transition-colors border ${
                    employeeId === "FIN001" ? "border-primary/50 bg-primary/5" : "border-border/60 hover:bg-muted/50"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      FIN001 · V. Padmavathi
                      <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[9px] font-bold text-blue-800">Finance Desk</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">Accounting, Payouts & Triple-Way Reconciliation</div>
                  </div>
                  <ArrowRight className="size-3 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Right panel: Login Form Card */}
          <div className="lg:col-span-6">
            <div className="rounded-xl border border-border bg-white p-6 sm:p-8 shadow-md space-y-5">
              <div className="space-y-1">
                <h2 className="font-display text-xl font-bold text-foreground">Sign In</h2>
                <p className="text-xs text-muted-foreground">Enter employee credentials to open session.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Employee ID */}
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground flex items-center justify-between">
                    <span>Employee ID / Email</span>
                    <span className="text-[10px] text-muted-foreground">e.g. ADM001, BM001</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      required
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="e.g. ADM001"
                      className="pl-9 h-10 text-xs font-mono font-medium"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground flex items-center justify-between">
                    <span>Password</span>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-[11px] text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="pl-9 pr-9 h-10 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Operating Branch Selector */}
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground flex items-center justify-between">
                    <span>Assigned Operating Branch</span>
                    <span className="text-[10px] text-muted-foreground">Location context</span>
                  </label>
                  <div className="relative">
                    <Select value={branch} onValueChange={setBranch}>
                      <SelectTrigger className="h-10 text-xs">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Branches">All Branches (Consolidated HQ)</SelectItem>
                        {branches.map((b) => (
                          <SelectItem key={b.code} value={b.name}>
                            {b.name} Branch ({b.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Super Admins can switch branches; Branch Managers are validated to their assigned branch.
                  </p>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={(c) => setRememberMe(!!c)}
                    />
                    <label htmlFor="rememberMe" className="text-xs text-muted-foreground cursor-pointer">
                      Remember this workstation
                    </label>
                  </div>
                </div>

                {/* Sign In Button */}
                <Button type="submit" disabled={isLoading} className="w-full h-10 text-xs font-semibold gap-1.5 shadow-sm">
                  {isLoading ? (
                    <span>Verifying credentials...</span>
                  ) : (
                    <>
                      <span>Sign In to AVP Gold ERP</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="pt-3 border-t border-border text-center text-[11px] text-muted-foreground">
                Protected by AVP Gold Dual-Authentication & Audit Telemetry.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 bg-white/60 py-3 px-6 text-center text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 AVP Gold Enterprises Pvt. Ltd. · All rights reserved.</span>
        <span>Precious Metal ERP v4.2 · Secure Production Build</span>
      </footer>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Employee Credentials</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground leading-relaxed">
              For security compliance, employee password resets require authorization from your Zonal Regional Manager or Super Admin.
            </p>
            <div className="rounded border border-amber-200 bg-amber-50 p-3 space-y-1 text-amber-900">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldAlert className="size-4 text-amber-700" />
                Demo Credentials Available
              </div>
              <p className="text-[11px] text-amber-800">
                You can use the default demo credentials provided on the left:
                <br />
                • <strong>Super Admin:</strong> ADM001 / Admin@123
                <br />
                • <strong>Hyderabad BM:</strong> BM001 / Branch@123
                <br />
                • <strong>Vijayawada BM:</strong> BM002 / Branch@123
                <br />
                • <strong>Tirupati BM:</strong> BM003 / Branch@123
                <br />
                • <strong>Finance:</strong> FIN001 / Finance@123
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setForgotPasswordOpen(false)}>Understood</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
