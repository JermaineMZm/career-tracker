import { supabaseServer } from "@/lib/supabaseServer";

export default async function RoadmapPage() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-10">You must be logged in.</div>;
  }

  const { data } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) {
    return <div className="p-10">No roadmap yet. Generate one on your Profile page.</div>;
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Your AI Career Roadmap</h1>
      <pre className="bg-gray-100 p-6 rounded border whitespace-pre-wrap">
        {JSON.stringify(data.roadmap_json, null, 2)}
      </pre>
    </div>
  );
}
