-- ============================================================
-- Banking & Loan Management System
-- SQL Query & Business Analysis Script
-- ============================================================

USE banking_system;


-- ============================================================
-- SECTION 1: BASIC QUERIES
-- ============================================================


-- Query 1: Show all customers

SELECT *
FROM Customers;


-- Query 2: Show all active loans

SELECT
    loan_id,
    customer_id,
    loan_amount,
    interest_rate,
    outstanding_balance,
    loan_status
FROM Loans
WHERE loan_status = 'Active';


-- Query 3: Calculate total loan amount

SELECT
    SUM(loan_amount) AS total_loan_amount
FROM Loans;


-- Query 4: Calculate average interest rate

SELECT
    AVG(interest_rate) AS average_interest_rate
FROM Loans;


-- Query 5: Count loans by status

SELECT
    loan_status,
    COUNT(*) AS total_loans
FROM Loans
GROUP BY loan_status;


-- ============================================================
-- SECTION 2: JOIN QUERIES
-- ============================================================


-- Query 6: Customer loan details

SELECT
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    l.loan_id,
    l.loan_amount,
    l.interest_rate,
    l.outstanding_balance,
    l.loan_status
FROM Customers c
JOIN Loans l
    ON c.customer_id = l.customer_id;


-- Query 7: Loans processed by each employee

SELECT
    e.employee_name,
    COUNT(l.loan_id) AS total_loans_processed
FROM Employees e
LEFT JOIN Loans l
    ON e.employee_id = l.employee_id
GROUP BY e.employee_id, e.employee_name
ORDER BY total_loans_processed DESC;


-- Query 8: Loan portfolio by loan type

SELECT
    lt.loan_name,
    COUNT(l.loan_id) AS total_loans,
    COALESCE(SUM(l.loan_amount), 0) AS total_loan_amount
FROM LoanTypes lt
LEFT JOIN Loans l
    ON lt.loan_type_id = l.loan_type_id
GROUP BY lt.loan_type_id, lt.loan_name
ORDER BY total_loan_amount DESC;


-- Query 9: Branch-wise loan portfolio

SELECT
    b.branch_name,
    b.city,
    COUNT(l.loan_id) AS total_loans,
    COALESCE(SUM(l.loan_amount), 0) AS total_loan_amount
FROM Branches b
LEFT JOIN Employees e
    ON b.branch_id = e.branch_id
LEFT JOIN Loans l
    ON e.employee_id = l.employee_id
GROUP BY b.branch_id, b.branch_name, b.city
ORDER BY total_loan_amount DESC;


-- Query 10: High-value loans above ₹10 lakh

SELECT
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    l.loan_id,
    l.loan_amount,
    l.loan_status
FROM Customers c
JOIN Loans l
    ON c.customer_id = l.customer_id
WHERE l.loan_amount > 1000000
ORDER BY l.loan_amount DESC;


-- ============================================================
-- SECTION 3: GROUP BY AND HAVING
-- ============================================================


-- Query 11: Customers grouped by city

SELECT
    address,
    COUNT(*) AS total_customers
FROM Customers
GROUP BY address
ORDER BY total_customers DESC;


-- Query 12: Loan count by interest rate

SELECT
    interest_rate,
    COUNT(*) AS total_loans
FROM Loans
GROUP BY interest_rate
ORDER BY interest_rate DESC;


-- Query 13: Loan types with total loan amount above ₹10 lakh

SELECT
    lt.loan_name,
    SUM(l.loan_amount) AS total_loan_amount
FROM LoanTypes lt
JOIN Loans l
    ON lt.loan_type_id = l.loan_type_id
GROUP BY lt.loan_type_id, lt.loan_name
HAVING SUM(l.loan_amount) > 1000000
ORDER BY total_loan_amount DESC;


-- Query 14: Employees who processed more than one loan

SELECT
    e.employee_name,
    COUNT(l.loan_id) AS total_loans
