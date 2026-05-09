export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const NETWORK_ERROR_MESSAGE =
  'Koneksi terputus atau server tidak dapat dijangkau. Periksa koneksi internet, lalu coba lagi.';

export const isNetworkUnavailable = () =>
  typeof navigator !== 'undefined' && navigator.onLine === false;

export const isNetworkError = (error: unknown) => {
  if (isNetworkUnavailable()) {
    return true;
  }

  if (error instanceof TypeError) {
    return true;
  }

  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : '';

  return (
    code === 'auth/network-request-failed' ||
    code === 'unavailable' ||
    code === 'firestore/unavailable'
  );
};

export const createNetworkError = () => new Error(NETWORK_ERROR_MESSAGE);

export const fetchWithNetworkHandling = async (
  input: RequestInfo | URL,
  init?: RequestInit
) => {
  if (isNetworkUnavailable()) {
    throw createNetworkError();
  }

  try {
    return await fetch(input, init);
  } catch (error) {
    if (isNetworkError(error)) {
      throw createNetworkError();
    }

    throw error;
  }
};

export const getMediaUrlCandidates = (
  source: string | undefined,
  folder: 'rumah' | 'aset'
) => {
  const value = source?.trim();

  if (!value) {
    return [];
  }

  const candidates = [value];

  if (value.startsWith('/media/')) {
    candidates.push(`${API_BASE_URL}${value}`);
  } else if (value.startsWith('media/')) {
    candidates.push(`${API_BASE_URL}/${value}`);
    candidates.push(`/${value}`);
  } else if (value.startsWith('warga/')) {
    candidates.push(`${API_BASE_URL}/media/${value}`);
    candidates.push(`/media/${value}`);
  } else if (!/^https?:\/\//i.test(value) && !value.startsWith('data:')) {
    candidates.push(`${API_BASE_URL}/media/warga/${folder}/${value}`);
    candidates.push(`/media/warga/${folder}/${value}`);
  }

  return candidates.filter(
    (candidate, index) => candidates.indexOf(candidate) === index
  );
};
