export const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  let h = parseInt(hours);
  const m = parseInt(minutes);

  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};
