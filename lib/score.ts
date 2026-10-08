import { TYPES, Q, W, TR, EMB } from "./data";
export const PER = Q.filter((q) => q[1] === 0).length;
export const valid = (a: unknown): a is number[] =>
  Array.isArray(a) && a.length === Q.length && a.every((n) => Number.isInteger(n) && n >= 1 && n <= 5);
export const sumsFrom = (ans: number[]) => { const s = TYPES.map(() => 0); Q.forEach((q, k) => (s[q[1]] += ans[k])); return s; };
export const pctsFrom = (s: number[]) => s.map((x) => Math.round(((x - PER) / (PER * 4)) * 100));
export function teaser(sums: number[]) { const o = [...pctsFrom(sums)].sort((a, b) => b - a); return { topPct: o[0], gap: o[0] - o[1] }; }
// Premium content is only attached when the result is paid. Free callers never receive it.
export function buildReport(sums: number[], paid: boolean) {
  const pcts = pctsFrom(sums);
  const order = TYPES.map((_, k) => k).sort((a, b) => sums[b] - sums[a]);
  const t = TYPES[order[0]];
  const base = { paid, top: { name: t.name, line: t.line, about: t.about, strengths: t.strengths, emblem: EMB[order[0]] },
    profile: order.map((k) => ({ name: TYPES[k].name, pct: pcts[k] })) };
  if (!paid) return { ...base, locked: { flaws: t.flaws.length, careers: t.careers.length } };
  const traits = TR.map((name, j) => { let a = 0, b = 0; W.forEach((w, k) => { a += pcts[k] * w[j]; b += w[j]; }); return { name, pct: Math.round(a / b) }; });
  return { ...base, premium: { traits, flaws: t.flaws, growth: t.growth, rel: t.rel, careers: t.careers } };
}
