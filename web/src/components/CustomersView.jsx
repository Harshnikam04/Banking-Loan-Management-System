import React, { useState } from 'react';
import { Search, Plus, UserCheck, Wallet, CreditCard, ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';

export default function CustomersView({ 
  customers, 
  accounts, 
  loans, 
  onAddCustomer,
  onAccountTransaction
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTxnModal, setShowTxnModal] = useState(false);

  // Form states
  const [newCust, setNewCust] = useState({ first_name: '', last_name: '', email: '', phone: '', address: '' });
  const [txnForm, setTxnForm] = useState({ account_id: '', type: 'Credit', amount: '', description: '' });

  const filteredCustomers = customers.filter(c => 
    c.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.customer_id.toString() === searchTerm
  );

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCust.first_name || !newCust.last_name || !newCust.email) return;
    onAddCustomer(newCust);
    setNewCust({ first_name: '', last_name: '', email: '', phone: '', address: '' });
    setShowAddModal(false);
  };

  const handleTxnSubmit = (e) => {
    e.preventDefault();
    if (!txnForm.account_id || !txnForm.amount || Number(txnForm.amount) <= 0) return;
    const res = onAccountTransaction(Number(txnForm.account_id), txnForm.type, Number(txnForm.amount), txnForm.description);
    if (res.success) {
      setShowTxnModal(false);
      setTxnForm({ account_id: '', type: 'Credit', amount: '', description: '' });
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="view-container">
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', minWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search by name, email, phone, or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowTxnModal(true)}>
            <Wallet size={18} />
            Deposit / Withdraw Funds
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            Register Customer
          </button>
        </div>
      </div>

      {/* Customer List Table */}
      <div className="table-container">
        <div className="table-header">
          <div className="table-header-left">
            <h3>Registered Bank Customers ({filteredCustomers.length})</h3>
            <p>Customer accounts, contact records, and active account portfolios</p>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Deposit Accounts</th>
              <th>Total Balance</th>
              <th>Active Loans</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((cust) => {
              const custAccounts = accounts.filter(a => a.customer_id === cust.customer_id);
              const custLoans = loans.filter(l => l.customer_id === cust.customer_id && l.loan_status === 'Active');
              const totalBal = custAccounts.reduce((sum, a) => sum + Number(a.balance), 0);

              return (
                <tr key={cust.customer_id}>
                  <td><strong>#{cust.customer_id}</strong></td>
                  <td style={{ fontWeight: 600 }}>{cust.first_name} {cust.last_name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{cust.email}</td>
                  <td>{cust.phone}</td>
                  <td>
                    {custAccounts.map(a => (
                      <span key={a.account_id} className={`badge badge-${a.account_type.toLowerCase()}`} style={{ marginRight: '4px' }}>
                        #{a.account_id} ({a.account_type})
                      </span>
                    ))}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-green-light)' }}>
                    ₹{totalBal.toLocaleString('en-IN')}
                  </td>
                  <td>
                    {custLoans.length > 0 ? (
                      <span className="badge badge-active">{custLoans.length} Active</span>
                    ) : (
                      <span className="badge badge-closed">None</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }} onClick={() => setSelectedCustomer(cust)}>
                      <Eye size={14} /> View 360
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Customer 360 Detail Modal */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Customer 360 Portfolio Overview</h3>
              <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setSelectedCustomer(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div>
                <h2 style={{ fontSize: '1.25rem' }}>{selectedCustomer.first_name} {selectedCustomer.last_name}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Customer ID: #{selectedCustomer.customer_id} • Registered: {selectedCustomer.created_at}</p>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>📧 {selectedCustomer.email}</span>
                  <span>📞 {selectedCustomer.phone}</span>
                </div>
                <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 {selectedCustomer.address}</p>
              </div>

              <hr style={{ borderColor: 'var(--border-color)' }} />

              <h4>Linked Accounts</h4>
              {accounts.filter(a => a.customer_id === selectedCustomer.customer_id).map(a => (
                <div key={a.account_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <strong>Account #{a.account_id}</strong> ({a.account_type})
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Branch ID: #{a.branch_id}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-green-light)' }}>
                    ₹{Number(a.balance).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}

              <h4>Active Loans</h4>
              {loans.filter(l => l.customer_id === selectedCustomer.customer_id).map(l => (
                <div key={l.loan_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <strong>Loan #{l.loan_id}</strong> • Disbursed: ₹{Number(l.loan_amount).toLocaleString('en-IN')} ({l.interest_rate}%)
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Next Due: {l.next_due_date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent-amber-light)' }}>
                      ₹{Number(l.outstanding_balance).toLocaleString('en-IN')}
                    </div>
                    <span className={`badge badge-${l.loan_status.toLowerCase()}`}>{l.loan_status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedCustomer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register New Customer</h3>
              <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateCustomer}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" className="input-field" required value={newCust.first_name} onChange={(e) => setNewCust({...newCust, first_name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" className="input-field" required value={newCust.last_name} onChange={(e) => setNewCust({...newCust, last_name: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="input-field" required value={newCust.email} onChange={(e) => setNewCust({...newCust, email: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" className="input-field" required value={newCust.phone} onChange={(e) => setNewCust({...newCust, phone: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea className="textarea-field" rows="3" value={newCust.address} onChange={(e) => setNewCust({...newCust, address: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Customer & Savings Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Deposit/Withdraw Modal */}
      {showTxnModal && (
        <div className="modal-overlay" onClick={() => setShowTxnModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Account Deposit / Withdrawal</h3>
              <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setShowTxnModal(false)}>✕</button>
            </div>
            <form onSubmit={handleTxnSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Target Account</label>
                  <select className="select-field" required value={txnForm.account_id} onChange={(e) => setTxnForm({...txnForm, account_id: e.target.value})}>
                    <option value="">Select Account...</option>
                    {accounts.map(a => {
                      const c = customers.find(cust => cust.customer_id === a.customer_id);
                      return (
                        <option key={a.account_id} value={a.account_id}>
                          Account #{a.account_id} - {c ? `${c.first_name} ${c.last_name}` : ''} (Balance: ₹{Number(a.balance).toLocaleString('en-IN')})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label>Transaction Type</label>
                  <select className="select-field" value={txnForm.type} onChange={(e) => setTxnForm({...txnForm, type: e.target.value})}>
                    <option value="Credit">Credit (Deposit)</option>
                    <option value="Debit">Debit (Withdrawal / Check Overdraft Trigger)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input type="number" step="0.01" className="input-field" required value={txnForm.amount} onChange={(e) => setTxnForm({...txnForm, amount: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input type="text" className="input-field" placeholder="e.g. Cash Deposit / Bill Payment" value={txnForm.description} onChange={(e) => setTxnForm({...txnForm, description: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTxnModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success">Submit Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
