import { createBrowserRouter } from "react-router-dom";
import { Login } from "./pages/Login";
import { DashboardPerangkat } from "./pages/DashboardPerangkat";
import { DashboardKepala } from "./pages/DashboardKepala";
import { InputDataWarga } from "./pages/InputDataWarga";
import { DataWarga } from "./pages/DataWarga";
import { InputKriteria } from "./pages/InputKriteria";
import { HasilPenilaian } from "./pages/HasilPenilaian";
import { Riwayat } from "./pages/Riwayat";
import { Profile } from "./pages/Profile";
import { About } from "./pages/About";
import { TotalWarga } from "./pages/TotalWarga";
import { PenilaianSelesai } from "./pages/PenilaianSelesai";
import { MenungguApproval } from "./pages/MenungguApproval";
import { DisetujuiBulanIni } from "./pages/DisetujuiBulanIni";
import { RiwayatActivity } from "./pages/RiwayatActivity";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  {
    path: "/dashboard-perangkat",
    element: (
      <ProtectedRoute allowedRoles={["perangkat_desa"]}>
        <DashboardPerangkat />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard-kepala",
    element: (
      <ProtectedRoute allowedRoles={["kepala_desa"]}>
        <DashboardKepala />
      </ProtectedRoute>
    ),
  },
  {
    path: "/input-data-warga",
    element: (
      <ProtectedRoute allowedRoles={["perangkat_desa"]}>
        <InputDataWarga />
      </ProtectedRoute>
    ),
  },
  {
    path: "/data-warga",
    element: (
      <ProtectedRoute allowedRoles={["perangkat_desa"]}>
        <DataWarga />
      </ProtectedRoute>
    ),
  },
  {
    path: "/input-kriteria",
    element: (
      <ProtectedRoute allowedRoles={["perangkat_desa"]}>
        <InputKriteria />
      </ProtectedRoute>
    ),
  },
  {
    path: "/hasil-penilaian",
    element: (
      <ProtectedRoute allowedRoles={["perangkat_desa"]}>
        <HasilPenilaian />
      </ProtectedRoute>
    ),
  },
  {
    path: "/riwayat",
    element: (
      <ProtectedRoute>
        <Riwayat />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/about",
    element: (
      <ProtectedRoute>
        <About />
      </ProtectedRoute>
    ),
  },
  {
    path: "/total-warga",
    element: (
      <ProtectedRoute allowedRoles={["perangkat_desa"]}>
        <TotalWarga />
      </ProtectedRoute>
    ),
  },
  {
    path: "/penilaian-selesai",
    element: (
      <ProtectedRoute allowedRoles={["perangkat_desa"]}>
        <PenilaianSelesai />
      </ProtectedRoute>
    ),
  },
  {
    path: "/menunggu-approval",
    element: (
      <ProtectedRoute allowedRoles={["perangkat_desa"]}>
        <MenungguApproval />
      </ProtectedRoute>
    ),
  },
  {
    path: "/disetujui-bulan-ini",
    element: (
      <ProtectedRoute allowedRoles={["perangkat_desa"]}>
        <DisetujuiBulanIni />
      </ProtectedRoute>
    ),
  },
  {
    path: "/riwayat-activity",
    element: (
      <ProtectedRoute allowedRoles={["perangkat_desa"]}>
        <RiwayatActivity />
      </ProtectedRoute>
    ),
  },
]);
