import { NextAuthOptions } from 'next-auth';
import { getServerSession as getNextAuthServerSession } from 'next-auth';
import { Session, Profile, Account } from 'next-auth';

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface CustomSession extends Session {
  user: AuthUser;
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    signIn: async ({ user }) => {
      if (!user?.email) return false;
      return true;
    },
    session: async ({ session, user }): Promise<CustomSession> => {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      };
    }
  },
  providers: [], // Configure auth providers as needed
};

export async function auth() {
  const session = await getNextAuthServerSession(authOptions);
  return session as CustomSession | null;
}

export async function getServerSession(): Promise<CustomSession | null> {
  const session = await getNextAuthServerSession(authOptions);
  return session as CustomSession | null;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await getServerSession();
  return session?.user || null;
}

// Re-export for compatibility
export const getAuth = auth;
