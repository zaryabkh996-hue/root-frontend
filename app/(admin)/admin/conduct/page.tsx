'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/app/lib/authService';
import { useNotification } from '@/app/lib/NotificationContext';

export default function AdminConduct() {
  const router = useRouter();

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [isSubmittingWarning, setIsSubmittingWarning] = useState(false);
  const { showNotification } = useNotification();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'dismiss' | 'ban', reportId: number } | null>(null);

  const fetchReports = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app';
      const response = await fetch(
        `${backendUrl}/api/admin/community/reports`,
        {
          method: 'GET',
          headers: AuthService.getAuthHeaders(),
        }
      );
      if (response.ok) {
        const result = await response.json();
        setReports(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching community reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const triggerConfirm = (type: 'dismiss' | 'ban', reportId: number) => {
    setConfirmAction({ type, reportId });
    setConfirmModalOpen(true);
  };

  const handleExecuteConfirm = async () => {
    if (!confirmAction) return;
    const { type, reportId } = confirmAction;
    setConfirmModalOpen(false);
    setConfirmAction(null);

    if (type === 'dismiss') {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app';
        const response = await fetch(
          `${backendUrl}/api/admin/community/reports/${reportId}/dismiss`,
          {
            method: 'POST',
            headers: AuthService.getAuthHeaders(),
          }
        );
        if (response.ok) {
          setReports(prev => prev.map(rep => rep.id === reportId ? { ...rep, status: 'dismissed' } : rep));
          showNotification("Report has been dismissed.", "success");
        } else {
          showNotification("Failed to dismiss report.", "error");
        }
      } catch (error) {
        console.error("Error dismissing report:", error);
        showNotification("An error occurred.", "error");
      }
    } else if (type === 'ban') {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app';
        const response = await fetch(
          `${backendUrl}/api/admin/community/reports/${reportId}/ban`,
          {
            method: 'POST',
            headers: AuthService.getAuthHeaders(),
          }
        );
        if (response.ok) {
          setReports(prev => prev.map(rep => rep.id === reportId ? { ...rep, status: 'banned' } : rep));
          showNotification("Member has been banned and status updated to suspended.", "success");
        } else {
          showNotification("Failed to ban member.", "error");
        }
      } catch (error) {
        console.error("Error banning member:", error);
        showNotification("An error occurred.", "error");
      }
    }
  };

  const openWarningModal = (reportId: number) => {
    setSelectedReportId(reportId);
    setWarningMessage('');
    setWarningModalOpen(true);
  };

  const handleSendWarning = async () => {
    if (!warningMessage.trim() || selectedReportId === null) return;
    setIsSubmittingWarning(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app';
      const response = await fetch(
        `${backendUrl}/api/admin/community/reports/${selectedReportId}/warn`,
        {
          method: 'POST',
          headers: AuthService.getAuthHeaders(),
          body: JSON.stringify({
            message: warningMessage,
          }),
        }
      );
      if (response.ok) {
        setReports(prev => prev.map(rep => rep.id === selectedReportId ? { ...rep, status: 'warned', warning_message: warningMessage } : rep));
        showNotification("Formal warning has been sent to the member via email.", "success");
        setWarningModalOpen(false);
      } else {
        const errorResult = await response.json();
        showNotification(errorResult.error || "Failed to send warning.", "error");
      }
    } catch (error) {
      console.error("Error sending warning:", error);
      showNotification("An error occurred.", "error");
    } finally {
      setIsSubmittingWarning(false);
    }
  };

  return (
    <div className="admin-main">
      <div className="admin-eyebrow">Code of Conduct</div>
      <h1 className="admin-page-title">Enforcement Panel</h1>

      {/* Escalation Levels Description */}
      <p className="admin-page-sub" style={{ marginBottom: '20px' }}>
        Four escalation levels:{' '}
        <span className="a-badge-ok">✓ Good standing</span>
        {' → '}
        <span className="a-badge-warn" style={{ margin: '0 4px' }}>⚠ Warning</span>
        {' → '}
        <span className="a-badge-red" style={{ margin: '0 4px' }}>⏸ Suspended</span>
        {' → '}
        <span className="a-badge-red" style={{ margin: '0 4px', background: '#1f2937', color: '#f9fafb', borderColor: '#374151' }}>
          ✗ Banned
        </span>
        . All actions are logged and Custodian-notified.
      </p>

      {/* Alert 1 - High Priority */}
      <div className="a-alert a-alert-high" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <div className="a-alert-title">Custodian #CU-019 · Kwesi A. · Accra · 3 yrs</div>
          </div>
          <span className="a-badge-warn">⚠ Investigation open · Case: 9 May 2026</span>
        </div>
        <div className="a-alert-quote">
          "If easier, you can send me directly — my number is 0XX XXX XXXX. Platform takes too long." — platform chat · 9 May 2026 14:32 · before session confirmed
        </div>
        <div style={{ fontSize: '13px', color: '#374151', marginBottom: '14px' }}>
          First violation. Training Module 5 (Platform Rules) completed 2 May. Custodian was aware of the rule. Classification:{' '}
          <strong style={{ color: '#b91c1c' }}>Level 2 — Intentional breach.</strong>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="a-btn-primary" onClick={() => console.log('Issue formal warning')}>
            Issue formal warning + retraining
          </button>
          <button className="a-btn-ghost" onClick={() => console.log('Suspend pending review')}>
            Suspend pending review
          </button>
          <button className="a-btn-danger" onClick={() => console.log('Permanent ban')}>
            Permanent ban
          </button>
          <button className="a-btn-ghost" onClick={() => console.log('Dismiss')}>
            Dismiss
          </button>
        </div>
      </div>

      {/* Alert 2 - Medium Priority */}
      <div className="a-alert a-alert-med" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <div className="a-alert-title">Custodian #CU-008 · Ama D. · Cape Coast · 5 yrs</div>
          </div>
          <span className="a-badge-warn">⚠ 1 prior warning · Redirect review triggered</span>
        </div>
        <div className="a-alert-quote">
          "The Custodian made me feel like a tourist, not a relative." — Client · 1 May 2026
        </div>
        <div style={{ fontSize: '13px', color: '#374151', marginBottom: '14px' }}>
          Client submitted 🔄 Redirect. Module 1 (Diaspora Psyche) training score was 🤝 Connection — lowest possible pass. This is a second escalation point.
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="a-btn-primary" onClick={() => console.log('Require Module 1 retrain')}>
            Require Module 1 retrain
          </button>
          <button className="a-btn-ghost" onClick={() => console.log('Second formal warning')}>
            Second formal warning
          </button>
          <button className="a-btn-ghost" onClick={() => console.log('Suspend — 30 days')}>
            Suspend — 30 days
          </button>
        </div>
      </div>

      {/* Community Reports Section */}
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111', marginTop: '30px', marginBottom: '14px' }}>
        Community Reports
      </div>

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', color: '#6b7280', fontSize: '13px', marginBottom: '24px' }}>
          Loading community reports...
        </div>
      ) : reports.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', background: '#f9fafb', border: '1px dashed #e5e7eb', borderRadius: '6px', color: '#6b7280', fontSize: '13px', marginBottom: '24px' }}>
          No pending community reports.
        </div>
      ) : (
        <div style={{ marginBottom: '24px' }}>
          {reports.map((report) => {
            const isActioned = report.status !== 'pending';
            
            let statusBadge = null;
            if (report.status === 'dismissed') {
              statusBadge = <span className="a-badge-ok">✓ Dismissed</span>;
            } else if (report.status === 'warned') {
              statusBadge = <span className="a-badge-warn">⚠ Warning Sent</span>;
            } else if (report.status === 'banned') {
              statusBadge = <span className="a-badge-red" style={{ background: '#1f2937', color: '#f9fafb', borderColor: '#374151' }}>✗ Banned</span>;
            } else {
              statusBadge = <span className="a-badge-warn" style={{ background: '#fef3c7', color: '#d97706', borderColor: '#fcd34d' }}>⏸ Pending Review</span>;
            }

            return (
              <div key={report.id} className="a-alert a-alert-high" style={{ marginBottom: '16px', opacity: isActioned ? 0.85 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <div className="a-alert-title">
                      Report #{report.id} · Reported User: <strong>{report.reported_user_name}</strong> · Reporter: {report.reporter_name}
                    </div>
                  </div>
                  {statusBadge}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                  Reported Item Type: <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{report.item_type}</span> · {report.time_ago}
                </div>
                <div className="a-alert-quote" style={{ fontStyle: 'italic', marginBottom: '10px' }}>
                  "{report.item_content}"
                </div>
                
                {report.status === 'warned' && report.warning_message && (
                  <div style={{ fontSize: '12px', background: '#fef3c7', color: '#92400e', padding: '8px 12px', borderRadius: '4px', borderLeft: '3px solid #d97706', marginBottom: '14px' }}>
                    <strong>Warning Sent:</strong> {report.warning_message}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {report.status === 'warned' ? (
                    <span style={{ fontSize: '13px', color: '#b91c1c', fontWeight: 600, display: 'flex', alignItems: 'center', marginRight: '10px' }}>
                      ✓ Formal warning sent
                    </span>
                  ) : (
                    <button 
                      className="a-btn-primary" 
                      disabled={isActioned}
                      onClick={() => openWarningModal(report.id)}
                      style={{ opacity: isActioned ? 0.5 : 1, cursor: isActioned ? 'not-allowed' : 'pointer' }}
                    >
                      Issue formal warning
                    </button>
                  )}
                  <button 
                    className="a-btn-danger" 
                    disabled={isActioned}
                    onClick={() => triggerConfirm('ban', report.id)}
                    style={{ opacity: isActioned ? 0.5 : 1, cursor: isActioned ? 'not-allowed' : 'pointer' }}
                  >
                    Permanent ban
                  </button>
                  <button 
                    className="a-btn-ghost" 
                    disabled={isActioned}
                    onClick={() => triggerConfirm('dismiss', report.id)}
                    style={{ opacity: isActioned ? 0.5 : 1, cursor: isActioned ? 'not-allowed' : 'pointer' }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reference Guide */}
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111', marginBottom: '14px' }}>
        Violation Reference Guide
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* Level 1 */}
        <div className="a-coc-level a-coc-1">
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#14532d', marginBottom: '5px' }}>
            Level 1 — Minor
          </div>
          <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>
            Miscommunication, late arrival, misread client need. First offense. Response: warning logged, no immediate action.
          </div>
        </div>

        {/* Level 2 */}
        <div className="a-coc-level a-coc-2">
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#78350f', marginBottom: '5px' }}>
            Level 2 — Moderate
          </div>
          <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>
            Off-platform payment request, repeated complaints, 🔄 Redirect with second complaint. Response: formal warning + mandatory retraining.
          </div>
        </div>

        {/* Level 3 */}
        <div className="a-coc-level a-coc-3">
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#9a3412', marginBottom: '5px' }}>
            Level 3 — Serious
          </div>
          <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>
            Confirmed off-platform payment, inappropriate behaviour, client reports feeling unsafe. Response: suspension pending investigation.
          </div>
        </div>

        {/* Level 4 */}
        <div className="a-coc-level a-coc-4">
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#7f1d1d', marginBottom: '5px' }}>
            Level 4 — Critical
          </div>
          <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>
            Fraud, abuse, harassment. Response: immediate permanent ban, Afrofeast Certification revoked, client notified.
          </div>
        </div>
      </div>
      {/* Warning Modal */}
      {warningModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '500px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111', marginBottom: '12px' }}>
              Issue Formal Warning
            </h3>
            <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '16px' }}>
              This warning message will be emailed to the member. Please detail the violation clearly.
            </p>
            <textarea
              value={warningMessage}
              onChange={(e) => setWarningMessage(e.target.value)}
              placeholder="e.g. Please refrain from using inappropriate language in our community channels. Further offenses will lead to account suspension."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                fontFamily: 'inherit',
                marginBottom: '20px',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'end', gap: '10px' }}>
              <button 
                className="a-btn-ghost" 
                onClick={() => setWarningModalOpen(false)}
                disabled={isSubmittingWarning}
                style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                className="a-btn-primary" 
                onClick={handleSendWarning}
                disabled={isSubmittingWarning || !warningMessage.trim()}
                style={{ padding: '8px 16px', fontSize: '13px', cursor: (isSubmittingWarning || !warningMessage.trim()) ? 'not-allowed' : 'pointer' }}
              >
                {isSubmittingWarning ? 'Sending...' : 'Send Warning'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {confirmModalOpen && confirmAction && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '400px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
            textAlign: 'center',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={confirmAction.type === 'ban' ? '#b91c1c' : '#d97706'} strokeWidth="2" style={{ marginBottom: '12px', marginLeft: 'auto', marginRight: 'auto' }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111', marginBottom: '8px' }}>
              {confirmAction.type === 'ban' ? 'Confirm Permanent Ban' : 'Confirm Dismiss Report'}
            </h3>
            <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '20px', lineHeight: '1.5' }}>
              {confirmAction.type === 'ban' 
                ? 'Are you sure you want to permanently ban this member? This will update their account status to suspended.' 
                : 'Are you sure you want to dismiss this report? This action will ignore the warning and mark the report as resolved.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button 
                className="a-btn-ghost" 
                onClick={() => { setConfirmModalOpen(false); setConfirmAction(null); }}
                style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                className={confirmAction.type === 'ban' ? 'a-btn-danger' : 'a-btn-primary'} 
                onClick={handleExecuteConfirm}
                style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer', background: confirmAction.type === 'ban' ? '#b91c1c' : '#c9a14a', color: '#fff', border: 'none', borderRadius: '4px' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
