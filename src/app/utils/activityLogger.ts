// Utility untuk logging aktivitas sistem

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: {
    nama: string;
    email: string;
    role: 'perangkat' | 'kepala';
  };
  action: 'tambah' | 'edit' | 'hapus' | 'kirim' | 'setujui' | 'tolak' | 'hitung';
  target: string;
  description: string;
  duration?: number; // durasi dalam menit
  data?: any;
}

export interface SessionLog {
  email: string;
  startTime: number;
  lastActivityTime: number;
}

type ActivityFilter = {
  role?: 'perangkat' | 'kepala';
  action?: ActivityLog['action'];
  limit?: number;
};

const getCurrentUser = () =>
  JSON.parse(localStorage.getItem('currentUser') || '{}');

const getCurrentRole = (): 'perangkat' | 'kepala' => {
  const currentUser = getCurrentUser();
  return currentUser.email?.includes('@kades.com') ? 'kepala' : 'perangkat';
};

const getSessionStorageKey = (email?: string) => {
  const currentUser = getCurrentUser();
  const normalizedEmail = email || currentUser.email || 'guest';
  return `sessionLog_${normalizedEmail}`;
};

export const getActivityStorageKey = (email?: string) => {
  const currentUser = getCurrentUser();
  const normalizedEmail = email || currentUser.email || 'guest';
  return `activityLogs_${normalizedEmail}`;
};

const getSessionData = (email?: string): SessionLog | null => {
  const currentUser = getCurrentUser();
  const targetEmail = email || currentUser.email || '';
  const sessionKey = getSessionStorageKey(targetEmail);
  const sessionData = localStorage.getItem(sessionKey);
  return sessionData ? JSON.parse(sessionData) : null;
};

const saveSessionData = (session: SessionLog, email?: string) => {
  const currentUser = getCurrentUser();
  const targetEmail = email || currentUser.email || '';
  localStorage.setItem(getSessionStorageKey(targetEmail), JSON.stringify(session));
};

const startSession = (email?: string) => {
  const currentUser = getCurrentUser();
  const targetEmail = email || currentUser.email || '';
  const now = Date.now();
  
  const session: SessionLog = {
    email: targetEmail,
    startTime: now,
    lastActivityTime: now,
  };
  
  saveSessionData(session, targetEmail);
};

const getSessionDuration = (email?: string): number => {
  const session = getSessionData(email);
  if (!session) return 0;
  
  const now = Date.now();
  const durationMs = now - session.startTime;
  const durationMinutes = Math.floor(durationMs / (1000 * 60));
  return Math.min(durationMinutes, 480); // Max 8 jam per sesi
};

const readRawActivities = (email?: string): ActivityLog[] => {
  const currentUser = getCurrentUser();
  const targetEmail = email || currentUser.email || '';
  const scopedKey = getActivityStorageKey(targetEmail);
  const scopedLogs = JSON.parse(localStorage.getItem(scopedKey) || '[]');

  return Array.isArray(scopedLogs) ? scopedLogs : [];
};

const saveRawActivities = (logs: ActivityLog[], email?: string) => {
  localStorage.setItem(getActivityStorageKey(email), JSON.stringify(logs));
};

export function logActivity(
  action: ActivityLog['action'],
  target: string,
  description: string,
  data?: any
): void {
  const currentUser = getCurrentUser();
  const role = getCurrentRole();
  const email = currentUser.email || 'unknown@email.com';
  
  // Mulai sesi jika belum ada
  let session = getSessionData(email);
  if (!session) {
    startSession(email);
    session = getSessionData(email);
  }

  // Hitung durasi
  const now = Date.now();
  let duration = 0;
  if (session) {
    const durationMs = now - session.startTime;
    duration = Math.floor(durationMs / (1000 * 60)); // convert ke menit
    if (duration > 480) duration = 480; // max 8 jam
    
    // Update last activity time
    session.lastActivityTime = now;
    saveSessionData(session, email);
  }

  const activity: ActivityLog = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
    timestamp: new Date().toISOString(),
    user: {
      nama: currentUser.nama || 'Unknown',
      email: email,
      role,
    },
    action,
    target,
    description,
    duration,
    data,
  };

  const logs = readRawActivities(email);
  const trimmedLogs = [activity, ...logs].slice(0, 500);

  saveRawActivities(trimmedLogs, email);
}

export function getActivities(filter?: ActivityFilter): ActivityLog[] {
  let filtered = readRawActivities();

  if (filter?.role) {
    filtered = filtered.filter((log) => log.user.role === filter.role);
  }

  if (filter?.action) {
    filtered = filtered.filter((log) => log.action === filter.action);
  }

  if (filter?.limit) {
    filtered = filtered.slice(0, filter.limit);
  }

  return filtered;
}

