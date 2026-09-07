"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Onboarding from "./Onboarding";
import ExpensesTab from "./ExpensesTab";
import BudgetsTab from "./BudgetsTab";
import StatsTab from "./StatsTab";
import RemindersTab from "./RemindersTab";
import { LogOut, Wallet, PiggyBank, BarChart3, BellRing, Download } from "lucide-react";

const TABS = [
  { id: "expenses", label: "Spese", icon: Wallet },
  { id: "budgets", label: "Budget", icon: PiggyBank },
  { id: "stats", label: "Statistiche", icon: BarChart3 },
  { id: "reminders", label: "Promemoria", icon: BellRing },
];

export default function Dashboard({ initialUser }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [tab, setTab] = useState("expenses");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const handleFamilyReady = useCallback((familyId) => {
    setUser((u) => ({ ...u, family_id: familyId }));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (!user.family_id) {
    return <Onboarding onReady={handleFamilyReady} />;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Gestione Spese</h1>
            <p className="text-sm text-slate-500">Ciao, {user.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            />
            <a
              href="/api/export/csv"
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              <Download size={16} /> CSV
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              <LogOut size={16} /> Esci
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 px-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {tab === "expenses" && <ExpensesTab month={month} currentUserId={user.id} />}
        {tab === "budgets" && <BudgetsTab month={month} />}
        {tab === "stats" && <StatsTab month={month} />}
        {tab === "reminders" && <RemindersTab />}
      </main>
    </div>
  );
}
