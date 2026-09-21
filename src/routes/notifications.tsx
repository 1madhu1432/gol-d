import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  TrendingUp,
  Building2,
  Lock,
  ArrowRight,
  Filter,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, MetricCard } from "@/components/erp/ui";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  category: "Approval" | "Bank Release" | "Vault & Custody" | "Rates" | "KYC";
  severity: "Urgent" | "High" | "Normal" | "Info";
  timestamp: string;
  read: boolean;
  actionRoute: string;
  actionLabel: string;
};

const initialNotifications: NotificationItem[] = [
  {
    id: "NOTIF-01",
    title: "High-Value Transaction Approval Required (> ₹5,00,000)",
    description: "Transaction TXN-BPG-002 for customer S. V. Prasad requires Super Admin dual authorization prior to bank RTGS payout.",
    category: "Approval",
    severity: "Urgent",
    timestamp: "10 mins ago",
    read: false,
    actionRoute: "/approvals",
    actionLabel: "Review Approval",
  },
  {
    id: "NOTIF-02",
    title: "Bank Pledged Metal Released from State Bank of India",
    description: "Liaison Officer P. Srinivas has received the sealed pledged pouch for loan A/c GL-SBIN-381920. Custody transfer initiated.",
    category: "Bank Release",
    severity: "High",
    timestamp: "25 mins ago",
    read: false,
    actionRoute: "/bank-pledged-gold",
    actionLabel: "View Bank Record",
  },
  {
    id: "NOTIF-03",
    title: "Morning Bullion Rate Update Broadcast",
    description: "22K Gold rate updated to ₹6,850/g (+₹35) and 999 Silver updated to ₹94.50/g. Branch adjustments applied.",
    category: "Rates",
    severity: "Normal",
    timestamp: "09:30 AM IST",
    read: true,
    actionRoute: "/gold-rates",
    actionLabel: "View Rates",
  },
  {
    id: "NOTIF-04",
    title: "Strongroom Vault Dual-Key Access Logged",
    description: "Vault Keyholder R. Srinivas and Branch Manager M. Lakshmi logged in for scheduled morning inventory inspection.",
    category: "Vault & Custody",
    severity: "Info",
    timestamp: "09:15 AM IST",
    read: true,
    actionRoute: "/vault",
    actionLabel: "Vault Audit",
  },
  {
    id: "NOTIF-05",
    title: "Aadhaar e-KYC Verification Flagged for Review",
    description: "Customer CUST-905 uploaded blurred photo ID. Branch Executive notified to re-capture clear document camera proof.",
    category: "KYC",
    severity: "High",
    timestamp: "1 hour ago",
    read: false,
    actionRoute: "/kyc",
    actionLabel: "Verify KYC",
  },
  {
    id: "NOTIF-06",
    title: "Armored Branch Transit Dispatched: Hyderabad -> Vijayawada",
    description: "Transfer TRF-2026-081 with 3 sealed packets (125.4g Gold) dispatched with armored escort personnel.",
    category: "Vault & Custody",
    severity: "Normal",
    timestamp: "2 hours ago",
    read: true,
    actionRoute: "/transfers",
    actionLabel: "Track Transit",
  },
];

function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<string>("All");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (activeTab === "All") return true;
    if (activeTab === "Unread") return !n.read;
    return n.category === activeTab;
  });

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System & Alerts"
        title="Enterprise Alert & Notification Center"
        description="High-priority operational alerts for pending manager approvals, bank liaison metal handovers, vault custody events, and regulatory compliance flags."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleMarkAllRead} className="gap-1.5">
              <CheckCheck className="size-4" />
              Mark All as Read
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Unread Critical Alerts"
          value={String(unreadCount)}
          icon={<Bell className="size-5" />}
          accent={unreadCount > 0}
        />
        <MetricCard
          label="High-Priority Approvals"
          value="1"
          delta="Requires Super Admin Signoff"
          icon={<ShieldAlert className="size-5" />}
        />
        <MetricCard
          label="Bank Liaison Updates"
          value="3"
          delta="Physical metal in handover"
          icon={<Building2 className="size-5" />}
        />
        <MetricCard
          label="Vault Security Status"
          value="All Secured"
          delta="No unauthorized access"
          icon={<Lock className="size-5" />}
        />
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {["All", "Unread", "Approval", "Bank Release", "Vault & Custody", "Rates", "KYC"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              activeTab === tab
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {tab} {tab === "Unread" && unreadCount > 0 && `(${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
            <CheckCircle2 className="size-8 mx-auto mb-2 text-emerald-600" />
            <p className="font-semibold text-foreground">You are all caught up!</p>
            <p className="text-xs mt-1">No alerts matching the selected filter.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const isUrgent = item.severity === "Urgent";
            const isHigh = item.severity === "High";

            return (
              <div
                key={item.id}
                className={`rounded-lg border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !item.read
                    ? isUrgent
                      ? "border-destructive/40 bg-destructive/5"
                      : "border-primary/30 bg-primary/5"
                    : "border-border bg-card opacity-85"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-md ${
                      isUrgent
                        ? "bg-destructive/15 text-destructive"
                        : isHigh
                        ? "bg-amber-100 text-amber-800"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {isUrgent ? (
                      <ShieldAlert className="size-4.5" />
                    ) : isHigh ? (
                      <AlertTriangle className="size-4.5" />
                    ) : item.category === "Bank Release" ? (
                      <Building2 className="size-4.5" />
                    ) : item.category === "Vault & Custody" ? (
                      <Lock className="size-4.5" />
                    ) : (
                      <Bell className="size-4.5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">{item.title}</span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider ${
                          isUrgent
                            ? "bg-destructive text-destructive-foreground"
                            : isHigh
                            ? "bg-amber-200 text-amber-900"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.severity}
                      </span>
                      <span className="rounded bg-muted/60 px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground">• {item.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {!item.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(item.id)}
                      className="h-8 text-xs text-muted-foreground"
                    >
                      Mark read
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      handleMarkAsRead(item.id);
                      navigate({ to: item.actionRoute });
                    }}
                    className="h-8 gap-1 text-xs"
                  >
                    {item.actionLabel}
                    <ArrowRight className="size-3" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
