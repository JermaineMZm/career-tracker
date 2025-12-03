"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function AuthPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  // Redirect user after login
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          router.push("/dashboard");
        }
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <Auth
          supabaseClient={supabase}
          providers={[]}  
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#2563eb",
                  brandAccent: "#1d4ed8",
                  inputText: "#111",
                  labelText: "#111",
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
