"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, getCategory } from "@/lib/categories";
import CategoryIcon from "./CategoryIcon";
import { Trash2, Pencil, Plus, Users, User, Heart, X } from "lucide-react";

const TYPES = [
  { id: "shared", label: "Condivisa", sub: "50/50", icon: Users },
  { id: "personal", label: "Personale", sub: "Solo mia", icon: User },
  { id: "for_partner", label: "Per Partner", sub: "Non divisa", icon: Heart },
];

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function ExpensesTab({ month, currentUserId }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    category: CATEGORIES[0].id,
    description: "",
    date: new Date().toISOString().slice(0, 10),
    expense_type: "shared",
  });
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/expenses?month=${month}`);
    if (res.ok) setExpenses(await res.json());
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
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.detail || "Errore");
      return;
    }
    setForm({ ...form, amount: "", description: "" });
    setShowForm(false);
    load();
  }

  async function handleDelete(id) {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    load();
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Totale spese del mese</p>
          <p className="text-2xl font-semibold text-slate-900">€ {total.toFixed(2)}</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Chiudi" : "Nuova spesa"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Nuova Spesa</h3>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Tipo di Spesa</p>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => {
                const Icon = t.icon;
                const active = form.expense_type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm({ ...form, expense_type: t.id })}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition ${
                      active
                        ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{t.label}</span>
                    <span className={`text-[11px] ${active ? "text-brand-100" : "text-slate-400"}`}>{t.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

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
              {CATEGORIES.map((c) => {
                const active = form.category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setForm({ ...form, category: c.id })}
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

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Descrizione</label>
            <input
              type="text"
              placeholder="Es: Spesa al supermercato"
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
            Aggiungi Spesa
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h3 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-800">Spese Recenti</h3>
        {loading ? (
          <p className="p-6 text-center text-sm text-slate-500">Caricamento...</p>
        ) : expenses.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">Nessuna spesa registrata per questo mese</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {expenses.map((e) => {
              const cat = getCategory(e.category);
              return (
                <li key={e.expense_id} className="flex items-center gap-3 px-5 py-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ background: hexToRgba(cat.color, 0.15), color: cat.color }}
                  >
                    <CategoryIcon icon={cat.icon} size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{e.description}</p>
                    <p className="truncate text-xs text-slate-500">
                      {cat.label} · {e.user_name}
                      {e.expense_type === "personal" ? " · personale" : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-red-600">-€ {e.amount.toFixed(2)}</span>
                  {e.user_id === currentUserId && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => handleDelete(e.expense_id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Elimina"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
