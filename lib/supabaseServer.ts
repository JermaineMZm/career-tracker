import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/auth-helpers-nextjs";

// MUST be async because cookies() is async in Next.js 15
export const supabaseServer = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Read-only cookies (allowed)
          return cookieStore.get(name)?.value;
        },
        set(_name: string, _value: string, _options: CookieOptions) {
          // NO-OP — writing cookies here causes Next.js errors
        },
        remove(_name: string, _options: CookieOptions) {
          // NO-OP — writing cookies here causes Next.js errors
        },
      },
    }
  );
};
