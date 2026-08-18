-- ============================================================
-- Banking & Loan Management System
-- Stored Procedures Script
-- ============================================================

USE banking_system;

DELIMITER //

-- ============================================================
-- Procedure 1: sp_ProcessEMIPayment
-- Description: Processes an EMI payment for a loan, updates
--              the outstanding balance, and auto-closes loan
--              if balance reaches zero.
-- ============================================================
DROP PROCEDURE IF EXISTS sp_ProcessEMIPayment //

CREATE PROCEDURE sp_ProcessEMIPayment(
    IN p_loan_id INT,
    IN p_payment_amount DECIMAL(12,2),
    IN p_payment_mode VARCHAR(20),
    OUT p_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_current_balance DECIMAL(12,2);
    DECLARE v_loan_status VARCHAR(20);
    DECLARE v_new_balance DECIMAL(12,2);
    DECLARE v_next_due DATE;

    -- Validate input amount
    IF p_payment_amount <= 0 THEN
        SET p_message = 'ERROR: Payment amount must be greater than zero.';
        LEAVE proc_label;
    END IF;

    -- Check if loan exists
    SELECT outstanding_balance, loan_status, next_due_date
    INTO v_current_balance, v_loan_status, v_next_due
    FROM Loans
    WHERE loan_id = p_loan_id;

    IF v_loan_status IS NULL THEN
        SET p_message = 'ERROR: Loan ID does not exist.';
        LEAVE proc_label;
    END IF;

    IF v_loan_status = 'Closed' THEN
        SET p_message = 'ERROR: Loan is already fully repaid and closed.';
        LEAVE proc_label;
    END IF;

    IF v_loan_status = 'Rejected' THEN
        SET p_message = 'ERROR: Cannot accept EMI payments for a rejected loan.';
        LEAVE proc_label;
    END IF;

    -- Calculate new balance
    SET v_new_balance = v_current_balance - p_payment_amount;
    IF v_new_balance < 0 THEN
        SET v_new_balance = 0.00;
    END IF;

    -- Insert EMI payment record
    INSERT INTO EMI_Payments (loan_id, payment_date, payment_amount, payment_mode)
    VALUES (p_loan_id, CURRENT_DATE(), p_payment_amount, p_payment_mode);

    -- Update Loan balance and next due date
    IF v_new_balance = 0.00 THEN
        UPDATE Loans
        SET outstanding_balance = 0.00,
            loan_status = 'Closed'
        WHERE loan_id = p_loan_id;
        SET p_message = CONCAT('SUCCESS: Payment of ₹', p_payment_amount, ' processed. Loan is now FULLY PAID and CLOSED.');
    ELSE
        UPDATE Loans
        SET outstanding_balance = v_new_balance,
            loan_status = 'Active',
            next_due_date = DATE_ADD(IFNULL(v_next_due, CURRENT_DATE()), INTERVAL 1 MONTH)
        WHERE loan_id = p_loan_id;
        SET p_message = CONCAT('SUCCESS: Payment of ₹', p_payment_amount, ' processed. Remaining balance: ₹', v_new_balance);
    END IF;

END //


-- ============================================================
-- Procedure 2: sp_DisburseLoan
-- Description: Approves and disburses a loan, creating a loan record
--              and crediting the loan amount directly to customer's account.
-- ============================================================
DROP PROCEDURE IF EXISTS sp_DisburseLoan //

CREATE PROCEDURE sp_DisburseLoan(
    IN p_customer_id INT,
    IN p_employee_id INT,
    IN p_loan_type_id INT,
    IN p_loan_amount DECIMAL(12,2),
    IN p_interest_rate DECIMAL(5,2),
    IN p_tenure_months INT,
    IN p_account_id INT,
    OUT p_loan_id INT,
    OUT p_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_customer_exists INT;
    DECLARE v_account_exists INT;

    -- Validate parameters
    IF p_loan_amount <= 0 OR p_interest_rate < 0 OR p_tenure_months <= 0 THEN
        SET p_message = 'ERROR: Invalid loan parameters.';
        SET p_loan_id = NULL;
        LEAVE proc_label;
    END IF;

    -- Verify customer and account existence
    SELECT COUNT(*) INTO v_customer_exists FROM Customers WHERE customer_id = p_customer_id;
    SELECT COUNT(*) INTO v_account_exists FROM Accounts WHERE account_id = p_account_id AND customer_id = p_customer_id;

    IF v_customer_exists = 0 THEN
        SET p_message = 'ERROR: Customer not found.';
        SET p_loan_id = NULL;
        LEAVE proc_label;
    END IF;

    IF v_account_exists = 0 THEN
        SET p_message = 'ERROR: Specified account does not belong to customer.';
        SET p_loan_id = NULL;
        LEAVE proc_label;
    END IF;

    -- Create loan entry
    INSERT INTO Loans (
        customer_id, employee_id, loan_type_id, loan_amount,
        interest_rate, tenure_months, outstanding_balance,
        loan_status, start_date, next_due_date
    )
    VALUES (
        p_customer_id, p_employee_id, p_loan_type_id, p_loan_amount,
        p_interest_rate, p_tenure_months, p_loan_amount,
        'Active', CURRENT_DATE(), DATE_ADD(CURRENT_DATE(), INTERVAL 1 MONTH)
    );

    SET p_loan_id = LAST_INSERT_ID();

    -- Credit account with disbursed amount
    UPDATE Accounts
    SET balance = balance + p_loan_amount
    WHERE account_id = p_account_id;

    -- Log transaction
    INSERT INTO Transactions (account_id, transaction_type, amount, transaction_date, description)
    VALUES (p_account_id, 'Credit', p_loan_amount, NOW(), CONCAT('Loan Disbursal - Loan #', p_loan_id));

    SET p_message = CONCAT('SUCCESS: Loan #', p_loan_id, ' disbursed successfully. Account #', p_account_id, ' credited with ₹', p_loan_amount);

END //


-- ============================================================
-- Procedure 3: sp_CalculateMonthlyInterest
-- Description: Calculates monthly interest accrued for all active loans.
-- ============================================================
DROP PROCEDURE IF EXISTS sp_CalculateMonthlyInterest //

CREATE PROCEDURE sp_CalculateMonthlyInterest()
BEGIN
    SELECT 
        l.loan_id,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        l.outstanding_balance,
        l.interest_rate,
        ROUND((l.outstanding_balance * (l.interest_rate / 100) / 12), 2) AS monthly_interest_due
    FROM Loans l
    JOIN Customers c ON l.customer_id = c.customer_id
    WHERE l.loan_status = 'Active' AND l.outstanding_balance > 0
    ORDER BY monthly_interest_due DESC;
END //


-- ============================================================
-- Procedure 4: sp_AssessLateFees
-- Description: Identifies overdue active loans past their next_due_date
--              and calculates late penalty fee (2% of outstanding EMI).
-- ============================================================
DROP PROCEDURE IF EXISTS sp_AssessLateFees //

CREATE PROCEDURE sp_AssessLateFees()
BEGIN
    SELECT 
        l.loan_id,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        c.phone,
        l.outstanding_balance,
        l.next_due_date,
        DATEDIFF(CURRENT_DATE(), l.next_due_date) AS days_overdue,
        ROUND(l.outstanding_balance * 0.02, 2) AS late_fee_assessed
    FROM Loans l
    JOIN Customers c ON l.customer_id = c.customer_id
    WHERE l.loan_status = 'Active' 
      AND l.next_due_date < CURRENT_DATE()
    ORDER BY days_overdue DESC;
END //


-- ============================================================
-- Procedure 5: sp_GetCustomerPortfolio
-- Description: Generates a complete financial snapshot of a customer.
-- ============================================================
DROP PROCEDURE IF EXISTS sp_GetCustomerPortfolio //

CREATE PROCEDURE sp_GetCustomerPortfolio(
    IN p_customer_id INT
)
BEGIN
    -- Customer Info
    SELECT customer_id, CONCAT(first_name, ' ', last_name) AS full_name, email, phone, address, created_at
    FROM Customers
    WHERE customer_id = p_customer_id;

    -- Accounts Overview
    SELECT account_id, account_type, balance
    FROM Accounts
    WHERE customer_id = p_customer_id;

    -- Active Loans Overview
    SELECT l.loan_id, lt.loan_name, l.loan_amount, l.outstanding_balance, l.interest_rate, l.loan_status, l.next_due_date
    FROM Loans l
    JOIN LoanTypes lt ON l.loan_type_id = lt.loan_type_id
    WHERE l.customer_id = p_customer_id;

    -- Payment Summary
    SELECT COUNT(p.payment_id) AS total_emi_payments_made, COALESCE(SUM(p.payment_amount), 0) AS total_amount_paid
    FROM EMI_Payments p
    JOIN Loans l ON p.loan_id = l.loan_id
    WHERE l.customer_id = p_customer_id;
END //

DELIMITER ;
