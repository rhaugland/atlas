"use client";

import { useState } from "react";
import type { Reaction } from "@/types";

const REACTIONS: { value: Reaction; label: string; emoji: string }[] = [
  { value: "knew_this", label: "Knew this", emoji: "✓" },
  { value: "new_to_me", label: "New to me", emoji: "✧" },
  { value: "mind_blown", label: "Mind blown", emoji: "✴" },
];

interface ConceptChipProps {
  conceptId: string;
  conceptName: string;
  articleId: string;
  existingReaction?: Reaction | null;
}

export function ConceptChip({ conceptId, conceptName, articleId, existingReaction }: ConceptChipProps) {
  const [reaction, setReaction] = useState<Reaction | null>(existingReaction || null);
  const [showMenu, setShowMenu] = useState(false);

  const handleReact = async (r: Reaction) => {
    setReaction(r);
    setShowMenu(false);

    await fetch("/api/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concept_id: conceptId, article_id: articleId, reaction: r }),
    });
  };

  const reactionStyle = {
    knew_this: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
    new_to_me: "bg-sky-500/20 border-sky-500/40 text-sky-300",
    mind_blown: "bg-purple-500/20 border-purple-500/40 text-purple-300",
  };

  return (
    <span className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border transition-all ${
          reaction
            ? reactionStyle[reaction]
            : "bg-slate-800 border-slate-600 text-slate-300 hover:border-sky-500 hover:text-sky-300"
        }`}
      >
        {reaction && <span>{REACTIONS.find((r) => r.value === reaction)?.emoji}</span>}
        {conceptName}
      </button>

      {showMenu && (
        <div className="absolute z-50 bottom-full left-0 mb-2 flex gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1.5 shadow-xl">
          {REACTIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => handleReact(r.value)}
              className="px-2 py-1 rounded text-xs font-medium text-slate-300 hover:bg-slate-700 whitespace-nowrap transition-colors"
            >
              {r.emoji} {r.label}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
