'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabKey = 'all' | 'pending' | 'tracks';
type ModuleTrack =
  | 'Emotional Preparation'
  | 'Cultural Intelligence'
  | 'Practical Preparation'
  | 'Arrival Orientation'
  | 'Heritage Journey Experience'
  | 'Post Journey Experience';
type ModuleTier = 'Free' | 'Community' | 'Preparation';
type ToastType = 'success' | 'warn' | 'error';

interface SanityModule {
  _id: string;
  title: string;
  slug: string;
  moduleNumber: number;
  subtitle: string;
  track: string;
  tier: string;
  contentType: string;
  sensitivity: string;
  body: string;
  takeaways: string;
  status: 'pending' | 'published';
  revisionNote?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  resourceUrl?: string;
  approvalStep?: number;
}

interface TrackSummaryRow {
  name: ModuleTrack;
  desc: string;
  tier: string;
  tierBg: string;
  tierColor: string;
  tierBorder: string;
  price: string;
  modules: number;
  published: number;
  pending: number;
}

const trackOrder: ModuleTrack[] = [
  'Emotional Preparation',
  'Cultural Intelligence',
  'Practical Preparation',
  'Arrival Orientation',
  'Heritage Journey Experience',
  'Post Journey Experience',
];

const trackMeta: Record<
  ModuleTrack,
  { range: string; color: string; pillClass: string }
> = {
  'Emotional Preparation': {
    range: 'Free tier',
    color: '#15803d',
    pillClass: 'a-cc-track-pill a-cc-track-free',
  },
  'Cultural Intelligence': {
    range: 'Community $27/mo',
    color: '#1d4ed8',
    pillClass: 'a-cc-track-pill a-cc-track-community',
  },
  'Practical Preparation': {
    range: 'Preparation $67/mo',
    color: '#7e22ce',
    pillClass: 'a-cc-track-pill a-cc-track-prep',
  },
  'Arrival Orientation': {
    range: 'Preparation $67/mo',
    color: '#7e22ce',
    pillClass: 'a-cc-track-pill a-cc-track-prep',
  },
  'Heritage Journey Experience': {
    range: 'Preparation $67/mo',
    color: '#7e22ce',
    pillClass: 'a-cc-track-pill a-cc-track-prep',
  },
  'Post Journey Experience': {
    range: 'Preparation $67/mo',
    color: '#7e22ce',
    pillClass: 'a-cc-track-pill a-cc-track-prep',
  },
};

