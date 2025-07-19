
export interface TimeSpentData {
  date: string;
  totalMinutes: number;
}

export const getColorForTimeSpent = (minutes: number): string => {
  if (minutes === 0) return '';
  if (minutes <= 30) return 'bg-blue-100 hover:bg-blue-200';
  if (minutes <= 90) return 'bg-blue-200 hover:bg-blue-300';
  if (minutes <= 240) return 'bg-blue-400 hover:bg-blue-500';
  if (minutes <= 600) return 'bg-blue-600 hover:bg-blue-700';
  return 'bg-blue-800 hover:bg-blue-900';
};

export const getTextColorForTimeSpent = (minutes: number): string => {
  if (minutes === 0) return '';
  if (minutes <= 30) return 'text-blue-800';
  if (minutes <= 90) return 'text-blue-900';
  if (minutes <= 240) return 'text-white';
  if (minutes <= 600) return 'text-white';
  return 'text-white';
};

export const formatTimeSpent = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};
