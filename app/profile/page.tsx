'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth');
        return;
      }

      setUser(session.user);

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    }

    getProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
    router.refresh();
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[70vh] text-zinc-400 text-sm">Chargement du profil...</div>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Mon Profil</h1>

      <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <span className="text-xs text-zinc-400 uppercase tracking-wider">Nom complet</span>
          <p className="text-base font-medium text-zinc-800">{profile?.full_name || 'Non renseigné'}</p>
        </div>

        <div>
          <span className="text-xs text-zinc-400 uppercase tracking-wider">Email</span>
          <p className="text-base font-medium text-zinc-800">{user?.email}</p>
        </div>

        <div>
          <span className="text-xs text-zinc-400 uppercase tracking-wider">Téléphone</span>
          <p className="text-base font-medium text-zinc-800">{profile?.phone || 'Non renseigné'}</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-4 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
