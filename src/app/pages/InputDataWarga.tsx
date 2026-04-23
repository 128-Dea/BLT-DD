import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { motion } from 'motion/react';
import { ArrowLeft, Save, Users, Upload, Trash2 } from 'lucide-react';
import { logActivity } from '../utils/activityLogger';
import { FirebaseError } from 'firebase/app';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { restoreCurrentUser } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const PEKERJAAN_OPTIONS = [
  'Tidak / Belum Bekerja',
  'Ibu Rumah Tangga',
  'Petani',
  'Buruh Tani',
  'Nelayan',
  'Peternak',
  'Pedagang / Usaha Mikro / UMKM',
  'Wiraswasta / Usaha Sendiri',
  'Karyawan Swasta/Buruh Pabrik',
  'Buruh Harian Lepas',
  'Tukang Bangunan',
  'Driver / Supir',
  'Ojek / Ojek Online',
  'PNS (Pegawai Negeri Sipil)',
  'TNI / POLRI',
  'Guru / Tenaga Pendidik',
  'Tenaga Kesehatan',
  'Pensiunan',
  'ART (Asisten Rumah Tangga)',
  'Security / Satpam',
  'Montir',
  'Penjahit',
  'Lainnya'
];

export function InputDataWarga() {
  const navigate = useNavigate();
  const [fotoRumah, setFotoRumah] = useState<File | null>(null);
  const [previewRumah, setPreviewRumah] = useState<string>('');
  const [fotoAset, setFotoAset] = useState<File[]>([]);
  const [previewAset, setPreviewAset] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    nik: '',
    nama: '',
    alamat: '',
    jumlahAnggota: '',
    jumlahTanggungan: '',
    statusKK: 'sendiri',
    statusTinggal: 'tetap',
    sumberAir: 'pam',
    pendapatan: '',
    pekerjaan: '',
    pekerjaanLainnya: '',
    statusPekerjaan: 'tetap',
    kepemilikanUsaha: 'tidak',
    kepemilikanAset: 'tidak',
    riwayatBantuan: 'belum_pernah'
  });

  const uploadMedia = async () => {
    if (!fotoRumah) {
      throw new Error('Foto rumah wajib diupload');
    }

    const payload = new FormData();
    payload.append('foto_rumah', fotoRumah);
    payload.append('kepemilikan_aset', formData.kepemilikanAset);

    fotoAset.forEach((file) => {
      payload.append('foto_aset', file);
    });

    const response = await fetch(`${API_BASE_URL}/api/warga/upload-media/`, {
      method: 'POST',
      body: payload,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Upload media gagal');
    }

    return result as { foto_rumah: string; foto_aset: string[] };
  };

  const saveToLocalStorage = (data: Record<string, unknown>) => {
    const existingData = JSON.parse(localStorage.getItem('dataWarga') || '[]');
    existingData.unshift(data);
    localStorage.setItem('dataWarga', JSON.stringify(existingData));
  };

  const isFirestorePermissionError = (error: unknown) => {
    return (
      error instanceof FirebaseError &&
      (error.code === 'permission-denied' ||
        error.code === 'firestore/permission-denied')
    );
  };

  const handleFotoRumahChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoRumah(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewRumah(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFotoAsetChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 0) {
      setFotoAset((prev) => [...prev, ...files]);

      files.forEach((file) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          setPreviewAset((prev) => [
            ...prev,
            reader.result as string,
          ]);
        };

        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = ['nik', 'nama', 'alamat', 'jumlahAnggota', 'jumlahTanggungan', 'pendapatan', 'pekerjaan'];
    const isComplete = requiredFields.every(field => formData[field as keyof typeof formData]);

    if (!isComplete) {
      alert('Mohon lengkapi semua data yang wajib diisi!');
      return;
    }

    if (!fotoRumah) {
      alert('Mohon upload foto rumah!');
      return;
    }

    if (formData.kepemilikanAset !== 'tidak' && fotoAset.length === 0) {
      alert('Mohon upload foto kepemilikan aset!');
      return;
    }

    if (formData.pekerjaan === 'Lainnya' && !formData.pekerjaanLainnya) {
      alert('Mohon sebutkan jenis pekerjaan lainnya!');
      return;
    }

    try {
      const uploadedMedia = await uploadMedia();
      const tanggal = new Date().toLocaleString('id-ID');
      const newData = {
        nik: formData.nik,
        nama: formData.nama,
        alamat: formData.alamat,
        jumlahAnggota: formData.jumlahAnggota,
        jumlahTanggungan: formData.jumlahTanggungan,
        statusKK: formData.statusKK,
        statusTinggal: formData.statusTinggal,
        sumberAir: formData.sumberAir,
        pendapatan: formData.pendapatan,
        pekerjaan:
          formData.pekerjaan === 'Lainnya'
            ? formData.pekerjaanLainnya
            : formData.pekerjaan,
        statusPekerjaan: formData.statusPekerjaan,
        kepemilikanUsaha: formData.kepemilikanUsaha,
        kepemilikanAset: formData.kepemilikanAset,
        riwayatBantuan: formData.riwayatBantuan,
        fotoRumah: uploadedMedia.foto_rumah,
        fotoAset: uploadedMedia.foto_aset,
        tanggal,
        createdAt: new Date().toISOString(),
        status: null,
        nilaiAkhir: null,
        statusApproval: 'Pending'
      };
      await restoreCurrentUser().catch(() => null);

      let savedId = `local-${Date.now()}`;
      let syncStatus: 'synced' | 'pending_firestore' = 'pending_firestore';

      if (auth.currentUser) {
        try {
          const docRef = await addDoc(collection(db, "dataWarga"), newData);
          savedId = docRef.id;
          syncStatus = 'synced';
        } catch (firestoreError) {
          if (!isFirestorePermissionError(firestoreError)) {
            throw firestoreError;
          }
        }
      }

      saveToLocalStorage({
        id: savedId,
        ...newData,
        firebaseSyncStatus: syncStatus,
      });

      logActivity('tambah', `${formData.nik} - ${formData.nama}`, `Menambahkan data warga baru: ${formData.nama}`);

      alert('Data warga berhasil disimpan');

      navigate('/data-warga');
    } catch (error: any) {
      console.error(error);
      alert(`Gagal simpan data: ${error?.message || 'Terjadi kesalahan'}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
   <div className="min-h-screen bg-[#e6f0fa]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/dashboard-perangkat')}
              className="p-2 hover:bg-blue-50 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </motion.button>
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] bg-clip-text text-transparent">
                Input Data Warga
              </h1>
              <p className="text-sm text-gray-600">
                Masukkan data calon penerima BLT-DD
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          {/* Data Identitas */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <Users className="w-6 h-6 text-[#386fa4]" />
              <h2 className="text-xl font-semibold text-gray-900">Data Identitas</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nik" className="block text-sm font-medium text-gray-700 mb-2">
                  NIK <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nik"
                  name="nik"
                  required
                  value={formData.nik}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nama"
                  name="nama"
                  required
                  value={formData.nama}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                  placeholder="Nama Kepala Keluarga"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Domisili <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="alamat"
                  name="alamat"
                  required
                  value={formData.alamat}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                  placeholder="Alamat lengkap"
                />
              </div>
            </div>
          </div>

          {/* Data Keluarga */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Keluarga</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="jumlahAnggota" className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Anggota Keluarga <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="jumlahAnggota"
                  name="jumlahAnggota"
                  required
                  min="1"
                  value={formData.jumlahAnggota}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                  placeholder="Jumlah orang"
                />
              </div>

              <div>
                <label htmlFor="jumlahTanggungan" className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Tanggungan <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="jumlahTanggungan"
                  name="jumlahTanggungan"
                  required
                  min="0"
                  value={formData.jumlahTanggungan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                  placeholder="Jumlah tanggungan"
                />
              </div>

              <div>
                <label htmlFor="statusKK" className="block text-sm font-medium text-gray-700 mb-2">
                  Status Kepemilikan KK
                </label>
                <select
                  id="statusKK"
                  name="statusKK"
                  value={formData.statusKK}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                >
                  <option value="sendiri">Sendiri</option>
                  <option value="ikut_kk_lain">Ikut KK Lain</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Tempat Tinggal */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Tempat Tinggal</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="statusTinggal" className="block text-sm font-medium text-gray-700 mb-2">
                  Status Tinggal
                </label>
                <select
                  id="statusTinggal"
                  name="statusTinggal"
                  value={formData.statusTinggal}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                >
                  <option value="tetap">Tetap</option>
                  <option value="kontrak">Kontrak</option>
                </select>
              </div>

              <div>
                <label htmlFor="sumberAir" className="block text-sm font-medium text-gray-700 mb-2">
                  Sumber Air
                </label>
                <select
                  id="sumberAir"
                  name="sumberAir"
                  value={formData.sumberAir}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                >
                  <option value="pam">PAM</option>
                  <option value="sumur">Sumur</option>
                  <option value="sungai">Sungai</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="fotoRumah" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Foto Rumah <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#386fa4] transition">
                  {previewRumah ? (
                    <div className="relative flex justify-center">
                      <img
                        src={previewRumah}
                        alt="Preview"
                        className="w-full h-auto max-h-[500px] object-contain rounded-lg border shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFotoRumah(null);
                          setPreviewRumah('');
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600 mb-1">Klik untuk upload foto rumah</span>
                      <span className="text-xs text-gray-400">PNG, JPG hingga 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoRumahChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Data Ekonomi */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Ekonomi</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="pendapatan" className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Pendapatan per Bulan <span className="text-red-500">*</span>
                </label>
                <select
                  id="pendapatan"
                  name="pendapatan"
                  required
                  value={formData.pendapatan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                >
                  <option value="">Pilih kategori pendapatan</option>
                  <option value="sangat_miskin"> Kurang dari Rp 1.500.000</option>
                  <option value="miskin"> Rp 1.500.000 - Rp 2.500.000</option>
                  <option value="rentan_miskin"> Rp 2.500.000 - Rp 3.500.000</option>
                  <option value="tidak_layak"> Lebih dari Rp 3.500.000</option>
                </select>
              </div>

              <div>
                <label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700 mb-2">
                  Pekerjaan Utama <span className="text-red-500">*</span>
                </label>
                <select
                  id="pekerjaan"
                  name="pekerjaan"
                  required
                  value={formData.pekerjaan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                >
                  <option value="">Pilih pekerjaan</option>
                  {PEKERJAAN_OPTIONS.map((pekerjaan) => (
                    <option key={pekerjaan} value={pekerjaan}>
                      {pekerjaan}
                    </option>
                  ))}
                </select>
              </div>

              {formData.pekerjaan === 'Lainnya' && (
                <div>
                  <label htmlFor="pekerjaanLainnya" className="block text-sm font-medium text-gray-700 mb-2">
                    Sebutkan Pekerjaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="pekerjaanLainnya"
                    name="pekerjaanLainnya"
                    required
                    value={formData.pekerjaanLainnya}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                    placeholder="Tuliskan jenis pekerjaan"
                  />
                </div>
              )}

              <div>
                <label htmlFor="statusPekerjaan" className="block text-sm font-medium text-gray-700 mb-2">
                  Status Pekerjaan
                </label>
                <select
                  id="statusPekerjaan"
                  name="statusPekerjaan"
                  value={formData.statusPekerjaan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                >
                  <option value="tetap">Tetap</option>
                  <option value="tidak_tetap">Tidak Tetap</option>
                </select>
              </div>

              <div>
                <label htmlFor="kepemilikanUsaha" className="block text-sm font-medium text-gray-700 mb-2">
                  Kepemilikan Usaha Sendiri
                </label>
                <select
                  id="kepemilikanUsaha"
                  name="kepemilikanUsaha"
                  value={formData.kepemilikanUsaha}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                >
                  <option value="ya">Ya</option>
                  <option value="tidak">Tidak</option>
                </select>
              </div>

              <div>
                <label htmlFor="kepemilikanAset" className="block text-sm font-medium text-gray-700 mb-2">
                  Kepemilikan Aset
                </label>
                <select
                  id="kepemilikanAset"
                  name="kepemilikanAset"
                  value={formData.kepemilikanAset}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                >
                  <option value="tidak">Tidak Ada</option>
                  <option value="kendaraan">Kendaraan</option>
                  <option value="tanah_bangunan">Tanah/Bangunan</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              {formData.kepemilikanAset !== 'tidak' && (
                <div className="md:col-span-2">
                  <label htmlFor="fotoAset" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Foto Kepemilikan Aset <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#386fa4] transition">
                    {previewAset.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {previewAset.map((foto, index) => (
                          <div key={index} className="relative">
                            <img
                              src={foto}
                              alt={`Preview ${index}`}
                              className="w-full h-40 object-cover rounded-lg border"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                setPreviewAset((prev) =>
                                  prev.filter((_, i) => i !== index)
                                );

                                setFotoAset((prev) =>
                                  prev.filter((_, i) => i !== index)
                                );
                              }}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <label className="flex flex-col items-center cursor-pointer">
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600 mb-1">Klik untuk upload foto aset</span>
                        <span className="text-xs text-gray-400">PNG, JPG hingga 5MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFotoAsetChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="riwayatBantuan" className="block text-sm font-medium text-gray-700 mb-2">
                  Riwayat Bantuan Sosial
                </label>
                <select
                  id="riwayatBantuan"
                  name="riwayatBantuan"
                  value={formData.riwayatBantuan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                >
                  <option value="belum_pernah">Belum Pernah</option>
                  <option value="pernah">Pernah</option>
                  <option value="sedang_menerima">Sedang Menerima</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate('/dashboard-perangkat')}
              className="px-6 py-2 text-black bg-gray-300 hover:bg-gray-400 hover:text-white rounded-lg transition"
            >
              Batal
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] text-white rounded-lg transition shadow-lg shadow-blue-500/30"
            >
              <Save className="w-5 h-5" />
              <span>Simpan & Lanjutkan</span>
            </motion.button>
          </div>
        </motion.form>
      </main>
    </div>
  );
}
