-- ============================================================
-- CCIS — AuraBank | Seed Data
-- ============================================================
-- Run AFTER schema.sql and rls.sql
-- 
-- DEMO LOGIN CREDENTIALS (add these users in Supabase Auth first,
-- then run this script):
--
--  CEO:
--    email: ceo@aurabank.in  | password: AuraBank@2026
--    (set user_metadata: {"role": "ceo"})
--
--  Employees:
--    priya@aurabank.in       | AuraBank@2026  | role: employee | dept: Finance
--    rohan@aurabank.in       | AuraBank@2026  | role: employee | dept: IT
--    sneha@aurabank.in       | AuraBank@2026  | role: employee | dept: Cards
--    kiran@aurabank.in       | AuraBank@2026  | role: employee | dept: Operations
--    arjun@aurabank.in       | AuraBank@2026  | role: employee | dept: Loans
--
--  Customers (10):
--    rahul.sharma@gmail.com  | Customer@2026  | role: customer
--    ananya.verma@gmail.com  | Customer@2026
--    mihir.joshi@gmail.com   | Customer@2026
--    preethi.nair@gmail.com  | Customer@2026
--    sameer.khan@gmail.com   | Customer@2026
--    divya.patel@gmail.com   | Customer@2026
--    akash.singh@gmail.com   | Customer@2026
--    nisha.reddy@gmail.com   | Customer@2026
--    vikram.iyer@gmail.com   | Customer@2026
--    pooja.agarwal@gmail.com | Customer@2026
-- ============================================================

-- ============================================================
-- EMPLOYEES (auth_id will be updated after Supabase Auth users are created)
-- These UUIDs are fixed for cross-referencing with complaints below
-- ============================================================
INSERT INTO public.employees (id, name, email, department, role, is_ceo)
VALUES
  ('e0000001-0000-0000-0000-000000000001', 'Vikram Malhotra', 'ceo@aurabank.in',    'Finance',    'senior_agent', TRUE),
  ('e0000001-0000-0000-0000-000000000002', 'Priya Sharma',    'priya@aurabank.in',  'Finance',    'senior_agent', FALSE),
  ('e0000001-0000-0000-0000-000000000003', 'Rohan Mehta',     'rohan@aurabank.in',  'IT',         'agent',        FALSE),
  ('e0000001-0000-0000-0000-000000000004', 'Sneha Rao',       'sneha@aurabank.in',  'Cards',      'agent',        FALSE),
  ('e0000001-0000-0000-0000-000000000005', 'Kiran Nair',      'kiran@aurabank.in',  'Operations', 'agent',        FALSE),
  ('e0000001-0000-0000-0000-000000000006', 'Arjun Kapoor',    'arjun@aurabank.in',  'Loans',      'senior_agent', FALSE)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- CUSTOMERS
-- ============================================================
INSERT INTO public.customers (id, name, email, phone, account_number, churn_risk_score, complaint_count)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Rahul Sharma',    'rahul.sharma@gmail.com',  '+91-9876543210', 'AB00123456', 82, 4),
  ('c0000001-0000-0000-0000-000000000002', 'Ananya Verma',    'ananya.verma@gmail.com',  '+91-9123456789', 'AB00234567', 45, 2),
  ('c0000001-0000-0000-0000-000000000003', 'Mihir Joshi',     'mihir.joshi@gmail.com',   '+91-9988776655', 'AB00345678', 91, 6),
  ('c0000001-0000-0000-0000-000000000004', 'Preethi Nair',    'preethi.nair@gmail.com',  '+91-9001234567', 'AB00456789', 20, 1),
  ('c0000001-0000-0000-0000-000000000005', 'Sameer Khan',     'sameer.khan@gmail.com',   '+91-9765432198', 'AB00567890', 67, 3),
  ('c0000001-0000-0000-0000-000000000006', 'Divya Patel',     'divya.patel@gmail.com',   '+91-9654321987', 'AB00678901', 33, 2),
  ('c0000001-0000-0000-0000-000000000007', 'Akash Singh',     'akash.singh@gmail.com',   '+91-9543210876', 'AB00789012', 55, 3),
  ('c0000001-0000-0000-0000-000000000008', 'Nisha Reddy',     'nisha.reddy@gmail.com',   '+91-9432109765', 'AB00890123', 78, 4),
  ('c0000001-0000-0000-0000-000000000009', 'Vikram Iyer',     'vikram.iyer@gmail.com',   '+91-9321098654', 'AB00901234', 15, 1),
  ('c0000001-0000-0000-0000-000000000010', 'Pooja Agarwal',   'pooja.agarwal@gmail.com', '+91-9210987543', 'AB01012345', 60, 3)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- COMPLAINTS (50 realistic AuraBank complaints)
-- ============================================================
INSERT INTO public.complaints (
  id, customer_id, category, subcategory, description, product,
  preferred_resolution, financial_loss_customer, status, priority,
  department, assigned_to, sla_deadline, escalated, escalation_reason,
  escalated_at, resolution_note, resolved_at, feedback_rating, feedback_text,
  created_at
) VALUES

