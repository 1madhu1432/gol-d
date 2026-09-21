export type Metal = "Gold" | "Silver";

export type Customer = {
  id: string;
  name: string;
  mobile: string;
  alternateMobile?: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  dob: string;
  idType: "Aadhaar" | "PAN" | "Voter ID" | "Passport";
  idNumber: string;
  branch: string;
  kycStatus: "Verified" | "Submitted" | "Pending" | "Rejected" | "Correction Required";
  kycType: string;
  verifiedBy?: string;
  createdDate: string;
  photoUrl: string;
  status: "Active" | "On Hold" | "Inactive";
  totalTransactions: number;
  goldWeight: number;
  silverWeight: number;
  totalValue: number;
  lastTransaction: string;
};

export type TransactionType = "Old Metal Purchase" | "Bank Pledged";

export type TransactionStatus =
  | "Draft"
  | "Verification"
  | "Approved"
  | "Bank Payment Pending"
  | "Bank Paid"
  | "Gold Release Pending"
  | "Gold Received"
  | "Silver Release Pending"
  | "Silver Received"
  | "Testing"
  | "Valuation"
  | "Settlement Pending"
  | "Customer Paid"
  | "Inventory"
  | "Completed"
  | "On Hold"
  | "Rejected";

export type MetalItem = {
  id: string;
  description: string;
  metal: Metal;
  grossWeight: number;
  stoneWeight: number;
  netWeight: number;
  purityPercent: number; // e.g. 91.6
  purityKarat: string; // e.g. "22K"
  fineWeight: number; // netWeight * (purityPercent / 100)
  ratePerGram: number;
  grossValue: number;
  hallmarked: boolean;
};

export type Transaction = {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  branch: string;
  metal: Metal;
  type: TransactionType;
  items: MetalItem[];
  totalGrossWeight: number;
  totalNetWeight: number;
  averagePurity: number;
  totalFineWeight: number;
  applicableRate: number;
  grossMetalValue: number;
  // Bank Pledged specific fields:
  bankName?: string;
  bankBranch?: string;
  loanAccountNumber?: string;
  pledgeReference?: string;
  originalLoanAmount?: number;
  bankOutstandingAmount?: number;
  bankInterestAmount?: number;
  bankPaymentAmount?: number;
  bankPaymentRef?: string;
  bankPaidDate?: string;
  releaseDate?: string;
  releasedBy?: string;
  receivedDate?: string;
  receivedBy?: string;
  // Charges & Deductions:
  serviceFee: number;
  processingFee: number;
  testingFee: number;
  bankExpenses: number;
  commission: number;
  otherDeductions: number;
  totalDeductions: number;
  customerPayable: number;
  // Status & custody tracking:
  status: TransactionStatus;
  date: string;
  time: string;
  assignedAppraiser: string;
  approvedBy?: string;
  approvalDate?: string;
  settlementStatus: "Pending" | "Approved" | "Ready for Payment" | "Paid" | "Failed" | "Cancelled";
  paymentMethod?: "Bank Transfer" | "UPI" | "Cash" | "RTGS" | "NEFT";
  paymentReference?: string;
  packetId?: string;
  vaultLocation?: string;
  notes?: string;
};

export type InventoryItem = {
  id: string;
  packetId: string;
  sourceTransactionId: string;
  sourceType: TransactionType;
  metal: Metal;
  description: string;
  grossWeight: number;
  netWeight: number;
  purity: string;
  purityPercent: number;
  fineWeight: number;
  costValue: number;
  marketValue: number;
  branch: string;
  vaultName: string;
  shelfSlot: string;
  intakeDate: string;
  status: "Received" | "Testing" | "Verified" | "Packeted" | "In Vault" | "In Transfer" | "Released" | "Sold / Disposed" | "Hold";
};

export type Packet = {
  id: string;
  qrCode: string;
  metal: Metal;
  totalGrossWeight: number;
  totalNetWeight: number;
  purity: string;
  fineWeight: number;
  estimatedValue: number;
  transactionId: string;
  customerName: string;
  branch: string;
  vaultName: string;
  slotNumber: string;
  sealNumber: string;
  createdDate: string;
  sealedBy: string;
  status: "Created" | "Sealed" | "In Vault" | "Dispatched" | "In Transit" | "Received" | "Verified" | "Opened" | "Closed";
  itemCount: number;
};

export type Vault = {
  id: string;
  name: string;
  branch: string;
  capacityKg: number;
  currentGoldGrams: number;
  currentSilverGrams: number;
  packetCount: number;
  totalValue: number;
  manager: string;
  securityRating: string;
  lastAudited: string;
};

export type BranchTransfer = {
  id: string;
  fromBranch: string;
  toBranch: string;
  packetIds: string[];
  totalWeightGrams: number;
  metal: Metal;
  totalValue: number;
  requestedBy: string;
  approvedBy?: string;
  courierPersonnel: string;
  dispatchDate?: string;
  receivedDate?: string;
  status: "Draft" | "Pending Approval" | "Approved" | "Dispatched" | "In Transit" | "Received" | "Verified" | "Completed" | "Rejected";
};

export type Employee = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  branch: string;
  department: "Operations" | "Appraisal" | "Finance" | "Management" | "Audit" | "Security";
  role: "Super Admin" | "Admin" | "Branch Manager" | "Operations Executive" | "Gold Appraiser" | "Silver Appraiser" | "Finance" | "Auditor" | "Inventory Manager" | "Cashier";
  status: "Active" | "On Leave" | "Suspended";
  joinDate: string;
  permissionsCount: number;
};

export type EvidenceItem = {
  id: string;
  transactionId: string;
  customerId: string;
  category:
    | "Customer"
    | "KYC"
    | "Gold"
    | "Silver"
    | "Weight"
    | "Testing"
    | "Bank Pledge"
    | "Receiving"
    | "Packet"
    | "Settlement";
  title: string;
  filename: string;
  url: string;
  uploadedBy: string;
  branch: string;
  timestamp: string;
  verificationStatus: "Verified" | "Pending Review" | "Flagged";
  notes?: string;
};

export type PaymentRecord = {
  id: string;
  transactionId: string;
  partyName: string;
  partyType: "Customer" | "Bank";
  amount: number;
  paymentMethod: "Bank Transfer" | "UPI" | "Cash" | "RTGS" | "NEFT";
  referenceNumber: string;
  branch: string;
  date: string;
  status: "Completed" | "Pending" | "Failed" | "Reconciliation Pending";
  approvedBy: string;
};

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  branch: string;
  module:
    | "Old Purchase"
    | "Bank Pledged"
    | "Testing"
    | "Valuation"
    | "Customer Settlement"
    | "Bank Settlement"
    | "Inventory"
    | "Vault"
    | "Transfers"
    | "KYC"
    | "Rates"
    | "Security";
  action: string;
  referenceId: string;
  previousValue: string;
  newValue: string;
  status: "Success" | "Flagged" | "Rejected";
  ipAddress: string;
};

