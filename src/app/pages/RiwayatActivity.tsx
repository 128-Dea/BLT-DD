import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { motion } from 'motion/react';
import {
  ArrowLeft,
  History as HistoryIcon,
  Activity,
  Clock,
  User,
  AlertCircle,
  Trash2
} from 'lucide-react';

import {
  getActivities,
  formatTimestamp,
  ActivityLog,
  logActivity
} from '../utils/activityLogger';
import { deleteWargaById } from '../utils/wargaData';

export function RiwayatActivity() {
  const navigate = useNavigate();

  const [activities, setActivities] = useState<ActivityLog[]>([]);

  const [filter, setFilter] = useState<
    'all' | 'tambah' | 'edit' | 'hapus' | 'kirim'
  >('all');

  useEffect(() => {
    loadActivities();
  }, [filter]);

  const loadActivities = () => {
    const logs = getActivities({
      action: filter === 'all' ? undefined : filter,
      limit: 100
    });

    setActivities(logs);
  };

  // HAPUS RIWAYAT
  const deleteActivity = (id: string) => {
    const confirmDelete = window.confirm(
      'Yakin ingin menghapus riwayat ini?'
    );

    if (!confirmDelete) return;

    const allActivities = JSON.parse(
localStorage.getItem('activityLogs') || '[]'
    );

    const updatedActivities = allActivities.filter(
      (activity: ActivityLog) => activity.id !== id
    );

localStorage.setItem(
  'activityLogs',
      JSON.stringify(updatedActivities)
    );

    loadActivities();
  };

// HAPUS DATA WARGA + MASUK HISTORI
const handleDeleteWarga = async (id: string, nama: string) => {
  const confirmDelete = window.confirm(
    `Yakin ingin menghapus data ${nama}?`
  );

  if (!confirmDelete) return;

  await deleteWargaById(id);

  logActivity(
    'hapus',
    nama,
    `Menghapus data warga ${nama}`
  );

  alert('Data berhasil dihapus!');

  loadActivities();
};


// KIRIM DATA + MASUK HISTORI
const handleKirimWarga = (nama: string) => {
  logActivity(
    'kirim',
    nama,
    `Mengirim data warga ${nama} ke kepala desa`
  );

  alert('Data berhasil dikirim!');

  loadActivities();
};

  const getActionColor = (action: string) => {
    switch (action) {
      case 'tambah':
        return 'bg-blue-100 text-blue-700';

      case 'edit':
        return 'bg-yellow-100 text-yellow-700';

      case 'hapus':
        return 'bg-red-100 text-red-700';

      case 'kirim':
        return 'bg-purple-100 text-purple-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'tambah':
        return '➕';

      case 'hapus':
        return '🗑️';

      case 'kirim':
        return '📤';

      default:
        return '📝';
    }
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
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-blue-50 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </motion.button>
            <div className="flex-1 text-center">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] bg-clip-text text-transparent">
                  Riwayat Aktivitas
                </h1>
                <p className="text-sm text-gray-600">Log semua aktivitas pengguna</p>
              </div>
              
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-[#386fa4]" />
            <h2 className="text-lg font-semibold text-gray-900">Filter Aktivitas</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'tambah', 'edit', 'hapus', 'kirim'].map((f) => (
              <motion.button
                key={f}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === f
                    ? 'bg-gradient-to-r from-[#386fa4] to-[#6aa4d3] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Semua' : f.charAt(0).toUpperCase() + f.slice(1)}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Activities List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
  <div className="flex items-center space-x-2">
    <HistoryIcon className="w-6 h-6 text-[#386fa4]" />
    <h2 className="text-xl font-semibold text-gray-900">
      Total Aktivitas: {activities.length}
    </h2>
  </div>

  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={() => {
      const confirmDelete = window.confirm('Yakin ingin menghapus semua riwayat?');
      if (!confirmDelete) return;

      localStorage.removeItem('activityLogs');
      loadActivities();
    }}
    className="group relative p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
  >
    <Trash2 className="w-5 h-5" />

    <span className="absolute -top-10 left-1/2 -translate-x-1/2 
    whitespace-nowrap bg-gray-800 text-white text-xs px-2 py-1 rounded 
    opacity-0 group-hover:opacity-100 transition pointer-events-none">
      Hapus Semua
    </span>
  </motion.button>
</div>

          {activities.length === 0 ? (
            <div className="text-center py-12">
              <HistoryIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Belum ada aktivitas</p>
            </div>
          ) : (
            <div className="space-y-4">
{activities.map((activity, index) => (
  <motion.div
    key={activity.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
  >
    <div className="flex items-start justify-between gap-4 w-full">

      {/* ISI RIWAYAT */}
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-2xl">
            {getActionIcon(activity.action)}
          </span>

          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(
              activity.action
            )}`}
          >
            {activity.action.toUpperCase()}
          </span>

          <span className="text-sm text-gray-500">
            {formatTimestamp(activity.timestamp)}
          </span>
        </div>

        <div className="ml-11">
          <p className="text-gray-900 font-medium mb-1">
            {activity.description}
          </p>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{activity.user.nama}</span>

              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  activity.user.role === 'kepala'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {activity.user.role === 'kepala'
                  ? 'Kepala Desa'
                  : 'Perangkat Desa'}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>
                {new Date(activity.timestamp).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {activity.target && (
            <div className="mt-2 text-sm text-gray-600">
              <strong>Target:</strong> {activity.target}
            </div>
          )}
        </div>
      </div>

      {/* TOMBOL HAPUS */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => deleteActivity(activity.id)}
        className="group relative p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
      >
        <Trash2 className="w-5 h-5" />

        <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
          Hapus
        </span>
      </motion.button>

    </div>
  </motion.div>
))}
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
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">
                <strong>Catatan:</strong> Riwayat aktivitas mencatat semua aksi yang dilakukan oleh pengguna dalam sistem,
                termasuk siapa yang melakukan, jenis aktivitas, dan waktu kejadian. Data ini membantu dalam audit dan tracking.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
