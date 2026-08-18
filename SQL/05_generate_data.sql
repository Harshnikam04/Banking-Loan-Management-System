-- ============================================================
-- Banking & Loan Management System
-- Large Dataset Generation Script
-- ============================================================

USE banking_system;


-- ============================================================
-- 1. ADDITIONAL BRANCHES
-- ============================================================

INSERT INTO Branches
(branch_name, city, ifsc_code)
VALUES
('Bandra West Branch', 'Mumbai', 'BANK0001011'),
('Hinjewadi Branch', 'Pune', 'BANK0001012'),
('Vashi Branch', 'Navi Mumbai', 'BANK0001013'),
('Kothrud Branch', 'Pune', 'BANK0001014'),
('Borivali Branch', 'Mumbai', 'BANK0001015'),
('Whitefield Branch', 'Bengaluru', 'BANK0001016'),
('Salt Lake Branch', 'Kolkata', 'BANK0001017');


-- Verify branches
SELECT COUNT(*) AS total_branches
FROM Branches;


-- ============================================================
-- 2. ADDITIONAL EMPLOYEES
-- ============================================================

INSERT INTO Employees
(employee_name, designation, branch_id)
VALUES
('Vikram Joshi', 'Loan Officer', 4),
('Neha Kulkarni', 'Loan Officer', 5),
('Suresh Patil', 'Branch Manager', 6),
('Kavya Nair', 'Loan Officer', 7),
('Arjun Deshmukh', 'Loan Officer', 8),
('Pooja Shah', 'Customer Relationship Manager', 9),
('Rahul Kapoor', 'Loan Officer', 10),
('Meera Singh', 'Loan Officer', 1),
('Aditya Rao', 'Credit Analyst', 2),
('Shweta More', 'Loan Officer', 3),
('Karan Malhotra', 'Credit Analyst', 4),
('Ritu Jain', 'Customer Relationship Manager', 5),
('Manish Yadav', 'Loan Officer', 6),
('Snehal Patil', 'Loan Officer', 7),
('Nitin Verma', 'Credit Analyst', 8),
('Deepa Menon', 'Loan Officer', 9),
('Akash Gupta', 'Loan Officer', 10),
('Isha Bansal', 'Customer Relationship Manager', 1),
('Rohit Shinde', 'Loan Officer', 2),
('Tanvi Joshi', 'Credit Analyst', 3);


-- Verify employees
SELECT COUNT(*) AS total_employees
FROM Employees;


-- ============================================================
-- 3. GENERATE 500 ADDITIONAL CUSTOMERS
-- ============================================================

INSERT INTO Customers
(
    first_name,
    last_name,
    email,
    phone,
    address
)
WITH RECURSIVE customer_numbers AS
(
    SELECT 1 AS n

    UNION ALL

    SELECT n + 1
    FROM customer_numbers
    WHERE n < 500
)
SELECT

    CASE MOD(n, 15)
        WHEN 0 THEN 'Aarav'
        WHEN 1 THEN 'Ananya'
        WHEN 2 THEN 'Rohan'
        WHEN 3 THEN 'Priya'
        WHEN 4 THEN 'Rahul'
        WHEN 5 THEN 'Sneha'
        WHEN 6 THEN 'Vikram'
        WHEN 7 THEN 'Neha'
        WHEN 8 THEN 'Aditya'
        WHEN 9 THEN 'Pooja'
        WHEN 10 THEN 'Karan'
        WHEN 11 THEN 'Meera'
        WHEN 12 THEN 'Akash'
        WHEN 13 THEN 'Isha'
        ELSE 'Riya'
    END AS first_name,

    CASE MOD(n, 15)
        WHEN 0 THEN 'Sharma'
        WHEN 1 THEN 'Patel'
        WHEN 2 THEN 'Gupta'
        WHEN 3 THEN 'Reddy'
        WHEN 4 THEN 'Verma'
        WHEN 5 THEN 'Joshi'
        WHEN 6 THEN 'Deshmukh'
        WHEN 7 THEN 'Kulkarni'
        WHEN 8 THEN 'Mehta'
        WHEN 9 THEN 'Shah'
        WHEN 10 THEN 'Malhotra'
        WHEN 11 THEN 'Nair'
        WHEN 12 THEN 'Singh'
        WHEN 13 THEN 'Bansal'
        ELSE 'Jain'
    END AS last_name,

    CONCAT(
        'customer',
        n,
        '@bankdemo.com'
    ) AS email,

    CONCAT(
        '90000',
        LPAD(n, 5, '0')
    ) AS phone,

    CONCAT(
        100 + MOD(n, 900),
        ' ',
        CASE MOD(n, 8)
            WHEN 0 THEN 'MG Road'
            WHEN 1 THEN 'Main Road'
            WHEN 2 THEN 'Station Road'
            WHEN 3 THEN 'Market Road'
            WHEN 4 THEN 'College Road'
            WHEN 5 THEN 'Gandhi Nagar'
            WHEN 6 THEN 'Shivaji Nagar'
            ELSE 'Nehru Road'
        END,
        ', ',
        CASE MOD(n, 10)
            WHEN 0 THEN 'Mumbai'
            WHEN 1 THEN 'Pune'
            WHEN 2 THEN 'Delhi'
            WHEN 3 THEN 'Bengaluru'
            WHEN 4 THEN 'Nashik'
            WHEN 5 THEN 'Nagpur'
            WHEN 6 THEN 'Thane'
            WHEN 7 THEN 'Kolhapur'
            WHEN 8 THEN 'Sangli'
            ELSE 'Kolkata'
        END
    ) AS address

