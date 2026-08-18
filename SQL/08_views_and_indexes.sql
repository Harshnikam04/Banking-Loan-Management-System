-- ============================================================
-- Banking & Loan Management System
-- Database Views & Indexes Script
-- ============================================================

USE banking_system;

-- ============================================================
-- SECTION 1: DATABASE VIEWS
-- ============================================================

-- View 1: vw_active_loans
-- Comprehensive view of all currently active loan contracts.
CREATE OR REPLACE VIEW vw_active_loans AS
SELECT 
    l.loan_id,
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.phone,
    c.email,
    lt.loan_name AS loan_type,
    l.loan_amount,
    l.interest_rate,
    l.tenure_months,
    l.outstanding_balance,
    l.start_date,
    l.next_due_date,
    e.employee_name AS loan_officer,
    b.branch_name
FROM Loans l
JOIN Customers c ON l.customer_id = c.customer_id
JOIN LoanTypes lt ON l.loan_type_id = lt.loan_type_id
JOIN Employees e ON l.employee_id = e.employee_id
JOIN Branches b ON e.branch_id = b.branch_id
WHERE l.loan_status = 'Active';


-- View 2: vw_branch_performance
-- Performance metric view aggregating accounts, deposits, and total loans per branch.
CREATE OR REPLACE VIEW vw_branch_performance AS
SELECT 
    b.branch_id,
    b.branch_name,
    b.city,
    b.ifsc_code,
    COUNT(DISTINCT e.employee_id) AS total_employees,
    COUNT(DISTINCT a.account_id) AS total_accounts,
    COALESCE(SUM(a.balance), 0.00) AS total_branch_deposits,
    COUNT(DISTINCT l.loan_id) AS total_loans_issued,
    COALESCE(SUM(l.loan_amount), 0.00) AS total_loan_disbursed,
    COALESCE(SUM(l.outstanding_balance), 0.00) AS total_outstanding_loan_balance
FROM Branches b
LEFT JOIN Employees e ON b.branch_id = e.branch_id
LEFT JOIN Accounts a ON b.branch_id = a.branch_id
LEFT JOIN Loans l ON e.employee_id = l.employee_id
GROUP BY b.branch_id, b.branch_name, b.city, b.ifsc_code;


-- View 3: vw_npa_loans (Non-Performing Assets / Overdue Loans)
-- Highlights loans that are past due date with remaining balances.
CREATE OR REPLACE VIEW vw_npa_loans AS
SELECT 
    l.loan_id,
    CONCAT(c.first_name, ' ', c.last_name) AS borrower_name,
    c.phone,
    c.email,
    lt.loan_name,
    l.loan_amount,
    l.outstanding_balance,
    l.next_due_date,
    DATEDIFF(CURRENT_DATE(), l.next_due_date) AS days_overdue,
    e.employee_name AS managing_officer,
    b.branch_name
FROM Loans l
JOIN Customers c ON l.customer_id = c.customer_id
JOIN LoanTypes lt ON l.loan_type_id = lt.loan_type_id
JOIN Employees e ON l.employee_id = e.employee_id
JOIN Branches b ON e.branch_id = b.branch_id
WHERE l.loan_status = 'Active' 
  AND l.next_due_date < CURRENT_DATE()
  AND l.outstanding_balance > 0;


-- View 4: vw_customer_portfolio
-- Single window profile summarizing deposit balances vs debt obligations.
CREATE OR REPLACE VIEW vw_customer_portfolio AS
SELECT 
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.email,
    c.phone,
    COUNT(DISTINCT a.account_id) AS total_accounts,
    COALESCE(SUM(a.balance), 0.00) AS total_deposit_balance,
    COUNT(DISTINCT l.loan_id) AS total_loans,
    COALESCE(SUM(l.outstanding_balance), 0.00) AS total_debt_balance
FROM Customers c
LEFT JOIN Accounts a ON c.customer_id = a.customer_id
LEFT JOIN Loans l ON c.customer_id = l.customer_id AND l.loan_status = 'Active'
GROUP BY c.customer_id, c.first_name, c.last_name, c.email, c.phone;


-- ============================================================
-- SECTION 2: PERFORMANCE INDEXES
-- ============================================================

-- Index on Customers (email, phone) for fast authentication and search
CREATE INDEX idx_customers_contact ON Customers (email, phone);

-- Index on Accounts (customer_id, branch_id) for relational joins
CREATE INDEX idx_accounts_customer_branch ON Accounts (customer_id, branch_id);

-- Index on Loans (loan_status, next_due_date) for fast filtering of active & overdue loans
CREATE INDEX idx_loans_status_duedate ON Loans (loan_status, next_due_date);

-- Index on Loans (customer_id, employee_id, loan_type_id)
CREATE INDEX idx_loans_relational ON Loans (customer_id, employee_id, loan_type_id);

-- Index on EMI_Payments (loan_id, payment_date)
CREATE INDEX idx_emi_payments_loan_date ON EMI_Payments (loan_id, payment_date);

-- Index on Transactions (account_id, transaction_date)
CREATE INDEX idx_transactions_account_date ON Transactions (account_id, transaction_date);