export type ApprovalRequest = {
  id: string;
  type:
    | "Gold Purchase"
    | "Silver Purchase"
    | "Bank Pledged Gold"
    | "Bank Pledged Silver"
    | "Valuation Exemption"
    | "Customer Settlement"
    | "Bank Payment Release"
    | "Inventory Adjustment"
    | "Branch Transfer";
  transactionId: string;
  customerName: string;
  branch: string;
  amount: number;
  requestedBy: string;
  requestedDate: string;
  priority: "Low" | "Normal" | "High" | "Urgent";
  status: "Pending" | "Approved" | "Rejected" | "Correction Required";
  reason: string;
};

export type MetalRate = {
  metal: Metal;
  purityKarat: string;
  purityPercent: number;
  ratePerGram: number;
  effectiveDate: string;
  effectiveTime: string;
  source: string;
  change24h: number;
  branchAdjustments: Record<string, number>;
};

// -------------------------------------------------------------
// SEED MASTER DATA
// -------------------------------------------------------------

export const branches = [
  { name: "Hyderabad", code: "HYD-01", region: "Telangana", manager: "R. Srinivas", employees: 22, target: 45000000, achieved: 39400000, status: "Active", address: "AVP Towers, Rd No. 36, Jubilee Hills, Hyderabad - 500033" },
  { name: "Vijayawada", code: "VJA-02", region: "Coastal Andhra", manager: "M. Lakshmi", employees: 16, target: 34000000, achieved: 31200000, status: "Active", address: "MG Road, Opposite Sub-Collector Office, Vijayawada - 520002" },
  { name: "Tirupati", code: "TPT-03", region: "Rayalaseema", manager: "S. Karthik", employees: 14, target: 28000000, achieved: 24900000, status: "Active", address: "Bhavani Nagar, Air Bypass Road, Tirupati - 517501" },
  { name: "Kurnool", code: "KNL-04", region: "Rayalaseema", manager: "A. Praveen", employees: 12, target: 24000000, achieved: 20800000, status: "Active", address: "Near Collectorate, Old Bus Stand Road, Kurnool - 518001" },
  { name: "Visakhapatnam", code: "VSK-05", region: "North Andhra", manager: "P. Anusha", employees: 18, target: 38000000, achieved: 34500000, status: "Active", address: "Dwaraka Nagar, Main Road, Visakhapatnam - 530016" },
];

export const regions = [
  { id: "REG-TS", name: "Telangana Central", head: "R. Srinivas", branchCount: 1, goldVolumeGrams: 28400, silverVolumeKg: 460, targetRupees: 45000000, achievedRupees: 39400000 },
  { id: "REG-AP-C", name: "Coastal Andhra", head: "M. Lakshmi", branchCount: 1, goldVolumeGrams: 21600, silverVolumeKg: 340, targetRupees: 34000000, achievedRupees: 31200000 },
  { id: "REG-AP-R", name: "Rayalaseema", head: "S. Karthik", branchCount: 2, goldVolumeGrams: 32800, silverVolumeKg: 490, targetRupees: 52000000, achievedRupees: 45700000 },
  { id: "REG-AP-N", name: "North Andhra", head: "P. Anusha", branchCount: 1, goldVolumeGrams: 24200, silverVolumeKg: 390, targetRupees: 38000000, achievedRupees: 34500000 },
];

export const partnerBanks = [
  { name: "State Bank of India", code: "SBIN", branchesInState: 1420, ifscPrefix: "SBIN00", contactDesk: "Gold Loan Processing Hub, Hyderabad" },
  { name: "HDFC Bank", code: "HDFC", branchesInState: 680, ifscPrefix: "HDFC00", contactDesk: "Retail Agri & Gold Desk" },
  { name: "Canara Bank", code: "CNRB", branchesInState: 540, ifscPrefix: "CNRB00", contactDesk: "Commercial Gold Credit Cell" },
  { name: "Union Bank of India", code: "UBIN", branchesInState: 610, ifscPrefix: "UBIN00", contactDesk: "Regional Metal Advances Dept" },
  { name: "Andhra Pradesh Grameena Vikas Bank", code: "APGV", branchesInState: 760, ifscPrefix: "APGV00", contactDesk: "Priority Rural Gold Desk" },
  { name: "ICICI Bank", code: "ICIC", branchesInState: 510, ifscPrefix: "ICIC00", contactDesk: "Secured Consumer Advances" },
  { name: "Bank of Baroda", code: "BARB", branchesInState: 430, ifscPrefix: "BARB00", contactDesk: "Gold Loan Central Processing" },
  { name: "Axis Bank", code: "UTIB", branchesInState: 390, ifscPrefix: "UTIB00", contactDesk: "Retail Secured Assets Hub" },
  { name: "Kotak Mahindra Bank", code: "KKBK", branchesInState: 220, ifscPrefix: "KKBK00", contactDesk: "Gold Loan Division, Somajiguda" },
  { name: "Punjab National Bank", code: "PUNB", branchesInState: 290, ifscPrefix: "PUNB00", contactDesk: "Zonal Credit Office, Vijayawada" },
];

export const currentRates: MetalRate[] = [
  {
    metal: "Gold",
    purityKarat: "24K (999)",
    purityPercent: 99.9,
    ratePerGram: 7420,
    effectiveDate: "21 Sep 2026",
    effectiveTime: "09:30 AM IST",
    source: "Bullion Federation Reference + Market Premium",
    change24h: 35,
    branchAdjustments: { Hyderabad: 0, Vijayawada: -10, Tirupati: -15, Kurnool: -20, Visakhapatnam: -10 },
  },
  {
    metal: "Gold",
    purityKarat: "22K (916)",
    purityPercent: 91.6,
    ratePerGram: 6850,
    effectiveDate: "21 Sep 2026",
    effectiveTime: "09:30 AM IST",
    source: "IBJA Standard 22K Closing + Live Spot",
    change24h: 32,
    branchAdjustments: { Hyderabad: 0, Vijayawada: -10, Tirupati: -15, Kurnool: -20, Visakhapatnam: -10 },
  },
  {
    metal: "Gold",
    purityKarat: "20K (833)",
    purityPercent: 83.3,
    ratePerGram: 6210,
    effectiveDate: "21 Sep 2026",
    effectiveTime: "09:30 AM IST",
    source: "AVP Assay Benchmark",
    change24h: 28,
    branchAdjustments: { Hyderabad: 0, Vijayawada: -10, Tirupati: -15, Kurnool: -20, Visakhapatnam: -10 },
  },
  {
    metal: "Gold",
    purityKarat: "18K (750)",
    purityPercent: 75.0,
    ratePerGram: 5580,
    effectiveDate: "21 Sep 2026",
    effectiveTime: "09:30 AM IST",
    source: "AVP Assay Benchmark",
    change24h: 25,
    branchAdjustments: { Hyderabad: 0, Vijayawada: -10, Tirupati: -15, Kurnool: -20, Visakhapatnam: -10 },
  },
  {
    metal: "Silver",
    purityKarat: "999 Fine Silver",
    purityPercent: 99.9,
    ratePerGram: 94.5,
    effectiveDate: "21 Sep 2026",
    effectiveTime: "09:30 AM IST",
    source: "MCX Spot Baseline",
    change24h: 1.2,
    branchAdjustments: { Hyderabad: 0, Vijayawada: -0.2, Tirupati: -0.3, Kurnool: -0.4, Visakhapatnam: -0.2 },
  },
  {
    metal: "Silver",
    purityKarat: "925 Sterling Silver",
    purityPercent: 92.5,
    ratePerGram: 87.2,
    effectiveDate: "21 Sep 2026",
    effectiveTime: "09:30 AM IST",
    source: "MCX Spot Benchmark",
    change24h: 1.0,
    branchAdjustments: { Hyderabad: 0, Vijayawada: -0.2, Tirupati: -0.3, Kurnool: -0.4, Visakhapatnam: -0.2 },
  },
];

