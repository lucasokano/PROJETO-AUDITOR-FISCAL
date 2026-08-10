import type {
  Discipline,
  PublicStatement,
  StudyDashboard,
} from "../types/study";

const STALE_TIME_MS = 45_000;

interface CacheEntry<T> {
  data: T | null;
  updatedAt: number;
  pending: Promise<T> | null;
}

function createEntry<T>(): CacheEntry<T> {
  return { data: null, updatedAt: 0, pending: null };
}

const dashboardCache = createEntry<StudyDashboard>();
const structureCache = createEntry<Discipline[]>();
const reviewCaches = new Map<number, CacheEntry<PublicStatement[]>>();

function isFresh<T>(entry: CacheEntry<T>) {
  return entry.data !== null && Date.now() - entry.updatedAt < STALE_TIME_MS;
}

async function loadCached<T>(entry: CacheEntry<T>, loader: () => Promise<T>) {
  if (isFresh(entry)) {
    return entry.data as T;
  }

  if (entry.pending) {
    return entry.pending;
  }

  entry.pending = loader()
    .then((data) => {
      entry.data = data;
      entry.updatedAt = Date.now();
      return data;
    })
    .finally(() => {
      entry.pending = null;
    });

  return entry.pending;
}

function invalidate<T>(entry: CacheEntry<T>) {
  entry.updatedAt = 0;
}

function reviewEntry(limit: number) {
  const current = reviewCaches.get(limit);
  if (current) return current;
  const created = createEntry<PublicStatement[]>();
  reviewCaches.set(limit, created);
  return created;
}

export function loadDashboardCached(loader: () => Promise<StudyDashboard>) {
  return loadCached(dashboardCache, loader);
}

export function loadStructureCached(loader: () => Promise<Discipline[]>) {
  return loadCached(structureCache, loader);
}

export function loadReviewsCached(limit: number, loader: () => Promise<PublicStatement[]>) {
  return loadCached(reviewEntry(limit), loader);
}

export function peekDashboard() {
  return dashboardCache.data;
}

export function peekStructure() {
  return structureCache.data;
}

export function peekReviews(limit: number) {
  return reviewCaches.get(limit)?.data ?? null;
}

export function invalidateDashboard() {
  invalidate(dashboardCache);
}

export function invalidateStructure() {
  invalidate(structureCache);
}

export function invalidateReviews() {
  for (const entry of reviewCaches.values()) invalidate(entry);
}

export function recordStatementAnswer(statementId: number) {
  invalidateDashboard();
  for (const entry of reviewCaches.values()) {
    if (!entry.data) continue;
    entry.data = entry.data.filter((statement) => statement.id !== statementId);
    entry.updatedAt = Date.now();
  }
}

export function clearStudyCache() {
  dashboardCache.data = null;
  dashboardCache.updatedAt = 0;
  structureCache.data = null;
  structureCache.updatedAt = 0;
  reviewCaches.clear();
}
