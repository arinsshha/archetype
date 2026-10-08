"use client";
import { useEffect, useState } from "react";
import { Q, LABELS, ART1, ART2 } from "@/lib/data";

const PG = 3, PAGES = Math.ceil(Q.length / PG);
const PRICE = process.env.NEXT_PUBLIC_PRICE_RUPEES || "149";
const STEPS = [["Personality patterns", "Spotting your most common habits and traits"], ["Key strengths", "Pinpointing where you naturally excel"], ["Social style", "Seeing how you communicate and work with others"], ["Future growth", "Finding the best ways for you to move forward"]];
type P = { name: string; pct: number };
type Rep = { paid: boolean; top: { name: string; line: string; about: string; strengths: string[]; emblem: string[] }; profile: P[];
  locked?: { flaws: number; careers: number };
  premium?: { traits: P[]; flaws: string[]; growth: string[]; rel: string; careers: string[] } };
const post = (u: string, b: object) => fetch(u, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json());
const List = ({ a }: { a: string[] }) => <ul>{a.map((x) => <li key={x}>{x}</li>)}</ul>;
const Row = ({ n, p, top }: { n: string; p: number; top?: boolean }) => (
  <div className={"row " + (top ? "top" : "")}><div><span>{n}</span><span>{p}%</span></div><div className="bar"><b style={{ width: p + "%" }} /></div></div>
);
const loadRz = () => new Promise<void>((ok) => {
  if ((window as any).Razorpay) return ok();
  const s = document.createElement("script"); s.src = "https://checkout.razorpay.com/v1/checkout.js"; s.onload = () => ok(); document.body.appendChild(s);
});

