import { isNetworkError, NETWORK_ERROR_MESSAGE } from './api';

export const WARGA_SAVE_SUCCESS_MESSAGE =
  'Data warga berhasil disimpan.';

export const WARGA_SAVE_PENDING_MESSAGE =
  'Data warga disimpan sementara di perangkat ini, tetapi belum berhasil diproses di database. Periksa koneksi atau izin database, lalu coba lagi.';

export const WARGA_UPDATE_PENDING_MESSAGE =
  'Perubahan data disimpan sementara di perangkat ini, tetapi belum berhasil diproses di database. Periksa koneksi atau izin database, lalu coba lagi.';

export const WARGA_LOAD_FALLBACK_MESSAGE =
  'Data dari database tidak dapat dimuat. Sistem menampilkan data yang tersedia di perangkat ini.';

export const WARGA_SAVE_FAILED_MESSAGE =
  'Data warga gagal disimpan. Periksa koneksi atau layanan backend, lalu coba lagi.';

export const getWargaProcessMessage = (
  error: unknown,
  fallbackMessage: string
) => {
  return isNetworkError(error) ? NETWORK_ERROR_MESSAGE : fallbackMessage;
};

