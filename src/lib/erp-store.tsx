import React, { createContext, useContext, useState, useMemo } from "react";
import {
  branches,
  customers as initialCustomers,
  transactions as initialTransactions,
  inventoryItems as initialInventory,
  packets as initialPackets,
  vaults as initialVaults,
  branchTransfers as initialTransfers,
  employees as initialEmployees,
  evidenceRecords as initialEvidence,
  payments as initialPayments,
  approvals as initialApprovals,
  auditLogs as initialAuditLogs,
  currentRates as initialRates,
  type Customer,
  type Transaction,
  type InventoryItem,
  type Packet,
  type Vault,
  type BranchTransfer,
  type Employee,
  type EvidenceItem,
  type PaymentRecord,
  type ApprovalRequest,
  type AuditLogEntry,
  type MetalRate,
} from "./erp-data";
import { toast } from "sonner";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Branch Manager" | "Finance" | "Admin" | "Gold Appraiser";
  branch: string;
  accessibleBranches: string[];
  permissions: string[];
};

export const DEMO_USERS: Record<string, { pass: string; user: AuthUser }> = {
  "ADM001": {
    pass: "Admin@123",
    user: {
      id: "ADM001",
      name: "R. Srinivas",
      email: "srinivas@avpgold.com",
      role: "Super Admin",
      branch: "All Branches",
      accessibleBranches: ["All Branches", "Hyderabad", "Vijayawada", "Tirupati", "Kurnool", "Visakhapatnam"],
      permissions: ["*"],
    },
  },
  "BM001": {
    pass: "Branch@123",
    user: {
      id: "BM001",
      name: "K. Satyanarayana",
      email: "bm.hyd@avpgold.com",
      role: "Branch Manager",
      branch: "Hyderabad",
      accessibleBranches: ["Hyderabad"],
      permissions: ["branch:manage", "transactions:view", "transactions:create", "approvals:branch", "inventory:view"],
    },
  },
  "BM002": {
    pass: "Branch@123",
    user: {
      id: "BM002",
      name: "M. Lakshmi",
      email: "bm.vja@avpgold.com",
      role: "Branch Manager",
      branch: "Vijayawada",
      accessibleBranches: ["Vijayawada"],
      permissions: ["branch:manage", "transactions:view", "transactions:create", "approvals:branch", "inventory:view"],
    },
  },
  "BM003": {
    pass: "Branch@123",
    user: {
      id: "BM003",
      name: "S. Karthik",
      email: "bm.tpt@avpgold.com",
      role: "Branch Manager",
      branch: "Tirupati",
      accessibleBranches: ["Tirupati"],
      permissions: ["branch:manage", "transactions:view", "transactions:create", "approvals:branch", "inventory:view"],
    },
  },
  "FIN001": {
    pass: "Finance@123",
    user: {
      id: "FIN001",
      name: "V. Padmavathi",
      email: "finance@avpgold.com",
      role: "Finance",
      branch: "All Branches",
      accessibleBranches: ["All Branches", "Hyderabad", "Vijayawada", "Tirupati", "Kurnool", "Visakhapatnam"],
      permissions: ["accounting:view", "reconciliation:manage", "payments:manage", "reports:view"],
    },
  },
};

type ERPStoreContextType = {
  // Auth state
  currentUser: AuthUser;
  isAuthenticated: boolean;
  login: (employeeId: string, pass: string, branch?: string) => { success: boolean; error?: string };
  logout: () => void;
  canAccessBranch: (branch: string) => boolean;
  hasPermission: (permission: string) => boolean;
  // Branch state
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  // State lists:
  customers: Customer[];
  transactions: Transaction[];
  inventory: InventoryItem[];
  packets: Packet[];
  vaults: Vault[];
  transfers: BranchTransfer[];
  employees: Employee[];
  evidence: EvidenceItem[];
  payments: PaymentRecord[];
  approvals: ApprovalRequest[];
  auditLogs: AuditLogEntry[];
  rates: MetalRate[];
  // Filtered views by selected branch:
  filteredTransactions: Transaction[];
  filteredCustomers: Customer[];
  filteredInventory: InventoryItem[];
  filteredPackets: Packet[];
  filteredApprovals: ApprovalRequest[];
  filteredPayments: PaymentRecord[];
  filteredEmployees: Employee[];
  filteredEvidence: EvidenceItem[];
  filteredVaults: Vault[];
  filteredTransfers: BranchTransfer[];
  filteredAuditLogs: AuditLogEntry[];
  // Mutators:
  addCustomer: (customer: Customer) => void;
  updateCustomerKYC: (customerId: string, status: Customer["kycStatus"], notes?: string) => void;
  createTransaction: (txn: Transaction) => void;
  updateTransactionStatus: (id: string, status: Transaction["status"], notes?: string) => void;
  approveTransaction: (id: string) => void;
  recordBankPayment: (id: string, paymentRef: string, amount: number) => void;
  recordMetalRelease: (id: string, liaisonOfficer: string) => void;
  recordMetalReceived: (id: string, receivingOfficer: string) => void;
  recordPurityTestResult: (id: string, testedPurity: number, testedBy: string) => void;
  completeCustomerSettlement: (id: string, method: Transaction["paymentMethod"], ref: string) => void;
  addEvidence: (item: EvidenceItem) => void;
  verifyEvidence: (id: string) => void;
  createBranchTransfer: (trf: BranchTransfer) => void;
  updateTransferStatus: (id: string, status: BranchTransfer["status"]) => void;
  updateRate: (metal: "Gold" | "Silver", purityKarat: string, rate: number) => void;
};

