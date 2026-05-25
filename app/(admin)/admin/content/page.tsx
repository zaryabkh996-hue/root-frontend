'use client';

export default function ContentPage() {
  return (
    <main className="admin-main">
      <div className="admin-eyebrow">Content Management</div>
      <h1 className="admin-page-title">Modules pending approval</h1>
      <p className="admin-page-sub">
        5-step process: Author → Automated checks → Peer review → Cultural advisor → Founder sign-off (Stage 1.4 and Stage 5 only)
      </p>

      {/* First Alert - Medium Priority (Yellow) */}
      <div className="a-alert a-alert-med" style={{ marginBottom: '12px' }}>
        <div className="a-alert-title">Module 5.4 · Holding Space for Grief · Reflection Lab · High sensitivity</div>
        <div className="a-alert-sub">Awaiting founder sign-off · authored ✓ · peer reviewed ✓ · cultural advisor ✓</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="a-btn-primary"
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).toast) {
                (window as any).toast('Module 5.4 approved and published', 'success');
              }
            }}
          >
            Approve &amp; publish
          </button>
          <button
            className="a-btn-ghost"
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).toast) {
                (window as any).toast('Revision requested · content team notified', 'warn');
              }
            }}
          >
            Request revision
          </button>
        </div>
      </div>

      {/* Second Alert - Low Priority (Green) */}
      <div className="a-alert a-alert-low">
        <div className="a-alert-title">Module 2.6 · Festival Calendar · Protocol Practice · Low sensitivity</div>
        <div className="a-alert-sub">Cultural advisor review in progress · peer reviewed ✓</div>
      </div>
    </main>
  );
}