FROM customer_numbers;


-- Verify customers
SELECT COUNT(*) AS total_customers
FROM Customers;


-- ============================================================
-- 4. GENERATE ACCOUNTS FOR THE NEW CUSTOMERS
-- ============================================================

INSERT INTO Accounts
(
    customer_id,
    branch_id,
    account_type,
    balance
)
SELECT
    c.customer_id,

    MOD(c.customer_id - 1, 17) + 1 AS branch_id,

    CASE
        WHEN MOD(c.customer_id, 5) = 0
            THEN 'Current'
        ELSE 'Savings'
    END AS account_type,

    ROUND(
        10000 + (RAND() * 490000),
        2
    ) AS balance

FROM Customers c
WHERE c.customer_id > 3;


-- Verify accounts
SELECT COUNT(*) AS total_accounts
FROM Accounts;


-- ============================================================
-- 5. INSERT / VERIFY LOAN TYPES
-- ============================================================

INSERT INTO LoanTypes
(
    loan_name,
    description
)
VALUES
('Education Loan',
 'Loan for higher education and academic expenses');


-- Verify loan types
SELECT
    loan_type_id,
    loan_name
FROM LoanTypes
ORDER BY loan_type_id;


-- ============================================================
-- 6. GENERATE LOANS
-- ============================================================

INSERT INTO Loans
(
    customer_id,
    employee_id,
    loan_type_id,
    loan_amount,
    interest_rate,
    tenure_months,
    outstanding_balance,
    loan_status,
    start_date,
    next_due_date
)
WITH RECURSIVE loan_numbers AS
(
    SELECT 1 AS n

    UNION ALL

    SELECT n + 1
    FROM loan_numbers
    WHERE n < 1000
)
SELECT

    MOD(n - 1, 503) + 1 AS customer_id,

    MOD(n - 1, 24) + 1 AS employee_id,

    MOD(n - 1, 5) + 1 AS loan_type_id,

    CASE MOD(n, 5)
        WHEN 0 THEN 750000
        WHEN 1 THEN 1500000
        WHEN 2 THEN 2500000
        WHEN 3 THEN 500000
        ELSE 5000000
    END AS loan_amount,

    CASE MOD(n, 5)
        WHEN 0 THEN 8.50
        WHEN 1 THEN 9.25
        WHEN 2 THEN 10.50
        WHEN 3 THEN 11.00
        ELSE 8.25
    END AS interest_rate,

    CASE MOD(n, 4)
        WHEN 0 THEN 24
        WHEN 1 THEN 36
        WHEN 2 THEN 60
        ELSE 120
    END AS tenure_months,

    ROUND(
        (
            CASE MOD(n, 5)
                WHEN 0 THEN 750000
                WHEN 1 THEN 1500000
                WHEN 2 THEN 2500000
                WHEN 3 THEN 500000
                ELSE 5000000
            END
        ) * (
            0.40 + (RAND() * 0.55)
        ),
        2
    ) AS outstanding_balance,

    CASE MOD(n, 10)
        WHEN 0 THEN 'Closed'
        WHEN 1 THEN 'Rejected'
        WHEN 2 THEN 'Pending'
        WHEN 3 THEN 'Approved'
        ELSE 'Active'
    END AS loan_status,

    DATE_ADD(
        '2022-01-01',
        INTERVAL MOD(n * 17, 1500) DAY
    ) AS start_date,

    DATE_ADD(
        DATE_ADD(
            '2022-01-01',
            INTERVAL MOD(n * 17, 1500) DAY
        ),
        INTERVAL 1 MONTH
    ) AS next_due_date

