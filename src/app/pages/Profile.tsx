import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { motion } from 'motion/react';
import { ArrowLeft, User, Mail, Briefcase, Calendar, Edit2, Save, Trash2, Camera } from 'lucide-react';

export function Profile() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const joinDate = currentUser.tanggalBergabung
    ? new Date(currentUser.tanggalBergabung)
    : null;
  const formattedJoinDate =
    joinDate && !Number.isNaN(joinDate.getTime())
      ? joinDate.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Belum tersedia';
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string>(currentUser.profilePhoto || '');
  const [formData, setFormData] = useState({
    nama: currentUser.nama || '',
    email: currentUser.email || '',
    role: currentUser.role || 'perangkat_desa',
    profilePhoto: currentUser.profilePhoto || ''
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoUrl = reader.result as string;
        setProfilePhoto(photoUrl);
        setFormData({ ...formData, profilePhoto: photoUrl });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemovePhoto = () => {
    if (confirm("Hapus foto profil?")) {
      setProfilePhoto("");
      setFormData({ ...formData, profilePhoto: "" });
    }
  };
  
  const handleSave = () => {
    if (confirm('Simpan perubahan profil?')) {
      const updatedUser = { ...currentUser, ...formData, profilePhoto };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update di database users juga
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: any) => 
        u.email === currentUser.email ? updatedUser : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      alert('✓ Profil berhasil diperbarui!');
      setIsEditing(false);
    }
  };

  const getRoleLabel = (role: string) => {
    return role === 'perangkat_desa' ? 'Perangkat Desa' : 'Kepala Desa';
  };

const getRoleColor = (role: string) => {
  return role === 'perangkat_desa'
    ? 'from-[#386fa4] via-[#6aa4d3] to-[#386fa4]'
    : 'from-[#386fa4] via-[#6aa4d3] to-[#386fa4]';
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
                  Profil Pengguna
                </h1>
                <p className="text-sm text-gray-600">Kelola informasi akun Anda</p>
              </div>
            </div> 
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          {/* Profile Header */}
          <div className={`bg-gradient-to-r ${getRoleColor(formData.role)} p-8 text-white relative overflow-hidden`}>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0]
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            />
            <div className="relative z-10 flex items-center space-x-6">
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="w-24 h-24 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30 overflow-hidden"
                >
                  {profilePhoto ? (
                  <img
                  src={profilePhoto}
                    alt="Profile"
                      className="w-full h-full object-cover"
                       />
                      ) : (
                      <User className="w-10 h-10 text-white opacity-80" />
                      )}
                </motion.div>
                {isEditing && (
                  <div className="absolute bottom-0 right-0 flex space-x-1">
                    
                    {/* Upload foto */}
                    <label className="p-2 bg-white text-blue-600 rounded-full cursor-pointer hover:bg-blue-50 shadow-lg">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                
                    {/* Hapus foto */}
                    {profilePhoto && (
                      <button
                        onClick={handleRemovePhoto}
                        className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 shadow-lg"
                        title="Hapus Foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                
                  </div>
                )}
              </div>
              <div>
                {/* Nama */}
                <h2 className="text-2xl font-bold">
                  {formData.nama || 'Nama Lengkap'}
                </h2>
              
                {/* Email */}
                <p className="text-sm opacity-80">
                  {formData.email || 'email@gmail.com'}
                </p>
              
                {/* Role */}
                <p className="text-sm mt-1 opacity-90">
                  {getRoleLabel(formData.role)}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Informasi Akun</h3>
              {!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#386fa4] to-[#6aa4d3] text-white rounded-lg transition shadow-lg hover:opacity-90"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profil</span>
                </motion.button>
              ) : (
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsEditing(false);
                      setProfilePhoto(currentUser.profilePhoto || '');
                      setFormData({
                        nama: currentUser.nama || '',
                        email: currentUser.email || '',
                        role: currentUser.role || 'perangkat_desa',
                        profilePhoto: currentUser.profilePhoto || ''
                      });
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition shadow-lg"
                  >
                    <span>Batal</span>
                  </motion.button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Nama */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Nama Lengkap</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">{formData.nama}</p>
                  )}
                </div>
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{formData.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                </div>
              </motion.div>

              {/* Role */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Role</p>
                  <p className="text-lg font-semibold text-gray-900">{getRoleLabel(formData.role)}</p>
                </div>
              </motion.div>

              {/* Tanggal Bergabung */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Tanggal Bergabung</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formattedJoinDate}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
