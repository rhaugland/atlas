"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight text-[#1A1A1A]">
            mar<span className="text-[#D4756A]">gin</span>
          </h1>
          <p className="text-[#6B7280] mt-2 text-sm">
            your mind, picked up where you left off.
          </p>
        </div>

        {sent ? (
          <div className="bg-[#7CB5A0]/10 border border-[#7CB5A0]/40 rounded-2xl p-8 text-center">
            <p className="text-[#7CB5A0] font-semibold">Check your email</p>
            <p className="text-[#6B7280] text-sm mt-2">
              We sent a magic link to <span className="text-[#1A1A1A]">{email}</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full px-4 py-3 bg-white border border-[#E8E4DD] rounded-xl text-[#1A1A1A] placeholder:text-[#6B7280] focus:outline-none focus:border-[#D4756A]"
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#D4756A] hover:bg-[#c4655a] text-white font-bold rounded-xl transition-colors"
            >
              Send Magic Link
            </button>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
