import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Target, Zap, Shield, TrendingUp, Github, Linkedin, Mail, Award, Instagram } from 'lucide-react';

export function About() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'app' | 'developers'>('app');

  const developers = [
    {
      name: 'Dewi Berliana',
      nim: '25051204284',
      image: '🧕',
      github: 'https://github.com/Berliana003',
      linkedin: 'https://www.linkedin.com/in/dewi-berliana-9a342837a/',
      instagram: 'https://www.instagram.com/berliand_aa?igsh=MTVyeDNpY2V2NHVjOQ==',
      email: '25051204284@mhs.unesa.ac.id'
    },
    {
      name: 'Dea Suci Ramadani',
      nim: '25051204296',
      image: '👩‍🎨',
      github: 'https://github.com/128-Dea',
      linkedin: 'https://www.linkedin.com/in/dea-suci-ramadani-99bb73401?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      instagram: 'https://www.instagram.com/dhesurha_?igsh=bmM2aXEzYXlrcXJy',
      email: '25051204296@mhs.unesa.ac.id'
    },
    {
      name: 'Chantika Putri Meunasah',
      nim: '25051204264',
      image: '👩‍💼',
      github: 'https://github.com/Chantikaputrii',
      linkedin: 'chantika-putri',
      instagram: 'https://www.instagram.com/channntk?igsh=MXhjb3gycmhwbmg4Nw==',
      email: '25051204264@mhs.unesa.ac.id'
    }
  ];

  const features = [
    {
      icon: Target,
      title: 'Penilaian Objektif',
      description: 'Menggunakan metode AHP untuk penilaian yang terstruktur dan dapat dipertanggungjawabkan',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Zap,
      title: 'Proses Cepat',
      description: 'Sistem otomatis menghitung bobot dan nilai akhir dalam hitungan detik',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      icon: Shield,
      title: 'Data Aman',
      description: 'Informasi warga tersimpan dengan aman dan terenkripsi',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: TrendingUp,
      title: 'Analisis Lengkap',
      description: 'Dashboard interaktif dengan visualisasi data yang informatif',
      color: 'from-purple-500 to-purple-600'
    }
  ];

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
                  About
                </h1>
                <p className="text-sm text-gray-600">Tentang Aplikasi & Developer</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Background */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="
    rounded-2xl shadow-xl p-12 mb-8 text-white text-center 
    relative overflow-hidden
    bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4]
  "
>
          
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block mb-6"
            >
              <Award className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] rounded-lg shadow-lg" />
            </motion.div>
            <h2 className="text-4xl font-bold mb-4">Sistem BLT-DD</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Sistem Pendukung Keputusan Penentuan Penerima Bantuan Langsung Tunai Dana Desa
              Menggunakan Metode Analytical Hierarchy Process (AHP)
            </p>
            <div className="mt-8 flex items-center justify-center space-x-6">
              <div className="text-center">
                <p className="text-3xl font-bold">2026</p>
                <p className="text-sm text-blue-100">Version 1.0</p>
              </div>
              <div className="h-12 w-px bg-white/30"></div>
              <div className="text-center">
                <p className="text-3xl font-bold">AHP</p>
                <p className="text-sm text-blue-100">Metode Penilaian</p>
              </div>
              <div className="h-12 w-px bg-white/30"></div>
              <div className="text-center">
                <p className="text-3xl font-bold">95%</p>
                <p className="text-sm text-blue-100">Akurat</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <motion.button
            onClick={() => setActiveTab('app')}
            className={`px-8 py-3 rounded-lg font-medium transition ${
              activeTab === 'app'
                ? 'bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] text-white shadow-lg'
                : 'bg-[#e6f0fa] text-gray-700 hover:bg-[#d6e6f7]'
            }`}
          >
            Tentang Aplikasi
          </motion.button>
                   
                    <motion.button
            onClick={() => setActiveTab('developers')}
            className={`px-8 py-3 rounded-lg font-medium transition ${
              activeTab === 'developers'
                ? 'bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] text-white shadow-lg'
                : 'bg-[#e6f0fa] text-gray-700 hover:bg-[#d6e6f7]'
            }`}
          >
            Developer Team
          </motion.button>
        </div>

        {/* About App */}
        {activeTab === 'app' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="prose max-w-none text-gray-600 space-y-4">
                <p className="text-lg">
                  Sistem BLT-DD adalah aplikasi web berbasis teknologi modern yang dirancang khusus untuk
                  membantu pemerintahan desa dalam menentukan kelayakan penerima Bantuan Langsung Tunai Dana Desa.
                </p>
                <p>
                  Aplikasi ini menggunakan metode <strong>Analytical Hierarchy Process (AHP)</strong>, sebuah metode
                  pengambilan keputusan multi-kriteria yang telah terbukti efektif dalam menangani masalah kompleks
                  dengan banyak variabel.
                </p>
                <p>
                  Dengan sistem ini, proses penentuan penerima bantuan menjadi lebih objektif, transparan, dan
                  dapat dipertanggungjawabkan. Data warga dianalisis berdasarkan berbagai kriteria seperti
                  pendapatan, jumlah tanggungan, pekerjaan, dan kondisi tempat tinggal.
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Developers */}
        {activeTab === 'developers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Tim Developer</h3>
              <p className="text-lg text-gray-600">
                Kenalan dengan tim yang membangun sistem ini
              </p>
              <p className="text-lg text-gray-600">
                KELOMPOK 5 - 2024I
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {developers.map((dev, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="text-center">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="
w-24 h-24 mx-auto
bg-gradient-to-r from-[#386fa4] to-[#6aa4d3]
rounded-full flex items-center justify-center
text-5xl shadow-lg mb-4
"
                    >
                      {dev.image}
                    </motion.div>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">{dev.name}</h4>
                    <p className="text-blue-600 font-medium mb-4">NIM: {dev.nim}</p>
                    
<div className="flex items-center justify-center space-x-3">

  {/* GitHub */}
  <motion.a
    whileHover={{ scale: 1.2 }}
    whileTap={{ scale: 0.9 }}
    href={dev.github}
    target="_blank"
    rel="noopener noreferrer"
    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
    title="GitHub"
  >
    <Github className="w-4 h-4 text-gray-700" />
  </motion.a>

  {/* LinkedIn */}
  <motion.a
    whileHover={{ scale: 1.2 }}
    whileTap={{ scale: 0.9 }}
    href={`https://linkedin.com/in/${dev.linkedin}`}
    target="_blank"
    rel="noopener noreferrer"
    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition"
    title="LinkedIn"
  >
    <Linkedin className="w-4 h-4 text-blue-700" />
  </motion.a>

  {/* Instagram */}
  <motion.a
    whileHover={{ scale: 1.2 }}
    whileTap={{ scale: 0.9 }}
    href={dev.instagram}
    target="_blank"
    rel="noopener noreferrer"
    className="p-2 bg-pink-100 hover:bg-pink-200 rounded-lg transition"
    title="Instagram"
  >
    <Instagram className="w-4 h-4 text-pink-600" />
  </motion.a>

  {/* Email */}
  <motion.a
    whileHover={{ scale: 1.2 }}
    whileTap={{ scale: 0.9 }}
    href={`mailto:${dev.email}`}
    className="p-2 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition"
    title="Email"
  >
    <Mail className="w-4 h-4 text-indigo-700" />
  </motion.a>

</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center text-gray-500 text-sm"
        >
          <p>© 2026 Sistem BLT-DD. All rights reserved.</p>
          <p className="mt-1">Dibuat dengan ❤️ untuk kemajuan desa Indonesia</p>
        </motion.div>
      </main>
    </div>
  );
}
