import type { StudyClozeQuestion } from "../types/authoredQuestion";
import type { Discipline } from "../types/study";

const DATABASE_NAME = "gema-db";
const DATABASE_VERSION = 4;
const STRUCTURE_STORE = "structure";
const QUESTIONS_STORE = "fillBlankQuestions";
const STAGING_STORE = "fillBlankQuestionStaging";
const METADATA_STORE = "syncMetadata";

interface StoredStructure { key: "current"; value: Discipline[]; }
interface StoredClozeQuestion extends StudyClozeQuestion { difficultyKey: 0 | 1; }
export interface SyncMetadata { key: string; version: string; updatedAt: string; }

function storedClozeQuestion(question: StudyClozeQuestion): StoredClozeQuestion {
  return { ...question, difficultyKey: question.isDifficult ? 1 : 0 };
}

function indexedDbAvailable() {
  return typeof indexedDB !== "undefined";
}

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Falha ao acessar o conteúdo offline."));
  });
}

function transactionDone(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Falha ao persistir o conteúdo offline."));
    transaction.onabort = () => reject(transaction.error ?? new Error("Persistência offline cancelada."));
  });
}

async function openDatabase() {
  if (!indexedDbAvailable()) return null;
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STRUCTURE_STORE)) database.createObjectStore(STRUCTURE_STORE, { keyPath: "key" });
      if (!database.objectStoreNames.contains(QUESTIONS_STORE)) {
        const store = database.createObjectStore(QUESTIONS_STORE, { keyPath: "id" });
        store.createIndex("subtopicId", "subtopicId", { unique: false });
        store.createIndex("subtopicDifficulty", ["subtopicId", "difficultyKey"], { unique: false });
      } else {
        const store = request.transaction!.objectStore(QUESTIONS_STORE);
        if (store.indexNames.contains("subtopicDifficulty")) store.deleteIndex("subtopicDifficulty");
        store.createIndex("subtopicDifficulty", ["subtopicId", "difficultyKey"], { unique: false });
        const cursorRequest = store.openCursor();
        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (!cursor) return;
          const question = cursor.value as StudyClozeQuestion;
          cursor.update(storedClozeQuestion(question));
          cursor.continue();
        };
      }
      if (!database.objectStoreNames.contains(STAGING_STORE)) {
        const store = database.createObjectStore(STAGING_STORE, { keyPath: "id" });
        store.createIndex("subtopicId", "subtopicId", { unique: false });
      }
      if (!database.objectStoreNames.contains(METADATA_STORE)) database.createObjectStore(METADATA_STORE, { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB indisponível."));
  });
}

export async function readOfflineStructure() {
  const database = await openDatabase();
  if (!database) return null;
  try {
    const transaction = database.transaction(STRUCTURE_STORE, "readonly");
    const record = await requestResult(transaction.objectStore(STRUCTURE_STORE).get("current") as IDBRequest<StoredStructure | undefined>);
    return record?.value ?? null;
  } finally { database.close(); }
}

export async function replaceOfflineStructure(structure: Discipline[], metadata: SyncMetadata) {
  const database = await openDatabase();
  if (!database) return;
  try {
    const transaction = database.transaction([STRUCTURE_STORE, METADATA_STORE], "readwrite");
    transaction.objectStore(STRUCTURE_STORE).put({ key: "current", value: structure } satisfies StoredStructure);
    transaction.objectStore(METADATA_STORE).put(metadata);
    await transactionDone(transaction);
  } finally { database.close(); }
}

export async function readOfflineClozeBatch(subtopicId: number, limit = 30, isDifficult?: boolean) {
  const page = await readOfflineClozePage(subtopicId, limit, isDifficult, 0);
  return page.items;
}

export async function readOfflineClozePage(subtopicId: number, limit = 30, isDifficult?: boolean, offset = 0) {
  const database = await openDatabase();
  if (!database) return { items: [], total: 0 };
  try {
    const transaction = database.transaction(QUESTIONS_STORE, "readonly");
    const store = transaction.objectStore(QUESTIONS_STORE);
    const index = isDifficult === undefined ? store.index("subtopicId") : store.index("subtopicDifficulty");
    const range = isDifficult === undefined ? IDBKeyRange.only(subtopicId) : IDBKeyRange.only([subtopicId, isDifficult ? 1 : 0]);
    const totalPromise = requestResult(index.count(range));
    const itemsPromise = new Promise<StudyClozeQuestion[]>((resolve, reject) => {
      const items: StudyClozeQuestion[] = [];
      const request = index.openCursor(range);
      let advanced = offset === 0;
      request.onerror = () => reject(request.error ?? new Error("Falha ao ler questões offline."));
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor || items.length >= limit) { resolve(items); return; }
        if (!advanced) { advanced = true; cursor.advance(offset); return; }
        items.push(cursor.value as StudyClozeQuestion);
        cursor.continue();
      };
    });
    const [items, total] = await Promise.all([itemsPromise, totalPromise]);
    return { items, total };
  } finally { database.close(); }
}

