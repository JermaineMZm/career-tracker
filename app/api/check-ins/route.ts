import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mood, content, challenges, date } = body; // date optional YYYY-MM-DD

    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // determine day start and end
    const target = date ? new Date(date + "T00:00:00Z") : new Date();
    const start = new Date(target);
    start.setUTCHours(0,0,0,0);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    const startISO = start.toISOString();
    const endISO = end.toISOString();

    // Check existing check-in for that date
    const { data: existingRows, error: selError } = await supabase
      .from("check_ins")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startISO)
      .lt("created_at", endISO)
      .limit(1);

    if (selError) return NextResponse.json({ error: selError.message }, { status: 500 });

    if (existingRows && existingRows.length > 0) {
      const existing = existingRows[0];
      const { data: updated, error: updErr } = await supabase
        .from("check_ins")
        .update({ mood, content, challenges })
        .eq("id", existing.id)
        .select()
        .single();

      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
      return NextResponse.json({ checkIn: updated });
    }

    // Insert new check-in, setting created_at to the provided date (if given) or now
    const insertPayload: any = { user_id: user.id, mood, content, challenges };
    if (date) insertPayload.created_at = date; // created_at stored as date string YYYY-MM-DD or timestamp depending on schema

    const { data: inserted, error: insErr } = await supabase
      .from("check_ins")
      .insert(insertPayload)
      .select()
      .single();

    if (insErr) {
      // If unique index exists and insertion violates it, return friendly message
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ checkIn: inserted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
