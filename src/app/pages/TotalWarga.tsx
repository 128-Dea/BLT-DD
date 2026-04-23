import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Save,
} from "lucide-react";
import { logActivity } from "../utils/activityLogger";

interface WargaData {
  id: string;
  nik: string;
  nama: string;
  alamat: string;
  jumlahAnggota: string | number;
  jumlahTanggungan: string | number;

  statusKK?: string;
  statusTinggal?: string;
  kondisiRumah?: string;
  sumberAir?: string;
  kepemilikanUsaha?: string;
  statusKerjaTetap?: string;
  kepemilikanAset?: string;
  riwayatBantuan?: string;
  pendapatan: string;
  pekerjaan: string;
  tanggal: string;
  nilaiAkhir: number | null;

  status?: "Layak" | "Tidak Layak" | null;
  statusApproval?: "Pending" | "Disetujui" | "Ditolak";

  fotoRumah?: string;

jenisAset?: string;
fotoAset?: string[];
}

export function TotalWarga() {
  const navigate = useNavigate();
  const [dataWarga, setDataWarga] = useState<WargaData[]>([]);
  const [selectedWarga, setSelectedWarga] =
    useState<WargaData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<WargaData>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = JSON.parse(
      localStorage.getItem("dataWarga") || "[]",
    );
    // Semua data warga (sudah dinilai atau belum)
    setDataWarga(data);
  };

