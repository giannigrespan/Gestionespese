import "./globals.css";

export const metadata = {
  title: "Gestione Spese",
  description: "Gestisci le spese e il budget della tua famiglia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className="min-h-screen text-slate-900">{children}</body>
    </html>
  );
}
