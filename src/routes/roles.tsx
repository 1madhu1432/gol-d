import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Lock,
  CheckCircle2,
  XCircle,
  Plus,
  Sliders,
  AlertTriangle,
  KeyRound,
  FileCheck,
  CreditCard,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader, MetricCard } from "@/components/erp/ui";
import { employees } from "@/lib/erp-data";
import { toast } from "sonner";

export const Route = createFileRoute("/roles")({
  component: RolesPage,
});

type RoleDefinition = {
  role: string;
  department: string;
  description: string;
  cashLimit: number;
  weightLimitGrams: number;
  dualAuthRequired: boolean;
  permissions: {
    module: string;
    action: string;
    granted: boolean;
  }[];
};

const initialRoles: RoleDefinition[] = [
  {
    role: "Super Admin",
    department: "Executive",
    description: "Full unconstrained enterprise authority across all branches, accounts, vaults, and rates.",
    cashLimit: 10000000,
    weightLimitGrams: 50000,
    dualAuthRequired: false,
    permissions: [
      { module: "Customer & KYC", action: "Register Customer", granted: true },
      { module: "Customer & KYC", action: "Approve / Reject KYC", granted: true },
      { module: "Valuation & Testing", action: "Certify XRF Assay", granted: true },
      { module: "Valuation & Testing", action: "Override Market Rates", granted: true },
      { module: "Bank Operations", action: "Authorize Bank Outstanding Payout", granted: true },
      { module: "Bank Operations", action: "Accept Metal at Bank Branch", granted: true },
      { module: "Settlement", action: "Approve Payout > ₹5 Lakhs", granted: true },
      { module: "Vault & Transfer", action: "Dual-Key Strongroom Access", granted: true },
      { module: "Vault & Transfer", action: "Dispatch Armored Transfer", granted: true },
      { module: "Audit & Config", action: "Edit Slabs & Fee Rules", granted: true },
      { module: "Audit & Config", action: "View Immutable Audit Log", granted: true },
    ],
  },
  {
    role: "Branch Manager",
    department: "Operations",
    description: "Branch custodian with transaction verification, vault dual-custody, and customer settlement approvals up to ₹10 Lakhs.",
    cashLimit: 1000000,
    weightLimitGrams: 1000,
    dualAuthRequired: true,
    permissions: [
      { module: "Customer & KYC", action: "Register Customer", granted: true },
      { module: "Customer & KYC", action: "Approve / Reject KYC", granted: true },
      { module: "Valuation & Testing", action: "Certify XRF Assay", granted: true },
      { module: "Valuation & Testing", action: "Override Market Rates", granted: false },
      { module: "Bank Operations", action: "Authorize Bank Outstanding Payout", granted: true },
      { module: "Bank Operations", action: "Accept Metal at Bank Branch", granted: true },
      { module: "Settlement", action: "Approve Payout > ₹5 Lakhs", granted: true },
      { module: "Vault & Transfer", action: "Dual-Key Strongroom Access", granted: true },
      { module: "Vault & Transfer", action: "Dispatch Armored Transfer", granted: true },
      { module: "Audit & Config", action: "Edit Slabs & Fee Rules", granted: false },
      { module: "Audit & Config", action: "View Immutable Audit Log", granted: true },
    ],
  },
  {
    role: "Gold Appraiser",
    department: "Appraisal",
    description: "Certified precious metal valuer responsible for touchstone testing, electronic density, and XRF spectrometer assay.",
    cashLimit: 0,
    weightLimitGrams: 500,
    dualAuthRequired: false,
    permissions: [
      { module: "Customer & KYC", action: "Register Customer", granted: false },
      { module: "Customer & KYC", action: "Approve / Reject KYC", granted: false },
      { module: "Valuation & Testing", action: "Certify XRF Assay", granted: true },
      { module: "Valuation & Testing", action: "Override Market Rates", granted: false },
      { module: "Bank Operations", action: "Authorize Bank Outstanding Payout", granted: false },
      { module: "Bank Operations", action: "Accept Metal at Bank Branch", granted: true },
      { module: "Settlement", action: "Approve Payout > ₹5 Lakhs", granted: false },
      { module: "Vault & Transfer", action: "Dual-Key Strongroom Access", granted: false },
      { module: "Vault & Transfer", action: "Dispatch Armored Transfer", granted: false },
      { module: "Audit & Config", action: "Edit Slabs & Fee Rules", granted: false },
      { module: "Audit & Config", action: "View Immutable Audit Log", granted: false },
    ],
  },
  {
    role: "Cashier",
    department: "Finance",
    description: "Disburses authorized cash (≤ ₹10,000 regulatory ceiling) and executes approved bank NEFT/RTGS payouts.",
    cashLimit: 10000,
    weightLimitGrams: 0,
    dualAuthRequired: true,
    permissions: [
      { module: "Customer & KYC", action: "Register Customer", granted: false },
      { module: "Customer & KYC", action: "Approve / Reject KYC", granted: false },
      { module: "Valuation & Testing", action: "Certify XRF Assay", granted: false },
      { module: "Valuation & Testing", action: "Override Market Rates", granted: false },
      { module: "Bank Operations", action: "Authorize Bank Outstanding Payout", granted: false },
      { module: "Bank Operations", action: "Accept Metal at Bank Branch", granted: false },
      { module: "Settlement", action: "Approve Payout > ₹5 Lakhs", granted: false },
      { module: "Vault & Transfer", action: "Dual-Key Strongroom Access", granted: false },
      { module: "Vault & Transfer", action: "Dispatch Armored Transfer", granted: false },
      { module: "Audit & Config", action: "Edit Slabs & Fee Rules", granted: false },
      { module: "Audit & Config", action: "View Immutable Audit Log", granted: true },
    ],
  },
  {
    role: "Auditor",
    department: "Audit & Compliance",
    description: "Independent compliance officer with read-only inspection access across physical vault custody, packets, and KYC records.",
    cashLimit: 0,
    weightLimitGrams: 0,
    dualAuthRequired: false,
    permissions: [
      { module: "Customer & KYC", action: "Register Customer", granted: false },
      { module: "Customer & KYC", action: "Approve / Reject KYC", granted: false },
      { module: "Valuation & Testing", action: "Certify XRF Assay", granted: false },
      { module: "Valuation & Testing", action: "Override Market Rates", granted: false },
      { module: "Bank Operations", action: "Authorize Bank Outstanding Payout", granted: false },
      { module: "Bank Operations", action: "Accept Metal at Bank Branch", granted: false },
      { module: "Settlement", action: "Approve Payout > ₹5 Lakhs", granted: false },
      { module: "Vault & Transfer", action: "Dual-Key Strongroom Access", granted: false },
      { module: "Vault & Transfer", action: "Dispatch Armored Transfer", granted: false },
      { module: "Audit & Config", action: "Edit Slabs & Fee Rules", granted: false },
      { module: "Audit & Config", action: "View Immutable Audit Log", granted: true },
    ],
  },
];