FROM Employees e
JOIN Loans l
    ON e.employee_id = l.employee_id
GROUP BY e.employee_id, e.employee_name
HAVING COUNT(l.loan_id) > 1;


-- Query 15: Loan status summary with total value

SELECT
    loan_status,
    COUNT(*) AS total_loans,
    SUM(loan_amount) AS total_loan_value,
    SUM(outstanding_balance) AS total_outstanding
FROM Loans
GROUP BY loan_status;


-- ============================================================
-- SECTION 4: SUBQUERIES
-- ============================================================


-- Query 16: Find loans above the average loan amount

SELECT
    loan_id,
    loan_amount,
    loan_status
FROM Loans
WHERE loan_amount > (
    SELECT AVG(loan_amount)
    FROM Loans
)
ORDER BY loan_amount DESC;


-- Query 17: Find the highest loan amount

SELECT
    loan_id,
    loan_amount,
    loan_status
FROM Loans
WHERE loan_amount = (
    SELECT MAX(loan_amount)
    FROM Loans
);


-- Query 18: Find customers who have taken a loan

SELECT
    customer_id,
    CONCAT(first_name, ' ', last_name) AS customer_name
FROM Customers
WHERE customer_id IN (
    SELECT customer_id
    FROM Loans
);


-- Query 19: Find customers who have NOT taken a loan

SELECT
    customer_id,
    CONCAT(first_name, ' ', last_name) AS customer_name
FROM Customers
WHERE customer_id NOT IN (
    SELECT customer_id
    FROM Loans
);


-- Query 20: Find loans with outstanding balance
-- greater than the average outstanding balance

SELECT
    loan_id,
    loan_amount,
    outstanding_balance
FROM Loans
WHERE outstanding_balance > (
    SELECT AVG(outstanding_balance)
    FROM Loans
);


-- ============================================================
-- SECTION 5: DATE-BASED ANALYSIS
-- ============================================================


-- Query 21: Loans started in 2024

SELECT
    loan_id,
    customer_id,
    loan_amount,
    start_date
FROM Loans
WHERE YEAR(start_date) = 2024;


-- Query 22: Loans due in February

SELECT
    loan_id,
    customer_id,
    next_due_date,
    outstanding_balance
FROM Loans
WHERE MONTH(next_due_date) = 2;


-- Query 23: EMI payments made in 2024

SELECT
    payment_id,
    loan_id,
    payment_date,
    payment_amount,
    payment_mode
FROM EMI_Payments
WHERE YEAR(payment_date) = 2024
ORDER BY payment_date;


-- Query 24: Total EMI collection

SELECT
    SUM(payment_amount) AS total_emi_collection
FROM EMI_Payments;


-- Query 25: EMI collection by payment mode

SELECT
    payment_mode,
    COUNT(*) AS total_payments,
    SUM(payment_amount) AS total_collection
FROM EMI_Payments
GROUP BY payment_mode
ORDER BY total_collection DESC;


-- ============================================================
-- SECTION 6: ACCOUNT & TRANSACTION ANALYSIS
-- ============================================================


-- Query 26: Customer account details

SELECT
    a.account_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    a.account_type,
    a.balance
FROM Accounts a
JOIN Customers c
    ON a.customer_id = c.customer_id
ORDER BY a.balance DESC;


-- Query 27: Total balance by account type

SELECT
    account_type,
    COUNT(*) AS total_accounts,
    SUM(balance) AS total_balance
FROM Accounts
GROUP BY account_type;


-- Query 28: Credit vs Debit transactions

SELECT
    transaction_type,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_amount
FROM Transactions
GROUP BY transaction_type;


-- Query 29: Customer transaction history

SELECT
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    a.account_id,
    t.transaction_type,
    t.amount,
    t.transaction_date,
    t.description
FROM Transactions t
JOIN Accounts a
    ON t.account_id = a.account_id
JOIN Customers c
    ON a.customer_id = c.customer_id
ORDER BY t.transaction_date DESC;