export const chargeConfigurations = [
  { id: "CHG-01", name: "Service Charge", type: "Percentage", value: 1.5, minAmount: 500, maxAmount: 15000, description: "Standard evaluation and handling charge on gross metal value" },
  { id: "CHG-02", name: "Processing Fee", type: "Flat", value: 1200, minAmount: 1200, maxAmount: 1200, description: "Documentation, KYC validation and legal check fee" },
  { id: "CHG-03", name: "Testing & Assay Fee", type: "Flat", value: 450, minAmount: 450, maxAmount: 1500, description: "Spectrometer XRF assay test and crucible check" },
  { id: "CHG-04", name: "Bank Conveyance & Escort", type: "Flat", value: 2500, minAmount: 2000, maxAmount: 5000, description: "Applicable for Bank-Pledged releases (secured personnel transport & branch release officer)" },
  { id: "CHG-05", name: "Executive Commission", type: "Percentage", value: 0.75, minAmount: 300, maxAmount: 25000, description: "Branch appraisal team and operations commission" },
];

// Realistic Indian Names for generation
const firstNames = [
  "Aarav", "Saanvi", "Vikram", "Ananya", "Arjun", "Diya", "Rohan", "Meera", "Kiran", "Nandini",
  "Sai", "Priya", "Rahul", "Kavya", "Aditya", "Lakshmi", "Harini", "Naveen", "Swathi", "Manoj",
  "Suresh", "Bhavana", "Chaitanya", "Deepa", "Gautam", "Indira", "Jagadish", "Keerthi", "Mahesh", "Pranavi",
  "Rajesh", "Sandhya", "Tarun", "Uma", "Vamsi", "Yamini", "Bhaskar", "Padmaja", "Ramesh", "Sunitha"
];

const lastNames = [
  "Reddy", "Rao", "Naidu", "Sharma", "Kumar", "Varma", "Iyer", "Babu", "Gupta", "Menon",
  "Nair", "Prasad", "Devi", "Chowdary", "Kalyan", "Murthy", "Raju", "Sastry", "Venkatesh", "Somayajula",
  "Goud", "Bhat", "Pillai", "Deshmukh", "Patnaik", "Singhania", "Joshi", "Aggarwal", "Reddanna", "Maddineni"
];

// Generate 105 Realistic Customers
export const customers: Customer[] = Array.from({ length: 105 }, (_, i) => {
  const fName = firstNames[i % firstNames.length];
  const lName = lastNames[(i * 3 + Math.floor(i / 5)) % lastNames.length];
  const fullName = `${fName} ${lName}`;
  const branch = branches[i % branches.length].name;
  const kycStatuses: Customer["kycStatus"][] = ["Verified", "Verified", "Verified", "Submitted", "Pending", "Correction Required", "Rejected"];
  const kycStatus = kycStatuses[i % kycStatuses.length];
  const idTypes: Customer["idType"][] = ["Aadhaar", "PAN", "Voter ID", "Passport"];
  const idType = idTypes[i % idTypes.length];
  const phoneSuffix = String(20000000 + (i * 73913) % 79999999).padStart(8, "0");
  const mobile = `+91 ${[98, 97, 96, 94, 91, 93][i % 6]}${phoneSuffix}`;
  const goldWeight = Number((12.5 + (i % 17) * 9.8 + (i % 3) * 4.2).toFixed(2));
  const silverWeight = Number((150 + (i % 19) * 120 + (i % 7) * 35).toFixed(2));
  const totalVal = Math.round(goldWeight * 6800 + silverWeight * 88);

  return {
    id: `AVP-C-${String(1001 + i).padStart(5, "0")}`,
    name: fullName,
    mobile,
    alternateMobile: i % 3 === 0 ? `+91 9${String(11000000 + i * 429).slice(-9)}` : undefined,
    email: `${fName.toLowerCase()}.${lName.toLowerCase()}${10 + (i % 80)}@gmail.com`,
    address: `H.No. ${12 + (i % 30)}-${3 + (i % 8)}-${101 + i}, Street ${1 + (i % 14)}, Sector ${1 + (i % 9)}`,
    city: branch,
    state: branch === "Hyderabad" ? "Telangana" : "Andhra Pradesh",
    pin: branch === "Hyderabad" ? "500034" : branch === "Vijayawada" ? "520010" : branch === "Tirupati" ? "517507" : branch === "Kurnool" ? "518002" : "530016",
    dob: `${String(1 + (i % 28)).padStart(2, "0")}-${["Jan", "Mar", "May", "Jul", "Aug", "Oct", "Dec"][i % 7]}-${1970 + (i % 32)}`,
    idType,
    idNumber:
      idType === "Aadhaar"
        ? `${3400 + i} ${5600 + (i * 3) % 4000} ${7800 + (i * 7) % 2000}`
        : idType === "PAN"
        ? `ABC${String.fromCharCode(65 + (i % 26))}P${4100 + i}${String.fromCharCode(65 + ((i * 2) % 26))}`
        : `VTR${8400000 + i}`,
    branch,
    kycStatus,
    kycType: "Full Physical & Biometric Assay",
    verifiedBy: kycStatus === "Verified" ? "R. Srinivas (Ops Manager)" : undefined,
    createdDate: `${String(1 + (i % 28)).padStart(2, "0")} ${["Jun", "Jul", "Aug", "Sep"][i % 4]} 2026`,
    photoUrl: `https://images.unsplash.com/photo-${1500000000000 + (i % 50) * 1000000}?auto=format&fit=crop&w=150&q=80`,
    status: i % 14 === 0 ? "On Hold" : "Active",
    totalTransactions: 1 + (i % 11),
    goldWeight,
    silverWeight,
    totalValue: totalVal,
    lastTransaction: `${String(2 + (i % 20)).padStart(2, "0")} Sep 2026`,
  };
});

