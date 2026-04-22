export interface MockComplaint {
  id: string;
  subject: string;
  category: string;
  status: "Open" | "In Review" | "In Progress" | "Resolved" | "Closed";
  submittedAt: string;
  updatedAt: string;
  details: string;
  resolutionTime?: string;
  assignedTo?: string;
  financialLoss?: string;
  resolution?: string;
  messages?: { role: "customer" | "employee"; content: string; ts: string }[];
}

export const MOCK_CUSTOMER = {
  name: "Rahul Sharma",
  email: "rahul.sharma@gmail.com",
  phone: "+91 98765 43210",
  role: "Personal · Premier",
};

export const MOCK_FAQS = [
  {
    keyword: "upi",
    title: "UPI Transfer Failed but amount deducted",
    body: "If your UPI transaction failed but money was debited, it will be automatically refunded to your account within 3-5 business days. You don't need to raise a complaint unless 5 days have passed.",
  },
  {
    keyword: "card",
    title: "How to unblock or replace a debit/credit card?",
    body: "You can temporarily block/unblock your card instantly from the AuraBank App (Cards > Manage). If the card is lost, select 'Replace' and a new card will be dispatched within 48 hours.",
  },
  {
    keyword: "kyc",
    title: "Re-KYC Pending or Account Restricted",
    body: "If your account is restricted due to pending KYC, please visit the 'Profile' section in your app to upload your latest Aadhar and PAN. Verification takes 24 hours.",
  },
];

