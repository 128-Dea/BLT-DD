import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { auth, db, isFirebaseConfigured } from '../../firebase';

export type UserRole = 'perangkat_desa' | 'kepala_desa';

export interface AppUser {
  uid: string;
  nama: string;
  email: string;
  role: UserRole;
  profilePhoto?: string;
  createdAt?: string;
}

const getUserCreatedAt = (
  source?: { createdAt?: unknown },
  fallbackCreatedAt?: string,
  firebaseCreationTime?: string | null
) => {
  const createdAt = source?.createdAt;

  if (
    createdAt &&
    typeof createdAt === 'object' &&
    'toDate' in createdAt &&
    typeof (createdAt as any).toDate === 'function'
  ) {
    return (createdAt as any).toDate().toISOString();
  }

  if (typeof createdAt === 'string') {
    return createdAt;
  }

  return fallbackCreatedAt || firebaseCreationTime || undefined;
};

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

const getUsersFromStorage = (): AppUser[] => {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

const saveUsersToStorage = (users: AppUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const ensureFirebaseReady = () => {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error('Firebase belum dikonfigurasi. Lengkapi file .env terlebih dahulu.');
  }
};

export const saveCurrentUser = (user: AppUser | null) => {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return;
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

const upsertUserInStorage = (user: AppUser) => {
  const users = getUsersFromStorage();
  const existingIndex = users.findIndex((item) => item.email === user.email);

  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...user };
  } else {
    users.push(user);
  }

  saveUsersToStorage(users);
};

const isPermissionError = (error: unknown) => {
  return (
    error instanceof FirebaseError &&
    (error.code === 'permission-denied' ||
      error.code === 'firestore/permission-denied')
  );
};

const getStoredUserByEmail = (email: string) => {
  return getUsersFromStorage().find((item) => item.email === email) || null;
};

const userDocRef = (uid: string) => {
  ensureFirebaseReady();
  return doc(db!, 'users', uid);
};

const buildAppUser = async (firebaseUser: User): Promise<AppUser | null> => {
  const fallbackUser = getStoredUserByEmail(firebaseUser.email || '');

  try {
    const snapshot = await getDoc(userDocRef(firebaseUser.uid));

    if (!snapshot.exists()) {
      const appUser: AppUser = {
        uid: firebaseUser.uid,
        nama: fallbackUser?.nama || firebaseUser.displayName || '',
        email: firebaseUser.email || fallbackUser?.email || '',
        role: fallbackUser?.role || 'perangkat_desa',
        profilePhoto: fallbackUser?.profilePhoto || '',
        createdAt: fallbackUser?.createdAt || firebaseUser.metadata.creationTime || undefined,
      };

      upsertUserInStorage(appUser);
      saveCurrentUser(appUser);

      return appUser;
    }

    const data = snapshot.data();
    const appUser: AppUser = {
      uid: firebaseUser.uid,
      nama: data.nama || fallbackUser?.nama || firebaseUser.displayName || '',
      email: firebaseUser.email || data.email || fallbackUser?.email || '',
      role: (data.role || fallbackUser?.role || 'perangkat_desa') as UserRole,
      profilePhoto: data.profilePhoto || fallbackUser?.profilePhoto || '',
      createdAt: getUserCreatedAt(
        data,
        fallbackUser?.createdAt,
        firebaseUser.metadata.creationTime
      ),
    };

    upsertUserInStorage(appUser);
    saveCurrentUser(appUser);

    return appUser;
  } catch (error) {
    if (!isPermissionError(error)) {
      throw error;
    }

    const appUser: AppUser = {
      uid: firebaseUser.uid,
      nama: fallbackUser?.nama || firebaseUser.displayName || '',
      email: firebaseUser.email || fallbackUser?.email || '',
      role: fallbackUser?.role || 'perangkat_desa',
      profilePhoto: fallbackUser?.profilePhoto || '',
      createdAt: fallbackUser?.createdAt || firebaseUser.metadata.creationTime || undefined,
    };

    upsertUserInStorage(appUser);
    saveCurrentUser(appUser);

    return appUser;
  }
};

export const validateEmailByRole = (email: string, role: UserRole) => {
  if (role === 'perangkat_desa') {
    return email.endsWith('@admin.com');
  }

  return email.endsWith('@kades.com');
};

