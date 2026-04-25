import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { motion } from 'motion/react';
import { ArrowLeft, Calculator, Eye, UserCheck, Check, X } from 'lucide-react';
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
  nilaiAkhir: number | null;
  status?: 'Layak' | 'Tidak Layak';
  statusApproval?: 'Pending' | 'Disetujui' | 'Ditolak';
  bobotKriteria?: number[];
}

export function PenilaianSelesai() {
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
      nik: w.nik || "",
      nama: w.nama || "",
      alamat: w.alamat || "",
      jumlahAnggota: w.jumlahAnggota || 0,
      jumlahTanggungan: w.jumlahTanggungan || 0,
      pendapatan: w.pendapatan || "",
      pekerjaan: w.pekerjaan || "",
      tanggal: w.tanggal || "",
      nilaiAkhir: w.nilaiAkhir ?? null,
      status: w.status || "Tidak Layak",
      statusApproval: w.statusApproval || "Pending",
    }));

    const nilaiData = mappedData.filter(w => w.nilaiAkhir !== null);

    setDataWarga(nilaiData);
  };

  const layakCount = dataWarga.filter((w) => w.status === 'Layak').length;
  const tidakLayakCount = dataWarga.filter((w) => w.status === 'Tidak Layak').length;
  const disetujuiCount = dataWarga.filter((w) => w.statusApproval === 'Disetujui').length;

  const capitalizeFirst = (text: string) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  return (
    <div className="min-h-screen bg-[#e6f0fa]">
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
                  Penilaian Selesai
                </h1>
                <p className="text-sm text-gray-600">Semua data yang telah dinilai</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Penilaian</p>
                <p className="text-3xl font-bold text-gray-900">{dataWarga.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                <Calculator className="w-6 h-6 text-white" />
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
                <p className="text-3xl font-bold text-red-600">{tidakLayakCount}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                <X className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Disetujui</p>
                <p className="text-3xl font-bold text-green-600">{disetujuiCount}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                <Check className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Calculator className="w-6 h-6 text-[#386fa4]" />
              <h2 className="text-xl font-semibold text-gray-900">
                Daftar Penilaian ({dataWarga.length})
              </h2>
            </div>
          </div>

          {dataWarga.length === 0 ? (
            <div className="text-center py-12">
              <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Belum ada data penilaian</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
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
                      Status Approval
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
                        {warga.nilaiAkhir?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            warga.status === 'Layak'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {warga.status || 'Tidak Layak'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            warga.statusApproval === 'Disetujui'
                              ? 'bg-green-100 text-green-700'
                              : warga.statusApproval === 'Ditolak'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {warga.statusApproval || 'Pending'}
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
      </main>

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
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl flex items-center justify-center relative">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-1">Detail Penilaian</h2>
                <p className="text-blue-100">{selectedWarga.nama}</p>
              </div>

              <button
                onClick={() => setSelectedWarga(null)}
                className="absolute right-6 p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
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
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hasil Penilaian</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Nilai Akhir</p>
                    <p className="text-3xl font-bold text-blue-600">{selectedWarga.nilaiAkhir?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className={`rounded-lg p-4 text-center ${
                    selectedWarga.status === 'Layak' ? 'bg-blue-50' : 'bg-gray-50'
                  }`}>
                    <p className="text-sm text-gray-600 mb-1">Status Kelayakan</p>
                    <p className={`text-2xl font-bold ${
                      selectedWarga.status === 'Layak' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {selectedWarga.status || 'Tidak Layak'}
                    </p>
                  </div>
                  <div className={`rounded-lg p-4 text-center ${
                    selectedWarga.statusApproval === 'Disetujui' ? 'bg-green-50' :
                    selectedWarga.statusApproval === 'Ditolak' ? 'bg-red-50' : 'bg-orange-50'
                  }`}>
                    <p className="text-sm text-gray-600 mb-1">Status Approval</p>
                    <p className={`text-xl font-bold ${
                      selectedWarga.statusApproval === 'Disetujui' ? 'text-green-600' :
                      selectedWarga.statusApproval === 'Ditolak' ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {selectedWarga.statusApproval || 'Pending'}
                    </p>
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
