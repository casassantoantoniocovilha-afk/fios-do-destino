# Fios do Destino — Next.js + Supabase + Vercel

Este projeto é uma reconstrução da experiência original em HTML, transformada numa aplicação moderna e gratuita para uso num evento.

## Stack
- Next.js (App Router)
- Supabase (Auth, Postgres, Realtime, Storage)
- Vercel (deploy)

## 1. Instalar dependências
```bash
npm install
```

## 2. Criar `.env.local`
Usa `.env.example` como base.

```bash
cp .env.example .env.local
```

Depois preenche:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_EVENT_CODE`

## 3. Criar base de dados
No painel do Supabase:
- SQL Editor → colar `supabase-schema.sql`
- executar

## 4. Ativar autenticação anónima
Authentication → Providers → Anonymous Sign-Ins → Enable

## 5. Correr localmente
```bash
npm run dev
```

## 6. Publicar gratuitamente
- colocar o projeto num repositório GitHub
- importar o repositório para a Vercel
- adicionar as mesmas variáveis de ambiente na Vercel
- fazer deploy

## Notas de produção
- Esta versão usa RLS nas tabelas principais.
- As fotografias são guardadas no bucket público `avatars`.
- O código do evento funciona como filtro simples de entrada; se quiseres endurecer isto ainda mais, podes criar convites individuais.

## Melhorias recomendadas
- estado "online agora"
- notificações visuais de nova mensagem
- superlike com destaque no chat
- moderação/remoção de perfis pelo anfitrião
- página administrativa privada para Inês & Romeu
