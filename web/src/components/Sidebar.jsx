import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Building2, 
  Terminal, 
  FileText,
  Landmark
} from 'lucide-react';

export default function Sidebar({ activeView, setActiveView }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers & Accounts', icon: Users },
    { id: 'loans', label: 'Loans & EMI Portal', icon: CreditCard },
    { id: 'branches', label: 'Branch Network', icon: Building2 },
    { id: 'procedures', label: 'Procedures & Triggers', icon: Terminal },
    { id: 'reports', label: 'Reports & SQL Workbench', icon: FileText }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Landmark size={22} />
        </div>
        <div className="sidebar-logo-text">
          <h2>Banking OS</h2>
          <span>Loan Management</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
            >
              <IconComponent size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', padding: '1rem 0.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <p><strong>DB Engine:</strong> MySQL 8.0+</p>
        <p><strong>Schema:</strong> 8 Tables, Triggers & SPs</p>
      </div>
    </aside>
  );
}
