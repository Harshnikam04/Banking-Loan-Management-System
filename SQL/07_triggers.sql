-- ============================================================
-- Banking & Loan Management System
-- Database Triggers Script
-- ============================================================

USE banking_system;

DELIMITER //

-- ============================================================
-- Trigger 1: trg_after_emi_payment_update_balance
-- Description: Automatically deducts EMI payment amount from
--              the loan's outstanding balance after payment insertion.
-- ============================================================
DROP TRIGGER IF EXISTS trg_after_emi_payment_update_balance //

CREATE TRIGGER trg_after_emi_payment_update_balance
AFTER INSERT ON EMI_Payments
FOR EACH ROW
BEGIN
    DECLARE v_new_balance DECIMAL(12,2);
    
    -- Calculate new balance
    SELECT GREATEST(0.00, outstanding_balance - NEW.payment_amount)
    INTO v_new_balance
    FROM Loans
    WHERE loan_id = NEW.loan_id;
    
    -- Update loan balance and auto-close if balance is zero
    UPDATE Loans
    SET outstanding_balance = v_new_balance,
        loan_status = CASE WHEN v_new_balance = 0.00 THEN 'Closed' ELSE loan_status END
    WHERE loan_id = NEW.loan_id;
END //


-- ============================================================
-- Trigger 2: trg_prevent_insufficient_funds
-- Description: Prevents updating account balance to a negative amount.
-- ============================================================
DROP TRIGGER IF EXISTS trg_prevent_insufficient_funds //

CREATE TRIGGER trg_prevent_insufficient_funds
BEFORE UPDATE ON Accounts
FOR EACH ROW
BEGIN
    IF NEW.balance < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaction Rejected: Insufficient funds in account. Account balance cannot be negative.';
    END IF;
END //


-- ============================================================
-- Trigger 3: trg_update_account_on_transaction
-- Description: Automatically updates account balance when a new 
--              transaction (Credit / Debit) is recorded in Transactions table.
-- ============================================================
DROP TRIGGER IF EXISTS trg_update_account_on_transaction //

CREATE TRIGGER trg_update_account_on_transaction
AFTER INSERT ON Transactions
FOR EACH ROW
BEGIN
    IF NEW.transaction_type = 'Credit' THEN
        UPDATE Accounts
        SET balance = balance + NEW.amount
        WHERE account_id = NEW.account_id;
    ELSEIF NEW.transaction_type = 'Debit' THEN
        UPDATE Accounts
        SET balance = balance - NEW.amount
        WHERE account_id = NEW.account_id;
    END IF;
END //


-- ============================================================
-- Trigger 4: trg_validate_loan_amount
-- Description: Ensures loan_amount and interest_rate are positive before insert.
-- ============================================================
DROP TRIGGER IF EXISTS trg_validate_loan_amount //

CREATE TRIGGER trg_validate_loan_amount
BEFORE INSERT ON Loans
FOR EACH ROW
BEGIN
    IF NEW.loan_amount <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid Loan: Loan amount must be greater than zero.';
    END IF;

    IF NEW.interest_rate < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid Loan: Interest rate cannot be negative.';
    END IF;
END //

DELIMITER ;
