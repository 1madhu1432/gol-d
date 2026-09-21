import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Contact,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  BadgeCheck,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/erp/ui";
import { useERPStore } from "@/lib/erp-store";
import { branches } from "@/lib/erp-data";

export const Route = createFileRoute("/employees")({
  component: EmployeesPage,
});

const roleColors: Record<string, string> = {
  "Branch Manager": "bg-violet-100 text-violet-700",
  "Appraiser": "bg-amber-100 text-amber-700",
  "KYC Officer": "bg-blue-100 text-blue-600",
  "Cashier": "bg-teal-100 text-teal-700",
  "Vault Keeper": "bg-slate-100 text-slate-700",
  "Liaison Officer": "bg-orange-100 text-orange-700",
};

function EmployeesPage() {
  const { employees } = useERPStore();
  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");

  const allRoles = useMemo(() =>
    Array.from(new Set(employees.map((e) => e.role))).sort(),
    [employees]
  );

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const matchQ =
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.id.toLowerCase().includes(query.toLowerCase()) ||
        e.email.toLowerCase().includes(query.toLowerCase());
      const matchB = branchFilter === "All" || e.branch === branchFilter;
      const matchR = roleFilter === "All" || e.role === roleFilter;
      return matchQ && matchB && matchR;
    });
  }, [employees, query, branchFilter, roleFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        subtitle="Staff directory across all branches"
        action={
          <Button className="bg-avp-gold hover:bg-avp-gold/90 text-avp-charcoal">
            <Plus className="h-4 w-4 mr-2" /> Add Employee
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-avp-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-avp-charcoal/40" />
          <Input placeholder="Search by name or ID..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2 text-avp-charcoal/50" />
            <SelectValue placeholder="Branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Branches</SelectItem>
            {branches.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2 text-avp-charcoal/50" />
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Roles</SelectItem>
            {allRoles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((emp) => (
          <div key={emp.id} className="bg-white border border-avp-border rounded-xl shadow-sm hover:shadow-md transition-shadow p-5">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-avp-gold/30 to-avp-gold/10 border border-avp-gold/30 flex items-center justify-center flex-shrink-0">
                <span className="text-avp-charcoal font-bold text-lg">
                  {emp.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-avp-charcoal">{emp.name}</h3>
                  {emp.status === "Active" && (
                    <BadgeCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-avp-charcoal/60 mt-0.5">{emp.id}</p>
                <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[emp.role] || "bg-gray-100 text-gray-600"}`}>
                  {emp.role}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm border-t border-avp-border pt-3">
              <div className="flex items-center gap-2 text-avp-charcoal/70">
                <MapPin className="h-3.5 w-3.5 text-avp-gold flex-shrink-0" />
                <span className="truncate">{emp.branch}</span>
              </div>
              <div className="flex items-center gap-2 text-avp-charcoal/70">
                <Phone className="h-3.5 w-3.5 text-avp-charcoal/40 flex-shrink-0" />
                <span>{emp.mobile}</span>
              </div>
              <div className="flex items-center gap-2 text-avp-charcoal/70">
                <Mail className="h-3.5 w-3.5 text-avp-charcoal/40 flex-shrink-0" />
                <span className="truncate">{emp.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white border border-avp-border rounded-xl p-10 text-center text-avp-charcoal/50">
          No employees found.
        </div>
      )}
    </div>
  );
}
