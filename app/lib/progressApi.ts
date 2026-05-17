// ── Progress API service ───────────────────────────────────────────────────
// All calls go to the Laravel backend with the Sanctum Bearer token.
// Failures are silent (returns null / false) so the UI is never blocked.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Shape returned from the backend ────────────────────────────────────────
export interface RemoteProgress {
  completed_modules: string[];
  current_module_id: string;
  journal_entries: Record<string, string>;
  feedback_entries: Record<string, string>;
  unlocked_stages: number[];
  completed_stages: number[];
  afro_score: number;
  user_persona: string;
  lifecycle_phase: string;
  started_at: string | null;
  last_active_at: string | null;
}

// ── Fetch progress from DB ──────────────────────────────────────────────────
export async function fetchRemoteProgress(): Promise<RemoteProgress | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/progress`, {
      headers: authHeaders(),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as RemoteProgress | null;
  } catch {
    return null;
  }
}

// ── Full progress sync (used on initial save and periodically) ──────────────
export async function syncProgressToServer(payload: Partial<RemoteProgress>): Promise<void> {
  const token = getToken();
  if (!token) return;

  try {
    await fetch(`${API_BASE_URL}/progress`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch {
    // Offline — localStorage already has the data, will sync next session
  }
}

// ── Complete a module — granular, fast ─────────────────────────────────────
export async function remoteCompleteModule(payload: {
  module_id: string;
  next_module_id: string | null;
  unlocked_stages: number[];
  completed_stages: number[];
  afro_score: number;
}): Promise<void> {
  const token = getToken();
  if (!token) return;

  try {
    await fetch(`${API_BASE_URL}/progress/complete-module`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch {
    // Offline — will be reconciled on next full sync
  }
}

// ── Save journal entry ─────────────────────────────────────────────────────
export async function remoteSetJournal(moduleId: string, text: string): Promise<void> {
  const token = getToken();
  if (!token) return;

  try {
    await fetch(`${API_BASE_URL}/progress/journal/${encodeURIComponent(moduleId)}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ text }),
    });
  } catch {
    // Offline — localStorage copy retained
  }
}

// ── Save feedback (reaction) ───────────────────────────────────────────────
export async function remoteSetFeedback(moduleId: string, key: string): Promise<void> {
  const token = getToken();
  if (!token) return;

  try {
    await fetch(`${API_BASE_URL}/progress/feedback/${encodeURIComponent(moduleId)}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ key }),
    });
  } catch {
    // Offline — localStorage copy retained
  }
}
