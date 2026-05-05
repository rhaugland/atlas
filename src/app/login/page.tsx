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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight">
            AT<span className="text-sky-400">LAS</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            The first reader that remembers what you know.
          </p>
        </div>

        {sent ? (
          <div className="bg-sky-950/50 border border-sky-800 rounded-2xl p-8 text-center">
            <p className="text-sky-300 font-semibold">Check your email</p>
            <p className="text-slate-400 text-sm mt-2">
              We sent a magic link to <span className="text-slate-200">{email}</span>
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
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition-colors"
            >
              Send Magic Link
            </button>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
