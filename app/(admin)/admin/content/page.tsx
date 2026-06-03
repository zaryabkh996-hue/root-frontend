'use client';

import { useEffect, useMemo, useState } from 'react';

type TabKey = 'all' | 'pending' | 'tracks';
type ModuleTrack =
  | 'Orientation'
  | 'History'
  | 'Culture'
  | 'Logistics'
  | 'Emotional'
  | 'Citizenship';
type ModuleTier = 'Free' | 'Community' | 'Preparation';
type FilterStatus = 'published' | 'pending' | 'draft';
type BadgeStatus = 'published' | 'pending' | 'draft';
type ToastType = 'success' | 'warn' | 'error';

interface ModuleRow {
  num: string;
  title: string;
  sub: string;
  track: ModuleTrack;
  tier: ModuleTier;
  filterStatus: FilterStatus;
  badgeStatus: BadgeStatus;
  action: 'view' | 'approve';
  editLabel: string;
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

interface ApprovalCard {
  num: string;
  title: string;
  meta: string;
  badge: string;
  pipeline: Array<{ label: string; tone: 'done' | 'pending' | 'waiting' }>;
  quote: string;
  noteId: string;
  kind: 'high' | 'low';
  actionLabel: string;
  actionDisabled?: boolean;
  actionTitle?: string;
  actionStyle?: React.CSSProperties;
}

const trackOrder: ModuleTrack[] = [
  'Orientation',
  'History',
  'Culture',
  'Logistics',
  'Emotional',
  'Citizenship',
];

const trackMeta: Record<
  ModuleTrack,
  { range: string; color: string; pillClass: string }
> = {
  Orientation: {
    range: 'Modules 1–6 · Free tier · 6 modules',
    color: '#15803d',
    pillClass: 'a-cc-track-pill a-cc-track-free',
  },
  History: {
    range: 'Modules 7–14 · Community $27/mo · 8 modules',
    color: '#1d4ed8',
    pillClass: 'a-cc-track-pill a-cc-track-community',
  },
  Culture: {
    range: 'Modules 15–22 · Community $27/mo · 8 modules',
    color: '#1d4ed8',
    pillClass: 'a-cc-track-pill a-cc-track-community',
  },
  Logistics: {
    range: 'Modules 23–27 · Preparation $67/mo · 5 modules',
    color: '#7e22ce',
    pillClass: 'a-cc-track-pill a-cc-track-prep',
  },
  Emotional: {
    range: 'Modules 28–32 · Preparation $67/mo · 5 modules',
    color: '#7e22ce',
    pillClass: 'a-cc-track-pill a-cc-track-prep',
  },
  Citizenship: {
    range: 'Modules 33–37 · Preparation $67/mo · 5 modules',
    color: '#7e22ce',
    pillClass: 'a-cc-track-pill a-cc-track-prep',
  },
};

const moduleRows: ModuleRow[] = [
  {
    num: '1',
    title: 'Welcome Home — What This Journey Is',
    sub: '45 min · Introduction',
    track: 'Orientation',
    tier: 'Free',
    filterStatus: 'published',
    badgeStatus: 'published',
    action: 'view',
    editLabel: 'Welcome Home — What This Journey Is',
  },
  {
    num: '2',
    title: 'The Wound That Travels — Intergenerational Trauma',
    sub: '60 min · Foundation',
    track: 'Orientation',
    tier: 'Free',
    filterStatus: 'published',
    badgeStatus: 'published',
    action: 'view',
    editLabel: 'The Wound That Travels',
  },
  {
    num: '3',
    title: 'DNA Results — Percentages Without People',
    sub: '45 min · Identity',
    track: 'Orientation',
    tier: 'Free',
    filterStatus: 'published',
    badgeStatus: 'published',
    action: 'view',
    editLabel: 'DNA Results',
  },
  {
    num: '4',
    title: "Am I African Enough? — The Question That Won't Disappear",
    sub: '50 min · Identity',
    track: 'Orientation',
    tier: 'Free',
    filterStatus: 'published',
    badgeStatus: 'published',
    action: 'view',
    editLabel: 'Am I African Enough?',
  },
  {
    num: '5',
    title: 'The Six Doorways — West African Peoples & Regions',
    sub: '55 min · Geography',
    track: 'Orientation',
    tier: 'Free',
    filterStatus: 'published',
    badgeStatus: 'published',
    action: 'view',
    editLabel: 'The Six Doorways',
  },
  {
    num: '6',
    title: 'Setting Your Intention — Why You Are Going',
    sub: '30 min · Reflection',
    track: 'Orientation',
    tier: 'Free',
    filterStatus: 'published',
    badgeStatus: 'published',
    action: 'view',
    editLabel: 'Setting Your Intention',
  },
  {
    num: '7',
    title: 'Before the Ships — The Kingdoms of West Africa',
    sub: '70 min · History',
    track: 'History',
    tier: 'Community',
    filterStatus: 'published',
    badgeStatus: 'published',
    action: 'view',
    editLabel: 'Before the Ships',
  },
  {
    num: '8',
    title: 'The Transatlantic Trade — What Actually Happened',
    sub: '75 min · History · High sensitivity',
    track: 'History',
    tier: 'Community',
    filterStatus: 'published',
    badgeStatus: 'published',
    action: 'view',
    editLabel: 'The Transatlantic Trade',
  },
  {
    num: '9',
    title: 'The Forts & Castles — Cape Coast and Elmina',
    sub: '65 min · Sacred Sites',
    track: 'History',
    tier: 'Community',
    filterStatus: 'published',
    badgeStatus: 'published',
    action: 'view',
    editLabel: 'The Forts and Castles',
  },
  {
    num: '10',
    title: 'Year of Return — What It Meant and What It Left',
    sub: '60 min · Modern History',
    track: 'History',
    tier: 'Community',
    filterStatus: 'published',
    badgeStatus: 'published',
    action: 'view',
    editLabel: 'Year of Return',
  },
  {
    num: '11–14',
    title: 'History Track — Modules 11 to 14',
    sub: 'Resistance · Pan-Africanism · Diaspora policy · AU Sixth Region',
    track: 'History',
    tier: 'Community',
    filterStatus: 'published',
    badgeStatus: 'published',
    action: 'view',
    editLabel: 'History Track — Modules 11 to 14',
  },
  {
    num: '15–22',
    title: 'Culture Track — Modules 15 to 22',
    sub: 'Akan protocols · Twi language · Dress · Food · Festival calendar · Community norms · Grief rituals · Spiritual practices',
    track: 'Culture',
    tier: 'Community',
    filterStatus: 'published',
    badgeStatus: 'published',
    action: 'view',
    editLabel: 'Culture Track — Modules 15 to 22',
  },
  {
    num: '23–27',
    title: 'Logistics Track — Modules 23 to 27',
    sub: 'Flights & costs · Accommodation · Visa & citizenship · Health & vaccinations · Budget planning',
    track: 'Logistics',
    tier: 'Preparation',
    filterStatus: 'published',
    badgeStatus: 'published',
    action: 'view',
    editLabel: 'Logistics Track — Modules 23 to 27',
  },
  {
    num: '28',
    title: 'Before You Arrive — Emotional Preparation',
    sub: '80 min · Emotional · High sensitivity ⚠️',
    track: 'Emotional',
    tier: 'Preparation',
    filterStatus: 'pending',
    badgeStatus: 'published',
    action: 'view',
    editLabel: 'Before You Arrive',
  },
  {
    num: '29',
    title: 'Module 5.4 · Holding Space for Grief',
    sub: '90 min · Reflection Lab · High sensitivity ⚠️',
    track: 'Emotional',
    tier: 'Preparation',
    filterStatus: 'pending',
    badgeStatus: 'pending',
    action: 'approve',
    editLabel: 'Holding Space for Grief',
  },
  {
    num: '30–32',
    title: 'Emotional Track — Modules 30 to 32',
    sub: 'In-country support · Processing what you find · Re-entry and return',
    track: 'Emotional',
    tier: 'Preparation',
    filterStatus: 'published',
    badgeStatus: 'published',
    action: 'view',
    editLabel: 'Emotional Track — Modules 30 to 32',
  },
  {
    num: '33',
    title: 'Module 2.6 · Festival Calendar & Protocol Practice',
    sub: '55 min · Protocol Practice · Cultural advisor review in progress',
    track: 'Citizenship',
    tier: 'Preparation',
    filterStatus: 'pending',
    badgeStatus: 'pending',
    action: 'approve',
    editLabel: 'Festival Calendar',
  },
  {
    num: '34–37',
    title: 'Citizenship Track — Modules 34 to 37',
    sub: 'Ghana citizenship process · PANAFEST · Right of Abode · Building roots',
    track: 'Citizenship',
    tier: 'Preparation',
    filterStatus: 'published',
    badgeStatus: 'published',
    action: 'view',
    editLabel: 'Citizenship Track — Modules 34 to 37',
  },
];

const trackSummary: TrackSummaryRow[] = [
  {
    name: 'Orientation',
    desc: 'Introduction to the heritage journey',
    tier: 'Free',
    tierBg: '#f0fdf4',
    tierColor: '#15803d',
    tierBorder: '#86efac',
    price: '$0',
    modules: 6,
    published: 6,
    pending: 0,
  },
  {
    name: 'History',
    desc: 'Pre-colonial kingdoms through to now',
    tier: 'Community',
    tierBg: '#eff6ff',
    tierColor: '#1d4ed8',
    tierBorder: '#93c5fd',
    price: '$27/mo',
    modules: 8,
    published: 8,
    pending: 0,
  },
  {
    name: 'Culture',
    desc: 'Protocols, language, dress, food, community',
    tier: 'Community',
    tierBg: '#eff6ff',
    tierColor: '#1d4ed8',
    tierBorder: '#93c5fd',
    price: '$27/mo',
    modules: 8,
    published: 7,
    pending: 1,
  },
  {
    name: 'Logistics',
    desc: 'Flights, costs, visa, health, budget',
    tier: 'Preparation',
    tierBg: '#fdf4ff',
    tierColor: '#7e22ce',
    tierBorder: '#d8b4fe',
    price: '$67/mo',
    modules: 5,
    published: 5,
    pending: 0,
  },
  {
    name: 'Emotional',
    desc: 'Emotional prep, in-country support, re-entry',
    tier: 'Preparation',
    tierBg: '#fdf4ff',
    tierColor: '#7e22ce',
    tierBorder: '#d8b4fe',
    price: '$67/mo',
    modules: 5,
    published: 4,
    pending: 1,
  },
  {
    name: 'Citizenship',
    desc: 'Ghana citizenship process · PANAFEST · Right of Abode',
    tier: 'Preparation',
    tierBg: '#fdf4ff',
    tierColor: '#7e22ce',
    tierBorder: '#d8b4fe',
    price: '$67/mo',
    modules: 5,
    published: 5,
    pending: 0,
  },
];

const approvalCards: ApprovalCard[] = [
  {
    num: '29',
    title: 'Module 5.4 · Holding Space for Grief · Reflection Lab',
    meta: 'Track: Emotional · Tier: Preparation · Sensitivity: 🔴 High · Est. read: 90 min',
    badge: '⏳ Awaiting founder sign-off',
    pipeline: [
      { label: '✓ Authored', tone: 'done' },
      { label: '✓ Auto checks', tone: 'done' },
      { label: '✓ Peer reviewed', tone: 'done' },
      { label: '✓ Cultural advisor', tone: 'done' },
      { label: '⏳ Founder sign-off', tone: 'pending' },
    ],
    quote:
      '"This module guides members through preparing emotionally for the Door of No Return experience. It includes grounding exercises, journaling prompts, and a post-visit integration practice…"',
    noteId: 'note-29',
    kind: 'high',
    actionLabel: 'Approve & publish',
  },
  {
    num: '33',
    title: 'Module 2.6 · Festival Calendar & Protocol Practice',
    meta: 'Track: Citizenship · Tier: Preparation · Sensitivity: 🟢 Low · Est. read: 55 min',
    badge: '⏳ Cultural advisor in progress',
    pipeline: [
      { label: '✓ Authored', tone: 'done' },
      { label: '✓ Auto checks', tone: 'done' },
      { label: '✓ Peer reviewed', tone: 'done' },
      { label: '⏳ Cultural advisor', tone: 'pending' },
      { label: '— Founder sign-off', tone: 'waiting' },
    ],
    quote:
      `"A practical guide to Ghana's major festivals — Homowo, PANAFEST, Chale Wote — with protocol guidance for diaspora visitors attending for the first time…"`,
    noteId: 'note-33',
    kind: 'low',
    actionLabel: 'Awaiting cultural advisor',
    actionDisabled: true,
    actionTitle: 'Waiting for cultural advisor to complete review',
    actionStyle: { background: '#6b7280', cursor: 'not-allowed' },
  },
];

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
};

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Add new module');
  const [form, setForm] = useState(initialForm);
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(
    null,
  );

  const showToast = (msg: string, type: ToastType = 'success') => {
    setToast({ msg, type });
  };

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const filteredModules = useMemo(() => {
    return moduleRows.filter((module) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        module.title.toLowerCase().includes(query) ||
        module.sub.toLowerCase().includes(query);
      const matchesTrack = !trackFilter || module.track === trackFilter;
      const matchesStatus =
        !statusFilter || module.filterStatus === statusFilter;

      return matchesSearch && matchesTrack && matchesStatus;
    });
  }, [search, statusFilter, trackFilter]);

  const groupedModules = useMemo(() => {
    return trackOrder
      .map((track) => ({
        track,
        meta: trackMeta[track],
        modules: filteredModules.filter((module) => module.track === track),
      }))
      .filter((group) => group.modules.length > 0);
  }, [filteredModules]);

  const openAddModal = () => {
    setModalTitle('Add new module');
    setForm(initialForm);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const openEditModal = (module: ModuleRow) => {
    setModalTitle(`Edit module ${module.num} — ${module.editLabel}`);
    setForm((current) => ({
      ...current,
      num: module.num.replace(/[^\d]/g, ''),
      time: module.sub.split(' min')[0] ?? '',
      title: module.title,
      track: module.track,
      tier:
        module.tier === 'Free'
          ? 'free'
          : module.tier === 'Community'
            ? 'community'
            : 'preparation',
      type: module.sub.includes('Reflection Lab')
        ? 'Reflection Lab'
        : module.sub.includes('Protocol Practice')
          ? 'Protocol Practice'
          : 'Reading',
      sens: module.sub.includes('High sensitivity') ? 'high' : 'low',
    }));
    setModalOpen(true);
    showToast(`Module loaded for editing · ID ${module.num}`, 'success');
  };

  const saveDraft = () => {
    if (!form.title.trim()) {
      showToast('Add a title before saving', 'warn');
      return;
    }

    setModalOpen(false);
    showToast(`Draft saved · "${form.title}"`, 'success');
  };

  const submitModule = () => {
    if (!form.title.trim() || !form.track) {
      showToast('Title and track are required', 'warn');
      return;
    }

    setModalOpen(false);
    showToast(`Module submitted for review · "${form.title}"`, 'success');
  };

  const previewModule = (num: string) => {
    showToast(`Preview module ${num}`, 'success');
  };

  const approveModule = (num: string, title: string) => {
    showToast(`Module ${num} · ${title} approved & published`, 'success');
  };

  const approveAndPublish = (num: string, title: string) => {
    showToast(`Module ${num} · ${title} approved & published`, 'success');
  };

  const requestRevision = (num: string, title: string, noteId: string) => {
    const noteValue =
      (
        document.getElementById(noteId) as HTMLInputElement | null
      )?.value.trim() ?? '';

    showToast(
      noteValue
        ? `Revision requested for module ${num} · ${title}`
        : `Revision requested for module ${num} · ${title}`,
      'warn',
    );
  };

  return (
    <main className="admin-main content-page-ref">
      <div className="admin-eyebrow">Content Management</div>

      <div className="a-cc-top-bar">
        <div>
          <h1 className="admin-page-title">Modules &amp; Content</h1>
          <p className="admin-page-sub">
            Manage all 37 learning modules across 6 tracks · 5-step publish
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

      <div className="a-cc-stats-row">
        <div className="a-cc-stat-card">
          <div className="a-cc-stat-icon" style={{ background: '#f0f9ff' }}>
            📚
          </div>
          <div className="a-cc-stat-num">37</div>
          <div className="a-cc-stat-label">Total modules</div>
        </div>

        <div className="a-cc-stat-card">
          <div className="a-cc-stat-icon" style={{ background: '#f0fdf4' }}>
            ✅
          </div>
          <div className="a-cc-stat-num">35</div>
          <div className="a-cc-stat-label">Published</div>
        </div>

        <div className="a-cc-stat-card">
          <div className="a-cc-stat-icon" style={{ background: '#fffbeb' }}>
            ⏳
          </div>
          <div className="a-cc-stat-num">2</div>
          <div className="a-cc-stat-label">Pending approval</div>
        </div>

        <div className="a-cc-stat-card">
          <div className="a-cc-stat-icon" style={{ background: '#fdf4ff' }}>
            ✏️
          </div>
          <div className="a-cc-stat-num">0</div>
          <div className="a-cc-stat-label">Drafts</div>
        </div>
      </div>

      <div className="a-cc-tabs">
        <div
          className={`a-cc-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All modules <span className="a-cc-tab-count">37</span>
        </div>

        <div
          className={`a-cc-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending approval{' '}
          <span className="a-cc-tab-count a-cc-tab-count-warn">2</span>
        </div>

        <div
          className={`a-cc-tab ${activeTab === 'tracks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracks')}
        >
          Tracks &amp; tiers
        </div>
      </div>

      {activeTab === 'all' && (
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
                <option value="Orientation">Orientation</option>
                <option value="History">History</option>
                <option value="Culture">Culture</option>
                <option value="Logistics">Logistics</option>
                <option value="Emotional">Emotional</option>
                <option value="Citizenship">Citizenship</option>
              </select>

              <select
                className="a-cc-filter-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">All statuses</option>
                <option value="published">Published</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
              </select>
            </div>

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
                No modules match your filters.
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
                    {group.meta.range}
                  </span>
                </div>

                {group.modules.map((module) => (
                  <div key={`${group.track}-${module.num}`} className="a-cc-table-row">
                    <span className="a-cc-module-num">{module.num}</span>

                    <div>
                      <div className="a-cc-module-title">{module.title}</div>
                      <div className="a-cc-module-sub">{module.sub}</div>
                    </div>

                    <div>
                      <span className={group.meta.pillClass}>{module.track}</span>
                    </div>

                    <div className="a-cc-tier-label">{module.tier}</div>

                    <div>
                      {module.badgeStatus === 'published' && (
                        <span className="a-cc-badge a-cc-badge-published">
                          ● Published
                        </span>
                      )}
                      {module.badgeStatus === 'pending' && (
                        <span className="a-cc-badge a-cc-badge-pending">
                          ⏳ Pending
                        </span>
                      )}
                      {module.badgeStatus === 'draft' && (
                        <span className="a-cc-badge a-cc-badge-draft">
                          ● Draft
                        </span>
                      )}
                    </div>

                    <div className="a-cc-row-actions">
                      <button
                        className="a-cc-btn-icon"
                        onClick={() => openEditModal(module)}
                      >
                        ✏️ Edit
                      </button>

                      {module.action === 'approve' ? (
                        <button
                          className="a-cc-btn-accent"
                          style={{ padding: '5px 10px', fontSize: '11px' }}
                          onClick={() =>
                            approveModule(module.num, module.editLabel)
                          }
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          className="a-cc-btn-icon"
                          onClick={() => previewModule(module.num)}
                        >
                          👁 View
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pending' && (
        <div>
          <div className="a-cc-sens-note">
            ⚠️ Sensitive modules require founder sign-off. Stage 1.4 and Stage
            5 modules go through all 5 steps before publish.
          </div>

          <div className="a-cc-pipeline-steps">
            <div className="a-cc-pipeline-step a-cc-pipeline-step-done">
              <div className="a-cc-pipeline-step-num">Step 1</div>
              <div className="a-cc-pipeline-step-label">Author</div>
              <div className="a-cc-pipeline-step-status">✓ Complete</div>
            </div>
            <div className="a-cc-pipeline-step a-cc-pipeline-step-done">
              <div className="a-cc-pipeline-step-num">Step 2</div>
              <div className="a-cc-pipeline-step-label">Auto checks</div>
              <div className="a-cc-pipeline-step-status">✓ Complete</div>
            </div>
            <div className="a-cc-pipeline-step a-cc-pipeline-step-done">
              <div className="a-cc-pipeline-step-num">Step 3</div>
              <div className="a-cc-pipeline-step-label">Peer review</div>
              <div className="a-cc-pipeline-step-status">✓ Complete</div>
            </div>
            <div className="a-cc-pipeline-step a-cc-pipeline-step-active">
              <div className="a-cc-pipeline-step-num">Step 4</div>
              <div className="a-cc-pipeline-step-label">Cultural advisor</div>
              <div className="a-cc-pipeline-step-status">⏳ In progress</div>
            </div>
            <div className="a-cc-pipeline-step">
              <div className="a-cc-pipeline-step-num">Step 5</div>
              <div className="a-cc-pipeline-step-label">Founder sign-off</div>
              <div
                className="a-cc-pipeline-step-status"
                style={{ color: '#9ca3af' }}
              >
                Waiting
              </div>
            </div>
          </div>

          {approvalCards.map((card) => (
            <div
              key={card.num}
              className={`a-cc-approval-card ${
                card.kind === 'high'
                  ? 'a-cc-approval-card-high'
                  : 'a-cc-approval-card-low'
              }`}
            >
              <div className="a-cc-approval-card-header">
                <div>
                  <div className="a-cc-approval-card-title">{card.title}</div>
                  <div className="a-cc-approval-card-meta">{card.meta}</div>
                </div>

                <span className="a-cc-badge a-cc-badge-pending">
                  {card.badge}
                </span>
              </div>

              <div className="a-cc-approval-card-pipeline">
                {card.pipeline.map((step) => (
                  <span
                    key={step.label}
                    className={`a-cc-pipeline-badge ${
                      step.tone === 'done'
                        ? 'a-cc-pb-done'
                        : step.tone === 'pending'
                          ? 'a-cc-pb-pending'
                          : 'a-cc-pb-waiting'
                    }`}
                  >
                    {step.label}
                  </span>
                ))}
              </div>

              <div className="a-cc-approval-card-quote">{card.quote}</div>

              <div className="a-cc-approval-actions">
                <input
                  type="text"
                  className="a-cc-approval-note"
                  placeholder="Add a revision note (optional)…"
                  id={card.noteId}
                />

                <button
                  className="a-cc-btn-ghost"
                  onClick={() =>
                    requestRevision(card.num, card.title, card.noteId)
                  }
                >
                  Request revision
                </button>

                <button
                  className="a-cc-btn-primary"
                  style={card.actionStyle}
                  disabled={card.actionDisabled}
                  title={card.actionTitle}
                  onClick={() =>
                    !card.actionDisabled &&
                    approveAndPublish(card.num, card.title)
                  }
                >
                  {!card.actionDisabled && (
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
                  )}
                  {card.actionLabel}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'tracks' && (
        <div>
          <div className="a-cc-content-table">
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

            {trackSummary.map((track) => (
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
      )}

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
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        track: event.target.value,
                      }))
                    }
                  >
                    <option value="">Select track…</option>
                    <option>Orientation</option>
                    <option>History</option>
                    <option>Culture</option>
                    <option>Logistics</option>
                    <option>Emotional</option>
                    <option>Citizenship</option>
                  </select>
                </div>

                <div className="a-cc-form-group">
                  <label className="a-cc-form-label">
                    Tier (access level)
                  </label>
                  <select
                    className="a-cc-form-select"
                    value={form.tier}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        tier: event.target.value,
                      }))
                    }
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

              <div className="a-cc-form-row a-cc-form-row-full">
                <div className="a-cc-form-group">
                  <label className="a-cc-form-label">Slug (URL path)</label>
                  <input
                    type="text"
                    className="a-cc-form-input"
                    placeholder="e.g. door-of-no-return-preparation"
                    value={form.slug}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        slug: event.target.value,
                      }))
                    }
                  />
                  <span className="a-cc-form-hint">
                    This becomes the URL:
                    {' '}
                    /modules/door-of-no-return-preparation
                  </span>
                </div>
              </div>
            </div>

            <div className="a-cc-modal-foot">
              <button className="a-cc-btn-ghost" onClick={closeModal}>
                Cancel
              </button>
              <button className="a-cc-btn-ghost" onClick={saveDraft}>
                Save as draft
              </button>
              <button className="a-cc-btn-primary" onClick={submitModule}>
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
                Submit for review
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`a-cc-toast ${toast ? 'show' : ''} ${
          toast ? `a-cc-toast-${toast.type}` : ''
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
          grid-template-columns: 48px minmax(0, 1fr) 130px 120px 110px 130px;
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
          grid-template-columns: 48px minmax(0, 1fr) 130px 120px 110px 130px;
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

        @media (max-width: 1100px) {
          .content-page-ref .a-cc-stats-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .content-page-ref .a-cc-table-head,
          .content-page-ref .a-cc-table-row {
            grid-template-columns: 60px minmax(0, 1fr) 110px 100px;
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
