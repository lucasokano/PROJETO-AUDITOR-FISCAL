import type { StudyClozeQuestion } from "../types/authoredQuestion";
import type { Discipline } from "../types/study";
import {
  appendOfflineClozeSyncPage,
  beginOfflineClozeSync,
  commitOfflineClozeSync,
  readOfflineClozePage,
  readOfflineStructure,
  readSyncMetadata,
  replaceOfflineStructure,
} from "./offlineDb";
import { versionsDiffer } from "./offlinePolicy";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
const SESSION_SIZE = 50;
const SYNC_PAGE_SIZE = 50;

export interface RemoteSyncVersions {
  structure: string;
  fillBlankQuestions: Record<string, string>;
  updatedAt: string;
}

interface ClozePage { items: StudyClozeQuestion[]; nextCursor: number | null; }

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { credentials: "include" });
  if (!response.ok) throw new Error("Não foi possível sincronizar o conteúdo offline.");
  return response.json() as Promise<T>;
}

export const fetchRemoteSyncVersions = () => request<RemoteSyncVersions>("/sync/version");

export async function loadStructureLocalFirst() {
  return readOfflineStructure();
}

export async function synchronizeStructure(remoteVersions?: RemoteSyncVersions) {
  const versions = remoteVersions ?? await fetchRemoteSyncVersions();
  const local = await readSyncMetadata("structure");
  if (!versionsDiffer(local?.version, versions.structure)) return null;
  const structure = await request<Discipline[]>("/study/structure");
  await replaceOfflineStructure(structure, { key: "structure", version: versions.structure, updatedAt: versions.updatedAt });
  return structure;
}

export async function loadOfflineClozeSession(subtopicId: number) {
  const perDifficulty = SESSION_SIZE / 2;
  const [easy, difficult] = await Promise.all([
    readOfflineClozePage(subtopicId, perDifficulty, false),
    readOfflineClozePage(subtopicId, perDifficulty, true),
  ]);
  return { questions: [...easy.items, ...difficult.items], easyTotal: easy.total, difficultTotal: difficult.total };
}

export async function loadMoreOfflineClozeQuestions(subtopicId: number, isDifficult: boolean, offset: number) {
  return readOfflineClozePage(subtopicId, SESSION_SIZE / 2, isDifficult, offset);
}

export async function synchronizeClozeSubtopic(subtopicId: number, remoteVersions?: RemoteSyncVersions) {
  const versions = remoteVersions ?? await fetchRemoteSyncVersions();
  const remoteVersion = versions.fillBlankQuestions[String(subtopicId)] ?? "0:0";
  const metadataKey = `cloze:${subtopicId}`;
  const local = await readSyncMetadata(metadataKey);
  if (!versionsDiffer(local?.version, remoteVersion)) return false;

  await beginOfflineClozeSync(subtopicId);
  let cursor: number | null = null;
  do {
    const query = new URLSearchParams({ subtopicId: String(subtopicId), limit: String(SYNC_PAGE_SIZE) });
    if (cursor) query.set("cursor", String(cursor));
    const page = await request<ClozePage>(`/authored-questions/study/cloze?${query}`);
    await appendOfflineClozeSyncPage(page.items);
    cursor = page.nextCursor;
  } while (cursor !== null);

  await commitOfflineClozeSync(subtopicId, { key: metadataKey, version: remoteVersion, updatedAt: versions.updatedAt });
  return true;
}

export const OFFLINE_CLOZE_SESSION_SIZE = SESSION_SIZE;