export function deleteActivityById(id: string): void {
  const currentUser = getCurrentUser();
  const logs = readRawActivities(currentUser.email).filter(
    (activity) => activity.id !== id
  );

  saveRawActivities(logs, currentUser.email);
}

export function clearActivities(): void {
  const currentUser = getCurrentUser();
  localStorage.removeItem(getActivityStorageKey(currentUser.email));
}

export function resetLegacyPerangkatHistoryOnce(): void {
  const currentUser = getCurrentUser();
  const role = getCurrentRole();
  const email = currentUser.email || 'guest';
  const resetKey = `activityLogs_reset_${email}`;

  if (role !== 'perangkat' || localStorage.getItem(resetKey)) {
    return;
  }

  localStorage.removeItem(getActivityStorageKey(email));
  localStorage.setItem(resetKey, 'true');
}

export function getWeeklyActivity(): { hari: string; aktivitas: number }[] {
  const logs = readRawActivities();
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const now = new Date();
  const weekDuration = Array(7).fill(0); // Durasi dalam menit per hari

  logs.forEach((log) => {
    const logDate = new Date(log.timestamp);
    const daysDiff = Math.floor(
      (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff < 7) {
      const dayIndex = logDate.getDay();
      // Tambahkan durasi dari aktivitas (jika ada), atau 1 menit jika tidak ada durasi
      const duration = log.duration || 1;
      weekDuration[dayIndex] += duration;
    }
  });

  return days.map((hari, index) => ({
    hari,
    aktivitas: weekDuration[index],
  }));
}

export function getMonthlyTrend(): {
  bulan: string;
  penilaian: number;
  disetujui: number;
}[] {
  const logs = readRawActivities();
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ];

  const now = new Date();
  const currentMonth = now.getMonth();
  const monthlyData = [];

  for (let i = 3; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const monthName = months[monthIndex];

    // Hitung penilaian: termasuk action 'hitung' (baru), 'tambah', atau 'kirim'
    const penilaian = logs.filter((log) => {
      const logDate = new Date(log.timestamp);
      return (
        logDate.getMonth() === monthIndex &&
        (log.action === 'hitung' || log.action === 'tambah' || log.action === 'kirim')
      );
    }).length;

    // Hitung yang disetujui: action 'setujui'
    const disetujui = logs.filter((log) => {
      const logDate = new Date(log.timestamp);
      return logDate.getMonth() === monthIndex && log.action === 'setujui';
    }).length;

    monthlyData.push({
      bulan: monthName,
      penilaian,
      disetujui,
    });
  }

  return monthlyData;
}

// Fungsi alternative yang menghitung dari data warga (untuk akurasi lebih baik)
export function getMonthlyTrendFromWargaData(wargaData: any[]): {
  bulan: string;
  penilaian: number;
  disetujui: number;
}[] {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ];

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlyData = [];

  for (let i = 3; i >= 0; i--) {
    const targetMonth = (currentMonth - i + 12) % 12;
    const targetYear = currentMonth - i < 0 ? currentYear - 1 : currentYear;
    const monthName = months[targetMonth];
    
    // Hitung penilaian: jumlah warga dengan nilaiAkhir yang selesai di bulan/tahun ini
    const penilaian = wargaData.filter((warga) => {
      if (!warga.nilaiAkhir && warga.nilaiAkhir !== 0) return false;
      
      const completedDate = warga.penilaianCompletedAt 
        ? new Date(warga.penilaianCompletedAt)
        : warga.createdAt 
        ? new Date(warga.createdAt)
        : null;
        
      if (!completedDate) return false;
      
      return completedDate.getMonth() === targetMonth && 
             completedDate.getFullYear() === targetYear;
    }).length;

    // Hitung yang disetujui: warga dengan statusApproval === 'Disetujui' dan disetujui di bulan/tahun ini
    const disetujui = wargaData.filter((warga) => {
      if (warga.statusApproval !== "Disetujui") return false;
      if (!warga.statusApprovalAt) return false;
      
      const approvalDate = new Date(warga.statusApprovalAt);
      return approvalDate.getMonth() === targetMonth && 
             approvalDate.getFullYear() === targetYear;
    }).length;

    monthlyData.push({
      bulan: monthName,
      penilaian,
      disetujui,
    });
  }

  return monthlyData;
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} hari yang lalu`;
  } else if (hours > 0) {
    return `${hours} jam yang lalu`;
  } else if (minutes > 0) {
    return `${minutes} menit yang lalu`;
  } else {
    return 'Baru saja';
  }
}
