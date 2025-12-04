"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const supabase = supabaseBrowser();

  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
    setSaving(true);
    setSuccessMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("user_profiles").upsert({
      user_id: user.id,
      current_role: currentRole,
      target_role: targetRole,
    });

    setSaving(false);
    setSuccessMessage("✨ Profile updated successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse-soft text-4xl mb-3">🎯</div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="card-gradient p-8 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-4xl font-bold text-gradient">Your Career Profile</h1>
          <span className="text-4xl">🚀</span>
        </div>

        <p className="text-gray-600 mb-8">Define your current position and where you want to go</p>

        {/* Current Role Input */}
        <div className="mb-7">
          <label className="block font-semibold mb-3 text-gray-800 text-lg">
            💼 Current Role
          </label>
          <input
            type="text"
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            placeholder="e.g., Junior Developer"
            className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white/80 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all text-gray-900"
          />
          <p className="text-xs text-gray-500 mt-2">What's your current role or position?</p>
        </div>

        {/* Target Role Input */}
        <div className="mb-8">
          <label className="block font-semibold mb-3 text-gray-800 text-lg">
            🎯 Target Role
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g., Senior Developer"
            className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white/80 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all text-gray-900"
          />
          <p className="text-xs text-gray-500 mt-2">What role do you want to achieve?</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 border-l-4 border-green-500 rounded-lg">
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={saveProfile}
          disabled={saving}
          className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl font-bold text-lg transition-all transform hover:scale-102"
        >
          {saving ? "Saving..." : "✨ Save Profile"}
        </button>
      </div>
    </div>
  );
}