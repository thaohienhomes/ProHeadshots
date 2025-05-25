import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  try {
    // Check both session and user to be more robust
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If we have either a session or a user, allow access
    if (!session && !user) {
      redirect("/login");
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Layout error:", error);
    // Don't redirect on error, just log it
    return <>{children}</>;
  }
}