export default function Page() {
  const [view, setView] = useState("intro");
  const [pg, setPg] = useState(0);
  const [ans, setAns] = useState<number[]>([]);
  const [res, setRes] = useState<{ id: string; topPct: number; gap: number } | null>(null);
  const [rep, setRep] = useState<Rep | null>(null);
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(0);
  const [msg, setMsg] = useState("");

  const load = async (id: string) => {
    const r = await fetch(`/api/results/${id}`);
    if (!r.ok) { location.hash = ""; setView("intro"); return; }
    setRep(await r.json()); setView("report"); window.scrollTo(0, 0);
  };
  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then((d) => setCount(d.count)).catch(() => {});
    const m = location.hash.match(/^#r=(\w+)$/); if (m) load(m[1]);
  }, []);

  const start = () => { setAns([]); setPg(0); setView("prep"); setTimeout(() => setView("ask"), 1700); };
  const analyse = async () => {
    setView("analyse"); setStep(0); setMsg("");
    const req = post("/api/results", { answers: ans }).catch(() => ({}));
    [0, 1, 2, 3].forEach((k) => setTimeout(() => setStep(k + 1), 300 + k * 1000));
    const [d] = await Promise.all([req, new Promise((r) => setTimeout(r, 4600))]);
    if (!d.id) { setMsg(d.error || "Something went wrong saving your result. Please try again."); setView("done"); return; }
    setRes(d); setView("ready");
  };
  const reveal = () => { location.hash = "r=" + res!.id; load(res!.id); };
  const share = async () => {
    const url = location.href.split("#")[0], text = `I got ${rep!.top.name}. Find your archetype:`;
    try { if (navigator.share) { await navigator.share({ title: "Archetype test", text, url }); return; } } catch (e: any) { if (e?.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(text + " " + url); setMsg("Link copied."); } catch { setMsg(url); }
  };
  const buy = async () => {
    const id = location.hash.slice(3); setMsg("");
    const o = await post("/api/checkout", { id });
    if (!o.orderId) { setMsg(o.error || "Checkout failed. Try again."); return; }
    await loadRz();
    new (window as any).Razorpay({ key: o.keyId, order_id: o.orderId, amount: o.amount, currency: "INR", name: "Archetype Lab", description: "Full archetype report",
      handler: async (r: any) => { const v = await post("/api/verify", { id, ...r }); if (v.ok) load(id); else setMsg("Payment could not be verified. Contact support with your payment ID."); } }).open();
  };

  const a = pg * PG, b = Math.min(a + PG, Q.length);
  const okp = Array.from({ length: b - a }, (_, i) => ans[a + i]).every(Boolean);

  return (<>
    {view === "intro" && <div className="card">
      <h1 className="hero">Discover your <em>Archetype</em></h1>
      <p className="sub">Answer {Q.length} short statements to reveal what drives your decisions. It takes about 10 minutes.</p>
      {count > 0 && <p className="sub"><b>{count.toLocaleString()}</b> people have taken this test</p>}
      <div style={{ margin: "20px 0 4px" }} dangerouslySetInnerHTML={{ __html: ART1 }} />
      <div className="tip" style={{ marginTop: 22 }}><i>&#10003;</i><span>Rate each statement based on your personal opinion.</span></div>
      <div className="tip"><i>&#10003;</i><span>Each statement has 5 options, from strongly disagree to strongly agree.</span></div>
      <button className="btn" onClick={start}>Start test</button></div>}

    {view === "prep" && <div className="card center"><h2>Preparing your test…</h2>
      <div className="bar" style={{ marginTop: 22 }}><b style={{ width: "100%", animation: "fill 1.6s ease" }} /></div></div>}

    {view === "ask" && <div className="card">
      <div className="bar"><b style={{ width: Math.round((a / Q.length) * 100) + "%" }} /></div>
      <div className="qtop"><button className="back" onClick={() => (pg ? setPg(pg - 1) : setView("intro"))}>&larr; Back</button><span className="mu">{pg + 1}/{PAGES}</span></div>
      <h2 style={{ textAlign: "center", margin: "8px 0 6px", fontSize: "1.3rem" }}>Select how well each statement applies to you</h2>
      {Q.slice(a, b).map((q, i) => { const k = a + i; return (
        <div className="st" key={k}><p>{q[0]}</p>
          <div className="dots" role="radiogroup" aria-label={q[0]}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className={`opt o${n} ${ans[k] === n ? "sel" : ""}`} role="radio" aria-checked={ans[k] === n} aria-label={LABELS[n - 1]}
                onClick={() => setAns((p) => { const x = [...p]; x[k] = n; return x; })}><span className="dot" /></button>))}
          </div>
          <div className="lab"><span className="a">Strongly disagree</span><span className="b">Strongly agree</span></div></div>); })}
      <button className="btn" disabled={!okp} onClick={() => { if (pg < PAGES - 1) { setPg(pg + 1); window.scrollTo(0, 0); } else setView("done"); }}>{pg < PAGES - 1 ? "Next" : "Finish"} &rarr;</button></div>}

    {view === "done" && <div className="card center">
      <div dangerouslySetInnerHTML={{ __html: ART2 }} /><h1 style={{ margin: "10px 0 6px" }}>Well done!</h1><p className="mu">You've completed the archetype test.</p>
      {msg && <p role="alert" style={{ color: "var(--red)" }}>{msg}</p>}
      <button className="btn" onClick={analyse}>Get my results &rarr;</button>
      <button className="link" onClick={() => { setPg(PAGES - 1); setView("ask"); }}>Edit my answers</button></div>}

    {view === "analyse" && <div className="card"><h1 style={{ fontSize: "1.7rem" }}>Analysing your profile…</h1>
      {STEPS.map((s, k) => <div className="step" key={k}><b>{s[0]}</b><span>{s[1]}</span><div className="bar"><b style={{ width: step > k ? "100%" : 0 }} /></div></div>)}</div>}

    {view === "ready" && res && <div className="card">
      <h1 style={{ textAlign: "center", fontSize: "1.7rem" }}>Your archetype report is ready!</h1>
      <div className="mys"><div className="emb" style={{ background: "var(--accent)", color: "#fff" }} aria-hidden="true">?</div><b>Your dominant archetype is waiting</b>
        <p className="mu" style={{ margin: "6px 0 0" }}>You matched at <b style={{ color: "var(--ink)" }}>{res.topPct}%</b>. {res.gap < 10 ? `Close call: your top two archetypes are only ${res.gap} point${res.gap === 1 ? "" : "s"} apart.` : `Clear leader: your top archetype is ${res.gap} points ahead of the next one.`}</p></div>
      <h3 style={{ marginTop: 0 }}>What you'll receive</h3>
      {[["Your dominant archetype", "Who you are at your core"], ["Your trait breakdown", "Your highest and lowest of 5 traits"], ["Flaws to watch", "3 blind spots tied to your type"], ["Career paths that fit you", "4 career matches"], ["How you connect with people", "Your style in relationships"]].map((x) =>
        <div className="lk" key={x[0]}><i aria-hidden="true">&#128274;</i><div><b>{x[0]}</b><span>{x[1]}</span></div></div>)}
      <button className="btn pulse" onClick={reveal}>Reveal my archetype</button></div>}

    {view === "report" && rep && <div className="card">
      <p className="mu" style={{ margin: 0, textAlign: "center" }}>Your result</p>
      <div className="emb" style={{ background: rep.top.emblem[1] }}>{rep.top.emblem[0]}</div>
      <h1 className="res">{rep.top.name}</h1><p style={{ fontSize: "1.1rem", margin: "0 0 6px", textAlign: "center" }}>{rep.top.line}</p><p className="mu">{rep.top.about}</p>
      <h3>Your full profile</h3>{rep.profile.map((p, i) => <Row key={p.name} n={p.name} p={p.pct} top={!i} />)}
      <h3>Strengths</h3><List a={rep.top.strengths} />
      <button className="btn ghost" onClick={share}>Share your result</button>
      {rep.premium ? <>
        <h3>Trait breakdown</h3>{rep.premium.traits.map((t) => <Row key={t.name} n={t.name} p={t.pct} />)}
        <h3>Flaws to watch</h3><List a={rep.premium.flaws} />
        <h3>What to work on</h3><List a={rep.premium.growth} />
        <h3>In relationships</h3><p className="mu" style={{ margin: 0 }}>{rep.premium.rel}</p>
        <h3>Career paths that fit you</h3><List a={rep.premium.careers} />
        <p className="mu" style={{ fontSize: ".85rem", margin: "10px 0 0" }}>Suggestions only. They show where your style tends to fit, not what you can or cannot do.</p>
      </> : <div className="pay"><h3 style={{ marginTop: 0 }}>Unlock your full report</h3>
        {["Trait breakdown across 5 traits", `${rep.locked!.flaws} flaws to watch`, "What to work on", "How you connect with people", `${rep.locked!.careers} career paths that fit you`].map((x) => <div className="tip" key={x}><i>&#10003;</i><span>{x}</span></div>)}
        <button className="btn" onClick={buy}>Unlock full report &middot; ₹{PRICE}</button></div>}
      <p role="status" className="mu" style={{ fontSize: ".85rem", margin: "8px 0 0" }}>{msg}</p>
      <button className="btn ghost" onClick={() => { location.hash = ""; setView("intro"); }}>Retake test</button></div>}
  </>);
}
