import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, History as HistoryIcon, Search, Trash2, Eye, X } from 'lucide-react';
import { RiwayatActivity } from './RiwayatActivity'; 
import { deleteWargaById, loadAccessibleWarga } from '../utils/wargaData';

interface RiwayatData {
  id: string;
  nik: string;
  nama: string;
  alamat: string;
  jumlahAnggota: number;
  jumlahTanggungan: number;
  pendapatan: string;
  pekerjaan: string;
  nilaiAkhir: number;
  status: 'Layak' | 'Tidak Layak';
  statusApproval: 'Pending' | 'Disetujui' | 'Ditolak';
  tanggal: string;
  bobotKriteria?: number[];
  terkirim?: boolean;
}

export function Riwayat() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [riwayatData, setRiwayatData] = useState<RiwayatData[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<RiwayatData | null>(null);
  const [userRole, setUserRole] = useState<'perangkat' | 'kepala'>('perangkat');

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const role = currentUser.email?.includes('@kades.com') ? 'kepala' : 'perangkat';
    setUserRole(role);

    if (role === 'kepala') {
      loadData();
    }
  }, []);

  const loadData = async () => {
    const data = await loadAccessibleWarga();

    const mapped: RiwayatData[] = data
      .filter((w: any) => w.nilaiAkhir !== null && w.nilaiAkhir !== undefined)
      .map((w: any) => ({
        id: w.id,
        nik: w.nik || "",
        nama: w.nama || "",
        alamat: w.alamat || "",
        jumlahAnggota: Number(w.jumlahAnggota || 0),
        jumlahTanggungan: Number(w.jumlahTanggungan || 0),
        pendapatan: w.pendapatan || "",
        pekerjaan: w.pekerjaan || "",
        nilaiAkhir: w.nilaiAkhir || 0,
        status: w.status || "Tidak Layak",
        statusApproval: w.statusApproval || "Pending",
        tanggal: w.tanggal || "",
        bobotKriteria: w.bobotKriteria || [],
        terkirim: w.terkirim || false,
      }));

    setRiwayatData(mapped);
  };

  // 🔥 FIX: LOG PER USER
  const saveActivity = (aksi: string, deskripsi: string) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userId = currentUser.email;

    const logs = JSON.parse(localStorage.getItem(`activityLogs_${userId}`) || '[]');

    const newLog = {
      id: Date.now().toString(),
      aksi,
      deskripsi,
      tanggal: new Date().toLocaleString()
    };

    localStorage.setItem(`activityLogs_${userId}`, JSON.stringify([newLog, ...logs]));
  };

  const filteredData = riwayatData.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nik.includes(searchTerm)
  );

  const handleHapus = async (id: string, nama: string) => {
    const item = riwayatData.find(r => r.id === id);

    if (item?.statusApproval === 'Disetujui') {
      alert('Data yang sudah disetujui tidak dapat dihapus!');
      return;
    }

    if (confirm(`Hapus riwayat penilaian untuk ${nama}?`)) {
      await deleteWargaById(id);

      // 🔥 LOG PER USER
      saveActivity('hapus', `Menghapus data ${nama}`);

      loadData();
      alert('✓ Riwayat berhasil dihapus!');
    }
  };

  const handleLihatDetail = (item: RiwayatData) => {
    setSelectedDetail(item);
  };

  // 🔥 INI BAGIAN PALING PENTING (GANTI UI)
  if (userRole === 'perangkat') {
    return <RiwayatActivity />;
  }
    const capitalizeFirst = (text: string) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
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

  const bobotLabels = [
  'Pendapatan',
  'Jumlah Tanggungan',
  'Kondisi Rumah',
  'Pekerjaan',
  'Aset'
];
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-blue-50 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </motion.button>
            <div className="flex-1 text-center">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] bg-clip-text text-transparent">
                  Riwayat Penilaian
                </h1>
                <p className="text-sm text-gray-600">Arsip data penilaian BLT-DD</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <HistoryIcon className="w-6 h-6 text-[#386fa4]" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Total Riwayat: {riwayatData.length}
                </h2>
              </div>
              
              {/* Search */}
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama atau NIK..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 mb-1">Total Penilaian</p>
                <p className="text-2xl font-bold text-blue-700">{riwayatData.length}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4">
                <p className="text-sm text-emerald-600 mb-1">Layak</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {riwayatData.filter(d => d.status === 'Layak').length}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-orange-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-orange-700">
                  {riwayatData.filter(d => d.statusApproval === 'Pending').length}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 mb-1">Disetujui</p>
                <p className="text-2xl font-bold text-purple-700">
                  {riwayatData.filter(d => d.statusApproval === 'Disetujui').length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
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
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Nilai Akhir
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status Kelayakan
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status Approval
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <HistoryIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {searchTerm ? 'Tidak ada data yang ditemukan' : 'Belum ada riwayat penilaian'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-blue-50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.tanggal}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.nik}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {capitalizeFirst(item.nama)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {item.nilaiAkhir.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.status === 'Layak'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.statusApproval === 'Disetujui'
                              ? 'bg-emerald-100 text-emerald-700'
                              : item.statusApproval === 'Ditolak'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {item.statusApproval}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleLihatDetail(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleHapus(item.id, item.nama)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                            title="Hapus"
                            disabled={item.statusApproval === 'Disetujui'}
                          >
                            <Trash2 className={`w-4 h-4 ${item.statusApproval === 'Disetujui' ? 'opacity-30' : ''}`} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Info Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 text-left group"
        >
          <p className="text-sm text-blue-900">
            <strong>Catatan:</strong> Data riwayat tersimpan secara otomatis setelah proses penilaian selesai. 
            Anda dapat menghapus riwayat tertentu, namun data yang telah disetujui tidak dapat dihapus.
          </p>
        </motion.div>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] text-white p-6 rounded-t-2xl relative">
                
                {/* Tengah */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-1">Detail Penilaian</h2>
                  <p className="text-blue-100">{selectedDetail.nama}</p>
                </div>
              
                {/* Tombol kanan */}
                <button
                  onClick={() => setSelectedDetail(null)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Data Identitas */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Identitas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">NIK</p>
                      <p className="font-medium text-gray-900">{selectedDetail.nik}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Nama Lengkap</p>
                     <p className="font-medium text-gray-900">
                            {capitalizeFirst(selectedDetail.nama)}
                          </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Alamat</p>
                     <p className="font-medium text-gray-900">
  {capitalizeFirst(selectedDetail.alamat)}
</p>
                    </div>
                  </div>
                </div>

                {/* Data Keluarga & Ekonomi */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Keluarga & Ekonomi</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Jumlah Anggota Keluarga</p>
                      <p className="font-medium text-gray-900">{selectedDetail.jumlahAnggota} orang</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Jumlah Tanggungan</p>
                      <p className="font-medium text-gray-900">{selectedDetail.jumlahTanggungan} orang</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Kategori Pendapatan</p>
                      <p className="font-medium text-gray-900">
  {capitalizeFirst(selectedDetail.pendapatan)}
</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pekerjaan</p>
                      <p className="font-medium text-gray-900">{selectedDetail.pekerjaan}</p>
                    </div>
                  </div>
                </div>

                {/* Bobot Kriteria */}
                {selectedDetail.bobotKriteria && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Bobot Kriteria AHP</h3>
                    <div className="space-y-3">
                      {selectedDetail.bobotKriteria.map((bobot, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-700">{bobotLabels[index]}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                style={{ width: `${(bobot * 100).toFixed(1)}%` }}
                              />
                            </div>
                            <span className="font-semibold text-gray-900 w-16 text-right">
                              {(bobot * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hasil Penilaian */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hasil Penilaian</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Nilai Akhir</p>
                      <p className="text-3xl font-bold text-blue-600">{selectedDetail.nilaiAkhir.toFixed(2)}</p>
                    </div>
                    <div className={`rounded-lg p-4 text-center ${
                      selectedDetail.status === 'Layak' ? 'bg-blue-50' : 'bg-gray-50'
                    }`}>
                      <p className="text-sm text-gray-600 mb-1">Status Kelayakan</p>
                      <p className={`text-2xl font-bold ${
                        selectedDetail.status === 'Layak' ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {selectedDetail.status}
                      </p>
                    </div>
                    <div className={`rounded-lg p-4 text-center ${
                      selectedDetail.statusApproval === 'Disetujui' ? 'bg-emerald-50' :
                      selectedDetail.statusApproval === 'Ditolak' ? 'bg-red-50' : 'bg-orange-50'
                    }`}>
                      <p className="text-sm text-gray-600 mb-1">Status Approval</p>
                      <p className={`text-xl font-bold ${
                        selectedDetail.statusApproval === 'Disetujui' ? 'text-emerald-600' :
                        selectedDetail.statusApproval === 'Ditolak' ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        {selectedDetail.statusApproval}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600 text-center">
                    Tanggal Penilaian: {selectedDetail.tanggal}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