export async function replaceOfflineClozeQuestions(subtopicId: number, questions: StudyClozeQuestion[], metadata: SyncMetadata) {
  const database = await openDatabase();
  if (!database) return;
  try {
    const transaction = database.transaction([QUESTIONS_STORE, METADATA_STORE], "readwrite");
    const store = transaction.objectStore(QUESTIONS_STORE);
    const index = store.index("subtopicId");
    const keys = await requestResult(index.getAllKeys(IDBKeyRange.only(subtopicId)));
    keys.forEach((key) => store.delete(key));
    questions.forEach((question) => store.put(storedClozeQuestion(question)));
    transaction.objectStore(METADATA_STORE).put(metadata);
    await transactionDone(transaction);
  } finally { database.close(); }
}

async function deleteSubtopicRecords(store: IDBObjectStore, subtopicId: number) {
  const keys = await requestResult(store.index("subtopicId").getAllKeys(IDBKeyRange.only(subtopicId)));
  keys.forEach((key) => store.delete(key));
}

export async function beginOfflineClozeSync(subtopicId: number) {
  const database = await openDatabase();
  if (!database) return;
  try {
    const transaction = database.transaction(STAGING_STORE, "readwrite");
    await deleteSubtopicRecords(transaction.objectStore(STAGING_STORE), subtopicId);
    await transactionDone(transaction);
  } finally { database.close(); }
}

export async function appendOfflineClozeSyncPage(questions: StudyClozeQuestion[]) {
  const database = await openDatabase();
  if (!database) return;
  try {
    const transaction = database.transaction(STAGING_STORE, "readwrite");
    questions.forEach((question) => transaction.objectStore(STAGING_STORE).put(storedClozeQuestion(question)));
    await transactionDone(transaction);
  } finally { database.close(); }
}

export async function commitOfflineClozeSync(subtopicId: number, metadata: SyncMetadata) {
  const database = await openDatabase();
  if (!database) return;
  try {
    const transaction = database.transaction([QUESTIONS_STORE, STAGING_STORE, METADATA_STORE], "readwrite");
    const liveStore = transaction.objectStore(QUESTIONS_STORE);
    const stagingStore = transaction.objectStore(STAGING_STORE);
    await deleteSubtopicRecords(liveStore, subtopicId);
    const cursorRequest = stagingStore.index("subtopicId").openCursor(IDBKeyRange.only(subtopicId));
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (!cursor) {
        transaction.objectStore(METADATA_STORE).put(metadata);
        return;
      }
      liveStore.put(cursor.value as StudyClozeQuestion);
      cursor.delete();
      cursor.continue();
    };
    await transactionDone(transaction);
  } finally { database.close(); }
}

export async function readSyncMetadata(key: string) {
  const database = await openDatabase();
  if (!database) return null;
  try {
    const transaction = database.transaction(METADATA_STORE, "readonly");
    return await requestResult(transaction.objectStore(METADATA_STORE).get(key) as IDBRequest<SyncMetadata | undefined>) ?? null;
  } finally { database.close(); }
}

export async function invalidateOfflineClozeSubtopic(subtopicId: number) {
  const database = await openDatabase();
  if (!database) return;
  try {
    const transaction = database.transaction(METADATA_STORE, "readwrite");
    transaction.objectStore(METADATA_STORE).delete(`cloze:${subtopicId}`);
    await transactionDone(transaction);
  } finally { database.close(); }
}

export async function clearOfflineContent() {
  const database = await openDatabase();
  if (!database) return;
  try {
    const transaction = database.transaction([STRUCTURE_STORE, QUESTIONS_STORE, STAGING_STORE, METADATA_STORE], "readwrite");
    transaction.objectStore(STRUCTURE_STORE).clear();
    transaction.objectStore(QUESTIONS_STORE).clear();
    transaction.objectStore(STAGING_STORE).clear();
    transaction.objectStore(METADATA_STORE).clear();
    await transactionDone(transaction);
  } finally { database.close(); }
}

export async function estimateOfflineStorage() {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return null;
  const estimate = await navigator.storage.estimate();
  return { usage: estimate.usage ?? 0, quota: estimate.quota ?? 0 };
}
