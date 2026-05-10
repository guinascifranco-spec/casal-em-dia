export type Expense = {
  id: string;
  amount: number;
  paid_by: string;
  split_type: "split" | "transfer";
};

export type Member = {
  user_id: string;
  display_name: string;
};

export type Verdict =
  | { kind: "even" }
  | { kind: "owes"; debtor: Member; creditor: Member; amount: number };

/**
 * Compute the net balance between exactly 2 members.
 * - split: payer is owed amount/2 by the other
 * - transfer: payer is owed full amount by the other (gasto pertence ao outro)
 */
export function computeVerdict(members: Member[], expenses: Expense[]): Verdict | null {
  if (members.length < 2) return null;
  const [a, b] = members;

  // net[a] = how much A is owed (positive) or owes (negative)
  let netA = 0;
  for (const e of expenses) {
    const otherIsB = e.paid_by === a.user_id;
    if (e.split_type === "split") {
      const half = e.amount / 2;
      if (otherIsB) netA += half;
      else netA -= half;
    } else {
      // transfer: the payer is fully owed by the other
      if (otherIsB) netA += e.amount;
      else netA -= e.amount;
    }
  }

  const rounded = Math.round(netA * 100) / 100;
  if (Math.abs(rounded) < 0.01) return { kind: "even" };
  if (rounded > 0) {
    return { kind: "owes", debtor: b, creditor: a, amount: rounded };
  }
  return { kind: "owes", debtor: a, creditor: b, amount: -rounded };
}
