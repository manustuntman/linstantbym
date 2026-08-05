import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata = {
  title: "L'Instant by M. | Extensions de cils",
  description: "Parenthèse beauté & extensions de cils",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full bg-[#FAFAF7] text-zinc-900 antialiased selection:bg-amber-100 pb-28">
        <main className="min-h-full">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
