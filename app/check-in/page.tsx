"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function CheckInPage() {
  const supabase = supabaseBrowser();

  const [mood, setMood] = useState(5);
  const [workedOn, setWorkedOn] = useState("");
  const [challenges, setChallenges] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [existingId, setExistingId] = useState<string | null>(null);
  const [checkedInToday, setCheckedInToday] = useState(false);

  useEffect(() => { loadTodayCheckIn(); }, []);

  async function loadTodayCheckIn() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // compute start and end of today in ISO
    const start = new Date();
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const { data } = await supabase
      .from("check_ins")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString())
      .limit(1);

    const today = data?.[0] || null;

    if (today) {
      setExistingId(today.id);
      setMood(today.mood || 5);
      setWorkedOn(today.content || "");
      setChallenges(today.challenges || "");
      setCheckedInToday(true);
    } else {
      setExistingId(null);
      setCheckedInToday(false);
    }
  }

  const getMoodEmoji = (value: number) => {
    if (value <= 2) return "😞";
    if (value <= 4) return "😐";
    if (value <= 6) return "😐";
    if (value <= 8) return "😊";
    return "🤩";
  };

  const getMoodColor = (value: number) => {
    if (value <= 2) return "from-red-500 to-orange-500";
    if (value <= 4) return "from-yellow-500 to-orange-500";
    if (value <= 6) return "from-blue-500 to-purple-500";
    if (value <= 8) return "from-green-500 to-emerald-500";
    return "from-purple-500 to-pink-500";
  };

  async function submitCheckIn() {
    if (!workedOn.trim() && !challenges.trim()) {
      alert("Please share what you worked on or any challenges!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, content: workedOn, challenges }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json?.error || "Failed to save check-in");
        setLoading(false);
        return;
      }

      setSuccessMessage("✨ Check-in saved! Keep up the great work!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // keep values for editing, but mark checkedInToday
      setCheckedInToday(true);
      setMood(5);
      setWorkedOn("");
      setChallenges("");
    } catch (err: any) {
      alert(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="card-gradient p-8 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-4xl font-bold text-gradient">Daily Check-In</h1>
          <span className="text-4xl">📝</span>
        </div>

        <p className="text-gray-600 mb-10">How's your day going? Share your progress and any challenges you faced.</p>

        {/* Mood Slider */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <label className="font-bold text-lg text-gray-800">
              How's your mood today?
            </label>
            <div className="flex items-center gap-3 bg-white/80 px-4 py-2 rounded-full border-2 border-purple-200">
              <span className="text-3xl">{getMoodEmoji(mood)}</span>
              <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {mood}/10
              </span>
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className={`w-full h-3 bg-gradient-to-r ${getMoodColor(mood)} rounded-full appearance-none cursor-pointer slider`}
            style={{
              background: `linear-gradient(to right, #667eea, #764ba2, #f093fb)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Not Great</span>
            <span>Excellent</span>
          </div>
        </div>

        {/* What did you work on? */}
        <div className="mb-8">
          <label className="font-bold text-lg text-gray-800 mb-3 block">
            💪 What did you work on today?
          </label>
          <textarea
            value={workedOn}
            onChange={(e) => setWorkedOn(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white/80 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all resize-none text-gray-900"
            rows={4}
            placeholder="Describe your accomplishments today..."
          />
        </div>

        {/* Challenges */}
        <div className="mb-10">
          <label className="font-bold text-lg text-gray-800 mb-3 block">
            🚧 Any challenges you faced?
          </label>
          <textarea
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white/80 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all resize-none text-gray-900"
            rows={3}
            placeholder="Share any blockers or challenges..."
          />
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 border-l-4 border-green-500 rounded-lg">
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={submitCheckIn}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl font-bold text-lg transition-all transform hover:scale-102"
        >
          {loading ? "Saving..." : "✨ Submit Check-In"}
        </button>
      </div>
    </div>
  );
}

/* Custom slider styling */
const styles = `
  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.5);
    border: 3px solid #667eea;
  }

  input[type="range"]::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.5);
    border: 3px solid #667eea;
  }
`;