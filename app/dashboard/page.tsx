import { supabaseServer } from "@/lib/supabaseServer";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 p-10 text-black">
        You must be logged in.
      </div>
    );
  }

  // Fetch latest roadmap
  const { data: roadmap } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  // Fetch last check-in
  const { data: checkIns } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const lastCheckIn = checkIns?.[0];

  const { data: userStats } = await supabase
  .from("user_stats")
  .select("*")
  .eq("user_id", user.id)
  .single();

  const { data: achievements } = await supabase
  .from("achievements")
  .select("*")
  .eq("user_id", user.id)
  .order("unlocked_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-100 text-black p-10">
      <h1 className="text-3xl font-bold mb-4">
        Welcome back, {user.email?.split("@")[0]} 👋
      </h1>

      <p className="mb-8 text-gray-700">
        Here’s how you're progressing this week.
      </p>

      {/* STREAK BOX */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">Your Streak</h2>

        {!userStats ? (
          <p>No streak yet — make a check-in!</p>
        ) : (
          <div>
            <p><strong>Current streak:</strong> {userStats.current_streak} days 🔥</p>
            <p><strong>Longest streak:</strong> {userStats.longest_streak} days 🏆</p>
          </div>
        )}

        <Link
          href="/check-in"
          className="text-blue-600 underline block mt-3"
        >
          Make a Check-In →
        </Link>
      </div>

      {/* ACHIEVEMENTS */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">Achievements</h2>

        {!achievements || achievements.length === 0 ? (
          <p>No achievements yet — keep going!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="p-4 border rounded bg-gradient-to-br from-yellow-100 to-yellow-200"
              >
                <p className="font-bold text-lg">{ach.title}</p>
                <p className="text-sm text-gray-600">{ach.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ROADMAP SUMMARY BOX */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">Your Roadmap</h2>
        {!roadmap || roadmap.length === 0 ? (
          <p>You haven't generated a roadmap yet.</p>
        ) : (
          <p className="text-gray-700 mb-3">
            Your roadmap includes skills, projects, certifications, and a
            timeline to follow.
          </p>
        )}
        <Link
          href="/roadmap"
          className="text-blue-600 underline"
        >
          View Full Roadmap →
        </Link>
      </div>

      {/* TODAY’S AI SUGGESTIONS */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">Today's AI Suggestions</h2>

        {!lastCheckIn ? (
          <p>No check-ins yet — make your first one!</p>
        ) : lastCheckIn.ai_suggestions ? (
          <ul className="list-disc ml-6 text-gray-800">
            {lastCheckIn.ai_suggestions.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        ) : (
          <p>No AI suggestions yet — complete a check-in!</p>
        )}

        <Link
          href="/check-in"
          className="text-blue-600 underline block mt-3"
        >
          Make a Check-In →
        </Link>
      </div>

      {/* QUICK ACTIONS */}
      <div className="flex gap-4">
        <Link
          href="/check-in"
          className="bg-blue-600 text-white px-6 py-3 rounded shadow"
        >
          New Daily Check-In
        </Link>

        <Link
          href="/check-ins"
          className="bg-gray-800 text-white px-6 py-3 rounded shadow"
        >
          View Check-In History
        </Link>
      </div>
    </div>
  );
}
