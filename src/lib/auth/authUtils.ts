// Authentication utility that works with NextAuth.js
import { getSession as getNextAuthSession } from 'next-auth/react'
import { Session } from 'next-auth'

export interface AuthSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  accessToken?: string;
}

// Fallback session for development/testing when not authenticated
const createMockSession = (): AuthSession => ({
  user: {
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@coolpix.me',
    image: '/default-avatar.png',
  },
  accessToken: 'mock-access-token',
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
});

// Main session getter that uses NextAuth.js
export const getAuthSession = async (): Promise<AuthSession | null> => {
  try {
    const session = await getNextAuthSession();

    if (session?.user) {
      return {
        ...session,
        user: {
          id: session.user.id || 'unknown',
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        },
        accessToken: session.accessToken,
      } as AuthSession;
    }

    // Return mock session for development when not authenticated
    if (process.env.NODE_ENV === 'development') {
      return createMockSession();
    }

    return null;
  } catch (error) {
    console.warn('Error getting session:', error);

    // Return mock session for development on error
    if (process.env.NODE_ENV === 'development') {
      return createMockSession();
    }

    return null;
  }
};

// Get authentication headers for API requests
export const getAuthHeaders = async (): Promise<HeadersInit> => {
  const session = await getAuthSession();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  return headers;
};

// Get current user ID
export const getCurrentUserId = async (): Promise<string> => {
  const session = await getAuthSession();
  return session?.user?.id || 'demo-user';
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getAuthSession();
  return !!session?.user?.id;
};

// Get user info
export const getCurrentUser = async () => {
  const session = await getAuthSession();
  return session?.user || null;
};

// React hook for authentication status
export const useAuthStatus = () => {
  // Import useSession from next-auth/react for real-time session updates
  try {
    const { useSession } = require('next-auth/react');
    const { data: session, status } = useSession();

    return {
      isLoading: status === 'loading',
      isAuthenticated: !!session?.user,
      user: session?.user || null,
      session,
    };
  } catch (error) {
    // Fallback if next-auth is not properly set up
    return {
      isLoading: false,
      isAuthenticated: true, // For demo purposes
      user: {
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@coolpix.me',
      },
      session: null,
    };
  }
};
