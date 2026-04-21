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
