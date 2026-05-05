"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { TOPICS, type Topic } from "@/types";

// ── Mock Preview Components ──

function MockFeedPreview() {
  const mockArticles = [
    { source: "Lenny's Newsletter", domain: "Product", title: "Why the best PMs think like designers", time: "6 min", concepts: 8 },
    { source: "Hacker News", domain: "AI", title: "Agent architectures are eating software", time: "4 min", concepts: 12 },
    { source: "HBR", domain: "Business Strategy", title: "The hidden cost of moving fast", time: "9 min", concepts: 6 },
  ];

  return (
    <div className="space-y-3 pointer-events-none">
      {mockArticles.map((a, i) => (
        <div key={i} className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <p className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider mb-1">
            {a.source} <span className="text-slate-600 ml-1">{a.domain}</span>
          </p>
          <p className="text-sm font-bold text-slate-200 leading-snug">{a.title}</p>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
            <span>{a.time} read</span>
            <span>{a.concepts} concepts</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MockExplorePreview() {
  const directions = [
    {
      title: "Expand: AI",
      desc: "You understand prompt engineering and few-shot learning deeply. Explore agent architectures, tool use — the next frontier of what you already know.",
      concepts: ["agent architectures", "tool use", "chain of thought"],
    },
    {
      title: "Expand: Product",
      desc: "You know user research and roadmap prioritization well. Discover jobs-to-be-done, outcome-driven innovation — frameworks that will sharpen your product instincts.",
      concepts: ["jobs-to-be-done", "outcome metrics"],
    },
  ];

  return (
    <div className="space-y-3 pointer-events-none">
      {directions.map((d, i) => (
        <div key={i} className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <p className="text-sm font-bold text-slate-200">{d.title}</p>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{d.desc}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {d.concepts.map((c) => (
              <span key={c} className="px-1.5 py-0.5 text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/20 rounded">
                {c}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MockAtlasPreview() {
  const domains = [
    { name: "AI", score: 3.2, pct: 80 },
    { name: "Product", score: 2.5, pct: 63 },
    { name: "Business Strategy", score: 1.8, pct: 45 },
    { name: "Engineering", score: 1.2, pct: 30 },
    { name: "Finance", score: 0.4, pct: 10 },
  ];

  return (
    <div className="pointer-events-none">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
          <p className="text-lg font-black text-sky-400">47</p>
          <p className="text-[10px] text-slate-500">Concepts</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
          <p className="text-lg font-black text-emerald-400">5</p>
          <p className="text-[10px] text-slate-500">Domains</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
          <p className="text-lg font-black text-purple-400">2.1</p>
          <p className="text-[10px] text-slate-500">Avg Depth</p>
        </div>
      </div>
      <div className="space-y-2">
        {domains.map((d) => (
          <div key={d.name} className="flex items-center justify-between p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div>
              <p className="text-xs font-semibold text-slate-200">{d.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 w-6 text-right">{d.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Intro Steps ──

const INTRO_STEPS = [
  {
    icon: "◉",
    title: "Read smarter, not more",
    subtitle: "Your Feed",
    description: "Curated articles from top sources, ranked by what matters to you. Every article is analyzed for key concepts — ideas, not keywords.",
    preview: MockFeedPreview,
  },
  {
    icon: "✦",
    title: "Grow in the right direction",
    subtitle: "Explore",
    description: "ATLAS maps what you know and finds the gaps worth filling. It builds personalized growth paths connecting your strengths to your blind spots.",
    preview: MockExplorePreview,
  },
  {
    icon: "◎",
    title: "See your knowledge take shape",
    subtitle: "Your Atlas",
    description: "A living map of your expertise. Watch your depth grow across domains as you read. The dark zones show where to explore next.",
    preview: MockAtlasPreview,
  },
];

// ── Main Component ──

export default function OnboardingPage() {
  const [selected, setSelected] = useState<Topic[]>([]);
  const [volume, setVolume] = useState<"light" | "moderate" | "heavy">("moderate");
  const [step, setStep] = useState(0); // 0-2: intro, 3: topics, 4: volume
  const router = useRouter();

  const toggle = (topic: Topic) => {
    setSelected((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleFinish = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email!,
      interests: selected,
      reading_volume: volume,
      onboarded: true,
    });

    router.push("/feed");
  };

  const totalSteps = 5;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Step indicator */}
        <div className="flex items-center gap-1.5 justify-center mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-sky-400" : i < step ? "w-4 bg-sky-400/40" : "w-4 bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Intro steps (0-2) */}
        {step < 3 && (() => {
          const intro = INTRO_STEPS[step];
          const Preview = intro.preview;
          return (
            <>
              <div className="text-center mb-6">
                <span className="text-3xl">{intro.icon}</span>
                <p className="text-xs font-semibold text-sky-400 uppercase tracking-widest mt-3">
                  {intro.subtitle}
                </p>
                <h1 className="text-2xl font-black text-slate-100 mt-2">{intro.title}</h1>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed max-w-sm mx-auto">
                  {intro.description}
                </p>
              </div>

              <div className="mb-8 opacity-90">
                <Preview />
              </div>

              <button
                onClick={() => setStep(step + 1)}
                className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition-colors"
              >
                {step < 2 ? "Next" : "Let\u2019s set up your feed"}
              </button>

              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="w-full py-2 mt-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
                >
                  Back
                </button>
              )}
            </>
          );
        })()}

        {/* Topic selection (step 3) */}
        {step === 3 && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-slate-100">What are you interested in?</h1>
              <p className="text-slate-400 mt-2 text-sm">
                Pick 3-5 topics. We&apos;ll curate your feed around these.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => toggle(topic)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    selected.includes(topic)
                      ? "bg-sky-500/20 border-2 border-sky-400 text-sky-300"
                      : "bg-slate-900 border-2 border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(4)}
              disabled={selected.length < 3}
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl transition-colors"
            >
              Continue ({selected.length}/3 minimum)
            </button>
            <button
              onClick={() => setStep(2)}
              className="w-full py-2 mt-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              Back
            </button>
          </>
        )}

        {/* Reading volume (step 4) */}
        {step === 4 && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-slate-100">How much do you read?</h1>
              <p className="text-slate-400 mt-2 text-sm">
                This helps us calibrate how many articles to surface daily.
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {([
                { value: "light", label: "Light", desc: "3-5 articles/day" },
                { value: "moderate", label: "Moderate", desc: "5-10 articles/day" },
                { value: "heavy", label: "Heavy", desc: "10-20 articles/day" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setVolume(opt.value)}
                  className={`w-full px-5 py-4 rounded-xl text-left transition-all ${
                    volume === opt.value
                      ? "bg-sky-500/20 border-2 border-sky-400"
                      : "bg-slate-900 border-2 border-slate-700 hover:border-slate-500"
                  }`}
                >
                  <p className="font-semibold text-slate-100">{opt.label}</p>
                  <p className="text-slate-400 text-sm">{opt.desc}</p>
                </button>
              ))}
            </div>
            <button
              onClick={handleFinish}
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition-colors"
            >
              Start Reading
            </button>
            <button
              onClick={() => setStep(3)}
              className="w-full py-2 mt-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