FROM loan_numbers;


-- Verify loans
SELECT COUNT(*) AS total_loans
FROM Loans;


-- ============================================================
-- 7. GENERATE EMI PAYMENTS
-- ============================================================

INSERT INTO EMI_Payments
(
    loan_id,
    payment_date,
    payment_amount,
    payment_mode
)
WITH RECURSIVE payment_numbers AS
(
    SELECT 1 AS n

    UNION ALL

    SELECT n + 1
    FROM payment_numbers
    WHERE n < 5000
)
SELECT

    MOD(n - 1, 1000) + 1 AS loan_id,

    DATE_ADD(
        '2024-01-01',
        INTERVAL MOD(n * 7, 900) DAY
    ) AS payment_date,

    CASE MOD(n, 4)
        WHEN 0 THEN 15000.00
        WHEN 1 THEN 20000.00
        WHEN 2 THEN 25000.00
        ELSE 30000.00
    END AS payment_amount,

    CASE MOD(n, 4)
        WHEN 0 THEN 'UPI'
        WHEN 1 THEN 'Net Banking'
        WHEN 2 THEN 'Cheque'
        ELSE 'Cash'
    END AS payment_mode

FROM payment_numbers;


-- Verify EMI payments
SELECT COUNT(*) AS total_emi_payments
FROM EMI_Payments;


-- ============================================================
-- 8. GENERATE ACCOUNT TRANSACTIONS
-- ============================================================

INSERT INTO Transactions
(
    account_id,
    transaction_type,
    amount,
    transaction_date,
    description
)
WITH RECURSIVE transaction_numbers AS
(
    SELECT 1 AS n

    UNION ALL

    SELECT n + 1
    FROM transaction_numbers
    WHERE n < 5000
)
SELECT

    MOD(n - 1, 503) + 1 AS account_id,

    CASE
        WHEN MOD(n, 3) = 0
            THEN 'Credit'
        ELSE 'Debit'
    END AS transaction_type,

    ROUND(
        500 + (RAND() * 50000),
        2
    ) AS amount,

    DATE_ADD(
        '2024-01-01',
        INTERVAL MOD(n * 5, 900) DAY
    )
    + INTERVAL MOD(n, 24) HOUR AS transaction_date,

    CASE MOD(n, 6)
        WHEN 0 THEN 'Salary Credit'
        WHEN 1 THEN 'ATM Withdrawal'
        WHEN 2 THEN 'Online Transfer'
        WHEN 3 THEN 'Bill Payment'
        WHEN 4 THEN 'EMI Payment'
        ELSE 'UPI Transaction'
    END AS description

FROM transaction_numbers;


-- Verify transactions
SELECT COUNT(*) AS total_transactions
FROM Transactions;


-- ============================================================
-- 9. FINAL DATASET SUMMARY
-- ============================================================

SELECT
    'Branches' AS table_name,
    COUNT(*) AS record_count
FROM Branches

UNION ALL

SELECT
    'Employees',
    COUNT(*)
FROM Employees

UNION ALL

SELECT
    'Customers',
    COUNT(*)
FROM Customers

UNION ALL

SELECT
    'Accounts',
    COUNT(*)
FROM Accounts

UNION ALL

SELECT
    'LoanTypes',
    COUNT(*)
FROM LoanTypes

UNION ALL

SELECT
    'Loans',
    COUNT(*)
FROM Loans

UNION ALL

SELECT
    'EMI_Payments',
    COUNT(*)
FROM EMI_Payments

UNION ALL

SELECT
    'Transactions',
    COUNT(*)
FROM Transactions;