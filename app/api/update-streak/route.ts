import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST() {
  const supabase = await supabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Fetch existing stats
  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const today = new Date().toISOString().slice(0, 10);

  if (!stats) {
    // First time ever
    await supabase.from("user_stats").insert({
      user_id: user.id,
      current_streak: 1,
      longest_streak: 1,
      last_check_in: today
    });

    return NextResponse.json({ success: true });
  }

  const last = stats.last_check_in;
  const yesterday = new Date(Date.now() - 24*60*60*1000)
    .toISOString()
    .slice(0, 10);

  let newCurrent = stats.current_streak;
  let newLongest = stats.longest_streak;

  if (last === today) {
    // Already checked in today → do nothing
    return NextResponse.json({ success: true });
  }

  if (last === yesterday) {
    // Streak continues
    newCurrent = stats.current_streak + 1;
  } else {
    // Streak broken
    newCurrent = 1;
  }

  if (newCurrent > newLongest) {
    newLongest = newCurrent;
  }

  await supabase
    .from("user_stats")
    .update({
      current_streak: newCurrent,
      longest_streak: newLongest,
      last_check_in: today,
    })
    .eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
