"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, getCategory } from "@/lib/categories";
import CategoryIcon from "./CategoryIcon";
import { Trash2 } from "lucide-react";

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function BudgetsTab({ month }) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [amount, setAmount] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/budgets?month=${month}`);
    if (res.ok) setBudgets(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!amount) return;
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, amount, month }),
    });
    setAmount("");
    load();
  }

  async function handleDelete(id) {
    await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Categoria</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  style={active ? { borderColor: c.color, background: hexToRgba(c.color, 0.1) } : undefined}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition ${
                    active ? "" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ background: hexToRgba(c.color, 0.15), color: c.color }}
                  >
                    <CategoryIcon icon={c.icon} size={16} />
                  </span>
                  <span className="text-[11px] font-medium text-slate-700">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Budget mensile (€)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            Imposta budget
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-center text-sm text-slate-500">Caricamento...</p>
        ) : budgets.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">Nessun budget impostato per questo mese</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {budgets.map((b) => {
              const cat = getCategory(b.category);
              return (
                <li key={b.budget_id} className="flex items-center gap-3 px-5 py-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ background: hexToRgba(cat.color, 0.15), color: cat.color }}
                  >
                    <CategoryIcon icon={cat.icon} size={16} />
                  </span>
                  <span className="flex-1 text-sm font-medium text-slate-800">{cat.label}</span>
                  <span className="text-sm text-slate-600">€ {b.amount.toFixed(2)}</span>
                  <button onClick={() => handleDelete(b.budget_id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
