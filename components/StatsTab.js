"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Line,
} from "recharts";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { TrendingDown, Wallet, Receipt } from "lucide-react";

const COLORS = CATEGORIES.reduce((acc, c) => ({ ...acc, [c.id]: c.color }), {});
const MONTH_LABELS = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

export default function StatsTab({ month }) {
  const [stats, setStats] = useState(null);
  const [balance, setBalance] = useState(null);
  const [yearly, setYearly] = useState(null);
  const [loading, setLoading] = useState(true);
  const year = Number(month.split("-")[0]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/stats/monthly?month=${month}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/stats/balance`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/stats/yearly?year=${year}`).then((r) => (r.ok ? r.json() : null)),
    ]).then(([s, b, y]) => {
      setStats(s);
      setBalance(b);
      setYearly(y);
      setLoading(false);
    });
  }, [month, year]);

  if (loading) return <p className="text-center text-sm text-slate-500">Caricamento...</p>;
  if (!stats) return <p className="text-center text-sm text-slate-500">Nessun dato disponibile</p>;

  const yearlyData = (yearly?.months || []).map((m) => ({
    label: MONTH_LABELS[m.month - 1],
    total: m.total,
    cumulative: m.cumulative,
  }));

  const pieData = stats.by_category
    .filter((c) => c.spent > 0)
    .map((c) => ({ name: c.category, label: getCategory(c.category).label, value: c.spent }));
  const barData = stats.by_category.map((c) => ({ ...c, label: getCategory(c.category).label }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={TrendingDown} tone="text-red-500" label="Spese Totali" value={`€ ${stats.total_spent.toFixed(2)}`} />
        <StatCard icon={Wallet} tone="text-emerald-500" label="Budget" value={`€ ${stats.total_budget.toFixed(2)}`} />
        <StatCard icon={Receipt} tone="text-brand-500" label="N. spese" value={stats.expense_count} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">Spese per Categoria</h3>
          {pieData.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Nessuna spesa</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="label" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `€ ${v.toFixed(2)}`} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">Speso vs Budget</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `€ ${Number(v).toFixed(2)}`} />
              <Bar dataKey="spent" name="Speso" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="budget" name="Budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {yearly && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">Progressivo annuo {year}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `€ ${Number(v).toFixed(2)}`} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              <Bar dataKey="total" name="Speso nel mese" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="cumulative" name="Progressivo" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="mt-2 text-right text-sm text-slate-500">
            Totale {year}: <span className="font-semibold text-slate-800">€ {yearly.total_spent.toFixed(2)}</span>
          </p>
        </div>
      )}

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

function StatCard({ icon: Icon, tone, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 ${tone}`}>
        <Icon size={18} />
      </span>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-xl font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
