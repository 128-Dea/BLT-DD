import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, Building2, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import {
  loginWithFirebase,
  registerWithFirebase,
  restoreCurrentUser,
  validateEmailByRole,
  type UserRole,
} from "../utils/auth";

export function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nama: "",
    role: "perangkat_desa" as UserRole,
  });

  useEffect(() => {
    if (!isRegister) {
      setFormData((prev) => ({
        email: prev.email,
        password: prev.password,
        nama: "",
        role: prev.role,
      }));
    }
  }, [isRegister]);

  useEffect(() => {
    const bootstrapSession = async () => {
      const currentUser = await restoreCurrentUser();

      if (!currentUser) {
        return;
      }

      navigate(
        currentUser.role === "perangkat_desa"
          ? "/dashboard-perangkat"
          : "/dashboard-kepala"
      );
    };

    void bootstrapSession();
  }, [navigate]);

  const handleNavigateByRole = (role: UserRole) => {
    navigate(
      role === "perangkat_desa"
        ? "/dashboard-perangkat"
        : "/dashboard-kepala"
    );
  };

  const getRoleEmailMessage = (role: UserRole) => {
    return role === "perangkat_desa"
      ? "Email Perangkat Desa harus menggunakan format: nama@admin.com"
      : "Email Kepala Desa harus menggunakan format: nama@kades.com";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmailByRole(formData.email, formData.role)) {
      alert(getRoleEmailMessage(formData.role));
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegister) {
        await registerWithFirebase({
          nama: formData.nama,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });

        alert("Registrasi berhasil, silakan login");

        setIsRegister(false);

        return;
      }

      // LOGIN LANGSUNG 
      const user = await loginWithFirebase({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (user) {
        handleNavigateByRole(user.role);
      }
    } catch (error: any) {
      console.error(error);

      if (error.code === "auth/user-not-found") {
        alert("Email belum terdaftar. Silakan daftar terlebih dahulu.");
        setIsRegister(true);
      } else if (error.code === "auth/wrong-password") {
        alert("Email atau password salah.");
      } else if (error.code === "auth/email-already-in-use") {
        alert("Email sudah terdaftar, silakan login");
        setIsRegister(false);
      } else {
        alert(error.message || "Terjadi kesalahan");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#e6f0fa]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
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
                    role: e.target.value as UserRole,
                  })
                }
                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
              >
                <option value="perangkat_desa">Perangkat Desa</option>
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
                      email: e.target.value.trim(),
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
                  ? "Email harus: nama@admin.com"
                  : "Email harus: nama@kades.com"}
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
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-12 py-3 border border-gray-400 rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-[#386fa4] focus:border-[#386fa4] outline-none transition"
                  placeholder="Minimal 6 karakter"
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
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] hover:opacity-90 disabled:opacity-70 text-white py-3 rounded-lg font-medium transition shadow-lg shadow-[#386fa4]/30"
            >
              {isSubmitting
                ? "Memproses..."
                : isRegister
                ? "Daftar"
                : "Masuk"}
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
              Sistem Pendukung Keputusan Penentuan Penerima BLT-DD <br />
              Menggunakan Metode AHP
            </p>
          </div>
        </motion.div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://i.pinimg.com/736x/ab/86/2e/ab862e798ba59248a6b6919c52966b99.jpg"
          alt="Komunitas Desa"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-[#386fa4]/70 via-[#6aa4d3]/60 to-[#2f5f8a]/70" />

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
              Membantu perangkat desa dalam menentukan kelayakan penerima bantuan
              dengan metode Analytical Hierarchy Process (AHP)
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
                  <span>Penilaian objektif dan terstruktur</span>
                </motion.li>

                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="flex items-start"
                >
                  <span className="inline-block w-2 h-2 bg-white rounded-full mt-2 mr-3"></span>
                  <span>Proses pengambilan keputusan yang cepat</span>
                </motion.li>

                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex items-start"
                >
                  <span className="inline-block w-2 h-2 bg-white rounded-full mt-2 mr-3"></span>
                  <span>Hasil yang dapat dipertanggungjawabkan</span>
                </motion.li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
