"use client";

import { useState, useEffect, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function RoadmapPage() {
  const supabase = supabaseBrowser();
  const [user, setUser] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (!user) return;

    const { data: roadmapRows } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!roadmapRows?.length) return;
    setRoadmap(roadmapRows[0].roadmap_json);

    const { data: progressRows } = await supabase
      .from("roadmap_progress")
      .select("*")
      .eq("user_id", user.id);

    setProgress(progressRows || []);
  }

  async function toggleItem(type: string, name: string) {
    const existing = progress.find((p) => p.item_type === type && p.item_name === name);

    if (existing) {
      await supabase
        .from("roadmap_progress")
        .update({ completed: !existing.completed })
        .eq("id", existing.id);
    } else {
      await supabase.from("roadmap_progress").insert({
        user_id: user.id,
        item_type: type,
        item_name: name,
        completed: true,
      });
    }

    loadData();
  }

  const isDone = (type: string, name: string) =>
    progress.some((p) => p.item_type === type && p.item_name === name && p.completed);

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600 text-lg">You must be logged in.</p>
      </div>
    </div>
  );

  if (!roadmap) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-5xl mb-3">🗺️</div>
        <p className="text-gray-600 text-lg">No roadmap yet.</p>
        <p className="text-gray-500 text-sm">Create one from your dashboard to get started!</p>
      </div>
    </div>
  );

  const sectionColors = [
    { bg: "from-blue-50 via-white to-blue-50", border: "border-blue-200", emoji: "📚", title: "Skills to Learn" },
    { bg: "from-purple-50 via-white to-purple-50", border: "border-purple-200", emoji: "🛠️", title: "Projects to Build" },
    { bg: "from-green-50 via-white to-green-50", border: "border-green-200", emoji: "🏆", title: "Certifications" },
    { bg: "from-orange-50 via-white to-orange-50", border: "border-orange-200", emoji: "⏱️", title: "Timeline" },
  ];

  return (
    <div className="min-h-screen py-8 space-y-10">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-2 text-gradient">🗺️ Your Career Roadmap</h1>
        <p className="text-lg text-gray-600">Check off items as you complete them to track your progress</p>
      </div>

      {/* Skills Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-3xl font-bold text-gradient">📚 Skills to Learn</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roadmap.skillsToLearn.map((skill: string) => (
            <label
              key={skill}
              className="card p-5 bg-gradient-to-br from-blue-50 via-white to-purple-50 border-2 border-blue-200 hover:border-blue-400 cursor-pointer flex gap-4 items-start group"
            >
              <input
                type="checkbox"
                checked={isDone("skill", skill)}
                onChange={() => toggleItem("skill", skill)}
                className="w-5 h-5 mt-1 cursor-pointer"
              />
              <span className={`flex-1 font-medium transition-all ${isDone("skill", skill) ? "line-through text-gray-400" : "text-gray-800 group-hover:text-blue-700"}`}>
                {skill}
              </span>
              {isDone("skill", skill) && <span className="text-2xl">✓</span>}
            </label>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-3xl font-bold text-gradient">🛠️ Projects to Build</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roadmap.projectsToBuild.map((proj: string) => (
            <label
              key={proj}
              className="card p-5 bg-gradient-to-br from-purple-50 via-white to-pink-50 border-2 border-purple-200 hover:border-purple-400 cursor-pointer flex gap-4 items-start group"
            >
              <input
                type="checkbox"
                checked={isDone("project", proj)}
                onChange={() => toggleItem("project", proj)}
                className="w-5 h-5 mt-1 cursor-pointer"
              />
              <span className={`flex-1 font-medium transition-all ${isDone("project", proj) ? "line-through text-gray-400" : "text-gray-800 group-hover:text-purple-700"}`}>
                {proj}
              </span>
              {isDone("project", proj) && <span className="text-2xl">✓</span>}
            </label>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-3xl font-bold text-gradient">🏆 Certifications</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roadmap.certifications.map((cert: string) => (
            <label
              key={cert}
              className="card p-5 bg-gradient-to-br from-yellow-50 via-white to-orange-50 border-2 border-yellow-200 hover:border-yellow-400 cursor-pointer flex gap-4 items-start group"
            >
              <input
                type="checkbox"
                checked={isDone("certification", cert)}
                onChange={() => toggleItem("certification", cert)}
                className="w-5 h-5 mt-1 cursor-pointer"
              />
              <span className={`flex-1 font-medium transition-all ${isDone("certification", cert) ? "line-through text-gray-400" : "text-gray-800 group-hover:text-yellow-700"}`}>
                {cert}
              </span>
              {isDone("certification", cert) && <span className="text-2xl">✓</span>}
            </label>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-3xl font-bold text-gradient">⏱️ Timeline</h2>
        </div>
        <div className="space-y-6">
          {Object.entries(roadmap.timeline).map(([month, items]: any, idx: number) => (
            <CalendarMonth
              key={month}
              monthLabel={month}
              items={items}
              color={sectionColors[idx % 4]}
              supabase={supabase}
              user={user}
              isDone={isDone}
              toggleItem={toggleItem}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function CalendarMonth({
  monthLabel,
  items,
  color,
  supabase,
  user,
  isDone,
  toggleItem,
}: any) {
  const [checkInsMap, setCheckInsMap] = useState<Record<string, any>>({});
  const [tasksMap, setTasksMap] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!user) return;
    loadMonthData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, monthLabel]);

  async function loadMonthData() {
    // Try to parse monthLabel like "January 2026" or "January"
    const parsed = new Date(`${monthLabel} 1`);
    const year = parsed.getFullYear();
    const month = parsed.getMonth();

    // If parsing failed (Invalid Date), fallback to current month
    const safeYear = isNaN(year) ? new Date().getFullYear() : year;
    const safeMonth = isNaN(month) ? new Date().getMonth() : month;

    const start = new Date(safeYear, safeMonth, 1);
    const end = new Date(safeYear, safeMonth + 1, 1);

    const startISO = start.toISOString();
    const endISO = end.toISOString();

    // fetch check-ins in range
    const { data: checkIns } = await supabase
      .from("check_ins")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startISO)
      .lt("created_at", endISO);

    const checkMap: Record<string, any> = {};
    (checkIns || []).forEach((c: any) => {
      const d = new Date(c.created_at).toISOString().slice(0, 10);
      checkMap[d] = c;
    });

    // fetch daily tasks in range (daily_tasks.created_at appears to be YYYY-MM-DD)
    const startDate = start.toISOString().slice(0, 10);
    const endDate = new Date(end.getTime() - 1).toISOString().slice(0, 10);

    const { data: dailyTasks } = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    const tasksMapLocal: Record<string, any[]> = {};
    (dailyTasks || []).forEach((t: any) => {
      const d = t.created_at;
      tasksMapLocal[d] = tasksMapLocal[d] || [];
      tasksMapLocal[d].push(t);
    });

    setCheckInsMap(checkMap);
    setTasksMap(tasksMapLocal);
  }

  // build suggestions by distributing timeline items across days if no tasks exist
  const suggestionsByDay = useMemo(() => {
    const parsed = new Date(`${monthLabel} 1`);
    const safeYear = isNaN(parsed.getFullYear()) ? new Date().getFullYear() : parsed.getFullYear();
    const safeMonth = isNaN(parsed.getMonth()) ? new Date().getMonth() : parsed.getMonth();
    const daysInMonth = new Date(safeYear, safeMonth + 1, 0).getDate();
    const map: Record<string, string[]> = {};
    if (!items || items.length === 0) return map;
    items.forEach((it: string, i: number) => {
      const day = Math.min(daysInMonth, Math.max(1, Math.floor((i / items.length) * daysInMonth) + 1));
      const dateKey = new Date(safeYear, safeMonth, day).toISOString().slice(0, 10);
      map[dateKey] = map[dateKey] || [];
      map[dateKey].push(it);
    });
    return map;
  }, [monthLabel, items]);

  // render calendar grid
  const parsed = new Date(`${monthLabel} 1`);
  const safeYear = isNaN(parsed.getFullYear()) ? new Date().getFullYear() : parsed.getFullYear();
  const safeMonth = isNaN(parsed.getMonth()) ? new Date().getMonth() : parsed.getMonth();
  const firstDay = new Date(safeYear, safeMonth, 1).getDay();
  const daysInMonth = new Date(safeYear, safeMonth + 1, 0).getDate();

  const cells: Array<null | number> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className={`card p-6 bg-gradient-to-br ${color.bg} border-2 ${color.border}`}>
      <h3 className="text-2xl font-bold text-gradient mb-4 flex items-center gap-2">
        <span>📅</span> {monthLabel}
      </h3>

      <div className="mb-4 text-sm text-gray-600">Click a day to view tasks or check-in details.</div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
          <div key={d} className="text-xs font-semibold text-center text-gray-600">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mt-2">
        {cells.map((c, idx) => {
          if (c === null) return <div key={`empty-${idx}`} className="h-20 bg-white/30 rounded-lg" />;
          const dateKey = new Date(safeYear, safeMonth, c).toISOString().slice(0,10);
          const hasCheck = !!checkInsMap[dateKey];
          const tasks = tasksMap[dateKey] || [];
          const suggestions = suggestionsByDay[dateKey] || [];

          return (
            <div key={dateKey} className="relative group h-20 p-2 bg-white/40 rounded-lg border border-white/20 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between">
                <div className="text-sm font-medium text-gray-800">{c}</div>
                {hasCheck && <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1" />}
              </div>

              <div className="mt-2 text-xs text-gray-600 line-clamp-2">
                {tasks.length > 0 ? (
                  <span>{tasks.length} task{tasks.length>1?'s':''}</span>
                ) : suggestions.length > 0 ? (
                  <span>{suggestions[0]}</span>
                ) : (
                  <span className="text-gray-400">No tasks</span>
                )}
              </div>

              {/* Hover popover */}
              <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-white rounded-lg shadow-lg border">
                <div className="text-sm font-semibold mb-1">{monthLabel} {c}</div>
                <div className="text-xs text-gray-700 space-y-2">
                  {hasCheck ? (
                    <div className="p-2 bg-emerald-50 rounded">
                      <div className="font-medium">Check-in</div>
                      <div className="text-xs text-gray-600">Mood: {checkInsMap[dateKey].mood || '—'}</div>
                      {checkInsMap[dateKey].ai_suggestions && (
                        <div className="mt-1 text-xs text-gray-700">Suggestion: {checkInsMap[dateKey].ai_suggestions[0]}</div>
                      )}
                    </div>
                  ) : (
                    <div className="p-2 bg-yellow-50 rounded">
                      <div className="font-medium">Suggested</div>
                      { (tasks.length>0) ? (
                        tasks.map((t: any) => (
                          <div key={t.id} className="text-xs text-gray-700">• {t.task_text}</div>
                        ))
                      ) : suggestions.length>0 ? (
                        suggestions.map((s: string, i: number) => (
                          <div key={i} className="text-xs text-gray-700">• {s}</div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-500">No suggestion for this day</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
