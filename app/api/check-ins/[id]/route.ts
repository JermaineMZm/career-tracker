import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function PATCH(request: Request, { params }: any) {
  try {
    const id = params?.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body = await request.json();
    const { mood, content, challenges } = body;

    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // confirm row belongs to user
    const { data: rows } = await supabase.from("check_ins").select("id, user_id").eq("id", id).limit(1);
    const row = rows?.[0];
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (row.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: updated, error } = await supabase
      .from("check_ins")
      .update({ mood, content, challenges })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ checkIn: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
