USE banking_system;

CREATE TABLE Branches (
    branch_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE Employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_name VARCHAR(100) NOT NULL,
    designation VARCHAR(50) NOT NULL,
    branch_id INT NOT NULL,

    FOREIGN KEY (branch_id)
        REFERENCES Branches(branch_id)
);

CREATE TABLE Accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    branch_id INT NOT NULL,
    account_type ENUM('Savings', 'Current') NOT NULL,
    balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    FOREIGN KEY (customer_id)
        REFERENCES Customers(customer_id),

    FOREIGN KEY (branch_id)
        REFERENCES Branches(branch_id),

    CHECK (balance >= 0)
);

CREATE TABLE LoanTypes (
    loan_type_id INT AUTO_INCREMENT PRIMARY KEY,
    loan_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE Loans (
    loan_id INT AUTO_INCREMENT PRIMARY KEY,

    customer_id INT NOT NULL,
    employee_id INT NOT NULL,
    loan_type_id INT NOT NULL,

    loan_amount DECIMAL(12,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    tenure_months INT NOT NULL,

    outstanding_balance DECIMAL(12,2) NOT NULL,
    loan_status ENUM('Pending', 'Approved', 'Active', 'Closed', 'Rejected') 
        NOT NULL DEFAULT 'Pending',

    start_date DATE,
    next_due_date DATE,

    FOREIGN KEY (customer_id)
        REFERENCES Customers(customer_id),

    FOREIGN KEY (employee_id)
        REFERENCES Employees(employee_id),

    FOREIGN KEY (loan_type_id)
        REFERENCES LoanTypes(loan_type_id),

    CHECK (loan_amount > 0),
    CHECK (interest_rate >= 0),
    CHECK (tenure_months > 0),
    CHECK (outstanding_balance >= 0)
);

CREATE TABLE EMI_Payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,

    loan_id INT NOT NULL,
    payment_date DATE NOT NULL,
    payment_amount DECIMAL(12,2) NOT NULL,

    payment_mode ENUM('UPI', 'Cash', 'Net Banking', 'Cheque')
        NOT NULL,

    FOREIGN KEY (loan_id)
        REFERENCES Loans(loan_id),

    CHECK (payment_amount > 0)
);

CREATE TABLE Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,

    account_id INT NOT NULL,
    transaction_type ENUM('Credit', 'Debit') NOT NULL,

    amount DECIMAL(12,2) NOT NULL,
    transaction_date DATETIME NOT NULL,

    description VARCHAR(255),

    FOREIGN KEY (account_id)
        REFERENCES Accounts(account_id),

    CHECK (amount > 0)
);