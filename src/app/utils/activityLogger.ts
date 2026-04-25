// Utility untuk logging aktivitas sistem

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: {
    nama: string;
    email: string;
    role: 'perangkat' | 'kepala';
  };
  action: 'tambah' | 'edit' | 'hapus' | 'kirim' | 'setujui' | 'tolak';
  target: string;
  description: string;
  data?: any;
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

export const getActivityStorageKey = (email?: string) => {
  const currentUser = getCurrentUser();
  const normalizedEmail = email || currentUser.email || 'guest';
  return `activityLogs_${normalizedEmail}`;
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

  const activity: ActivityLog = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
    timestamp: new Date().toISOString(),
    user: {
      nama: currentUser.nama || 'Unknown',
      email: currentUser.email || 'unknown@email.com',
      role,
    },
    action,
    target,
    description,
    data,
  };

  const logs = readRawActivities(currentUser.email);
  const trimmedLogs = [activity, ...logs].slice(0, 500);

  saveRawActivities(trimmedLogs, currentUser.email);
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
  const weekData = days.map(() => 0);

  logs.forEach((log) => {
    const logDate = new Date(log.timestamp);
    const daysDiff = Math.floor(
      (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff < 7) {
      const dayIndex = logDate.getDay();
      weekData[dayIndex]++;
    }
  });

  return days.map((hari, index) => ({
    hari,
    aktivitas: weekData[index],
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

    const penilaian = logs.filter((log) => {
      const logDate = new Date(log.timestamp);
      return (
        logDate.getMonth() === monthIndex &&
        (log.action === 'tambah' || log.action === 'kirim')
      );
    }).length;

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