// Generate 32 Employees
export const employees: Employee[] = [
  { id: "AVP-E-101", name: "R. Srinivas", email: "srinivas.r@avpgold.com", mobile: "+91 9849012345", branch: "Hyderabad", department: "Management", role: "Super Admin", status: "Active", joinDate: "12 Jan 2022", permissionsCount: 38 },
  { id: "AVP-E-102", name: "M. Lakshmi", email: "lakshmi.m@avpgold.com", mobile: "+91 9849023456", branch: "Vijayawada", department: "Management", role: "Branch Manager", status: "Active", joinDate: "18 Mar 2022", permissionsCount: 32 },
  { id: "AVP-E-103", name: "S. Karthik", email: "karthik.s@avpgold.com", mobile: "+91 9849034567", branch: "Tirupati", department: "Management", role: "Branch Manager", status: "Active", joinDate: "05 Jun 2022", permissionsCount: 32 },
  { id: "AVP-E-104", name: "A. Praveen", email: "praveen.a@avpgold.com", mobile: "+91 9849045678", branch: "Kurnool", department: "Management", role: "Branch Manager", status: "Active", joinDate: "14 Aug 2022", permissionsCount: 32 },
  { id: "AVP-E-105", name: "P. Anusha", email: "anusha.p@avpgold.com", mobile: "+91 9849056789", branch: "Visakhapatnam", department: "Management", role: "Branch Manager", status: "Active", joinDate: "22 Oct 2022", permissionsCount: 32 },
  { id: "AVP-E-106", name: "K. Venkatesh", email: "venkatesh.k@avpgold.com", mobile: "+91 9849067890", branch: "Hyderabad", department: "Appraisal", role: "Gold Appraiser", status: "Active", joinDate: "10 Feb 2023", permissionsCount: 18 },
  { id: "AVP-E-107", name: "B. Haritha", email: "haritha.b@avpgold.com", mobile: "+91 9849078901", branch: "Hyderabad", department: "Appraisal", role: "Silver Appraiser", status: "Active", joinDate: "15 Apr 2023", permissionsCount: 18 },
  { id: "AVP-E-108", name: "T. Suresh", email: "suresh.t@avpgold.com", mobile: "+91 9849089012", branch: "Hyderabad", department: "Finance", role: "Finance", status: "Active", joinDate: "01 Jul 2023", permissionsCount: 26 },
  { id: "AVP-E-109", name: "N. Sandhya", email: "sandhya.n@avpgold.com", mobile: "+91 9849090123", branch: "Vijayawada", department: "Appraisal", role: "Gold Appraiser", status: "Active", joinDate: "12 Sep 2023", permissionsCount: 18 },
  { id: "AVP-E-110", name: "G. Mahesh", email: "mahesh.g@avpgold.com", mobile: "+91 9849101234", branch: "Vijayawada", department: "Operations", role: "Operations Executive", status: "Active", joinDate: "18 Nov 2023", permissionsCount: 20 },
  { id: "AVP-E-111", name: "C. Swathi", email: "swathi.c@avpgold.com", mobile: "+91 9849112345", branch: "Tirupati", department: "Finance", role: "Cashier", status: "Active", joinDate: "05 Dec 2023", permissionsCount: 14 },
  { id: "AVP-E-112", name: "V. Jagadish", email: "jagadish.v@avpgold.com", mobile: "+91 9849123456", branch: "Tirupati", department: "Appraisal", role: "Gold Appraiser", status: "Active", joinDate: "20 Jan 2024", permissionsCount: 18 },
  { id: "AVP-E-113", name: "D. Indira", email: "indira.d@avpgold.com", mobile: "+91 9849134567", branch: "Kurnool", department: "Appraisal", role: "Gold Appraiser", status: "Active", joinDate: "10 Mar 2024", permissionsCount: 18 },
  { id: "AVP-E-114", name: "M. Bhaskar", email: "bhaskar.m@avpgold.com", mobile: "+91 9849145678", branch: "Visakhapatnam", department: "Appraisal", role: "Gold Appraiser", status: "Active", joinDate: "15 May 2024", permissionsCount: 18 },
  { id: "AVP-E-115", name: "S. Padmaja", email: "padmaja.s@avpgold.com", mobile: "+91 9849156789", branch: "Hyderabad", department: "Audit", role: "Auditor", status: "Active", joinDate: "01 Jun 2024", permissionsCount: 30 },
  { id: "AVP-E-116", name: "R. Chaitanya", email: "chaitanya.r@avpgold.com", mobile: "+91 9849167890", branch: "Hyderabad", department: "Operations", role: "Inventory Manager", status: "Active", joinDate: "25 Jul 2024", permissionsCount: 24 },
  ...Array.from({ length: 16 }, (_, i) => {
    const idx = 117 + i;
    const branch = branches[i % branches.length].name;
    const roles: Employee["role"][] = ["Operations Executive", "Gold Appraiser", "Silver Appraiser", "Cashier", "Finance", "Inventory Manager"];
    const role = roles[i % roles.length];
    return {
      id: `AVP-E-${idx}`,
      name: `${firstNames[(i + 7) % firstNames.length]} ${lastNames[(i + 11) % lastNames.length]}`,
      email: `emp.${idx}@avpgold.com`,
      mobile: `+91 9849${String(170000 + i * 831).padStart(6, "0")}`,
      branch,
      department: role === "Cashier" || role === "Finance" ? ("Finance" as const) : role.includes("Appraiser") ? ("Appraisal" as const) : ("Operations" as const),
      role,
      status: i % 7 === 0 ? ("On Leave" as const) : ("Active" as const),
      joinDate: `${String(1 + (i % 25)).padStart(2, "0")} Aug 2024`,
      permissionsCount: 16 + (i % 10),
    };
  }),
];

// Generate 155 Realistic Transactions
const itemTypesGold = ["22K Traditional Bangle Set", "22K Kasu Mala Necklace", "22K Temple Jewellery Haram", "22K Lightweight Ear Studs", "24K Minted Gold Bar (Assayed)", "22K Mangalsutra Chain", "20K Waist Belt (Oddiyanam)"];
const itemTypesSilver = ["999 Silver Investment Bar 500g", "925 Sterling Silver Dining Plate", "925 Silver Pooja Deepam Pair", "999 Silver Kalasam Pot", "925 Silver Anklet Set (Pattilu)", "999 Fine Silver Coin 100g"];

