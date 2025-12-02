import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  console.log("➡️ /api/generate-roadmap CALLED");

  try {
    const { currentRole, targetRole } = await request.json();
    console.log("Received roles:", currentRole, targetRole);

    if (!currentRole || !targetRole) {
      console.log("❌ Missing fields");
      return NextResponse.json(
        { error: "Missing currentRole or targetRole" },
        { status: 400 }
      );
    }

    // Get Supabase client + user
    const supabase = await supabaseServer();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.log("❌ Auth error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const user = authData.user;
    console.log("User session:", user?.id);

    if (!user) {
      console.log("❌ No user found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Call OpenAI
    console.log("🤖 Calling OpenAI...");

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini", // correct model
      messages: [
        {
          role: "system",
          content: "You generate structured career roadmaps in clean JSON."
        },
        {
          role: "user",
          content: `Create a career roadmap for someone currently working as "${currentRole}" who wants to become "${targetRole}". 
          The output MUST be valid JSON with these fields:
          {
            "skillsToLearn": [...],
            "projectsToBuild": [...],
            "certifications": [...],
            "timeline": {
              "month1": [...],
              "month2": [...],
              "month3": [...]
            }
          }`
        }
      ],
    });

    const text = aiResponse.choices[0].message.content;
    console.log("AI Response:", text);

    // Clean AI response
    let roadmapJson;
    try {
    const cleaned = text
        ?.replace(/```json/gi, "")
        ?.replace(/```/g, "")
        ?.trim();

    console.log("Cleaned JSON:", cleaned);

    roadmapJson = JSON.parse(cleaned!);
    console.log("✅ JSON parsed successfully");
    } catch (err) {
    console.log("❌ Failed to parse AI JSON");
    return NextResponse.json(
        { error: "AI returned invalid JSON", raw: text },
        { status: 500 }
    );
    }

    // Save to Supabase
    console.log("📦 Inserting into Supabase...");

    const { error: insertError } = await supabase
      .from("roadmaps")
      .insert({
        user_id: user.id,
        roadmap_json: roadmapJson,
      });

    if (insertError) {
      console.log("❌ Insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    console.log("✅ Roadmap saved successfully!");

    return NextResponse.json({
      success: true,
      roadmap: roadmapJson,
    });
  } catch (err: any) {
    console.log("❌ SERVER ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
