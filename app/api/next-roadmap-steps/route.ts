import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await supabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get roadmap
  const { data: roadmaps } = await supabase
    .from("roadmaps")
    .select("roadmap_json")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (!roadmaps || roadmaps.length === 0) {
    return NextResponse.json({ steps: [] });
  }

  const roadmap = roadmaps[0].roadmap_json;

  // Return the raw roadmap sections directly
  const skills = roadmap.skillsToLearn || [];
  const projects = roadmap.projectsToBuild || [];
  const certs = roadmap.certifications || [];
  const timeline = roadmap.timeline || {};

  return NextResponse.json({
    skills,
    projects,
    certifications: certs,
    timeline
  });
}
