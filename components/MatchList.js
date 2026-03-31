'use client';

import Link from 'next/link';
import Avatar from '@/components/Avatar';

export default function MatchList({ matches }) {
  if (!matches.length) {
    return (
      <div className="card panel" style={{ textAlign: 'center' }}>
        <h2 className="section-title">Ainda sem matches</h2>
        <p className="helper">Quando o interesse for mútuo, a conversa aparece aqui.</p>
      </div>
    );
  }

  return (
    <div className="list">
      {matches.map((match) => (
        <Link href={`/chat/${match.id}`} className="card list-item" key={match.id}>
          <Avatar profile={match.other_profile} size={52} />
          <div style={{ flex: 1 }}>
            <h3>{match.other_profile?.name || 'Match'}</h3>
            <p>{match.last_message?.content || 'Abre a conversa e diz olá.'}</p>
          </div>
          <div className="helper">→</div>
        </Link>
      ))}
    </div>
  );
}
