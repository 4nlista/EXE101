/**
 * @param {string|Date} dateStr 
 * @returns {string} Formatted date string
 */

// Format a date string to DD/MM/YYYY HH:mm

export const formatCreatedDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const formatDate = formatCreatedDate;

/**
 * Calculate remaining days to a deadline
 * @param {string|Date} deadlineStr 
 * @returns {string} Text indicating remaining days or expired
 */
export const calculateDaysLeft = (deadlineStr) => {
  if (!deadlineStr) return 'Không xác định';
  const diff = new Date(deadlineStr) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? `Còn ${days} ngày` : 'Hết hạn';
};
