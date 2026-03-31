'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileForm from '@/components/ProfileForm';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/lib/supabase-browser';
import { saveLocalProfile } from '@/lib/session';

export default function LoginPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setReady(true);
  }, []);

  async function uploadAvatar(userId, file) {
    if (!file) return null;
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(values) {
    if (!supabase) throw new Error('Faltam as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    const expectedCode = process.env.NEXT_PUBLIC_EVENT_CODE;
    if (expectedCode && values.eventCode !== expectedCode) {
      throw new Error('O código do evento não corresponde ao código configurado.');
    }

    let session = (await supabase.auth.getSession()).data.session;
    if (!session) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      session = data.session;
    }

    const userId = session.user.id;
    const photoUrl = values.photoFile ? await uploadAvatar(userId, values.photoFile) : null;

    const payload = {
      id: userId,
      event_code: values.eventCode,
      name: values.name,
      age: values.age,
      bio: values.bio,
      tags: values.tags,
    };

    if (photoUrl) payload.photo_url = photoUrl;

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    saveLocalProfile(data);
    setNotice('Perfil guardado com sucesso.');
    router.push('/discover');
  }

  return (
    <main className="page-shell">
      <div className="topbar">
        <div className="brand">
          <span className="brand-kicker">Entrada</span>
          <div className="brand-title">Fios do Destino</div>
          <div className="brand-subtitle">Cria o teu perfil de convidado</div>
        </div>
      </div>

      <ProfileForm initialValues={{}} onSubmit={handleSubmit} submitLabel="Entrar com graça ✦" />
      {ready && !supabase ? <div className="notice" style={{ marginTop: 12 }}>Configura primeiro o ficheiro .env.local com as credenciais do Supabase.</div> : null}
      {notice ? <div className="notice" style={{ marginTop: 12 }}>{notice}</div> : null}
      <BottomNav />
    </main>
  );
}
