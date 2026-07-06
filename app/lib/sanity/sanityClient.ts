/**
 * Server-side Sanity HTTP client.
 *
 * Mirrors the PHP helper approach: plain fetch() calls against the
 * Sanity HTTP API with a bearer token. No @sanity/client dependency.
 */

const PROJECT_ID = process.env.SANITY_PROJECT_ID!;
const DATASET = process.env.SANITY_DATASET!;
const API_VERSION = process.env.SANITY_API_VERSION!;
const TOKEN = process.env.SANITY_TOKEN!;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert text to a URL-safe slug. */
export function slugify(value: string): string {
  let slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || `item-${Math.random().toString(36).slice(2, 8)}`;
}

/** Build a deterministic document ID: `prefix.slug`. */
export function docId(prefix: string, value: string): string {
  return `${prefix}.${slugify(value)}`;
}

// ---------------------------------------------------------------------------
// HTTP layer
// ---------------------------------------------------------------------------

interface SanityResponse {
  ok: boolean;
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: any;
}

async function sanityHttp(
  method: string,
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any,
): Promise<SanityResponse> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${TOKEN}`,
  };

  if (payload !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method,
    headers,
    body: payload !== undefined ? JSON.stringify(payload) : undefined,
    cache: 'no-store',
  });

  const json = await res.json().catch(() => ({}));

  return { ok: res.ok, status: res.status, json };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Execute a GROQ query and return the result array. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sanityQuery(groq: string): Promise<any[]> {
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(groq)}`;
  const res = await sanityHttp('GET', url);

  if (!res.ok) {
    throw new Error(`Sanity query failed (HTTP ${res.status}): ${JSON.stringify(res.json)}`);
  }

  return res.json?.result ?? [];
}

/** Execute one or more mutations (create, patch, delete). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sanityMutate(mutations: any[]): Promise<SanityResponse> {
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}?returnDocuments=true`;
  const res = await sanityHttp('POST', url, { mutations });

  if (!res.ok) {
    throw new Error(`Sanity mutation failed (HTTP ${res.status}): ${JSON.stringify(res.json)}`);
  }

  return res;
}

// ---------------------------------------------------------------------------
// Module-specific helpers
// ---------------------------------------------------------------------------

export interface SanityModule {
  _id: string;
  _type: string;
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

/** Fetch all modules ordered by moduleNumber. */
export async function fetchAllModules(): Promise<SanityModule[]> {
  return sanityQuery(
    '*[_type == "module"] | order(moduleNumber asc){ _id, _type, title, slug, moduleNumber, subtitle, track, tier, contentType, sensitivity, body, takeaways, status, revisionNote, createdAt, updatedAt, publishedAt, resourceUrl, approvalStep }',
  );
}

/** Fetch a single module by its _id. */
export async function fetchModuleById(id: string): Promise<SanityModule | null> {
  const results = await sanityQuery(
    `*[_type == "module" && _id == $id][0]{ _id, _type, title, slug, moduleNumber, subtitle, track, tier, contentType, sensitivity, body, takeaways, status, revisionNote, createdAt, updatedAt, publishedAt, resourceUrl, approvalStep }`.replace(
      '$id',
      JSON.stringify(id),
    ),
  );

  // sanityQuery wraps in array for list queries; for [0] queries
  // Sanity returns the object directly in `result`
  return Array.isArray(results) ? results[0] ?? null : results ?? null;
}

/** Fetch a single module by id, slug, or numeric id (e.g. 1.1) */
export async function fetchModuleByIdOrSlug(idOrSlug: string): Promise<SanityModule | null> {
  // If it's a numeric ID like '1.1', we can construct the track and moduleNumber query
  const match = idOrSlug.match(/^(\d+)\.(\d+)$/);
  if (match) {
    const stageId = parseInt(match[1]);
    const moduleNumber = parseInt(match[2]);
    const TRACKS = [
      'Emotional Preparation',
      'Cultural Intelligence',
      'Practical Preparation',
      'Arrival Orientation',
      'Heritage Journey Experience',
      'Post Journey Experience'
    ];
    const track = TRACKS[stageId - 1];
    if (track) {
      const results = await sanityQuery(
        `*[_type == "module" && track == $track && moduleNumber == $moduleNumber][0]{ _id, _type, title, slug, moduleNumber, subtitle, track, tier, contentType, sensitivity, body, takeaways, status, revisionNote, createdAt, updatedAt, publishedAt, resourceUrl, approvalStep }`
          .replace('$track', JSON.stringify(track))
          .replace('$moduleNumber', String(moduleNumber))
      );
      return Array.isArray(results) ? results[0] ?? null : results ?? null;
    }
  }

  // Otherwise check _id, slug, or module._id prefix
  const results = await sanityQuery(
    `*[_type == "module" && (_id == $idOrSlug || slug == $idOrSlug || _id == $moduleId)][0]{ _id, _type, title, slug, moduleNumber, subtitle, track, tier, contentType, sensitivity, body, takeaways, status, revisionNote, createdAt, updatedAt, publishedAt, resourceUrl, approvalStep }`
      .replace(/\$idOrSlug/g, JSON.stringify(idOrSlug))
      .replace('$moduleId', JSON.stringify(`module.${idOrSlug}`))
  );
  return Array.isArray(results) ? results[0] ?? null : results ?? null;
}

