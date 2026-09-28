import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase config (publishable key is safe in the browser; RLS protects data) ──
const SUPABASE_URL = "https://erkquxslgyqnygcgmxnl.supabase.co";
const SUPABASE_KEY = "sb_publishable_ybxXLiEExXyXu8KVJObDAA_wwTt_KIc";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── helpers ──────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return "Date TBA";
  return new Date(d).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
}
function playerCount(t) {
  return t.participants && t.participants[0] ? t.participants[0].count : 0;
}
const STATUS_LABEL = { open: "Open", live: "Live", finished: "Finished" };

// ── styles ───────────────────────────────────────────────────────
const css = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#070A09; --panel:#0D1310; --card:#121B17; --ink:#EAF6EF; --soft:#8FA99C;
  --green:#22E88C; --green-d:#17C275; --red:#FF4D5E; --gold:#FFC53D; --line:rgba(34,232,140,.22);
}
body{
  font-family:'Chakra Petch',sans-serif; background:var(--bg); color:var(--ink); min-height:100vh;
  background-image:radial-gradient(circle at 12% 0%,rgba(34,232,140,.13),transparent 42%),radial-gradient(circle at 92% 28%,rgba(6,182,212,.09),transparent 42%);
  background-attachment:fixed;
}
button{font-family:inherit;cursor:pointer;}
input,select,textarea{font-family:inherit;}
.mono{font-family:'JetBrains Mono',monospace;}

