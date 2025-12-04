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
  const { data: roadmapRows } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const roadmapData = roadmapRows?.[0]?.roadmap_json || null;

  // Fetch last check-in
  const { data: checkIns } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const lastCheckIn = checkIns?.[0];

  const hasCheckedInToday = lastCheckIn
    ? new Date(lastCheckIn.created_at).toISOString().slice(0, 10) ===
      new Date().toISOString().slice(0, 10)
    : false;

  // Fetch streak stats
  const { data: userStats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Fetch achievements
  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", user.id)
    .order("unlocked_at", { ascending: false });

  // Fetch roadmap progress
  const { data: roadmapProgress } = await supabase
    .from("roadmap_progress")
    .select("*")
    .eq("user_id", user.id);

  // Fetch today's tasks
  const today = new Date().toISOString().slice(0, 10);

  const { data: dailyTasks } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("created_at", today)
    .order("created_at");

  // ROADMAP PROGRESS CALCULATION
  let totalSkills = 0,
      totalProjects = 0,
      totalCerts = 0,
      totalTimeline = 0,
      totalItems = 0,
      completed = 0,
      percent = 0;

  if (roadmapData) {
    totalSkills = roadmapData.skillsToLearn?.length || 0;
    totalProjects = roadmapData.projectsToBuild?.length || 0;
    totalCerts = roadmapData.certifications?.length || 0;
    totalTimeline = roadmapData.timeline
      ? Object.values(roadmapData.timeline).flat().length
      : 0;

    totalItems = totalSkills + totalProjects + totalCerts + totalTimeline;
  }

  if (roadmapProgress) {
    completed = roadmapProgress.filter((p) => p.completed).length;
  }

  percent = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen py-8">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-2 text-gradient">
          Welcome back, {user.email?.split("@")[0]}! 👋
        </h1>
        <p className="text-lg text-gray-600">
          Here's how you're progressing this week. Keep up the momentum! 🚀
        </p>
      </div>

      {/* Prompt to check-in today */}
      {!hasCheckedInToday && (
        <div className="mb-8 card p-6 bg-gradient-to-br from-white via-purple-50 to-pink-50 border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">You haven't checked in today.</p>
              <p className="text-sm text-gray-600">Make a quick check-in to track your streak and get AI suggestions.</p>
            </div>
            <Link
              href="/check-in"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Check In Now
            </Link>
          </div>
        </div>
      )}

      {/* Top Stats - Streak & Roadmap Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* STREAK BOX */}
        <div className="card-gradient p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Streak</h2>
              <p className="text-gray-600 text-sm">Keep up consistent daily progress</p>
            </div>
            <span className="text-5xl">🔥</span>
          </div>

          {!userStats ? (
            <div className="bg-white/50 p-4 rounded-lg border border-purple-200">
              <p className="text-gray-600 mb-3">No streak yet — let's start!</p>
              <Link
                href="/check-in"
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Make Your First Check-In
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border-2 border-purple-300 backdrop-blur-sm">
                <p className="text-gray-600 text-sm mb-1">Current Streak</p>
                <p className="text-4xl font-bold text-gradient">{userStats.current_streak} days</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border-2 border-purple-300 backdrop-blur-sm">
                <p className="text-gray-600 text-sm mb-1">Longest Streak</p>
                <p className="text-4xl font-bold text-gradient">{userStats.longest_streak} days</p>
              </div>
            </div>
          )}
        </div>

        {/* ROADMAP PROGRESS OVERVIEW */}
        <div className="card-gradient p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Roadmap Progress</h2>
              <p className="text-gray-600 text-sm">Track your career development</p>
            </div>
            <span className="text-5xl">🗺️</span>
          </div>

          {!roadmapData ? (
            <div className="bg-white/50 p-4 rounded-lg border border-purple-200">
              <p className="text-gray-600 mb-3">No roadmap yet — create one to start tracking!</p>
              <Link
                href="/roadmap"
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Generate Your Roadmap
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-white/50 p-4 rounded-lg border-2 border-purple-300 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-600 font-semibold">{percent}% Complete</p>
                  <p className="text-sm text-gray-500">{completed}/{totalItems} items</p>
                </div>
                <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 shadow-lg"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50/80 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600">Skills</p>
                  <p className="text-2xl font-bold text-blue-600">{roadmapProgress?.filter(p => p.item_type === "skill" && p.completed).length}/{totalSkills}</p>
                </div>
                <div className="bg-purple-50/80 p-3 rounded-lg border border-purple-200">
                  <p className="text-xs text-gray-600">Projects</p>
                  <p className="text-2xl font-bold text-purple-600">{roadmapProgress?.filter(p => p.item_type === "project" && p.completed).length}/{totalProjects}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ACHIEVEMENTS */}
      {achievements && achievements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gradient mb-4">🏆 Achievements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="card p-6 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-200 hover:border-yellow-400"
              >
                <div className="text-4xl mb-3">🎖️</div>
                <p className="font-bold text-lg text-gray-800 mb-2">{ach.title}</p>
                <p className="text-sm text-gray-600">{ach.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROADMAP SUMMARY BOX */}
      <div className="card p-8 bg-gradient-to-br from-green-50 via-white to-blue-50 border-2 border-green-200 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-bold text-gradient">Your Roadmap</h2>
          <span className="text-3xl">🗺️</span>
        </div>
        {!roadmapData ? (
          <p className="text-gray-600 mb-4">You haven't generated a roadmap yet. Create one to get started!</p>
        ) : (
          <p className="text-gray-700 mb-4">
            Your roadmap includes skills, projects, certifications, and a timeline to follow.
          </p>
        )}
        <Link
          href="/roadmap"
          className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          View Full Roadmap →
        </Link>
      </div>

      {/* TODAY'S SECTIONS - Side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* TODAY'S TASKS */}
        <div className="card p-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-gradient">Today's Tasks</h2>
            <span className="text-3xl">✅</span>
          </div>

          {!dailyTasks || dailyTasks.length === 0 ? (
            <div className="bg-white/60 p-4 rounded-lg border border-blue-200">
              <p className="text-gray-600 mb-3">No tasks for today yet!</p>
              <p className="text-sm text-gray-500">Generate tasks using check-ins or roadmap</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {dailyTasks.map((task, idx) => (
                <li key={task.id} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-blue-100 hover:border-blue-300 transition-all hover:shadow-md">
                  <span className="text-xl mt-1">
                    {task.done ? "✓" : idx % 4 === 0 ? "💪" : idx % 4 === 1 ? "🎯" : idx % 4 === 2 ? "📚" : "💡"}
                  </span>
                  <span className={task.done ? "line-through text-gray-400" : "text-gray-800"}>
                    {task.task_text}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* TODAY'S AI SUGGESTIONS */}
        <div className="card p-8 bg-gradient-to-br from-pink-50 via-white to-purple-50 border-2 border-pink-200">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-gradient">AI Suggestions</h2>
            <span className="text-3xl">💡</span>
          </div>

          {!lastCheckIn ? (
            <div className="bg-white/60 p-4 rounded-lg border border-pink-200">
              <p className="text-gray-600 mb-3">No suggestions yet!</p>
              <Link
                href="/check-in"
                className="inline-block bg-gradient-to-r from-pink-600 to-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
              >
                Make a Check-In
              </Link>
            </div>
          ) : lastCheckIn.ai_suggestions ? (
            <ul className="space-y-3">
              {lastCheckIn.ai_suggestions.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-pink-100 hover:border-pink-300 transition-all hover:shadow-md">
                  <span className="text-xl mt-1">
                    {["🎯", "📖", "🏆", "🚀"][i % 4]}
                  </span>
                  <span className="text-gray-800">{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-white/60 p-4 rounded-lg border border-pink-200">
              <p className="text-gray-600">Check in to get AI-powered suggestions!</p>
            </div>
          )}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/check-in"
          className="card p-6 bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105 text-center"
        >
          📝 New Daily Check-In
        </Link>

        <Link
          href="/check-ins"
          className="card p-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105 text-center"
        >
          📊 View Check-In History
        </Link>

        <Link
          href="/roadmap"
          className="card p-6 bg-gradient-to-br from-green-600 to-emerald-600 text-white font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105 text-center"
        >
          🗺️ View Full Roadmap
        </Link>

        <Link
          href="/weekly-insights"
          className="card p-6 bg-gradient-to-br from-orange-600 to-red-600 text-white font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105 text-center"
        >
          📈 Weekly Insights
        </Link>
      </div>
    </div>
  );
}
