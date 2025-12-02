import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch last 7 days of check-ins
    const { data, error } = await supabase
      .from("check_ins")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ message: "No check-ins this week." });
    }

    // AI prompt
    const summaryPrompt = `
Here are a user's check-ins for the past 7 days:

${JSON.stringify(data, null, 2)}

Create a JSON object with the following:

{
  "weeklySummary": "A helpful summary of their week",
  "moodAnalysis": "Explain mood patterns",
  "progressAchievements": ["List of things they improved"],
  "recurringChallenges": ["List of repeated problems"],
  "nextWeekRecommendations": ["3–5 clear action items"]
}

Output *only* JSON.
`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Return only clean JSON, no backticks." },
        { role: "user", content: summaryPrompt }
      ]
    });

    let text = aiResponse.choices[0].message.content || "";

    // Clean JSON fences
    const cleaned = text
      .replace(/```json/i, "")
      .replace(/```/, "")
      .trim();

    const insights = JSON.parse(cleaned);

    return NextResponse.json({ insights });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
