-- ============================================================
-- Banking & Loan Management System
-- Branch Performance & Productivity Report
-- ============================================================

USE banking_system;

-- 1. Detailed Branch KPI Matrix
SELECT 
    b.branch_id,
    b.branch_name,
    b.city,
    b.ifsc_code,
    COUNT(DISTINCT e.employee_id) AS total_staff,
    COUNT(DISTINCT a.account_id) AS total_accounts,
    COALESCE(SUM(a.balance), 0.00) AS total_branch_deposits,
    COUNT(DISTINCT l.loan_id) AS total_loans_managed,
    COALESCE(SUM(l.loan_amount), 0.00) AS total_loan_disbursed,
    COALESCE(SUM(l.outstanding_balance), 0.00) AS total_active_outstanding
FROM Branches b
LEFT JOIN Employees e ON b.branch_id = e.branch_id
LEFT JOIN Accounts a ON b.branch_id = a.branch_id
LEFT JOIN Loans l ON e.employee_id = l.employee_id
GROUP BY b.branch_id, b.branch_name, b.city, b.ifsc_code
ORDER BY total_branch_deposits DESC;

-- 2. Employee Loan Productivity Leaderboard
SELECT 
    e.employee_id,
    e.employee_name,
    e.designation,
    b.branch_name,
    COUNT(l.loan_id) AS total_loans_processed,
    COALESCE(SUM(l.loan_amount), 0.00) AS total_volume_disbursed,
    COALESCE(SUM(l.outstanding_balance), 0.00) AS current_managed_portfolio
FROM Employees e
JOIN Branches b ON e.branch_id = b.branch_id
LEFT JOIN Loans l ON e.employee_id = l.employee_id
GROUP BY e.employee_id, e.employee_name, e.designation, b.branch_name
ORDER BY total_volume_disbursed DESC;