-- Query 30: Largest transactions

SELECT
    transaction_id,
    account_id,
    transaction_type,
    amount,
    transaction_date,
    description
FROM Transactions
ORDER BY amount DESC
LIMIT 10;


-- ============================================================
-- SECTION 7: OUTSTANDING LOAN ANALYSIS
-- ============================================================


-- Query 31: Total outstanding loan balance

SELECT
    SUM(outstanding_balance) AS total_outstanding_balance
FROM Loans;


-- Query 32: Outstanding balance by loan type

SELECT
    lt.loan_name,
    SUM(l.outstanding_balance) AS total_outstanding
FROM LoanTypes lt
JOIN Loans l
    ON lt.loan_type_id = l.loan_type_id
GROUP BY lt.loan_type_id, lt.loan_name
ORDER BY total_outstanding DESC;


-- Query 33: Customers with outstanding loans

SELECT
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    l.loan_id,
    l.outstanding_balance,
    l.loan_status
FROM Customers c
JOIN Loans l
    ON c.customer_id = l.customer_id
WHERE l.outstanding_balance > 0
ORDER BY l.outstanding_balance DESC;


-- Query 34: Loans with more than 90% outstanding balance

SELECT
    loan_id,
    loan_amount,
    outstanding_balance,
    ROUND(
        (outstanding_balance / loan_amount) * 100,
        2
    ) AS outstanding_percentage
FROM Loans
WHERE (outstanding_balance / loan_amount) > 0.90;


-- ============================================================
-- SECTION 8: TOP-N ANALYSIS
-- ============================================================


-- Query 35: Top 5 customers by loan amount

SELECT
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    SUM(l.loan_amount) AS total_borrowed
FROM Customers c
JOIN Loans l
    ON c.customer_id = l.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY total_borrowed DESC
LIMIT 5;


-- Query 36: Top employees by loan portfolio

SELECT
    e.employee_name,
    SUM(l.loan_amount) AS total_loan_value
FROM Employees e
JOIN Loans l
    ON e.employee_id = l.employee_id
GROUP BY e.employee_id, e.employee_name
ORDER BY total_loan_value DESC;


-- ============================================================
-- SECTION 9: WINDOW FUNCTIONS
-- ============================================================


-- Query 37: Rank loans by amount

SELECT
    loan_id,
    loan_amount,
    RANK() OVER (
        ORDER BY loan_amount DESC
    ) AS loan_rank
FROM Loans;


-- Query 38: Rank customers by total borrowing

SELECT
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    SUM(l.loan_amount) AS total_borrowed,
    RANK() OVER (
        ORDER BY SUM(l.loan_amount) DESC
    ) AS customer_rank
FROM Customers c
JOIN Loans l
    ON c.customer_id = l.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name;


-- Query 39: Running EMI collection total

SELECT
    payment_id,
    payment_date,
    payment_amount,
    SUM(payment_amount) OVER (
        ORDER BY payment_date, payment_id
    ) AS running_collection
FROM EMI_Payments;


-- ============================================================
-- SECTION 10: CASE STATEMENTS
-- ============================================================


-- Query 40: Categorize loans by amount

SELECT
    loan_id,
    loan_amount,
    CASE
        WHEN loan_amount >= 5000000 THEN 'High Value'
        WHEN loan_amount >= 1000000 THEN 'Medium Value'
        ELSE 'Low Value'
    END AS loan_category
FROM Loans
ORDER BY loan_amount DESC;


-- Query 41: Categorize customers by account balance

SELECT
    a.account_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    a.balance,
    CASE
        WHEN a.balance >= 200000 THEN 'Premium'
        WHEN a.balance >= 100000 THEN 'Standard'
        ELSE 'Basic'
    END AS customer_segment
FROM Accounts a
JOIN Customers c
    ON a.customer_id = c.customer_id
ORDER BY a.balance DESC;


-- ============================================================
-- END OF QUERY FILE
-- ============================================================