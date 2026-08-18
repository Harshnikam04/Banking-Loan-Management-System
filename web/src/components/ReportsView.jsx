import React, { useState } from 'react';
import { FileText, Download, Play, Code, Database, Search } from 'lucide-react';

export default function ReportsView({ customers, accounts, loans, emiPayments, branches, employees, loanTypes }) {
  const [activeTab, setActiveTab] = useState('executive');
  const [querySearch, setQuerySearch] = useState('');

  const reportData = {
    executive: {
      title: 'Executive Financial Summary Report',
      script: 'Reports/01_executive_summary.sql',
      metrics: [
        { label: 'Total Branches', value: branches.length },
        { label: 'Total Staff', value: employees.length },
        { label: 'Total Customers', value: customers.length },
        { label: 'Total Accounts', value: accounts.length },
        { label: 'Total Deposits (INR)', value: `₹${accounts.reduce((s, a) => s + Number(a.balance), 0).toLocaleString('en-IN')}` },
        { label: 'Total Loan Capital Disbursed', value: `₹${loans.reduce((s, l) => s + Number(l.loan_amount), 0).toLocaleString('en-IN')}` }
      ],
      sql: `-- Reports/01_executive_summary.sql
SELECT 
    (SELECT COUNT(*) FROM Branches) AS Total_Branches,
    (SELECT COUNT(*) FROM Customers) AS Total_Customers,
    (SELECT SUM(balance) FROM Accounts) AS Total_Customer_Deposits_INR,
    (SELECT SUM(loan_amount) FROM Loans) AS Total_Loan_Disbursed_INR,
    (SELECT SUM(payment_amount) FROM EMI_Payments) AS Total_EMI_Collected_INR;`
    },
    branch: {
      title: 'Branch Performance & Productivity Report',
      script: 'Reports/02_branch_performance.sql',
      table: branches.map(b => {
        const bAccs = accounts.filter(a => a.branch_id === b.branch_id);
        const bEmps = employees.filter(e => e.branch_id === b.branch_id);
        const bLoans = loans.filter(l => bEmps.some(e => e.employee_id === l.employee_id));
        return {
          'Branch Name': b.branch_name,
          'City': b.city,
          'IFSC Code': b.ifsc_code,
          'Total Staff': bEmps.length,
          'Accounts Hosted': bAccs.length,
          'Total Deposits (₹)': bAccs.reduce((s, a) => s + Number(a.balance), 0).toLocaleString('en-IN'),
          'Loans Managed': bLoans.length,
          'Disbursed Capital (₹)': bLoans.reduce((s, l) => s + Number(l.loan_amount), 0).toLocaleString('en-IN')
        };
      }),
      sql: `-- Reports/02_branch_performance.sql
SELECT b.branch_name, b.city, COUNT(DISTINCT e.employee_id) AS staff_count,
       COUNT(DISTINCT a.account_id) AS account_count, SUM(a.balance) AS total_deposits
FROM Branches b
LEFT JOIN Employees e ON b.branch_id = e.branch_id
LEFT JOIN Accounts a ON b.branch_id = a.branch_id
GROUP BY b.branch_id, b.branch_name, b.city;`
    },
    npa: {
      title: 'Loan Portfolio & NPA Risk Analysis',
      script: 'Reports/03_loan_portfolio_and_npa.sql',
      table: loans.map(l => {
        const c = customers.find(cust => cust.customer_id === l.customer_id);
        const lt = loanTypes.find(t => t.loan_type_id === l.loan_type_id);
        return {
          'Loan ID': `#${l.loan_id}`,
          'Borrower Name': c ? `${c.first_name} ${c.last_name}` : `Cust #${l.customer_id}`,
          'Loan Product': lt ? lt.loan_name : `Type #${l.loan_type_id}`,
          'Disbursed Amount (₹)': Number(l.loan_amount).toLocaleString('en-IN'),
          'Outstanding Balance (₹)': Number(l.outstanding_balance).toLocaleString('en-IN'),
          'Interest Rate': `${l.interest_rate}%`,
          'Status': l.loan_status,
          'Next Due Date': l.next_due_date
        };
      }),
      sql: `-- Reports/03_loan_portfolio_and_npa.sql
SELECT l.loan_id, CONCAT(c.first_name, ' ', c.last_name) AS borrower_name, lt.loan_name,
       l.loan_amount, l.outstanding_balance, l.next_due_date,
       DATEDIFF(CURRENT_DATE(), l.next_due_date) AS days_overdue
FROM Loans l
JOIN Customers c ON l.customer_id = c.customer_id
JOIN LoanTypes lt ON l.loan_type_id = lt.loan_type_id
WHERE l.loan_status = 'Active' AND l.next_due_date < CURRENT_DATE();`
    },
    customer360: {
      title: 'Customer 360 Portfolio Overview',
      script: 'Reports/04_customer_360.sql',
      table: customers.map(c => {
        const cAccs = accounts.filter(a => a.customer_id === c.customer_id);
        const cLoans = loans.filter(l => l.customer_id === c.customer_id);
        const depBal = cAccs.reduce((s, a) => s + Number(a.balance), 0);
        const debtBal = cLoans.reduce((s, l) => s + Number(l.outstanding_balance), 0);
        return {
          'Customer ID': `#${c.customer_id}`,
          'Customer Name': `${c.first_name} ${c.last_name}`,
          'Email': c.email,
          'Phone': c.phone,
          'Total Accounts': cAccs.length,
          'Deposit Balance (₹)': depBal.toLocaleString('en-IN'),
          'Active Loans': cLoans.length,
          'Outstanding Debt (₹)': debtBal.toLocaleString('en-IN')
        };
      }),
      sql: `-- Reports/04_customer_360.sql
SELECT c.customer_id, CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
       SUM(a.balance) AS deposit_balance, SUM(l.outstanding_balance) AS debt_balance
FROM Customers c
LEFT JOIN Accounts a ON c.customer_id = a.customer_id
LEFT JOIN Loans l ON c.customer_id = l.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name;`
    }
  };

  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentRep = reportData[activeTab];

  return (
    <div className="view-container">
      {/* Navigation Tabs */}
      <div className="tabs-nav">
        <button className={`tab-btn ${activeTab === 'executive' ? 'active' : ''}`} onClick={() => setActiveTab('executive')}>
          Executive Summary Report
        </button>
        <button className={`tab-btn ${activeTab === 'branch' ? 'active' : ''}`} onClick={() => setActiveTab('branch')}>
          Branch Performance
        </button>
        <button className={`tab-btn ${activeTab === 'npa' ? 'active' : ''}`} onClick={() => setActiveTab('npa')}>
          NPA & Loan Risk
        </button>
        <button className={`tab-btn ${activeTab === 'customer360' ? 'active' : ''}`} onClick={() => setActiveTab('customer360')}>
          Customer 360 View
        </button>
      </div>

      {/* Main Report View */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>{currentRep.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>SQL Script: {currentRep.script}</p>
          </div>
          {currentRep.table && (
            <button className="btn btn-secondary" onClick={() => exportCSV(currentRep.table, activeTab)}>
              <Download size={16} /> Export CSV
            </button>
          )}
        </div>

        {/* Executive Metrics Cards */}
        {currentRep.metrics && (
          <div className="card-grid" style={{ marginTop: '1rem' }}>
            {currentRep.metrics.map((m, i) => (
              <div key={i} style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.label}</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.35rem' }}>{m.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Report Output Table */}
        {currentRep.table && (
          <div className="table-container" style={{ marginTop: '1rem', border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {Object.keys(currentRep.table[0]).map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRep.table.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SQL Source View */}
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>UNDERLYING SQL SCRIPT</h4>
          <div className="console-box">
            {currentRep.sql}
          </div>
        </div>
      </div>
    </div>
  );
}
