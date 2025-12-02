"use client"

import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setCurrentRole(data.current_role || "");
      setTargetRole(data.target_role || "");
    }

    setLoading(false);
  }

  async function saveProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("user_profiles").upsert({
      user_id: user.id,
      current_role: currentRole,
      target_role: targetRole
    });

    alert("Saved!");
  }

  async function generateRoadmap() {
  const res = await fetch("/api/generate-roadmap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      currentRole,
      targetRole,
    }),
  });

  const data = await res.json();

  if (data.error) {
    alert("Error: " + data.error);
    return;
  }

  alert("Roadmap generated!");
}


  if (loading) return <p className="p-10">Loading...</p>;

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Your Career Profile</h1>

      <label className="block font-semibold mb-1">Current Role</label>
      <input
        className="w-full border p-2 rounded mb-4"
        placeholder="e.g., Junior Developer"
        value={currentRole}
        onChange={(e) => setCurrentRole(e.target.value)}
      />

      <label className="block font-semibold mb-1">Target Role</label>
      <input
        className="w-full border p-2 rounded mb-4"
        placeholder="e.g., Senior Developer"
        value={targetRole}
        onChange={(e) => setTargetRole(e.target.value)}
      />

      <button
        onClick={saveProfile}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>

      <button
        onClick={generateRoadmap}
        className="bg-green-600 text-white px-4 py-2 rounded mt-4"
        >
        Generate AI Roadmap
        </button>

        <a
            href="/roadmap"
            className="text-blue-600 underline block mt-4"
            >
            View Roadmap
            </a>


    </div>
  );
}