-- ===== RAHUL SHARMA (high churn risk: 82) =====
(
  '11111111-0000-0000-0000-000000000001',
  'c0000001-0000-0000-0000-000000000001',
  'Billing', 'Hidden Charges',
  'I was charged an annual fee of ₹4,999 for my AuraBank Platinum card without any prior notification. I have been a customer for 3 years and this has never happened before. This is completely unacceptable and I want a full refund immediately. I have tried calling customer service 4 times and no one resolves this.',
  'AuraBank Platinum Credit Card',
  'Refund', 4999.00,
  'ESCALATED', 'CRITICAL',
  'Finance', 'e0000001-0000-0000-0000-000000000002',
  NOW() - INTERVAL '2 hours',
  TRUE, 'Customer called 4 times with no resolution. Financial loss exceeds ₹4000. CRITICAL priority.',
  NOW() - INTERVAL '3 hours', NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '5 days'
),
(
  '11111111-0000-0000-0000-000000000002',
  'c0000001-0000-0000-0000-000000000001',
  'Cards', 'Card Blocked',
  'My AuraBank debit card was blocked without any reason. I was at a petrol station and my card got declined. Very embarrassing situation. I need this resolved ASAP. This is the second time in a month.',
  'AuraBank Debit Card',
  'Apology', NULL,
  'IN_PROGRESS', 'HIGH',
  'Cards', 'e0000001-0000-0000-0000-000000000004',
  NOW() + INTERVAL '20 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '3 days'
),
(
  '11111111-0000-0000-0000-000000000003',
  'c0000001-0000-0000-0000-000000000001',
  'Technical', 'App Crash',
  'The AuraBank mobile app crashes every time I try to view my credit card statement. This has been happening for 2 weeks. I am unable to check my bills. Already reported this via in-app feedback but no action taken.',
  'AuraBank Mobile App',
  'Other', NULL,
  'OPEN', 'MEDIUM',
  'IT', 'e0000001-0000-0000-0000-000000000003',
  NOW() + INTERVAL '46 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '1 day'
),
(
  '11111111-0000-0000-0000-000000000004',
  'c0000001-0000-0000-0000-000000000001',
  'Billing', 'Duplicate Transaction',
  'A payment of ₹12,450 to Swiggy was deducted twice from my savings account on 15th April. I need an immediate refund of ₹12,450. Transaction IDs: TXN2024041501 and TXN2024041502.',
  'AuraBank Savings Account',
  'Refund', 12450.00,
  'RESOLVED', 'CRITICAL',
  'Finance', 'e0000001-0000-0000-0000-000000000002',
  NOW() - INTERVAL '30 hours',
  TRUE, 'Duplicate transaction confirmed. Escalated for urgent refund.',
  NOW() - INTERVAL '72 hours',
  'Duplicate transaction verified and ₹12,450 refunded to account within 2 business days.',
  NOW() - INTERVAL '1 day',
  3, 'Took too long to resolve. Refund done but the wait was unacceptable.',
  NOW() - INTERVAL '4 days'
),

-- ===== ANANYA VERMA (moderate churn: 45) =====
(
  '11111111-0000-0000-0000-000000000005',
  'c0000001-0000-0000-0000-000000000002',
  'Technical', 'UPI Failure',
  'My UPI payment of ₹3,200 to a merchant was debited from my account but the merchant did not receive it. The money is in limbo. Transaction ID: UPI20240418001. I need this resolved within 24 hours.',
  'AuraBank UPI',
  'Refund', 3200.00,
  'IN_PROGRESS', 'HIGH',
  'IT', 'e0000001-0000-0000-0000-000000000003',
  NOW() + INTERVAL '5 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '2 days'
),
(
  '11111111-0000-0000-0000-000000000006',
  'c0000001-0000-0000-0000-000000000002',
  'KYC', 'KYC Rejection',
  'My KYC was rejected for the third time even though I submitted all required documents including Aadhaar, PAN, and proof of address. My account has been frozen for 15 days now. I cannot do any transactions.',
  'AuraBank Savings Account',
  'Other', NULL,
  'ESCALATED', 'HIGH',
  'Operations', 'e0000001-0000-0000-0000-000000000005',
  NOW() - INTERVAL '5 hours',
  TRUE, 'Account frozen for 15 days. Third KYC rejection. Customer has provided all documents.',
  NOW() - INTERVAL '2 days', NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '7 days'
),

-- ===== MIHIR JOSHI (highest churn: 91) =====
(
  '11111111-0000-0000-0000-000000000007',
  'c0000001-0000-0000-0000-000000000003',
  'Loans', 'Loan Rejection',
  'My personal loan application for ₹5 lakhs was rejected without explanation. I have a CIBIL score of 790 and stable income. This is the second rejection in 6 months. I demand a written explanation.',
  'AuraBank Personal Loan',
  'Other', NULL,
  'ESCALATED', 'HIGH',
  'Loans', 'e0000001-0000-0000-0000-000000000006',
  NOW() - INTERVAL '8 hours',
  TRUE, 'High-value customer with good credit score. Second rejection. Risk of churn is extremely high.',
  NOW() - INTERVAL '3 days', NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '8 days'
),
(
  '11111111-0000-0000-0000-000000000008',
  'c0000001-0000-0000-0000-000000000003',
  'Billing', 'Interest Overcharge',
  'I was charged interest of ₹8,760 on my credit card even though I had paid the full outstanding amount before the due date. I have payment confirmation. This is a system error and I want a full waiver of this interest.',
  'AuraBank Gold Credit Card',
  'Waiver', 8760.00,
  'OPEN', 'CRITICAL',
  'Finance', 'e0000001-0000-0000-0000-000000000002',
  NOW() + INTERVAL '2 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '6 hours'
),
(
  '11111111-0000-0000-0000-000000000009',
  'c0000001-0000-0000-0000-000000000003',
  'Technical', 'Netbanking Login',
  'I cannot log into AuraBank netbanking. The OTP is not being received on my registered mobile number. I have tried over 20 times. I urgently need to access my account for a NEFT transfer of ₹95,000.',
  'AuraBank Netbanking',
  'Other', 95000.00,
  'IN_PROGRESS', 'CRITICAL',
  'IT', 'e0000001-0000-0000-0000-000000000003',
  NOW() - INTERVAL '1 hour',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '12 hours'
),
(
  '11111111-0000-0000-0000-000000000010',
  'c0000001-0000-0000-0000-000000000003',
  'Cards', 'International Transaction Declined',
  'My card was declined for an online purchase worth USD 450 ($37,800) on Amazon US even though I had enabled international transactions from the app. The purchase window is closing in 2 hours.',
  'AuraBank Platinum Credit Card',
  'Other', 37800.00,
  'ESCALATED', 'CRITICAL',
  'Cards', 'e0000001-0000-0000-0000-000000000004',
  NOW() - INTERVAL '4 hours',
  TRUE, 'Time-sensitive: purchase window closing. Financial impact ₹37,800. Customer at extreme churn risk.',
  NOW() - INTERVAL '6 hours', NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '2 days'
),
(
  '11111111-0000-0000-0000-000000000011',
  'c0000001-0000-0000-0000-000000000003',
  'Service', 'Branch Rudeness',
  'The staff at AuraBank Koramangala branch were extremely rude and dismissive when I visited to resolve my KYC issue. The manager refused to meet me and I was made to wait for 3 hours before being told to come back the next day.',
  'AuraBank Branch Service',
  'Apology', NULL,
  'RESOLVED', 'MEDIUM',
  'Operations', 'e0000001-0000-0000-0000-000000000005',
  NOW() - INTERVAL '48 hours',
  FALSE, NULL, NULL,
  'Formal apology issued. Branch manager counselled. Complimentary service credit of ₹500 added.',
  NOW() - INTERVAL '4 days',
  2, 'Apology received but the credit means nothing after 3 hours of wasted time.',
  NOW() - INTERVAL '9 days'
),
(
  '11111111-0000-0000-0000-000000000012',
  'c0000001-0000-0000-0000-000000000003',
  'Billing', 'Late Fee Waiver',
  'A late fee of ₹1,299 was charged even though I made the payment. AuraBank payment portal was down on the due date. I have a screenshot of the downtime. This is entirely AuraBank''s fault.',
  'AuraBank Credit Card',
  'Waiver', 1299.00,
  'CLOSED', 'MEDIUM',
  'Finance', 'e0000001-0000-0000-0000-000000000002',
  NOW() - INTERVAL '96 hours',
  FALSE, NULL, NULL,
  'Late fee waived after portal downtime confirmed. ₹1,299 credited.',
  NOW() - INTERVAL '10 days',
  4, 'Finally sorted, but took too many follow-ups.',
  NOW() - INTERVAL '12 days'
),

