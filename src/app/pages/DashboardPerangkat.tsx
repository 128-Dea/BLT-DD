import { useNavigate } from "react-router-dom";
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  BarChart3, 
  History, 
  LogOut, 
  Home,
  Calculator,
  CheckCircle,
  UserCircle,
  Info
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { getWeeklyActivity, getMonthlyTrend } from '../utils/activityLogger';
import { logoutFromFirebase } from '../utils/auth';
import { loadAccessibleWarga } from '../utils/wargaData';

export function DashboardPerangkat() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalWarga: 0,
    penilaianSelesai: 0,
    menungguApproval: 0,
    disetujuiBulanIni: 0,
    layak: 0,
    tidakLayak: 0
  });
  const [weeklyActivity, setWeeklyActivity] = useState<{ hari: string; aktivitas: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ bulan: string; penilaian: number; disetujui: number }[]>([]);

useEffect(() => {
  fetchData();
  loadChartData();
}, []);

  const loadChartData = () => {
    const weekly = getWeeklyActivity();
    const monthly = getMonthlyTrend();
    setWeeklyActivity(weekly);
    setMonthlyData(monthly);
  };

const fetchData = () => {
  loadAccessibleWarga()
    .then((data) => {
      const totalWarga = data.length;
      const penilaianSelesai = data.filter((w: any) => w.nilaiAkhir !== null).length;

      const menungguApproval = data.filter((w: any) =>
        w.terkirim === true &&
        w.nilaiAkhir !== null &&
        (w.statusApproval === "Pending" || !w.statusApproval)
      ).length;

      const disetujuiBulanIni = data.filter((w: any) =>
        w.statusApproval === "Disetujui"
      ).length;

      const layak = data.filter((w: any) =>
        w.status === "Layak"
      ).length;

      const tidakLayak = data.filter((w: any) =>
        w.status === "Tidak Layak"
      ).length;

      setStats({
        totalWarga,
        penilaianSelesai,
        menungguApproval,
        disetujuiBulanIni,
        layak,
        tidakLayak
      });
    })
    .catch(err => console.error(err));
};

  const handleLogout = async () => {
    if (!confirm('Apakah Anda yakin ingin logout?')) {
      return;
    }

    try {
      await logoutFromFirebase();
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Gagal logout.');
    }
  };

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const menuItems = [
    {
      title: 'Input Data Warga',
      description: 'Masukkan data calon penerima BLT-DD',
      icon: Users,
      color: 'bg-blue-500',
      path: '/input-data-warga'
    },
    {
      title: 'Data Warga',
      description: 'Lihat data warga yang sudah diinput',
      icon: Users,
      color: 'bg-cyan-500',
      path: '/data-warga'
    },
    {
      title: 'Hasil Penilaian',
      description: 'Lihat hasil perhitungan kelayakan',
      icon: BarChart3,
      color: 'bg-purple-500',
      path: '/hasil-penilaian'
    },
    {
      title: 'Riwayat',
      description: 'Arsip penilaian sebelumnya',
      icon: History,
      color: 'bg-orange-500',
      path: '/riwayat'
    }
  ];

  // Data untuk grafik
  const statusData = [
    { name: 'Layak', value: stats.layak, color: '#3b82f6' },
    { name: 'Tidak Layak', value: stats.tidakLayak, color: '#94a3b8' },
  ];

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
                  Dashboard Perangkat Desa
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/about')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#386fa4] hover:bg-blue-50 rounded-lg transition"
              >
                <Info className="w-5 h-5" />
                <span>About</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#386fa4] hover:bg-blue-50 rounded-lg transition"
              >
                <UserCircle className="w-5 h-5" />
                <span>Profil</span>
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
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Selamat Datang, {currentUser.nama || 'Admin'}! 👋</h2>
            <p className="text-blue-100 text-lg">
              Gunakan sistem ini untuk mengelola dan menilai kelayakan penerima Bantuan Langsung Tunai Dana Desa
            </p>
          </div>
        </motion.div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Data Warga', value: stats.totalWarga.toString(), icon: Users, color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-white', path: '/total-warga' },
            { label: 'Penilaian Selesai', value: stats.penilaianSelesai.toString(), icon: Calculator, color: 'from-blue-500 to-blue-600', bgColor: 'bg-white', path: '/penilaian-selesai' },
            { label: 'Menunggu Approval', value: stats.menungguApproval.toString(), icon: CheckCircle, color: 'from-orange-500 to-orange-600', bgColor: 'bg-white', path: '/menunggu-approval' },
            { label: 'Disetujui Bulan Ini', value: stats.disetujuiBulanIni.toString(), icon: CheckCircle, color: 'from-green-300 to-green-600', bgColor: 'bg-white', path: '/disetujui-bulan-ini' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => navigate(stat.path)}
              className={`${stat.bgColor} rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Chart */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Mingguan</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hari" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="aktivitas" fill="url(#colorActivity)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Status Distribution */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Monthly Trend */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tren Penilaian Bulanan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="bulan" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="penilaian" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
                name="Total Penilaian"
              />
              <Line 
                type="monotone" 
                dataKey="disetujui" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
                name="Disetujui"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {menuItems.map((item, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 text-left group"
            >
              <div className="flex items-start space-x-4">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={`${item.color} w-14 h-14 rounded-lg flex items-center justify-center shadow-lg`}
                >
                  <item.icon className="w-7 h-7 text-white" />
                </motion.div>
                <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:bg-gradient-to-r group-hover:from-[#386fa4] group-hover:via-[#6aa4d3] group-hover:to-[#386fa4] group-hover:bg-clip-text group-hover:text-transparent transition">
                      {item.title}
                    </h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Info Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 text-left group"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Alur Penggunaan Sistem</h3>
          <ol className="space-y-2 text-blue-900">
            {[
              'Masukkan data warga desa yang akan dinilai kelayakannya',
              'Input perbandingan kriteria menggunakan metode AHP',
              'Sistem akan menghitung bobot kriteria dan nilai akhir secara otomatis',
              'Lihat hasil penilaian dan status kelayakan penerima bantuan',
              'Hasil akan dikirim ke Kepala Desa untuk persetujuan'
            ].map((step, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                className="flex items-start"
              >
                <span className="font-semibold mr-2">{index + 1}.</span>
                <span>{step}</span>
              </motion.li>
            ))}
          </ol>
        </motion.div>
      </main>
    </div>
  );
}
