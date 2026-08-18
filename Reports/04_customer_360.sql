-- ============================================================
-- Banking & Loan Management System
-- Customer 360 Degree Portfolio Report
-- ============================================================

USE banking_system;

-- 1. High Net Worth & Premium Borrowers Summary
SELECT 
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.email,
    c.phone,
    c.address,
    COALESCE(SUM(DISTINCT a.balance), 0.00) AS total_account_balance,
    COALESCE(SUM(DISTINCT l.loan_amount), 0.00) AS total_borrowed_capital,
    COALESCE(SUM(DISTINCT l.outstanding_balance), 0.00) AS total_outstanding_loan,
    CASE 
        WHEN COALESCE(SUM(DISTINCT a.balance), 0.00) >= 300000 THEN 'Platinum / VIP'
        WHEN COALESCE(SUM(DISTINCT a.balance), 0.00) >= 100000 THEN 'Gold Tier'
        ELSE 'Silver Tier'
    END AS customer_tier
FROM Customers c
LEFT JOIN Accounts a ON c.customer_id = a.customer_id
LEFT JOIN Loans l ON c.customer_id = l.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name, c.email, c.phone, c.address
ORDER BY total_account_balance DESC
LIMIT 50;

-- 2. Customer Repayment Track Record & Reliability
SELECT 
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    COUNT(p.payment_id) AS total_emi_payments_made,
    SUM(p.payment_amount) AS total_emi_paid_amount
FROM Customers c
JOIN Loans l ON c.customer_id = l.customer_id
JOIN EMI_Payments p ON l.loan_id = p.loan_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY total_emi_paid_amount DESC;
