import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireFamilyUser } from "@/lib/apiAuth";

export async function GET() {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const family = await prisma.family.findUnique({
    where: { id: user.familyId },
    include: { members: { select: { id: true, name: true } } },
  });

  const expenses = await prisma.expense.findMany({
    where: { familyId: user.familyId, expenseType: "shared" },
  });

  const paidByMember = {};
  for (const member of family.members) paidByMember[member.id] = 0;
  for (const e of expenses) {
    paidByMember[e.userId] = (paidByMember[e.userId] || 0) + e.amount;
  }

  const totalShared = Object.values(paidByMember).reduce((s, v) => s + v, 0);
  const perPersonShare = family.members.length > 0 ? totalShared / family.members.length : 0;

  const balances = family.members.map((m) => ({
    user_id: m.id,
    name: m.name,
    paid: paidByMember[m.id] || 0,
    share: perPersonShare,
    balance: (paidByMember[m.id] || 0) - perPersonShare,
  }));

  return NextResponse.json({ total_shared: totalShared, per_person_share: perPersonShare, balances });
}
