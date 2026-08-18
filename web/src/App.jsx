import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import CustomersView from './components/CustomersView';
import LoansView from './components/LoansView';
import BranchesView from './components/BranchesView';
import ProceduresView from './components/ProceduresView';
import ReportsView from './components/ReportsView';

import { 
  initialBranches, 
  initialEmployees, 
  initialCustomers, 
  initialAccounts, 
  initialLoanTypes, 
  initialLoans, 
  initialEMIPayments, 
  initialTransactions 
} from './data/mockDatabase';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');

  // Database Tables State
  const [branches, setBranches] = useState(initialBranches);
  const [employees, setEmployees] = useState(initialEmployees);
  const [customers, setCustomers] = useState(initialCustomers);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [loanTypes, setLoanTypes] = useState(initialLoanTypes);
  const [loans, setLoans] = useState(initialLoans);
  const [emiPayments, setEmiPayments] = useState(initialEMIPayments);
  const [transactions, setTransactions] = useState(initialTransactions);

  // Modal Control States
  const [showEMIModal, setShowEMIModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);

  // Stored Procedure 1: sp_ProcessEMIPayment
  const handleProcessEMIPayment = (loanId, amount, paymentMode) => {
    const loanIndex = loans.findIndex(l => l.loan_id === loanId);
    if (loanIndex === -1) {
      return { success: false, message: `ERROR: Loan #${loanId} does not exist.` };
    }

    const targetLoan = loans[loanIndex];
    if (targetLoan.loan_status === 'Closed') {
      return { success: false, message: `ERROR: Loan #${loanId} is already fully repaid and closed.` };
    }

    const currentBal = Number(targetLoan.outstanding_balance);
    const newBal = Math.max(0, currentBal - amount);
    const newStatus = newBal === 0 ? 'Closed' : 'Active';

    // Update Loans Table
    const updatedLoans = [...loans];
    updatedLoans[loanIndex] = {
      ...targetLoan,
      outstanding_balance: newBal,
      loan_status: newStatus
    };
    setLoans(updatedLoans);

    // Insert EMI Payment Record
    const newPaymentId = 900 + emiPayments.length + 1;
    const today = new Date().toISOString().split('T')[0];
    const newPayment = {
      payment_id: newPaymentId,
      loan_id: loanId,
      payment_date: today,
      payment_amount: amount,
      payment_mode: paymentMode
    };
    setEmiPayments([newPayment, ...emiPayments]);

    return { 
      success: true, 
      message: `SUCCESS: Payment of ₹${amount.toLocaleString('en-IN')} processed. ${newBal === 0 ? 'Loan is now FULLY PAID and CLOSED!' : `Remaining balance: ₹${newBal.toLocaleString('en-IN')}`}` 
    };
  };

  // Stored Procedure 2: sp_DisburseLoan
  const handleDisburseLoan = (customerId, employeeId, loanTypeId, amount, rate, tenure, accountId) => {
    const newLoanId = 5000 + loans.length + 1;
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 1);
    const nextDue = dueDate.toISOString().split('T')[0];

    const newLoan = {
      loan_id: newLoanId,
      customer_id: customerId,
      employee_id: employeeId,
      loan_type_id: loanTypeId,
      loan_amount: amount,
      interest_rate: rate,
      tenure_months: tenure,
      outstanding_balance: amount,
      loan_status: 'Active',
      start_date: today,
      next_due_date: nextDue
    };

    setLoans([newLoan, ...loans]);

    // Update Account Balance
    setAccounts(accounts.map(a => {
      if (a.account_id === accountId) {
        return { ...a, balance: Number(a.balance) + amount };
      }
      return a;
    }));

    // Record Transaction
    const newTxnId = 10000 + transactions.length + 1;
    const newTxn = {
      transaction_id: newTxnId,
      account_id: accountId,
      transaction_type: 'Credit',
      amount: amount,
      transaction_date: `${today} ${new Date().toLocaleTimeString()}`,
      description: `Loan Disbursal - Loan #${newLoanId}`
    };
    setTransactions([newTxn, ...transactions]);

    return { success: true, message: `SUCCESS: Loan #${newLoanId} of ₹${amount.toLocaleString('en-IN')} disbursed to Account #${accountId}!` };
  };

  // Customer Registration
  const handleAddCustomer = (custData) => {
    const newCustId = customers.length + 1;
    const today = new Date().toISOString().split('T')[0];
    const newCustomer = {
      customer_id: newCustId,
      ...custData,
      created_at: today
    };
    setCustomers([...customers, newCustomer]);

    // Create Savings Account
    const newAccId = 100 + accounts.length + 1;
    const newAcc = {
      account_id: newAccId,
      customer_id: newCustId,
      branch_id: 1,
      account_type: 'Savings',
      balance: 10000.00
    };
    setAccounts([...accounts, newAcc]);
  };

  // Transaction Deposit / Withdrawal (with Trigger check trg_prevent_insufficient_funds)
  const handleAccountTransaction = (accountId, type, amount, description) => {
    const accIndex = accounts.findIndex(a => a.account_id === accountId);
    if (accIndex === -1) return { success: false, message: 'Account not found.' };

    const targetAcc = accounts[accIndex];
    const currentBal = Number(targetAcc.balance);

    if (type === 'Debit' && (currentBal - amount) < 0) {
      return { 
        success: false, 
        message: `TRIGGER REJECTION: Insufficient funds in Account #${accountId}. Balance (₹${currentBal.toLocaleString('en-IN')}) cannot become negative!` 
      };
    }

    const newBal = type === 'Credit' ? currentBal + amount : currentBal - amount;
    const updatedAccs = [...accounts];
    updatedAccs[accIndex] = { ...targetAcc, balance: newBal };
    setAccounts(updatedAccs);

    // Record Transaction
    const newTxnId = 10000 + transactions.length + 1;
    const today = new Date().toISOString().split('T')[0];
    const newTxn = {
      transaction_id: newTxnId,
      account_id: accountId,
      transaction_type: type,
      amount: amount,
      transaction_date: `${today} ${new Date().toLocaleTimeString()}`,
      description: description || `${type} Transaction`
    };
    setTransactions([newTxn, ...transactions]);

    return { success: true, message: `Transaction Successful. New Balance: ₹${newBal.toLocaleString('en-IN')}`, newBalance: newBal };
  };

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="main-content">
        <Header activeView={activeView} />

        {activeView === 'dashboard' && (
          <DashboardView
            customers={customers}
            accounts={accounts}
            loans={loans}
            emiPayments={emiPayments}
            transactions={transactions}
            setActiveView={setActiveView}
            onOpenEMIModal={() => setShowEMIModal(true)}
            onOpenLoanModal={() => setShowLoanModal(true)}
          />
        )}

        {activeView === 'customers' && (
          <CustomersView
            customers={customers}
            accounts={accounts}
            loans={loans}
            onAddCustomer={handleAddCustomer}
            onAccountTransaction={handleAccountTransaction}
          />
        )}

        {activeView === 'loans' && (
          <LoansView
            loans={loans}
            customers={customers}
            employees={employees}
            loanTypes={loanTypes}
            accounts={accounts}
            emiPayments={emiPayments}
            onProcessEMI={handleProcessEMIPayment}
            onDisburseLoan={handleDisburseLoan}
            showEMIModalDirectly={showEMIModal}
            showLoanModalDirectly={showLoanModal}
            onCloseEMIModal={() => setShowEMIModal(!showEMIModal)}
            onCloseLoanModal={() => setShowLoanModal(!showLoanModal)}
          />
        )}

        {activeView === 'branches' && (
          <BranchesView
            branches={branches}
            employees={employees}
            accounts={accounts}
            loans={loans}
          />
        )}

        {activeView === 'procedures' && (
          <ProceduresView
            loans={loans}
            customers={customers}
            accounts={accounts}
            onProcessEMI={handleProcessEMIPayment}
            onDisburseLoan={handleDisburseLoan}
            onAccountTransaction={handleAccountTransaction}
          />
        )}

        {activeView === 'reports' && (
          <ReportsView
            customers={customers}
            accounts={accounts}
            loans={loans}
            emiPayments={emiPayments}
            branches={branches}
            employees={employees}
            loanTypes={loanTypes}
          />
        )}
      </main>
    </div>
  );
}
