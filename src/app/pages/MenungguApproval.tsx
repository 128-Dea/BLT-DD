import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Eye, UserCheck, XCircle } from 'lucide-react';
import { loadAccessibleWarga } from '../utils/wargaData';

interface WargaData {
  id: string;
  nik: string;
  nama: string;
  alamat: string;
  jumlahAnggota: number;
  jumlahTanggungan: number;
  pendapatan: string;
  pekerjaan: string;
  tanggal: string;
  nilaiAkhir: number;
  status: 'Layak' | 'Tidak Layak';
  statusApproval?: 'Pending' | 'Disetujui' | 'Ditolak';
  terkirim?: boolean;
  bobotKriteria?: number[];
}

export function MenungguApproval() {
  const navigate = useNavigate();
  const [dataWarga, setDataWarga] = useState<WargaData[]>([]);
  const [selectedWarga, setSelectedWarga] = useState<WargaData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await loadAccessibleWarga();

    const pendingData: WargaData[] = data
      .filter((w: any) =>
        w.terkirim &&
        w.nilaiAkhir !== null &&
        (w.statusApproval === 'Pending' || !w.statusApproval)
      )
      .map((w: any) => ({
        id: w.id,
        nik: w.nik || "",
        nama: w.nama || "",
        alamat: w.alamat || "",
        jumlahAnggota: Number(w.jumlahAnggota || 0),
        jumlahTanggungan: Number(w.jumlahTanggungan || 0),
        pendapatan: w.pendapatan || "",
        pekerjaan: w.pekerjaan || "",
        tanggal: w.tanggal || "",
        nilaiAkhir: w.nilaiAkhir || 0,
        status: w.status || "Tidak Layak",
        statusApproval: w.statusApproval || "Pending",
        terkirim: w.terkirim || false,
        bobotKriteria: w.bobotKriteria || []
      }));

    setDataWarga(pendingData);
  };

  const getPendapatanLabel = (kategori: string) => {
    const labels: any = {
      'sangat_miskin': 'Sangat Miskin',
      'miskin': 'Miskin',
      'rentan_miskin': 'Rentan Miskin',
      'tidak_layak': 'Tidak Layak'
    };
    return labels[kategori] || kategori;
  };

  const layakCount = dataWarga.filter(w => w.status === 'Layak').length;
  const tidakLayakCount = dataWarga.filter(w => w.status === 'Tidak Layak').length;

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
                  Menunggu Approval
                </h1>
                <p className="text-sm text-gray-600">Data yang menunggu persetujuan Kepala Desa</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Menunggu Review</p>
                <p className="text-3xl font-bold text-orange-600">{dataWarga.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Layak</p>
                <p className="text-3xl font-bold text-blue-600">{layakCount}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tidak Layak</p>
                <p className="text-3xl font-bold text-gray-600">{tidakLayakCount}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Daftar Menunggu Approval ({dataWarga.length})
              </h2>
            </div>
          </div>

          {dataWarga.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Tidak ada data yang menunggu approval</p>
              <p className="text-gray-400 text-sm mt-2">Data akan muncul di sini setelah dikirim ke Kepala Desa</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      NIK
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Nilai Akhir
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status Kelayakan
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
                      className="hover:bg-orange-50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                        {warga.tanggal}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                        {warga.nik}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                        {capitalizeFirst(warga.nama)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
                        {warga.nilaiAkhir.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            warga.status === 'Layak'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {warga.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedWarga(warga)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
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
          className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <p className="text-sm text-gray-600">
            <strong>Catatan:</strong> Data yang ditampilkan adalah data yang telah dikirim ke Kepala Desa 
            dan sedang menunggu persetujuan. Status akan berubah setelah Kepala Desa menyetujui atau menolak.
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
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
<div className="sticky top-0 bg-gradient-to-r from-orange-600 to-yellow-600 text-white p-6 rounded-t-2xl relative">
  
  {/*  JUDUL TENGAH */}
  <div className="text-center">
    <h2 className="text-2xl font-bold mb-1">Detail - Menunggu Approval</h2>
    <p className="text-orange-100">{selectedWarga.nama}</p>
  </div>

  {/*  TOMBOL KANAN */}
  <button
    onClick={() => setSelectedWarga(null)}
    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-lg transition"
  >
    ✕
  </button>

</div>

            <div className="p-6 space-y-6">
              {/* Data Identitas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Identitas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">NIK</p>
                    <p className="font-medium text-gray-900">{selectedWarga.nik}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nama Lengkap</p>
                    <p className="font-medium text-gray-900">{capitalizeFirst(selectedWarga.nama)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Alamat</p>
                    <p className="font-medium text-gray-900">{capitalizeFirst(selectedWarga.alamat)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Kategori Pendapatan</p>
                    <p className="font-medium text-gray-900">{getPendapatanLabel(selectedWarga.pendapatan)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pekerjaan</p>
                    <p className="font-medium text-gray-900">{selectedWarga.pekerjaan}</p>
                  </div>
                </div>
              </div>

              {/* Hasil Penilaian */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hasil Penilaian</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Nilai Akhir</p>
                    <p className="text-3xl font-bold text-blue-600">{selectedWarga.nilaiAkhir.toFixed(2)}</p>
                  </div>
                  <div className={`rounded-lg p-4 text-center ${
                    selectedWarga.status === 'Layak' ? 'bg-blue-50' : 'bg-gray-50'
                  }`}>
                    <p className="text-sm text-gray-600 mb-1">Status Kelayakan</p>
                    <p className={`text-2xl font-bold ${
                      selectedWarga.status === 'Layak' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {selectedWarga.status}
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="text-orange-700 font-medium">Menunggu Persetujuan Kepala Desa</span>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600 text-center">
                  Tanggal Penilaian: {selectedWarga.tanggal}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
