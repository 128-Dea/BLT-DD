import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Calculator, AlertCircle, CheckCircle, TrendingDown } from 'lucide-react';
import { logActivity } from '../utils/activityLogger';
import { loadAccessibleWarga, updateWargaById } from '../utils/wargaData';

const KRITERIA = [
  { id: 'pendapatan', nama: 'Pendapatan' },
  { id: 'tanggungan', nama: 'Jumlah Tanggungan' },
  { id: 'pekerjaan', nama: 'Pekerjaan' },
  { id: 'kondisi_rumah', nama: 'Kondisi Tempat Tinggal' }
];

const SKALA_AHP = [
  { nilai: 1, label: '1 - Sangat Kurang Penting', deskripsi: 'Kriteria pertama sangat kurang penting dari kriteria kedua' },
  { nilai: 2, label: '2 - Kurang Penting', deskripsi: 'Kriteria pertama kurang penting dari kriteria kedua' },
  { nilai: 3, label: '3 - Sama Penting', deskripsi: 'Kedua kriteria memiliki tingkat kepentingan yang sama' },
  { nilai: 4, label: '4 - Lebih Penting', deskripsi: 'Kriteria pertama lebih penting dari kriteria kedua' },
  { nilai: 5, label: '5 - Sangat Penting', deskripsi: 'Kriteria pertama sangat penting dari kriteria kedua' },
];

