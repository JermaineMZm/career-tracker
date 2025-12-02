import { supabaseServer } from "@/lib/supabaseServer";

export default async function RoadmapPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 p-10 text-black">
        You must be logged in.
      </div>
    );
  }

  // Fetch latest roadmap
  const { data, error } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-10 text-black">
        Error loading roadmap: {error.message}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-10 text-black">
        No roadmap yet. Generate one on your Profile page.
      </div>
    );
  }

  const roadmap = data[0]; // ← IMPORTANT

  return (
    <div className="min-h-screen bg-gray-100 p-10 text-black">
      <h1 className="text-3xl font-bold mb-6">Your AI Career Roadmap</h1>

      <pre className="bg-white text-black p-6 rounded shadow border whitespace-pre-wrap">
        {JSON.stringify(roadmap.roadmap_json, null, 2)}
      </pre>
    </div>
  );
}
