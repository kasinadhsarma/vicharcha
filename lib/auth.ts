interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  expires: string;
}

// This is a placeholder auth function. In a real app, you would use a proper auth system like NextAuth.js
export async function auth(): Promise<Session | null> {
  // TODO: Implement real authentication
  // For now, return a mock session
  return {
    user: {
      id: "mock-user-id",
      name: "Mock User",
      email: "mock@example.com"
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
  };
}

export function getServerSession(): Promise<Session | null> {
  return auth();
}

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: { auth: Session | null; request: { nextUrl: URL } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = nextUrl.pathname.startsWith('/feed') || 
                         nextUrl.pathname.startsWith('/api/stories');
      
      if (isProtected && !isLoggedIn) {
        return false;
      }

      return true;
    },
  },
  providers: [], // Configure your auth providers here
};