function RolesPage() {
  const [roleDefs, setRoleDefs] = useState<RoleDefinition[]>(initialRoles);
  const [selectedRoleName, setSelectedRoleName] = useState("Branch Manager");

  const selectedRole = roleDefs.find((r) => r.role === selectedRoleName) || roleDefs[0];

  const handleTogglePermission = (module: string, action: string) => {
    if (selectedRole.role === "Super Admin") {
      toast.error("Super Admin permissions cannot be restricted");
      return;
    }

    setRoleDefs((prev) =>
      prev.map((r) => {
        if (r.role !== selectedRole.role) return r;
        return {
          ...r,
          permissions: r.permissions.map((p) =>
            p.module === module && p.action === action ? { ...p, granted: !p.granted } : p
          ),
        };
      })
    );
    toast.success(`Permission updated for ${selectedRole.role}`);
  };

  const assignedEmployeesCount = employees.filter((e) => e.role === selectedRole.role).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organisation & Governance"
        title="Roles & Access Control Matrix"
        description="Role-Based Access Control (RBAC) governance, dual-custody authorization limits, appraiser weight quotas, and financial disbursement ceilings."
      />

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Defined Roles"
          value={String(roleDefs.length)}
          icon={<ShieldCheck className="size-5" />}
          accent
        />
        <MetricCard
          label="Total Assigned Staff"
          value={String(employees.length)}
          icon={<Users className="size-5" />}
        />
        <MetricCard
          label="Dual-Custody Vault Rules"
          value="100% Enforced"
          icon={<Lock className="size-5" />}
        />
        <MetricCard
          label="Cash Disbursement Cap"
          value="₹10,000"
          delta="Regulatory Statutory Limit"
          icon={<CreditCard className="size-5" />}
        />
      </div>

      {/* Main Roles Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Side: Role Selector */}
        <div className="lg:col-span-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            System Roles
          </p>
          <div className="space-y-1.5">
            {roleDefs.map((r) => {
              const isSelected = r.role === selectedRoleName;
              const count = employees.filter((e) => e.role === r.role).length;

              return (
                <button
                  key={r.role}
                  onClick={() => setSelectedRoleName(r.role)}
                  className={`flex w-full items-start justify-between rounded-lg border p-3 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border bg-card hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">{r.role}</span>
                      {r.dualAuthRequired && (
                        <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-amber-800">
                          Dual Auth
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">{r.description}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Role Permissions Editor */}
        <div className="lg:col-span-8 rounded-lg border border-border bg-card p-5 shadow-xs space-y-5">
          <div className="flex flex-col justify-between gap-2 border-b border-border pb-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-foreground">{selectedRole.role}</h3>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {selectedRole.department}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{selectedRole.description}</p>
            </div>
            <div className="text-right text-xs">
              <span className="text-muted-foreground">Active Staff in Role:</span>
              <div className="font-bold text-foreground text-sm">{assignedEmployeesCount} Officers</div>
            </div>
          </div>

          {/* Operational Limits */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="rounded border border-border bg-muted/40 p-3">
              <span className="text-[10px] text-muted-foreground">Cash Payout Limit</span>
              <p className="font-bold text-foreground mt-0.5">
                {selectedRole.cashLimit > 0 ? `₹${selectedRole.cashLimit.toLocaleString()}` : "Not Authorized"}
              </p>
            </div>
            <div className="rounded border border-border bg-muted/40 p-3">
              <span className="text-[10px] text-muted-foreground">Weight Appraisal Cap</span>
              <p className="font-bold text-foreground mt-0.5">
                {selectedRole.weightLimitGrams > 0 ? `${selectedRole.weightLimitGrams} grams` : "Unlimited / N.A."}
              </p>
            </div>
            <div className="rounded border border-border bg-muted/40 p-3">
              <span className="text-[10px] text-muted-foreground">Vault Dual-Custody</span>
              <p className="font-bold text-foreground mt-0.5">
                {selectedRole.dualAuthRequired ? "Required Keyholder" : "Not Required"}
              </p>
            </div>
          </div>

          {/* Permissions Matrix Checklist */}
          <div className="space-y-4">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Configured Module Permissions
            </h4>

            {Array.from(new Set(selectedRole.permissions.map((p) => p.module))).map((moduleName) => {
              const modulePerms = selectedRole.permissions.filter((p) => p.module === moduleName);

              return (
                <div key={moduleName} className="rounded border border-border overflow-hidden">
                  <div className="bg-muted/60 px-3 py-2 text-xs font-semibold text-foreground">
                    {moduleName}
                  </div>
                  <div className="divide-y divide-border/60">
                    {modulePerms.map((perm) => (
                      <div
                        key={perm.action}
                        className="flex items-center justify-between px-3 py-2 text-xs hover:bg-muted/30 transition-colors"
                      >
                        <span className="font-medium text-foreground">{perm.action}</span>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={perm.granted}
                            disabled={selectedRole.role === "Super Admin"}
                            onCheckedChange={() => handleTogglePermission(perm.module, perm.action)}
                          />
                          <span
                            className={`text-[11px] font-semibold ${
                              perm.granted ? "text-emerald-600" : "text-muted-foreground"
                            }`}
                          >
                            {perm.granted ? "Granted" : "Restricted"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