-- ===== PREETHI NAIR (low churn: 20) =====
(
  '11111111-0000-0000-0000-000000000013',
  'c0000001-0000-0000-0000-000000000004',
  'Service', 'Account Opening Delay',
  'I applied for a AuraBank Zero Balance Savings Account 3 weeks ago. Video KYC was done successfully but the account has not been activated yet. I keep getting an email saying "under review".',
  'AuraBank Savings Account',
  'Other', NULL,
  'RESOLVED', 'LOW',
  'Operations', 'e0000001-0000-0000-0000-000000000005',
  NOW() - INTERVAL '24 hours',
  FALSE, NULL, NULL,
  'Account activation delayed due to backend queue issue. Account activated and welcome kit dispatched.',
  NOW() - INTERVAL '2 days',
  5, 'Resolved quickly once I raised the complaint. Happy with the response.',
  NOW() - INTERVAL '5 days'
),

-- ===== SAMEER KHAN (moderate-high churn: 67) =====
(
  '11111111-0000-0000-0000-000000000014',
  'c0000001-0000-0000-0000-000000000005',
  'Cards', 'Reward Points Expiry',
  'I had accumulated 45,000 AuraPoints worth ₹4,500. These expired without any prior notification email. I want them reinstated. Other banks give 60 days notice before expiry.',
  'AuraBank Rewards Program',
  'Refund', 4500.00,
  'IN_PROGRESS', 'HIGH',
  'Cards', 'e0000001-0000-0000-0000-000000000004',
  NOW() + INTERVAL '18 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '3 days'
),
(
  '11111111-0000-0000-0000-000000000015',
  'c0000001-0000-0000-0000-000000000005',
  'Technical', 'NEFT Transfer Failed',
  'NEFT transfer of ₹50,000 to HDFC Bank failed but money was deducted from my account. Reference number: NEFT20240419001. Money has not been returned. It has been 48 hours.',
  'AuraBank Netbanking',
  'Refund', 50000.00,
  'ESCALATED', 'CRITICAL',
  'IT', 'e0000001-0000-0000-0000-000000000003',
  NOW() - INTERVAL '6 hours',
  TRUE, '₹50,000 stuck in failed NEFT. 48 hours elapsed. RBI guidelines require return within 2 hours.',
  NOW() - INTERVAL '12 hours', NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '2 days'
),
(
  '11111111-0000-0000-0000-000000000016',
  'c0000001-0000-0000-0000-000000000005',
  'Loans', 'EMI Deducted Twice',
  'EMI for my AuraBank home loan was deducted twice in April — once on the 1st and again on the 5th. Total extra deduction: ₹28,450. I need the extra amount refunded immediately.',
  'AuraBank Home Loan',
  'Refund', 28450.00,
  'OPEN', 'CRITICAL',
  'Loans', 'e0000001-0000-0000-0000-000000000006',
  NOW() + INTERVAL '1 hour',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '4 hours'
),

-- ===== DIVYA PATEL (low-moderate: 33) =====
(
  '11111111-0000-0000-0000-000000000017',
  'c0000001-0000-0000-0000-000000000006',
  'Technical', 'App Login OTP',
  'Not receiving OTP to log into mobile app. Changed phone recently and updated number in branch, but OTP is still going to old number.',
  'AuraBank Mobile App',
  'Other', NULL,
  'RESOLVED', 'MEDIUM',
  'IT', 'e0000001-0000-0000-0000-000000000003',
  NOW() - INTERVAL '36 hours',
  FALSE, NULL, NULL,
  'Backend mobile number update had a lag. Forced sync completed. Customer can now log in.',
  NOW() - INTERVAL '3 days',
  4, 'Fixed within a day. Good support.',
  NOW() - INTERVAL '6 days'
),
(
  '11111111-0000-0000-0000-000000000018',
  'c0000001-0000-0000-0000-000000000006',
  'Billing', 'Forex Markup',
  'I was charged a 3.5% forex markup on my international transaction at Thailand but my AuraBank premium account brochure clearly states 0% forex markup. Overcharge amount: ₹2,340.',
  'AuraBank Premium Savings',
  'Refund', 2340.00,
  'IN_PROGRESS', 'MEDIUM',
  'Finance', 'e0000001-0000-0000-0000-000000000002',
  NOW() + INTERVAL '30 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '1 day'
),

