import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); // <-- TAMBAHKAN STATE PROFIL
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialData = async () => {
      // 1. Ambil sesi
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      // 2. Jika ada sesi, ambil profil
      if (session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      }
      setLoading(false);
    };

    getInitialData();

    // Pantau perubahan status autentikasi
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        // Jika login, ambil profil. Jika logout, kosongkan profil.
        if (session) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    session,
    profile, // <-- EXPOSE PROFIL KE CONTEXT
    login: (data) => supabase.auth.signInWithPassword(data),
    logout: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;