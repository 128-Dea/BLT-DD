import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Calculator,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  BookOpen,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
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

const PETUNJUK_PENGISIAN = [
  {
    judul: '1. Pendapatan vs Jumlah Tanggungan',
    items: [
      <>Pendapatan &lt; Rp1,5 jt dan tanggungan &gt; 5 orang → <strong>Sama Penting (3)</strong></>,
      <>Pendapatan &lt; Rp1,5 jt dan tanggungan 3–5 orang → <strong>Lebih Penting (4)</strong></>,
      <>Pendapatan &lt; Rp1,5 jt dan tanggungan ≤ 2 orang → <strong>Lebih Penting (4)</strong></>,
      <>Pendapatan Rp1,5–2,5 jt dan tanggungan &gt; 5 orang → <strong>Kurang Penting (2)</strong></>,
      <>Pendapatan Rp1,5–2,5 jt dan tanggungan 3–5 orang → <strong>Sama Penting (3)</strong></>,
      <>Pendapatan Rp1,5–2,5 jt dan tanggungan ≤ 2 orang → <strong>Lebih Penting (4)</strong></>,
      <>Pendapatan Rp2,5–3,5 jt dan tanggungan &gt; 5 orang → <strong>Kurang Penting (2)</strong></>,
      <>Pendapatan Rp2,5–3,5 jt dan tanggungan 3–5 orang → <strong>Kurang Penting (2)</strong></>,
      <>Pendapatan Rp2,5–3,5 jt dan tanggungan ≤ 2 orang → <strong>Kurang Penting (2)</strong></>,
      <>Pendapatan &gt; Rp3,5 jt dan tanggungan &gt; 5 orang → <strong>Kurang Penting (2)</strong></>,
      <>Pendapatan &gt; Rp3,5 jt dan tanggungan 3–5 orang → <strong>Kurang Penting (2)</strong></>,
      <>Pendapatan &gt; Rp3,5 jt dan tanggungan ≤ 2 orang → <strong>Sangat Kurang Penting (1)</strong></>,
    ],
  },

  {
    judul: '2. Pendapatan vs Pekerjaan',
    items: [
      <>Pendapatan &lt; Rp1,5 jt dan pekerjaan tidak tetap → <strong>Sama Penting (3)</strong></>,
      <>Pendapatan &lt; Rp1,5 jt dan pekerjaan tetap → <strong>Lebih Penting (4)</strong></>,
      <>Pendapatan Rp1,5–2,5 jt dan pekerjaan tidak tetap → <strong>Kurang Penting (2)</strong></>,
      <>Pendapatan Rp1,5–2,5 jt dan pekerjaan tetap → <strong>Sama Penting (3)</strong></>,
      <>Pendapatan Rp2,5–3,5 jt dan pekerjaan tidak tetap → <strong>Kurang Penting (2)</strong></>,
      <>Pendapatan Rp2,5–3,5 jt dan pekerjaan tetap → <strong>Kurang Penting (2)</strong></>,
      <>Pendapatan &gt; Rp3,5 jt dan pekerjaan tidak tetap → <strong>Kurang Penting (2)</strong></>,
      <>Pendapatan &gt; Rp3,5 jt dan pekerjaan tetap → <strong>Sangat Kurang Penting (1)</strong></>,
    ],
  },

  {
    judul: '3. Pendapatan vs Kondisi Rumah',
    items: [
      <>Pendapatan &lt; Rp1,5 jt dan rumah tidak layak/rusak → <strong>Sama Penting (3)</strong></>,
      <>Pendapatan &lt; Rp1,5 jt dan rumah layak milik sendiri → <strong>Lebih Penting (4)</strong></>,
      <>Pendapatan &lt; Rp1,5 jt dan rumah layak tapi kontrak → <strong>Sama Penting (3)</strong></>,
      <>Pendapatan Rp1,5–2,5 jt dan rumah tidak layak/rusak → <strong>Kurang Penting (2)</strong></>,
      <>Pendapatan Rp1,5–2,5 jt dan rumah layak milik sendiri → <strong>Sama Penting (3)</strong></>,
      <>Pendapatan Rp1,5–2,5 jt dan rumah layak tapi kontrak → <strong>Kurang Penting (2)</strong></>,
      <>Pendapatan Rp2,5–3,5 jt dan rumah tidak layak/rusak → <strong>Kurang Penting (2)</strong></>,
      <>Pendapatan Rp2,5–3,5 jt dan rumah layak milik sendiri → <strong>Kurang Penting (2)</strong></>,
      <>Pendapatan Rp2,5–3,5 jt dan rumah layak tapi kontrak → <strong>Kurang Penting (2)</strong></>,
      <>Pendapatan &gt; Rp3,5 jt dan rumah tidak layak/rusak → <strong>Sangat Kurang Penting (1)</strong></>,
      <>Pendapatan &gt; Rp3,5 jt dan rumah layak milik sendiri → <strong>Sangat Kurang Penting (1)</strong></>,
      <>Pendapatan &gt; Rp3,5 jt dan rumah layak tapi kontrak → <strong>Kurang Penting (2)</strong></>,
    ],
  },

  {
    judul: '4. Jumlah Tanggungan vs Pekerjaan',
    items: [
      <>Tanggungan &gt; 5 orang dan pekerjaan tetap → <strong>Lebih Penting (4)</strong></>,
      <>Tanggungan &gt; 5 orang dan pekerjaan tidak tetap → <strong>Sama Penting (3)</strong></>,
      <>Tanggungan 3–5 orang dan pekerjaan tetap → <strong>Lebih Penting (4)</strong></>,
      <>Tanggungan 3–5 orang dan pekerjaan tidak tetap → <strong>Sama Penting (3)</strong></>,
      <>Tanggungan ≤ 2 orang dan pekerjaan tetap → <strong>Kurang Penting (2)</strong></>,
      <>Tanggungan ≤ 2 orang dan pekerjaan tidak tetap → <strong>Kurang Penting (2)</strong></>,
    ],
  },

  {
    judul: '5. Jumlah Tanggungan vs Kondisi Rumah',
    items: [
      <>Tanggungan &gt; 5 orang dan rumah tidak layak/rusak → <strong>Sama Penting (3)</strong></>,
      <>Tanggungan &gt; 5 orang dan rumah layak milik sendiri → <strong>Lebih Penting (4)</strong></>,
      <>Tanggungan &gt; 5 orang dan rumah layak tapi kontrak → <strong>Lebih Penting (4)</strong></>,
      <>Tanggungan 3–5 orang dan rumah tidak layak/rusak → <strong>Sama Penting (3)</strong></>,
      <>Tanggungan 3–5 orang dan rumah layak milik sendiri → <strong>Lebih Penting (4)</strong></>,
      <>Tanggungan 3–5 orang dan rumah layak tapi kontrak → <strong>Sama Penting (3)</strong></>,
      <>Tanggungan ≤ 2 orang dan rumah tidak layak/rusak → <strong>Kurang Penting (2)</strong></>,
      <>Tanggungan ≤ 2 orang dan rumah layak milik sendiri → <strong>Kurang Penting (2)</strong></>,
      <>Tanggungan ≤ 2 orang dan rumah layak tapi kontrak → <strong>Sama Penting (3)</strong></>,
    ],
  },

  {
    judul: '6. Pekerjaan vs Kondisi Rumah',
    items: [
      <>Pekerjaan tidak tetap dan rumah tidak layak/rusak → <strong>Sama Penting (3)</strong></>,
      <>Pekerjaan tidak tetap dan rumah layak milik sendiri → <strong>Lebih Penting (4)</strong></>,
      <>Pekerjaan tidak tetap dan rumah layak tapi kontrak → <strong>Sama Penting (3)</strong></>,
      <>Pekerjaan tetap dan rumah tidak layak/rusak → <strong>Kurang Penting (2)</strong></>,
      <>Pekerjaan tetap dan rumah layak milik sendiri → <strong>Kurang Penting (2)</strong></>,
      <>Pekerjaan tetap dan rumah layak tapi kontrak → <strong>Kurang Penting (2)</strong></>,
      <>Pekerjaan tidak tetap dan rumah rusak berat → <strong>Sangat Kurang Penting (1)</strong></>,
    ],
  },
];

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