-- ===== AKASH SINGH (moderate churn: 55) =====
(
  '11111111-0000-0000-0000-000000000019',
  'c0000001-0000-0000-0000-000000000007',
  'Cards', 'Card Not Received',
  'I applied for a new AuraBank Signature credit card 6 weeks ago. Application was approved but the card has not been delivered. Courier tracking shows "out for delivery" for 3 weeks.',
  'AuraBank Signature Credit Card',
  'Replacement', NULL,
  'IN_PROGRESS', 'MEDIUM',
  'Cards', 'e0000001-0000-0000-0000-000000000004',
  NOW() + INTERVAL '24 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '5 days'
),
(
  '11111111-0000-0000-0000-000000000020',
  'c0000001-0000-0000-0000-000000000007',
  'Technical', 'Passbook Download',
  'Cannot download e-passbook from AuraBank netbanking. PDF button doesn''t work. I need passbook for ITR filing deadline.',
  'AuraBank Netbanking',
  'Other', NULL,
  'OPEN', 'LOW',
  'IT', 'e0000001-0000-0000-0000-000000000003',
  NOW() + INTERVAL '70 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '2 days'
),
(
  '11111111-0000-0000-0000-000000000021',
  'c0000001-0000-0000-0000-000000000007',
  'Loans', 'Interest Rate Change',
  'I was notified of an interest rate hike on my AuraBank car loan from 8.5% to 9.2% with only 7 days notice. This increases my EMI by ₹890/month. I request the old rate to be honoured.',
  'AuraBank Car Loan',
  'Other', 890.00,
  'OPEN', 'MEDIUM',
  'Loans', 'e0000001-0000-0000-0000-000000000006',
  NOW() + INTERVAL '48 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '1 day'
),

-- ===== NISHA REDDY (high churn: 78) =====
(
  '11111111-0000-0000-0000-000000000022',
  'c0000001-0000-0000-0000-000000000008',
  'Billing', 'Minimum Balance Penalty',
  'Charged ₹500 minimum balance penalty on my Salary Account which is supposed to have zero minimum balance requirement. This charge is completely wrong.',
  'AuraBank Salary Account',
  'Refund', 500.00,
  'RESOLVED', 'MEDIUM',
  'Finance', 'e0000001-0000-0000-0000-000000000002',
  NOW() - INTERVAL '48 hours',
  FALSE, NULL, NULL,
  'Verified salary account type. Incorrect charges reversed. ₹500 refunded.',
  NOW() - INTERVAL '5 days',
  4, 'Resolved but shouldn''t have happened.',
  NOW() - INTERVAL '8 days'
),
(
  '11111111-0000-0000-0000-000000000023',
  'c0000001-0000-0000-0000-000000000008',
  'Technical', 'UPI PIN Reset Failure',
  'Unable to reset UPI PIN. App shows error code E403 and crashes after OTP verification. Tried on both Android and iOS. Cannot make any UPI payments.',
  'AuraBank UPI',
  'Other', NULL,
  'ESCALATED', 'HIGH',
  'IT', 'e0000001-0000-0000-0000-000000000003',
  NOW() - INTERVAL '3 hours',
  TRUE, 'Error E403 impacting multiple customers. Likely a system-wide bug.',
  NOW() - INTERVAL '8 hours', NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '3 days'
),
(
  '11111111-0000-0000-0000-000000000024',
  'c0000001-0000-0000-0000-000000000008',
  'Billing', 'GST Double Charge',
  'GST was charged twice on my AuraBank credit card annual fee. Once in February and again in March. Extra GST amount: ₹899. I want a refund.',
  'AuraBank Credit Card',
  'Refund', 899.00,
  'IN_PROGRESS', 'HIGH',
  'Finance', 'e0000001-0000-0000-0000-000000000002',
  NOW() + INTERVAL '10 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '4 days'
),
(
  '11111111-0000-0000-0000-000000000025',
  'c0000001-0000-0000-0000-000000000008',
  'Service', 'Customer Care Hold',
  'I called AuraBank customer care at 10:30 AM and was put on hold for 55 minutes. The call then got disconnected. Third time this has happened. Your IVR system is completely broken.',
  'AuraBank Customer Care',
  'Apology', NULL,
  'CLOSED', 'LOW',
  'Operations', 'e0000001-0000-0000-0000-000000000005',
  NOW() - INTERVAL '72 hours',
  FALSE, NULL, NULL,
  'Formal apology issued. User added to priority callback list.',
  NOW() - INTERVAL '6 days',
  2, 'Apology doesn''t fix the systemic problem.',
  NOW() - INTERVAL '9 days'
),

-- ===== VIKRAM IYER (low churn: 15) =====
(
  '11111111-0000-0000-0000-000000000026',
  'c0000001-0000-0000-0000-000000000009',
  'KYC', 'Video KYC Failure',
  'Video KYC call dropped 3 times. The agent''s video was frozen each time. My schedule is very tight. Please arrange a physical KYC visit or ensure the system works.',
  'AuraBank Account Opening',
  'Other', NULL,
  'RESOLVED', 'LOW',
  'Operations', 'e0000001-0000-0000-0000-000000000005',
  NOW() - INTERVAL '60 hours',
  FALSE, NULL, NULL,
  'Video KYC server issue resolved. Customer''s KYC completed successfully in a rescheduled session.',
  NOW() - INTERVAL '3 days',
  5, 'Very helpful agent in the reschedule. All good.',
  NOW() - INTERVAL '4 days'
),

