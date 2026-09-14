"use client";

import { useEffect, useState } from "react";
import { INCOME_CATEGORIES, getIncomeCategory } from "@/lib/incomeCategories";
import CategoryIcon from "./CategoryIcon";
import { Trash2, Plus, X } from "lucide-react";

export default function IncomeTab({ month }) {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    category: INCOME_CATEGORIES[0].id,
    description: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/incomes?month=${month}`);
    if (res.ok) setIncomes(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    if (!form.amount || !form.description) {
      setError("Compila importo e descrizione");
      return;
    }
    const res = await fetch("/api/incomes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.detail || "Errore durante il salvataggio");
      return;
    }
    setForm({ ...form, amount: "", description: "" });
    setShowForm(false);
    load();
  }

  async function handleDelete(id) {
    await fetch(`/api/incomes/${id}`, { method: "DELETE" });
    load();
  }

  const total = incomes.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Totale entrate del mese</p>
          <p className="text-2xl font-semibold text-emerald-600">€ {total.toFixed(2)}</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Chiudi" : "Nuova entrata"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Nuova Entrata</h3>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Importo (€)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-lg font-medium focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Categoria</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {INCOME_CATEGORIES.map((c) => {
                const active = form.category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setForm({ ...form, category: c.id })}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition ${
                      active ? "border-brand-600 bg-brand-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <CategoryIcon icon={c.icon} size={16} />
                    <span className="text-[11px] font-medium text-slate-700">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Descrizione</label>
            <input
              type="text"
              placeholder="Es: Stipendio settembre"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Data</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Aggiungi Entrata
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h3 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-800">Entrate Recenti</h3>
        {loading ? (
          <p className="p-6 text-center text-sm text-slate-500">Caricamento...</p>
        ) : incomes.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">Nessuna entrata registrata per questo mese</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {incomes.map((i) => {
              const cat = getIncomeCategory(i.category);
              return (
                <li key={i.income_id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CategoryIcon icon={cat.icon} size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{i.description}</p>
                    <p className="truncate text-xs text-slate-500">
                      {cat.label} · {i.user_name}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-emerald-600">+€ {i.amount.toFixed(2)}</span>
                  <button
                    onClick={() => handleDelete(i.income_id)}
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    title="Elimina"
                  >
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
