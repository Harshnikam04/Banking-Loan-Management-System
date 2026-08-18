import React from 'react';
import { Building2, Users, Wallet, CreditCard } from 'lucide-react';

export default function BranchesView({ branches, employees, accounts, loans }) {
  return (
    <div className="view-container">
      {/* Branch Stats Grid */}
      <div className="card-grid">
        {branches.map(branch => {
          const branchEmps = employees.filter(e => e.branch_id === branch.branch_id);
          const branchAccs = accounts.filter(a => a.branch_id === branch.branch_id);
          const branchDeposits = branchAccs.reduce((sum, a) => sum + Number(a.balance), 0);
          
          return (
            <div key={branch.branch_id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>{branch.branch_name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>City: {branch.city} • IFSC: {branch.ifsc_code}</span>
                </div>
                <div className="stat-icon-wrapper stat-icon-blue">
                  <Building2 size={20} />
                </div>
              </div>

              <hr style={{ borderColor: 'var(--border-color)' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Total Staff:</span>
                  <div style={{ fontWeight: 700 }}>{branchEmps.length} Employees</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Accounts:</span>
                  <div style={{ fontWeight: 700 }}>{branchAccs.length} Accounts</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Deposits:</span>
                  <div style={{ fontWeight: 700, color: 'var(--accent-green-light)', fontSize: '1.1rem' }}>
                    ₹{branchDeposits.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '0.5rem', background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Branch Staff Roster:</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.35rem' }}>
                  {branchEmps.map(emp => (
                    <div key={emp.employee_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>{emp.employee_name}</span>
                      <span className="badge badge-savings" style={{ fontSize: '0.675rem' }}>{emp.designation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
