import { prisma } from "@/lib/db";
import { requireFamilyUser } from "@/lib/apiAuth";

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET() {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const expenses = await prisma.expense.findMany({
    where: { familyId: user.familyId },
    orderBy: { date: "desc" },
    include: { user: { select: { name: true } } },
  });

  const header = ["Data", "Categoria", "Descrizione", "Importo", "Tipo", "Registrato da"];
  const rows = expenses.map((e) => [
    e.date.toISOString().slice(0, 10),
    e.category,
    e.description,
    e.amount.toFixed(2),
    e.expenseType,
    e.user.name,
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="spese.csv"`,
    },
  });
}
