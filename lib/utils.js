export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '♡';
}

export function normaliseTags(input = '') {
  if (Array.isArray(input)) return input.filter(Boolean);
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);
}

export function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}

export function matchKey(a, b) {
  return [a, b].sort().join('__');
}
