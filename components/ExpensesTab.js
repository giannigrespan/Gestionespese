"use client";

import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { Trash2, Plus } from "lucide-react";

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
          className="flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus size={16} /> Nuova spesa
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-5">
          <input
            type="number"
            step="0.01"
            placeholder="Importo"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Descrizione"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={form.expense_type}
            onChange={(e) => setForm({ ...form, expense_type: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="shared">Condivisa</option>
            <option value="personal">Personale</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 sm:col-span-1"
          >
            Salva
          </button>
          {error && <p className="col-span-full text-sm text-red-600">{error}</p>}
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-center text-sm text-slate-500">Caricamento...</p>
        ) : expenses.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">Nessuna spesa registrata per questo mese</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Data</th>
                <th className="px-4 py-2">Categoria</th>
                <th className="px-4 py-2">Descrizione</th>
                <th className="px-4 py-2">Chi</th>
                <th className="px-4 py-2 text-right">Importo</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((e) => (
                <tr key={e.expense_id}>
                  <td className="px-4 py-2 text-slate-600">{new Date(e.date).toLocaleDateString("it-IT")}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {CATEGORIES.find((c) => c.id === e.category)?.label || e.category}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-900">{e.description}</td>
                  <td className="px-4 py-2 text-slate-500">{e.user_name}</td>
                  <td className="px-4 py-2 text-right font-medium text-slate-900">€ {e.amount.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">
                    {e.user_id === currentUserId && (
                      <button onClick={() => handleDelete(e.expense_id)} className="text-slate-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
