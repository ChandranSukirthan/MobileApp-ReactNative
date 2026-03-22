import { ACHIEVEMENT_TYPES } from '../constants/types';

export const getAchievementInfo = type => {
  return (
    ACHIEVEMENT_TYPES.find(t => t.value === type) || {
      value: type,
      label: type,
      color: '#64748B',
      bgColor: '#F1F5F9',
    }
  );
};

export const formatDate = dateString => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year} · ${hours}:${minutes}`;
};

export const getInitials = name => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const userHasLiked = (likes, userId) => {
  if (!likes?.length || !userId) return false;
  const uid = String(userId);
  return likes.some(entry => {
    const id =
      entry && typeof entry === 'object' && entry._id != null
        ? String(entry._id)
        : String(entry);
    return id === uid;
  });
};