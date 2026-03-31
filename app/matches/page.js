'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MatchList from '@/components/MatchList';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/lib/supabase-browser';
import { loadLocalProfile } from '@/lib/session';

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      if (!supabase) return setLoading(false);
      const localProfile = loadLocalProfile();
      if (!localProfile) {
        router.push('/login');
        return;
      }

      const { data: matchRows, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user_a.eq.${localProfile.id},user_b.eq.${localProfile.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const otherIds = (matchRows || []).map((row) => (row.user_a === localProfile.id ? row.user_b : row.user_a));
      const { data: profiles } = otherIds.length
        ? await supabase.from('profiles').select('*').in('id', otherIds)
        : { data: [] };

      const { data: messages } = (matchRows || []).length
        ? await supabase.from('messages').select('*').in('match_id', matchRows.map((row) => row.id)).order('created_at', { ascending: false })
        : { data: [] };

      const enriched = (matchRows || []).map((row) => ({
        ...row,
        other_profile: (profiles || []).find((profile) => profile.id === (row.user_a === localProfile.id ? row.user_b : row.user_a)),
        last_message: (messages || []).find((message) => message.match_id === row.id),
      }));

      setMatches(enriched);
      setLoading(false);
    }
    init();
  }, [router]);

  return (
    <main className="page-shell">
      <div className="topbar">
        <div className="brand">
          <span className="brand-kicker">Matches</span>
          <div className="brand-title">Conversas</div>
          <div className="brand-subtitle">Aqui começam os fios mútuos</div>
        </div>
      </div>

      {loading ? <div className="card panel">A carregar matches...</div> : <MatchList matches={matches} />}
      <BottomNav />
    </main>
  );
}
