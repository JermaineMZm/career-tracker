import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  const { currentRole, targetRole } = await request.json();

  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  // AI prompt
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // good, cheap, powerful
    messages: [
      {
        role: "system",
        content: "You generate structured career roadmaps in clean JSON."
      },
      {
        role: "user",
        content: `Create a career roadmap for someone currently working as "${currentRole}" who wants to become "${targetRole}". 
           
           The output MUST be JSON:
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

  let roadmapJson;

  try {
    roadmapJson = JSON.parse(response.choices[0].message.content!);
  } catch (err) {
    return NextResponse.json({ error: "Failed to parse JSON" }, { status: 500 });
  }

  // Store in Supabase
  await supabase.from("roadmaps").insert({
    user_id: user.id,
    roadmap_json: roadmapJson,
  });

  return NextResponse.json({ success: true, roadmap: roadmapJson });
}
