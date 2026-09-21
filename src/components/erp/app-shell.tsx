import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Gem,
  Menu,
  PanelLeftClose,
  Search,
  ShieldCheck,
  X,
  LayoutDashboard,
  Users,
  BadgeCheck,
  Coins,
  Landmark,
  Banknote,
  ScanLine,
  TrendingUp,
  Activity,
  Calculator,
  ReceiptIndianRupee,
  Handshake,
  CreditCard,
  Boxes,
  PackageCheck,
  Lock,
  LockKeyhole,
  ArrowLeftRight,
  Contact,
  ShieldAlert,
  ListChecks,
  BookOpenCheck,
  Scale,
  ChartNoAxesCombined,
  Files,
  ChartColumnBig,
  ScrollText,
  Settings,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/sonner";
import { branches, formatINR } from "@/lib/erp-data";
import { useERPStore } from "@/lib/erp-store";
import { cn } from "@/lib/utils";

export const navGroups = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/customers", label: "Customers", icon: Users },
      { to: "/kyc", label: "KYC", icon: BadgeCheck },
      { to: "/gold-purchase", label: "Gold Purchase", icon: Gem },
      { to: "/silver-purchase", label: "Silver Purchase", icon: Coins },
      { to: "/bank-pledged-gold", label: "Bank Pledged Gold", icon: Landmark },
      { to: "/bank-pledged-silver", label: "Bank Pledged Silver", icon: Banknote },
      { to: "/testing", label: "Gold & Silver Testing", icon: ScanLine },
    ],
  },
  {
    label: "Commercial",
    items: [
      { to: "/gold-rates", label: "Gold Rates", icon: TrendingUp },
      { to: "/silver-rates", label: "Silver Rates", icon: Activity },
      { to: "/valuation", label: "Valuation", icon: Calculator },
      { to: "/charges", label: "Charges & Commission", icon: ReceiptIndianRupee },
      { to: "/settlements", label: "Customer Settlement", icon: Handshake },
      { to: "/payments", label: "Payments", icon: CreditCard },
    ],
  },
  {
    label: "Custody",
    items: [
      { to: "/inventory", label: "Inventory", icon: Boxes },
      { to: "/packets", label: "Packets", icon: PackageCheck },
      { to: "/vault", label: "Vault", icon: LockKeyhole },
      { to: "/transfers", label: "Branch Transfers", icon: ArrowLeftRight },
    ],
  },
  {
    label: "Organisation",
    items: [
      { to: "/branches", label: "Branches", icon: Building2 },
      { to: "/regions", label: "Regions", icon: MapPin },
      { to: "/employees", label: "Employees", icon: Contact },
      { to: "/roles", label: "Roles & Permissions", icon: ShieldAlert },
      { to: "/approvals", label: "Approvals", icon: ListChecks },
    ],
  },
  {
    label: "Finance & Control",
    items: [
      { to: "/accounting", label: "Accounting", icon: BookOpenCheck },
      { to: "/reconciliation", label: "Reconciliation", icon: Scale },
      { to: "/profit-margin", label: "Profit & Margin", icon: ChartNoAxesCombined },
      { to: "/reports", label: "Reports", icon: Files },
      { to: "/analytics", label: "Analytics", icon: ChartColumnBig },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/notifications", label: "Notifications", icon: Bell },
      { to: "/audit-logs", label: "Audit Logs", icon: ScrollText },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const {
    currentUser,
    isAuthenticated,
    logout,
    selectedBranch,
    setSelectedBranch,
    customers,
    transactions,
    inventory,
    packets,
    employees,
    approvals,
  } = useERPStore();

  const user = currentUser || {
    id: "ADM001",
    name: "R. Srinivas",
    email: "srinivas@avpgold.com",
    role: "Super Admin" as const,
    branch: "All Branches",
    accessibleBranches: ["All Branches", "Hyderabad", "Vijayawada", "Tirupati", "Kurnool", "Visakhapatnam"],
    permissions: ["*"],
  };

  const pendingApprovalsCount = useMemo(
    () => approvals.filter((a) => a.status === "Pending").length,
    [approvals]
  );

  const searchResults = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();

    const matchedCustomers = customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.mobile.includes(q) ||
          c.idNumber.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((c) => ({
        type: "Customer",
        title: c.name,
        sub: `${c.id} · ${c.mobile} · ${c.branch}`,
        route: `/customers`,
      }));

    const matchedTransactions = transactions
      .filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          (t.loanAccountNumber && t.loanAccountNumber.toLowerCase().includes(q)) ||
          (t.bankPaymentRef && t.bankPaymentRef.toLowerCase().includes(q)) ||
          t.packetId?.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((t) => ({
        type: t.type,
        title: `${t.id} (${t.metal})`,
        sub: `${t.customerName} · ${formatINR(t.grossMetalValue)} · ${t.status}`,
        route: t.type === "Bank Pledged" ? (t.metal === "Gold" ? "/bank-pledged-gold" : "/bank-pledged-silver") : (t.metal === "Gold" ? "/gold-purchase" : "/silver-purchase"),
      }));

    const matchedInventory = inventory
      .filter((i) => i.id.toLowerCase().includes(q) || i.packetId.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
      .slice(0, 2)
      .map((i) => ({
        type: "Inventory",
        title: `${i.id} · ${i.description}`,
        sub: `${i.purity} · ${i.fineWeight}g · ${i.branch}`,
        route: `/inventory`,
      }));

    const matchedPackets = packets
      .filter((p) => p.id.toLowerCase().includes(q) || p.sealNumber.toLowerCase().includes(q))
      .slice(0, 2)
      .map((p) => ({
        type: "Packet",
        title: `${p.id} · ${p.sealNumber}`,
        sub: `${p.customerName} · ${p.fineWeight}g ${p.metal}`,
        route: `/packets`,
      }));

    const matchedEmployees = employees
      .filter((e) => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.role.toLowerCase().includes(q))
      .slice(0, 2)
      .map((e) => ({
        type: "Employee",
        title: e.name,
        sub: `${e.id} · ${e.role} (${e.branch})`,
        route: `/employees`,
      }));

    return [...matchedCustomers, ...matchedTransactions, ...matchedInventory, ...matchedPackets, ...matchedEmployees].slice(0, 10);
  }, [query, customers, transactions, inventory, packets, employees]);

  // If on login page, render full standalone login screen
  if (path === "/login") {
    return (
      <div className="erp-app min-h-screen bg-[#fbfbfa] text-[#1c1917] font-sans antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  return (
    <div className="erp-app min-h-screen bg-background text-foreground font-sans antialiased">
      {mobile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobile(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar transition-[width,transform] duration-200",
          collapsed ? "w-18" : "w-64",
          mobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <div className="grid size-9 shrink-0 place-items-center rounded-md border border-primary/40 bg-primary/10 text-primary shadow-xs">
            <Gem className="size-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="ml-3 min-w-0">
              <div className="font-display text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
                AVP GOLD
                <span className="rounded bg-primary/15 px-1 py-0.2 text-[9px] font-bold uppercase tracking-wider text-primary">ERP</span>
              </div>
              <div className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                Precious Metal & Bank Desk
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto md:hidden"
            onClick={() => setMobile(false)}
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Quick search input button */}
        <div className="border-b border-sidebar-border p-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-full items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/60 px-2.5 text-xs text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground"
          >
            <Search className="size-4 shrink-0 text-muted-foreground" />
            {!collapsed && <span className="truncate">Search system…</span>}
            {!collapsed && <kbd className="ml-auto rounded border bg-background/80 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">⌘K</kbd>}
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = path === item.to || (item.to !== "/" && path.startsWith(item.to));

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      title={collapsed ? item.label : undefined}
                      onClick={() => setMobile(false)}
                      className={cn(
                        "flex h-8.5 items-center gap-2.5 rounded-md px-2.5 text-xs font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-foreground/80 hover:bg-sidebar-accent hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && item.label === "Approvals" && pendingApprovalsCount > 0 && (
                        <span className={cn("ml-auto rounded-full px-1.5 py-0.2 text-[10px] font-bold", isActive ? "bg-white text-primary" : "bg-warning/20 text-warning-foreground")}>
                          {pendingApprovalsCount}
                        </span>
                      )}
                      {!collapsed && item.label === "Notifications" && (
                        <span className={cn("ml-auto rounded-full px-1.5 py-0.2 text-[10px] font-bold", isActive ? "bg-white text-primary" : "bg-destructive/15 text-destructive")}>
                          8
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar footer collapse */}
        <div className="border-t border-sidebar-border p-2.5">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex h-8.5 w-full items-center gap-2.5 rounded-md px-2.5 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
          >
            <PanelLeftClose className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && <span>Collapse Menu</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className={cn("transition-[padding] duration-200", collapsed ? "md:pl-18" : "md:pl-64")}>
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur-md lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobile(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>

          {/* Search Trigger in Header */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden h-9 w-80 items-center gap-2 rounded-md border border-input bg-background/80 px-3 text-xs text-muted-foreground shadow-2xs md:flex hover:border-primary/50 transition-colors"
          >
            <Search className="size-3.5 text-muted-foreground" />
            <span>Search customer, loan A/c, item ID, packet…</span>
            <kbd className="ml-auto rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">⌘K</kbd>
          </button>

          {/* Brand Context Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs border-l border-border pl-3">
            <span className="font-semibold text-foreground">AVP Gold</span>
            <span className="text-muted-foreground">•</span>
            <span className="font-bold text-amber-950 bg-amber-100/80 border border-amber-300/80 px-2 py-0.5 rounded text-[11px]">
              {user.role === "Branch Manager" ? `${user.branch} Branch` : selectedBranch === "All Branches" ? "All Branches (HQ)" : `${selectedBranch} Branch`}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="font-medium text-muted-foreground">{user.role}</span>
          </div>

          {/* Right Header items */}
          <div className="ml-auto flex items-center gap-2.5">
            {/* Active Branch Selector / Locked Indicator */}
            <div className="flex items-center gap-1.5">
              <Building2 className="size-4 text-muted-foreground hidden sm:block" />
              {user.role === "Branch Manager" ? (
                <div
                  className="flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50/90 px-2.5 py-1 text-xs font-bold text-amber-950 shadow-2xs"
                  title={`Account locked strictly to ${user.branch} Branch`}
                >
                  <Lock className="size-3 text-amber-800 shrink-0" />
                  <span>{user.branch}</span>
                  <span className="text-[9px] uppercase tracking-wider text-amber-800 bg-amber-200/70 px-1 py-0.2 rounded font-semibold">Locked</span>
                </div>
              ) : (
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="h-9 w-40 text-xs font-semibold">
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Branches">All Branches (HQ)</SelectItem>
                    {branches.map((b) => (
                      <SelectItem key={b.code} value={b.name}>
                        {b.name} ({b.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Date Indicator */}
            <div className="hidden xl:flex items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              <span className="font-medium text-foreground">21 Sep 2026</span>
            </div>

            {/* Quick Live Rates Badge */}
            <div className="hidden 2xl:flex items-center gap-2 rounded-md border border-amber-200/60 bg-amber-50/50 px-2.5 py-1 text-[11px] text-amber-900">
              <span className="inline-block size-1.5 rounded-full bg-amber-600 animate-pulse" />
              <span className="font-bold">22K Gold:</span> ₹6,850/g
              <span className="font-bold ml-1">999 Silver:</span> ₹94.5/g
            </div>

            {/* Help */}
            <Link to="/settings" className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="System Settings & Help">
              <CircleHelp className="size-4" />
            </Link>

            {/* Notifications */}
            <Link to="/notifications" className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Notifications">
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-card" />
            </Link>

            {/* User Profile Menu */}
            <div className="ml-1 border-l border-border pl-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-md p-1 hover:bg-muted/80 transition-colors text-left focus:outline-none">
                    <div className="grid size-8 place-items-center rounded-full bg-primary font-display text-xs font-bold text-primary-foreground shadow-xs">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-semibold leading-none text-foreground">{user.name}</p>
                      <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">{user.role} · {user.id}</p>
                    </div>
                    <ChevronDown className="size-3 text-muted-foreground hidden lg:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 text-xs">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="font-semibold text-foreground text-xs leading-none">{user.name}</p>
                      <p className="text-[11px] text-muted-foreground">{user.email}</p>
                      <div className="pt-1 flex items-center gap-1.5">
                        <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                          {user.role}
                        </span>
                        <span className="rounded bg-muted px-1.5 py-0.2 text-[9px] font-semibold text-muted-foreground">
                          {user.id}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/roles" className="cursor-pointer">
                      <ShieldAlert className="mr-2 size-3.5" />
                      <span>Role & Permissions</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/branches" className="cursor-pointer">
                      <Building2 className="mr-2 size-3.5" />
                      <span>Branch: {user.branch}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/audit-logs" className="cursor-pointer">
                      <ScrollText className="mr-2 size-3.5" />
                      <span>My Activity Audit</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/login" className="cursor-pointer text-primary">
                      <Users className="mr-2 size-3.5" />
                      <span>Switch Operator / User</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate({ to: "/login" });
                    }}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <PanelLeftClose className="mr-2 size-3.5 rotate-180" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="min-h-[calc(100vh-4rem)] p-4 lg:p-6 bg-background">
          {children}
        </main>
      </div>

      {/* GLOBAL SEARCH MODAL */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="top-[12%] translate-y-0 p-0 sm:max-w-2xl overflow-hidden border border-border shadow-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Global search across AVP Gold ERP</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3 border-b border-border px-4 py-1">
            <Search className="size-5 text-muted-foreground shrink-0" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type customer name, mobile, transaction ID, bank loan number, packet ID…"
              className="h-13 border-0 text-sm shadow-none focus-visible:ring-0 px-0"
            />
            {query && (
              <Button variant="ghost" size="sm" onClick={() => setQuery("")} className="text-xs">
                Clear
              </Button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto p-2 divide-y divide-border/40">
            {query.trim().length < 2 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <Search className="size-8 mx-auto mb-2 opacity-30" />
                <p className="font-semibold text-foreground">Global Enterprise Index</p>
                <p className="mt-1">Enter at least 2 characters to search customers, bank pledges, transactions, packets and employees.</p>
              </div>
            ) : searchResults.length ? (
              searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSearchOpen(false);
                    navigate({ to: r.route });
                  }}
                  className="flex w-full items-center gap-3.5 rounded-md p-3 text-left hover:bg-muted/80 transition-colors"
                >
                  <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <Search className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs font-bold text-foreground">{r.title}</p>
                      <span className="rounded bg-muted px-1.5 py-0.2 text-[9px] font-semibold text-muted-foreground uppercase">
                        {r.type}
                      </span>
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground mt-0.5">{r.sub}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">No records matched "{query}"</p>
                <p className="mt-1">Try searching by mobile number, Aadhaar number, loan reference, or packet ID.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Toaster richColors position="top-right" />
    </div>
  );
}
