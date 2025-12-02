"use client"

import { supabaseBrowser } from "@/lib/supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function AuthPage() {
  const supabase = supabaseBrowser();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <Auth
          supabaseClient={supabase}
          theme="dark"
          appearance={{
            variables: {
              default: {
                colors: {
                  brand: "#3b82f6",
                  brandAccent: "#1d4ed8",
                }
              }
            }
          }}
          providers={[]}
        />
      </div>
    </div>
  );
}
