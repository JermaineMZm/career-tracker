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

    // SAVE BASIC CHECK-IN FIRST
    const { data, error } = await supabase.from("check_ins").insert({
        user_id: user.id,
        mood,
        content: workedOn,
        challenges,
    }).select().single();
    

    if (error) {
        alert("Error saving check-in: " + error.message);
        setLoading(false);
        return;
    }

    // UPDATE STREAK
    await fetch("/api/update-streak", {
    method: "POST",
    });

    await fetch("/api/check-achievements", { method: "POST" });

    const checkInId = data.id;

    // CALL AI ROUTE
    const aiRes = await fetch("/api/check-in-ai", {
        method: "POST",
        body: JSON.stringify({
        checkInId,
        mood,
        content: workedOn,
        challenges,
        }),
    });

    const aiData = await aiRes.json();

    if (aiData.error) {
        alert("AI error: " + aiData.error);
    } else {
        alert("Check-in saved with AI insight!");
        console.log("AI Output:", aiData.ai);
    }

    // RESET FORM
    setWorkedOn("");
    setChallenges("");
    setMood(5);
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