export function InputKriteria() {
  const navigate = useNavigate();
  const [perbandingan, setPerbandingan] = useState<{[key: string]: number}>({});
  const [showResult, setShowResult] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const getPairs = () => {
    const pairs = [];
    for (let i = 0; i < KRITERIA.length; i++) {
      for (let j = i + 1; j < KRITERIA.length; j++) {
        pairs.push({
          key: `${KRITERIA[i].id}|${KRITERIA[j].id}`,
          kriteria1: KRITERIA[i],
          kriteria2: KRITERIA[j]
        });
      }
    }
    return pairs;
  };

  const pairs = getPairs();

  const handlePerbandinganChange = (pairKey: string, value: number) => {
    setPerbandingan({
      ...perbandingan,
      [pairKey]: value
    });
  };

  const calculateAHP = (dataWarga: any[] = []) => {
    const n = KRITERIA.length;
    const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(1));

    pairs.forEach(pair => {
      const [id1, id2] = pair.key.split('|');
      const i = KRITERIA.findIndex(k => k.id === id1);
      const j = KRITERIA.findIndex(k => k.id === id2);

      if (i === -1 || j === -1) {
        console.error('Index tidak ditemukan:', id1, id2);
        return;
      }

      const value = perbandingan[pair.key] || 1;
      matrix[i][j] = value;
      matrix[j][i] = 1 / value;
    });

    const columnSums = Array(n).fill(0);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        columnSums[j] += matrix[i][j];
      }
    }

    const normalized: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        normalized[i][j] = matrix[i][j] / columnSums[j];
      }
    }

    const weights = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        sum += normalized[i][j];
      }
      weights[i] = sum / n;
    }

    let lambdaMax = 0;
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        sum += matrix[i][j] * weights[j];
      }
      lambdaMax += sum / weights[i];
    }
    lambdaMax /= n;

    const CI = (lambdaMax - n) / (n - 1);
    const RI = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45][n];
    const CR = CI / RI;

    const currentWargaId = localStorage.getItem('currentWargaId');
    const warga = dataWarga.find((w: any) => w.id === currentWargaId);

    let nilaiAkhir = 0;
    if (warga) {
      let scorePendapatan = 0;
      if (warga.pendapatan === 'sangat_miskin') scorePendapatan = 1.0;
      else if (warga.pendapatan === 'miskin') scorePendapatan = 0.9;
      else if (warga.pendapatan === 'rentan_miskin') scorePendapatan = 0.6;
      else scorePendapatan = 0.2;

      const scoreTanggungan = Math.min(parseInt(warga.jumlahTanggungan) / 5, 1);
      const scorePekerjaan = warga.statusPekerjaan === 'tidak_tetap' ? 0.8 : 0.5;
      const scoreRumah = warga.statusTinggal === 'kontrak' ? 0.8 : 0.5;

      nilaiAkhir =
        weights[0] * scorePendapatan +
        weights[1] * scoreTanggungan +
        weights[2] * scorePekerjaan +
        weights[3] * scoreRumah;
    }

    const status: 'Layak' | 'Tidak Layak' = nilaiAkhir >= 0.60 ? 'Layak' : 'Tidak Layak';

    return {
      weights,
      CI,
      CR,
      isConsistent: CR <= 0.1,
      nilaiAkhir,
      status
    };
  };

  const handleHitung = () => {
    const allFilled = pairs.every(pair => perbandingan[pair.key] !== undefined);

    if (!allFilled) {
      alert('Mohon lengkapi semua perbandingan kriteria!');
      return;
    }

    setCalculating(true);
    setTimeout(async () => {
      const dataWarga = await loadAccessibleWarga();
      const result = calculateAHP(dataWarga);

      const currentWargaId = localStorage.getItem('currentWargaId');
      if (currentWargaId) {
        await updateWargaById(currentWargaId, {
          nilaiAkhir: result.nilaiAkhir,
          status: result.status,
          statusApproval: 'Pending',
          bobotKriteria: result.weights
        });
      }

      setCalculating(false);
      setShowResult(true);
    }, 1500);
  };

  const handleLanjut = () => {
    navigate('/hasil-penilaian');
  };

  const result = showResult ? calculateAHP(JSON.parse(localStorage.getItem('dataWarga') || '[]')) : null;

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
                Input Perbandingan Kriteria
              </h1>
              <p className="text-sm text-gray-600">Metode Analytical Hierarchy Process (AHP)</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Info Box - Petunjuk Pengisian */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 text-left group mb-6"
        >
          <h3 className="font-semibold text-[#386fa4] mb-2">📚 Petunjuk Pengisian</h3>
          <p className="text-[#386fa4] text-sm mb-4">
            Bandingkan tingkat kepentingan setiap kriteria dengan kriteria lainnya.
            Gunakan skala 5 tingkat:{' '}
            <strong>1</strong> = Sangat Kurang Penting,{' '}
            <strong>2</strong> = Kurang Penting,{' '}
            <strong>3</strong> = Sama Penting,{' '}
            <strong>4</strong> = Lebih Penting,{' '}
            <strong>5</strong> = Sangat Penting.
          </p>

          <div className="text-[#386fa4] text-sm space-y-4 leading-relaxed">

            <div>
              <p className="font-semibold">📌 1. Pendapatan vs Jumlah Tanggungan</p>
              <ul className="ml-4 list-disc space-y-1 mt-1">
                <li>Pendapatan &lt; Rp1,5 jt <strong>dan</strong> tanggungan &gt; 5 orang → <strong>Sama Penting (3)</strong></li>
                <li>Pendapatan &lt; Rp1,5 jt <strong>dan</strong> tanggungan ≤ 2 orang → <strong>Pendapatan Lebih Penting (4)</strong></li>
                <li>Pendapatan &gt; Rp3,5 jt <strong>dan</strong> tanggungan &gt; 5 orang → <strong>Tanggungan Lebih Penting (4)</strong></li>
                <li>Pendapatan &gt; Rp3,5 jt <strong>dan</strong> tanggungan ≤ 2 orang → <strong>Kurang Penting (2)</strong></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold">📌 2. Pendapatan vs Pekerjaan</p>
              <ul className="ml-4 list-disc space-y-1 mt-1">
                <li>Pendapatan &lt; Rp1,5 jt <strong>dan</strong> pekerjaan tidak tetap → <strong>Sama Penting (3)</strong></li>
                <li>Pendapatan Rp1,5–3,5 jt <strong>dan</strong> pekerjaan tidak tetap → <strong>Pekerjaan Lebih Penting (4)</strong></li>
                <li>Pendapatan &lt; Rp1,5 jt <strong>dan</strong> pekerjaan tetap → <strong>Pendapatan Lebih Penting (4)</strong></li>
                <li>Pendapatan &gt; Rp3,5 jt <strong>dan</strong> pekerjaan tetap → <strong>Kurang Penting (2)</strong></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold">📌 3. Pendapatan vs Kondisi Rumah</p>
              <ul className="ml-4 list-disc space-y-1 mt-1">
                <li>Pendapatan &gt; Rp3,5 jt <strong>dan</strong> rumah tidak layak/rusak → <strong>Kondisi Rumah Sangat Penting (5)</strong></li>
                <li>Pendapatan &lt; Rp1,5 jt <strong>dan</strong> rumah tidak layak/rusak → <strong>Sama Penting (3)</strong></li>
                <li>Pendapatan &lt; Rp1,5 jt <strong>dan</strong> rumah layak/milik sendiri → <strong>Pendapatan Lebih Penting (4)</strong></li>
                <li>Pendapatan &gt; Rp3,5 jt <strong>dan</strong> rumah layak/milik sendiri → <strong>Kurang Penting (2)</strong></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold">📌 4. Jumlah Tanggungan vs Pekerjaan</p>
              <ul className="ml-4 list-disc space-y-1 mt-1">
                <li>Tanggungan &gt; 5 orang <strong>dan</strong> pekerjaan tetap → <strong>Tanggungan Lebih Penting (4)</strong></li>
                <li>Tanggungan ≤ 2 orang <strong>dan</strong> pekerjaan tidak tetap → <strong>Pekerjaan Lebih Penting (4)</strong></li>
                <li>Tanggungan 3–5 orang <strong>dan</strong> pekerjaan tidak tetap → <strong>Sama Penting (3)</strong></li>
                <li>Tanggungan &gt; 5 orang <strong>dan</strong> pekerjaan tidak tetap → <strong>Sama Penting (3)</strong></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold">📌 5. Jumlah Tanggungan vs Kondisi Rumah</p>
              <ul className="ml-4 list-disc space-y-1 mt-1">
                <li>Tanggungan &gt; 5 orang <strong>dan</strong> rumah tidak layak/rusak → <strong>Sama Penting (3)</strong></li>
                <li>Tanggungan ≤ 2 orang <strong>dan</strong> rumah tidak layak/rusak → <strong>Kondisi Rumah Lebih Penting (4)</strong></li>
                <li>Tanggungan &gt; 5 orang <strong>dan</strong> rumah layak/milik sendiri → <strong>Tanggungan Lebih Penting (4)</strong></li>
                <li>Tanggungan ≤ 2 orang <strong>dan</strong> rumah layak/milik sendiri → <strong>Kurang Penting (2)</strong></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold">📌 6. Pekerjaan vs Kondisi Rumah</p>
              <ul className="ml-4 list-disc space-y-1 mt-1">
                <li>Pekerjaan tidak tetap <strong>dan</strong> rumah kontrak/tidak layak → <strong>Sama Penting (3)</strong></li>
                <li>Pekerjaan tetap <strong>dan</strong> rumah tidak layak/rusak → <strong>Kondisi Rumah Lebih Penting (4)</strong></li>
                <li>Pekerjaan tidak tetap <strong>dan</strong> rumah layak/milik sendiri → <strong>Pekerjaan Lebih Penting (4)</strong></li>
                <li>Pekerjaan tetap <strong>dan</strong> rumah layak/milik sendiri → <strong>Kurang Penting (2)</strong></li>
              </ul>
            </div>

          </div>
        </motion.div>

        {/* Comparison Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <div className="flex items-center space-x-2 mb-6">
            <Calculator className="w-6 h-6 text-[#386fa4]" />
            <h2 className="text-xl font-semibold text-gray-900">Perbandingan Berpasangan</h2>
          </div>

          <div className="space-y-6">
            {pairs.map((pair, index) => (
              <motion.div
                key={pair.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500">Perbandingan {index + 1}</span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-1 text-center">
                    <div className="bg-gradient-to-r from-[#6aa4d3] to-[#386fa4] text-white px-4 py-3 rounded-lg font-medium">
                      {pair.kriteria1.nama}
                    </div>
                  </div>

                  <div className="text-gray-400 font-bold">vs</div>

                  <div className="flex-1 text-center">
                    <div className="bg-gradient-to-r from-[#6aa4d3] to-[#386fa4] text-white px-4 py-3 rounded-lg font-medium">
                      {pair.kriteria2.nama}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tingkat Kepentingan
                  </label>
                  <select
                    value={perbandingan[pair.key] || ''}
                    onChange={(e) => handlePerbandinganChange(pair.key, Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                  >
                    <option value="">Pilih skala perbandingan</option>
                    {SKALA_AHP.map((skala) => (
                      <option key={skala.nilai} value={skala.nilai}>
                        {skala.label}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate('/input-data-warga')}
              className="px-6 py-2 text-black bg-gray-300 hover:bg-gray-400 hover:text-white rounded-lg transition"
            >
              Kembali
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleHitung}
              disabled={calculating}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] text-white rounded-lg transition shadow-lg shadow-blue-500/30"
            >
              {calculating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Calculator className="w-5 h-5" />
                  </motion.div>
                  <span>Menghitung...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  <span>Hitung Bobot & Lihat Hasil</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {showResult && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mt-8"
            >
              {/* Status Kelayakan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl shadow-xl p-8 mb-6 ${
                  result.status === 'Layak'
                    ? 'bg-gradient-to-r from-green-600 to-green-700'
                    : 'bg-gradient-to-r from-red-600 to-red-700'
                }`}
              >
                <div className="flex items-center justify-between text-white">
                  <div>
                    <p className="text-sm opacity-90 mb-2">Status Kelayakan Penerima BLT-DD</p>
                    <h2 className="text-5xl font-bold mb-3">{result.status}</h2>
                    <p className="text-lg opacity-90">
                      Nilai Akhir: {result.nilaiAkhir.toFixed(3)}
                      {result.status === 'Layak' ? ' ≥ 0.60' : ' < 0.60'}
                    </p>
                  </div>
                  {result.status === 'Layak' ? (
                    <CheckCircle className="w-32 h-32 opacity-80" />
                  ) : (
                    <TrendingDown className="w-32 h-32 opacity-80" />
                  )}
                </div>
              </motion.div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Hasil Perhitungan AHP</h2>

                {/* Weights */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-4">Bobot Kriteria</h3>
                  <div className="space-y-3">
                    {KRITERIA.map((kriteria, index) => (
                      <motion.div
                        key={kriteria.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg"
                      >
                        <span className="font-medium text-gray-700">{kriteria.nama}</span>
                        <div className="flex items-center space-x-4">
                          <div className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(result.weights[index] * 100).toFixed(1)}%` }}
                              transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                            />
                          </div>
                          <span className="font-semibold text-gray-900 w-16 text-right">
                            {(result.weights[index] * 100).toFixed(1)}%
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Consistency */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">Uji Konsistensi</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <p className="text-sm text-gray-600 mb-1">Consistency Index (CI)</p>
                      <p className="text-2xl font-bold text-gray-900">{result.CI.toFixed(4)}</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <p className="text-sm text-gray-600 mb-1">Consistency Ratio (CR)</p>
                      <p className="text-2xl font-bold text-gray-900">{result.CR.toFixed(4)}</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className={`rounded-lg p-4 ${result.isConsistent ? 'bg-emerald-50' : 'bg-red-50'}`}
                    >
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <p className={`text-lg font-bold ${result.isConsistent ? 'text-emerald-700' : 'text-red-700'}`}>
                        {result.isConsistent ? '✓ Konsisten' : '✗ Tidak Konsisten'}
                      </p>
                    </motion.div>
                  </div>

                  {!result.isConsistent && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900 mb-1">Perhatian!</p>
                        <p className="text-sm text-red-700">
                          Hasil perbandingan tidak konsisten (CR &gt; 0.1). Disarankan untuk mengulangi
                          proses perbandingan dengan lebih hati-hati.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="mt-8 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLanjut}
                    className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] text-white rounded-lg transition shadow-lg shadow-blue-500/30"
                  >
                    Lanjut ke Hasil Penilaian →
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}