export const transactions: Transaction[] = Array.from({ length: 155 }, (_, i) => {
  const isGold = i % 3 !== 2; // 67% gold, 33% silver
  const isBankPledged = i % 2 === 0; // 50% Bank Pledged, 50% Old Metal Purchase
  const cust = customers[i % customers.length];
  const branch = branches[i % branches.length].name;
  const bank = partnerBanks[i % partnerBanks.length];

  const metal: Metal = isGold ? "Gold" : "Silver";
  const type: TransactionType = isBankPledged ? "Bank Pledged" : "Old Metal Purchase";

  const grossWeight = isGold ? Number((14.2 + (i % 23) * 6.7 + (i % 5) * 1.5).toFixed(2)) : Number((250 + (i % 17) * 140 + (i % 7) * 45).toFixed(2));
  const stoneWeight = isGold ? Number(((i % 5 === 0 ? 1.8 : 0.4) + (i % 3) * 0.2).toFixed(2)) : Number((i % 4 === 0 ? 8.5 : 0).toFixed(2));
  const netWeight = Number((grossWeight - stoneWeight).toFixed(2));

  const purityPercent = isGold
    ? [91.6, 91.6, 83.3, 75.0, 99.9][i % 5]
    : [99.9, 92.5, 92.5, 80.0][i % 4];

  const purityKarat = isGold
    ? purityPercent === 99.9 ? "24K" : purityPercent === 91.6 ? "22K" : purityPercent === 83.3 ? "20K" : "18K"
    : purityPercent === 99.9 ? "999" : purityPercent === 92.5 ? "925" : "800";

  const fineWeight = Number(((netWeight * purityPercent) / 100).toFixed(2));
  const ratePerGram = isGold ? (purityPercent === 99.9 ? 7420 : purityPercent === 91.6 ? 6850 : 6210) : (purityPercent === 99.9 ? 94.5 : 87.2);
  let grossMetalValue = Math.round(fineWeight * ratePerGram);

  // Bank pledge figures
  let originalLoanAmount = isBankPledged ? Math.round(grossMetalValue * 0.65) : undefined;
  let bankInterestAmount = isBankPledged ? Math.round(originalLoanAmount! * 0.08) : undefined;
  let bankOutstandingAmount = isBankPledged ? originalLoanAmount! + bankInterestAmount! : undefined;
  let bankPaymentAmount = bankOutstandingAmount;

  // Deductions
  let serviceFee = Math.round(grossMetalValue * 0.015);
  let processingFee = 1200;
  let testingFee = 450;
  let bankExpenses = isBankPledged ? 2500 : 0;
  let commission = Math.round(grossMetalValue * 0.0075);
  let otherDeductions = i % 7 === 0 ? 800 : 0;

  // Section 65 Acceptance Test Benchmark:
  // Metal Value: ₹2,00,000 | Bank Outstanding: ₹1,20,000 | AVP Charges: ₹5,000 | Commission: ₹3,000 | Customer Payable: ₹72,000
  if (i === 0) {
    grossMetalValue = 200000;
    originalLoanAmount = 110000;
    bankInterestAmount = 10000;
    bankOutstandingAmount = 120000;
    bankPaymentAmount = 120000;
    serviceFee = 5000;
    processingFee = 0;
    testingFee = 0;
    bankExpenses = 0;
    commission = 3000;
    otherDeductions = 0;
  }

  const totalDeductions = (bankPaymentAmount || 0) + serviceFee + processingFee + testingFee + bankExpenses + commission + otherDeductions;
  const customerPayable = Math.max(0, grossMetalValue - totalDeductions);

  const statuses: TransactionStatus[] = isBankPledged
    ? [
        "Completed",
        "Inventory",
        "Customer Paid",
        "Settlement Pending",
        "Valuation",
        "Testing",
        "Gold Received",
        "Gold Release Pending",
        "Bank Paid",
        "Bank Payment Pending",
        "Approved",
        "Verification",
      ]
    : [
        "Completed",
        "Inventory",
        "Customer Paid",
        "Settlement Pending",
        "Valuation",
        "Testing",
        "Approved",
        "Verification",
      ];

  const status: TransactionStatus = i === 0 ? "Valuation" : statuses[i % statuses.length]!;

  const itemDesc = isGold
    ? itemTypesGold[i % itemTypesGold.length]
    : itemTypesSilver[i % itemTypesSilver.length];

  const items: MetalItem[] = [
    {
      id: `ITM-${5100 + i}`,
      description: itemDesc,
      metal,
      grossWeight,
      stoneWeight,
      netWeight,
      purityPercent,
      purityKarat,
      fineWeight,
      ratePerGram,
      grossValue: grossMetalValue,
      hallmarked: isGold ? i % 4 !== 3 : i % 3 !== 2,
    },
  ];

  const settlementStatus: Transaction["settlementStatus"] =
    status === "Completed" || status === "Inventory" || status === "Customer Paid"
      ? "Paid"
      : status === "Settlement Pending"
      ? "Ready for Payment"
      : status === "Valuation"
      ? "Approved"
      : "Pending";

  const dateDay = String(1 + (i % 21)).padStart(2, "0");
  const time = `${String(9 + (i % 9)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")} IST`;

  return {
    id: `AVP-${isBankPledged ? (isGold ? "BPG" : "BPS") : isGold ? "PUR-G" : "PUR-S"}-${String(1001 + i).padStart(6, "0")}`,
    customerId: cust.id,
    customerName: cust.name,
    customerMobile: cust.mobile,
    branch,
    metal,
    type,
    items,
    totalGrossWeight: grossWeight,
    totalNetWeight: netWeight,
    averagePurity: purityPercent,
    totalFineWeight: fineWeight,
    applicableRate: ratePerGram,
    grossMetalValue,
    bankName: isBankPledged ? bank.name : undefined,
    bankBranch: isBankPledged ? `${branch} Main Commercial Branch` : undefined,
    loanAccountNumber: isBankPledged ? `GL/${bank.code}/${20260000 + i * 19}` : undefined,
    pledgeReference: isBankPledged ? `PLG-${bank.code}-${8800 + i}` : undefined,
    originalLoanAmount,
    bankOutstandingAmount,
    bankInterestAmount,
    bankPaymentAmount,
    bankPaymentRef: isBankPledged && status !== "Bank Payment Pending" && status !== "Verification" && status !== "Draft" ? `UTR${bank.code}${26090000 + i * 47}` : undefined,
    bankPaidDate: isBankPledged && status !== "Bank Payment Pending" ? `${dateDay} Sep 2026` : undefined,
    releaseDate: isBankPledged && (status === "Gold Received" || status === "Silver Received" || status === "Testing" || status === "Valuation" || status === "Settlement Pending" || status === "Customer Paid" || status === "Inventory" || status === "Completed") ? `${dateDay} Sep 2026` : undefined,
    releasedBy: isBankPledged ? "S. Raghunath (Authorized AVP Liaison)" : undefined,
    receivedDate: `${dateDay} Sep 2026`,
    receivedBy: "K. Venkatesh (AVP Vault Officer)",
    serviceFee,
    processingFee,
    testingFee,
    bankExpenses,
    commission,
    otherDeductions,
    totalDeductions,
    customerPayable,
    status,
    date: `${dateDay} Sep 2026`,
    time,
    assignedAppraiser: employees[(i + 3) % employees.length].name,
    approvedBy: status !== "Draft" && status !== "Verification" ? employees[(i + 1) % 5].name : undefined,
    approvalDate: `${dateDay} Sep 2026`,
    settlementStatus,
    paymentMethod: i % 3 === 0 ? "Bank Transfer" : i % 3 === 1 ? "RTGS" : "UPI",
    paymentReference: settlementStatus === "Paid" ? `CMS/AVP/${9100000 + i}` : undefined,
    packetId: `PKT-${String(810 + i).padStart(5, "0")}`,
    vaultLocation: `${branch} Vault · Slot B-${String(1 + (i % 24)).padStart(2, "0")}`,
    notes: isBankPledged
      ? "Customer approached for loan redemption. AVP cleared the bank outstanding directly via RTGS. Metal secured in presence of bank officer."
      : "Direct counter purchase of old family jewellery. Assayed with Niton XRF Analyzer.",
  };
});

