'use client';

const KEY = 'fios-do-destino-profile';

export function saveLocalProfile(profile) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(profile));
}

export function loadLocalProfile() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearLocalProfile() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}
