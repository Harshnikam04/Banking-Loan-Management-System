import React, { useState } from 'react';
import { CreditCard, Plus, Receipt, Calculator, Search, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoansView({
  loans,
  customers,
  employees,
  loanTypes,
  accounts,
  emiPayments,
  onProcessEMI,
  onDisburseLoan,
  showEMIModalDirectly,
  showLoanModalDirectly,
  onCloseEMIModal,
  onCloseLoanModal
}) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAmortModal, setShowAmortModal] = useState(false);

  // EMI Form state
  const [emiForm, setEmiForm] = useState({ loan_id: '', amount: '', mode: 'UPI' });
  const [emiResult, setEmiResult] = useState(null);

  // Loan Disbursal Form state
  const [disburseForm, setDisburseForm] = useState({
    customer_id: '',
    employee_id: '2',
    loan_type_id: '1',
    amount: '500000',
    rate: '8.50',
    tenure: '60',
    account_id: ''
  });

  // Amortization State
  const [amortForm, setAmortForm] = useState({ amount: 1000000, rate: 9.5, tenure: 36 });

  const filteredLoans = loans.filter(l => {
    const cust = customers.find(c => c.customer_id === l.customer_id);
    const nameStr = cust ? `${cust.first_name} ${cust.last_name}` : '';
    const matchesSearch = l.loan_id.toString().includes(searchTerm) || nameStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || l.loan_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleEMISubmit = (e) => {
    e.preventDefault();
    if (!emiForm.loan_id || !emiForm.amount || Number(emiForm.amount) <= 0) return;
    const res = onProcessEMI(Number(emiForm.loan_id), Number(emiForm.amount), emiForm.mode);
    setEmiResult(res);
  };

  const handleDisburseSubmit = (e) => {
    e.preventDefault();
    if (!disburseForm.customer_id || !disburseForm.account_id || !disburseForm.amount) return;
    const res = onDisburseLoan(
      Number(disburseForm.customer_id),
      Number(disburseForm.employee_id),
      Number(disburseForm.loan_type_id),
      Number(disburseForm.amount),
      Number(disburseForm.rate),
      Number(disburseForm.tenure),
      Number(disburseForm.account_id)
    );
    if (res.success) {
      alert(res.message);
      onCloseLoanModal();
    } else {
      alert(res.message);
    }
  };

  // Calculate Amortization
  const P = Number(amortForm.amount);
  const r = (Number(amortForm.rate) / 12) / 100;
  const n = Number(amortForm.tenure);
  const emiVal = (P > 0 && r > 0 && n > 0) ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : 0;
  const totalPayable = emiVal * n;
  const totalInterest = totalPayable - P;

  return (
    <div className="view-container">
      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search loan ID or customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <select className="select-field" style={{ width: '160px' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Closed">Closed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowAmortModal(true)}>
            <Calculator size={18} /> EMI Calculator
          </button>
          <button className="btn btn-success" onClick={onCloseEMIModal}>
            <Receipt size={18} /> Record EMI Payment
          </button>
          <button className="btn btn-primary" onClick={onCloseLoanModal}>
            <Plus size={18} /> Disburse Loan
          </button>
        </div>
      </div>

      {/* Loans Table */}
      <div className="table-container">
        <div className="table-header">
          <div className="table-header-left">
            <h3>Disbursed Loans Registry ({filteredLoans.length})</h3>
            <p>Active and past loan accounts with real-time referential balances</p>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Loan ID</th>
              <th>Borrower</th>
              <th>Loan Product</th>
              <th>Principal Amount</th>
              <th>Rate / Tenure</th>
              <th>Outstanding Debt</th>
              <th>Next Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.map((loan) => {
              const cust = customers.find(c => c.customer_id === loan.customer_id);
              const lt = loanTypes.find(t => t.loan_type_id === loan.loan_type_id);
              const custName = cust ? `${cust.first_name} ${cust.last_name}` : `Customer #${loan.customer_id}`;
              const ltName = lt ? lt.loan_name : `LoanType #${loan.loan_type_id}`;

              return (
                <tr key={loan.loan_id}>
                  <td><strong>#{loan.loan_id}</strong></td>
                  <td style={{ fontWeight: 600 }}>{custName}</td>
                  <td>{ltName}</td>
                  <td>₹{Number(loan.loan_amount).toLocaleString('en-IN')}</td>
                  <td>{loan.interest_rate}% / {loan.tenure_months}m</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-amber-light)' }}>
                    ₹{Number(loan.outstanding_balance).toLocaleString('en-IN')}
                  </td>
                  <td>{loan.next_due_date}</td>
                  <td>
                    <span className={`badge badge-${loan.loan_status.toLowerCase()}`}>{loan.loan_status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* EMI Payment Modal (sp_ProcessEMIPayment) */}
      {showEMIModalDirectly && (
        <div className="modal-overlay" onClick={onCloseEMIModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Process EMI Payment (sp_ProcessEMIPayment)</h3>
              <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={onCloseEMIModal}>✕</button>
            </div>
            <form onSubmit={handleEMISubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Loan Account</label>
                  <select className="select-field" required value={emiForm.loan_id} onChange={(e) => setEmiForm({...emiForm, loan_id: e.target.value})}>
                    <option value="">Select Active Loan...</option>
                    {loans.filter(l => l.loan_status === 'Active' || l.loan_status === 'Approved').map(l => {
                      const c = customers.find(cust => cust.customer_id === l.customer_id);
                      return (
                        <option key={l.loan_id} value={l.loan_id}>
                          Loan #{l.loan_id} - {c ? `${c.first_name} ${c.last_name}` : ''} (Balance: ₹{Number(l.outstanding_balance).toLocaleString('en-IN')})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label>Payment Amount (₹)</label>
                  <input type="number" step="0.01" className="input-field" required value={emiForm.amount} onChange={(e) => setEmiForm({...emiForm, amount: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>Payment Channel</label>
                  <select className="select-field" value={emiForm.mode} onChange={(e) => setEmiForm({...emiForm, mode: e.target.value})}>
                    <option value="UPI">UPI Payment</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                {emiResult && (
                  <div className={`badge ${emiResult.success ? 'badge-active' : 'badge-rejected'}`} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'block', fontSize: '0.85rem' }}>
                    {emiResult.success ? <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px' }} /> : <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />}
                    {emiResult.message}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onCloseEMIModal}>Close</button>
                <button type="submit" className="btn btn-success">Execute Procedure (sp_ProcessEMIPayment)</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disburse Loan Modal (sp_DisburseLoan) */}
      {showLoanModalDirectly && (
        <div className="modal-overlay" onClick={onCloseLoanModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Disburse New Loan (sp_DisburseLoan)</h3>
              <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={onCloseLoanModal}>✕</button>
            </div>
            <form onSubmit={handleDisburseSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Customer</label>
                  <select className="select-field" required value={disburseForm.customer_id} onChange={(e) => {
                    const cid = e.target.value;
                    const custAccs = accounts.filter(a => a.customer_id === Number(cid));
                    setDisburseForm({
                      ...disburseForm, 
                      customer_id: cid,
                      account_id: custAccs.length > 0 ? custAccs[0].account_id.toString() : ''
                    });
                  }}>
                    <option value="">Select Borrower...</option>
                    {customers.map(c => (
                      <option key={c.customer_id} value={c.customer_id}>
                        #{c.customer_id} - {c.first_name} {c.last_name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Disbursal Credit Account</label>
                  <select className="select-field" required value={disburseForm.account_id} onChange={(e) => setDisburseForm({...disburseForm, account_id: e.target.value})}>
                    <option value="">Select Account to Credit...</option>
                    {accounts.filter(a => a.customer_id === Number(disburseForm.customer_id)).map(a => (
                      <option key={a.account_id} value={a.account_id}>
                        Account #{a.account_id} ({a.account_type}) - Bal: ₹{Number(a.balance).toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Loan Product</label>
                    <select className="select-field" value={disburseForm.loan_type_id} onChange={(e) => setDisburseForm({...disburseForm, loan_type_id: e.target.value})}>
                      {loanTypes.map(lt => (
                        <option key={lt.loan_type_id} value={lt.loan_type_id}>{lt.loan_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Assigned Loan Officer</label>
                    <select className="select-field" value={disburseForm.employee_id} onChange={(e) => setDisburseForm({...disburseForm, employee_id: e.target.value})}>
                      {employees.map(emp => (
                        <option key={emp.employee_id} value={emp.employee_id}>{emp.employee_name} ({emp.designation})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Amount (₹)</label>
                    <input type="number" className="input-field" required value={disburseForm.amount} onChange={(e) => setDisburseForm({...disburseForm, amount: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Interest Rate %</label>
                    <input type="number" step="0.1" className="input-field" required value={disburseForm.rate} onChange={(e) => setDisburseForm({...disburseForm, rate: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Tenure (Months)</label>
                    <input type="number" className="input-field" required value={disburseForm.tenure} onChange={(e) => setDisburseForm({...disburseForm, tenure: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onCloseLoanModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Execute sp_DisburseLoan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMI Calculator Modal */}
      {showAmortModal && (
        <div className="modal-overlay" onClick={() => setShowAmortModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Loan EMI & Amortization Calculator</h3>
              <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setShowAmortModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Principal (₹)</label>
                  <input type="number" className="input-field" value={amortForm.amount} onChange={(e) => setAmortForm({...amortForm, amount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Interest Rate %</label>
                  <input type="number" step="0.1" className="input-field" value={amortForm.rate} onChange={(e) => setAmortForm({...amortForm, rate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Tenure (Months)</label>
                  <input type="number" className="input-field" value={amortForm.tenure} onChange={(e) => setAmortForm({...amortForm, tenure: e.target.value})} />
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly EMI</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-blue-light)' }}>
                    ₹{Math.round(emiVal).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Interest</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
                    ₹{Math.round(totalInterest).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Repayment</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-green-light)' }}>
                    ₹{Math.round(totalPayable).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAmortModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