// Generate 100+ Inventory Items
export const inventoryItems: InventoryItem[] = transactions.slice(0, 110).map((t, i) => ({
  id: t.items[0].id,
  packetId: t.packetId!,
  sourceTransactionId: t.id,
  sourceType: t.type,
  metal: t.metal,
  description: t.items[0].description,
  grossWeight: t.totalGrossWeight,
  netWeight: t.totalNetWeight,
  purity: `${t.averagePurity}% (${t.items[0].purityKarat})`,
  purityPercent: t.averagePurity,
  fineWeight: t.totalFineWeight,
  costValue: t.customerPayable + (t.bankPaymentAmount || 0),
  marketValue: t.grossMetalValue,
  branch: t.branch,
  vaultName: `${t.branch} Main Vault`,
  shelfSlot: `Tray ${String.fromCharCode(65 + (i % 6))}-0${1 + (i % 9)}`,
  intakeDate: t.date,
  status:
    i % 5 === 0
      ? "In Vault"
      : i % 5 === 1
      ? "Packeted"
      : i % 5 === 2
      ? "Testing"
      : i % 5 === 3
      ? "Verified"
      : "In Transfer",
}));

// Generate 55 Packets
export const packets: Packet[] = transactions.slice(0, 55).map((t, i) => ({
  id: t.packetId!,
  qrCode: `AVP-PKT-2026-${t.metal.toUpperCase()}-${810 + i}`,
  metal: t.metal,
  totalGrossWeight: t.totalGrossWeight,
  totalNetWeight: t.totalNetWeight,
  purity: `${t.averagePurity}%`,
  fineWeight: t.totalFineWeight,
  estimatedValue: t.grossMetalValue,
  transactionId: t.id,
  customerName: t.customerName,
  branch: t.branch,
  vaultName: `${t.branch} Safe Custody`,
  slotNumber: `Slot #${101 + i}`,
  sealNumber: `SEAL-${String(98200 + i * 17)}`,
  createdDate: t.date,
  sealedBy: employees[i % employees.length].name,
  status:
    i % 6 === 0
      ? "Sealed"
      : i % 6 === 1
      ? "In Vault"
      : i % 6 === 2
      ? "In Transit"
      : i % 6 === 3
      ? "Verified"
      : i % 6 === 4
      ? "Created"
      : "Received",
  itemCount: 1 + (i % 4),
}));

// 5 Detailed Vaults
export const vaults: Vault[] = [
  { id: "VLT-HYD-01", name: "Hyderabad Central Vault", branch: "Hyderabad", capacityKg: 250, currentGoldGrams: 78420.5, currentSilverGrams: 420500, packetCount: 142, totalValue: 578400000, manager: "R. Srinivas", securityRating: "Grade V (Multi-Biometric + Armed Guard)", lastAudited: "18 Sep 2026" },
  { id: "VLT-VJA-02", name: "Vijayawada Strongroom", branch: "Vijayawada", capacityKg: 150, currentGoldGrams: 34180.2, currentSilverGrams: 180200, packetCount: 68, totalValue: 251200000, manager: "M. Lakshmi", securityRating: "Grade IV (CCTV + Dual Custody)", lastAudited: "19 Sep 2026" },
  { id: "VLT-TPT-03", name: "Tirupati Locker Safe", branch: "Tirupati", capacityKg: 100, currentGoldGrams: 18920.8, currentSilverGrams: 110400, packetCount: 41, totalValue: 139500000, manager: "S. Karthik", securityRating: "Grade IV (Dual Custody + Armed Guard)", lastAudited: "20 Sep 2026" },
  { id: "VLT-KNL-04", name: "Kurnool Vault Room", branch: "Kurnool", capacityKg: 80, currentGoldGrams: 14120.4, currentSilverGrams: 95300, packetCount: 29, totalValue: 104800000, manager: "A. Praveen", securityRating: "Grade IV (CCTV + Remote Monitoring)", lastAudited: "15 Sep 2026" },
  { id: "VLT-VSK-05", name: "Visakhapatnam Vault Hub", branch: "Visakhapatnam", capacityKg: 180, currentGoldGrams: 46520.1, currentSilverGrams: 260800, packetCount: 88, totalValue: 342600000, manager: "P. Anusha", securityRating: "Grade V (Armed Guard + Time Delay Locks)", lastAudited: "21 Sep 2026" },
];

