export interface SnapshotSyncInput<T> {
  current: T;
  hasCurrentContent: boolean;
  localVersion: string | null;
  remoteVersion: string;
  loadRemote: () => Promise<T>;
  persist: (content: T, version: string) => Promise<void>;
}

export async function synchronizeSnapshot<T>(input: SnapshotSyncInput<T>) {
  if (input.localVersion === input.remoteVersion) {
    return { content: input.current, synchronized: false, usedLocalFallback: false };
  }
  try {
    const remote = await input.loadRemote();
    await input.persist(remote, input.remoteVersion);
    return {
      content: input.hasCurrentContent ? input.current : remote,
      synchronized: true,
      usedLocalFallback: false,
    };
  } catch (error) {
    if (!input.hasCurrentContent) throw error;
    return { content: input.current, synchronized: false, usedLocalFallback: true };
  }
}

export function versionsDiffer(localVersion: string | null | undefined, remoteVersion: string) {
  return localVersion !== remoteVersion;
}
