"use client";

import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { Trash2 } from "lucide-react";

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
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <label className="text-xs font-medium text-slate-500">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Budget mensile (€)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Imposta budget
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-center text-sm text-slate-500">Caricamento...</p>
        ) : budgets.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">Nessun budget impostato per questo mese</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {budgets.map((b) => (
              <li key={b.budget_id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-slate-800">
                  {CATEGORIES.find((c) => c.id === b.category)?.label || b.category}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600">€ {b.amount.toFixed(2)}</span>
                  <button onClick={() => handleDelete(b.budget_id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