// Branch Transfers
export const branchTransfers: BranchTransfer[] = [
  { id: "TRF-2026-081", fromBranch: "Kurnool", toBranch: "Hyderabad", packetIds: ["PKT-00812", "PKT-00813"], totalWeightGrams: 148.6, metal: "Gold", totalValue: 1018000, requestedBy: "A. Praveen", approvedBy: "R. Srinivas", courierPersonnel: "Securitas Transit Logistics (Staff ID: SEC-402)", dispatchDate: "20 Sep 2026", status: "In Transit" },
  { id: "TRF-2026-082", fromBranch: "Tirupati", toBranch: "Hyderabad", packetIds: ["PKT-00815"], totalWeightGrams: 94.2, metal: "Gold", totalValue: 645000, requestedBy: "S. Karthik", approvedBy: "R. Srinivas", courierPersonnel: "Brinks India Armed Transit", dispatchDate: "19 Sep 2026", receivedDate: "20 Sep 2026", status: "Completed" },
  { id: "TRF-2026-083", fromBranch: "Vijayawada", toBranch: "Visakhapatnam", packetIds: ["PKT-00819", "PKT-00820"], totalWeightGrams: 1250, metal: "Silver", totalValue: 118000, requestedBy: "M. Lakshmi", approvedBy: "P. Anusha", courierPersonnel: "AVP Internal Custody Escort", dispatchDate: "21 Sep 2026", status: "Dispatched" },
  { id: "TRF-2026-084", fromBranch: "Visakhapatnam", toBranch: "Hyderabad", packetIds: ["PKT-00824"], totalWeightGrams: 62.4, metal: "Gold", totalValue: 427000, requestedBy: "P. Anusha", approvedBy: "R. Srinivas", courierPersonnel: "Securitas Logistics", dispatchDate: "18 Sep 2026", receivedDate: "19 Sep 2026", status: "Completed" },
  { id: "TRF-2026-085", fromBranch: "Hyderabad", toBranch: "Vijayawada", packetIds: ["PKT-00831"], totalWeightGrams: 85.0, metal: "Gold", totalValue: 582000, requestedBy: "R. Srinivas", approvedBy: "M. Lakshmi", courierPersonnel: "Brinks Armed Escort", status: "Pending Approval" },
];

