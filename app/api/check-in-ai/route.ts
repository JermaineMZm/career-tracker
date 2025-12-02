import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  try {
    const { checkInId, mood, content, challenges } = await request.json();

    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const prompt = `
The user logged a daily check-in.

Mood: ${mood}
Work done: ${content}
Challenges: ${challenges}

Give me a JSON object with:
{
  "summary": "Short summary of their day",
  "suggestions": ["3-4 concrete tasks for tomorrow"],
  "moodInsight": "1-2 sentences about mood or emotional pattern"
}
`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Produce clean JSON only. No backticks." },
        { role: "user", content: prompt }
      ]
    });

    let text = aiResponse.choices[0].message.content || "";

    // Clean Markdown fences if present
    const cleaned = text
      ?.replace(/```json/gi, "")
      ?.replace(/```/g, "")
      ?.trim();

    const aiJson = JSON.parse(cleaned);

    // Save AI results into Supabase row
    const { error } = await supabase
      .from("check_ins")
      .update({
        ai_summary: aiJson.summary,
        ai_suggestions: aiJson.suggestions,
      })
      .eq("id", checkInId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      ai: aiJson,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