/** Create a new module document (status = pending). */
export async function createModule(fields: {
  title: string;
  moduleNumber: number;
  subtitle: string;
  track: string;
  tier: string;
  contentType: string;
  sensitivity: string;
  body: string;
  takeaways: string;
  resourceUrl?: string;
  approvalStep?: number;
}): Promise<SanityModule> {
  const slug = slugify(fields.title);
  const moduleId = docId('module', slug);
  const now = new Date().toISOString();

  const res = await sanityMutate([
    {
      createOrReplace: {
        _id: moduleId,
        _type: 'module',
        ...fields,
        slug,
        status: 'pending',
        approvalStep: fields.approvalStep ?? 1,
        createdAt: now,
        updatedAt: now,
      },
    },
  ]);

  const created = res.json?.results?.[0]?.document;
  return created ?? { _id: moduleId, _type: 'module', ...fields, slug, status: 'pending' as const, approvalStep: fields.approvalStep ?? 1, createdAt: now, updatedAt: now };
}

/** Update an existing module (partial fields). */
export async function updateModule(
  id: string,
  fields: Partial<Omit<SanityModule, '_id' | '_type'>>,
): Promise<void> {
  // If title changed, regenerate slug
  const set: Record<string, unknown> = { ...fields, updatedAt: new Date().toISOString() };
  if (fields.title) {
    set.slug = slugify(fields.title);
  }

  await sanityMutate([{ patch: { id, set } }]);
}

/** Delete a module by _id. */
export async function deleteModule(id: string): Promise<void> {
  await sanityMutate([{ delete: { id } }]);
}

/** Approve & publish a module. */
export async function approveModule(id: string): Promise<void> {
  await sanityMutate([
    {
      patch: {
        id,
        set: {
          status: 'published',
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          revisionNote: '',
        },
      },
    },
  ]);
}

/** Request revision on a module. */
export async function requestRevision(id: string, note: string): Promise<void> {
  await sanityMutate([
    {
      patch: {
        id,
        set: {
          status: 'pending',
          revisionNote: note,
          approvalStep: 1,
          updatedAt: new Date().toISOString(),
        },
      },
    },
  ]);
}

export interface SanityStory {
  _id: string;
  _type: 'story';
  title: string;
  slug: string;
  body: string;
  author: string;
  authorId: string;
  status: 'pending' | 'approved' | 'revision';
  revisionNote?: string;
  communityHubSlug?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

/** Fetch all stories by a specific author. */
export async function fetchStoriesByUser(authorId: string): Promise<SanityStory[]> {
  const query = `*[_type == "story" && authorId == $authorId] | order(createdAt desc){ _id, _type, title, slug, body, author, authorId, status, revisionNote, communityHubSlug, createdAt, updatedAt, publishedAt }`
    .replace('$authorId', JSON.stringify(authorId));
  console.log("[sanityClient] fetchStoriesByUser Query:", query);
  const result = await sanityQuery(query);
  console.log("[sanityClient] fetchStoriesByUser Result count:", result?.length ?? 0);
  return result;
}

/** Fetch all pending stories. */
export async function fetchPendingStories(): Promise<SanityStory[]> {
  const query = `*[_type == "story" && status == "pending"] | order(createdAt desc){ _id, _type, title, slug, body, author, authorId, status, revisionNote, communityHubSlug, createdAt, updatedAt, publishedAt }`;
  console.log("[sanityClient] fetchPendingStories Query:", query);
  const result = await sanityQuery(query);
  console.log("[sanityClient] fetchPendingStories Result count:", result?.length ?? 0);
  return result;
}

/** Fetch all approved stories. */
export async function fetchApprovedStories(): Promise<SanityStory[]> {
  return sanityQuery(
    `*[_type == "story" && status == "approved"] | order(createdAt desc){ _id, _type, title, slug, body, author, authorId, status, revisionNote, communityHubSlug, createdAt, updatedAt, publishedAt }`
  );
}

/** Fetch a single story by ID. */
export async function fetchStoryById(id: string): Promise<SanityStory | null> {
  const results = await sanityQuery(
    `*[_type == "story" && _id == $id][0]{ _id, _type, title, slug, body, author, authorId, status, revisionNote, communityHubSlug, createdAt, updatedAt, publishedAt }`
      .replace('$id', JSON.stringify(id))
  );
  return Array.isArray(results) ? results[0] ?? null : results ?? null;
}

/** Create a new story draft (status = pending). */
export async function createStory(fields: {
  title: string;
  body: string;
  author: string;
  authorId: string;
}): Promise<SanityStory> {
  const slug = slugify(fields.title);
  const storyId = docId('story', slug);
  const now = new Date().toISOString();

  const res = await sanityMutate([
    {
      createOrReplace: {
        _id: storyId,
        _type: 'story',
        ...fields,
        slug,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      },
    },
  ]);

  const created = res.json?.results?.[0]?.document;
  return created ?? { _id: storyId, _type: 'story', ...fields, slug, status: 'pending', createdAt: now, updatedAt: now };
}

/** Update an existing story draft. */
export async function updateStory(
  id: string,
  fields: Partial<Omit<SanityStory, '_id' | '_type' | 'authorId' | 'author'>>
): Promise<void> {
  const set: Record<string, unknown> = {
    ...fields,
    updatedAt: new Date().toISOString(),
  };
  if (fields.title) {
    set.slug = slugify(fields.title);
  }

  await sanityMutate([{ patch: { id, set } }]);
}

/** Approve a story. */
export async function approveStory(id: string, hubSlug: string): Promise<void> {
  await sanityMutate([
    {
      patch: {
        id,
        set: {
          status: 'approved',
          communityHubSlug: hubSlug,
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          revisionNote: '',
        },
      },
    },
  ]);
}

/** Reject a story (revision note). */
export async function rejectStory(id: string, note: string): Promise<void> {
  await sanityMutate([
    {
      patch: {
        id,
        set: {
          status: 'revision',
          revisionNote: note,
          updatedAt: new Date().toISOString(),
        },
      },
    },
  ]);
}
