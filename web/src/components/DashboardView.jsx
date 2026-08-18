import React from 'react';
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Building, 
  ArrowUpRight, 
  ArrowDownRight,
  PlusCircle,
  Receipt
} from 'lucide-react';

export default function DashboardView({ 
  customers, 
  accounts, 
  loans, 
  emiPayments, 
  transactions,
  setActiveView,
  onOpenEMIModal,
  onOpenLoanModal
}) {
  const totalDeposits = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  const totalDisbursed = loans.reduce((sum, l) => sum + Number(l.loan_amount), 0);
  const activeOutstanding = loans.filter(l => l.loan_status === 'Active').reduce((sum, l) => sum + Number(l.outstanding_balance), 0);
  const totalEMICollected = emiPayments.reduce((sum, p) => sum + Number(p.payment_amount), 0);

  const loanToDepositRatio = totalDeposits > 0 ? ((activeOutstanding / totalDeposits) * 100).toFixed(1) : 0;

  return (
    <div className="view-container">
      {/* Top Stat Cards */}
      <div className="card-grid">
        <div className="card stat-card">
          <div className="stat-header">
            <span>Total Customer Deposits</span>
            <div className="stat-icon-wrapper stat-icon-green">
              <Wallet size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value">₹{totalDeposits.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            <div className="stat-subtitle">{accounts.length} active savings/current accounts</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <span>Total Disbursed Loans</span>
            <div className="stat-icon-wrapper stat-icon-blue">
              <CreditCard size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value">₹{totalDisbursed.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            <div className="stat-subtitle">{loans.length} total loan applications</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <span>Active Outstanding Debt</span>
            <div className="stat-icon-wrapper stat-icon-amber">
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value">₹{activeOutstanding.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            <div className="stat-subtitle">Loan-to-Deposit Ratio: {loanToDepositRatio}%</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <span>Total EMI Collected</span>
            <div className="stat-icon-wrapper stat-icon-rose">
              <DollarSign size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value">₹{totalEMICollected.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            <div className="stat-subtitle">{emiPayments.length} EMI transactions recorded</div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Quick Stats */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={onOpenLoanModal}>
          <PlusCircle size={18} />
          Disburse New Loan (sp_DisburseLoan)
        </button>
        <button className="btn btn-success" onClick={onOpenEMIModal}>
          <Receipt size={18} />
          Process EMI Repayment (sp_ProcessEMIPayment)
        </button>
      </div>

      {/* Active Loans Overview Table */}
      <div className="table-container">
        <div className="table-header">
          <div className="table-header-left">
            <h3>Active Loans Portfolio</h3>
            <p>Monitored loan accounts with live outstanding balances and next due dates</p>
          </div>
          <button className="btn btn-secondary" onClick={() => setActiveView('loans')}>
            View All Loans
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Loan ID</th>
              <th>Customer</th>
              <th>Loan Type</th>
              <th>Disbursed Amount</th>
              <th>Interest Rate</th>
              <th>Outstanding Balance</th>
              <th>Next Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loans.slice(0, 5).map((loan) => {
              const cust = customers.find(c => c.customer_id === loan.customer_id);
              const custName = cust ? `${cust.first_name} ${cust.last_name}` : `Customer #${loan.customer_id}`;
              const badgeClass = `badge badge-${loan.loan_status.toLowerCase()}`;

              return (
                <tr key={loan.loan_id}>
                  <td><strong>#{loan.loan_id}</strong></td>
                  <td>{custName}</td>
                  <td>Loan #{loan.loan_type_id}</td>
                  <td>₹{Number(loan.loan_amount).toLocaleString('en-IN')}</td>
                  <td>{loan.interest_rate}%</td>
                  <td style={{ color: 'var(--accent-amber-light)', fontWeight: 600 }}>
                    ₹{Number(loan.outstanding_balance).toLocaleString('en-IN')}
                  </td>
                  <td>{loan.next_due_date}</td>
                  <td>
                    <span className={badgeClass}>{loan.loan_status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recent Ledger Transactions */}
      <div className="table-container">
        <div className="table-header">
          <div className="table-header-left">
            <h3>Recent Bank Ledger Transactions</h3>
            <p>Real-time credit and debit auditing logs across customer accounts</p>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Txn ID</th>
              <th>Account ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Timestamp</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 6).map((txn) => (
              <tr key={txn.transaction_id}>
                <td>#{txn.transaction_id}</td>
                <td>Account #{txn.account_id}</td>
                <td>
                  <span className={`badge ${txn.transaction_type === 'Credit' ? 'badge-active' : 'badge-rejected'}`}>
                    {txn.transaction_type === 'Credit' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {txn.transaction_type}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: txn.transaction_type === 'Credit' ? 'var(--accent-green-light)' : 'var(--accent-rose-light)' }}>
                  {txn.transaction_type === 'Credit' ? '+' : '-'}₹{Number(txn.amount).toLocaleString('en-IN')}
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{txn.transaction_date}</td>
                <td>{txn.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
