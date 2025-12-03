import { supabaseServer } from "@/lib/supabaseServer";

export default async function RoadmapPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="min-h-screen bg-gray-100 p-10 text-black">
      You must be logged in.
    </div>;
  }

  const { data } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (!data || data.length === 0) {
    return <div className="min-h-screen bg-gray-100 p-10 text-black">
      No roadmap yet. Generate one on your Profile page.
    </div>;
  }

  const roadmap = data[0].roadmap_json;
  const { skillsToLearn, projectsToBuild, certifications, timeline } = roadmap;

  return (
    <div className="min-h-screen bg-gray-100 p-10 text-black space-y-10">
      <h1 className="text-4xl font-bold mb-6">Your AI Career Roadmap</h1>

      {/* SKILLS SECTION */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Skills to Learn</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillsToLearn.map((skill: string, i: number) => (
            <div key={i} className="p-4 rounded shadow bg-white border">
              <p className="font-medium">{skill}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS SECTION */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Projects to Build</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectsToBuild.map((proj: string, i: number) => (
            <div key={i} className="p-4 rounded shadow bg-white border">
              <p className="font-medium">{proj}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CERTIFICATIONS SECTION */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recommended Certifications</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certifications.map((cert: string, i: number) => (
            <div key={i} className="p-4 rounded shadow bg-white border">
              <p className="font-medium">{cert}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TIMELINE SECTION */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Timeline</h2>

        <div className="space-y-6">
          {Object.entries(timeline).map(([month, items]: any, i) => (
            <div key={i} className="bg-white border rounded p-6 shadow">
              <h3 className="text-xl font-bold mb-3 capitalize">
                {month.replace(/([a-z])([A-Z])/g, '$1 $2')}
              </h3>

              <ul className="list-disc ml-6">
                {items.map((it: string, j: number) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
