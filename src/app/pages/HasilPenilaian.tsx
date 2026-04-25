import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, XCircle, Printer, RotateCcw, Send, Eye, Check } from 'lucide-react';
import { logActivity } from '../utils/activityLogger';
import {
  deleteWargaById,
  loadAccessibleWarga,
  updateWargaById,
} from '../utils/wargaData';

interface WargaData {
  id: string;
  nik: string;
  nama: string;
  alamat: string;
  jumlahAnggota: number;
  jumlahTanggungan: number;
  pendapatan: string;
  pekerjaan: string;
  nilaiAkhir: number | null;
  status: 'Layak' | 'Tidak Layak' | null;
  statusApproval?: string;
  tanggal: string;
  bobotKriteria?: number[];
  terkirim?: boolean;
}

export function HasilPenilaian() {
  const navigate = useNavigate();
  const [dataWarga, setDataWarga] = useState<WargaData[]>([]);
  const [selectedWarga, setSelectedWarga] = useState<WargaData | null>(null);
  const threshold = 0.60;

  useEffect(() => {
    const loadData = async () => {
    const data = await loadAccessibleWarga();

    const mapped: WargaData[] = data.map((w: any) => ({
      id: w.id,
      nik: w.nik || "",
      nama: w.nama || "",
      alamat: w.alamat || "",
      jumlahAnggota: Number(w.jumlahAnggota || 0),
      jumlahTanggungan: Number(w.jumlahTanggungan || 0),
      pendapatan: w.pendapatan || "",
      pekerjaan: w.pekerjaan || "",
      nilaiAkhir: w.nilaiAkhir ?? null,
      status: w.status ?? null,
      statusApproval: w.statusApproval,
      tanggal: w.tanggal || "",
      bobotKriteria: w.bobotKriteria || [],
      terkirim: w.terkirim || false,
    }));

    const nilaiData = mapped.filter(w => w.nilaiAkhir !== null);

    setDataWarga(nilaiData);

    if (nilaiData.length > 0) {
      const currentId = localStorage.getItem('currentWargaId');
      const current = nilaiData.find(w => w.id === currentId);
      setSelectedWarga(current || nilaiData[nilaiData.length - 1]);
    }

      if (nilaiData.length > 0) {
        const currentId = localStorage.getItem('currentWargaId');
        const current = nilaiData.find((w: WargaData) => w.id === currentId);
        setSelectedWarga(current || nilaiData[nilaiData.length - 1]);
      }
    };

    loadData();
  }, []);

  const handleCetak = () => {
    if (!selectedWarga) return;
    alert(`Mencetak hasil penilaian untuk ${selectedWarga.nama}...`);
    window.print();
  };

  const handleReset = async () => {
    if (
      confirm(
        'Apakah Anda yakin ingin mereset penilaian? Data akan dipindahkan ke riwayat.'
      )
    ) {
      if (!selectedWarga) return;
  
      // Ambil semua data
      await deleteWargaById(selectedWarga.id);
  
      // Hapus current ID
      localStorage.removeItem('currentWargaId');
  
      // Simpan ke riwayat aktivitas
      logActivity(
        'hapus',
        `${selectedWarga.nik} - ${selectedWarga.nama}`,
        `Reset penilaian dan memindahkan ${selectedWarga.nama} ke riwayat`
      );
  
      alert('Data berhasil direset dan masuk ke riwayat!');
  
      navigate('/input-data-warga');
    }
  };

const handleKirimKepala = async () => {
  if (!selectedWarga) return;

  await updateWargaById(selectedWarga.id, {
    terkirim: true,
    statusApproval: selectedWarga.statusApproval || 'Pending',
  });

  const updatedData = dataWarga.map((w) => {
    if (w.id === selectedWarga.id) {
      return {
        ...w,
        terkirim: true,
        statusApproval: w.statusApproval || 'Pending',
      };
    }
    return w;
  });

  setDataWarga(updatedData);

  setSelectedWarga({
    ...selectedWarga,
    terkirim: true,
    statusApproval: selectedWarga.statusApproval || 'Pending',
  });

  // LOG RIWAYAT
  logActivity(
    'kirim',
    selectedWarga.nama,
    `Mengirim hasil penilaian ${selectedWarga.nama} ke Kepala Desa`
  );

  alert('✓ Hasil penilaian berhasil dikirim ke Kepala Desa!');
};
  const getPendapatanLabel = (kategori: string) => {
    const labels: any = {
      'sangat_miskin': ' (< Rp 1.500.000)',
      'miskin': ' (Rp 1.500.000 - 2.500.000)',
      'rentan_miskin': ' (Rp 2.500.000 - 3.500.000)',
      'tidak_layak': ' (> Rp 3.500.000)'
    };
    return labels[kategori] || kategori;
  };

  const bobotKriteria = selectedWarga?.bobotKriteria || [0.40, 0.30, 0.20, 0.10];
  const kriteriaLabels = ['Pendapatan', 'Jumlah Tanggungan', 'Pekerjaan', 'Kondisi Tempat Tinggal'];
    const capitalizeFirst = (text: string) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

  return (
<div className="min-h-screen bg-[#e6f0fa]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="lg:col-span-1 flex no-print">
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
                  Hasil Penilaian
                </h1>
                <p className="text-sm text-gray-600">Rekomendasi kelayakan penerima BLT-DD</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid gap-6 ${ dataWarga.length === 0 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
          {/* List Warga */}
          <div className="lg:col-span-1 flex">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full h-full flex flex-col"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daftar Penilaian</h3>
              
              {dataWarga.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Belum ada data penilaian</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dataWarga.map((warga) => (
                    <motion.button
                      key={warga.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedWarga(warga)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        selectedWarga?.id === warga.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900"> {capitalizeFirst(warga.nama)}</p>
                          <p className="text-xs text-gray-500">NIK: {warga.nik}</p>
                        </div>
                        {warga.terkirim && (
                          <div className="ml-2">
                            <Check className="w-5 h-5 text-green-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            warga.status === 'Layak'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {warga.status}
                        </span>
                        <span className="text-xs text-gray-500">{warga.tanggal}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

{/* Detail Warga */}
{selectedWarga && (
<div className="lg:col-span-2 space-y-6 print-area">
    
    {/* Status Card */}
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl shadow-xl p-8 text-white ${
        selectedWarga.status === 'Layak'
          ? 'bg-green-600 print:bg-green-600'
          : 'bg-red-600 print:bg-red-600'
      }`}
    >
      <div className="flex items-center justify-between">
        
        <div>
          <p className="text-sm opacity-90 mb-2">
            Status Kelayakan
          </p>

          <h2 className="text-4xl font-bold mb-3">
            {selectedWarga.status}
          </h2>

          <p className="text-lg opacity-90">
            {selectedWarga.status === 'Layak' 
              ? 'Warga memenuhi syarat untuk menerima BLT-DD'
              : 'Warga belum memenuhi syarat untuk menerima BLT-DD'
            }
          </p>

          {selectedWarga.terkirim && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg w-fit"
            >
              <Check className="w-5 h-5" />
              <span>Sudah dikirim ke Kepala Desa</span>
            </motion.div>
          )}
        </div>

        {/* Icon Status */}
        {selectedWarga.status === 'Layak' ? (
          <CheckCircle className="w-24 h-24 opacity-80" />
        ) : (
          <XCircle className="w-24 h-24 opacity-80" />
        )}

      </div>
    </motion.div>

              {/* Data Warga */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Data Warga</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">NIK</p>
                    <p className="font-medium text-gray-900">{selectedWarga.nik}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nama Lengkap</p>
                    <p className="font-medium text-gray-900"> {capitalizeFirst(selectedWarga.nama)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Alamat</p>
                    <p className="font-medium text-gray-900">{capitalizeFirst(selectedWarga.nama)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Jumlah Anggota Keluarga</p>
                    <p className="font-medium text-gray-900">{selectedWarga.jumlahAnggota} orang</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Jumlah Tanggungan</p>
                    <p className="font-medium text-gray-900">{selectedWarga.jumlahTanggungan} orang</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pendapatan per Bulan</p>
                    <p className="font-medium text-gray-900">
                      {getPendapatanLabel(selectedWarga.pendapatan)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pekerjaan</p>
                    <p className="font-medium text-gray-900">{selectedWarga.pekerjaan}</p>
                  </div>
                </div>
              </motion.div>

              {/* Bobot Kriteria */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Bobot Kriteria (Metode AHP)</h3>
                <div className="space-y-4">
                  {kriteriaLabels.map((label, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{label}</span>
                      <div className="flex items-center space-x-4 flex-1 max-w-md">
                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(bobotKriteria[index] * 100).toFixed(1)}%` }}
                            transition={{ delay: 0.2 + index * 0.1, duration: 0.8 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                          />
                        </div>
                        <span className="font-semibold text-gray-900 w-16 text-right">
                          {(bobotKriteria[index] * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Nilai Akhir */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Nilai Akhir & Penentuan Kelayakan</h3>
                
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">Nilai Akhir</p>
                    <p className="text-4xl font-bold text-blue-600">{selectedWarga.nilaiAkhir?.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">Batas Kelayakan</p>
                    <p className="text-4xl font-bold text-gray-600">{threshold.toFixed(2)}</p>
                  </div>
                  <div className={`rounded-lg p-6 text-center ${
                    selectedWarga.status === 'Layak' ? 'bg-blue-50' : 'bg-gray-50'
                  }`}>
                    <p className="text-sm text-gray-600 mb-2">Status</p>
                    <p className={`text-3xl font-bold ${
                      selectedWarga.status === 'Layak' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {selectedWarga.status}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Keterangan:</strong> Nilai akhir dihitung berdasarkan bobot kriteria AHP dan penilaian 
                    data warga. Warga dinyatakan <strong>Layak</strong> jika nilai akhir ≥ {threshold.toFixed(2)}, 
                    dan <strong>Tidak Layak</strong> jika nilai akhir &lt; {threshold.toFixed(2)}.
                  </p>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCetak}
                      className="inline-flex items-center space-x-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition shadow-lg"
                    >
                      <Printer className="w-5 h-5" />
                      <span>Cetak</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReset}
                      className="inline-flex items-center space-x-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition shadow-lg"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Reset & Baru</span>
                    </motion.button>
                  </div>
                  {!selectedWarga.terkirim && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleKirimKepala}
                      className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] text-white rounded-lg transition shadow-lg shadow-blue-500/30"
                    >
                      <Send className="w-5 h-5" />
                      <span>Kirim ke Kepala Desa</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* Info Footer */}
              <div className="text-center text-sm text-gray-500">
                <p>Hasil penilaian akan dikirim ke Kepala Desa untuk proses persetujuan.</p>
                <p className="mt-1">Tanggal penilaian: {selectedWarga.tanggal}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