export const isEmailRegistered = async (email: string) => {
  ensureFirebaseReady();
  const methods = await fetchSignInMethodsForEmail(auth!, email);
  return methods.length > 0;
};

export const registerWithFirebase = async (payload: {
  nama: string;
  email: string;
  password: string;
  role: UserRole;
}) => {
  ensureFirebaseReady();

  const localUser: AppUser = {
    uid: '',
    nama: payload.nama,
    email: payload.email,
    role: payload.role,
    profilePhoto: '',
    createdAt: new Date().toISOString(),
  };

  let credential;

  try {
    credential = await createUserWithEmailAndPassword(
      auth!,
      payload.email,
      payload.password
    );
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      error.code === 'auth/email-already-in-use'
    ) {
      throw new Error('Email sudah terdaftar. Silakan login langsung.');
    }

    throw error;
  }

  await updateProfile(credential.user, {
    displayName: payload.nama,
  }).catch(() => {});

  localUser.uid = credential.user.uid;
  upsertUserInStorage(localUser);
  saveCurrentUser(localUser);

  try {
    await setDoc(userDocRef(credential.user.uid), {
      nama: payload.nama,
      email: payload.email,
      role: payload.role,
      profilePhoto: '',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    if (!isPermissionError(error)) {
      throw error;
    }
  }

  const appUser = await buildAppUser(credential.user);
  return appUser || localUser;
};

export const loginWithFirebase = async (payload: {
  email: string;
  password: string;
  role: UserRole;
}) => {
  ensureFirebaseReady();
  const credential = await signInWithEmailAndPassword(
    auth!,
    payload.email,
    payload.password
  );

  const storedUser = getStoredUserByEmail(payload.email);
  const fallbackUser: AppUser = {
    uid: credential.user.uid,
    nama: storedUser?.nama || credential.user.displayName || '',
    email: credential.user.email || payload.email,
    role: storedUser?.role || payload.role,
    profilePhoto: storedUser?.profilePhoto || '',
    createdAt:
      storedUser?.createdAt || credential.user.metadata.creationTime || undefined,
  };

  upsertUserInStorage(fallbackUser);
  saveCurrentUser(fallbackUser);

  const appUser = (await buildAppUser(credential.user)) || fallbackUser;

  if (appUser.role !== payload.role) {
    await signOut(auth);
    saveCurrentUser(null);
    throw new Error('Role akun tidak sesuai dengan data yang terdaftar.');
  }

  return appUser;
};

export const logoutFromFirebase = async () => {
  if (!auth) {
    saveCurrentUser(null);
    return;
  }

  await signOut(auth);
  saveCurrentUser(null);
};

export const restoreCurrentUser = async () => {
  if (!auth || !db || !isFirebaseConfigured) {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
  }

  const firebaseUser = auth.currentUser;

  if (!firebaseUser) {
    saveCurrentUser(null);
    return null;
  }

  return buildAppUser(firebaseUser);
};

export const syncAuthState = (
  callback: (user: AppUser | null) => void
) => {
  if (!auth || !db || !isFirebaseConfigured) {
    callback(JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null'));
    return () => {};
  }

  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      saveCurrentUser(null);
      callback(null);
      return;
    }

    try {
      const user = await buildAppUser(firebaseUser);
      callback(user);
    } catch (error) {
      console.error('Gagal sinkronisasi user Firebase:', error);
      callback(null);
    }
  });
};

export const updateUserProfile = async (
  uid: string,
  payload: Partial<Pick<AppUser, 'nama' | 'profilePhoto'>>
) => {
  if (auth?.currentUser && payload.nama) {
    await updateProfile(auth.currentUser, {
      displayName: payload.nama,
    }).catch(() => {});
  }

  try {
    ensureFirebaseReady();
    await setDoc(userDocRef(uid), payload, { merge: true });
  } catch (error) {
    if (!isPermissionError(error)) {
      throw error;
    }
  }

  const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || '{}');
  const updatedUser = { ...currentUser, ...payload } as AppUser;

  upsertUserInStorage(updatedUser);
  saveCurrentUser(updatedUser);

  return updatedUser;
};
