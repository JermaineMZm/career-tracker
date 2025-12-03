"use client";

import { useEffect, useState } from "react";
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

    // Load roadmap
    const { data: roadmapRows } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!roadmapRows || roadmapRows.length === 0) return;

    setRoadmap(roadmapRows[0].roadmap_json);

    // Load progress
    const { data: progressRows } = await supabase
      .from("roadmap_progress")
      .select("*")
      .eq("user_id", user.id);

    setProgress(progressRows || []);
  }

  async function toggleItem(type: string, name: string) {
    if (!user) return;

    const existing = progress.find(
      (p) => p.item_type === type && p.item_name === name
    );

    if (existing) {
      // Update
      await supabase
        .from("roadmap_progress")
        .update({ completed: !existing.completed })
        .eq("id", existing.id);
    } else {
      // Insert new
      await supabase.from("roadmap_progress").insert({
        user_id: user.id,
        item_type: type,
        item_name: name,
        completed: true,
      });
    }

    loadData();
  }

  function isCompleted(type: string, name: string) {
    return progress.some(
      (p) => p.item_type === type && p.item_name === name && p.completed
    );
  }

  if (!user) return <div className="p-10">You must be logged in.</div>;
  if (!roadmap) return <div className="p-10">No roadmap yet.</div>;

  const { skillsToLearn, projectsToBuild, certifications, timeline } = roadmap;

  return (
    <div className="min-h-screen bg-gray-100 p-10 text-black space-y-10">
      <h1 className="text-4xl font-bold mb-6">Your Roadmap Progress</h1>

      {/* SKILLS */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Skills to Learn</h2>
        <div className="space-y-3">
          {skillsToLearn.map((skill: string) => (
            <label key={skill} className="flex items-center gap-3 bg-white p-4 rounded shadow border">
              <input
                type="checkbox"
                checked={isCompleted("skill", skill)}
                onChange={() => toggleItem("skill", skill)}
              />
              <span className={isCompleted("skill", skill) ? "line-through text-gray-500" : ""}>
                {skill}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Projects to Build</h2>
        <div className="space-y-3">
          {projectsToBuild.map((proj: string) => (
            <label key={proj} className="flex items-center gap-3 bg-white p-4 rounded shadow border">
              <input
                type="checkbox"
                checked={isCompleted("project", proj)}
                onChange={() => toggleItem("project", proj)}
              />
              <span className={isCompleted("project", proj) ? "line-through text-gray-500" : ""}>
                {proj}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recommended Certifications</h2>
        <div className="space-y-3">
          {certifications.map((cert: string) => (
            <label key={cert} className="flex items-center gap-3 bg-white p-4 rounded shadow border">
              <input
                type="checkbox"
                checked={isCompleted("certification", cert)}
                onChange={() => toggleItem("certification", cert)}
              />
              <span className={isCompleted("certification", cert) ? "line-through text-gray-500" : ""}>
                {cert}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* TIMELINE */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Timeline</h2>
        {Object.entries(timeline).map(([month, items]: any) => (
          <div key={month} className="bg-white p-6 rounded shadow border mb-4">
            <h3 className="text-xl font-bold mb-2">{month}</h3>
            <ul className="space-y-2">
              {items.map((step: string) => (
                <li key={step} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isCompleted("timeline", step)}
                    onChange={() => toggleItem("timeline", step)}
                  />
                  <span
                    className={isCompleted("timeline", step) ? "line-through text-gray-500" : ""}
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
