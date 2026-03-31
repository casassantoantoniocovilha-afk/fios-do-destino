'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/discover', label: 'Descobrir', icon: '🃏' },
  { href: '/matches', label: 'Matches', icon: '💌' },
  { href: '/profile', label: 'Perfil', icon: '🌸' },
  { href: '/login', label: 'Entrar', icon: '✦' },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname === '/') return null;

  return (
    <nav className="bottom-nav">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={pathname.startsWith(link.href) ? 'active' : ''}>
          <div>{link.icon}</div>
          <div>{link.label}</div>
        </Link>
      ))}
    </nav>
  );
}
