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
    knew_this: "bg-[#7CB5A0]/20 border-[#7CB5A0]/60 text-[#7CB5A0]",
    new_to_me: "bg-[#6B8DB5]/20 border-[#6B8DB5]/60 text-[#6B8DB5]",
    mind_blown: "bg-[#D4756A]/20 border-[#D4756A]/60 text-[#D4756A]",
  };

  return (
    <span className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border transition-all ${
          reaction
            ? reactionStyle[reaction]
            : "bg-white border-[#E8E4DD] text-[#2D3142] hover:border-[#D4756A]/50 hover:text-[#D4756A]"
        }`}
      >
        {reaction && <span>{REACTIONS.find((r) => r.value === reaction)?.emoji}</span>}
        {conceptName}
      </button>

      {showMenu && (
        <div className="absolute z-50 bottom-full left-0 mb-2 flex gap-1 bg-white border border-[#E8E4DD] rounded-lg p-1.5 shadow-xl">
          {REACTIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => handleReact(r.value)}
              className="px-2 py-1 rounded text-xs font-medium text-[#2D3142] hover:bg-[#F2EFE9] whitespace-nowrap transition-colors"
            >
              {r.emoji} {r.label}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
