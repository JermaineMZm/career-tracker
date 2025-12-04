import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mood, content, challenges } = body;

    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // compute start and end of today in ISO
    const start = new Date();
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const startISO = start.toISOString();
    const endISO = end.toISOString();

    // look for existing check-in today
    const { data: existingRows, error: selError } = await supabase
      .from("check_ins")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startISO)
      .lt("created_at", endISO)
      .limit(1);

    if (selError) {
      return NextResponse.json({ error: selError.message }, { status: 500 });
    }

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

    // otherwise insert new check-in
    const { data: inserted, error: insErr } = await supabase
      .from("check_ins")
      .insert({ user_id: user.id, mood, content, challenges })
      .select()
      .single();

    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    return NextResponse.json({ checkIn: inserted });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
