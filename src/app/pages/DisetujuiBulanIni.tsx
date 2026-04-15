import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, Eye,UserCheck } from 'lucide-react';

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
  bobotKriteria?: number[];
}

export function DisetujuiBulanIni() {
  const navigate = useNavigate();
  const [dataWarga, setDataWarga] = useState<WargaData[]>([]);
  const [selectedWarga, setSelectedWarga] = useState<WargaData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = JSON.parse(localStorage.getItem('dataWarga') || '[]');
    // Data yang sudah disetujui oleh Kepala Desa
    const approvedData = data.filter(
      (w: WargaData) => w.statusApproval === 'Disetujui'
    );
    setDataWarga(approvedData);
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

  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
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
                  Disetujui Bulan Ini
                </h1>
                <p className="text-sm text-gray-600">Data yang telah disetujui oleh Kepala Desa - {currentMonth}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Disetujui</p>
                <p className="text-3xl font-bold text-green-600">{dataWarga.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
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
                <p className="text-sm text-gray-600 mb-1">Penerima Layak</p>
                <p className="text-3xl font-bold text-blue-600">{layakCount}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <UserCheck className="w-6 h-6 text-white" />
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
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Daftar Penerima Disetujui ({dataWarga.length})
              </h2>
            </div>
          </div>

          {dataWarga.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Belum ada data yang disetujui bulan ini</p>
              <p className="text-gray-400 text-sm mt-2">Data akan muncul di sini setelah disetujui oleh Kepala Desa</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
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
                      className="hover:bg-green-50 transition"
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
            <strong>Catatan:</strong> Data yang ditampilkan adalah data yang telah disetujui oleh Kepala Desa. 
            Data ini merupakan penerima BLT-DD yang telah lolos seleksi dan akan menerima bantuan.
          </p>
        </motion.div>
      </main>

      {/* Detail Modal */}
{selectedWarga && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={() => setSelectedWarga(null)}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
    >
      {/* Header Modal */}
      <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl flex items-center justify-center relative">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-1">
            Detail Penerima - Disetujui ✓
          </h2>
          <p className="text-green-100">{selectedWarga.nama}</p>
        </div>

        <button
          onClick={() => setSelectedWarga(null)}
          className="absolute right-6 p-2 hover:bg-white/20 rounded-lg transition"
        >
          ✕
        </button>
      </div>

      {/* Isi Modal */}
      <div className="p-6 space-y-6">

        {/* Data Identitas */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Data Identitas
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">NIK</p>
              <p className="font-medium text-gray-900">
                {selectedWarga.nik}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Nama Lengkap</p>
              <p className="font-medium text-gray-900">
                 {capitalizeFirst(selectedWarga.nama)}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-sm text-gray-600 mb-1">Alamat</p>
              <p className="font-medium text-gray-900">
                {capitalizeFirst(selectedWarga.alamat)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">
                Jumlah Anggota Keluarga
              </p>
              <p className="font-medium text-gray-900">
                {selectedWarga.jumlahAnggota} orang
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">
                Jumlah Tanggungan
              </p>
              <p className="font-medium text-gray-900">
                {selectedWarga.jumlahTanggungan} orang
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">
                Kategori Pendapatan
              </p>
              <p className="font-medium text-gray-900">
                {getPendapatanLabel(selectedWarga.pendapatan)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Pekerjaan</p>
              <p className="font-medium text-gray-900">
                {selectedWarga.pekerjaan}
              </p>
            </div>
          </div>
        </div>

        {/* Hasil Penilaian */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Hasil Penilaian
          </h3>

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">
                Nilai Akhir
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {selectedWarga.nilaiAkhir.toFixed(2)}
              </p>
            </div>

            <div
              className={`rounded-lg p-4 text-center ${
                selectedWarga.status === 'Layak'
                  ? 'bg-blue-50'
                  : 'bg-gray-50'
              }`}
            >
              <p className="text-sm text-gray-600 mb-1">
                Status Kelayakan
              </p>

              <p
                className={`text-2xl font-bold ${
                  selectedWarga.status === 'Layak'
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                {selectedWarga.status}
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">
                Disetujui oleh Kepala Desa
              </span>
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