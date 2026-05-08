import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db, isFirebaseConfigured } from '../../firebase';
import type { AppUser } from './auth';
import { WARGA_LOAD_FALLBACK_MESSAGE, WARGA_UPDATE_PENDING_MESSAGE } from './wargaMessages';

export interface WargaRecord {
  id: string;
  ownerUid?: string;
  ownerEmail?: string;
  ownerName?: string;
  ownerRole?: string;
  firebaseSyncStatus?: 'synced' | 'pending_firestore';
  createdAt?: string;
  nilaiAkhir?: number | null;
  penilaianCompletedAt?: string; // Kapan penilaian selesai
  statusApprovalAt?: string; // Kapan approval diberikan
  tanggal?: string;
  terkirim?: boolean;
  statusApproval?: string;
  [key: string]: any;
}

const DATA_WARGA_KEY = 'dataWarga';

const isPermissionError = (error: unknown) =>
  error instanceof FirebaseError &&
  (error.code === 'permission-denied' ||
    error.code === 'firestore/permission-denied');

const notifyDatabaseProcessFailure = (error: unknown, fallbackMessage: string) => {
  console.error(`Gagal memproses data warga di Firestore: ${fallbackMessage}`, error);
};

export const getCurrentAppUser = (): AppUser | null => {
  return JSON.parse(localStorage.getItem('currentUser') || 'null');
};

export const getAllStoredWarga = (): WargaRecord[] => {
  const stored = JSON.parse(localStorage.getItem(DATA_WARGA_KEY) || '[]');
  return Array.isArray(stored) ? stored : [];
};

const sortWarga = (items: WargaRecord[]) => {
  return [...items].sort((a, b) => {
    const timeA = new Date(a.createdAt || a.tanggal || 0).getTime();
    const timeB = new Date(b.createdAt || b.tanggal || 0).getTime();
    return timeB - timeA;
  });
};

const withSyncStatus = (
  item: WargaRecord,
  syncStatus: WargaRecord['firebaseSyncStatus']
): WargaRecord => ({
  ...item,
  firebaseSyncStatus: syncStatus,
});

const toFirestorePayload = (item: Partial<WargaRecord>) => {
  const { firebaseSyncStatus, ...payload } = item;
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
};

export const saveAllStoredWarga = (items: WargaRecord[]) => {
  localStorage.setItem(DATA_WARGA_KEY, JSON.stringify(sortWarga(items)));
};

export const canAccessWarga = (
  item: WargaRecord,
  user: AppUser | null = getCurrentAppUser()
) => {
  if (!user) {
    return false;
  }

  if (user.role === 'kepala_desa') {
    return true;
  }

  if (item.ownerUid) {
    return item.ownerUid === user.uid;
  }

  if (item.ownerEmail) {
    return item.ownerEmail === user.email;
  }

  return false;
};

export const filterWargaByCurrentUser = (
  items: WargaRecord[],
  user: AppUser | null = getCurrentAppUser()
) => {
  return sortWarga(items.filter((item) => canAccessWarga(item, user)));
};

const mergeStoredWarga = (
  remoteItems: WargaRecord[],
  user: AppUser | null = getCurrentAppUser()
) => {
  const merged = new Map<string, WargaRecord>();
  const remoteIds = new Set(remoteItems.map((item) => item.id));

  getAllStoredWarga()
    .filter((item) => {
      if (!canAccessWarga(item, user)) {
        return true;
      }

      if (item.firebaseSyncStatus === 'pending_firestore') {
        return true;
      }

      return remoteIds.has(item.id);
    })
    .forEach((item) => {
    merged.set(item.id, item);
    });

  remoteItems.forEach((item) => {
    const existingItem = merged.get(item.id);

    if (existingItem?.firebaseSyncStatus === 'pending_firestore') {
      merged.set(item.id, existingItem);
      return;
    }

    merged.set(item.id, {
      ...existingItem,
      ...item,
      firebaseSyncStatus: 'synced',
    });
  });

  saveAllStoredWarga(Array.from(merged.values()));
};

