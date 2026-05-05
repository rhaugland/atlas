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
          <h1 className="text-2xl font-black text-[#1A1A1A]">Your Map</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            A map of what you know. Dark zones are where you can grow.
          </p>
        </div>

        {radarData.length >= 3 ? (
          <>
            <div className="bg-white border border-[#E8E4DD] rounded-2xl p-6 mb-6">
              <KnowledgeRadar data={radarData} />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-[#E8E4DD] rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-[#D4756A]">{totalConcepts}</p>
                <p className="text-xs text-[#6B7280] mt-1">Concepts Mapped</p>
              </div>
              <div className="bg-white border border-[#E8E4DD] rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-[#7CB5A0]">{radarData.length}</p>
                <p className="text-xs text-[#6B7280] mt-1">Domains</p>
              </div>
              <div className="bg-white border border-[#E8E4DD] rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-[#DFB44E]">{avgScore}</p>
                <p className="text-xs text-[#6B7280] mt-1">Avg Depth</p>
              </div>
            </div>

            <div className="space-y-2">
              {radarData.map((d) => (
                <div key={d.domain} className="flex items-center justify-between p-3 bg-white border border-[#E8E4DD] rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{d.domain}</p>
                    <p className="text-xs text-[#6B7280]">{d.conceptCount} concepts</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-[#E8E4DD] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#7CB5A0] rounded-full"
                        style={{ width: `${(d.score / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#6B7280] w-8 text-right">{d.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-3xl mb-4 text-[#7CB5A0]">◎</p>
            <p className="text-[#1A1A1A] font-semibold">Your map is forming</p>
            <p className="text-[#6B7280] text-sm mt-2">
              React to concepts across 3+ domains to reveal your knowledge map.
            </p>
            <div className="mt-8 max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-[#6B7280] mb-2">
                <span>Domains discovered</span>
                <span>{radarData.length} / 3</span>
              </div>
              <div className="w-full h-3 bg-[#E8E4DD] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7CB5A0] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((radarData.length / 3) * 100, 100)}%` }}
                />
              </div>
              {totalConcepts > 0 && (
                <p className="text-xs text-[#6B7280] mt-2">
                  {totalConcepts} concepts mapped across {radarData.length} domain{radarData.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