const trackSummary: TrackSummaryRow[] = [
  {
    name: 'Emotional Preparation',
    desc: 'Mental & emotional preparation for reconnecting with African heritage',
    tier: 'Free',
    tierBg: '#f0fdf4',
    tierColor: '#15803d',
    tierBorder: '#86efac',
    price: '$0',
    modules: 0,
    published: 0,
    pending: 0,
  },
  {
    name: 'Cultural Intelligence',
    desc: 'Local customs, language basics, protocols, and social dynamics',
    tier: 'Community',
    tierBg: '#eff6ff',
    tierColor: '#1d4ed8',
    tierBorder: '#93c5fd',
    price: '$27/mo',
    modules: 0,
    published: 0,
    pending: 0,
  },
  {
    name: 'Practical Preparation',
    desc: 'Visas, health requirements, budgeting, packing, and flight logistics',
    tier: 'Preparation',
    tierBg: '#fdf4ff',
    tierColor: '#7e22ce',
    tierBorder: '#d8b4fe',
    price: '$67/mo',
    modules: 0,
    published: 0,
    pending: 0,
  },
  {
    name: 'Arrival Orientation',
    desc: 'Airport navigation, initial days safety, SIM cards, and local transit',
    tier: 'Preparation',
    tierBg: '#fdf4ff',
    tierColor: '#7e22ce',
    tierBorder: '#d8b4fe',
    price: '$67/mo',
    modules: 0,
    published: 0,
    pending: 0,
  },
  {
    name: 'Heritage Journey Experience',
    desc: 'Guided reflection and deep cultural engagement during your stay',
    tier: 'Preparation',
    tierBg: '#fdf4ff',
    tierColor: '#7e22ce',
    tierBorder: '#d8b4fe',
    price: '$67/mo',
    modules: 0,
    published: 0,
    pending: 0,
  },
  {
    name: 'Post Journey Experience',
    desc: 'Re-entry processing, integration, and continuous community action',
    tier: 'Preparation',
    tierBg: '#fdf4ff',
    tierColor: '#7e22ce',
    tierBorder: '#d8b4fe',
    price: '$67/mo',
    modules: 0,
    published: 0,
    pending: 0,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(value: string): string {
  let slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || '';
}

function tierLabel(tier: string): ModuleTier {
  if (tier === 'community') return 'Community';
  if (tier === 'preparation') return 'Preparation';
  return 'Free';
}

function tierPillClass(track: string): string {
  const meta = trackMeta[track as ModuleTrack];
  return meta?.pillClass ?? 'a-cc-track-pill a-cc-track-free';
}

// ---------------------------------------------------------------------------
// Initial form state
// ---------------------------------------------------------------------------

const initialForm = {
  num: '',
  time: '',
  title: '',
  track: '',
  tier: 'free',
  type: 'Reading',
  sens: 'low',
  body: '',
  takeaways: '',
  slug: '',
  resourceUrl: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ContentPage() {
  // --- Data state ---
  const [modules, setModules] = useState<SanityModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- UI state ---
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Add new module');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(
    null,
  );

  // --- Toast ---
  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    setToast({ msg, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      showToast('Cloudinary credentials (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) are not configured in your environment!', 'error');
      return;
    }

    try {
      setMediaUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.secure_url) {
        setForm(current => ({
          ...current,
          resourceUrl: data.secure_url,
        }));
        showToast('Media uploaded to Cloudinary successfully!', 'success');
      } else {
        showToast(data.error?.message || 'Failed to upload media to Cloudinary.', 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Media upload failed.', 'error');
    } finally {
      setMediaUploading(false);
    }
  };

  // --- Fetch modules ---
  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;
      const res = await fetch('/fe-api/admin/content', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success) {
        setModules(data.data ?? []);
      } else {
        setError(data.error ?? 'Failed to fetch modules');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // --- Computed stats ---
  const stats = useMemo(() => {
    const total = modules.length;
    const published = modules.filter((m) => m.status === 'published').length;
    const pending = modules.filter((m) => m.status === 'pending').length;
    return { total, published, pending, drafts: 0 };
  }, [modules]);

  // --- Filtered modules for All tab ---
  const filteredModules = useMemo(() => {
    return modules.filter((mod) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        mod.title.toLowerCase().includes(query) ||
        mod.subtitle.toLowerCase().includes(query);
      const matchesTrack = !trackFilter || mod.track === trackFilter;
      const matchesStatus =
        !statusFilter || mod.status === statusFilter;
      return matchesSearch && matchesTrack && matchesStatus;
    });
  }, [modules, search, statusFilter, trackFilter]);

  const groupedModules = useMemo(() => {
    return trackOrder
      .map((track) => ({
        track,
        meta: trackMeta[track],
        modules: filteredModules.filter((mod) => mod.track === track),
      }))
      .filter((group) => group.modules.length > 0);
  }, [filteredModules]);

  // --- Pending modules ---
  const pendingModules = useMemo(() => {
    return modules.filter((m) => m.status === 'pending');
  }, [modules]);

  const [selectedPendingId, setSelectedPendingId] = useState<string | null>(null);

  const activePendingModule = useMemo(() => {
    if (pendingModules.length === 0) return null;
    const found = pendingModules.find((m) => m._id === selectedPendingId);
    return found || pendingModules[0];
  }, [pendingModules, selectedPendingId]);

  const dynamicTrackSummary = useMemo(() => {
    return trackSummary.map((track) => {
      const trackModules = modules.filter((m) => m.track === track.name);
      const published = trackModules.filter((m) => m.status === 'published').length;
      const pending = trackModules.filter((m) => m.status === 'pending').length;
      return {
        ...track,
        modules: trackModules.length,
        published,
        pending,
      };
    });
  }, [modules]);

  // --- Modal ---
  const openAddModal = () => {
    setModalTitle('Add new module');
    setEditingId(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const openEditModal = (mod: SanityModule) => {
    setModalTitle(`Edit module ${mod.moduleNumber} — ${mod.title}`);
    setEditingId(mod._id);
    setForm({
      num: String(mod.moduleNumber || ''),
      time: mod.subtitle.split(' min')[0] ?? '',
      title: mod.title,
      track: mod.track,
      tier: mod.tier,
      type: mod.contentType || 'Reading',
      sens: mod.sensitivity || 'low',
      body: mod.body || '',
      takeaways: mod.takeaways || '',
      slug: mod.slug || '',
      resourceUrl: mod.resourceUrl || '',
    });
    setModalOpen(true);
  };

  // --- Auto-generate slug from title ---
  useEffect(() => {
    if (form.title) {
      const generated = slugify(form.title);
      setForm((c) => ({ ...c, slug: generated }));
    }
  }, [form.title]);

  // --- Submit module (create or update) ---
  const submitModule = async () => {
    if (!form.title.trim() || !form.track) {
      showToast('Title and track are required', 'warn');
      return;
    }

    setSubmitting(true);

    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;
      const payload = {
        title: form.title,
        moduleNumber: Number(form.num) || 0,
        subtitle: form.time ? `${form.time} min · ${form.type}` : form.type,
        track: form.track,
        tier: form.tier,
        contentType: form.type,
        sensitivity: form.sens,
        body: form.body,
        takeaways: form.takeaways,
        resourceUrl: form.resourceUrl,
      };

      if (editingId) {
        // Update existing
        const res = await fetch(`/fe-api/admin/content/${encodeURIComponent(editingId)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        showToast(`Module updated · "${form.title}"`, 'success');
      } else {
        // Create new
        const res = await fetch('/fe-api/admin/content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        showToast(`Module submitted for review · "${form.title}"`, 'success');
      }

      setModalOpen(false);
      setEditingId(null);
      await fetchModules();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save module', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete module ---
  const handleDelete = async (mod: SanityModule) => {
    if (!confirm(`Delete module "${mod.title}"? This cannot be undone.`)) return;

    setActionLoading(mod._id);
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;
      const res = await fetch(`/fe-api/admin/content/${encodeURIComponent(mod._id)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      showToast(`Module deleted · "${mod.title}"`, 'success');
      await fetchModules();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // --- Approve & publish ---
  const approveAndPublish = async (mod: SanityModule) => {
    setActionLoading(mod._id);
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;
      const res = await fetch(
        `/fe-api/admin/content/${encodeURIComponent(mod._id)}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        },
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      showToast(`Module ${mod.moduleNumber} · ${mod.title} approved & published`, 'success');
      await fetchModules();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to approve', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // --- Approve & next step ---
  const approveNextStep = async (mod: SanityModule) => {
    const currentStep = mod.approvalStep ?? 1;
    if (currentStep >= 5) {
      await approveAndPublish(mod);
      return;
    }

    setActionLoading(mod._id);
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;
      const res = await fetch(`/fe-api/admin/content/${encodeURIComponent(mod._id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ approvalStep: currentStep + 1 }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      showToast(`Module advanced to Step ${currentStep + 1} · "${mod.title}"`, 'success');
      await fetchModules();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to advance step', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // --- Request revision ---
  const handleRequestRevision = async (mod: SanityModule, noteId: string) => {
    const noteValue =
      (document.getElementById(noteId) as HTMLInputElement | null)?.value.trim() ?? '';

    setActionLoading(mod._id);
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;
      const res = await fetch(
        `/fe-api/admin/content/${encodeURIComponent(mod._id)}/revision`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ note: noteValue }),
        },
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      showToast(
        `Revision requested for module ${mod.moduleNumber} · ${mod.title}`,
        'warn',
      );
      await fetchModules();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to request revision', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // --- Preview ---
  const previewModule = (mod: SanityModule) => {
    showToast(`Preview module ${mod.moduleNumber}`, 'success');
  };

  return (
    <main className="admin-main content-page-ref">
      <div className="admin-eyebrow">Content Management</div>

      <div className="a-cc-top-bar">
        <div>
          <h1 className="admin-page-title">Modules &amp; Content</h1>
          <p className="admin-page-sub">
            Manage all {stats.total} learning modules across 6 tracks · 5-step publish
            pipeline for sensitive content
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="a-cc-btn-ghost"
            onClick={() => showToast('Export CSV downloaded', 'success')}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>

          <button className="a-cc-btn-accent" onClick={openAddModal}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add module
          </button>
        </div>
      </div>

      {/* Stats row — dynamic */}
      <div className="a-cc-stats-row">
        <div className="a-cc-stat-card">
          <div className="a-cc-stat-icon" style={{ background: '#f0f9ff' }}>
            📚
          </div>
          <div className="a-cc-stat-num">{stats.total}</div>
          <div className="a-cc-stat-label">Total modules</div>
        </div>

        <div className="a-cc-stat-card">
          <div className="a-cc-stat-icon" style={{ background: '#f0fdf4' }}>
            ✅
          </div>
          <div className="a-cc-stat-num">{stats.published}</div>
          <div className="a-cc-stat-label">Published</div>
        </div>

        <div className="a-cc-stat-card">
          <div className="a-cc-stat-icon" style={{ background: '#fffbeb' }}>
            ⏳
          </div>
          <div className="a-cc-stat-num">{stats.pending}</div>
          <div className="a-cc-stat-label">Pending approval</div>
        </div>

        <div className="a-cc-stat-card">
          <div className="a-cc-stat-icon" style={{ background: '#fdf4ff' }}>
            ✏️
          </div>
          <div className="a-cc-stat-num">{stats.drafts}</div>
          <div className="a-cc-stat-label">Drafts</div>
        </div>
      </div>

      {/* Tabs — dynamic counts */}
      <div className="a-cc-tabs">
        <div
          className={`a-cc-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All modules <span className="a-cc-tab-count">{stats.total}</span>
        </div>

        <div
          className={`a-cc-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending approval{' '}
          <span className="a-cc-tab-count a-cc-tab-count-warn">{stats.pending}</span>
        </div>

        <div
          className={`a-cc-tab ${activeTab === 'tracks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracks')}
        >
          Tracks &amp; tiers
        </div>
      </div>

      {/* Loading / Error states */}
      {loading && (
        <div className="a-cc-content-table" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div className="a-cc-loading-spinner" />
          <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '12px' }}>
            Loading modules from Sanity…
          </div>
        </div>
      )}

      {error && !loading && (
        <div style={{
          padding: '20px',
          background: '#fff1f0',
          border: '1px solid #fecdca',
          borderRadius: '8px',
          color: '#b42318',
          fontSize: '13px',
          marginBottom: '20px',
        }}>
          <strong>Error:</strong> {error}
          <button
            className="a-cc-btn-ghost"
            style={{ marginLeft: '12px' }}
            onClick={fetchModules}
          >
            Retry
          </button>
        </div>
      )}

      {/* ═══════════ ALL MODULES TAB ═══════════ */}
      {activeTab === 'all' && !loading && (
        <div>
          <div className="a-cc-content-table">
            <div className="a-cc-table-toolbar">
              <input
                type="text"
                className="a-cc-search-input"
                placeholder="Search modules…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <select
                className="a-cc-filter-select"
                value={trackFilter}
                onChange={(event) => setTrackFilter(event.target.value)}
              >
                <option value="">All tracks</option>
                <option value="Emotional Preparation">Emotional Preparation</option>
                <option value="Cultural Intelligence">Cultural Intelligence</option>
                <option value="Practical Preparation">Practical Preparation</option>
                <option value="Arrival Orientation">Arrival Orientation</option>
                <option value="Heritage Journey Experience">Heritage Journey Experience</option>
                <option value="Post Journey Experience">Post Journey Experience</option>
              </select>

              <select
                className="a-cc-filter-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">All statuses</option>
                <option value="published">Published</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="a-cc-table-responsive">
              <div className="a-cc-table-head">
                <span>#</span>
                <span>Module</span>
                <span>Track</span>
                <span>Tier</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

            {groupedModules.length === 0 && (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontSize: '13px',
                }}
              >
                {modules.length === 0
                  ? 'No modules yet. Click "Add module" to create your first one.'
                  : 'No modules match your filters.'}
              </div>
            )}

            {groupedModules.map((group) => (
              <div key={group.track}>
                <div className="a-cc-track-header">
                  <span
                    className="a-cc-track-header-label"
                    style={{ color: group.meta.color }}
                  >
                    {group.track}
                  </span>
                  <span className="a-cc-track-header-meta">
                    {group.meta.range} · {group.modules.length} {group.modules.length === 1 ? 'module' : 'modules'}
                  </span>
                </div>

                {group.modules.map((mod) => (
                  <div key={mod._id} className="a-cc-table-row">
                    <span className="a-cc-module-num">{mod.moduleNumber || '—'}</span>

                    <div>
                      <div className="a-cc-module-title">{mod.title}</div>
                      <div className="a-cc-module-sub">{mod.subtitle}</div>
                    </div>

                    <div>
                      <span className={tierPillClass(mod.track)}>{mod.track}</span>
                    </div>

                    <div className="a-cc-tier-label">{tierLabel(mod.tier)}</div>

                    <div>
                      {mod.status === 'published' && (
                        <span className="a-cc-badge a-cc-badge-published">
                          ● Published
                        </span>
                      )}
                      {mod.status === 'pending' && (
                        <span className="a-cc-badge a-cc-badge-pending">
                          ⏳ Pending
                        </span>
                      )}
                    </div>

                    <div className="a-cc-row-actions">
                      <button
                        className="a-cc-btn-icon"
                        onClick={() => openEditModal(mod)}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        className="a-cc-btn-icon"
                        style={{ color: '#dc2626', borderColor: '#fecdca' }}
                        onClick={() => handleDelete(mod)}
                        disabled={actionLoading === mod._id}
                      >
                        {actionLoading === mod._id ? '…' : '🗑 Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ PENDING APPROVAL TAB ═══════════ */}
      {activeTab === 'pending' && !loading && (
        <div>
          <div className="a-cc-sens-note">
            ℹ️ All new content starts at <strong>Step 1 (Author)</strong>. Select a module below to view and advance its pipeline.
          </div>

          {/* Pipeline steps — Dynamic based on active pending module */}
          {activePendingModule && (
            <div className="a-cc-pipeline-steps">
              {[
                { num: 1, label: 'Author' },
                { num: 2, label: 'Auto checks' },
                { num: 3, label: 'Peer review' },
                { num: 4, label: 'Cultural advisor' },
                { num: 5, label: 'Founder sign-off' },
              ].map((s) => {
                const currentStep = activePendingModule.approvalStep ?? 1;
                const isDone = s.num < currentStep;
                const isActive = s.num === currentStep;

                let stepClass = 'a-cc-pipeline-step';
                let statusText = 'Waiting';
                let statusStyle = {};

                if (isDone) {
                  stepClass = 'a-cc-pipeline-step a-cc-pipeline-step-done';
                  statusText = '✓ Complete';
                } else if (isActive) {
                  stepClass = 'a-cc-pipeline-step a-cc-pipeline-step-active';
                  statusText = '⏳ In progress';
                  statusStyle = { color: '#d97706' };
                }

                return (
                  <div key={s.num} className={stepClass}>
                    <div className="a-cc-pipeline-step-num">Step {s.num}</div>
                    <div className="a-cc-pipeline-step-label">{s.label}</div>
                    <div className="a-cc-pipeline-step-status" style={statusStyle}>
                      {statusText}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {pendingModules.length === 0 && (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '13px',
                background: '#fff',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}
            >
              No modules pending approval. All content is published! 
            </div>
          )}

          {pendingModules.map((mod) => {
            const noteId = `note-${mod._id}`;
            const isHigh = mod.sensitivity === 'high';
            const currentStep = mod.approvalStep ?? 1;
            const isSelected = activePendingModule?._id === mod._id;

            return (
              <div
                key={mod._id}
                onClick={() => setSelectedPendingId(mod._id)}
                className={`a-cc-approval-card ${
                  isHigh ? 'a-cc-approval-card-high' : 'a-cc-approval-card-low'
                } ${isSelected ? 'a-cc-approval-card-selected' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <div className="a-cc-approval-card-header">
                  <div>
                    <div className="a-cc-approval-card-title">
                      Module {mod.moduleNumber} · {mod.title}
                    </div>
                    <div className="a-cc-approval-card-meta">
                      Track: {mod.track} · Tier: {tierLabel(mod.tier)} ·
                      Sensitivity: {isHigh ? '🔴 High' : '🟢 Low'} ·
                      Type: {mod.contentType}
                    </div>
                  </div>

                  <span className="a-cc-badge a-cc-badge-pending">
                    ⏳ Step {currentStep} Awaiting
                  </span>
                </div>

                {/* Pipeline badges for each card */}
                <div className="a-cc-approval-card-pipeline">
                  {[
                    { num: 1, label: 'Author sign-off' },
                    { num: 2, label: 'Auto checks' },
                    { num: 3, label: 'Peer review' },
                    { num: 4, label: 'Cultural advisor' },
                    { num: 5, label: 'Founder sign-off' },
                  ].map((s) => {
                    const isDone = s.num < currentStep;
                    const isActive = s.num === currentStep;
                    let badgeClass = 'a-cc-pipeline-badge a-cc-pb-locked';
                    let prefix = '🔒 ';
                    if (isDone) {
                      badgeClass = 'a-cc-pipeline-badge a-cc-pb-done';
                      prefix = '✓ ';
                    } else if (isActive) {
                      badgeClass = 'a-cc-pipeline-badge a-cc-pb-pending';
                      prefix = '⏳ ';
                    }
                    return (
                      <span key={s.num} className={badgeClass}>
                        {prefix}{s.label}
                      </span>
                    );
                  })}
                </div>

                {/* Body preview */}
                {mod.body && (
                  <div className="a-cc-approval-card-quote">
                    &ldquo;{mod.body.length > 250 ? mod.body.slice(0, 250) + '…' : mod.body}&rdquo;
                  </div>
                )}

                {/* Revision note if present */}
                {mod.revisionNote && (
                  <div style={{
                    background: '#fef3c7',
                    border: '1px solid #fcd34d',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    marginBottom: '14px',
                    fontSize: '12px',
                    color: '#78350f',
                  }}>
                    <strong>Previous revision note:</strong> {mod.revisionNote}
                  </div>
                )}

                <div className="a-cc-approval-actions">
                  <input
                    type="text"
                    className="a-cc-approval-note"
                    placeholder="Add a revision note (optional)…"
                    id={noteId}
                  />

                  <button
                    className="a-cc-btn-ghost"
                    disabled={actionLoading === mod._id}
                    onClick={() => handleRequestRevision(mod, noteId)}
                  >
                    {actionLoading === mod._id ? 'Sending…' : 'Request revision'}
                  </button>

                  <button
                    className="a-cc-btn-primary"
                    disabled={actionLoading === mod._id}
                    onClick={() => {
                      if (currentStep >= 5) {
                        approveAndPublish(mod);
                      } else {
                        approveNextStep(mod);
                      }
                    }}
                  >
                    {actionLoading === mod._id ? (
                      'Processing…'
                    ) : (
                      <>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {currentStep >= 5 ? 'Approve & publish' : 'Approve & next step'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════ TRACKS & TIERS TAB (static, as requested) ═══════════ */}
      {activeTab === 'tracks' && (
        <div>
          <div className="a-cc-content-table">
            <div className="a-cc-table-responsive">
              <div
                className="a-cc-table-head"
                style={{
                  gridTemplateColumns: '1fr 100px 110px 80px 80px 80px',
                }}
              >
                <span>Track</span>
                <span>Tier</span>
                <span>Price</span>
                <span>Modules</span>
                <span>Published</span>
                <span>Pending</span>
              </div>

            {dynamicTrackSummary.map((track) => (
              <div
                key={track.name}
                className="a-cc-table-row"
                style={{
                  gridTemplateColumns: '1fr 100px 110px 80px 80px 80px',
                }}
              >
                <div>
                  <div className="a-cc-module-title">{track.name}</div>
                  <div className="a-cc-module-sub">{track.desc}</div>
                </div>

                <span
                  className="a-cc-badge"
                  style={{
                    background: track.tierBg,
                    color: track.tierColor,
                    borderColor: track.tierBorder,
                  }}
                >
                  {track.tier}
                </span>

                <div className="a-cc-tier-label">{track.price}</div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '13px',
                  }}
                >
                  {track.modules}
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '13px',
                    color: '#15803d',
                  }}
                >
                  {track.published}
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '13px',
                    color: track.pending > 0 ? '#d97706' : '#9ca3af',
                  }}
                >
                  {track.pending}
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ ADD/EDIT MODAL ═══════════ */}
      {modalOpen && (
        <div className="a-cc-modal-overlay" onClick={closeModal}>
          <div className="a-cc-modal" onClick={(event) => event.stopPropagation()}>
            <div className="a-cc-modal-head">
              <div className="a-cc-modal-title">{modalTitle}</div>
              <button className="a-cc-modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="a-cc-modal-body">
              <div className="a-cc-form-row">
                <div className="a-cc-form-group">
                  <label className="a-cc-form-label">Module number</label>
                  <input
                    type="number"
                    className="a-cc-form-input"
                    placeholder="e.g. 38"
                    value={form.num}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        num: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="a-cc-form-group">
                  <label className="a-cc-form-label">
                    Estimated read time (minutes)
                  </label>
                  <input
                    type="number"
                    className="a-cc-form-input"
                    placeholder="e.g. 45"
                    value={form.time}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        time: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="a-cc-form-row a-cc-form-row-full">
                <div className="a-cc-form-group">
                  <label className="a-cc-form-label">Module title</label>
                  <input
                    type="text"
                    className="a-cc-form-input"
                    placeholder="e.g. The Door of No Return — A Preparation Guide"
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="a-cc-form-row">
                <div className="a-cc-form-group">
                  <label className="a-cc-form-label">Track</label>
                  <select
                    className="a-cc-form-select"
                    value={form.track}
                    onChange={(event) => {
                      const selectedTrack = event.target.value;
                      let tierVal = 'free';
                      if (selectedTrack === 'Cultural Intelligence') {
                        tierVal = 'community';
                      } else if (selectedTrack && selectedTrack !== 'Emotional Preparation') {
                        tierVal = 'preparation';
                      }
                      setForm((current) => ({
                        ...current,
                        track: selectedTrack,
                        tier: tierVal,
                      }));
                    }}
                  >
                    <option value="">Select track…</option>
                    <option value="Emotional Preparation">Emotional Preparation</option>
                    <option value="Cultural Intelligence">Cultural Intelligence</option>
                    <option value="Practical Preparation">Practical Preparation</option>
                    <option value="Arrival Orientation">Arrival Orientation</option>
                    <option value="Heritage Journey Experience">Heritage Journey Experience</option>
                    <option value="Post Journey Experience">Post Journey Experience</option>
                  </select>
                </div>

                <div className="a-cc-form-group">
                  <label className="a-cc-form-label">
                    Tier (access level)
                  </label>
                  <select
                    className="a-cc-form-select"
                    value={form.tier}
                    disabled
                    style={{ background: '#f9fafb', color: '#6b7280', cursor: 'not-allowed' }}
                  >
                    <option value="free">Free</option>
                    <option value="community">Community ($27/mo)</option>
                    <option value="preparation">Preparation ($67/mo)</option>
                  </select>
                </div>
              </div>

              <div className="a-cc-form-row">
                <div className="a-cc-form-group">
                  <label className="a-cc-form-label">Content type</label>
                  <select
                    className="a-cc-form-select"
                    value={form.type}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        type: event.target.value,
                      }))
                    }
                  >
                    <option>Reading</option>
                    <option>Reflection Lab</option>
                    <option>Protocol Practice</option>
                    <option>Interactive</option>
                    <option>Audio</option>
                    <option>Video</option>
                    <option>PDF</option>
                    <option>Image</option>
                  </select>
                </div>

                <div className="a-cc-form-group">
                  <label className="a-cc-form-label">Sensitivity level</label>
                  <select
                    className="a-cc-form-select"
                    value={form.sens}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sens: event.target.value,
                      }))
                    }
                  >
                    <option value="low">Low — standard review</option>
                    <option value="high">High — requires 5-step pipeline</option>
                  </select>
                  <span className="a-cc-form-hint">
                    High sensitivity = Stage 1.4 or Stage 5 content
                  </span>
                </div>
              </div>

              {['PDF', 'Audio', 'Video', 'Image'].includes(form.type) && (
                <div className="a-cc-form-row a-cc-form-row-full">
                  <div className="a-cc-form-group">
                    <label className="a-cc-form-label">
                      Resource URL / File Link ({form.type})
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="a-cc-form-input"
                        style={{ flex: 1 }}
                        placeholder={`e.g. https://res.cloudinary.com/... or paste direct link`}
                        value={form.resourceUrl}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            resourceUrl: event.target.value,
                          }))
                        }
                      />
                      <label className="a-cc-btn-primary" style={{ cursor: 'pointer', padding: '10px 14px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px', height: '42px' }}>
                        {mediaUploading ? 'Uploading...' : 'Upload File'}
                        <input
                          type="file"
                          style={{ display: 'none' }}
                          accept={
                            form.type === 'Image' ? 'image/*' :
                            form.type === 'Audio' ? 'audio/*' :
                            form.type === 'Video' ? 'video/*' :
                            '.pdf,application/pdf'
                          }
                          disabled={mediaUploading}
                          onChange={handleMediaUpload}
                        />
                      </label>
                    </div>
                    {mediaUploading && (
                      <div className="text-xs mt-1 animate-pulse" style={{ color: 'var(--brass)' }}>
                        Uploading to Cloudinary, please wait...
                      </div>
                    )}
                    {form.resourceUrl && (
                      <div className="text-xs mt-1 flex items-center gap-1" style={{ color: '#16a34a' }}>
                        ✓ File linked successfully!
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="a-cc-form-row a-cc-form-row-full">
                <div className="a-cc-form-group">
                  <label className="a-cc-form-label">Module body</label>
                  <textarea
                    className="a-cc-form-textarea"
                    placeholder="Write or paste the module content here. Markdown supported."
                    value={form.body}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        body: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="a-cc-form-row a-cc-form-row-full">
                <div className="a-cc-form-group">
                  <label className="a-cc-form-label">
                    Key takeaways (one per line)
                  </label>
                  <textarea
                    className="a-cc-form-textarea"
                    style={{ minHeight: '80px' }}
                    placeholder={
                      'e.g. Understanding the emotional weight of the Door of No Return\nPractical grounding techniques for the experience'
                    }
                    value={form.takeaways}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        takeaways: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Slug — auto-generated, read-only */}
              <div className="a-cc-form-row a-cc-form-row-full">
                <div className="a-cc-form-group">
                  <label className="a-cc-form-label">Slug (URL path) — auto-generated</label>
                  <input
                    type="text"
                    className="a-cc-form-input"
                    value={form.slug}
                    readOnly
                    style={{ background: '#f9fafb', color: '#6b7280', cursor: 'not-allowed' }}
                  />
                  <span className="a-cc-form-hint">
                    This becomes the URL:{' '}
                    /modules/{form.slug || 'your-module-slug'}
                  </span>
                </div>
              </div>
            </div>

            <div className="a-cc-modal-foot">
              <button className="a-cc-btn-ghost" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="a-cc-btn-primary"
                onClick={submitModule}
                disabled={submitting}
              >
                {submitting ? (
                  'Saving…'
                ) : (
                  <>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {editingId ? 'Save changes' : 'Submit for review'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div
        className={`a-cc-toast ${toast ? 'show' : ''} ${toast ? `a-cc-toast-${toast.type}` : ''
          }`}
      >
        {toast?.msg ?? ''}
      </div>

      <style jsx global>{`
        .content-page-ref {
          background: #f0efec;
          min-height: 100vh;
          font-family: var(--font-instrument-sans), 'Instrument Sans',
            Arial, sans-serif;
          color: #111827;
        }

        .content-page-ref .admin-eyebrow {
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #9ca3af;
          font-family: var(--font-jetbrains-mono), 'JetBrains Mono',
            monospace;
          margin-bottom: 4px;
        }

        .content-page-ref .admin-page-title {
          font-family: var(--font-fraunces), 'Fraunces', Georgia, serif;
          font-size: 26px;
          line-height: 1.1;
          font-weight: 400;
          color: #111111;
          margin: 0 0 6px;
        }

        .content-page-ref .admin-page-sub {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
          margin: 0;
        }

        .content-page-ref .a-cc-top-bar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin: 4px 0 28px;
          gap: 16px;
        }

        .content-page-ref .a-cc-stats-row {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }

        .content-page-ref .a-cc-stat-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .content-page-ref .a-cc-stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          font-size: 16px;
        }

        .content-page-ref .a-cc-stat-num {
          font-family: var(--font-fraunces), 'Fraunces', Georgia, serif;
          font-size: 32px;
          line-height: 1;
          font-weight: 300;
          color: #111111;
        }

        .content-page-ref .a-cc-stat-label {
          font-size: 12px;
          color: #6b7280;
          margin-top: 6px;
          font-family: var(--font-jetbrains-mono), 'JetBrains Mono',
            monospace;
        }

        .content-page-ref .a-cc-tabs {
          display: flex;
          gap: 2px;
          background: #e5e7eb;
          border-radius: 8px;
          padding: 3px;
          margin-bottom: 24px;
          width: fit-content;
        }

        .content-page-ref .a-cc-tab {
          padding: 7px 18px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          user-select: none;
        }

        .content-page-ref .a-cc-tab.active {
          background: #ffffff;
          color: #111111;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .content-page-ref .a-cc-tab-count {
          background: #e5e7eb;
          color: #6b7280;
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 10px;
          font-family: var(--font-jetbrains-mono), 'JetBrains Mono',
            monospace;
          line-height: 1.4;
        }

        .content-page-ref .a-cc-tab.active .a-cc-tab-count {
          background: #f3f4f6;
          color: #374151;
        }

        .content-page-ref .a-cc-tab-count.a-cc-tab-count-warn {
          background: #fef3c7;
          color: #92400e;
        }

        .content-page-ref .a-cc-table-responsive {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .content-page-ref .a-cc-table-responsive .a-cc-table-head,
        .content-page-ref .a-cc-table-responsive .a-cc-table-row,
        .content-page-ref .a-cc-table-responsive .a-cc-track-header {
          min-width: 850px;
        }

        .content-page-ref .a-cc-approval-card-selected {
          border-color: #c9a14a;
          box-shadow: 0 0 0 2px rgba(201, 161, 74, 0.15);
        }

        .content-page-ref .a-cc-content-table {
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
        }

        .content-page-ref .a-cc-table-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid #f3f4f6;
        }

        .content-page-ref .a-cc-search-input,
        .content-page-ref .a-cc-filter-select,
        .content-page-ref .a-cc-form-input,
        .content-page-ref .a-cc-form-select,
        .content-page-ref .a-cc-form-textarea,
        .content-page-ref .a-cc-approval-note {
          background: #ffffff;
          color: #111111;
          border: 1.5px solid #e5e7eb;
          box-shadow: none;
        }

        .content-page-ref .a-cc-search-input {
          flex: 1 1 auto;
          max-width: 310px;
          padding: 7px 12px;
          border-radius: 5px;
          font-size: 13px;
          outline: none;
        }

        .content-page-ref .a-cc-filter-select {
          padding: 7px 10px;
          border-radius: 5px;
          font-size: 12px;
          font-family: var(--font-jetbrains-mono), 'JetBrains Mono',
            monospace;
          color: #374151;
          outline: none;
        }

        .content-page-ref .a-cc-search-input:focus,
        .content-page-ref .a-cc-filter-select:focus,
        .content-page-ref .a-cc-form-input:focus,
        .content-page-ref .a-cc-form-select:focus,
        .content-page-ref .a-cc-form-textarea:focus,
        .content-page-ref .a-cc-approval-note:focus {
          border-color: #c9a14a;
          outline: none;
        }

        .content-page-ref .a-cc-table-head {
          display: grid;
          grid-template-columns: 48px minmax(0, 1fr) 220px 80px 110px 130px;
          padding: 10px 20px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          column-gap: 0;
        }

        .content-page-ref .a-cc-table-head span {
          font-size: 10px;
          font-family: var(--font-jetbrains-mono), 'JetBrains Mono',
            monospace;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .content-page-ref .a-cc-track-header {
          padding: 8px 20px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .content-page-ref .a-cc-track-header-label,
        .content-page-ref .a-cc-track-header-meta,
        .content-page-ref .a-cc-module-num,
        .content-page-ref .a-cc-module-sub,
        .content-page-ref .a-cc-tier-label,
        .content-page-ref .a-cc-badge,
        .content-page-ref .a-cc-pipeline-step-num,
        .content-page-ref .a-cc-pipeline-step-status,
        .content-page-ref .a-cc-approval-card-meta,
        .content-page-ref .a-cc-pipeline-badge,
        .content-page-ref .a-cc-form-label,
        .content-page-ref .a-cc-form-hint {
          font-family: var(--font-jetbrains-mono), 'JetBrains Mono',
            monospace;
        }

        .content-page-ref .a-cc-track-header-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .content-page-ref .a-cc-track-header-meta {
          font-size: 11px;
          color: #9ca3af;
        }

        .content-page-ref .a-cc-table-row {
          display: grid;
          grid-template-columns: 48px minmax(0, 1fr) 220px 80px 110px 130px;
          align-items: center;
          padding: 13px 20px;
          border-bottom: 1px solid #f3f4f6;
          transition: background 0.1s;
        }

        .content-page-ref .a-cc-table-row:hover {
          background: #fafafa;
        }

        .content-page-ref .a-cc-table-row:last-child {
          border-bottom: none;
        }

        .content-page-ref .a-cc-module-num {
          font-size: 11px;
          color: #9ca3af;
          font-weight: 600;
        }

        .content-page-ref .a-cc-module-title {
          font-size: 13px;
          line-height: 1.35;
          font-weight: 600;
          color: #111111;
          margin-bottom: 2px;
        }

        .content-page-ref .a-cc-module-sub {
          font-size: 11px;
          color: #9ca3af;
          line-height: 1.45;
        }

        .content-page-ref .a-cc-track-pill {
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          font-weight: 600;
          border: 1px solid transparent;
          line-height: 1.3;
        }

        .content-page-ref .a-cc-track-free {
          background: #f0fdf4;
          color: #15803d;
          border-color: #86efac;
        }

        .content-page-ref .a-cc-track-community {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #93c5fd;
        }

        .content-page-ref .a-cc-track-prep {
          background: #fdf4ff;
          color: #7e22ce;
          border-color: #d8b4fe;
        }

        .content-page-ref .a-cc-tier-label {
          font-size: 11px;
          color: #6b7280;
        }

        .content-page-ref .a-cc-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 9px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          border: 1px solid;
          line-height: 1.3;
          white-space: nowrap;
        }

        .content-page-ref .a-cc-badge-published {
          background: #dcfce7;
          color: #14532d;
          border-color: #86efac;
        }

        .content-page-ref .a-cc-badge-pending {
          background: #fef3c7;
          color: #78350f;
          border-color: #fcd34d;
        }

        .content-page-ref .a-cc-badge-draft {
          background: #f3f4f6;
          color: #374151;
          border-color: #d1d5db;
        }

        .content-page-ref .a-cc-row-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .content-page-ref .a-cc-btn-ghost,
        .content-page-ref .a-cc-btn-accent,
        .content-page-ref .a-cc-btn-primary,
        .content-page-ref .a-cc-btn-icon {
          appearance: none;
          -webkit-appearance: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border-radius: 5px;
          font-family: var(--font-instrument-sans), 'Instrument Sans',
            Arial, sans-serif;
          font-size: 12px;
          line-height: 1;
          white-space: nowrap;
          cursor: pointer;
          text-decoration: none;
        }

        .content-page-ref .a-cc-btn-ghost {
          background: transparent;
          color: #374151;
          border: 1.5px solid #d1d5db;
          padding: 6px 12px;
        }

        .content-page-ref .a-cc-btn-ghost:hover {
          border-color: #9ca3af;
          background: #f9fafb;
        }

        .content-page-ref .a-cc-btn-accent {
          background: #c9a14a;
          color: #111111;
          border: none;
          padding: 7px 14px;
          font-weight: 600;
        }

        .content-page-ref .a-cc-btn-accent:hover {
          background: #b8913f;
        }

        .content-page-ref .a-cc-btn-primary {
          background: #111827;
          color: #ffffff;
          border: none;
          padding: 7px 14px;
          font-weight: 600;
        }

        .content-page-ref .a-cc-btn-primary:hover {
          background: #1f2937;
        }

        .content-page-ref .a-cc-btn-primary:disabled,
        .content-page-ref .a-cc-btn-ghost:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .content-page-ref .a-cc-btn-icon {
          background: transparent;
          border: 1.5px solid #e5e7eb;
          padding: 5px 9px;
          color: #6b7280;
        }

        .content-page-ref .a-cc-btn-icon:hover {
          border-color: #9ca3af;
          color: #374151;
          background: #f9fafb;
        }

        .content-page-ref .a-cc-btn-icon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .content-page-ref .a-cc-sens-note {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: #fffbeb;
          border: 1px solid #fcd34d;
          border-radius: 6px;
          font-size: 12px;
          color: #78350f;
          margin-bottom: 16px;
        }

        .content-page-ref .a-cc-pipeline-steps {
          display: flex;
          gap: 0;
          margin-bottom: 20px;
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .content-page-ref .a-cc-pipeline-step {
          flex: 1 1 0;
          padding: 12px 16px;
          text-align: center;
          border-right: 1px solid #e5e7eb;
          background: #ffffff;
        }

        .content-page-ref .a-cc-pipeline-step:last-child {
          border-right: none;
        }

        .content-page-ref .a-cc-pipeline-step-done {
          background: #f0fdf4;
        }

        .content-page-ref .a-cc-pipeline-step-active {
          background: #fffbeb;
        }

        .content-page-ref .a-cc-pipeline-step-label {
          font-size: 11px;
          font-weight: 600;
          color: #374151;
        }

        .content-page-ref .a-cc-pipeline-step-num {
          font-size: 10px;
          color: #9ca3af;
          margin-bottom: 3px;
        }

        .content-page-ref .a-cc-pipeline-step-status {
          font-size: 10px;
          margin-top: 3px;
        }

        .content-page-ref
          .a-cc-pipeline-step.a-cc-pipeline-step-done
          .a-cc-pipeline-step-status {
          color: #15803d;
        }

        .content-page-ref
          .a-cc-pipeline-step.a-cc-pipeline-step-active
          .a-cc-pipeline-step-status {
          color: #d97706;
        }

        .content-page-ref .a-cc-approval-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .content-page-ref .a-cc-approval-card-high {
          border-left: 4px solid #d97706;
        }

        .content-page-ref .a-cc-approval-card-low {
          border-left: 4px solid #16a34a;
        }

        .content-page-ref .a-cc-approval-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .content-page-ref .a-cc-approval-card-title {
          font-size: 15px;
          font-weight: 600;
          color: #111111;
          margin-bottom: 4px;
        }

        .content-page-ref .a-cc-approval-card-meta {
          font-size: 11px;
          color: #6b7280;
        }

        .content-page-ref .a-cc-approval-card-pipeline {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .content-page-ref .a-cc-pipeline-badge {
          font-size: 10px;
          padding: 3px 9px;
          border-radius: 3px;
          font-weight: 600;
        }

        .content-page-ref .a-cc-pb-done {
          background: #dcfce7;
          color: #15803d;
        }

        .content-page-ref .a-cc-pb-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .content-page-ref .a-cc-pb-waiting {
          background: #f3f4f6;
          color: #9ca3af;
        }

        .content-page-ref .a-cc-approval-card-quote {
          background: #f9fafb;
          border-left: 3px solid #d1d5db;
          border-radius: 6px;
          padding: 12px 16px;
          margin-bottom: 14px;
          font-size: 13px;
          color: #374151;
          line-height: 1.6;
          font-style: italic;
        }

        .content-page-ref .a-cc-approval-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          border-top: 1px solid #f3f4f6;
          margin-top: 14px;
          padding-top: 14px;
        }

        .content-page-ref .a-cc-approval-note {
          flex: 1 1 auto;
          padding: 7px 12px;
          border-radius: 5px;
          font-size: 12px;
          color: #374151;
          outline: none;
        }

        .content-page-ref .a-cc-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .content-page-ref .a-cc-modal {
          width: 720px;
          max-width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .content-page-ref .a-cc-modal-head {
          position: sticky;
          top: 0;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 28px 16px;
          border-bottom: 1px solid #f3f4f6;
          background: #ffffff;
        }

        .content-page-ref .a-cc-modal-title {
          font-family: var(--font-fraunces), 'Fraunces', Georgia, serif;
          font-size: 20px;
          font-weight: 400;
          color: #111111;
        }

        .content-page-ref .a-cc-modal-close {
          background: none;
          border: none;
          color: #9ca3af;
          font-size: 18px;
          line-height: 1;
          padding: 4px;
          cursor: pointer;
        }

        .content-page-ref .a-cc-modal-body {
          padding: 24px 28px;
        }

        .content-page-ref .a-cc-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .content-page-ref .a-cc-form-row.a-cc-form-row-full {
          grid-template-columns: 1fr;
        }

        .content-page-ref .a-cc-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .content-page-ref .a-cc-form-label {
          font-size: 12px;
          color: #374151;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .content-page-ref .a-cc-form-input,
        .content-page-ref .a-cc-form-select,
        .content-page-ref .a-cc-form-textarea {
          width: 100%;
          padding: 9px 12px;
          border-radius: 5px;
          font-size: 13px;
        }

        .content-page-ref .a-cc-form-textarea {
          min-height: 120px;
          resize: vertical;
          line-height: 1.6;
        }

        .content-page-ref .a-cc-form-hint {
          font-size: 11px;
          color: #9ca3af;
        }

        .content-page-ref .a-cc-modal-foot {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 28px 24px;
          border-top: 1px solid #f3f4f6;
        }

        .content-page-ref .a-cc-toast {
          position: fixed;
          right: 28px;
          bottom: 28px;
          z-index: 9999;
          max-width: 380px;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          transform: translateY(20px);
          opacity: 0;
          transition: all 0.25s;
          pointer-events: none;
        }

        .content-page-ref .a-cc-toast.show {
          transform: translateY(0);
          opacity: 1;
        }

        .content-page-ref .a-cc-toast-success {
          background: #111827;
          color: #4ade80;
        }

        .content-page-ref .a-cc-toast-warn {
          background: #111827;
          color: #fbbf24;
        }

        .content-page-ref .a-cc-toast-error {
          background: #dc2626;
          color: #ffffff;
        }

        /* Loading spinner */
        .content-page-ref .a-cc-loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top-color: #c9a14a;
          border-radius: 50%;
          animation: a-cc-spin 0.8s linear infinite;
          margin: 0 auto;
        }

        @keyframes a-cc-spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1100px) {
          .content-page-ref .a-cc-stats-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .content-page-ref .a-cc-table-head,
          .content-page-ref .a-cc-table-row {
            grid-template-columns: 60px minmax(0, 1fr) 180px 80px;
          }

          .content-page-ref .a-cc-table-head span:nth-child(n + 5),
          .content-page-ref .a-cc-table-row > *:nth-child(n + 5) {
            display: none;
          }
        }

        @media (max-width: 700px) {
          .content-page-ref {
            padding: 24px 16px;
          }

          .content-page-ref .a-cc-top-bar,
          .content-page-ref .a-cc-table-toolbar,
          .content-page-ref .a-cc-approval-card-header,
          .content-page-ref .a-cc-approval-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .content-page-ref .a-cc-stats-row,
          .content-page-ref .a-cc-form-row {
            grid-template-columns: 1fr;
          }

          .content-page-ref .a-cc-tabs,
          .content-page-ref .a-cc-pipeline-steps {
            width: 100%;
            overflow-x: auto;
          }

          .content-page-ref .a-cc-table-head,
          .content-page-ref .a-cc-table-row {
            grid-template-columns: 44px minmax(0, 1fr);
          }

          .content-page-ref .a-cc-table-head span:nth-child(n + 3),
          .content-page-ref .a-cc-table-row > *:nth-child(n + 3) {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
