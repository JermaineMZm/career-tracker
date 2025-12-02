import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST() {
  const supabase = await supabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  /** 1. LOAD EXISTING ACHIEVEMENTS */
  const { data: existing } = await supabase
    .from("achievements")
    .select("achievement_key")
    .eq("user_id", user.id);

  const unlocked = new Set(existing?.map(a => a.achievement_key) || []);

  const toAward: any[] = [];

  /** 2. CHECK NUMBER OF CHECK-INS */
  const { data: checkins } = await supabase
    .from("check_ins")
    .select("id")
    .eq("user_id", user.id);

  const totalCheckins = checkins?.length || 0;

  if (totalCheckins >= 1 && !unlocked.has("first-checkin")) {
    toAward.push({
      key: "first-checkin",
      title: "First Check-In!",
      description: "You completed your first daily check-in 🎉"
    });
  }

  if (totalCheckins >= 3 && !unlocked.has("three-checkins")) {
    toAward.push({
      key: "three-checkins",
      title: "3 Check-Ins",
      description: "You've checked in three times!"
    });
  }

  if (totalCheckins >= 7 && !unlocked.has("seven-checkins")) {
    toAward.push({
      key: "seven-checkins",
      title: "One Week of Check-Ins",
      description: "A full week! Great consistency 🔥"
    });
  }

  /** 3. CHECK STREAK ACHIEVEMENTS */
  const { data: stats } = await supabase
    .from("user_stats")
    .select("current_streak")
    .eq("user_id", user.id)
    .single();

  const streak = stats?.current_streak || 0;

  if (streak >= 2 && !unlocked.has("first-streak")) {
    toAward.push({
      key: "first-streak",
      title: "You're on a streak!",
      description: "You've kept a streak going 🔥"
    });
  }

  if (streak >= 7 && !unlocked.has("seven-streak")) {
    toAward.push({
      key: "seven-streak",
      title: "7-Day Streak",
      description: "A whole week without breaking the chain 💪"
    });
  }

  if (streak >= 30 && !unlocked.has("thirty-streak")) {
    toAward.push({
      key: "thirty-streak",
      title: "30-Day Streak",
      description: "Thirty days of consistency — huge respect 🏆"
    });
  }

  /** 4. CHECK IF USER HAS A ROADMAP */
  const { data: roadmaps } = await supabase
    .from("roadmaps")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (roadmaps?.length && !unlocked.has("roadmap-created")) {
    toAward.push({
      key: "roadmap-created",
      title: "Roadmap Created",
      description: "You've created your career roadmap 🚀"
    });
  }

  /** 5. INSERT NEW ACHIEVEMENTS */
  for (const a of toAward) {
    await supabase.from("achievements").insert({
      user_id: user.id,
      achievement_key: a.key,
      title: a.title,
      description: a.description
    });
  }

  return NextResponse.json({ awarded: toAward });
}
