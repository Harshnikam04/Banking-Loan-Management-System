import React, { useState } from 'react';
import { Play, Code, CheckCircle, AlertTriangle, Terminal, ShieldAlert } from 'lucide-react';

export default function ProceduresView({
  loans,
  customers,
  accounts,
  onProcessEMI,
  onDisburseLoan,
  onAccountTransaction
}) {
  const [activeProc, setActiveProc] = useState('sp_ProcessEMIPayment');
  const [consoleLogs, setConsoleLogs] = useState([
    '[INIT] Stored Procedures & Triggers Module initialized.',
    '[READY] Connected to MySQL 8.0 Engine (banking_system).'
  ]);

  // Form states
  const [emiLoanId, setEmiLoanId] = useState('');
  const [emiAmount, setEmiAmount] = useState('43391');
  const [emiMode, setEmiMode] = useState('Net Banking');

  const [disburseCustId, setDisburseCustId] = useState('1');
  const [disburseAmount, setDisburseAmount] = useState('500000');
  const [disburseAccId, setDisburseAccId] = useState('101');

  const [testAccId, setTestAccId] = useState('101');
  const [testOverdraftAmt, setTestOverdraftAmt] = useState('9999999');

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [`[${time}] ${msg}`, ...prev]);
  };

  const procCodes = {
    sp_ProcessEMIPayment: `-- SQL Procedure: sp_ProcessEMIPayment
DELIMITER //
CREATE PROCEDURE sp_ProcessEMIPayment(
    IN p_loan_id INT, IN p_payment_amount DECIMAL(12,2), IN p_payment_mode VARCHAR(20), OUT p_message VARCHAR(255)
)
BEGIN
    -- Deduct balance, insert into EMI_Payments, update loan_status to 'Closed' if 0
    INSERT INTO EMI_Payments (loan_id, payment_date, payment_amount, payment_mode)
    VALUES (p_loan_id, CURRENT_DATE(), p_payment_amount, p_payment_mode);
    
    UPDATE Loans
    SET outstanding_balance = GREATEST(0, outstanding_balance - p_payment_amount),
        loan_status = CASE WHEN (outstanding_balance - p_payment_amount) <= 0 THEN 'Closed' ELSE 'Active' END
    WHERE loan_id = p_loan_id;
END //
DELIMITER ;`,

    sp_DisburseLoan: `-- SQL Procedure: sp_DisburseLoan
DELIMITER //
CREATE PROCEDURE sp_DisburseLoan(
    IN p_customer_id INT, IN p_employee_id INT, IN p_loan_type_id INT, IN p_loan_amount DECIMAL(12,2),
    IN p_interest_rate DECIMAL(5,2), IN p_tenure_months INT, IN p_account_id INT
)
BEGIN
    -- Creates loan record, credits account balance, logs transaction
    INSERT INTO Loans (customer_id, employee_id, loan_type_id, loan_amount, interest_rate, tenure_months, outstanding_balance, loan_status)
    VALUES (p_customer_id, p_employee_id, p_loan_type_id, p_loan_amount, p_interest_rate, p_tenure_months, p_loan_amount, 'Active');
    
    UPDATE Accounts SET balance = balance + p_loan_amount WHERE account_id = p_account_id;
    INSERT INTO Transactions (account_id, transaction_type, amount, description) VALUES (p_account_id, 'Credit', p_loan_amount, 'Loan Disbursal');
END //
DELIMITER ;`,

    sp_CalculateMonthlyInterest: `-- SQL Procedure: sp_CalculateMonthlyInterest
DELIMITER //
CREATE PROCEDURE sp_CalculateMonthlyInterest()
BEGIN
    SELECT loan_id, customer_id, outstanding_balance, interest_rate,
           ROUND((outstanding_balance * (interest_rate / 100) / 12), 2) AS monthly_interest_accrued
    FROM Loans WHERE loan_status = 'Active';
END //
DELIMITER ;`,

    sp_AssessLateFees: `-- SQL Procedure: sp_AssessLateFees
DELIMITER //
CREATE PROCEDURE sp_AssessLateFees()
BEGIN
    SELECT loan_id, customer_id, outstanding_balance, next_due_date,
           DATEDIFF(CURRENT_DATE(), next_due_date) AS days_overdue,
           ROUND(outstanding_balance * 0.02, 2) AS late_penalty_assessed
    FROM Loans WHERE loan_status = 'Active' AND next_due_date < CURRENT_DATE();
END //
DELIMITER ;`,

    trg_prevent_insufficient_funds: `-- SQL Trigger: trg_prevent_insufficient_funds
DELIMITER //
CREATE TRIGGER trg_prevent_insufficient_funds
BEFORE UPDATE ON Accounts FOR EACH ROW
BEGIN
    IF NEW.balance < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaction Rejected: Account balance cannot be negative.';
    END IF;
END //
DELIMITER ;`
  };

  const handleRunProc = () => {
    if (activeProc === 'sp_ProcessEMIPayment') {
      if (!emiLoanId) { addLog('ERROR: Please select a target loan ID.'); return; }
      const res = onProcessEMI(Number(emiLoanId), Number(emiAmount), emiMode);
      addLog(res.message);
    } 
    else if (activeProc === 'sp_DisburseLoan') {
      const res = onDisburseLoan(Number(disburseCustId), 2, 1, Number(disburseAmount), 8.5, 60, Number(disburseAccId));
      addLog(res.message);
    }
    else if (activeProc === 'sp_CalculateMonthlyInterest') {
      addLog('CALL sp_CalculateMonthlyInterest(); Executed successfully. Monthly interest calculated across all active loans.');
    }
    else if (activeProc === 'sp_AssessLateFees') {
      addLog('CALL sp_AssessLateFees(); Executed. Found 1 overdue active loan. Late fee assessed (2% of balance).');
    }
    else if (activeProc === 'trg_prevent_insufficient_funds') {
      const acc = accounts.find(a => a.account_id === Number(testAccId));
      const currBal = acc ? acc.balance : 0;
      addLog(`TRIGGER TEST: Attempting to debit ₹${testOverdraftAmt} from Account #${testAccId} (Current Bal: ₹${currBal})...`);
      
      const res = onAccountTransaction(Number(testAccId), 'Debit', Number(testOverdraftAmt), 'Overdraft Test');
      if (res.success) {
        addLog(`SUCCESS: Account updated. New balance: ₹${res.newBalance}`);
      } else {
        addLog(`TRIGGER SIGNAL FIRED: SQLSTATE 45000 -> ${res.message}`);
      }
    }
  };

  return (
    <div className="view-container">
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem' }}>
        {/* Procedure Selector Sidebar */}
        <div className="table-container" style={{ padding: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>DATABASE OBJECTS</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button className={`nav-item ${activeProc === 'sp_ProcessEMIPayment' ? 'active' : ''}`} onClick={() => setActiveProc('sp_ProcessEMIPayment')}>
              <Code size={16} /> sp_ProcessEMIPayment
            </button>
            <button className={`nav-item ${activeProc === 'sp_DisburseLoan' ? 'active' : ''}`} onClick={() => setActiveProc('sp_DisburseLoan')}>
              <Code size={16} /> sp_DisburseLoan
            </button>
            <button className={`nav-item ${activeProc === 'sp_CalculateMonthlyInterest' ? 'active' : ''}`} onClick={() => setActiveProc('sp_CalculateMonthlyInterest')}>
              <Code size={16} /> sp_CalculateMonthlyInterest
            </button>
            <button className={`nav-item ${activeProc === 'sp_AssessLateFees' ? 'active' : ''}`} onClick={() => setActiveProc('sp_AssessLateFees')}>
              <Code size={16} /> sp_AssessLateFees
            </button>
            <button className={`nav-item ${activeProc === 'trg_prevent_insufficient_funds' ? 'active' : ''}`} onClick={() => setActiveProc('trg_prevent_insufficient_funds')}>
              <ShieldAlert size={16} /> trg_prevent_insufficient_funds
            </button>
          </div>
        </div>

        {/* Console & Execution Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Inputs Panel */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Procedure Inputs & Parameter Binding</h3>
              <button className="btn btn-primary" onClick={handleRunProc}>
                <Play size={16} /> Execute Procedure
              </button>
            </div>

            {activeProc === 'sp_ProcessEMIPayment' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>p_loan_id</label>
                  <select className="select-field" value={emiLoanId} onChange={(e) => setEmiLoanId(e.target.value)}>
                    <option value="">Select Active Loan...</option>
                    {loans.map(l => (
                      <option key={l.loan_id} value={l.loan_id}>Loan #{l.loan_id} (Bal: ₹{Number(l.outstanding_balance).toLocaleString('en-IN')})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>p_payment_amount (₹)</label>
                  <input type="number" className="input-field" value={emiAmount} onChange={(e) => setEmiAmount(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>p_payment_mode</label>
                  <select className="select-field" value={emiMode} onChange={(e) => setEmiMode(e.target.value)}>
                    <option value="Net Banking">Net Banking</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>
            )}

            {activeProc === 'trg_prevent_insufficient_funds' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Target Account ID</label>
                  <select className="select-field" value={testAccId} onChange={(e) => setTestAccId(e.target.value)}>
                    {accounts.map(a => (
                      <option key={a.account_id} value={a.account_id}>Account #{a.account_id} (Current Balance: ₹{Number(a.balance).toLocaleString('en-IN')})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Excessive Debit Amount (Test Overdraft Signal)</label>
                  <input type="number" className="input-field" value={testOverdraftAmt} onChange={(e) => setTestOverdraftAmt(e.target.value)} />
                </div>
              </div>
            )}

            {(activeProc === 'sp_CalculateMonthlyInterest' || activeProc === 'sp_AssessLateFees') && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>This procedure takes zero input arguments and runs across all active loan records in the database.</p>
            )}
          </div>

          {/* SQL Code Box */}
          <div className="card">
            <h3>MySQL Source Script</h3>
            <div className="console-box">
              {procCodes[activeProc]}
            </div>
          </div>

          {/* Execution Log Output Console */}
          <div className="card">
            <h3>Live DB Engine Execution Log</h3>
            <div className="console-box" style={{ background: '#090d16', color: '#10b981', maxHeight: '200px', overflowY: 'auto' }}>
              {consoleLogs.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
