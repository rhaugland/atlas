import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import { KnowledgeRadar } from "@/components/radar-chart";

export default async function AtlasPage() {
  const supabase = await createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user's concept familiarity grouped by domain
  const { data: userConcepts } = await supabase
    .from("user_concepts")
    .select("familiarity_score, concepts(domain)")
    .eq("user_id", user.id);

  // Aggregate by domain
  const domainMap: Record<string, { total: number; count: number }> = {};

  for (const uc of userConcepts || []) {
    const domain = (uc as any).concepts?.domain;
    if (!domain) continue;
    if (!domainMap[domain]) domainMap[domain] = { total: 0, count: 0 };
    domainMap[domain].total += uc.familiarity_score;
    domainMap[domain].count += 1;
  }

  const radarData = Object.entries(domainMap)
    .map(([domain, { total, count }]) => ({
      domain,
      score: Math.round((total / count) * 10) / 10,
      conceptCount: count,
    }))
    .sort((a, b) => b.conceptCount - a.conceptCount)
    .slice(0, 8);

  const totalConcepts = (userConcepts || []).length;
  const avgScore = totalConcepts > 0
    ? Math.round((userConcepts || []).reduce((sum, uc) => sum + uc.familiarity_score, 0) / totalConcepts * 10) / 10
    : 0;

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-100">Your Atlas</h1>
          <p className="text-slate-400 text-sm mt-1">
            A map of what you know. Dark zones are where you can grow.
          </p>
        </div>

        {radarData.length > 2 ? (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <KnowledgeRadar data={radarData} />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-sky-400">{totalConcepts}</p>
                <p className="text-xs text-slate-500 mt-1">Concepts Mapped</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-emerald-400">{radarData.length}</p>
                <p className="text-xs text-slate-500 mt-1">Domains</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-purple-400">{avgScore}</p>
                <p className="text-xs text-slate-500 mt-1">Avg Depth</p>
              </div>
            </div>

            <div className="space-y-2">
              {radarData.map((d) => (
                <div key={d.domain} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{d.domain}</p>
                    <p className="text-xs text-slate-500">{d.conceptCount} concepts</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-400 rounded-full"
                        style={{ width: `${(d.score / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right">{d.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-3xl mb-4">◎</p>
            <p className="text-slate-300 font-semibold">Your atlas is forming</p>
            <p className="text-slate-500 text-sm mt-2">
              Read and react to more articles to map your knowledge landscape.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
