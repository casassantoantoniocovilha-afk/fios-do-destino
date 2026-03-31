'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SwipeDeck from '@/components/SwipeDeck';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/lib/supabase-browser';
import { loadLocalProfile } from '@/lib/session';
import { matchKey } from '@/lib/utils';

export default function DiscoverPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    async function init() {
      if (!supabase) return setLoading(false);
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      const localProfile = loadLocalProfile();
      if (!session || !localProfile) {
        router.push('/login');
        return;
      }
      setMe(localProfile);
      await loadQueue(localProfile);
      setLoading(false);
    }
    init();
  }, [router]);

  async function loadQueue(profile) {
    const { data: swipes } = await supabase.from('swipes').select('swiped_id').eq('swiper_id', profile.id);
    const seenIds = (swipes || []).map((item) => item.swiped_id);

    let query = supabase
      .from('profiles')
      .select('*')
      .eq('event_code', profile.event_code)
      .neq('id', profile.id)
      .order('created_at', { ascending: false });

    if (seenIds.length) query = query.not('id', 'in', `(${seenIds.join(',')})`);

    const { data, error } = await query;
    if (error) throw error;
    setProfiles(data || []);
  }

  async function handleAction(action) {
    if (!profiles.length || !me) return;
    setWorking(true);
    setNotice('');
    const current = profiles[0];

    try {
      const { error: swipeError } = await supabase.from('swipes').upsert({
        swiper_id: me.id,
        swiped_id: current.id,
        action,
      });
      if (swipeError) throw swipeError;

      if (action !== 'pass') {
        const { data: reciprocal, error: reciprocalError } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_id', current.id)
          .eq('swiped_id', me.id)
          .in('action', ['like', 'superlike']);
        if (reciprocalError) throw reciprocalError;

        if (reciprocal?.length) {
          const userA = [me.id, current.id].sort()[0];
          const userB = [me.id, current.id].sort()[1];
          const pairKey = matchKey(me.id, current.id);
          const { error: matchError } = await supabase.from('matches').upsert({
            user_a: userA,
            user_b: userB,
            pair_key: pairKey,
          });
          if (matchError) throw matchError;
          setNotice(`É mútuo! ${current.name} também demonstrou interesse.`);
        }
      }

      setProfiles((currentProfiles) => currentProfiles.slice(1));
    } catch (error) {
      setNotice(error.message || 'Não foi possível registar a ação.');
    } finally {
      setWorking(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="topbar">
        <div className="brand">
          <span className="brand-kicker">Descobrir</span>
          <div className="brand-title">Convidados</div>
          <div className="brand-subtitle">Escolhe quem queres conhecer melhor</div>
        </div>
      </div>

      {loading ? <div className="card panel">A carregar convidados...</div> : null}
      {!loading && supabase ? <SwipeDeck profiles={profiles} onAction={handleAction} loading={working} /> : null}
      {!supabase ? <div className="notice">Antes de usar esta página, configura o Supabase e executa o SQL fornecido.</div> : null}
      {notice ? <div className="notice" style={{ marginTop: 14 }}>{notice}</div> : null}
      <BottomNav />
    </main>
  );
}