const syncPendingAccessibleWarga = async (
  user: AppUser | null = getCurrentAppUser()
) => {
  if (!user || !db || !isFirebaseConfigured) {
    return;
  }

  const pendingItems = filterWargaByCurrentUser(getAllStoredWarga(), user).filter(
    (item) => item.firebaseSyncStatus === 'pending_firestore'
  );

  if (pendingItems.length === 0) {
    return;
  }

  const syncedItems = new Map<string, string>();

  await Promise.all(
    pendingItems.map(async (item) => {
      try {
        if (item.id.startsWith('local-')) {
          const { id, ...payload } = toFirestorePayload(item);
          const docRef = await addDoc(collection(db, 'dataWarga'), payload);
          syncedItems.set(item.id, docRef.id);
          return;
        }

        await setDoc(doc(db, 'dataWarga', item.id), toFirestorePayload(item), {
          merge: true,
        });
        syncedItems.set(item.id, item.id);
      } catch (error) {
        notifyDatabaseProcessFailure(error, WARGA_UPDATE_PENDING_MESSAGE);
      }
    })
  );

  if (syncedItems.size === 0) {
    return;
  }

  saveAllStoredWarga(
    getAllStoredWarga().map((item) => {
      const syncedId = syncedItems.get(item.id);
      return syncedId
        ? withSyncStatus({ ...item, id: syncedId }, 'synced')
        : item;
    })
  );
};

export const loadAccessibleWarga = async (
  user: AppUser | null = getCurrentAppUser()
) => {
  const localData = filterWargaByCurrentUser(getAllStoredWarga(), user);

  if (!user || !db || !isFirebaseConfigured) {
    return localData;
  }

  try {
    await syncPendingAccessibleWarga(user);

    const dataWargaRef = collection(db, 'dataWarga');
    const snapshot =
      user.role === 'kepala_desa'
        ? await getDocs(dataWargaRef)
        : await getDocs(query(dataWargaRef, where('ownerUid', '==', user.uid)));

    const remoteData = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
      firebaseSyncStatus: 'synced' as const,
    }));

    mergeStoredWarga(remoteData, user);

    const pendingLocal = localData.filter(
      (item) => item.firebaseSyncStatus === 'pending_firestore'
    );
    const merged = new Map<string, WargaRecord>();

    filterWargaByCurrentUser(remoteData, user).forEach((item) => {
      merged.set(item.id, item);
    });

    pendingLocal.forEach((item) => {
      merged.set(item.id, item);
    });

    return sortWarga(Array.from(merged.values()));
  } catch (error) {
    notifyDatabaseProcessFailure(error, WARGA_LOAD_FALLBACK_MESSAGE);
    if (!isPermissionError(error)) {
      console.error('Gagal memuat data warga dari Firestore:', error);
    }
    return localData;
  }
};

export const appendStoredWarga = (item: WargaRecord) => {
  saveAllStoredWarga([item, ...getAllStoredWarga()]);
};

export const updateWargaById = async (
  id: string,
  updates: Partial<WargaRecord>
) => {
  const allData = getAllStoredWarga();
  const existing = allData.find((item) => item.id === id);

  if (!existing) {
    return null;
  }

  const nextItem = {
    ...existing,
    ...updates,
  };

  const localNextItem =
    db && isFirebaseConfigured && !id.startsWith('local-')
      ? withSyncStatus(nextItem, existing.firebaseSyncStatus || 'synced')
      : withSyncStatus(nextItem, 'pending_firestore');

  saveAllStoredWarga(
    allData.map((item) => (item.id === id ? localNextItem : item))
  );

  if (db && isFirebaseConfigured && !id.startsWith('local-')) {
    try {
      await setDoc(doc(db, 'dataWarga', id), toFirestorePayload(updates), {
        merge: true,
      });
      saveAllStoredWarga(
        getAllStoredWarga().map((item) =>
          item.id === id
            ? withSyncStatus(item, 'synced')
            : item
        )
      );
    } catch (error) {
      notifyDatabaseProcessFailure(error, WARGA_UPDATE_PENDING_MESSAGE);
      saveAllStoredWarga(
        getAllStoredWarga().map((item) =>
          item.id === id
            ? withSyncStatus(item, 'pending_firestore')
            : item
        )
      );
      if (!isPermissionError(error)) {
        throw error;
      }
    }
  }

  return getAllStoredWarga().find((item) => item.id === id) || localNextItem;
};

export const deleteWargaById = async (id: string) => {
  saveAllStoredWarga(getAllStoredWarga().filter((item) => item.id !== id));

  if (db && isFirebaseConfigured && !id.startsWith('local-')) {
    try {
      await deleteDoc(doc(db, 'dataWarga', id));
    } catch (error) {
      notifyDatabaseProcessFailure(error, WARGA_UPDATE_PENDING_MESSAGE);
      if (!isPermissionError(error)) {
        throw error;
      }
    }
  }
};
