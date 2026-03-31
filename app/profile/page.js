'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileForm from '@/components/ProfileForm';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/lib/supabase-browser';
import { clearLocalProfile, loadLocalProfile, saveLocalProfile } from '@/lib/session';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const localProfile = loadLocalProfile();
    if (!localProfile) {
      router.push('/login');
      return;
    }
    setProfile(localProfile);
  }, [router]);

  async function uploadAvatar(userId, file) {
    if (!file) return profile?.photo_url || null;
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(values) {
    const current = loadLocalProfile();
    if (!current) throw new Error('Sessão inválida.');
    const photoUrl = await uploadAvatar(current.id, values.photoFile);
    const payload = {
      id: current.id,
      event_code: current.event_code,
      name: values.name,
      age: values.age,
      bio: values.bio,
      tags: values.tags,
      photo_url: photoUrl,
    };
    const { data, error } = await supabase.from('profiles').upsert(payload).select().single();
    if (error) throw error;
    saveLocalProfile(data);
    setProfile(data);
    setNotice('Perfil atualizado.');
  }

  async function handleDelete() {
    if (!window.confirm('Tens a certeza de que pretendes apagar o teu perfil?')) return;
    const current = loadLocalProfile();
    if (!current) return;
    await supabase.from('profiles').delete().eq('id', current.id);
    await supabase.auth.signOut();
    clearLocalProfile();
    router.push('/login');
  }

  return (
    <main className="page-shell">
      <div className="topbar">
        <div className="brand">
          <span className="brand-kicker">Perfil</span>
          <div className="brand-title">A tua presença</div>
          <div className="brand-subtitle">Revê e atualiza os teus dados</div>
        </div>
      </div>

      {profile ? <ProfileForm initialValues={{ ...profile, eventCode: profile.event_code }} onSubmit={handleSubmit} submitLabel="Atualizar perfil" /> : <div className="card panel">A carregar perfil...</div>}
      {notice ? <div className="notice" style={{ marginTop: 12 }}>{notice}</div> : null}
      <button className="button-secondary" onClick={handleDelete} style={{ width: '100%', marginTop: 12 }}>Apagar perfil e sair</button>
      <BottomNav />
    </main>
  );
}
