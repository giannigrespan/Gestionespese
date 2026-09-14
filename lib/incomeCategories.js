export const INCOME_CATEGORIES = [
  { id: "stipendio", label: "Stipendio", color: "#22c55e", icon: "piggy-bank" },
  { id: "freelance", label: "Freelance", color: "#3b82f6", icon: "more-horizontal" },
  { id: "bonus", label: "Bonus", color: "#f59e0b", icon: "more-horizontal" },
  { id: "rimborso", label: "Rimborso", color: "#06b6d4", icon: "more-horizontal" },
  { id: "investimenti", label: "Investimenti", color: "#a855f7", icon: "more-horizontal" },
  { id: "altro", label: "Altro", color: "#64748b", icon: "more-horizontal" },
];

export function getIncomeCategory(id) {
  return INCOME_CATEGORIES.find((c) => c.id === id) || INCOME_CATEGORIES[INCOME_CATEGORIES.length - 1];
}
