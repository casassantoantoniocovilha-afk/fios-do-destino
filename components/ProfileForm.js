'use client';

import { useState } from 'react';
import Avatar from '@/components/Avatar';
import { normaliseTags } from '@/lib/utils';

export default function ProfileForm({ initialValues, onSubmit, submitLabel = 'Guardar perfil' }) {
  const [form, setForm] = useState({
    eventCode: initialValues?.eventCode || '',
    name: initialValues?.name || '',
    age: initialValues?.age || '',
    bio: initialValues?.bio || '',
    tags: (initialValues?.tags || []).join(', '),
    photoFile: null,
  });
  const [preview, setPreview] = useState(initialValues?.photo_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('O nome é obrigatório.');
    if (!form.bio.trim()) return setError('A biografia é obrigatória.');
    setLoading(true);
    try {
      await onSubmit({
        eventCode: form.eventCode,
        name: form.name.trim(),
        age: Number(form.age) || null,
        bio: form.bio.trim(),
        tags: normaliseTags(form.tags),
        photoFile: form.photoFile,
      });
    } catch (err) {
      setError(err.message || 'Não foi possível guardar o perfil.');
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setForm((current) => ({ ...current, photoFile: file }));
    setPreview(URL.createObjectURL(file));
  }

  return (
    <form className="card panel" onSubmit={handleSubmit}>
      <div className="upload-box" style={{ marginBottom: 16 }}>
        <Avatar profile={{ name: form.name, photo_url: preview }} size={88} />
        <div className="helper">Fotografia opcional. Para manter tudo gratuito, a imagem é enviada para o bucket público do evento.</div>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <div className="field">
        <label>Código do evento</label>
        <input value={form.eventCode} onChange={(e) => setForm({ ...form, eventCode: e.target.value })} placeholder="Introduz o código do casamento" />
      </div>

      <div className="inline-row">
        <div className="field">
          <label>Nome</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Como te chamas?" />
        </div>
        <div className="field">
          <label>Idade</label>
          <input type="number" min="18" max="99" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="Idade" />
        </div>
      </div>

      <div className="field">
        <label>Biografia</label>
        <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Uma frase que te apresente aos outros convidados." />
      </div>

      <div className="field">
        <label>Interesses</label>
        <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="dança, viagens, literatura, cinema" />
      </div>

      {error ? <div className="notice" style={{ background: '#fff0f3', borderColor: '#f3c3d0', color: '#8d2240', marginBottom: 12 }}>{error}</div> : null}

      <button className="button" disabled={loading} type="submit" style={{ width: '100%' }}>
        {loading ? 'A guardar...' : submitLabel}
      </button>
    </form>
  );
}
