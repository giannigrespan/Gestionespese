"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { CATEGORIES } from "@/lib/categories";

const COLORS = CATEGORIES.reduce((acc, c) => ({ ...acc, [c.id]: c.color }), {});

export default function StatsTab({ month }) {
  const [stats, setStats] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/stats/monthly?month=${month}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/stats/balance`).then((r) => (r.ok ? r.json() : null)),
    ]).then(([s, b]) => {
      setStats(s);
      setBalance(b);
      setLoading(false);
    });
  }, [month]);

  if (loading) return <p className="text-center text-sm text-slate-500">Caricamento...</p>;
  if (!stats) return <p className="text-center text-sm text-slate-500">Nessun dato disponibile</p>;

  const pieData = stats.by_category.filter((c) => c.spent > 0).map((c) => ({ name: c.category, value: c.spent }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Speso questo mese" value={`€ ${stats.total_spent.toFixed(2)}`} />
        <StatCard label="Budget totale" value={`€ ${stats.total_budget.toFixed(2)}`} />
        <StatCard label="N. spese" value={stats.expense_count} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-medium text-slate-700">Spese per categoria</h3>
          {pieData.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Nessuna spesa</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `€ ${v.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-medium text-slate-700">Speso vs budget</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.by_category}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `€ ${Number(v).toFixed(2)}`} />
              <Bar dataKey="spent" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {balance && balance.balances.length > 1 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-medium text-slate-700">Bilancio spese condivise</h3>
          <ul className="space-y-2">
            {balance.balances.map((b) => (
              <li key={b.user_id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{b.name}</span>
                <span className={b.balance >= 0 ? "text-emerald-600" : "text-red-600"}>
                  {b.balance >= 0 ? "+" : ""}
                  {b.balance.toFixed(2)} €
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
