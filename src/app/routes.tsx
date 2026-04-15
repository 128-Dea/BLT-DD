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

export const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/dashboard-perangkat", element: <DashboardPerangkat /> },
  { path: "/dashboard-kepala", element: <DashboardKepala /> },
  { path: "/input-data-warga", element: <InputDataWarga /> },
  { path: "/data-warga", element: <DataWarga /> },
  { path: "/input-kriteria", element: <InputKriteria /> },
  { path: "/hasil-penilaian", element: <HasilPenilaian /> },
  { path: "/riwayat", element: <Riwayat /> },
  { path: "/profile", element: <Profile /> },
  { path: "/about", element: <About /> },
  { path: "/total-warga", element: <TotalWarga /> },
  { path: "/penilaian-selesai", element: <PenilaianSelesai /> },
  { path: "/menunggu-approval", element: <MenungguApproval /> },
  { path: "/disetujui-bulan-ini", element: <DisetujuiBulanIni /> },
  { path: "/riwayat-activity", element: <RiwayatActivity /> },
]);