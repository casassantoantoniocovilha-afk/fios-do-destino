import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="card hero">
        <div className="brand-kicker">✦ ✦ ✦</div>
        <h1>Fios do Destino</h1>
        <p>
          Uma versão robusta, elegante e inteiramente gratuita da experiência original do casamento de Inês & Romeu,
          agora preparada para produção com Next.js, Supabase e Vercel.
        </p>
        <div style={{ display: 'grid', gap: 10 }}>
          <Link href="/login" className="button">Entrar no evento</Link>
          <Link href="/discover" className="button-secondary">Ver convidados</Link>
        </div>
      </section>

      <section className="card panel" style={{ marginTop: 16 }}>
        <h2 className="section-title">O que esta versão inclui</h2>
        <div className="list">
          {[
            'Login leve com autenticação anónima no Supabase.',
            'Perfis persistentes com fotografia e interesses.',
            'Sistema de likes, superlikes e match automático.',
            'Chat em tempo real entre pares correspondidos.',
            'Estrutura segura com RLS e bucket público para avatares.',
          ].map((item) => (
            <div key={item} className="list-item card" style={{ padding: 12 }}>{item}</div>
          ))}
        </div>
      </section>
      <BottomNav />
    </main>
  );
}
