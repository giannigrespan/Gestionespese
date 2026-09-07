"use client";

import { useState } from "react";

export default function Onboarding({ onReady }) {
  const [mode, setMode] = useState("create");
  const [name, setName] = useState("");
  const [familyId, setFamilyId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = mode === "create" ? "/api/families" : "/api/families/join";
      const body = mode === "create" ? { name } : { family_id: familyId };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Errore");
      onReady(data.family_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Benvenuto!</h1>
        <p className="mt-1 text-sm text-slate-500">Crea una nuova famiglia o unisciti a una esistente</p>

        <div className="mt-6 flex rounded-lg bg-slate-100 p-1 text-sm font-medium">
          <button
            onClick={() => setMode("create")}
            className={`flex-1 rounded-md py-1.5 transition ${mode === "create" ? "bg-white shadow-sm" : "text-slate-500"}`}
          >
            Crea famiglia
          </button>
          <button
            onClick={() => setMode("join")}
            className={`flex-1 rounded-md py-1.5 transition ${mode === "join" ? "bg-white shadow-sm" : "text-slate-500"}`}
          >
            Unisciti
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "create" ? (
            <div>
              <label className="text-sm font-medium text-slate-700">Nome famiglia</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Famiglia Rossi"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-slate-700">ID famiglia</label>
              <input
                required
                value={familyId}
                onChange={(e) => setFamilyId(e.target.value)}
                placeholder="Chiedilo a chi ha creato la famiglia"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Attendere..." : mode === "create" ? "Crea famiglia" : "Unisciti"}
          </button>
        </form>
      </div>
    </div>
  );
}