export function InputKriteria() {
  const navigate = useNavigate();
  const [perbandingan, setPerbandingan] = useState<{ [key: string]: number }>({});
  const [showResult, setShowResult] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [currentWarga, setCurrentWarga] = useState<WargaData | null>(null);
  const [loadedWarga, setLoadedWarga] = useState<WargaData[]>([]);
  const [showPetunjuk, setShowPetunjuk] = useState(false);
  const [showDataWarga, setShowDataWarga] = useState(false);

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

  useEffect(() => {
    const loadCurrentWarga = async () => {
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

      setLoadedWarga(mappedData);

      const currentWargaId = localStorage.getItem('currentWargaId');
      const selected = mappedData.find((warga) => warga.id === currentWargaId) || null;
      setCurrentWarga(selected);
    };

    void loadCurrentWarga();
  }, []);

  const handlePerbandinganChange = (pairKey: string, value: number) => {
    setPerbandingan({
      ...perbandingan,
      [pairKey]: value
    });
  };

  const getPendapatanLabel = (kategori: string) => {
    const labels: Record<string, string> = {
      sangat_miskin: 'Kurang dari Rp 1.500.000',
      miskin: 'Rp 1.500.000 - Rp 2.500.000',
      rentan_miskin: 'Rp 2.500.000 - Rp 3.500.000',
      tidak_layak: 'Lebih dari Rp 3.500.000',
    };

    return labels[kategori] || kategori || '-';
  };

  const capitalizeFirst = (text?: string) => {
    if (!text) return '-';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const getRiwayatBantuanLabel = (value?: string) => {
    if (!value) return '-';

    const normalizedValue = value.toLowerCase().trim();

    if (normalizedValue === 'belum_pernah' || normalizedValue === 'belum pernah') {
      return 'Belum Pernah';
    }

    if (
      normalizedValue === 'blt' ||
      normalizedValue === 'sedang_menerima' ||
      normalizedValue === 'sedang menerima'
    ) {
      return 'Sedang Menerima';
    }

    if (normalizedValue === 'pernah') {
      return 'Pernah';
    }

    return '-';
  };

  const getKepemilikanAsetLabel = (value?: string) => {
    if (!value) return 'Tidak Ada';

    const normalizedValue = value.toLowerCase().trim();

    if (normalizedValue === 'tidak' || normalizedValue === 'tidak_ada') {
      return 'Tidak Ada';
    }

    if (normalizedValue === 'kendaraan') return 'Kendaraan';
    if (normalizedValue === 'tanah_bangunan') return 'Tanah/Bangunan';
    if (normalizedValue === 'lainnya') return 'Lainnya';

    return capitalizeFirst(value);
  };

  const calculateAHP = (dataWarga: WargaData[] = []) => {
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
    const warga = dataWarga.find((w) => w.id === currentWargaId);

    let nilaiAkhir = 0;
    if (warga) {
      let scorePendapatan = 0;
      if (warga.pendapatan === 'sangat_miskin') scorePendapatan = 1.0;
      else if (warga.pendapatan === 'miskin') scorePendapatan = 0.9;
      else if (warga.pendapatan === 'rentan_miskin') scorePendapatan = 0.6;
      else scorePendapatan = 0.2;

      const scoreTanggungan = Math.min(parseInt(warga.jumlahTanggungan || '0', 10) / 5, 1);
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

    if (!currentWarga) {
      alert('Data warga yang akan dihitung tidak ditemukan. Silakan pilih kembali dari halaman Data Warga.');
      return;
    }

    if (!allFilled) {
      alert('Mohon lengkapi semua perbandingan kriteria!');
      return;
    }

    setCalculating(true);
    setTimeout(async () => {
      const dataWarga = await loadAccessibleWarga();
      const result = calculateAHP(dataWarga as WargaData[]);

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

  const result = showResult ? calculateAHP(loadedWarga) : null;

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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] bg-clip-text text-transparent">
                Input Perbandingan Kriteria
              </h1>
              <p className="text-sm text-gray-600">Metode Analytical Hierarchy Process (AHP)</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <p className="text-[#386fa4] text-sm leading-relaxed">
            🔎 Bandingkan tingkat kepentingan setiap kriteria dengan kriteria lainnya.
            Gunakan skala 5 tingkat: <strong>1</strong> = Sangat Kurang Penting, <strong>2</strong> = Kurang Penting,
            <strong> 3</strong> = Sama Penting, <strong>4</strong> = Lebih Penting, dan <strong>5</strong> = Sangat Penting.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => setShowPetunjuk((prev) => !prev)}
              className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-left text-[#386fa4] transition"
            >
              <span className="flex items-center gap-2 font-medium">
                <BookOpen className="h-5 w-5" />
                Lihat Petunjuk Pengisian
              </span>
              {showPetunjuk ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => setShowDataWarga((prev) => !prev)}
              className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-emerald-700 transition"
            >
              <span className="flex items-center gap-2 font-medium">
                <Users className="h-5 w-5" />
                Lihat Data Warga yang Dihitung
              </span>
              {showDataWarga ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </motion.button>
          </div>

          <AnimatePresence>
            {showPetunjuk && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-5 text-sm text-[#386fa4]">
                  <div className="space-y-5 leading-relaxed">
                    {PETUNJUK_PENGISIAN.map((section) => (
                      <div key={section.judul}>
                        <p className="mb-2 font-semibold">{section.judul}</p>
                        <ul className="list-disc space-y-1 pl-5">
                          {section.items.map((item, index) => (
                            <li key={`${section.judul}-${index}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showDataWarga && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-xl border border-emerald-100 bg-white p-5">
                  {!currentWarga ? (
                    <p className="text-sm text-gray-600">
                      Data warga belum ditemukan. Silakan kembali ke halaman Data Warga dan pilih warga yang akan dihitung.
                    </p>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <div className="w-fit rounded-xl border bg-emerald-50 px-6 py-3 text-center">
                          <h3 className="mb-1 text-sm font-semibold text-emerald-700">Tanggal Input</h3>
                          <p className="font-medium text-gray-900">{currentWarga.tanggal || '-'}</p>
                        </div>
                      </div>

                      <div className="rounded-xl border bg-blue-50 p-4">
                        <h3 className="mb-4 text-lg font-bold text-[#386fa4]">Data Pribadi</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-sm text-gray-600">NIK</p>
                            <p className="font-medium">{currentWarga.nik || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Nama</p>
                            <p className="font-medium">{capitalizeFirst(currentWarga.nama)}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">Alamat</p>
                            <p className="font-medium">{capitalizeFirst(currentWarga.alamat)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border bg-blue-50 p-4">
                        <h3 className="mb-4 text-lg font-bold text-[#386fa4]">Data Keluarga</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-sm text-gray-600">Jumlah Anggota</p>
                            <p className="font-medium">{currentWarga.jumlahAnggota || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Jumlah Tanggungan</p>
                            <p className="font-medium">{currentWarga.jumlahTanggungan || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Status KK</p>
                            <p className="font-medium">{capitalizeFirst(currentWarga.statusKK)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border bg-blue-50 p-4">
                        <h3 className="mb-4 text-lg font-bold text-[#386fa4]">Kondisi Tempat Tinggal</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-sm text-gray-600">Status Tempat Tinggal</p>
                            <p className="font-medium">{capitalizeFirst(currentWarga.statusTinggal)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Sumber Air</p>
                            <p className="font-medium">{capitalizeFirst(currentWarga.sumberAir)}</p>
                          </div>
                        </div>

                        {currentWarga.fotoRumah && (
                          <div className="mt-5">
                            <p className="mb-2 text-sm text-gray-600">Foto Rumah</p>
                            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                              <div className="flex min-h-[240px] items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                                <img
                                  src={currentWarga.fotoRumah}
                                  alt="Foto Rumah"
                                  className="h-full max-h-[280px] w-full object-contain"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="rounded-xl border bg-blue-50 p-4">
                        <h3 className="mb-4 text-lg font-bold text-[#386fa4]">Data Ekonomi</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-sm text-gray-600">Pendapatan</p>
                            <p className="font-medium">{getPendapatanLabel(currentWarga.pendapatan)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Pekerjaan</p>
                            <p className="font-medium">{capitalizeFirst(currentWarga.pekerjaan)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Status Kerja</p>
                            <p className="font-medium">{capitalizeFirst(currentWarga.statusPekerjaan)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Usaha Sendiri</p>
                            <p className="font-medium">{capitalizeFirst(currentWarga.kepemilikanUsaha)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border bg-blue-50 p-4">
                        <h3 className="mb-4 text-lg font-bold text-[#386fa4]">Bantuan dan Aset</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-sm text-gray-600">Riwayat Bantuan</p>
                            <p className="font-medium">{getRiwayatBantuanLabel(currentWarga.riwayatBantuan)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Kepemilikan Aset</p>
                            <p className="font-medium">{getKepemilikanAsetLabel(currentWarga.kepemilikanAset)}</p>
                          </div>
                        </div>

                        {currentWarga.fotoAset && currentWarga.fotoAset.length > 0 && (
                          <div className="mt-4">
                            <p className="mb-2 text-sm text-gray-600">Foto Aset</p>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              {currentWarga.fotoAset.map((foto, index) => (
                                <div
                                  key={`${foto}-${index}`}
                                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                                >
                                  <div className="flex min-h-[180px] items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                                    <img
                                      src={foto}
                                      alt={`Foto Aset ${index + 1}`}
                                      className="h-full max-h-[230px] w-full object-contain"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

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
                  <p className="mt-2 text-xs text-gray-500">
                    {perbandingan[pair.key]
                      ? SKALA_AHP.find((skala) => skala.nilai === perbandingan[pair.key])?.deskripsi
                      : 'Pilih nilai berdasarkan petunjuk pengisian dan kondisi warga yang sedang dinilai.'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate('/data-warga')}
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

        <AnimatePresence>
          {showResult && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mt-8"
            >
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
                      {result.status === 'Layak' ? ' >= 0.60' : ' < 0.60'}
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

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">Uji Konsistensi</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                        {result.isConsistent ? 'Konsisten' : 'Tidak Konsisten'}
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
                        <p className="text-sm font-medium text-red-900 mb-1">Perhatian</p>
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
                    <span>Lanjut ke Hasil Penilaian</span>
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