-- ===== POOJA AGARWAL (moderate churn: 60) =====
(
  '11111111-0000-0000-0000-000000000027',
  'c0000001-0000-0000-0000-000000000010',
  'Cards', 'Credit Limit Reduction',
  'My AuraBank Platinum card credit limit was reduced from ₹3,00,000 to ₹1,50,000 without any prior notice. My CIBIL score has not changed and I have never missed a payment. This is very insulting.',
  'AuraBank Platinum Credit Card',
  'Other', NULL,
  'ESCALATED', 'HIGH',
  'Cards', 'e0000001-0000-0000-0000-000000000004',
  NOW() - INTERVAL '7 hours',
  TRUE, 'Perfect payment history. Credit limit reduction without cause. High churn risk.',
  NOW() - INTERVAL '1 day', NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '5 days'
),
(
  '11111111-0000-0000-0000-000000000028',
  'c0000001-0000-0000-0000-000000000010',
  'Loans', 'Pre-closure Penalty',
  'I want to pre-close my AuraBank personal loan. Agent quoted a pre-closure penalty of 4% which was not disclosed at the time of loan sanction. My loan agreement says no such charge.',
  'AuraBank Personal Loan',
  'Waiver', 12000.00,
  'IN_PROGRESS', 'HIGH',
  'Loans', 'e0000001-0000-0000-0000-000000000006',
  NOW() + INTERVAL '12 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '2 days'
),
(
  '11111111-0000-0000-0000-000000000029',
  'c0000001-0000-0000-0000-000000000010',
  'Technical', 'Statement Download Error',
  'Credit card statement for March 2026 shows ₹0 outstanding even though I have transactions. The PDF is corrupted. I need the correct statement for my visa application.',
  'AuraBank Credit Card',
  'Other', NULL,
  'OPEN', 'MEDIUM',
  'IT', 'e0000001-0000-0000-0000-000000000003',
  NOW() + INTERVAL '44 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '1 day'
),

