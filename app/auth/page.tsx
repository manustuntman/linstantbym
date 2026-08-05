'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: fullName,
            phone: phone
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName,
            phone: phone,
          });
        }
        alert('Compte créé avec succès ! Tu peux te connecter.');
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push('/profile');
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-gray-900 flex flex-col items-center justify-center px-4 pb-32 relative overflow-hidden">
      
      {/* Effet de lumière douce en arrière-plan */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[150%] max-w-[600px] h-[400px] bg-[#D4AF37]/15 blur-[90px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-[0.15em] uppercase text-gray-900 mb-2">
            {isSignUp ? 'Bienvenue' : 'Connexion'}
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-6 bg-[#D4AF37]/40"></div>
            <p className="text-[10px] text-gray-500 tracking-[0.15em] uppercase">
              {isSignUp ? "Crée ton espace client" : 'Heureuse de te revoir'}
            </p>
            <div className="h-[1px] w-6 bg-[#D4AF37]/40"></div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#D4AF37]/20">
          
          {error && (
            <div className="mb-6 p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest pl-1">Nom et Prénom</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3.5 text-sm bg-white border border-gray-100 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                    placeholder="Marie Dupont"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest pl-1">Numéro de téléphone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3.5 text-sm bg-white border border-gray-100 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </>
            )}
            
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest pl-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 text-sm bg-white border border-gray-100 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                placeholder="mon@email.com"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest pl-1">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 text-sm bg-white border border-gray-100 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex items-center justify-center w-full bg-gradient-to-r from-[#c29e31] via-[#D4AF37] to-[#c29e31] text-white font-medium py-4 px-6 mt-8 rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="tracking-[0.1em] text-xs uppercase relative z-10 py-0.5">
                {loading ? 'Patientez...' : isSignUp ? "S'inscrire" : 'Se connecter'}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[11px] text-gray-400 hover:text-[#D4AF37] uppercase tracking-wider font-semibold transition-colors"
            >
              {isSignUp ? 'Déjà un compte ? Connecte-toi' : "Pas encore de compte ? S'inscrire"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
