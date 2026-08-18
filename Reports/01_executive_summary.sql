-- ============================================================
-- Banking & Loan Management System
-- Executive Summary Analytical Report
-- ============================================================

USE banking_system;

SELECT '==================================================' AS Header;
SELECT 'BANKING SYSTEM EXECUTIVE METRICS DASHBOARD' AS Title;
SELECT '==================================================' AS Header;

-- 1. Key Performance Indicators (KPI Overview)
SELECT 
    (SELECT COUNT(*) FROM Branches) AS Total_Branches,
    (SELECT COUNT(*) FROM Employees) AS Total_Employees,
    (SELECT COUNT(*) FROM Customers) AS Total_Customers,
    (SELECT COUNT(*) FROM Accounts) AS Total_Accounts,
    (SELECT COALESCE(SUM(balance), 0) FROM Accounts) AS Total_Customer_Deposits_INR,
    (SELECT COUNT(*) FROM Loans) AS Total_Loans_Issued,
    (SELECT COALESCE(SUM(loan_amount), 0) FROM Loans) AS Total_Loan_Capital_Disbursed_INR,
    (SELECT COALESCE(SUM(outstanding_balance), 0) FROM Loans WHERE loan_status = 'Active') AS Active_Outstanding_Debt_INR,
    (SELECT COALESCE(SUM(payment_amount), 0) FROM EMI_Payments) AS Total_EMI_Collected_INR;

-- 2. Loan Portfolio Status Breakdown
SELECT 
    loan_status,
    COUNT(*) AS loan_count,
    ROUND(SUM(loan_amount), 2) AS total_amount,
    ROUND(SUM(outstanding_balance), 2) AS total_outstanding,
    ROUND(AVG(interest_rate), 2) AS avg_interest_rate
FROM Loans
GROUP BY loan_status
ORDER BY total_amount DESC;

-- 3. Deposit vs Loan Capital Balance Ratio
SELECT 
    (SELECT SUM(balance) FROM Accounts) AS total_deposits,
    (SELECT SUM(outstanding_balance) FROM Loans WHERE loan_status = 'Active') AS total_active_loans,
    ROUND(
        ((SELECT SUM(outstanding_balance) FROM Loans WHERE loan_status = 'Active') / 
         (SELECT SUM(balance) FROM Accounts)) * 100, 2
    ) AS loan_to_deposit_ratio_pct;