-- Additional complaints to reach 50 total (mix of categories and departments)
(
  '11111111-0000-0000-0000-000000000030',
  'c0000001-0000-0000-0000-000000000001',
  'Technical', 'FD Premature Closure',
  'I requested premature FD closure on the app 5 days ago but the amount of ₹75,000 has not been credited back. Status shows "processing" since day one.',
  'AuraBank Fixed Deposit',
  'Refund', 75000.00,
  'ESCALATED', 'CRITICAL',
  'Finance', 'e0000001-0000-0000-0000-000000000002',
  NOW() - INTERVAL '10 hours',
  TRUE, '₹75,000 locked for 5 days. No resolution. RBI breach imminent.',
  NOW() - INTERVAL '1 day', NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '6 days'
),
(
  '11111111-0000-0000-0000-000000000031',
  'c0000001-0000-0000-0000-000000000002',
  'Service', 'Nominee Update Rejected',
  'My request to add a nominee to my savings account was rejected thrice. Documents are correct — Aadhaar and a signed nomination form. No one can explain why it keeps getting rejected.',
  'AuraBank Savings Account',
  'Other', NULL,
  'OPEN', 'MEDIUM',
  'Operations', 'e0000001-0000-0000-0000-000000000005',
  NOW() + INTERVAL '48 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '3 days'
),
(
  '11111111-0000-0000-0000-000000000032',
  'c0000001-0000-0000-0000-000000000003',
  'Billing', 'Cashback Not Credited',
  'I completed 5 qualifying transactions for the AuraBank December Cashback Offer but received only ₹200 instead of the promised ₹1,000 cashback. I have all transaction receipts.',
  'AuraBank Cashback Offer',
  'Refund', 800.00,
  'IN_PROGRESS', 'MEDIUM',
  'Finance', 'e0000001-0000-0000-0000-000000000002',
  NOW() + INTERVAL '22 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '2 days'
),
(
  '11111111-0000-0000-0000-000000000033',
  'c0000001-0000-0000-0000-000000000005',
  'Cards', 'PIN Change Not Working',
  'Green PIN for new credit card is not being accepted at ATMs. Card was received last week. Cannot use card anywhere.',
  'AuraBank Credit Card',
  'Other', NULL,
  'OPEN', 'MEDIUM',
  'Cards', 'e0000001-0000-0000-0000-000000000004',
  NOW() + INTERVAL '36 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '1 day'
),
(
  '11111111-0000-0000-0000-000000000034',
  'c0000001-0000-0000-0000-000000000006',
  'Loans', 'No Objection Certificate Delay',
  'My home loan was fully paid in February but the NOC has not been issued. Bank is supposed to issue NOC within 30 days. It has been 7 weeks. I need it for property registration.',
  'AuraBank Home Loan',
  'Other', NULL,
  'ESCALATED', 'HIGH',
  'Loans', 'e0000001-0000-0000-0000-000000000006',
  NOW() - INTERVAL '6 hours',
  TRUE, 'NOC delay beyond legal limit. Property registration at risk.',
  NOW() - INTERVAL '2 days', NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '10 days'
),
(
  '11111111-0000-0000-0000-000000000035',
  'c0000001-0000-0000-0000-000000000007',
  'Technical', 'Cheque Bounce Notification',
  'Received a cheque bounce notification but my account had sufficient balance. The cheque was for ₹25,000. Merchant is now charging a penalty and I am facing legal notice.',
  'AuraBank Savings Account',
  'Refund', 25000.00,
  'ESCALATED', 'CRITICAL',
  'IT', 'e0000001-0000-0000-0000-000000000003',
  NOW() - INTERVAL '12 hours',
  TRUE, 'Erroneous bounce with funds available. Legal implications for customer.',
  NOW() - INTERVAL '1 day', NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '3 days'
),
(
  '11111111-0000-0000-0000-000000000036',
  'c0000001-0000-0000-0000-000000000008',
  'KYC', 'PAN Update Issue',
  'My PAN card was updated from old number to new linked PAN but the change is not reflecting in my AuraBank account after 10 days. Getting tax deduction errors.',
  'AuraBank Savings Account',
  'Other', NULL,
  'IN_PROGRESS', 'MEDIUM',
  'Operations', 'e0000001-0000-0000-0000-000000000005',
  NOW() + INTERVAL '32 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '4 days'
),
(
  '11111111-0000-0000-0000-000000000037',
  'c0000001-0000-0000-0000-000000000009',
  'Service', 'Locker Wait',
  'Applied for a bank locker in AuraBank MG Road branch 8 months ago. Still on waiting list. Need to store important documents.',
  'AuraBank Locker',
  'Other', NULL,
  'OPEN', 'LOW',
  'Operations', 'e0000001-0000-0000-0000-000000000005',
  NOW() + INTERVAL '72 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '5 days'
),
(
  '11111111-0000-0000-0000-000000000038',
  'c0000001-0000-0000-0000-000000000010',
  'Billing', 'Interest on Error Transaction',
  'AuraBank charged interest on ₹45,000 even though the original transaction was an error that was supposed to be reversed. The reversal was done but interest was not waived.',
  'AuraBank Credit Card',
  'Waiver', 2200.00,
  'OPEN', 'HIGH',
  'Finance', 'e0000001-0000-0000-0000-000000000002',
  NOW() + INTERVAL '6 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '8 hours'
),
(
  '11111111-0000-0000-0000-000000000039',
  'c0000001-0000-0000-0000-000000000001',
  'Technical', 'NACH Mandate Failure',
  'NACH mandate for my SIP got rejected repeatedly. Demat broker shows the NACH was submitted but AuraBank side shows no request. My SIP has been paused for 3 months.',
  'AuraBank Savings Account',
  'Other', NULL,
  'IN_PROGRESS', 'MEDIUM',
  'IT', 'e0000001-0000-0000-0000-000000000003',
  NOW() + INTERVAL '42 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '3 days'
),
(
  '11111111-0000-0000-0000-000000000040',
  'c0000001-0000-0000-0000-000000000002',
  'Cards', 'Travel Insurance Not Activated',
  'My AuraBank Signature card came with complimentary travel insurance. When I tried to claim for a cancelled flight (loss: ₹18,000), the insurance company said it was never activated.',
  'AuraBank Signature Credit Card',
  'Refund', 18000.00,
  'ESCALATED', 'HIGH',
  'Cards', 'e0000001-0000-0000-0000-000000000004',
  NOW() - INTERVAL '9 hours',
  TRUE, 'Card benefit not delivered. Customer faced actual financial loss of ₹18,000.',
  NOW() - INTERVAL '2 days', NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '7 days'
),
(
  '11111111-0000-0000-0000-000000000041',
  'c0000001-0000-0000-0000-000000000004',
  'Technical', 'App Dark Mode Bug',
  'AuraBank app in dark mode shows white text on white background in the transfers section. Cannot read anything.',
  'AuraBank Mobile App',
  'Other', NULL,
  'OPEN', 'LOW',
  'IT', 'e0000001-0000-0000-0000-000000000003',
  NOW() + INTERVAL '72 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '2 days'
),
(
  '11111111-0000-0000-0000-000000000042',
  'c0000001-0000-0000-0000-000000000005',
  'Service', 'Relationship Manager Unresponsive',
  'My premium relationship manager has not responded to 8 emails in 3 weeks. I need guidance on reinvestment of my FD of ₹12 lakhs maturing next week.',
  'AuraBank Premium Banking',
  'Other', NULL,
  'OPEN', 'HIGH',
  'Operations', 'e0000001-0000-0000-0000-000000000005',
  NOW() + INTERVAL '8 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '1 day'
),
(
  '11111111-0000-0000-0000-000000000043',
  'c0000001-0000-0000-0000-000000000006',
  'KYC', 'Address Proof Rejection',
  'My utility bill as address proof was rejected because it is 4 months old. AuraBank website says bills up to 6 months are accepted.',
  'AuraBank Account',
  'Other', NULL,
  'RESOLVED', 'LOW',
  'Operations', 'e0000001-0000-0000-0000-000000000005',
  NOW() - INTERVAL '24 hours',
  FALSE, NULL, NULL,
  'Policy clarification sent. Customer''s document accepted. KYC completed.',
  NOW() - INTERVAL '3 days',
  5, 'Quick and helpful. Thank you.',
  NOW() - INTERVAL '5 days'
),
(
  '11111111-0000-0000-0000-000000000044',
  'c0000001-0000-0000-0000-000000000007',
  'Billing', 'Recurring Charge After Cancel',
  'Cancelled my AuraBank SmartSave subscription in January. Was charged ₹299/month for February, March, and April. Total overcharge: ₹897.',
  'AuraBank SmartSave',
  'Refund', 897.00,
  'IN_PROGRESS', 'MEDIUM',
  'Finance', 'e0000001-0000-0000-0000-000000000002',
  NOW() + INTERVAL '28 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '2 days'
),
(
  '11111111-0000-0000-0000-000000000045',
  'c0000001-0000-0000-0000-000000000008',
  'Loans', 'Loan Statement Incorrect',
  'My AuraBank car loan statement shows wrong principal vs interest breakup. The total is correct but the split is wrong which is causing issues when I file my taxes.',
  'AuraBank Car Loan',
  'Other', NULL,
  'OPEN', 'MEDIUM',
  'Loans', 'e0000001-0000-0000-0000-000000000006',
  NOW() + INTERVAL '50 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '3 days'
),
(
  '11111111-0000-0000-0000-000000000046',
  'c0000001-0000-0000-0000-000000000003',
  'Technical', 'Biometric Login Failure',
  'Fingerprint login was disabled on my AuraBank app after app update. I need to enter password every time which defeats the purpose. Password is also showing as incorrect now.',
  'AuraBank Mobile App',
  'Other', NULL,
  'IN_PROGRESS', 'MEDIUM',
  'IT', 'e0000001-0000-0000-0000-000000000003',
  NOW() + INTERVAL '38 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '4 days'
),
(
  '11111111-0000-0000-0000-000000000047',
  'c0000001-0000-0000-0000-000000000010',
  'Cards', 'Fraudulent Transaction',
  'A fraudulent international transaction of ₹8,900 appeared on my statement. I have never been to the merchant website. I want the charge reversed and card re-issued immediately.',
  'AuraBank Credit Card',
  'Refund', 8900.00,
  'ESCALATED', 'CRITICAL',
  'Cards', 'e0000001-0000-0000-0000-000000000004',
  NOW() - INTERVAL '5 hours',
  TRUE, 'Potential card fraud. ₹8,900 at risk. Immediate chargeback and card block needed.',
  NOW() - INTERVAL '8 hours', NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '2 days'
),
(
  '11111111-0000-0000-0000-000000000048',
  'c0000001-0000-0000-0000-000000000009',
  'Billing', 'TDS Certificate Missing',
  'TDS certificate (Form 16A) for interest earned on my FDs in FY2025-26 is not available for download. I need it for ITR filing by next week.',
  'AuraBank Fixed Deposit',
  'Other', NULL,
  'RESOLVED', 'MEDIUM',
  'Finance', 'e0000001-0000-0000-0000-000000000002',
  NOW() - INTERVAL '12 hours',
  FALSE, NULL, NULL,
  'TDS certificates uploaded to customer portal. Email sent with download link.',
  NOW() - INTERVAL '2 days',
  5, 'Perfect. Exactly what I needed.',
  NOW() - INTERVAL '3 days'
),
(
  '11111111-0000-0000-0000-000000000049',
  'c0000001-0000-0000-0000-000000000004',
  'Service', 'Queue Management',
  'Branch visit took 2.5 hours for a simple cheque deposit. The queue system at AuraBank Indiranagar branch is terrible. Only 1 counter open for 40+ customers.',
  'AuraBank Branch Service',
  'Apology', NULL,
  'CLOSED', 'LOW',
  'Operations', 'e0000001-0000-0000-0000-000000000005',
  NOW() - INTERVAL '48 hours',
  FALSE, NULL, NULL,
  'Apology issued. Branch visit times and staffing shared with branch manager for review.',
  NOW() - INTERVAL '4 days',
  3, 'Apology fine. But please fix the actual problem.',
  NOW() - INTERVAL '6 days'
),
(
  '11111111-0000-0000-0000-000000000050',
  'c0000001-0000-0000-0000-000000000001',
  'Loans', 'Education Loan Interest Subsidy',
  'Interest subsidy under Central Sector Interest Subsidy (CSIS) scheme has not been applied to my education loan for the last 2 quarters. Shortfall: ₹14,200.',
  'AuraBank Education Loan',
  'Refund', 14200.00,
  'OPEN', 'HIGH',
  'Loans', 'e0000001-0000-0000-0000-000000000006',
  NOW() + INTERVAL '16 hours',
  FALSE, NULL, NULL, NULL, NULL, NULL, NULL,
  NOW() - INTERVAL '6 hours'
)
ON CONFLICT(id) DO NOTHING;

