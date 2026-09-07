"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Onboarding from "./Onboarding";
import ExpensesTab from "./ExpensesTab";
import BudgetsTab from "./BudgetsTab";
import StatsTab from "./StatsTab";
import RemindersTab from "./RemindersTab";
import {
  LogOut,
  Wallet,
  PiggyBank,
  BarChart3,
  BellRing,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const TABS = [
  { id: "expenses", label: "Spese", icon: Wallet },
  { id: "budgets", label: "Budget", icon: PiggyBank },
  { id: "stats", label: "Statistiche", icon: BarChart3 },
  { id: "reminders", label: "Promemoria", icon: BellRing },
];

const MONTH_NAMES = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

function shiftMonth(month, delta) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(month) {
  const [y, m] = month.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

export default function Dashboard({ initialUser }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [tab, setTab] = useState("expenses");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [menuOpen, setMenuOpen] = useState(false);

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

  const initial = (user.name || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Wallet size={20} />
            </span>
            <div>
              <h1 className="text-base font-semibold leading-tight text-slate-900">Budget Familiare</h1>
              <p className="text-xs text-slate-500">Ciao, {user.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/export/csv"
              title="Esporta CSV"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <Download size={18} />
            </a>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white"
              >
                {initial}
              </button>
              {menuOpen && (
                <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <LogOut size={15} /> Esci
                  </button>
                </div>
              )}
            </div>
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

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <button
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-semibold text-slate-800">{formatMonth(month)}</span>
          <button
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {tab === "expenses" && (
          <div className="grid grid-cols-3 gap-2">
            <QuickAction
              icon={PiggyBank}
              label="Budget"
              gradient="from-orange-500 to-red-500"
              onClick={() => setTab("budgets")}
            />
            <QuickAction
              icon={BarChart3}
              label="Statistiche"
              gradient="from-sky-500 to-cyan-500"
              onClick={() => setTab("stats")}
            />
            <QuickAction
              icon={Download}
              label="Export"
              gradient="from-slate-700 to-slate-900"
              href="/api/export/csv"
            />
          </div>
        )}

        {tab === "expenses" && <ExpensesTab month={month} currentUserId={user.id} />}
        {tab === "budgets" && <BudgetsTab month={month} />}
        {tab === "stats" && <StatsTab month={month} />}
        {tab === "reminders" && <RemindersTab />}
      </main>
    </div>
  );
}

function QuickAction({ icon: Icon, label, gradient, onClick, href }) {
  const className = `flex flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-br ${gradient} px-2 py-4 text-white shadow-sm transition hover:opacity-90`;
  if (href) {
    return (
      <a href={href} className={className}>
        <Icon size={20} />
        <span className="text-xs font-semibold">{label}</span>
      </a>
    );
  }
  return (
    <button onClick={onClick} className={className}>
      <Icon size={20} />
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}
