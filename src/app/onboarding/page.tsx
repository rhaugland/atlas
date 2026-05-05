"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { TOPICS, type Topic } from "@/types";

export default function OnboardingPage() {
  const [selected, setSelected] = useState<Topic[]>([]);
  const [volume, setVolume] = useState<"light" | "moderate" | "heavy">("moderate");
  const [step, setStep] = useState(1);
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black">
            {step === 1 ? "What are you interested in?" : "How much do you read?"}
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {step === 1
              ? "Pick 3-5 topics. We'll curate your feed around these."
              : "This helps us calibrate how many articles to surface daily."}
          </p>
        </div>

        {step === 1 ? (
          <>
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
              onClick={() => setStep(2)}
              disabled={selected.length < 3}
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl transition-colors"
            >
              Continue ({selected.length}/3 minimum)
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