-- ============================================================
-- AI ANALYSES (pre-seeded for ALL complaints)
-- ============================================================
INSERT INTO public.ai_analyses (complaint_id, sentiment, sentiment_score, urgency, classification, summary, suggested_response, financial_loss_estimate, signals)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 1', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000002', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 2', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000003', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 3', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000004', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 4', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000005', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 5', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000006', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 6', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000007', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 7', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000008', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 8', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000009', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 9', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000010', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 10', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000011', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 11', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000012', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 12', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000013', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 13', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000014', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 14', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000015', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 15', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000016', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 16', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000017', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 17', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000018', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 18', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000019', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 19', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000020', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 20', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000021', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 21', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000022', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 22', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000023', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 23', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000024', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 24', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000025', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 25', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000026', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 26', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000027', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 27', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000028', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 28', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000029', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 29', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000030', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 30', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000031', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 31', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000032', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 32', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000033', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 33', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000034', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 34', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000035', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 35', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000036', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 36', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000037', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 37', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000038', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 38', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000039', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 39', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000040', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 40', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000041', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 41', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000042', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 42', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000043', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 43', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000044', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 44', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000045', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 45', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000046', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 46', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000047', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 47', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000048', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 48', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000049', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 49', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB),
  ('11111111-0000-0000-0000-000000000050', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint 50', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB)
ON CONFLICT (complaint_id) DO NOTHING;

-- ============================================================
-- ROOT-CAUSE CLUSTERS (pre-seeded for CEO dashboard)
-- ============================================================
INSERT INTO public.clusters (id, label, description, complaint_ids, total_complaints, financial_impact, trend_data)
VALUES
(
  '22222222-0000-0000-0000-000000000001',
  'UPI & NEFT Transfer Failures',
  'Multiple customers reporting failed digital transfers where money is debited but not credited to the recipient. Likely a core banking integration issue post the March system update.',
  ARRAY[
    '11111111-0000-0000-0000-000000000005'::UUID,
    '11111111-0000-0000-0000-000000000015'::UUID,
    '11111111-0000-0000-0000-000000000009'::UUID
  ],
  3, 148200.00,
  '{"Jan": 1, "Feb": 2, "Mar": 5, "Apr": 8}'::JSONB
),
(
  '22222222-0000-0000-0000-000000000002',
  'Billing Errors & Overcharges',
  'Pattern of incorrect charges including duplicate transactions, late fees during downtime, and interest on cancelled transactions. Finance system inconsistency suspected.',
  ARRAY[
    '11111111-0000-0000-0000-000000000001'::UUID,
    '11111111-0000-0000-0000-000000000004'::UUID,
    '11111111-0000-0000-0000-000000000008'::UUID,
    '11111111-0000-0000-0000-000000000018'::UUID,
    '11111111-0000-0000-0000-000000000024'::UUID,
    '11111111-0000-0000-0000-000000000038'::UUID
  ],
  6, 29688.00,
  '{"Jan": 3, "Feb": 4, "Mar": 6, "Apr": 10}'::JSONB
),
(
  '22222222-0000-0000-0000-000000000003',
  'Mobile App & Netbanking Technical Failures',
  'Widespread app crashes, OTP failures, biometric lock issues and broken PDF downloads across multiple customers. The app release 4.2.1 (March) appears to have introduced regressions.',
  ARRAY[
    '11111111-0000-0000-0000-000000000003'::UUID,
    '11111111-0000-0000-0000-000000000009'::UUID,
    '11111111-0000-0000-0000-000000000017'::UUID,
    '11111111-0000-0000-0000-000000000020'::UUID,
    '11111111-0000-0000-0000-000000000023'::UUID,
    '11111111-0000-0000-0000-000000000029'::UUID,
    '11111111-0000-0000-0000-000000000041'::UUID,
    '11111111-0000-0000-0000-000000000046'::UUID
  ],
  8, 95000.00,
  '{"Jan": 2, "Feb": 3, "Mar": 10, "Apr": 15}'::JSONB
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- AUDIT LOGS (sample entries)
-- ============================================================
INSERT INTO public.audit_logs (actor_id, actor_role, action, resource_type, resource_id, metadata)
VALUES
  ('e0000001-0000-0000-0000-000000000002', 'employee', 'status_change', 'complaint', '11111111-0000-0000-0000-000000000004'::UUID, '{"from": "IN_PROGRESS", "to": "RESOLVED"}'),
  ('e0000001-0000-0000-0000-000000000003', 'employee', 'escalation', 'complaint', '11111111-0000-0000-0000-000000000023'::UUID, '{"reason": "Error E403 impacting multiple customers"}'),
  ('e0000001-0000-0000-0000-000000000004', 'employee', 'escalation', 'complaint', '11111111-0000-0000-0000-000000000001'::UUID, '{"reason": "Customer called 4 times with no resolution"}'),
  ('e0000001-0000-0000-0000-000000000001', 'ceo', 'status_change', 'complaint', '11111111-0000-0000-0000-000000000030'::UUID, '{"note": "Flagged for immediate senior finance team review"}'),
  ('e0000001-0000-0000-0000-000000000005', 'employee', 'status_change', 'complaint', '11111111-0000-0000-0000-000000000013'::UUID, '{"from": "OPEN", "to": "RESOLVED"}');

-- ============================================================
-- FAQs (AuraBank self-help articles)
-- ============================================================
INSERT INTO public.faqs (category, keywords, title, content)
VALUES
  ('Technical', ARRAY['otp', 'not received', 'sms', 'login'], 'OTP Not Received?',
   'If you are not receiving your OTP: 1) Check if your registered mobile number is correct in the app under Profile → Mobile Number. 2) Ensure SMS is not blocked by your carrier. 3) Wait 2 minutes and retry. 4) Use "Resend OTP" option. If issue persists, call 1800-XXX-XXXX.'),
  ('Technical', ARRAY['upi', 'failed', 'transfer', 'pending', 'debited'], 'UPI Payment Failed But Money Debited?',
   'If your UPI payment failed but money was debited: The amount is typically auto-reversed within 2-3 business hours. You can check the status under Payments → UPI History → [Transaction] → Status. If not reversed within 24 hours, raise a complaint with your UPI transaction ID.'),
  ('Cards', ARRAY['card blocked', 'declined', 'atm', 'card not working'], 'Card Blocked or Declined?',
   'Your card may be blocked if: 1) 3 wrong PINs were entered. 2) Suspected fraud was detected. 3) Card expired. To unblock: Go to Cards → Manage Card → Unblock. Or call 1800-XXX-XXXX for immediate assistance.'),
  ('Billing', ARRAY['hidden fee', 'annual fee', 'charge', 'unexpected'], 'Unexpected Charges on Account?',
   'Common charges include: Annual fees (credit cards), SMS alert fees (₹25/quarter), NACH bounce charges. To dispute a charge: Go to Statements → [Transaction] → Dispute This Charge. You will receive a response within 5 business days.'),
  ('Loans', ARRAY['emi', 'due date', 'payment', 'missed'], 'Missed EMI Payment?',
   'If you missed an EMI: Contact us within 5 days to avoid late fee. Late fee is ₹500 + 2% p.m. on overdue. You can pay via app under Loans → [Loan Account] → Pay EMI. A one-time waiver may be available for first-time misses.')
ON CONFLICT DO NOTHING;

-- ============================================================
-- NOTIFICATIONS (sample seeded notifications)
-- ============================================================
INSERT INTO public.notifications (recipient_id, event_type, title, body, complaint_id, read)
VALUES
  ('e0000001-0000-0000-0000-000000000001', 'escalation', 'CRITICAL: FD Closure Stuck (₹75,000)',
   'Complaint from Rahul Sharma regarding premature FD closure. ₹75,000 locked for 5 days. Immediate action required.',
   '11111111-0000-0000-0000-000000000030'::UUID, FALSE),
  ('e0000001-0000-0000-0000-000000000001', 'churn_flag', 'High Churn Risk: Mihir Joshi (91)',
   'Customer Mihir Joshi has a churn risk score of 91. 6 complaints filed. Multiple escalations. Immediate intervention recommended.',
   NULL, FALSE),
  ('e0000001-0000-0000-0000-000000000001', 'escalation', 'CRITICAL: International Card Decline (₹37,800)',
   'Mihir Joshi''s international card declined for ₹37,800. Purchase window closing. Cards team handling.',
   '11111111-0000-0000-0000-000000000010'::UUID, TRUE),
  ('e0000001-0000-0000-0000-000000000003', 'escalation', 'Escalation: UPI PIN Reset Failure (E403)',
   'Nisha Reddy''s complaint regarding E403 error has been escalated. May be system-wide bug.',
   '11111111-0000-0000-0000-000000000023'::UUID, FALSE),
  ('e0000001-0000-0000-0000-000000000004', 'escalation', 'Escalation: Travel Insurance Not Activated',
   'Ananya Verma — Card benefit not delivered causing ₹18,000 loss. Escalated for immediate resolution.',
   '11111111-0000-0000-0000-000000000040'::UUID, FALSE),
  ('e0000001-0000-0000-0000-000000000002', 'sla_warning', 'SLA Warning: Interest Overcharge (Mihir Joshi)',
   'Complaint comp0001-000...000038 (₹2,200 interest waiver) SLA deadline in 6 hours.',
   '11111111-0000-0000-0000-000000000038'::UUID, FALSE);
