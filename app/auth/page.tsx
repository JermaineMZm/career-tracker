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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gradient mb-3">🚀 CareerCoachAI</h1>
          <p className="text-gray-600 text-lg">Your personal AI career coach</p>
        </div>

        {/* Auth Card */}
        <div className="card-gradient p-8 shadow-2xl">
        <Auth
          supabaseClient={supabase}
          providers={[]}  
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#9333ea",
                  brandAccent: "#7e22ce",
                  inputText: "#111",
                },
              },
            },
          }}
        />          <div className="mt-6 pt-6 border-t border-purple-200">
            <p className="text-xs text-gray-500 text-center">
              Join thousands of professionals building their dream careers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