// 52 Realistic Evidence Records with real categories
export const evidenceRecords: EvidenceItem[] = [
  { id: "EVD-101", transactionId: transactions[0].id, customerId: transactions[0].customerId, category: "Customer", title: "Customer Photo during Intake", filename: "customer_portrait_intake.jpg", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", uploadedBy: "K. Venkatesh", branch: transactions[0].branch, timestamp: "21 Sep 2026 09:42 IST", verificationStatus: "Verified" },
  { id: "EVD-102", transactionId: transactions[0].id, customerId: transactions[0].customerId, category: "KYC", title: "Aadhaar Card Front & Back", filename: "aadhaar_verified_copy.jpg", url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80", uploadedBy: "K. Venkatesh", branch: transactions[0].branch, timestamp: "21 Sep 2026 09:44 IST", verificationStatus: "Verified" },
  { id: "EVD-103", transactionId: transactions[0].id, customerId: transactions[0].customerId, category: "Gold", title: "Gold Bangles & Kasu Mala Ornament Close-up", filename: "gold_ornaments_tray.jpg", url: "https://images.unsplash.com/photo-1611591475102-44249a0d1f11?auto=format&fit=crop&w=400&q=80", uploadedBy: "K. Venkatesh", branch: transactions[0].branch, timestamp: "21 Sep 2026 09:48 IST", verificationStatus: "Verified" },
  { id: "EVD-104", transactionId: transactions[0].id, customerId: transactions[0].customerId, category: "Weight", title: "Mettler Toledo Certified Scale Display (18.60g)", filename: "weight_scale_display.jpg", url: "https://images.unsplash.com/photo-1584267385494-9fdd9a71ad75?auto=format&fit=crop&w=400&q=80", uploadedBy: "K. Venkatesh", branch: transactions[0].branch, timestamp: "21 Sep 2026 09:50 IST", verificationStatus: "Verified" },
  { id: "EVD-105", transactionId: transactions[0].id, customerId: transactions[0].customerId, category: "Testing", title: "Niton XRF Spectrometer Assay Result (91.64% Au)", filename: "xrf_spectrometer_report.jpg", url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80", uploadedBy: "K. Venkatesh", branch: transactions[0].branch, timestamp: "21 Sep 2026 09:55 IST", verificationStatus: "Verified" },
  { id: "EVD-106", transactionId: transactions[0].id, customerId: transactions[0].customerId, category: "Bank Pledge", title: "SBI Loan Receipt & Release Counterfoil", filename: "sbi_gold_loan_receipt.jpg", url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80", uploadedBy: "S. Raghunath", branch: transactions[0].branch, timestamp: "21 Sep 2026 10:15 IST", verificationStatus: "Verified" },
  { id: "EVD-107", transactionId: transactions[0].id, customerId: transactions[0].customerId, category: "Receiving", title: "Bank Custody Release Packet Receiving Form", filename: "bank_metal_release_receiving.jpg", url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80", uploadedBy: "S. Raghunath", branch: transactions[0].branch, timestamp: "21 Sep 2026 10:45 IST", verificationStatus: "Verified" },
  { id: "EVD-108", transactionId: transactions[0].id, customerId: transactions[0].customerId, category: "Packet", title: "Barcoded Tamper-Proof Custody Seal Tag", filename: "tamper_proof_seal.jpg", url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80", uploadedBy: "R. Chaitanya", branch: transactions[0].branch, timestamp: "21 Sep 2026 11:10 IST", verificationStatus: "Verified" },
  { id: "EVD-109", transactionId: transactions[0].id, customerId: transactions[0].customerId, category: "Settlement", title: "Customer Signed Settlement Statement & UTR Voucher", filename: "signed_settlement_receipt.jpg", url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80", uploadedBy: "T. Suresh", branch: transactions[0].branch, timestamp: "21 Sep 2026 11:30 IST", verificationStatus: "Verified" },
  // Generate additional items for other transactions
  ...transactions.slice(1, 44).map((t, i) => ({
    id: `EVD-${110 + i}`,
    transactionId: t.id,
    customerId: t.customerId,
    category: (t.metal === "Gold" ? (i % 3 === 0 ? "Gold" : i % 3 === 1 ? "Testing" : "Weight") : (i % 3 === 0 ? "Silver" : i % 3 === 1 ? "Bank Pledge" : "Settlement")) as EvidenceItem["category"],
    title: `${t.metal} Evidence · ${t.id} Intake Verification`,
    filename: `assay_record_${t.id.toLowerCase()}.jpg`,
    url: t.metal === "Gold"
      ? "https://images.unsplash.com/photo-1611591475102-44249a0d1f11?auto=format&fit=crop&w=400&q=80"
      : "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=400&q=80",
    uploadedBy: employees[(i + 2) % employees.length].name,
    branch: t.branch,
    timestamp: `${t.date} ${t.time}`,
    verificationStatus: (i % 8 === 0 ? "Pending Review" : "Verified") as EvidenceItem["verificationStatus"],
  })),
];

// 50+ Payment Records
export const payments: PaymentRecord[] = transactions.slice(0, 52).flatMap((t, i) => {
  const records: PaymentRecord[] = [
    {
      id: `PAY-C-${9201 + i}`,
      transactionId: t.id,
      partyName: t.customerName,
      partyType: "Customer",
      amount: t.customerPayable,
      paymentMethod: t.paymentMethod || "Bank Transfer",
      referenceNumber: t.paymentReference || `CMS/AVP/${9200000 + i}`,
      branch: t.branch,
      date: t.date,
      status: t.settlementStatus === "Paid" ? "Completed" : t.settlementStatus === "Ready for Payment" ? "Pending" : "Completed",
      approvedBy: "T. Suresh (Finance Desk)",
    },
  ];

  if (t.type === "Bank Pledged" && t.bankPaymentAmount) {
    records.push({
      id: `PAY-B-${8201 + i}`,
      transactionId: t.id,
      partyName: t.bankName || "Partner Bank",
      partyType: "Bank",
      amount: t.bankPaymentAmount,
      paymentMethod: "RTGS",
      referenceNumber: t.bankPaymentRef || `RTGS/AVP/${8200000 + i}`,
      branch: t.branch,
      date: t.bankPaidDate || t.date,
      status: "Completed",
      approvedBy: "R. Srinivas (Ops Head)",
    });
  }

  return records;
});

// 32 Central Approvals
export const approvals: ApprovalRequest[] = transactions
  .filter((_, i) => i % 4 === 1)
  .slice(0, 32)
  .map((t, i) => {
    const types: ApprovalRequest["type"][] = [
      "Bank Pledged Gold",
      "Customer Settlement",
      "Bank Payment Release",
      "Gold Purchase",
      "Silver Purchase",
      "Valuation Exemption",
      "Branch Transfer",
    ];
    const priorities: ApprovalRequest["priority"][] = ["High", "Urgent", "Normal", "Normal"];
    const statuses: ApprovalRequest["status"][] = ["Pending", "Pending", "Approved", "Correction Required"];

    return {
      id: `APP-2026-${101 + i}`,
      type: types[i % types.length],
      transactionId: t.id,
      customerName: t.customerName,
      branch: t.branch,
      amount: t.type === "Bank Pledged" ? (t.bankPaymentAmount || t.grossMetalValue) : t.customerPayable,
      requestedBy: employees[(i + 4) % employees.length].name,
      requestedDate: `${t.date}, 10:15 AM`,
      priority: priorities[i % priorities.length],
      status: statuses[i % statuses.length],
      reason:
        t.type === "Bank Pledged"
          ? `Authorization requested to wire bank loan payoff of ₹${((t.bankPaymentAmount || 0) / 100000).toFixed(2)}L to ${t.bankName}.`
          : `High ticket metal purchase valuation approved for customer payout.`,
    };
  });

// 105 Audit Logs
export const auditLogs: AuditLogEntry[] = Array.from({ length: 105 }, (_, i) => {
  const t = transactions[i % transactions.length];
  const emp = employees[i % employees.length];
  const modules: AuditLogEntry["module"][] = [
    "Bank Settlement",
    "Customer Settlement",
    "Old Purchase",
    "Testing",
    "Valuation",
    "Vault",
    "Transfers",
    "KYC",
    "Rates",
    "Security",
  ];
  const actions = [
    "Bank loan payoff RTGS initiated",
    "Customer payout disbursed to bank account",
    "Niton XRF spectrometer assay recorded",
    "Tamper-proof seal affixed and verified",
    "Branch transfer pass authorized",
    "Customer biometric Aadhaar verified",
    "Gold rate benchmark refreshed",
    "Metal release counterfoil uploaded",
    "Vault custody double-lock logged",
  ];

  return {
    id: `AUD-90${String(1001 + i)}`,
    timestamp: `${String(18 + (i % 4)).padStart(2, "0")} Sep 2026, ${String(9 + (i % 9)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")} IST`,
    user: emp.name,
    role: emp.role,
    branch: t.branch,
    module: modules[i % modules.length],
    action: actions[i % actions.length],
    referenceId: t.id,
    previousValue: i % 2 === 0 ? "Status: Verification Pending" : "Status: Draft",
    newValue: i % 2 === 0 ? "Status: Approved & Wire Ready" : "Status: Active In Custody",
    status: i % 18 === 0 ? "Flagged" : "Success",
    ipAddress: `10.14.${10 + (i % 5)}.${101 + (i % 80)}`,
  };
});

// Accounting Ledger Entries
export const ledgerEntries = transactions.slice(0, 40).map((t, i) => ({
  id: `LED-${5000 + i}`,
  date: t.date,
  reference: t.id,
  account: t.type === "Bank Pledged" ? "Bank Loan Redemption Clearing A/c" : "Old Precious Metal Inventory A/c",
  debit: t.grossMetalValue,
  credit: 0,
  balance: Math.round(52000000 + i * 380000),
  branch: t.branch,
  narration: `Metal acquisition from ${t.customerName} via ${t.type}. Deductions: Fees ₹${t.totalDeductions.toLocaleString("en-IN")}.`,
}));

// Dashboard Trend Data
export const chartData = [
  { day: "15 Sep", gold: 31, silver: 18, value: 24.2, pledged: 14, purchases: 35 },
  { day: "16 Sep", gold: 38, silver: 22, value: 29.8, pledged: 19, purchases: 41 },
  { day: "17 Sep", gold: 34, silver: 27, value: 27.4, pledged: 16, purchases: 45 },
  { day: "18 Sep", gold: 46, silver: 24, value: 35.1, pledged: 23, purchases: 47 },
  { day: "19 Sep", gold: 42, silver: 31, value: 33.7, pledged: 20, purchases: 53 },
  { day: "20 Sep", gold: 53, silver: 29, value: 41.2, pledged: 27, purchases: 55 },
  { day: "21 Sep", gold: 49, silver: 34, value: 39.6, pledged: 25, purchases: 58 },
];

export const monthlyProfitMarginData = [
  { month: "Apr 2026", grossValue: 3.42, bankPaid: 1.95, feesCollected: 0.18, netMargin: 0.31 },
  { month: "May 2026", grossValue: 3.86, bankPaid: 2.18, feesCollected: 0.21, netMargin: 0.36 },
  { month: "Jun 2026", grossValue: 4.12, bankPaid: 2.34, feesCollected: 0.23, netMargin: 0.39 },
  { month: "Jul 2026", grossValue: 4.65, bankPaid: 2.62, feesCollected: 0.26, netMargin: 0.44 },
  { month: "Aug 2026", grossValue: 5.18, bankPaid: 2.91, feesCollected: 0.29, netMargin: 0.49 },
  { month: "Sep 2026 (MTD)", grossValue: 3.96, bankPaid: 2.21, feesCollected: 0.22, netMargin: 0.38 },
];

// Helper formatting functions
export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export const formatGrams = (n: number) =>
  `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n)} g`;

export const formatKg = (n: number) =>
  `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n)} kg`;

export const formatNumber = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);
