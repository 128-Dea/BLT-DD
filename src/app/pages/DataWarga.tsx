import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Edit, Trash2, Calculator, Eye } from 'lucide-react';
import { logActivity } from '../utils/activityLogger';
import { deleteWargaById, loadAccessibleWarga } from '../utils/wargaData';

interface WargaData {
  id: string;
  nik: string;
  nama: string;
  alamat: string;
  jumlahAnggota: string;
  jumlahTanggungan: string;
  pendapatan: string;
  pekerjaan: string;
  tanggal: string;
  nilaiAkhir: number | null;
  fotoRumah?: string;
  statusKK?: string;
statusTinggal?: string;
sumberAir?: string;
statusPekerjaan?: string;
kepemilikanUsaha?: string;
riwayatBantuan?: string;
kepemilikanAset?: string;
aset?: string;
fotoAset?: string[];
}

export function DataWarga() {
  const navigate = useNavigate();
  const [dataWarga, setDataWarga] = useState<WargaData[]>([]);
  const [selectedWarga, setSelectedWarga] = useState<WargaData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

const loadData = async () => {
  const data = await loadAccessibleWarga();

  const mappedData: WargaData[] = data.map((w: any) => ({
    id: w.id,
    nik: w.nik ?? '',
    nama: w.nama ?? '',
    alamat: w.alamat ?? '',
    jumlahAnggota: w.jumlahAnggota ?? '',
    jumlahTanggungan: w.jumlahTanggungan ?? '',
    pendapatan: w.pendapatan ?? '',
    pekerjaan: w.pekerjaan ?? '',
    tanggal: w.tanggal ?? '',
    nilaiAkhir: w.nilaiAkhir ?? null,
    fotoRumah: w.fotoRumah,
    statusKK: w.statusKK,
    statusTinggal: w.statusTinggal,
    sumberAir: w.sumberAir,
    statusPekerjaan: w.statusPekerjaan,
    kepemilikanUsaha: w.kepemilikanUsaha,
    riwayatBantuan: w.riwayatBantuan,
    kepemilikanAset: w.kepemilikanAset,
    aset: w.aset,
    fotoAset: w.fotoAset,
  }));

  const unprocessedData = mappedData.filter(
    (w) => w.nilaiAkhir === null
  );

  setDataWarga(unprocessedData);
};

const handleDelete = async (id: string, nama: string) => {
  if (confirm(`Hapus data warga ${nama}?`)) {
    await deleteWargaById(id);

    // TAMBAHAN WAJIB BIAR MASUK RIWAYAT
    logActivity(
      'hapus',
      nama,
      `Menghapus data warga ${nama}`
    );

    loadData();

    alert('✓ Data berhasil dihapus!');
  }
};
  const handleHitung = (id: string) => {
    localStorage.setItem('currentWargaId', id);
    navigate('/input-kriteria');
  };

  const getPendapatanLabel = (kategori: string) => {
    const labels: any = {
      sangat_miskin: "Kurang dari Rp 1.500.000",
      miskin: "Rp 1.500.000 - Rp 2.500.000",
      rentan_miskin: "Rp 2.500.000 - Rp 3.500.000",
      tidak_layak: "Lebih dari Rp 3.500.000",
    };
  
    return labels[kategori] || kategori;
  };

  const capitalizeFirst = (text: string) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
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
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] bg-clip-text text-transparent">
                  Data Warga
                </h1>
                <p className="text-sm text-gray-600">Data warga yang belum dinilai</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-[#386fa4]" />
              <h2 className="text-xl font-semibold text-gray-900">
                Total Data: {dataWarga.length}
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/input-data-warga')}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] text-white rounded-lg transition shadow-lg shadow-blue-500/30"
            >
              + Tambah Data Warga
            </motion.button>
          </div>

          {dataWarga.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Belum ada data warga</p>
              <p className="text-gray-400 text-sm mt-2">Tambahkan data warga untuk memulai penilaian</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      NIK
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Alamat
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Tanggungan
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Pendapatan
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dataWarga.map((warga, index) => (
                    <motion.tr
                      key={warga.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-blue-50 transition"
                    >
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {warga.tanggal}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {warga.nik}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {capitalizeFirst(warga.nama)}
                      </td>
                      
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                        {capitalizeFirst(warga.alamat)}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                        {warga.jumlahTanggungan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                            warga.pendapatan === "sangat_miskin"
                              ? "bg-red-100 text-red-700"
                              : warga.pendapatan === "miskin"
                              ? "bg-orange-100 text-orange-700"
                              : warga.pendapatan === "rentan_miskin"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {getPendapatanLabel(warga.pendapatan)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedWarga(warga)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleHitung(warga.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Hitung Penilaian"
                          >
                            <Calculator className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(warga.id, warga.nama)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 text-left group"
        >
          <p className="text-sm text-blue-900">
            <strong>Catatan:</strong> Data warga yang ditampilkan di sini adalah data yang sudah diinput
            tetapi belum dilakukan penilaian. Klik tombol <strong>Hitung</strong> untuk melanjutkan ke
            proses penilaian menggunakan metode AHP.
          </p>
        </motion.div>
      </main>

{/* Detail Modal */}
{selectedWarga && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={() => setSelectedWarga(null)}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden"
    >
      <div className="max-h-[90vh] overflow-y-auto">

      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] text-white p-6 rounded-t-2xl relative shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Detail Warga</h2>
          <p>{selectedWarga.nama}</p>
        </div>

        <button
          onClick={() => setSelectedWarga(null)}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-white text-2xl hover:text-gray-300 transition"
        >
          ✕
        </button>
      </div>

     {/* CONTENT */}
<div className="p-6 pt-5 space-y-6 relative z-10 bg-white">

  {/* TANGGAL INPUT (BOX SENDIRI) */}
  <div className="flex justify-center">
    <div className="bg-blue-50 px-6 py-3 rounded-xl border w-fit text-center">
      <h3 className="font-semibold text-sm text-[#386fa4] mb-1">
        Tanggal Input
      </h3>

      <p className="font-medium text-gray-900">
        {selectedWarga.tanggal}
      </p>
    </div>
  </div>
  {/* DATA PRIBADI */}
  <div className="bg-blue-50 p-4 rounded-xl border">
  <h3 className="font-bold text-lg text-[#386fa4] mb-4">
    Data Pribadi
  </h3>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <p className="text-sm text-gray-600">NIK</p>
      <p className="font-medium">{selectedWarga.nik}</p>
    </div>

    <div>
      <p className="text-sm text-gray-600">Nama</p>
      <p className="font-medium">
        {capitalizeFirst(selectedWarga.nama)}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-600">Alamat</p>
      <p className="font-medium">
        {capitalizeFirst(selectedWarga.alamat)}
      </p>
    </div>
    </div>
  </div>


  {/* DATA KELUARGA */}
  <div className="bg-blue-50 p-4 rounded-xl border">
    <h3 className="font-bold text-lg text-[#386fa4] mb-4">
      Data Keluarga
    </h3>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-600">Jumlah Anggota</p>
        <p className="font-medium">{capitalizeFirst(selectedWarga.jumlahAnggota)}</p>
      </div>

      <div>
        <p className="text-sm text-gray-600">Jumlah Tanggungan</p>
        <p className="font-medium">{capitalizeFirst(selectedWarga.jumlahTanggungan)}</p>
      </div>

      <div>
        <p className="text-sm text-gray-600">Status KK</p>
        <p className="font-medium">{capitalizeFirst(selectedWarga?.statusKK || "")}</p>
      </div>
    </div>
  </div>

                            {/* KONDISI TEMPAT TINGGAL */}
                           <div className="bg-blue-50 p-4 rounded-xl">
                            <h3 className="font-bold text-lg text-[#386fa4] mb-4">
                                Kondisi Tempat Tinggal
                              </h3>
                      
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">Status Tempat Tinggal</p>
                                  <p className="font-medium">{capitalizeFirst(selectedWarga?.statusTinggal || "")}</p>
                                </div>
                      
                                <div>
                                  <p className="text-sm text-gray-600">Sumber Air</p>
                                  <p className="font-medium">{capitalizeFirst(selectedWarga?.sumberAir || "")}</p>
                                </div>
                              </div>
                      
                              {selectedWarga.fotoRumah && (
                                <div className="mt-5">
                                  <p className="text-sm text-gray-600 mb-2">Foto Rumah</p>
                                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                                    <div className="flex items-center justify-center overflow-hidden rounded-lg bg-slate-100 min-h-[240px] max-h-[420px]">
                                      <img
                                        src={selectedWarga.fotoRumah}
                                        alt="Foto Rumah"
                                        className="w-full h-full max-h-[280px] object-contain"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>


  {/* DATA EKONOMI */}
  <div className="bg-blue-50 p-4 rounded-xl border">
    <h3 className="font-bold text-lg text-[#386fa4] mb-4">
      Data Ekonomi
    </h3>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-600">Pendapatan</p>
        <p className="font-medium">
          {getPendapatanLabel(selectedWarga.pendapatan)}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-600">Pekerjaan</p>
        <p className="font-medium">{capitalizeFirst(selectedWarga.pekerjaan)}</p>
      </div>

      <div>
        <p className="text-sm text-gray-600">Status Kerja</p>
        <p className="font-medium">{capitalizeFirst(selectedWarga?.statusPekerjaan || "")}</p>
      </div>

      <div>
        <p className="text-sm text-gray-600">Usaha Sendiri</p>
        <p className="font-medium">{capitalizeFirst(selectedWarga?.kepemilikanUsaha || "")}</p>
      </div>
    </div>
  </div>


  {/* BANTUAN DAN ASET */}
  <div className="bg-blue-50 p-4 rounded-xl border">
    <h3 className="font-bold text-lg text-[#386fa4] mb-4">
      Bantuan & Aset
    </h3>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-600">Riwayat Bantuan</p>
        <p className="font-medium">
          {selectedWarga.riwayatBantuan === "belum_pernah"
            ? "Belum Pernah"
            : selectedWarga.riwayatBantuan === "blt"
            ? "Sedang Menerima"
            : "Pernah"}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-600">Kepemilikan Aset</p>
        <p className="font-medium">
          {selectedWarga.kepemilikanAset === "tidak_ada" || !selectedWarga.kepemilikanAset
            ? "Tidak Ada"
            : selectedWarga.kepemilikanAset === "kendaraan"
            ? "Kendaraan"
            : selectedWarga.kepemilikanAset === "tanah_bangunan"
            ? "Tanah/Bangunan"
            : selectedWarga.kepemilikanAset === "lainnya"
            ? "Lainnya"
            : "Tidak Ada"}
        </p>
      </div>
    </div>

{selectedWarga.fotoAset &&
  Array.isArray(selectedWarga.fotoAset) &&
  selectedWarga.fotoAset.length > 0 && (
    <div className="mt-4">
      <p className="text-sm text-gray-600 mb-2">
        Foto Aset
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedWarga.fotoAset.map((foto, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div className="flex items-center justify-center overflow-hidden rounded-lg bg-slate-100 min-h-[180px] max-h-[260px]">
              <img
                src={foto}
                alt={`Foto Aset ${index + 1}`}
                className="w-full h-full max-h-[230px] object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
)}
    
 </div>

  {/* HASIL PENILAIAN */}
  {selectedWarga.nilaiAkhir !== null && (
    <div className="bg-red-50 p-4 rounded-xl border">
      <h3 className="font-bold text-lg text-red-700 mb-4">
        Hasil Penilaian
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Nilai Akhir</p>
          <p className="font-medium">
            {selectedWarga.nilaiAkhir.toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Status</p>
          <p className="font-medium">
            Sudah Dinilai
          </p>
        </div>
      </div>
    </div>
  )}


  {/* BUTTON */}
  <div className="pt-4 border-t">
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        handleHitung(selectedWarga.id);
        setSelectedWarga(null);
      }}
      className="w-full px-6 py-3 bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] text-white rounded-lg"
    >
      Lanjut ke Penilaian
    </motion.button>
  </div>

</div>
      </div>
    </motion.div>
  </motion.div>
)}
    </div>
  );
}
