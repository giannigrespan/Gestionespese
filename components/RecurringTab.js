"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { INCOME_CATEGORIES, getIncomeCategory } from "@/lib/incomeCategories";
import CategoryIcon from "./CategoryIcon";
import { Trash2, Pause, Play } from "lucide-react";

const FREQUENCIES = [
  { id: "monthly", label: "Mensile" },
  { id: "yearly", label: "Annuale" },
];

const TYPES = [
  { id: "expense", label: "Spesa" },
  { id: "income", label: "Entrata" },
];

export default function RecurringTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: CATEGORIES[0].id,
    description: "",
    frequency: "monthly",
    next_run_date: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState("");

  const categoryList = form.type === "income" ? INCOME_CATEGORIES : CATEGORIES;

  async function load() {
    setLoading(true);
    const res = await fetch("/api/recurring-transactions");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function setType(type) {
    const list = type === "income" ? INCOME_CATEGORIES : CATEGORIES;
    setForm({ ...form, type, category: list[0].id });
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    if (!form.amount || !form.description || !form.next_run_date) {
      setError("Compila importo, descrizione e data");
      return;
    }
    const res = await fetch("/api/recurring-transactions", {
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
    load();
  }

  async function toggleActive(item) {
    await fetch(`/api/recurring-transactions/${item.recurring_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    load();
  }

  async function handleDelete(id) {
    await fetch(`/api/recurring-transactions/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Nuova transazione ricorrente</h3>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Tipo</p>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  form.type === t.id
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Importo (€)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Frequenza</label>
            <div className="grid grid-cols-2 gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setForm({ ...form, frequency: f.id })}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    form.frequency === f.id
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Categoria</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {categoryList.map((c) => {
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
            placeholder={form.type === "income" ? "Es: Stipendio mensile" : "Es: Abbonamento Netflix"}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Prima esecuzione</label>
          <input
            type="date"
            value={form.next_run_date}
            onChange={(e) => setForm({ ...form, next_run_date: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          Aggiungi transazione ricorrente
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h3 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-800">Transazioni ricorrenti</h3>
        {loading ? (
          <p className="p-6 text-center text-sm text-slate-500">Caricamento...</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">Nessuna transazione ricorrente configurata</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((r) => {
              const cat = r.type === "income" ? getIncomeCategory(r.category) : getCategory(r.category);
              return (
                <li key={r.recurring_id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <CategoryIcon icon={cat.icon} size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium ${r.active ? "text-slate-900" : "text-slate-400 line-through"}`}>
                      {r.description}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {cat.label} · {r.frequency === "yearly" ? "annuale" : "mensile"} · prossimo{" "}
                      {r.type === "income" ? "accredito" : "addebito"} {new Date(r.next_run_date).toLocaleDateString("it-IT")}
                    </p>
                  </div>
                  <span className={`shrink-0 text-sm font-semibold ${r.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                    {r.type === "income" ? "+" : "-"}€ {r.amount.toFixed(2)}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => toggleActive(r)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600"
                      title={r.active ? "Sospendi" : "Riattiva"}
                    >
                      {r.active ? <Pause size={15} /> : <Play size={15} />}
                    </button>
                    <button
                      onClick={() => handleDelete(r.recurring_id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Elimina"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
