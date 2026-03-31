'use client';

import { initials } from '@/lib/utils';

export default function Avatar({ profile, size = 72 }) {
  const label = initials(profile?.name || profile?.display_name || '');
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size / 2.5 }}>
      {profile?.photo_url ? <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : label}
    </div>
  );
}
