import { redirect } from 'next/navigation';

interface LocalePageProps {
  params: Promise<{
    locale: string;
  }>;
}

/**
 * Locale Page - Redirects to main page
 *
 * This handles dynamic locale routes and redirects to the main page
 * since we're currently using English only
 */
export default async function LocalePage({ params }: LocalePageProps) {
  // Await the params in Next.js 15
  const { locale } = await params;

  // For now, redirect all locale requests to the main page
  // In the future, this could handle proper internationalization
  redirect('/');
}
