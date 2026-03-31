import './globals.css';

export const metadata = {
  title: 'Fios do Destino',
  description: 'Aplicação gratuita para o casamento de Inês & Romeu.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
