# 📐 Database Entity-Relationship (ER) Diagram & Schema Architecture

This document provides a comprehensive blueprint of the relational database model powering the **Banking & Loan Management System**.

---

## 📊 Relational Entity-Relationship Diagram

```mermaid
erDiagram
    BRANCHES ||--o{ EMPLOYEES : "employs (1:N)"
    BRANCHES ||--o{ ACCOUNTS : "hosts (1:N)"
    CUSTOMERS ||--o{ ACCOUNTS : "owns (1:N)"
    CUSTOMERS ||--o{ LOANS : "applies_for (1:N)"
    EMPLOYEES ||--o{ LOANS : "manages/approves (1:N)"
    LOAN_TYPES ||--o{ LOANS : "categorizes (1:N)"
    LOANS ||--o{ EMI_PAYMENTS : "receives (1:N)"
    ACCOUNTS ||--o{ TRANSACTIONS : "logs (1:N)"

    BRANCHES {
        int branch_id PK "AUTO_INCREMENT"
        string branch_name "NOT NULL"
        string city "NOT NULL"
        string ifsc_code UK "NOT NULL"
    }

    EMPLOYEES {
        int employee_id PK "AUTO_INCREMENT"
        string employee_name "NOT NULL"
        string designation "NOT NULL"
        int branch_id FK "REFERENCES Branches(branch_id)"
    }

    CUSTOMERS {
        int customer_id PK "AUTO_INCREMENT"
        string first_name "NOT NULL"
        string last_name "NOT NULL"
        string email UK "NOT NULL"
        string phone UK "NOT NULL"
        text address
        timestamp created_at
    }

    ACCOUNTS {
        int account_id PK "AUTO_INCREMENT"
        int customer_id FK "REFERENCES Customers(customer_id)"
        int branch_id FK "REFERENCES Branches(branch_id)"
        enum account_type "'Savings', 'Current'"
        decimal balance "CHECK (balance >= 0)"
    }

    LOAN_TYPES {
        int loan_type_id PK "AUTO_INCREMENT"
        string loan_name UK "NOT NULL"
        string description
    }

    LOANS {
        int loan_id PK "AUTO_INCREMENT"
        int customer_id FK "REFERENCES Customers(customer_id)"
        int employee_id FK "REFERENCES Employees(employee_id)"
        int loan_type_id FK "REFERENCES LoanTypes(loan_type_id)"
        decimal loan_amount "CHECK (loan_amount > 0)"
        decimal interest_rate "CHECK (interest_rate >= 0)"
        int tenure_months "CHECK (tenure_months > 0)"
        decimal outstanding_balance "CHECK (outstanding_balance >= 0)"
        enum loan_status "'Pending', 'Approved', 'Active', 'Closed', 'Rejected'"
        date start_date
        date next_due_date
    }

    EMI_PAYMENTS {
        int payment_id PK "AUTO_INCREMENT"
        int loan_id FK "REFERENCES Loans(loan_id)"
        date payment_date "NOT NULL"
        decimal payment_amount "CHECK (payment_amount > 0)"
        enum payment_mode "'UPI', 'Cash', 'Net Banking', 'Cheque'"
    }

    TRANSACTIONS {
        int transaction_id PK "AUTO_INCREMENT"
        int account_id FK "REFERENCES Accounts(account_id)"
        enum transaction_type "'Credit', 'Debit'"
        decimal amount "CHECK (amount > 0)"
        datetime transaction_date
        string description
    }
```

---

## 🔗 Table Relationships & Cardinalities

| Parent Entity | Child Entity | Relationship | FK Constraint & Action | Business Description |
| :--- | :--- | :---: | :--- | :--- |
| `Branches` | `Employees` | `1 : N` | `ON DELETE CASCADE` | A bank branch employs multiple bank staff and loan officers. |
| `Branches` | `Accounts` | `1 : N` | `ON DELETE CASCADE` | A branch hosts multiple customer deposit accounts. |
| `Customers` | `Accounts` | `1 : N` | `ON DELETE CASCADE` | A customer can hold multiple savings or current accounts. |
| `Customers` | `Loans` | `1 : N` | `ON DELETE CASCADE` | A customer can apply for and maintain multiple loan accounts. |
| `Employees` | `Loans` | `1 : N` | `ON DELETE CASCADE` | A loan officer oversees and manages multiple customer loans. |
| `LoanTypes` | `Loans` | `1 : N` | `ON DELETE CASCADE` | Loan types (Home, Personal, Vehicle, Business, Education) categorize loans. |
| `Loans` | `EMI_Payments` | `1 : N` | `ON DELETE CASCADE` | An active loan accumulates repayment records over its tenure. |
| `Accounts` | `Transactions` | `1 : N` | `ON DELETE CASCADE` | Each account logs a ledger of debit and credit transactions. |

---

## 🛡️ Key Constraints & Business Rules

1. **Non-Negative Balance Constraint (`CHECK balance >= 0`)**:
   - Customer account balance can never drop below zero.
2. **Positive Disbursal Constraints (`CHECK loan_amount > 0`)**:
   - Loan principal, EMI payment amounts, and transaction values must always be strictly positive.
3. **Automatic Outstanding Debt Adjustment**:
   - When an entry is inserted into `EMI_Payments`, database triggers automatically update `Loans.outstanding_balance` and change status to `Closed` upon full repayment.
4. **Referential Integrity Cascades**:
   - Primary key references maintain strict referential integrity (`ON DELETE CASCADE`).
