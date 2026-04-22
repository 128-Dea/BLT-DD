import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  User,
  Building2,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "motion/react";

// Simulasi database user terdaftar
const registeredUsers = new Map<
  string,
  { email: string; password: string; role: string }
>();

export function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nama: "",
    role: "perangkat_desa" as "perangkat_desa" | "kepala_desa",
  });

  const validateEmail = (email: string, role: string) => {
    if (role === "perangkat_desa") {
      return email.endsWith("@admin.com");
    } else if (role === "kepala_desa") {
      return email.endsWith("@kades.com");
    }
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegister) {
      // Validasi email sesuai role
      if (!validateEmail(formData.email, formData.role)) {
        if (formData.role === "perangkat_desa") {
          alert(
            "Email Perangkat Desa harus menggunakan format: nama@admin.com",
          );
        } else {
          alert(
            "Email Kepala Desa harus menggunakan format: nama@kades.com",
          );
        }
        return;
      }

      // Check if user already exists
      if (registeredUsers.has(formData.email)) {
        alert("Email sudah terdaftar! Silakan login.");
        setIsRegister(false);
        return;
      }

      // Simpan user baru
      registeredUsers.set(formData.email, {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      // Simpan ke localStorage
      const users = JSON.parse(
        localStorage.getItem("users") || "[]",
      );
      users.push({
        email: formData.email,
        password: formData.password,
        nama: formData.nama,
        role: formData.role,
        tanggalBergabung: new Date().toISOString(),
      });
      localStorage.setItem("users", JSON.stringify(users));

      alert("Registrasi berhasil! Silakan login.");
      setIsRegister(false);
      setFormData({ ...formData, password: "" });
    } else {
      // Login
      const users = JSON.parse(
        localStorage.getItem("users") || "[]",
      );
      const user = users.find(
        (u: any) =>
          u.email === formData.email &&
          u.password === formData.password &&
          u.role === formData.role,
      );

      if (!user) {
        alert(
          "Email, password, atau role tidak sesuai! Pastikan Anda sudah terdaftar dan data login benar.",
        );
        return;
      }

      const normalizedUser = user.tanggalBergabung
        ? user
        : {
            ...user,
            tanggalBergabung: new Date().toISOString(),
          };

      if (!user.tanggalBergabung) {
        const updatedUsers = users.map((u: any) =>
          u.email === user.email && u.role === user.role
            ? normalizedUser
            : u,
        );
        localStorage.setItem("users", JSON.stringify(updatedUsers));
      }

      // Validasi email format
      if (!validateEmail(formData.email, formData.role)) {
        if (formData.role === "perangkat_desa") {
          alert(
            "Email Perangkat Desa harus menggunakan format: nama@admin.com",
          );
        } else {
          alert(
            "Email Kepala Desa harus menggunakan format: nama@kades.com",
          );
        }
        return;
      }

      // Simpan session
      localStorage.setItem("currentUser", JSON.stringify(normalizedUser));

      // Navigate ke dashboard sesuai role
      if (formData.role === "perangkat_desa") {
        navigate("/dashboard-perangkat");
      } else {
        navigate("/dashboard-kepala");
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#e6f0fa]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 200,
              }}
              className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4"
            >
              <Building2 className="w-8 h-8 text-[#386fa4]" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-navy-900 mb-2"
            >
              Sistem BLT-DD
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600"
            >
              Bantuan Langsung Tunai Dana Desa
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {isRegister && (
              <div>
                <label
                  htmlFor="nama"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="nama"
                    type="text"
                    required={isRegister}
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nama: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-400 rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Role Pengguna
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as any,
                  })
                }
                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
              >
                <option value="perangkat_desa">
                  Perangkat Desa
                </option>
                <option value="kepala_desa">Kepala Desa</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
                
              >
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-400 rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                  placeholder={
                    formData.role === "perangkat_desa"
                      ? "nama@admin.com"
                      : "nama@kades.com"
                  }
                />
                
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {formData.role === "perangkat_desa"
                  ? "📧 Email harus: nama@admin.com"
                  : "📧 Email harus: nama@kades.com"}
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-12 py-3 border border-gray-400 rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] hover:opacity-90 text-white py-3 rounded-lg font-medium transition shadow-lg shadow-[#386fa4]/30"
            >
              {isRegister ? "Daftar" : "Masuk"}
            </motion.button>
          </motion.form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-[#386fa4] hover:text-[#2f5f8a] font-medium transition"
            >
              {isRegister
                ? "Sudah punya akun? Masuk"
                : "Belum punya akun? Daftar"}
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              Sistem Pendukung Keputusan Penentuan Penerima
              BLT-DD <br />
              Menggunakan Metode AHP
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* BACKGROUND IMAGE */}
<img
  src="https://i.pinimg.com/736x/ab/86/2e/ab862e798ba59248a6b6919c52966b99.jpg"
  alt="Komunitas Desa"
 className="w-full h-full object-cover"
/>

        {/* BLUE OVERLAY (THEME COLOR) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#386fa4]/70 via-[#6aa4d3]/60 to-[#2f5f8a]/70" />

        {/* ANIMATED CIRCLES */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        />

        {/* CONTENT */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-[#000080] text-center max-w-lg"
          >
            <h2
              className="text-4xl font-bold mb-6"
              style={{
                color: "#000080",
                WebkitTextStroke: "1.5px #ffffff",
                textShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}
            >
              Sistem Pendukung Keputusan BLT-DD
            </h2>

            <p
              className="text-white font-medium transition"
              style={{
                  textShadow: `
                    0 1px 2px rgba(0,0,0,1),
                    0 4px 12px rgba(0,0,0,0.9),
                    0 8px 24px rgba(0,0,0,0.8)
                  `,
              }}
            >
              Membantu perangkat desa dalam menentukan kelayakan
              penerima bantuan dengan metode Analytical
              Hierarchy Process (AHP)
            </p>

            <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 mt-8 shadow-lg shadow-black/20">
              <ul className="space-y-3 text-left text-white font-medium">
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-start"
                >
                  <span className="inline-block w-2 h-2 bg-white rounded-full mt-2 mr-3"></span>
                  <span>
                    Penilaian objektif dan terstruktur
                  </span>
                </motion.li>

                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="flex items-start"
                >
                  <span className="inline-block w-2 h-2 bg-white rounded-full mt-2 mr-3"></span>
                  <span>
                    Proses pengambilan keputusan yang cepat
                  </span>
                </motion.li>

                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex items-start"
                >
                  <span className="inline-block w-2 h-2 bg-white rounded-full mt-2 mr-3"></span>
                  <span>
                    Hasil yang dapat dipertanggungjawabkan
                  </span>
                </motion.li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
