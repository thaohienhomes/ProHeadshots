import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  // Force local development URL for OAuth redirects
  const isDevelopment = process.env.NODE_ENV === 'development';
  const siteUrl = isDevelopment ? process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' : undefined;

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        ...(isDevelopment && siteUrl && {
          redirectTo: `${siteUrl}/auth/callback`,
        }),
      },
    }
  );
};