let mockComplaintsStore: MockComplaint[] = [
  {
    id: "VX-10255",
    subject: "UPI transaction failed repeatedly",
    category: "Payments & Transfers",
    status: "Open",
    submittedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    details: "I tried sending Rs 5000 via UPI three times and it failed, but on the last attempt money was deducted.",
  },
  {
    id: "VX-10248",
    subject: "Wire transfer hold over 48 hours",
    category: "Payments & Transfers",
    status: "In Progress",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    details: "Initiated a wire transfer 2 days ago which is still stuck on pending compliance.",
    assignedTo: "J. Morgan",
    messages: [
      { role: "customer", content: "Initiated a wire transfer 2 days ago which is still stuck on pending compliance.", ts: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
      { role: "employee", content: "We are currently waiting for clearance from the beneficiary bank. I have escalated this to our treasury team.", ts: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }
    ]
  },
  {
    id: "VX-10198",
    subject: "Card declined at recurring merchant",
    category: "Card & ATM",
    status: "Resolved",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
    details: "My subscription to Netflix got declined saying incorrect MCC.",
    assignedTo: "M. Bauer",
    resolution: "We have updated the rule for this specific MCC. Your card should work now.",
    messages: [
      { role: "customer", content: "My subscription to Netflix got declined saying incorrect MCC.", ts: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
      { role: "employee", content: "We have updated the rule for this specific MCC. Your card should work now.", ts: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() }
    ]
  },
];

export function getMockComplaints() {
  return [...mockComplaintsStore];
}

export function submitMockComplaint(payload: any) {
  const newComplaint: MockComplaint = {
    id: `VX-${Math.floor(10000 + Math.random() * 90000)}`,
    subject: payload.subject,
    category: payload.category,
    status: "Open",
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    details: payload.details,
    financialLoss: payload.financialLoss,
    messages: [
      { role: "customer", content: payload.details, ts: new Date().toISOString() }
    ]
  };
  mockComplaintsStore = [newComplaint, ...mockComplaintsStore];
  return newComplaint;
}

export function markComplaintFeedback(id: string, rating: number, comment: string) {
  mockComplaintsStore = mockComplaintsStore.map(c => {
    if (c.id === id) {
      return { ...c, feedback: { rating, comment } };
    }
    return c;
  });
}

// ============================================================
// Employee Portal Mock Data (used in Phase 4 UI tests)
// ============================================================
export type EmployeePriority = "P1" | "P2" | "P3";
export type EmployeeSentiment = "Positive" | "Neutral" | "Negative";
export type EmployeeStatus = "Open" | "In Review" | "In Progress" | "Resolved";

export interface EmployeeComplaint {
  id: string;
  subject: string;
  priority: EmployeePriority;
  sentiment: EmployeeSentiment;
  status: EmployeeStatus;
  assignee: string;
  customer: string;
  account: string;
  exposure: string;
  channel: string;
  ts: string;
  body: string;
}

const SUBJECTS = [
  "Transaction Latency on Wire Transfer",
  "KYC Verification Delay",
  "Card Decline — Merchant Category",
  "Statement Discrepancy",
  "Wire Transfer Hold — Sanctions Review",
  "App Login Loop — iOS 18.4",
  "Disputed ATM Withdrawal",
  "Card Decline Pattern — EU Travel",
  "Duplicate Charge on Account",
  "Account Freeze Without Notice",
];
const PRIORITIES: EmployeePriority[] = ["P1", "P2", "P3"];
const SENTIMENTS: EmployeeSentiment[] = ["Positive", "Neutral", "Negative"];
const STATUSES: EmployeeStatus[] = ["Open", "In Review", "In Progress", "Resolved"];
const CHANNELS = ["Web", "Mobile", "Phone", "Email"];
const ASSIGNEES = ["J. Morgan", "S. Okafor", "M. Bauer", "L. Kowalski", "Unassigned"];
const CUSTOMERS = ["Alex Chen", "Riya Patel", "Daniel Reyes", "Hana Takeda", "Northwind LLC", "Marco Vidal", "Olivia Brand"];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

function generateMockEmployeeComplaints(count: number): EmployeeComplaint[] {
  const rand = seededRandom(42);
  return Array.from({ length: count }, (_, i) => {
    const idx = (n: number) => Math.floor(rand() * n);
    return {
      id: `VX-${10000 + i}`,
      subject: SUBJECTS[idx(SUBJECTS.length)],
      priority: PRIORITIES[idx(PRIORITIES.length)],
      sentiment: SENTIMENTS[idx(SENTIMENTS.length)],
      status: STATUSES[idx(STATUSES.length)],
      assignee: ASSIGNEES[idx(ASSIGNEES.length)],
      customer: CUSTOMERS[idx(CUSTOMERS.length)],
      account: `${["Personal", "Premier", "Business"][idx(3)]} · ${1000 + idx(9000)}`,
      exposure: idx(2) === 0 ? `$${(idx(50) * 1000).toLocaleString()}` : "$0",
      channel: CHANNELS[idx(CHANNELS.length)],
      ts: `${idx(72) + 1}h ago`,
      body: "Customer complaint details requiring employee review and resolution.",
    };
  });
}

export const MOCK_EMPLOYEE_COMPLAINTS: EmployeeComplaint[] = generateMockEmployeeComplaints(100);

// ============================================================
// CEO Portal Chart Data
// ============================================================
export const CEO_WEEKLY_VOLUME = [
  { day: "Mon", resolved: 24, open: 8 },
  { day: "Tue", resolved: 28, open: 10 },
  { day: "Wed", resolved: 26, open: 9 },
  { day: "Thu", resolved: 31, open: 12 },
  { day: "Fri", resolved: 33, open: 7 },
  { day: "Sat", resolved: 38, open: 5 },
  { day: "Sun", resolved: 41, open: 4 },
];

export const CEO_SENTIMENT_TREND = [
  { day: "Mon", negative: 42, positive: 38 },
  { day: "Tue", negative: 41, positive: 40 },
  { day: "Wed", negative: 40, positive: 39 },
  { day: "Thu", negative: 38, positive: 42 },
  { day: "Fri", negative: 37, positive: 43 },
  { day: "Sat", negative: 35, positive: 45 },
  { day: "Sun", negative: 34, positive: 46 },
];

export const CEO_THEMES = [
  { label: "KYC re-verification delays", count: 184, pct: 92 },
  { label: "Wire transfer compliance hold", count: 126, pct: 72 },
  { label: "iOS 18.4 app login loop", count: 98, pct: 58 },
  { label: "Statement reconciliation gaps", count: 61, pct: 38 },
  { label: "ATM dispute resolution time", count: 44, pct: 26 },
];
