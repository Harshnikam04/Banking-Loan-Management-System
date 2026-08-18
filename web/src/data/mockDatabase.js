// Mock Banking & Loan Management Database Engine

export const initialBranches = [
  { branch_id: 1, branch_name: 'Mumbai Central Branch', city: 'Mumbai', ifsc_code: 'BKID0001234' },
  { branch_id: 2, branch_name: 'Connaught Place Branch', city: 'Delhi', ifsc_code: 'BKID0005678' },
  { branch_id: 3, branch_name: 'MG Road Branch', city: 'Bengaluru', ifsc_code: 'BKID0009101' },
  { branch_id: 4, branch_name: 'Bandra West Branch', city: 'Mumbai', ifsc_code: 'BANK0001011' },
  { branch_id: 5, branch_name: 'Hinjewadi Branch', city: 'Pune', ifsc_code: 'BANK0001012' },
  { branch_id: 6, branch_name: 'Whitefield Branch', city: 'Bengaluru', ifsc_code: 'BANK0001016' }
];

export const initialEmployees = [
  { employee_id: 1, employee_name: 'Rajesh Sharma', designation: 'Branch Manager', branch_id: 1 },
  { employee_id: 2, employee_name: 'Priya Patel', designation: 'Loan Officer', branch_id: 1 },
  { employee_id: 3, employee_name: 'Amit Verma', designation: 'Loan Officer', branch_id: 2 },
  { employee_id: 4, employee_name: 'Sneha Reddy', designation: 'Customer Relationship Manager', branch_id: 3 },
  { employee_id: 5, employee_name: 'Vikram Joshi', designation: 'Loan Officer', branch_id: 4 },
  { employee_id: 6, employee_name: 'Suresh Patil', designation: 'Branch Manager', branch_id: 6 }
];

export const initialCustomers = [
  { customer_id: 1, first_name: 'Aarav', last_name: 'Mehta', email: 'aarav.mehta@example.com', phone: '9876543210', address: '102 Marine Drive, Mumbai', created_at: '2024-01-10' },
  { customer_id: 2, first_name: 'Ananya', last_name: 'Iyer', email: 'ananya.iyer@example.com', phone: '9876543211', address: '45 Indiranagar, Bengaluru', created_at: '2024-01-12' },
  { customer_id: 3, first_name: 'Rohan', last_name: 'Gupta', email: 'rohan.gupta@example.com', phone: '9876543212', address: '78 CP Outer Circle, Delhi', created_at: '2024-01-15' },
  { customer_id: 4, first_name: 'Priya', last_name: 'Sharma', email: 'priya.sharma@bankdemo.com', phone: '9000000004', address: '12 Gandhi Nagar, Pune', created_at: '2024-02-01' },
  { customer_id: 5, first_name: 'Aditya', last_name: 'Deshmukh', email: 'aditya.deshmukh@bankdemo.com', phone: '9000000005', address: '88 MG Road, Mumbai', created_at: '2024-02-10' }
];

export const initialAccounts = [
  { account_id: 101, customer_id: 1, branch_id: 1, account_type: 'Savings', balance: 150000.00 },
  { account_id: 102, customer_id: 2, branch_id: 3, account_type: 'Savings', balance: 85000.50 },
  { account_id: 103, customer_id: 3, branch_id: 2, account_type: 'Current', balance: 320000.00 },
  { account_id: 104, customer_id: 4, branch_id: 5, account_type: 'Savings', balance: 215000.00 },
  { account_id: 105, customer_id: 5, branch_id: 4, account_type: 'Current', balance: 450000.00 }
];

export const initialLoanTypes = [
  { loan_type_id: 1, loan_name: 'Home Loan', description: 'Long-term loan for residential property purchase or construction' },
  { loan_type_id: 2, loan_name: 'Personal Loan', description: 'Unsecured loan for personal financial needs' },
  { loan_type_id: 3, loan_name: 'Vehicle Loan', description: 'Loan for purchasing new or used automobiles' },
  { loan_type_id: 4, loan_name: 'Business Loan', description: 'Commercial financing for business expansion' },
  { loan_type_id: 5, loan_name: 'Education Loan', description: 'Loan for higher education and academic expenses' }
];

export const initialLoans = [
  {
    loan_id: 5001,
    customer_id: 1,
    employee_id: 2,
    loan_type_id: 1,
    loan_amount: 5000000.00,
    interest_rate: 8.50,
    tenure_months: 240,
    outstanding_balance: 4850000.00,
    loan_status: 'Active',
    start_date: '2024-01-15',
    next_due_date: '2024-02-15'
  },
  {
    loan_id: 5002,
    customer_id: 2,
    employee_id: 4,
    loan_type_id: 3,
    loan_amount: 800000.00,
    interest_rate: 9.25,
    tenure_months: 60,
    outstanding_balance: 750000.00,
    loan_status: 'Active',
    start_date: '2024-03-01',
    next_due_date: '2024-04-01'
  },
  {
    loan_id: 5003,
    customer_id: 3,
    employee_id: 3,
    loan_type_id: 4,
    loan_amount: 2000000.00,
    interest_rate: 11.00,
    tenure_months: 36,
    outstanding_balance: 2000000.00,
    loan_status: 'Approved',
    start_date: '2024-04-01',
    next_due_date: '2024-05-01'
  },
  {
    loan_id: 5004,
    customer_id: 4,
    employee_id: 5,
    loan_type_id: 2,
    loan_amount: 300000.00,
    interest_rate: 12.50,
    tenure_months: 24,
    outstanding_balance: 180000.00,
    loan_status: 'Active',
    start_date: '2024-02-10',
    next_due_date: '2024-03-10'
  }
];

export const initialEMIPayments = [
  { payment_id: 901, loan_id: 5001, payment_date: '2024-02-14', payment_amount: 43391.00, payment_mode: 'Net Banking' },
  { payment_id: 902, loan_id: 5001, payment_date: '2024-03-14', payment_amount: 43391.00, payment_mode: 'UPI' },
  { payment_id: 903, loan_id: 5002, payment_date: '2024-04-01', payment_amount: 16700.00, payment_mode: 'UPI' }
];

export const initialTransactions = [
  { transaction_id: 10001, account_id: 101, transaction_type: 'Credit', amount: 50000.00, transaction_date: '2024-02-01 10:30:00', description: 'Salary Credit' },
  { transaction_id: 10002, account_id: 101, transaction_type: 'Debit', amount: 43391.00, transaction_date: '2024-02-14 09:15:00', description: 'EMI Auto-Debit Home Loan' },
  { transaction_id: 10003, account_id: 102, transaction_type: 'Debit', amount: 16700.00, transaction_date: '2024-04-01 11:20:00', description: 'EMI Payment Vehicle Loan' },
  { transaction_id: 10004, account_id: 103, transaction_type: 'Credit', amount: 200000.00, transaction_date: '2024-04-05 14:45:00', description: 'Business Client Transfer' }
];
