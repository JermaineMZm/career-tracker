import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/auth-helpers-nextjs";

// MUST be async now because cookies() returns a Promise in Next.js 15
export const supabaseServer = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // Must NOT mutate cookies outside route handlers → no-op
        set(name: string, value: string, options: CookieOptions) {
          // no-op
        },
        remove(name: string, options: CookieOptions) {
          // no-op
        },
      },
    }
  );
};
