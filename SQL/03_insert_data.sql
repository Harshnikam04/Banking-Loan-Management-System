-- Banking & Loan Management System
-- Sample Data Insertion Script

USE banking_system;

-- 1. Insert Branches
INSERT INTO Branches (branch_name, city, ifsc_code) VALUES
('Mumbai Central Branch', 'Mumbai', 'BKID0001234'),
('Connaught Place Branch', 'Delhi', 'BKID0005678'),
('MG Road Branch', 'Bengaluru', 'BKID0009101');

-- 2. Insert Employees
INSERT INTO Employees (employee_name, designation, branch_id) VALUES
('Rajesh Sharma', 'Branch Manager', 1),
('Priya Patel', 'Loan Officer', 1),
('Amit Verma', 'Loan Officer', 2),
('Sneha Reddy', 'Customer Relationship Manager', 3);

-- 3. Insert Customers
INSERT INTO Customers (first_name, last_name, email, phone, address) VALUES
('Aarav', 'Mehta', 'aarav.mehta@example.com', '9876543210', '102 Marine Drive, Mumbai'),
('Ananya', 'Iyer', 'ananya.iyer@example.com', '9876543211', '45 Indiranagar, Bengaluru'),
('Rohan', 'Gupta', 'rohan.gupta@example.com', '9876543212', '78 CP Outer Circle, Delhi');

-- 4. Insert Accounts
INSERT INTO Accounts (customer_id, branch_id, account_type, balance) VALUES
(1, 1, 'Savings', 150000.00),
(2, 3, 'Savings', 85000.50),
(3, 2, 'Current', 320000.00);

-- 5. Insert Loan Types
INSERT INTO LoanTypes (loan_name, description) VALUES
('Home Loan', 'Long-term loan for residential property purchase or construction'),
('Personal Loan', 'Unsecured loan for personal financial needs'),
('Vehicle Loan', 'Loan for purchasing new or used automobiles'),
('Business Loan', 'Commercial financing for business expansion and operational costs');

-- 6. Insert Loans
INSERT INTO Loans (customer_id, employee_id, loan_type_id, loan_amount, interest_rate, tenure_months, outstanding_balance, loan_status, start_date, next_due_date) VALUES
(1, 2, 1, 5000000.00, 8.50, 240, 4850000.00, 'Active', '2024-01-15', '2024-02-15'),
(2, 4, 3, 800000.00, 9.25, 60, 750000.00, 'Active', '2024-03-01', '2024-04-01'),
(3, 3, 4, 2000000.00, 11.00, 36, 2000000.00, 'Approved', '2024-04-01', '2024-05-01');

-- 7. Insert EMI Payments
INSERT INTO EMI_Payments (loan_id, payment_date, payment_amount, payment_mode) VALUES
(1, '2024-02-14', 43391.00, 'Net Banking'),
(1, '2024-03-14', 43391.00, 'UPI'),
(2, '2024-04-01', 16700.00, 'UPI');

-- 8. Insert Transactions
INSERT INTO Transactions (account_id, transaction_type, amount, description) VALUES
(1, 'Credit', 50000.00, 'Salary Credit'),
(1, 'Debit', 43391.00, 'EMI Auto-Debit Home Loan'),
(2, 'Debit', 16700.00, 'EMI Payment Vehicle Loan'),
(3, 'Credit', 200000.00, 'Business Client Transfer');