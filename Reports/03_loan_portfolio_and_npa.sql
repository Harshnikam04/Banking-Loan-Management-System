-- ============================================================
-- Banking & Loan Management System
-- Loan Portfolio Risk & Non-Performing Asset (NPA) Report
-- ============================================================

USE banking_system;

-- 1. Product-wise Credit Distribution
SELECT 
    lt.loan_name AS loan_product,
    COUNT(l.loan_id) AS loan_count,
    ROUND(SUM(l.loan_amount), 2) AS total_disbursed,
    ROUND(SUM(l.outstanding_balance), 2) AS total_outstanding,
    ROUND(AVG(l.interest_rate), 2) AS avg_interest_rate,
    ROUND(AVG(l.tenure_months), 1) AS avg_tenure_months
FROM LoanTypes lt
LEFT JOIN Loans l ON lt.loan_type_id = l.loan_type_id
GROUP BY lt.loan_type_id, lt.loan_name
ORDER BY total_disbursed DESC;

-- 2. Non-Performing Assets (NPA) & Overdue Loans Risk Analysis
SELECT 
    l.loan_id,
    CONCAT(c.first_name, ' ', c.last_name) AS borrower_name,
    c.phone,
    lt.loan_name AS loan_type,
    l.loan_amount,
    l.outstanding_balance,
    l.next_due_date,
    DATEDIFF(CURRENT_DATE(), l.next_due_date) AS days_overdue,
    CASE 
        WHEN DATEDIFF(CURRENT_DATE(), l.next_due_date) > 90 THEN 'Substandard / NPA'
        WHEN DATEDIFF(CURRENT_DATE(), l.next_due_date) > 60 THEN 'SMA-2 (61-90 days)'
        WHEN DATEDIFF(CURRENT_DATE(), l.next_due_date) > 30 THEN 'SMA-1 (31-60 days)'
        ELSE 'SMA-0 (1-30 days)'
    END AS risk_classification
FROM Loans l
JOIN Customers c ON l.customer_id = c.customer_id
JOIN LoanTypes lt ON l.loan_type_id = lt.loan_type_id
WHERE l.loan_status = 'Active' 
  AND l.next_due_date < CURRENT_DATE()
  AND l.outstanding_balance > 0
ORDER BY days_overdue DESC;

-- 3. EMI Repayment Collection Channel Statistics
SELECT 
    payment_mode,
    COUNT(*) AS total_transactions,
    SUM(payment_amount) AS total_collected_amount,
    ROUND(AVG(payment_amount), 2) AS avg_transaction_value
FROM EMI_Payments
GROUP BY payment_mode
ORDER BY total_collected_amount DESC;
