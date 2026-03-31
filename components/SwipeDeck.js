'use client';

import Avatar from '@/components/Avatar';

export default function SwipeDeck({ profiles, onAction, loading }) {
  if (!profiles.length) {
    return (
      <div className="card panel" style={{ textAlign: 'center' }}>
        <h2 className="section-title">Já viste todos</h2>
        <p className="helper">Quando entrarem novos convidados, aparecerão automaticamente aqui.</p>
      </div>
    );
  }

  const current = profiles[0];
  const next = profiles[1];

  return (
    <>
      <div className="stack">
        {next ? (
          <div className="card swipe-card back">
            <div className="swipe-photo">{next.photo_url ? <img src={next.photo_url} alt="" /> : <Avatar profile={next} size={120} />}</div>
          </div>
        ) : null}

        <div className="card swipe-card">
          <div className="swipe-photo">{current.photo_url ? <img src={current.photo_url} alt="" /> : <Avatar profile={current} size={128} />}</div>
          <div className="swipe-body">
            <div className="swipe-name">{current.name}{current.age ? `, ${current.age}` : ''}</div>
            <div className="helper">Convidado/a no casamento de Inês & Romeu</div>
            <div className="swipe-bio">{current.bio}</div>
            <div className="tag-row">
              {(current.tags || []).map((tag) => <span key={tag} className="tag">{tag}</span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="actions">
        <button className="circle-btn" disabled={loading} onClick={() => onAction('pass')}>🌿</button>
        <button className="circle-btn" disabled={loading} onClick={() => onAction('superlike')}>✨</button>
        <button className="circle-btn" disabled={loading} onClick={() => onAction('like')}>🌹</button>
      </div>
    </>
  );
}
