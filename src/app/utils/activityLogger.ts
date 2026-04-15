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
  target: string; // NIK atau nama warga
  description: string;
  data?: any; // data tambahan jika diperlukan
}

export function logActivity(
  action: ActivityLog['action'],
  target: string,
  description: string,
  data?: any
): void {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const role = currentUser.email?.includes('@kades.com') ? 'kepala' : 'perangkat';

  const activity: ActivityLog = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    user: {
      nama: currentUser.nama || 'Unknown',
      email: currentUser.email || 'unknown@email.com',
      role: role
    },
    action,
    target,
    description,
    data
  };

  // Get existing logs
  const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
  
  // Add new log
  logs.unshift(activity); // Add to beginning
  
  // Keep only last 500 logs
  const trimmedLogs = logs.slice(0, 500);
  
  // Save back to localStorage
  localStorage.setItem('activityLogs', JSON.stringify(trimmedLogs));
}

export function getActivities(filter?: {
  role?: 'perangkat' | 'kepala';
  action?: ActivityLog['action'];
  limit?: number;
}): ActivityLog[] {
  const logs: ActivityLog[] = JSON.parse(localStorage.getItem('activityLogs') || '[]');
  
  let filtered = logs;
  
  if (filter?.role) {
    filtered = filtered.filter(log => log.user.role === filter.role);
  }
  
  if (filter?.action) {
    filtered = filtered.filter(log => log.action === filter.action);
  }
  
  if (filter?.limit) {
    filtered = filtered.slice(0, filter.limit);
  }
  
  return filtered;
}

export function getWeeklyActivity(): { hari: string; aktivitas: number }[] {
  const logs: ActivityLog[] = JSON.parse(localStorage.getItem('activityLogs') || '[]');
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  
  const now = new Date();
  const weekData = days.map(() => 0);
  
  logs.forEach(log => {
    const logDate = new Date(log.timestamp);
    const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 7) {
      const dayIndex = logDate.getDay();
      weekData[dayIndex]++;
    }
  });
  
  return days.map((hari, index) => ({
    hari,
    aktivitas: weekData[index]
  }));
}

export function getMonthlyTrend(): { bulan: string; penilaian: number; disetujui: number }[] {
  const logs: ActivityLog[] = JSON.parse(localStorage.getItem('activityLogs') || '[]');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const monthlyData = [];
  
  // Get last 4 months including current
  for (let i = 3; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const monthName = months[monthIndex];
    
    const penilaian = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate.getMonth() === monthIndex && 
             (log.action === 'tambah' || log.action === 'kirim');
    }).length;
    
    const disetujui = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate.getMonth() === monthIndex && log.action === 'setujui';
    }).length;
    
    monthlyData.push({
      bulan: monthName,
      penilaian,
      disetujui
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
