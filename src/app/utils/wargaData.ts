import {
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

export interface WargaRecord {
  id: string;
  ownerUid?: string;
  ownerEmail?: string;
  ownerName?: string;
  ownerRole?: string;
  firebaseSyncStatus?: 'synced' | 'pending_firestore';
  createdAt?: string;
  nilaiAkhir?: number | null;
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
    merged.set(item.id, {
      ...merged.get(item.id),
      ...item,
      firebaseSyncStatus: 'synced',
    });
  });

  saveAllStoredWarga(Array.from(merged.values()));
};

export const loadAccessibleWarga = async (
  user: AppUser | null = getCurrentAppUser()
) => {
  const localData = filterWargaByCurrentUser(getAllStoredWarga(), user);

  if (!user || !db || !isFirebaseConfigured) {
    return localData;
  }

  try {
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
      if (!merged.has(item.id)) {
        merged.set(item.id, item);
      }
    });

    return sortWarga(Array.from(merged.values()));
  } catch (error) {
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

  saveAllStoredWarga(
    allData.map((item) => (item.id === id ? nextItem : item))
  );

  if (db && isFirebaseConfigured && !id.startsWith('local-')) {
    try {
      await setDoc(doc(db, 'dataWarga', id), updates, { merge: true });
      saveAllStoredWarga(
        getAllStoredWarga().map((item) =>
          item.id === id
            ? { ...item, firebaseSyncStatus: 'synced' }
            : item
        )
      );
    } catch (error) {
      if (!isPermissionError(error)) {
        throw error;
      }
    }
  }

  return nextItem;
};

export const deleteWargaById = async (id: string) => {
  saveAllStoredWarga(getAllStoredWarga().filter((item) => item.id !== id));

  if (db && isFirebaseConfigured && !id.startsWith('local-')) {
    try {
      await deleteDoc(doc(db, 'dataWarga', id));
    } catch (error) {
      if (!isPermissionError(error)) {
        throw error;
      }
    }
  }
};
