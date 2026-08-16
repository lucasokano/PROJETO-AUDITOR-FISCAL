import assert from "node:assert/strict";
import test from "node:test";
import { synchronizeSnapshot } from "../offlinePolicy.ts";

test("versão igual não baixa novamente o conteúdo", async () => {
  let requests = 0;
  const result = await synchronizeSnapshot({ current: [1], hasCurrentContent: true, localVersion: "2", remoteVersion: "2",
    loadRemote: async () => { requests += 1; return [2]; }, persist: async () => undefined });
  assert.equal(requests, 0); assert.deepEqual(result.content, [1]); assert.equal(result.synchronized, false);
});

test("versão nova sincroniza e persiste a substituição completa", async () => {
  let persisted: number[] = [];
  const result = await synchronizeSnapshot({ current: [], hasCurrentContent: false, localVersion: "1", remoteVersion: "2",
    loadRemote: async () => [2, 3], persist: async (content) => { persisted = content; } });
  assert.deepEqual(persisted, [2, 3]); assert.deepEqual(result.content, [2, 3]); assert.equal(result.synchronized, true);
});

test("falha de rede preserva conteúdo local válido", async () => {
  const result = await synchronizeSnapshot({ current: [1], hasCurrentContent: true, localVersion: "1", remoteVersion: "2",
    loadRemote: async () => { throw new Error("offline"); }, persist: async () => undefined });
  assert.deepEqual(result.content, [1]); assert.equal(result.usedLocalFallback, true);
});

test("atualização em background não troca uma sessão em andamento", async () => {
  let persisted: number[] = [];
  const result = await synchronizeSnapshot({ current: [1, 2], hasCurrentContent: true, localVersion: "1", remoteVersion: "2",
    loadRemote: async () => [2, 3], persist: async (content) => { persisted = content; } });
  assert.deepEqual(result.content, [1, 2]); assert.deepEqual(persisted, [2, 3]);
});

test("snapshot remoto remove registros excluídos do servidor", async () => {
  let persisted = [1, 2, 3];
  await synchronizeSnapshot({ current: persisted, hasCurrentContent: true, localVersion: "1", remoteVersion: "2",
    loadRemote: async () => [1, 3], persist: async (content) => { persisted = [...content]; } });
  assert.deepEqual(persisted, [1, 3]);
});

test("IndexedDB vazio e rede indisponível mantém a falha explícita", async () => {
  await assert.rejects(() => synchronizeSnapshot({ current: [], hasCurrentContent: false, localVersion: null, remoteVersion: "2",
    loadRemote: async () => { throw new Error("offline"); }, persist: async () => undefined }), /offline/);
});
