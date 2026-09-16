export const CATEGORIES = [
  { id: "spesa", label: "Alimentari", color: "#22c55e", icon: "shopping-cart" },
  { id: "trasporti", label: "Trasporti", color: "#f59e0b", icon: "car" },
  { id: "carburante", label: "Ricarica Auto", color: "#06b6d4", icon: "fuel" },
  { id: "casa", label: "Casa", color: "#6366f1", icon: "home" },
  { id: "bollette", label: "Utenze", color: "#0ea5e9", icon: "zap" },
  { id: "salute", label: "Salute", color: "#ef4444", icon: "heart" },
  { id: "svago", label: "Svago", color: "#ec4899", icon: "film" },
  { id: "abbigliamento", label: "Abbigliamento", color: "#a855f7", icon: "shirt" },
  { id: "istruzione", label: "Istruzione", color: "#3b82f6", icon: "graduation-cap" },
  { id: "risparmio", label: "Risparmio", color: "#14b8a6", icon: "piggy-bank" },
  { id: "figli", label: "Figli", color: "#f97316", icon: "baby" },
  { id: "altro", label: "Altro", color: "#64748b", icon: "more-horizontal" },
];

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

const CATEGORY_SYNONYMS = {
  spesa: "spesa",
  alimentari: "spesa",
  supermercato: "spesa",
  trasporti: "trasporti",
  bus: "trasporti",
  treno: "trasporti",
  carburante: "carburante",
  benzina: "carburante",
  diesel: "carburante",
  "ricarica auto": "carburante",
  casa: "casa",
  affitto: "casa",
  mutuo: "casa",
  bollette: "bollette",
  utenze: "bollette",
  luce: "bollette",
  gas: "bollette",
  salute: "salute",
  farmacia: "salute",
  medico: "salute",
  svago: "svago",
  divertimento: "svago",
  cinema: "svago",
  abbigliamento: "abbigliamento",
  vestiti: "abbigliamento",
  istruzione: "istruzione",
  scuola: "istruzione",
  libri: "istruzione",
  risparmio: "risparmio",
  figli: "figli",
  altro: "altro",
};

// Mappa in modo tollerante un testo libero (es. dettato vocale) a un id di categoria valido.
export function resolveCategory(input) {
  if (!input) return "altro";
  const key = String(input).trim().toLowerCase();
  if (CATEGORY_SYNONYMS[key]) return CATEGORY_SYNONYMS[key];
  if (CATEGORIES.some((c) => c.id === key)) return key;
  return "altro";
}
