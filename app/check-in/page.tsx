"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function CheckInPage() {
  const supabase = supabaseBrowser();

  const [mood, setMood] = useState(5);
  const [workedOn, setWorkedOn] = useState("");
  const [challenges, setChallenges] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitCheckIn() {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("check_ins").insert({
      user_id: user.id,
      mood,
      content: workedOn,
      challenges,
    });

    if (error) {
      alert("Error saving check-in: " + error.message);
    } else {
      alert("Check-in saved!");
      setWorkedOn("");
      setChallenges("");
      setMood(5);
    }

    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow text-black">
      <h1 className="text-3xl font-bold mb-6 text-black">Daily Check-In</h1>

      <label className="block mb-2 font-semibold">Mood (1–10)</label>
      <input
        type="range"
        min="1"
        max="10"
        value={mood}
        onChange={(e) => setMood(Number(e.target.value))}
        className="w-full mb-4"
      />
      <p className="mb-4">Current mood: <strong>{mood}</strong></p>

      <label className="block mb-2 font-semibold">What did you work on today?</label>
      <textarea
        value={workedOn}
        onChange={(e) => setWorkedOn(e.target.value)}
        className="w-full border p-2 rounded mb-4 text-black"
        rows={4}
      />

      <label className="block mb-2 font-semibold">Any challenges?</label>
      <textarea
        value={challenges}
        onChange={(e) => setChallenges(e.target.value)}
        className="w-full border p-2 rounded mb-4 text-black"
        rows={4}
      />

      <button
        onClick={submitCheckIn}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        {loading ? "Saving..." : "Submit Check-In"}
      </button>
    </div>
  );
}