.nav{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:12px 18px;background:rgba(6,9,8,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);}
.logo{font-weight:700;font-size:1.7rem;letter-spacing:-.5px;text-transform:uppercase;text-shadow:0 0 18px rgba(34,232,140,.4);}
.logo span{color:var(--green);}
.navr{display:flex;align-items:center;gap:8px;}
.me{font-size:.85rem;font-weight:600;display:flex;align-items:center;gap:6px;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.adm{font-size:.6rem;background:var(--gold);color:#1a1300;padding:2px 6px;border-radius:3px;letter-spacing:.06em;}

.btn{padding:10px 18px;background:linear-gradient(90deg,var(--green),var(--green-d));color:#03130B;border:none;border-radius:6px;font-weight:700;font-size:.85rem;text-transform:uppercase;letter-spacing:.03em;box-shadow:0 0 18px rgba(34,232,140,.3);transition:transform .15s,box-shadow .2s;}
.btn:hover{transform:translateY(-1px);box-shadow:0 4px 24px rgba(34,232,140,.5);}
.btn:disabled{opacity:.55;cursor:not-allowed;transform:none;}
.btn-ghost{padding:9px 14px;background:transparent;color:var(--ink);border:1px solid var(--line);border-radius:6px;font-weight:600;font-size:.8rem;transition:border-color .2s;}
.btn-ghost:hover{border-color:var(--green);}
.btn-danger{padding:9px 14px;background:transparent;color:var(--red);border:1px solid rgba(255,77,94,.5);border-radius:6px;font-weight:600;font-size:.8rem;}
.btn-sm{padding:6px 12px;font-size:.72rem;}

.hero{padding:34px 18px 22px;text-align:center;}
.eyebrow{font-family:'JetBrains Mono',monospace;font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:var(--green);margin-bottom:10px;}
.hero h1{font-size:clamp(2rem,8vw,3.2rem);line-height:1.05;text-transform:uppercase;font-weight:700;letter-spacing:-1px;margin-bottom:10px;}
.hero h1 em{font-style:normal;color:var(--green);text-shadow:0 0 24px rgba(34,232,140,.5);}
.hero p{color:var(--soft);max-width:420px;margin:0 auto 18px;line-height:1.55;font-size:.95rem;}

.tabs{display:flex;gap:8px;max-width:520px;margin:0 auto;padding:0 18px;}
.tab{flex:1;padding:11px 0;background:var(--panel);color:var(--ink);border:1px solid var(--line);border-radius:6px;font-weight:700;font-size:.8rem;text-transform:uppercase;letter-spacing:.03em;transition:background .2s,color .2s;}
.tab.active{background:var(--green);color:#03130B;border-color:var(--green);box-shadow:0 0 20px rgba(34,232,140,.35);}

.main{max-width:900px;margin:0 auto;padding:22px 18px 70px;}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;align-items:center;}
.chip{padding:6px 14px;border-radius:100px;background:transparent;color:var(--soft);border:1px solid var(--line);font-size:.75rem;font-weight:600;}
.chip.active{color:#03130B;background:var(--green);border-color:var(--green);}
.spacer{flex:1;}

.grid{display:grid;grid-template-columns:1fr;gap:14px;}
@media(min-width:620px){.grid{grid-template-columns:1fr 1fr;}}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:18px;cursor:pointer;transition:transform .15s,box-shadow .25s,border-color .2s;}
.card:hover{transform:translateY(-3px);border-color:var(--green);box-shadow:0 10px 30px rgba(34,232,140,.16);}
.card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px;}
.game{font-family:'JetBrains Mono',monospace;font-size:.72rem;color:var(--green);text-transform:uppercase;letter-spacing:.08em;}
.title{font-size:1.15rem;font-weight:700;line-height:1.2;margin:2px 0 10px;}
.badge{font-family:'JetBrains Mono',monospace;font-size:.62rem;font-weight:600;padding:3px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;}
.b-open{background:rgba(34,232,140,.15);color:var(--green);border:1px solid var(--green);}
.b-live{background:rgba(255,77,94,.15);color:var(--red);border:1px solid var(--red);animation:pulse 1.6s infinite;}
.b-finished{background:rgba(143,169,156,.12);color:var(--soft);border:1px solid var(--soft);}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.55;}}
.meta{font-size:.8rem;color:var(--soft);margin-bottom:6px;}
.bar{height:5px;background:rgba(255,255,255,.08);border-radius:5px;overflow:hidden;margin:10px 0 6px;}
.bar i{display:block;height:100%;background:linear-gradient(90deg,var(--green),#06B6D4);}
.card-foot{display:flex;justify-content:space-between;align-items:center;margin-top:10px;}

.empty{text-align:center;padding:60px 20px;color:var(--soft);}
.empty h3{color:var(--ink);text-transform:uppercase;margin-bottom:6px;font-size:1.05rem;}
.spinner{width:32px;height:32px;border:3px solid var(--line);border-top-color:var(--green);border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 12px;}
@keyframes spin{to{transform:rotate(360deg);}}

.overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);backdrop-filter:blur(3px);z-index:100;display:flex;align-items:flex-end;justify-content:center;animation:fade .2s;}
@media(min-width:620px){.overlay{align-items:center;padding:20px;}}
@keyframes fade{from{opacity:0;}to{opacity:1;}}
@keyframes up{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
.modal{background:var(--panel);border:1px solid var(--line);border-radius:14px 14px 0 0;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;padding:24px 20px 28px;animation:up .28s cubic-bezier(.22,1,.36,1);box-shadow:0 0 60px rgba(34,232,140,.14);}
@media(min-width:620px){.modal{border-radius:14px;}}
.close{float:right;width:32px;height:32px;background:transparent;border:1px solid var(--line);border-radius:6px;color:var(--ink);font-size:1.1rem;}
.modal h2{font-size:1.4rem;text-transform:uppercase;margin-bottom:4px;}
.desc{color:var(--soft);line-height:1.6;font-size:.9rem;margin:12px 0;white-space:pre-wrap;}
.section-label{font-family:'JetBrains Mono',monospace;font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--green);margin:20px 0 8px;}
.row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;background:var(--card);border:1px solid transparent;margin-bottom:6px;}
.row.mine{border-color:var(--green);}
.rank{width:30px;font-family:'JetBrains Mono',monospace;font-weight:600;color:var(--soft);text-align:center;}
.rank.r1{color:var(--gold);} .rank.r2{color:#C9D1D9;} .rank.r3{color:#D08A4E;}
.pname{flex:1;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.pts{font-family:'JetBrains Mono',monospace;font-weight:600;color:var(--green);}
.pts-input{width:64px;padding:6px 8px;background:var(--bg);border:1px solid var(--line);border-radius:6px;color:var(--ink);font-family:'JetBrains Mono',monospace;}
.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;}

.field{display:flex;flex-direction:column;gap:5px;margin-bottom:14px;}
.label{font-size:.78rem;font-weight:600;color:var(--soft);text-transform:uppercase;letter-spacing:.04em;}
.input{width:100%;padding:12px 14px;background:var(--bg);border:1px solid var(--line);border-radius:8px;color:var(--ink);font-size:.95rem;outline:none;}
.input:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(34,232,140,.15);}
textarea.input{min-height:90px;resize:vertical;line-height:1.5;}
select.input{appearance:auto;}
.error{margin:4px 0 12px;padding:10px 12px;background:rgba(255,77,94,.12);border:1px solid rgba(255,77,94,.5);border-radius:8px;color:#FF9AA4;font-size:.85rem;}
.switch{text-align:center;margin-top:14px;font-size:.85rem;color:var(--soft);}
.switch button{background:none;border:none;color:var(--green);font-weight:700;font-size:.85rem;}
.form-card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:22px 18px;}
.form-card h2{text-transform:uppercase;margin-bottom:4px;font-size:1.3rem;}
.two{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

.toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(90px);background:var(--green);color:#03130B;padding:12px 20px;border-radius:8px;font-weight:700;font-size:.85rem;z-index:300;transition:transform .3s cubic-bezier(.34,1.56,.64,1);pointer-events:none;max-width:90vw;text-align:center;}
.toast.show{transform:translateX(-50%) translateY(0);}
.foot{text-align:center;color:var(--soft);font-size:.75rem;padding:20px;border-top:1px solid var(--line);}
`;

// ── Auth modal ───────────────────────────────────────────────────
function AuthModal({ onClose, notify }) {
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tag, setTag] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError("Enter a valid email address."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (mode === "signup" && !/^[A-Za-z0-9_]{3,20}$/.test(tag)) {
      setError("Gamer tag must be 3-20 characters: letters, numbers or underscores.");
      return;
    }
    setBusy(true);
    if (mode === "signup") {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { gamer_tag: tag } },
      });
      setBusy(false);
      if (err) {
        setError(/database error/i.test(err.message) ? "That gamer tag is already taken. Try another." : err.message);
        return;
      }
      if (!data.session) {
        setError("Account created. Check your email to confirm it, then log in.");
        return;
      }
      notify("Welcome to ArenaNG, " + tag + "!");
      onClose();
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (err) { setError(err.message); return; }
      notify("Logged in. Let's play.");
      onClose();
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="close" onClick={onClose}>×</button>
        <h2>{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
        <p className="desc" style={{ marginTop: 6 }}>
          {mode === "signup" ? "Pick a gamer tag and join the arena." : "Log in to join tournaments."}
        </p>
        {mode === "signup" && (
          <div className="field">
            <label className="label">Gamer tag</label>
            <input className="input" placeholder="e.g. Shadow_King" value={tag} onChange={(e) => setTag(e.target.value)} />
          </div>
        )}
        <div className="field">
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn" style={{ width: "100%", padding: 14 }} onClick={submit} disabled={busy}>
          {busy ? "Please wait…" : mode === "signup" ? "Sign up" : "Log in"}
        </button>
        <div className="switch">
          {mode === "signup" ? "Already have an account? " : "New here? "}
          <button onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }}>
            {mode === "signup" ? "Log in" : "Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tournament card ──────────────────────────────────────────────
function TournamentCard({ t, joined, onOpen, onJoin, onLeave }) {
  const count = playerCount(t);
  const pct = Math.min(100, Math.round((count / t.max_players) * 100));
  const full = count >= t.max_players;
  return (
    <div className="card" onClick={() => onOpen(t.id)}>
      <div className="card-top">
        <div className="game">{t.game}</div>
        <span className={"badge b-" + t.status}>{STATUS_LABEL[t.status]}</span>
      </div>
      <div className="title">{t.title}</div>
      <div className="meta">🗓 {fmtDate(t.starts_at)}</div>
      <div className="bar"><i style={{ width: pct + "%" }} /></div>
      <div className="meta mono">{count} / {t.max_players} players</div>
      <div className="card-foot">
        <span className="meta">{joined ? "✓ You're in" : full ? "Full" : ""}</span>
        {t.status === "open" && (
          joined ? (
            <button className="btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); onLeave(t); }}>Leave</button>
          ) : (
            <button className="btn btn-sm" disabled={full} onClick={(e) => { e.stopPropagation(); onJoin(t); }}>
              {full ? "Full" : "Join"}
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ── Tournament detail ────────────────────────────────────────────
function TournamentDetail({ t, userId, joined, isAdmin, onClose, onJoin, onLeave, reload, notify }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState({});

  const loadPlayers = useCallback(async () => {
    const { data, error } = await supabase
      .from("participants")
      .select("player_id, points, profiles(gamer_tag)")
      .eq("tournament_id", t.id)
      .order("points", { ascending: false });
    if (!error) setPlayers(data || []);
    setLoading(false);
  }, [t.id]);

  useEffect(() => { loadPlayers(); }, [loadPlayers, t.status]);

  const savePoints = async (playerId) => {
    const val = parseInt(edits[playerId], 10);
    if (Number.isNaN(val) || val < 0) { notify("Enter a valid points number."); return; }
    const { error } = await supabase
      .from("participants")
      .update({ points: val })
      .eq("tournament_id", t.id)
      .eq("player_id", playerId);
    if (error) { notify("Couldn't save points."); return; }
    notify("Points saved.");
    setEdits((prev) => { const n = { ...prev }; delete n[playerId]; return n; });
    loadPlayers();
  };

  const setStatus = async (status) => {
    const { error } = await supabase.from("tournaments").update({ status }).eq("id", t.id);
    if (error) { notify("Couldn't update status."); return; }
    notify("Status set to " + STATUS_LABEL[status] + ".");
    reload();
  };

  const remove = async () => {
    if (!window.confirm("Delete this tournament and all its results?")) return;
    const { error } = await supabase.from("tournaments").delete().eq("id", t.id);
    if (error) { notify("Couldn't delete."); return; }
    notify("Tournament deleted.");
    onClose();
    reload();
  };

  const count = playerCount(t);
  const full = count >= t.max_players;

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="close" onClick={onClose}>×</button>
        <div className="game">{t.game}</div>
        <h2>{t.title}</h2>
        <div className="actions" style={{ marginTop: 8 }}>
          <span className={"badge b-" + t.status}>{STATUS_LABEL[t.status]}</span>
          <span className="badge b-finished">{t.format === "bracket" ? "Bracket" : "Points"}</span>
        </div>
        {t.description && <p className="desc">{t.description}</p>}
        <div className="meta">🗓 {fmtDate(t.starts_at)}</div>
        <div className="meta mono">{count} / {t.max_players} players</div>

        <div className="actions">
          {t.status === "open" ? (
            joined ? (
              <button className="btn-ghost" onClick={() => onLeave(t)}>Leave tournament</button>
            ) : (
              <button className="btn" disabled={full} onClick={() => onJoin(t)}>{full ? "Tournament full" : "Join tournament"}</button>
            )
          ) : (
            <span className="meta">Registration is closed.</span>
          )}
        </div>

        <div className="section-label">Players &amp; points</div>
        {loading ? (
          <div className="empty"><div className="spinner" /></div>
        ) : players.length === 0 ? (
          <div className="meta">No players yet. Be the first to join.</div>
        ) : (
          players.map((p, i) => (
            <div key={p.player_id} className={"row" + (p.player_id === userId ? " mine" : "")}>
              <div className={"rank" + (i < 3 ? " r" + (i + 1) : "")}>{i + 1}</div>
              <div className="pname">{p.profiles ? p.profiles.gamer_tag : "Player"}</div>
              {isAdmin ? (
                <>
                  <input
                    className="pts-input"
                    type="number"
                    min="0"
                    value={edits[p.player_id] !== undefined ? edits[p.player_id] : p.points}
                    onChange={(e) => setEdits((prev) => ({ ...prev, [p.player_id]: e.target.value }))}
                  />
                  <button className="btn btn-sm" onClick={() => savePoints(p.player_id)}>Save</button>
                </>
              ) : (
                <div className="pts">{p.points} pts</div>
              )}
            </div>
          ))
        )}

        {isAdmin && (
          <>
            <div className="section-label">Admin controls</div>
            <div className="actions">
              {t.status !== "open" && <button className="btn-ghost" onClick={() => setStatus("open")}>Reopen</button>}
              {t.status !== "live" && <button className="btn-ghost" onClick={() => setStatus("live")}>Start (Live)</button>}
              {t.status !== "finished" && <button className="btn-ghost" onClick={() => setStatus("finished")}>Finish</button>}
              <button className="btn-danger" onClick={remove}>Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Leaderboard ──────────────────────────────────────────────────
function Leaderboard({ userId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
       .order("total_points", { ascending: false })
      .order("tournaments_played", { ascending: false })
      .limit(100);
    if (error) setErr("Couldn't load the leaderboard.");
    else setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="empty"><div className="spinner" /><p>Loading rankings…</p></div>;
  if (err) return <div className="empty"><h3>Something went wrong</h3><p>{err}</p></div>;
  if (rows.length === 0) return <div className="empty"><h3>No players yet</h3><p>Sign up and be the first on the board.</p></div>;

  return (
    <div>
      <div className="chips">
        <span className="meta mono">{rows.length} PLAYER{rows.length !== 1 ? "S" : ""} RANKED</span>
        <span className="spacer" />
        <button className="chip" onClick={load}>↻ Refresh</button>
      </div>
      {rows.map((r, i) => (
        <div key={r.id} className={"row" + (r.id === userId ? " mine" : "")}>
          <div className={"rank" + (i < 3 ? " r" + (i + 1) : "")}>{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</div>
          <div className="pname">{r.gamer_tag}</div>
          <div className="meta mono" style={{ margin: 0 }}>{r.tournaments_played} played</div>
          <div className="pts">{r.total_points} pts</div>
        </div>
      ))}
    </div>
  );
}

// ── Admin: create tournament ─────────────────────────────────────
function AdminPanel({ onCreated, notify }) {
  const blank = { title: "", game: "", description: "", format: "points", max_players: 32, starts_at: "" };
  const [f, setF] = useState(blank);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const create = async () => {
    setErr("");
    if (f.title.trim().length < 3) { setErr("Give the tournament a title."); return; }
    if (!f.game.trim()) { setErr("Which game is it for?"); return; }
    const max = parseInt(f.max_players, 10);
    if (!(max >= 2 && max <= 1000)) { setErr("Max players must be between 2 and 1000."); return; }
    setBusy(true);
    const { error } = await supabase.from("tournaments").insert({
      title: f.title.trim(),
      game: f.game.trim(),
      description: f.description.trim() || null,
      format: f.format,
      max_players: max,
      starts_at: f.starts_at ? new Date(f.starts_at).toISOString() : null,
    });
    setBusy(false);
    if (error) { setErr("Couldn't create the tournament. Are you signed in as admin?"); return; }
    setF(blank);
    notify("Tournament created!");
    onCreated();
  };

  return (
    <div className="form-card">
      <h2>Create a tournament</h2>
      <p className="desc" style={{ marginTop: 4 }}>Players can join as soon as it's open.</p>
      <div className="field">
        <label className="label">Title</label>
        <input className="input" placeholder="e.g. Friday Night Showdown" value={f.title} onChange={set("title")} />
      </div>
      <div className="field">
        <label className="label">Game</label>
        <input className="input" placeholder="e.g. eFootball, CoD Mobile" value={f.game} onChange={set("game")} />
      </div>
      <div className="field">
        <label className="label">Description (optional)</label>
        <textarea className="input" placeholder="Rules, prizes, how to submit results…" value={f.description} onChange={set("description")} />
      </div>
      <div className="two">
        <div className="field">
          <label className="label">Format</label>
          <select className="input" value={f.format} onChange={set("format")}>
            <option value="points">Points leaderboard</option>
            <option value="bracket" disabled>Bracket (coming soon)</option>
          </select>
        </div>
        <div className="field">
          <label className="label">Max players</label>
          <input className="input" type="number" min="2" max="1000" value={f.max_players} onChange={set("max_players")} />
        </div>
      </div>
      <div className="field">
        <label className="label">Starts at (optional)</label>
        <input className="input" type="datetime-local" value={f.starts_at} onChange={set("starts_at")} />
      </div>
      {err && <div className="error">{err}</div>}
      <button className="btn" style={{ width: "100%", padding: 14 }} onClick={create} disabled={busy}>
        {busy ? "Creating…" : "Create tournament"}
      </button>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState("tournaments");
  const [filter, setFilter] = useState("all");
  const [tournaments, setTournaments] = useState([]);
  const [loadingT, setLoadingT] = useState(true);
  const [errT, setErrT] = useState("");
  const [joined, setJoined] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });

  const userId = session && session.user ? session.user.id : null;

  const notify = useCallback((msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg }), 3200);
  }, []);

  // session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // profile + admin flag
  useEffect(() => {
    if (!userId) { setProfile(null); setIsAdmin(false); return; }
    let cancelled = false;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("gamer_tag").eq("id", userId).maybeSingle();
      const { data: a } = await supabase.from("admins").select("user_id").eq("user_id", userId).maybeSingle();
      if (!cancelled) { setProfile(p); setIsAdmin(!!a); }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const loadTournaments = useCallback(async () => {
    setLoadingT(true);
    setErrT("");
    const { data, error } = await supabase
      .from("tournaments")
      .select("*, participants(count)")
      .order("created_at", { ascending: false });
    if (error) setErrT("Couldn't load tournaments.");
    else setTournaments(data || []);
    setLoadingT(false);
  }, []);

  const loadJoined = useCallback(async () => {
    if (!userId) { setJoined([]); return; }
    const { data } = await supabase.from("participants").select("tournament_id").eq("player_id", userId);
    setJoined((data || []).map((r) => r.tournament_id));
  }, [userId]);

  useEffect(() => { loadTournaments(); }, [loadTournaments]);
  useEffect(() => { loadJoined(); }, [loadJoined]);

  const join = async (t) => {
    if (!userId) { setShowAuth(true); return; }
    const { error } = await supabase.from("participants").insert({ tournament_id: t.id, player_id: userId });
    if (error) { notify("Couldn't join. It may be full or closed."); return; }
    notify("You're in! Good luck.");
    await Promise.all([loadTournaments(), loadJoined()]);
  };

  const leave = async (t) => {
    const { error } = await supabase
      .from("participants")
      .delete()
      .eq("tournament_id", t.id)
      .eq("player_id", userId);
    if (error) { notify("Couldn't leave the tournament."); return; }
    notify("You left the tournament.");
    await Promise.all([loadTournaments(), loadJoined()]);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setView("tournaments");
    notify("Logged out.");
  };

  const selected = tournaments.find((t) => t.id === selectedId) || null;
  const shown = tournaments.filter((t) => filter === "all" || t.status === filter);

  return (
    <>
      <style>{css}</style>

      <nav className="nav">
        <div className="logo">Arena<span>NG</span></div>
        <div className="navr">
          {userId ? (
            <>
              <span className="me">{profile ? profile.gamer_tag : "Player"}{isAdmin && <b className="adm">ADMIN</b>}</span>
              <button className="btn-ghost btn-sm" onClick={logout}>Log out</button>
            </>
          ) : (
            <button className="btn btn-sm" onClick={() => setShowAuth(true)}>Log in</button>
          )}
        </div>
      </nav>

      <header className="hero">
        <div className="eyebrow">Nigerian gaming arena</div>
        <h1>Compete. Climb. <em>Get ranked.</em></h1>
        <p>Join tournaments in your favourite games, earn points, and take your spot on the national leaderboard.</p>
        {!userId && <button className="btn" onClick={() => setShowAuth(true)}>Create your gamer tag</button>}
      </header>

      <div className="tabs">
        <button className={"tab" + (view === "tournaments" ? " active" : "")} onClick={() => setView("tournaments")}>Tournaments</button>
        <button className={"tab" + (view === "leaderboard" ? " active" : "")} onClick={() => setView("leaderboard")}>Leaderboard</button>
        {isAdmin && <button className={"tab" + (view === "admin" ? " active" : "")} onClick={() => setView("admin")}>Admin</button>}
      </div>

      <main className="main">
        {view === "tournaments" && (
          <>
            <div className="chips">
              {["all", "open", "live", "finished"].map((f) => (
                <button key={f} className={"chip" + (filter === f ? " active" : "")} onClick={() => setFilter(f)}>
                  {f === "all" ? "All" : STATUS_LABEL[f]}
                </button>
              ))}
              <span className="spacer" />
              <button className="chip" onClick={loadTournaments}>↻ Refresh</button>
            </div>
            {loadingT ? (
              <div className="empty"><div className="spinner" /><p>Loading tournaments…</p></div>
            ) : errT ? (
              <div className="empty"><h3>Something went wrong</h3><p>{errT}</p><button className="btn" style={{ marginTop: 14 }} onClick={loadTournaments}>Try again</button></div>
            ) : shown.length === 0 ? (
              <div className="empty">
                <h3>No tournaments here yet</h3>
                <p>{isAdmin ? "Create one from the Admin tab." : "Check back soon, new tournaments are on the way."}</p>
              </div>
            ) : (
              <div className="grid">
                {shown.map((t) => (
                  <TournamentCard
                    key={t.id}
                    t={t}
                    joined={joined.includes(t.id)}
                    onOpen={setSelectedId}
                    onJoin={join}
                    onLeave={leave}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {view === "leaderboard" && <Leaderboard userId={userId} />}

        {view === "admin" && isAdmin && (
          <AdminPanel notify={notify} onCreated={() => { loadTournaments(); setView("tournaments"); }} />
        )}
      </main>

      <div className="foot">ArenaNG · Built in Nigeria for Nigerian gamers</div>

      {selected && (
        <TournamentDetail
          t={selected}
          userId={userId}
          joined={joined.includes(selected.id)}
          isAdmin={isAdmin}
          onClose={() => setSelectedId(null)}
          onJoin={join}
          onLeave={leave}
          reload={loadTournaments}
          notify={notify}
        />
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} notify={notify} />}

      <div className={"toast" + (toast.show ? " show" : "")}>{toast.msg}</div>
    </>
  );
}
