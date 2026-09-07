"use client";

import { useEffect, useState } from "react";
import { Trash2, Check } from "lucide-react";

export default function RemindersTab() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", amount: "", due_date: "" });
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/reminders");
    if (res.ok) setReminders(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    if (!form.title || !form.amount || !form.due_date) {
      setError("Compila tutti i campi");
      return;
    }
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.detail || "Errore");
      return;
    }
    setForm({ title: "", amount: "", due_date: "" });
    load();
  }

  async function handlePay(id) {
    await fetch(`/api/reminders/${id}/pay`, { method: "POST" });
    load();
  }

  async function handleDelete(id) {
    await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4">
        <input
          placeholder="Titolo (es. Bolletta luce)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Importo"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 sm:col-span-4">
          Aggiungi promemoria
        </button>
        {error && <p className="col-span-full text-sm text-red-600">{error}</p>}
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-center text-sm text-slate-500">Caricamento...</p>
        ) : reminders.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">Nessun promemoria</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {reminders.map((r) => (
              <li key={r.reminder_id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className={`text-sm font-medium ${r.paid ? "text-slate-400 line-through" : "text-slate-800"}`}>{r.title}</p>
                  <p className="text-xs text-slate-500">
                    Scadenza {new Date(r.due_date).toLocaleDateString("it-IT")} · € {r.amount.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!r.paid && (
                    <button
                      onClick={() => handlePay(r.reminder_id)}
                      className="flex items-center gap-1 rounded-lg border border-emerald-300 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                    >
                      <Check size={14} /> Segna pagato
                    </button>
                  )}
                  <button onClick={() => handleDelete(r.reminder_id)} className="text-slate-400 hover:text-red-600">
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
