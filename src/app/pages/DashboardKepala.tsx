import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  Home,
  Users,
  FileCheck,
  History,
  UserCircle,
  Info,
  Trash2,
  Eye,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { logoutFromFirebase } from "../utils/auth";

interface PenilaianData {
  id: string;
  nik: string;
  nama: string;
  alamat: string;
  jumlahAnggota?: string;
  jumlahTanggungan?: string;
  pendapatan?: string;
  pekerjaan?: string;
  tanggal: string;
  nilaiAkhir: number;
  status: "Layak" | "Tidak Layak";
  statusApproval: "Pending" | "Disetujui" | "Ditolak";
  terkirim?: boolean;

  fotoRumah?: string;
  statusKK?: string;
  statusTinggal?: string;
  sumberAir?: string;
  statusKerjaTetap?: string;
  kepemilikanUsaha?: string;
  riwayatBantuan?: string;
  kepemilikanAset?: string;
fotoAset?: string[];
}

export function DashboardKepala() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<
    "pending" | "approved" | "rejected" | "all"
  >("pending");
  const [dataWarga, setDataWarga] = useState<PenilaianData[]>(
    [],
  );

useEffect(() => {
  loadData();
}, []);

const loadData = () => {
  const storedData = JSON.parse(
    localStorage.getItem("dataWarga") || "[]",
  );

  if (!Array.isArray(storedData)) {
    console.error("Data warga di localStorage bukan array:", storedData);
    setDataWarga([]);
    return;
  }

  const filteredData = storedData
    .filter(
      (item: PenilaianData) =>
        item.terkirim && item.nilaiAkhir !== null,
    )
    .map((item: PenilaianData) => ({
      ...item,
      statusApproval: item.statusApproval || "Pending",
    }));

  setDataWarga(filteredData);
};

  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "{}",
  );

  const handleLogout = async () => {
    if (!confirm("Apakah Anda yakin ingin logout?")) {
      return;
    }

    try {
      await logoutFromFirebase();
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Gagal logout.");
    }
  };

  const handleApprove = (id: string, approve: boolean) => {
    const warga = dataWarga.find((w) => w.id === id);
    if (!warga) return;

    const action = approve ? "menyetujui" : "menolak";
    if (
      confirm(
        `Apakah Anda yakin ingin ${action} penilaian untuk ${warga.nama}?`,
      )
    ) {
      // Update data
      const allData = JSON.parse(
        localStorage.getItem("dataWarga") || "[]",
      );
      const updatedData = allData.map((w: PenilaianData) => {
        if (w.id === id) {
          return {
            ...w,
            statusApproval: approve ? "Disetujui" : "Ditolak",
          };
        }
        return w;
      });

      localStorage.setItem(
        "dataWarga",
        JSON.stringify(updatedData),
      );
      loadData();

      alert(
        `✓ Penilaian berhasil ${approve ? "disetujui" : "ditolak"}!`,
      );
    }
  };

  const filteredData = dataWarga.filter((item) => {
    if (selectedTab === "pending")
      return item.statusApproval === "Pending";
    if (selectedTab === "approved")
      return item.statusApproval === "Disetujui";
    if (selectedTab === "rejected")
      return item.statusApproval === "Ditolak";
    return true;
  });

  const pendingCount = dataWarga.filter(
    (d) => d.statusApproval === "Pending",
  ).length;
  const approvedCount = dataWarga.filter(
    (d) => d.statusApproval === "Disetujui",
  ).length;
  const rejectedCount = dataWarga.filter(
    (d) => d.statusApproval === "Ditolak",
  ).length;

  // Data untuk grafik
  const statusChartData = [
    {
      name: "Layak",
      value: dataWarga.filter((d) => d.status === "Layak")
        .length,
      color: "#3b82f6",
    },
    {
      name: "Tidak Layak",
      value: dataWarga.filter((d) => d.status === "Tidak Layak")
        .length,
      color: "#94a3b8",
    },
  ];

  const approvalData = [
    { status: "Pending", jumlah: pendingCount },
    { status: "Disetujui", jumlah: approvedCount },
    { status: "Ditolak", jumlah: rejectedCount },
  ];

  const [selectedWarga, setSelectedWarga] =
    useState<PenilaianData | null>(null);

  const getDetailWarga = (id: string) => {
    const allData = JSON.parse(
      localStorage.getItem("dataWarga") || "[]"
    );
  
    return allData.find((w: any) => w.id === id);
  };

  const getPendapatanLabel = (kategori: string) => {
  const labels: any = {
    sangat_miskin: "Sangat Miskin",
    miskin: "Miskin",
    rentan_miskin: "Rentan Miskin",
    tidak_layak: "Tidak Layak",
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] rounded-lg shadow-lg"
              >
                <Home className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] bg-clip-text text-transparent">
                  Dashboard Kepala Desa
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/about")}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#386fa4] hover:bg-blue-50 rounded-lg transition"
              >
                <Info className="w-5 h-5" />
                <span>About</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/profile")}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#386fa4] hover:bg-blue-50 rounded-lg transition"
              >
                <UserCircle className="w-5 h-5" />
                <span>Profil</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/riwayat")}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#386fa4] hover:bg-blue-50 rounded-lg transition"
              >
                <History className="w-5 h-5" />
                <span>Riwayat</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition shadow-lg"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">
              Selamat Datang,{" "}
              {currentUser.nama || "Kepala Desa"}! 👋
            </h2>
            <p className="text-blue-100 text-lg">
              Review dan setujui hasil penilaian kelayakan
              penerima BLT-DD
            </p>
          </div>
        </motion.div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Menunggu Review",
              value: pendingCount,
              icon: Clock,
              color: "from-orange-500 to-orange-600",
              bgColor: "bg-white",
            },
            {
              label: "Disetujui",
              value: approvedCount,
              icon: CheckCircle,
              color: "from-emerald-500 to-emerald-600",
              bgColor: "bg-white",
            },
            {
              label: "Ditolak",
              value: rejectedCount,
              icon: XCircle,
              color: "from-red-500 to-red-600",
              bgColor: "bg-white",
            },
            {
              label: "Total Penilaian",
              value: dataWarga.length,
              icon: FileCheck,
              color: "from-blue-500 to-blue-600",
              bgColor: "bg-white",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`${stat.bgColor} rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-lg`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status Approval
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={approvalData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                />
                <XAxis dataKey="status" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="jumlah"
                  fill="url(#colorBar)"
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient
                    id="colorBar"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#3b82f6"
                      stopOpacity={1}
                    />
                    <stop
                      offset="100%"
                      stopColor="#60a5fa"
                      stopOpacity={0.8}
                    />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="border-b border-gray-200 px-6">
            <div className="flex space-x-8">
              {[
                {
                  key: "pending",
                  label: "Menunggu Review",
                  count: pendingCount,
                },
                {
                  key: "approved",
                  label: "Disetujui",
                  count: approvedCount,
                },
                {
                  key: "rejected",
                  label: "Ditolak",
                  count: rejectedCount,
                },
                {
                  key: "all",
                  label: "Semua Data",
                  count: dataWarga.length,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as any)}
                  className={`py-4 border-b-2 font-medium transition ${
                    selectedTab === tab.key
                      ? "border-[#386fa4] text-[#386fa4]"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Data Table */}
          <div className="p-6">
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Tidak ada data untuk ditampilkan
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredData.map((item, index) => {
                  const isProcessed =
                    item.statusApproval !== "Pending";
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border rounded-lg p-6 transition ${
                        isProcessed
                          ? "border-gray-300 bg-gray-50"
                          : "border-gray-200 hover:shadow-md bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3
                              className={`text-lg font-semibold ${isProcessed ? "text-gray-500" : "text-gray-900"}`}
                            >
                              {item.nama}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                item.status === "Layak"
                                  ? isProcessed
                                    ? "bg-gray-200 text-gray-600"
                                    : "bg-blue-100 text-blue-700"
                                  : isProcessed
                                    ? "bg-gray-200 text-gray-600"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 mb-1">
                                NIK
                              </p>
                              <p
                                className={`font-medium ${isProcessed ? "text-gray-500" : "text-gray-900"}`}
                              >
                                {item.nik}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 mb-1">
                                Nilai Akhir
                              </p>
                              <p
                                className={`font-medium ${isProcessed ? "text-gray-500" : "text-gray-900"}`}
                              >
                                {item.nilaiAkhir.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 mb-1">
                                Tanggal
                              </p>
                              <p
                                className={`font-medium ${isProcessed ? "text-gray-500" : "text-gray-900"}`}
                              >
                                {item.tanggal}
                              </p>
                            </div>
                          </div>
                        </div>

                        {item.statusApproval === "Pending" && (
                          <div className="flex items-center space-x-2 ml-6">
                        
                            {/* BUTTON LIHAT DETAIL */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const detail = getDetailWarga(item.id);
                                setSelectedWarga(detail);
                              }}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                        
                            {/* APPROVE */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleApprove(item.id, true)}
                              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Setujui</span>
                            </motion.button>
                        
                            {/* REJECT */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleApprove(item.id, false)}
                              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Tolak</span>
                            </motion.button>
                          </div>
                        )}

                        {item.statusApproval ===
                          "Disetujui" && (
                          <div className="ml-6">
                            <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium">
                              ✓ Disetujui
                            </span>
                          </div>
                        )}

                        {item.statusApproval === "Ditolak" && (
                          <div className="ml-6">
                            <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium">
                              ✗ Ditolak
                            </span>
                          </div>
                        )}
                      {/* MODAL DETAIL */}
                      {selectedWarga && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                          onClick={() => setSelectedWarga(null)}
                        >
                          <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden"
                          >
                            <div className="max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 z-30 bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] text-white p-6 rounded-t-2xl relative shadow-md">
                              
                              <div className="text-center">
                                <h2 className="text-2xl font-bold">
                                  Detail Warga
                                </h2>
                            
                                <p className="text-sm mt-1 text-blue-100">
                                  {selectedWarga.nama}
                                </p>
                              </div>
                            
                              <button
                                onClick={() => setSelectedWarga(null)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl"
                              >
                                ✕
                              </button>
                            
                            </div>

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
        <p className="font-medium">{capitalizeFirst(selectedWarga?.jumlahAnggota || "")}</p>
      </div>

      <div>
        <p className="text-sm text-gray-600">Jumlah Tanggungan</p>
        <p className="font-medium">{capitalizeFirst(selectedWarga?.jumlahAnggota || "")}</p>
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
          {capitalizeFirst(selectedWarga?.pendapatan || "")}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-600">Pekerjaan</p>
        <p className="font-medium">{capitalizeFirst(selectedWarga?.pekerjaan || "")}</p>
      </div>

      <div>
        <p className="text-sm text-gray-600">Status Kerja</p>
        <p className="font-medium">{capitalizeFirst(selectedWarga?.statusKerjaTetap || "")}</p>
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
Array.isArray(selectedWarga.fotoAset) && (
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
</div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