const getPendapatanLabel = (kategori: string) => {
  const labels: any = {
    sangat_miskin: "Kurang dari Rp 1.500.000",
    miskin: "Rp 1.500.000 - Rp 2.500.000",
    rentan_miskin: "Rp 2.500.000 - Rp 3.500.000",
    tidak_layak: "Lebih dari Rp 3.500.000",
  };

  return labels[kategori] || kategori;
};

  const dinilaiCount = dataWarga.filter(
    (w) => w.nilaiAkhir !== null,
  ).length;
  const belumDinilaiCount = dataWarga.filter(
    (w) => w.nilaiAkhir === null,
  ).length;

  const handleDelete = (id: string, nama: string) => {
    const confirmDelete = window.confirm(
      `Yakin ingin menghapus data ${nama}?`,
    );

    if (!confirmDelete) return;

    const data = JSON.parse(
      localStorage.getItem("dataWarga") || "[]",
    );

    const updated = data.filter((item: any) => item.id !== id);

    localStorage.setItem("dataWarga", JSON.stringify(updated));

    // MASUKKAN KE RIWAYAT
    logActivity("hapus", nama, `Menghapus data warga ${nama}`);

    alert("Data berhasil dihapus!");
  };


  const handleSaveEdit = () => {
  const allData = JSON.parse(
    localStorage.getItem("dataWarga") || "[]"
  );

  const updatedData = allData.map((item: WargaData) =>
    item.id === selectedWarga?.id
      ? { ...item, ...editForm, nik: item.nik }
      : item
  );

  localStorage.setItem(
    "dataWarga",
    JSON.stringify(updatedData)
  );

  logActivity(
    "edit",
    editForm.nama || "",
    `Mengedit data warga ${editForm.nama}`
  );

  setSelectedWarga({
    ...selectedWarga!,
    ...editForm,
  });

  setIsEditing(false);

  loadData();

  alert("Data berhasil diperbarui!");
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
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/dashboard-perangkat")}
              className="p-2 hover:bg-blue-50 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </motion.button>
            <div className="flex-1 text-center">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] bg-clip-text text-transparent">
                  Total Warga Desa
                </h1>
                <p className="text-sm text-gray-600">
                  Semua data warga yang telah diinput
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Total Data Warga
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {dataWarga.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Sudah Dinilai
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {dinilaiCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Belum Dinilai
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {belumDinilaiCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-[#386fa4]" />
              <h2 className="text-xl font-semibold text-gray-900">
                Daftar Warga ({dataWarga.length})
              </h2>
            </div>
          </div>

          {dataWarga.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                Belum ada data warga
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      NIK
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Alamat
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Anggota
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Tanggungan
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Pekerjaan
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Pendapatan
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {dataWarga.map((warga, index) => (
                      <motion.tr
                        key={warga.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: index * 0.05,
                          duration: 0.3,
                        }}
                        className="hover:bg-blue-50 transition"
                      >
                  
                        <td className="px-6 py-3 font-semibold text-gray-900">
                          {warga.tanggal}
                        </td>
                        
                        <td className="px-6 py-3 font-semibold text-gray-900">
                          {warga.nik}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-gray-900">
                          {capitalizeFirst(warga.nama)}
                        </td>
                        
                        <td className="px-6 py-3 font-semibold text-gray-900">
                          {capitalizeFirst(warga.alamat)}
                        </td>
                        
                        <td className="px-6 py-3 text-center font-semibold text-gray-900">
                          {warga.jumlahAnggota}
                        </td>
                        
                        <td className="px-6 py-3 text-center font-semibold text-gray-900">
                          {warga.jumlahTanggungan}
                        </td>
                        
                        <td className="px-6 py-3 font-semibold text-gray-900">
                          {capitalizeFirst(warga.pekerjaan)}
                        </td>
                                          
                        <td className="px-6 py-4 whitespace-nowrap text-center font-semibold">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                              warga.pendapatan === "sangat_miskin"
                                ? "bg-red-100 text-red-700"
                                : warga.pendapatan === "miskin"
                                ? "bg-orange-100 text-orange-700"
                                : warga.pendapatan === "rentan_miskin"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {getPendapatanLabel(warga.pendapatan)}
                          </span>
                        </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {warga.nilaiAkhir !== null ? (
                          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                            Sudah Dinilai
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-200 text-black">
                            Belum Dinilai
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-3">
                        <div className="flex justify-center items-center gap-2">
                      
                          <button
                            onClick={() => {
                              setSelectedWarga(warga);
                              setEditForm(warga);
                              setIsEditing(false);
                            }}
                            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                      
                          <button
                            onClick={() =>
                              handleDelete(
                                warga.id,
                                warga.nama,
                              )
                            }
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                      
                        </div>
                      </td>
                      </motion.tr>
                    ))}
                      </tbody>
                     </table>
                    </div>
                    )}
                  </motion.div>
                </main>
                      
                      {/* Detail Modal */}
{selectedWarga && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={() => {
      setSelectedWarga(null);
      setIsEditing(false);
    }}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden"
    >
      <div className="max-h-[90vh] overflow-y-auto">

      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-[#386fa4] via-[#6aa4d3] to-[#386fa4] text-white p-6 rounded-t-2xl relative shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Detail Warga</h2>
          <p>{selectedWarga.nama}</p>
        </div>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-green-200 hover:bg-green-300 text-green-700 p-2 rounded-lg transition"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSaveEdit}
              className="bg-green-200 hover:bg-green-300 text-green-700 p-2 rounded-lg transition"
            >
              <Save className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => {
              setSelectedWarga(null);
              setIsEditing(false);
            }}
            className="text-white text-2xl hover:text-gray-300 transition"
          >
            ✕
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 pt-5 space-y-6 relative z-10 bg-white">

        {/* TANGGAL INPUT */}
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
  {isEditing ? (
    <>
      <input
        value={editForm.nik || ""}
        disabled
        readOnly
        className="border rounded px-3 py-2 w-full bg-gray-100 text-gray-500 cursor-not-allowed"
      />
      <p className="text-xs text-gray-400 mt-1 italic">
        NIK tidak dapat diubah
      </p>
    </>
  ) : (
    <p className="font-medium">{selectedWarga.nik}</p>
  )}
</div>
            <div>
              <p className="text-sm text-gray-600">Nama</p>
              {isEditing ? (
                <input
                  value={editForm.nama || ""}
                  onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                />
              ) : (
                <p className="font-medium capitalize">{selectedWarga.nama}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Alamat</p>
              {isEditing ? (
                <input
                  value={editForm.alamat || ""}
                  onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                />
              ) : (
               <p className="font-medium capitalize">{selectedWarga.alamat}</p>
              )}
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
              {isEditing ? (
                <input
                  value={editForm.jumlahAnggota || ""}
                  onChange={(e) => setEditForm({ ...editForm, jumlahAnggota: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                />
              ) : (
                <p className="font-medium">{selectedWarga.jumlahAnggota}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Jumlah Tanggungan</p>
              {isEditing ? (
                <input
                  value={editForm.jumlahTanggungan || ""}
                  onChange={(e) => setEditForm({ ...editForm, jumlahTanggungan: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                />
              ) : (
                <p className="font-medium">{selectedWarga.jumlahTanggungan}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Status KK</p>
              {isEditing ? (
                <select
                  value={editForm.statusKK || ""}
                  onChange={(e) => setEditForm({ ...editForm, statusKK: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="sendiri">Sendiri</option>
                  <option value="ikut KK lain">Ikut KK Lain</option>
                </select>
              ) : (
                <p className="font-medium capitalize">{selectedWarga.statusKK}</p>
              )}
            </div>
          </div>
        </div>

        {/* KONDISI TEMPAT TINGGAL */}
        <div className="bg-blue-50 p-4 rounded-xl border">
          <h3 className="font-bold text-lg text-[#386fa4] mb-4">
            Kondisi Tempat Tinggal
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status Tempat Tinggal</p>
              {isEditing ? (
                <select
                  value={editForm.statusTinggal || ""}
                  onChange={(e) => setEditForm({ ...editForm, statusTinggal: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                >
                    <option value="Tetap">Tetap</option>
                  <option value="kontrak">Kontrak</option>
                </select>
              ) : (
<p className="font-medium capitalize">{selectedWarga.statusTinggal}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Sumber Air</p>
              {isEditing ? (
                <input
                  value={editForm.sumberAir || ""}
                  onChange={(e) => setEditForm({ ...editForm, sumberAir: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                />
              ) : (
                <p className="font-medium capitalize">{selectedWarga.sumberAir}</p>
              )}
            </div>
          </div>

          {(editForm.fotoRumah || selectedWarga.fotoRumah) && (
            <div className="mt-5">
              <p className="text-sm text-gray-600 mb-2">Foto Rumah</p>
              <div className="relative rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-center overflow-hidden rounded-lg bg-slate-100 min-h-[240px] max-h-[420px]">
                  <img
                    src={editForm.fotoRumah || selectedWarga.fotoRumah}
                    alt="Foto Rumah"
                    className="w-full h-full max-h-[280px] object-contain cursor-pointer"
                    onDoubleClick={() => {
                      if (isEditing) {
                        document.getElementById("uploadFotoRumah")?.click();
                      }
                    }}
                  />
                </div>

                {isEditing && (
                  <input
                    id="uploadFotoRumah"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditForm({
                          ...editForm,
                          fotoRumah: reader.result as string,
                        });
                      };

                      reader.readAsDataURL(file);
                    }}
                  />
                )}
              </div>
              {isEditing && (
                <p className="text-xs text-gray-500 italic mt-2">
                  Double click foto rumah untuk mengganti
                </p>
              )}
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
              {isEditing ? (
                <select
                  value={editForm.pendapatan || ""}
                  onChange={(e) => setEditForm({ ...editForm, pendapatan: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="sangat_miskin">Kurang dari Rp 1.500.000</option>
                  <option value="miskin">Rp 1.500.000 - Rp 2.500.000</option>
                  <option value="rentan_miskin">Rp 2.500.000 - Rp 3.500.000</option>
                  <option value="tidak_layak">Lebih dari Rp 3.500.000</option>
                </select>
              ) : (
                <p className="font-medium">
                  {getPendapatanLabel(selectedWarga.pendapatan)}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Pekerjaan</p>
              {isEditing ? (
                <input
                  value={editForm.pekerjaan || ""}
                  onChange={(e) => setEditForm({ ...editForm, pekerjaan: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                />
              ) : (
                <p className="font-medium">{selectedWarga.pekerjaan}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Status Kerja</p>
              {isEditing ? (
                <select
                  value={editForm.statusKerjaTetap || ""}
                  onChange={(e) => setEditForm({ ...editForm, statusKerjaTetap: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="tetap">Tetap</option>
                  <option value="tidak_tetap">Tidak Tetap</option>
                </select>
              ) : (
                <p className="font-medium">
                  {selectedWarga.statusKerjaTetap === "tidak_tetap" ? "Tidak Tetap" : "Tetap"}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Usaha Sendiri</p>
              {isEditing ? (
                <select
                  value={editForm.kepemilikanUsaha || ""}
                  onChange={(e) => setEditForm({ ...editForm, kepemilikanUsaha: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="Ya">Ya</option>
                  <option value="Tidak">Tidak</option>
                </select>
              ) : (
<p className="font-medium capitalize">{selectedWarga.kepemilikanUsaha}</p>
              )}
            </div>
          </div>
        </div>

        {/* BANTUAN & ASET */}
        <div className="bg-blue-50 p-4 rounded-xl border">
          <h3 className="font-bold text-lg text-[#386fa4] mb-4">
            Bantuan & Aset
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Riwayat Bantuan</p>
              {isEditing ? (
                <select
                  value={editForm.riwayatBantuan || ""}
                  onChange={(e) => setEditForm({ ...editForm, riwayatBantuan: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="">Pilih Riwayat Bantuan</option>
                  <option value="Belum_pernah">Belum Pernah</option>
                  <option value="Blt">Sedang Menerima</option>
                  <option value="Pernah">Pernah</option>
                </select>
              ) : (
                <p className="font-medium">
                  {selectedWarga.riwayatBantuan === "belum_pernah"
                    ? "Belum Pernah"
                    : selectedWarga.riwayatBantuan === "blt"
                    ? "Sedang Menerima"
                    : "Pernah"}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Kepemilikan Aset</p>
              {isEditing ? (
                <select
                  value={editForm.kepemilikanAset || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      kepemilikanAset: e.target.value,
                    })
                  }
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="tidak_ada">Tidak Ada</option>
                  <option value="kendaraan">Kendaraan</option>
                  <option value="tanah_bangunan">Tanah/Bangunan</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              ) : (
                <p className="font-medium">
                  {selectedWarga.kepemilikanAset === "tidak_ada"
                    ? "Tidak Ada"
                    : selectedWarga.kepemilikanAset === "kendaraan"
                    ? "Kendaraan"
                    : selectedWarga.kepemilikanAset === "tanah_bangunan"
                    ? "Tanah/Bangunan"
                    : selectedWarga.kepemilikanAset === "lainnya"
                    ? "Lainnya"
                    : "Tidak Ada"}
                </p>
              )}
            </div>
          </div>

 {(editForm.fotoAset?.length || selectedWarga.fotoAset?.length) && (
  <div className="mt-4">
    <p className="text-sm text-gray-600 mb-2">Foto Aset</p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {(editForm.fotoAset?.length
        ? editForm.fotoAset
        : selectedWarga.fotoAset
      )?.map((foto, index) => (
        <div
          key={index}
          className="relative rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="flex items-center justify-center overflow-hidden rounded-lg bg-slate-100 min-h-[180px] max-h-[260px]">
            <img
              src={foto}
              alt={`Foto Aset ${index + 1}`}
              className="w-full h-full max-h-[230px] object-contain cursor-pointer"
              onDoubleClick={() => {
                if (isEditing) {
                  document
                    .getElementById(`uploadFotoAset-${index}`)
                    ?.click();
                }
              }}
            />
          </div>

          {isEditing && (
            <>
              {/* INPUT GANTI FOTO */}
              <input
                id={`uploadFotoAset-${index}`}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const updatedFoto = [
                      ...(editForm.fotoAset || selectedWarga.fotoAset || []),
                    ];

                    updatedFoto[index] = reader.result as string;

                    setEditForm({
                      ...editForm,
                      fotoAset: updatedFoto,
                    });
                  };

                  reader.readAsDataURL(file);
                }}
              />

              {/* HAPUS FOTO */}
             <button
  type="button"
  onClick={() => {
    const currentFoto =
      editForm.fotoAset || selectedWarga.fotoAset || [];

    const updatedFoto = currentFoto.filter(
      (_: string, i: number) => i !== index
    );

    setEditForm({
      ...editForm,
      fotoAset: updatedFoto,
    });
  }}
  className="absolute top-5 right-5 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-sm"
>
  <Trash2 className="w-4 h-4" />
</button>
            </>
          )}
        </div>
      ))}
    </div>

              {isEditing && (
                <div className="mt-4">
                  <input
                    id="tambahFotoAset"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
          
                      files.forEach((file) => {
                        const reader = new FileReader();
          
                        reader.onloadend = () => {
                          setEditForm((prev) => ({
                            ...prev,
                            fotoAset: [
                              ...(prev.fotoAset ||
                                selectedWarga.fotoAset ||
                                []),
                              reader.result as string,
                            ],
                          }));
                        };
          
                        reader.readAsDataURL(file);
                      });
                    }}
                  />
          
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("tambahFotoAset")
                        ?.click()
                    }
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    + Tambah Foto Aset
                  </button>
          
                  <p className="text-xs text-gray-500 italic mt-2">
                    Double click foto untuk mengganti
                  </p>
                </div>
              )}
            </div>
          )}
           </div>

        {/* HASIL PENILAIAN */}
        {selectedWarga.nilaiAkhir !== null && (
          <div className="bg-red-50 p-4 rounded-xl border">
            <h3 className="font-bold text-lg text-red-700 mb-4">
              Hasil Penilaian
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nilai Akhir</p>
                <p className="font-medium">{selectedWarga.nilaiAkhir.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium">{selectedWarga.status}</p>
              </div>
            </div>
          </div>
        )}

      </div>
      </div>
    </motion.div>
  </motion.div>
)}
</div>
);
}