const ERPStoreContext = createContext<ERPStoreContextType | null>(null);

export function ERPStoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("avp_gold_auth_user");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return DEMO_USERS["ADM001"]!.user;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const auth = localStorage.getItem("avp_gold_is_auth");
        if (auth !== null) return auth === "true";
      } catch (e) {
        // ignore
      }
    }
    return true;
  });

  const [selectedBranch, setSelectedBranchState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const b = localStorage.getItem("avp_gold_active_branch");
        if (b) return b;
      } catch (e) {
        // ignore
      }
    }
    return "All Branches";
  });

  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [packets, setPackets] = useState<Packet[]>(initialPackets);
  const [vaults, setVaults] = useState<Vault[]>(initialVaults);
  const [transfers, setTransfers] = useState<BranchTransfer[]>(initialTransfers);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [evidence, setEvidence] = useState<EvidenceItem[]>(initialEvidence);
  const [payments, setPayments] = useState<PaymentRecord[]>(initialPayments);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(initialApprovals);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [rates, setRates] = useState<MetalRate[]>(initialRates);

  // Helper to log audit event
  const logAudit = (module: AuditLogEntry["module"], action: string, refId: string, prev: string, next: string) => {
    const entry: AuditLogEntry = {
      id: `AUD-90${String(1000 + auditLogs.length + 1)}`,
      timestamp: `${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}, ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST`,
      user: currentUser ? currentUser.name : "R. Srinivas",
      role: currentUser ? currentUser.role : "Super Admin",
      branch: selectedBranch === "All Branches" ? (currentUser?.branch !== "All Branches" ? currentUser.branch : "Hyderabad") : selectedBranch,
      module,
      action,
      referenceId: refId,
      previousValue: prev,
      newValue: next,
      status: "Success",
      ipAddress: "10.14.12.104",
    };
    setAuditLogs((prevLogs) => [entry, ...prevLogs]);
  };

  // Branch Switcher with Authorization Guard
  const setSelectedBranch = (branch: string) => {
    if (currentUser.role === "Branch Manager" && branch !== currentUser.branch) {
      toast.error(`Access Restricted: Your account is locked to ${currentUser.branch} branch.`);
      return;
    }
    setSelectedBranchState(branch);
    if (typeof window !== "undefined") {
      localStorage.setItem("avp_gold_active_branch", branch);
    }
  };

  // Login handler
  const login = (employeeId: string, pass: string, branch?: string) => {
    const key = employeeId.trim().toUpperCase();
    const demo = DEMO_USERS[key];
    if (!demo || demo.pass !== pass.trim()) {
      return { success: false, error: "Invalid Employee ID or Password. Check credentials." };
    }

    if (demo.user.role === "Branch Manager" && branch && branch !== "All Branches" && branch !== demo.user.branch) {
      return { success: false, error: `${demo.user.name} is restricted strictly to ${demo.user.branch} branch.` };
    }

    const assignedBranch = demo.user.role === "Super Admin" 
      ? (branch || "All Branches") 
      : demo.user.branch;

    setCurrentUser(demo.user);
    setIsAuthenticated(true);
    setSelectedBranchState(assignedBranch);

    if (typeof window !== "undefined") {
      localStorage.setItem("avp_gold_auth_user", JSON.stringify(demo.user));
      localStorage.setItem("avp_gold_is_auth", "true");
      localStorage.setItem("avp_gold_active_branch", assignedBranch);
    }

    logAudit("Security", `User Login`, demo.user.id, "Logged Out", `Active Session: ${demo.user.role} (${assignedBranch})`);
    return { success: true };
  };

  // Logout handler
  const logout = () => {
    logAudit("Security", `User Logout`, currentUser.id, `Active (${selectedBranch})`, "Logged Out");
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("avp_gold_is_auth", "false");
    }
    toast.info("Signed out of AVP Gold ERP");
  };

  const canAccessBranch = (branch: string) => {
    if (currentUser.role === "Super Admin") return true;
    return currentUser.accessibleBranches.includes(branch);
  };

  const hasPermission = (permission: string) => {
    if (currentUser.permissions.includes("*")) return true;
    return currentUser.permissions.includes(permission);
  };

  // Filtered views based on selectedBranch
  const effectiveBranch = currentUser.role === "Branch Manager" ? currentUser.branch : selectedBranch;

  const filteredTransactions = useMemo(
    () => (effectiveBranch === "All Branches" ? transactions : transactions.filter((t) => t.branch === effectiveBranch)),
    [transactions, effectiveBranch]
  );

  const filteredCustomers = useMemo(
    () => (effectiveBranch === "All Branches" ? customers : customers.filter((c) => c.branch === effectiveBranch)),
    [customers, effectiveBranch]
  );

  const filteredInventory = useMemo(
    () => (effectiveBranch === "All Branches" ? inventory : inventory.filter((i) => i.branch === effectiveBranch)),
    [inventory, effectiveBranch]
  );

  const filteredPackets = useMemo(
    () => (effectiveBranch === "All Branches" ? packets : packets.filter((p) => p.branch === effectiveBranch)),
    [packets, effectiveBranch]
  );

  const filteredApprovals = useMemo(
    () => (effectiveBranch === "All Branches" ? approvals : approvals.filter((a) => a.branch === effectiveBranch)),
    [approvals, effectiveBranch]
  );

  const filteredPayments = useMemo(
    () => (effectiveBranch === "All Branches" ? payments : payments.filter((p) => p.branch === effectiveBranch)),
    [payments, effectiveBranch]
  );

  const filteredEmployees = useMemo(
    () => (effectiveBranch === "All Branches" ? employees : employees.filter((e) => e.branch === effectiveBranch)),
    [employees, effectiveBranch]
  );

  const filteredEvidence = useMemo(
    () => (effectiveBranch === "All Branches" ? evidence : evidence.filter((ev) => ev.branch === effectiveBranch)),
    [evidence, effectiveBranch]
  );

  const filteredVaults = useMemo(
    () => (effectiveBranch === "All Branches" ? vaults : vaults.filter((v) => v.branch === effectiveBranch)),
    [vaults, effectiveBranch]
  );

  const filteredTransfers = useMemo(
    () => (effectiveBranch === "All Branches" ? transfers : transfers.filter((tr) => tr.fromBranch === effectiveBranch || tr.toBranch === effectiveBranch)),
    [transfers, effectiveBranch]
  );

  const filteredAuditLogs = useMemo(
    () => (effectiveBranch === "All Branches" ? auditLogs : auditLogs.filter((a) => a.branch === effectiveBranch)),
    [auditLogs, effectiveBranch]
  );

  // Actions
  const addCustomer = (newCust: Customer) => {
    setCustomers((prev) => [newCust, ...prev]);
    logAudit("KYC", "Customer registered in system", newCust.id, "—", `Created with KYC: ${newCust.kycStatus}`);
    toast.success(`Customer ${newCust.name} added successfully`);
  };

  const updateCustomerKYC = (customerId: string, status: Customer["kycStatus"], notes?: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, kycStatus: status, verifiedBy: status === "Verified" ? "R. Srinivas (Ops Manager)" : undefined } : c))
    );
    logAudit("KYC", `Customer KYC status updated to ${status}`, customerId, "Previous Status", status);
    toast.success(`Customer KYC status changed to ${status}`);
  };

  const createTransaction = (txn: Transaction) => {
    setTransactions((prev) => [txn, ...prev]);
    logAudit(
      txn.type === "Bank Pledged" ? "Bank Pledged" : "Old Purchase",
      `New ${txn.type} transaction initiated for ${txn.customerName}`,
      txn.id,
      "—",
      `Gross Value: ₹${txn.grossMetalValue.toLocaleString("en-IN")}`
    );
    toast.success(`Transaction ${txn.id} created successfully`);
  };

  const updateTransactionStatus = (id: string, status: Transaction["status"], notes?: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, notes: notes ? `${t.notes || ""} | ${notes}` : t.notes } : t))
    );
    logAudit("Old Purchase", `Transaction status updated to ${status}`, id, "Status updated", status);
    toast.info(`Transaction ${id} status updated to ${status}`);
  };

  const approveTransaction = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.type === "Bank Pledged" ? "Bank Payment Pending" : "Valuation",
              approvedBy: "R. Srinivas (Ops Head)",
              approvalDate: new Date().toLocaleDateString("en-GB"),
            }
          : t
      )
    );
    setApprovals((prev) => prev.map((a) => (a.transactionId === id ? { ...a, status: "Approved" } : a)));
    logAudit("Valuation", "Transaction approved by Operations Head", id, "Pending Approval", "Approved");
    toast.success(`Transaction ${id} has been approved.`);
  };

  const recordBankPayment = (id: string, paymentRef: string, amount: number) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.metal === "Gold" ? "Gold Release Pending" : "Silver Release Pending",
              bankPaymentRef: paymentRef,
              bankPaidDate: new Date().toLocaleDateString("en-GB"),
            }
          : t
      )
    );
    const newPayment: PaymentRecord = {
      id: `PAY-B-${Math.floor(1000 + Math.random() * 9000)}`,
      transactionId: id,
      partyName: "Bank Loan Dept",
      partyType: "Bank",
      amount,
      paymentMethod: "RTGS",
      referenceNumber: paymentRef,
      branch: selectedBranch === "All Branches" ? "Hyderabad" : selectedBranch,
      date: new Date().toLocaleDateString("en-GB"),
      status: "Completed",
      approvedBy: "R. Srinivas",
    };
    setPayments((prev) => [newPayment, ...prev]);
    logAudit("Bank Settlement", `Bank outstanding RTGS payment recorded (Ref: ${paymentRef})`, id, "Bank Payment Pending", `Paid ₹${amount.toLocaleString("en-IN")}`);
    toast.success(`Bank payment of ₹${amount.toLocaleString("en-IN")} recorded.`);
  };

  const recordMetalRelease = (id: string, liaisonOfficer: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.metal === "Gold" ? "Gold Received" : "Silver Received",
              releasedBy: liaisonOfficer,
              releaseDate: new Date().toLocaleDateString("en-GB"),
            }
          : t
      )
    );
    logAudit("Bank Pledged", `Metal released from bank vault by liaison officer: ${liaisonOfficer}`, id, "Release Pending", "Metal Released");
    toast.success(`Metal release confirmed by ${liaisonOfficer}.`);
  };

  const recordMetalReceived = (id: string, receivingOfficer: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: "Testing",
              receivedBy: receivingOfficer,
              receivedDate: new Date().toLocaleDateString("en-GB"),
            }
          : t
      )
    );
    logAudit("Bank Pledged", `Metal received at AVP branch custody by: ${receivingOfficer}`, id, "Metal Released", "Testing Queue");
    toast.success(`Metal received and placed into Testing Queue.`);
  };

  const recordPurityTestResult = (id: string, testedPurity: number, testedBy: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const fineWeight = Number(((t.totalNetWeight * testedPurity) / 100).toFixed(2));
        const grossValue = Math.round(fineWeight * t.applicableRate);
        const customerPayable = Math.max(0, grossValue - t.totalDeductions);
        return {
          ...t,
          status: "Valuation",
          averagePurity: testedPurity,
          totalFineWeight: fineWeight,
          grossMetalValue: grossValue,
          customerPayable,
          assignedAppraiser: testedBy,
        };
      })
    );
    logAudit("Testing", `Purity test assay verified: ${testedPurity}% by ${testedBy}`, id, "Under Testing", `Tested ${testedPurity}%`);
    toast.success(`Purity test completed (${testedPurity}%). Forwarded to Valuation.`);
  };

  const completeCustomerSettlement = (id: string, method: Transaction["paymentMethod"], ref: string) => {
    let settledTxn: Transaction | undefined;
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          settledTxn = {
            ...t,
            status: "Completed",
            settlementStatus: "Paid",
            paymentMethod: method,
            paymentReference: ref,
          };
          return settledTxn;
        }
        return t;
      })
    );
    if (settledTxn) {
      const newPayment: PaymentRecord = {
        id: `PAY-C-${Math.floor(1000 + Math.random() * 9000)}`,
        transactionId: id,
        partyName: settledTxn.customerName,
        partyType: "Customer",
        amount: settledTxn.customerPayable,
        paymentMethod: method || "Bank Transfer",
        referenceNumber: ref,
        branch: settledTxn.branch,
        date: new Date().toLocaleDateString("en-GB"),
        status: "Completed",
        approvedBy: "T. Suresh (Finance Desk)",
      };
      setPayments((prev) => [newPayment, ...prev]);

      // Add to inventory
      const newInvItem: InventoryItem = {
        id: settledTxn.items[0]?.id || `ITM-${Math.floor(5000 + Math.random() * 4000)}`,
        packetId: settledTxn.packetId || `PKT-${Math.floor(800 + Math.random() * 200)}`,
        sourceTransactionId: settledTxn.id,
        sourceType: settledTxn.type,
        metal: settledTxn.metal,
        description: settledTxn.items[0]?.description || `${settledTxn.metal} Item Intake`,
        grossWeight: settledTxn.totalGrossWeight,
        netWeight: settledTxn.totalNetWeight,
        purity: `${settledTxn.averagePurity}%`,
        purityPercent: settledTxn.averagePurity,
        fineWeight: settledTxn.totalFineWeight,
        costValue: settledTxn.customerPayable + (settledTxn.bankPaymentAmount || 0),
        marketValue: settledTxn.grossMetalValue,
        branch: settledTxn.branch,
        vaultName: `${settledTxn.branch} Main Vault`,
        shelfSlot: `Tray A-01`,
        intakeDate: new Date().toLocaleDateString("en-GB"),
        status: "In Vault",
      };
      setInventory((prev) => [newInvItem, ...prev]);
    }
    logAudit("Customer Settlement", `Customer final settlement disbursement executed via ${method} (Ref: ${ref})`, id, "Settlement Pending", "Completed & Transferred to Vault");
    toast.success(`Customer settlement finalized and metal transferred to Vault.`);
  };

  const addEvidence = (item: EvidenceItem) => {
    setEvidence((prev) => [item, ...prev]);
    logAudit("Security", `Evidence photo attached: ${item.title} (${item.category})`, item.transactionId, "—", item.filename);
    toast.success(`Evidence photo uploaded and indexed.`);
  };

  const verifyEvidence = (id: string) => {
    setEvidence((prev) => prev.map((e) => (e.id === id ? { ...e, verificationStatus: "Verified" } : e)));
    toast.success(`Evidence marked as Verified.`);
  };

  const createBranchTransfer = (trf: BranchTransfer) => {
    setTransfers((prev) => [trf, ...prev]);
    logAudit("Transfers", `Branch custody transfer pass created from ${trf.fromBranch} to ${trf.toBranch}`, trf.id, "—", `${trf.totalWeightGrams}g ${trf.metal}`);
    toast.success(`Branch transfer ${trf.id} requested.`);
  };

  const updateTransferStatus = (id: string, status: BranchTransfer["status"]) => {
    setTransfers((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    logAudit("Transfers", `Branch transfer status updated to ${status}`, id, "Status updated", status);
    toast.info(`Transfer status changed to ${status}`);
  };

  const updateRate = (metal: "Gold" | "Silver", purityKarat: string, rate: number) => {
    setRates((prev) =>
      prev.map((r) => (r.metal === metal && r.purityKarat === purityKarat ? { ...r, ratePerGram: rate, effectiveTime: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST" } : r))
    );
    logAudit("Rates", `Metal benchmark rate updated: ${metal} ${purityKarat} to ₹${rate}/g`, `${metal}-${purityKarat}`, "Rate modified", `₹${rate}/g`);
    toast.success(`${metal} rate for ${purityKarat} updated to ₹${rate}/g.`);
  };

  return (
    <ERPStoreContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        canAccessBranch,
        hasPermission,
        selectedBranch,
        setSelectedBranch,
        customers,
        transactions,
        inventory,
        packets,
        vaults,
        transfers,
        employees,
        evidence,
        payments,
        approvals,
        auditLogs,
        rates,
        filteredTransactions,
        filteredCustomers,
        filteredInventory,
        filteredPackets,
        filteredApprovals,
        filteredPayments,
        filteredEmployees,
        filteredEvidence,
        filteredVaults,
        filteredTransfers,
        filteredAuditLogs,
        addCustomer,
        updateCustomerKYC,
        createTransaction,
        updateTransactionStatus,
        approveTransaction,
        recordBankPayment,
        recordMetalRelease,
        recordMetalReceived,
        recordPurityTestResult,
        completeCustomerSettlement,
        addEvidence,
        verifyEvidence,
        createBranchTransfer,
        updateTransferStatus,
        updateRate,
      }}
    >
      {children}
    </ERPStoreContext.Provider>
  );
}

export function useERPStore() {
  const context = useContext(ERPStoreContext);
  if (!context) {
    throw new Error("useERPStore must be used within an ERPStoreProvider");
  }
  return context;
}
