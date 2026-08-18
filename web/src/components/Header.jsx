import React, { useState, useEffect } from 'react';
import { Search, Bell, Database, ShieldCheck } from 'lucide-react';

export default function Header({ activeView }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const titles = {
    dashboard: 'Executive Financial Dashboard',
    customers: 'Customer Profile & Deposit Accounts Hub',
    loans: 'Loan Application & EMI Processing Portal',
    branches: 'Branch Network & Loan Officer Analytics',
    procedures: 'Stored Procedures & Triggers Workbench',
    reports: 'Analytical Reports & SQL Execution Suite'
  };

  return (
    <header className="top-header">
      <div className="header-title">
        <h1>{titles[activeView] || 'Banking Management System'}</h1>
        <span>System Status: Operational • Database: banking_system</span>
      </div>

      <div className="header-actions">
        <div className="system-badge">
          <span className="live-dot"></span>
          <span>LIVE DB CONNECTED</span>
        </div>

        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
          {time}
        </div>
      </div>
    </header>
  );
}
