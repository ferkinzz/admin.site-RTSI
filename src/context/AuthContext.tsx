
'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User, UserRole, Profile } from '@/types';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const profileDocRef = doc(db, 'profiles', firebaseUser.uid);

        try {
          const [userDocSnap, profileDocSnap] = await Promise.all([
            getDoc(userDocRef),
            getDoc(profileDocRef),
          ]);

          const role = userDocSnap.exists()
            ? (userDocSnap.data().role as UserRole)
            : null;

          const profileData = profileDocSnap.exists()
            ? (profileDocSnap.data() as Profile)
            : { displayName: null, photoURL: null };

          const appUser: User = {
            ...firebaseUser,
            displayName: profileData.displayName || firebaseUser.displayName,
            photoURL: profileData.photoURL || firebaseUser.photoURL,
            role: role,
          };

          setUser(appUser);

          const token = await firebaseUser.getIdToken();
          document.cookie = `firebaseIdToken=${token}; path=/; max-age=3600`;
        } catch (error) {
          console.error('Error fetching user data, using default auth data.', error);
          const fallbackUser: User = { ...firebaseUser, role: null };
          setUser(fallbackUser);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        document.cookie = 'firebaseIdToken=; path=/; max-age=-1';
        if (pathname.includes('/dashboard')) {
          router.push('/login');
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    document.cookie = 'firebaseIdToken=; path=/; max-age=-1';
    router.push('/login');
  };

  const value = { user, loading, signOut };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex h-full w-full items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
