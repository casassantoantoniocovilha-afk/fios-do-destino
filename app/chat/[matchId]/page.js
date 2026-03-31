'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import Avatar from '@/components/Avatar';
import ChatPanel from '@/components/ChatPanel';
import { supabase } from '@/lib/supabase-browser';
import { loadLocalProfile } from '@/lib/session';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId;
  const [me, setMe] = useState(null);
  const [otherProfile, setOtherProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    async function init() {
      const localProfile = loadLocalProfile();
      if (!localProfile) {
        router.push('/login');
        return;
      }
      setMe(localProfile);

      const { data: matchRow, error: matchError } = await supabase.from('matches').select('*').eq('id', matchId).single();
      if (matchError) {
        setNotice('Não foi possível abrir esta conversa.');
        return;
      }

      const otherId = matchRow.user_a === localProfile.id ? matchRow.user_b : matchRow.user_a;
      const { data: profileRow } = await supabase.from('profiles').select('*').eq('id', otherId).single();
      setOtherProfile(profileRow);

      const { data: messageRows } = await supabase.from('messages').select('*').eq('match_id', matchId).order('created_at', { ascending: true });
      setMessages((messageRows || []).map((message) => ({ ...message, isMine: message.sender_id === localProfile.id })));
    }
    if (matchId && supabase) init();
  }, [matchId, router]);

  useEffect(() => {
    if (!supabase || !matchId || !me) return undefined;

    const channel = supabase
      .channel(`messages-${matchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
        (payload) => {
          setMessages((current) => {
            const exists = current.some((item) => item.id === payload.new.id);
            if (exists) return current;
            return [...current, { ...payload.new, isMine: payload.new.sender_id === me.id }];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, me]);

  async function handleSend(content) {
    const { error } = await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: me.id,
      content,
    });
    if (error) throw error;
  }

  return (
    <main className="page-shell">
      <div className="topbar" style={{ justifyContent: 'flex-start' }}>
        <button className="button-secondary" onClick={() => router.push('/matches')}>←</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {otherProfile ? <Avatar profile={otherProfile} size={52} /> : null}
          <div>
            <div className="brand-title" style={{ fontSize: 24 }}>{otherProfile?.name || 'Conversa'}</div>
            <div className="brand-subtitle">No casamento de Inês & Romeu</div>
          </div>
        </div>
      </div>

      {notice ? <div className="notice">{notice}</div> : <ChatPanel messages={messages} onSend={handleSend} disabled={!me} />}
      <BottomNav />
    </main>
  );
}
