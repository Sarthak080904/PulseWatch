import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Bell, Check, ChevronDown, CircleHelp, Clock3, Globe2, LayoutDashboard, LogOut, Plus, RefreshCw, Search, Settings2, ShieldCheck, Signal, Trash2, X } from "lucide-react";
import api, { login, logout, register } from "./api";

const emptyStats = { total_monitors: 0, up_monitors: 0, down_monitors: 0, open_incidents: 0, uptime_24h: 100, average_response_ms_24h: 0 };

function App() {
  const [token, setToken] = useState(localStorage.getItem("pulsewatch_token"));
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [authError, setAuthError] = useState("");
  const [monitors, setMonitors] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ name: "", url: "", http_method: "get", interval_seconds: 300, expected_status: 200 });

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [monitorResponse, overviewResponse, profileResponse] = await Promise.all([
        api.get("/monitors"), api.get("/overview"), api.get("/me")
      ]);
      setMonitors(monitorResponse.data);
      setStats(overviewResponse.data);
      setUser(profileResponse.data.user);
    } catch (e) {
      if (e.response?.status === 401) {
        logout(); setToken(null); setUser(null);
      } else setError(e.response?.data?.error || "Could not load monitoring data. Is the Rails API running?");
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = useMemo(() => monitors.filter(m => `${m.name} ${m.url}`.toLowerCase().includes(query.toLowerCase())), [monitors, query]);

  async function handleAuth(e) {
    e.preventDefault(); setAuthError("");
    try {
      if (authMode === "register") await register(email, password, confirmation);
      else await login(email, password);
      setToken(localStorage.getItem("pulsewatch_token"));
    } catch (err) {
      setAuthError(err.response?.data?.errors?.join(", ") || err.response?.data?.error || "Authentication failed. Check your details.");
    }
  }

  async function createMonitor(e) {
    e.preventDefault();
    try {
      await api.post("/monitors", { monitor: form });
      setShowCreate(false);
      setForm({ name: "", url: "", http_method: "get", interval_seconds: 300, expected_status: 200 });
      await refresh();
    } catch (e) { setError(e.response?.data?.errors?.join(", ") || "Unable to create monitor."); }
  }

  async function checkNow(id) {
    try { await api.post(`/monitors/${id}/check_now`); setError(""); }
    catch (e) { setError(e.response?.data?.error || "Could not queue health check."); }
  }

  async function deleteMonitor(id) {
    if (!confirm("Delete this monitor and its history?")) return;
    try { await api.delete(`/monitors/${id}`); await refresh(); }
    catch { setError("Could not delete monitor."); }
  }

  function signOut() { logout(); setToken(null); setUser(null); setMonitors([]); }

  if (!token) return <AuthScreen {...{authMode,setAuthMode,email,setEmail,password,setPassword,confirmation,setConfirmation,authError,handleAuth}} />;

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-line bg-[#0e1828] p-5 lg:flex lg:flex-col">
        <Brand />
        <div className="mt-12 space-y-2">
          <div className="nav-active"><LayoutDashboard size={17}/> Overview</div>
          <div className="nav-item"><Globe2 size={17}/> Monitors <span className="ml-auto text-xs text-slate-500">{monitors.length}</span></div>
          <div className="nav-item"><AlertTriangle size={17}/> Incidents <span className="ml-auto text-xs text-slate-500">{stats.open_incidents}</span></div>
          <div className="nav-item"><Bell size={17}/> Notifications</div>
        </div>
        <div className="mt-auto rounded-xl border border-line bg-panel p-4">
          <div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="text-mint" size={17}/> Monitoring active</div>
          <p className="mt-2 text-xs leading-5 text-slate-400">Your endpoints are checked automatically in the background.</p>
        </div>
        <button className="nav-item mt-4 w-full" onClick={signOut}><LogOut size={17}/> Sign out</button>
      </aside>

      <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:ml-64 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-mint">Workspace / Overview</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Good to see you<span className="text-mint">.</span></h1><p className="mt-1 text-sm text-slate-400">Here’s what’s happening with your APIs.</p></div>
          <div className="flex items-center gap-3">
            <button className="icon-button" title="Refresh" onClick={refresh}><RefreshCw size={17} className={loading ? "animate-spin" : ""}/></button>
            <div className="flex items-center gap-3 rounded-xl border border-line bg-panel px-3 py-2"><div className="avatar">{(user?.email || "U").slice(0,1).toUpperCase()}</div><div className="hidden sm:block"><p className="text-xs font-medium">{user?.email || "Loading account"}</p><p className="text-[11px] text-slate-500">Workspace owner</p></div><ChevronDown size={14} className="text-slate-500"/></div>
          </div>
        </header>

        {error && <div className="mt-6 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200"><AlertTriangle size={16}/>{error}<button className="ml-auto" onClick={() => setError("")}><X size={16}/></button></div>}

        <section className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total monitors" value={stats.total_monitors} icon={<Globe2/>} detail="Configured endpoints" />
          <StatCard title="Operational" value={stats.up_monitors} icon={<Check/>} tone="mint" detail="Currently responding" />
          <StatCard title="Open incidents" value={stats.open_incidents} icon={<AlertTriangle/>} tone="rose" detail="Need your attention" />
          <StatCard title="Avg. response time" value={`${stats.average_response_ms_24h} ms`} icon={<Clock3/>} detail="Last 24 hours" />
        </section>

        <section className="mt-5 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <div className="panel p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4"><div><p className="text-sm text-slate-400">24-hour uptime</p><p className="mt-2 text-4xl font-semibold tracking-tight">{Number(stats.uptime_24h).toFixed(2)}<span className="text-2xl text-mint">%</span></p><p className="mt-2 text-xs text-slate-500">Based on recorded health checks</p></div><div className="rounded-xl bg-mint/10 p-3 text-mint"><Activity size={22}/></div></div>
            <div className="mt-7 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-mint transition-all" style={{width:`${Math.max(0,Math.min(100,Number(stats.uptime_24h)))}%`}}/></div>
            <div className="mt-3 flex justify-between text-xs text-slate-500"><span>0% uptime</span><span>100% uptime</span></div>
          </div>
          <div className="panel p-5 sm:p-6"><div className="flex items-center justify-between"><p className="text-sm text-slate-400">System status</p><span className="status-pill"><span className="pulse-dot"/> Live overview</span></div><div className="mt-6 flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-full bg-mint/10 text-mint"><Signal size={22}/></div><div><p className="font-medium">Monitoring workspace</p><p className="mt-1 text-xs text-slate-500">{stats.down_monitors} endpoints currently down</p></div></div><div className="mt-5 border-t border-line pt-4 text-xs text-slate-400">Checks run through Sidekiq background workers.</div></div>
        </section>

        <section className="panel mt-5 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5 sm:px-6">
            <div><h2 className="font-semibold">Your monitors</h2><p className="mt-1 text-xs text-slate-500">Manage and inspect your API endpoints</p></div>
            <div className="flex flex-wrap gap-2"><label className="search-box"><Search size={15}/><input placeholder="Search monitors..." value={query} onChange={e=>setQuery(e.target.value)}/></label><button className="primary-button" onClick={()=>setShowCreate(true)}><Plus size={16}/> Add monitor</button></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-[#0e1828] text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-6 py-4 font-medium">Endpoint</th><th className="px-4 py-4 font-medium">Status</th><th className="px-4 py-4 font-medium">Interval</th><th className="px-4 py-4 font-medium">Last checked</th><th className="px-6 py-4 text-right font-medium">Actions</th></tr></thead>
              <tbody className="divide-y divide-line">
                {filtered.map(m=><tr key={m.id} className="table-row"><td className="px-6 py-4"><p className="font-medium">{m.name}</p><p className="mt-1 max-w-xs truncate text-xs text-slate-500">{m.url}</p></td><td className="px-4 py-4"><Status status={m.status}/></td><td className="px-4 py-4 text-slate-400">{m.interval_seconds/60} min</td><td className="px-4 py-4 text-xs text-slate-500">{m.last_checked_at ? new Date(m.last_checked_at).toLocaleString() : "Waiting for first check"}</td><td className="px-6 py-4"><div className="flex justify-end gap-2"><button className="icon-button" title="Check now" onClick={()=>checkNow(m.id)}><RefreshCw size={15}/></button><button className="icon-button danger" title="Delete monitor" onClick={()=>deleteMonitor(m.id)}><Trash2 size={15}/></button></div></td></tr>)}
                {!filtered.length && <tr><td colSpan="5" className="px-6 py-14 text-center"><div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-slate-800 text-slate-400"><Globe2 size={20}/></div><p className="mt-3 font-medium">No monitors yet</p><p className="mt-1 text-xs text-slate-500">Add an API endpoint to start monitoring.</p><button className="primary-button mx-auto mt-4" onClick={()=>setShowCreate(true)}><Plus size={15}/> Add your first monitor</button></td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        <footer className="flex flex-wrap justify-between gap-2 py-7 text-xs text-slate-600"><span>PulseWatch © {new Date().getFullYear()}</span><span className="flex items-center gap-2"><CircleHelp size={13}/> API monitoring, made clear.</span></footer>
      </main>

      {showCreate && <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setShowCreate(false)}><form onSubmit={createMonitor} className="modal-card"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Add API monitor</h2><p className="mt-1 text-xs text-slate-400">Configure an endpoint to check automatically.</p></div><button type="button" className="icon-button" onClick={()=>setShowCreate(false)}><X size={17}/></button></div><div className="mt-6 space-y-4"><Field label="Monitor name"><input required maxLength="100" placeholder="Production API" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field><Field label="Endpoint URL"><input required type="url" placeholder="https://api.example.com/health" value={form.url} onChange={e=>setForm({...form,url:e.target.value})}/></Field><div className="grid grid-cols-2 gap-3"><Field label="HTTP method"><select value={form.http_method} onChange={e=>setForm({...form,http_method:e.target.value})}>{["get","post","put","patch","delete"].map(v=><option key={v} value={v}>{v.toUpperCase()}</option>)}</select></Field><Field label="Expected status"><input type="number" min="100" max="599" value={form.expected_status} onChange={e=>setForm({...form,expected_status:Number(e.target.value)})}/></Field></div><Field label="Check interval"><select value={form.interval_seconds} onChange={e=>setForm({...form,interval_seconds:Number(e.target.value)})}>{[[60,"Every minute"],[300,"Every 5 minutes"],[600,"Every 10 minutes"],[900,"Every 15 minutes"],[1800,"Every 30 minutes"],[3600,"Every hour"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></Field></div><div className="mt-7 flex justify-end gap-2"><button type="button" className="secondary-button" onClick={()=>setShowCreate(false)}>Cancel</button><button className="primary-button" type="submit"><Plus size={15}/> Create monitor</button></div></form></div>}
    </div>
  );
}

function Brand(){return <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-[#07151a]"><Activity size={22}/></div><div><p className="font-semibold tracking-tight">PulseWatch</p><p className="text-[10px] uppercase tracking-[.18em] text-slate-500">API observability</p></div></div>}
function StatCard({title,value,icon,tone="blue",detail}){return <div className="panel p-5"><div className="flex items-center justify-between"><p className="text-sm text-slate-400">{title}</p><div className={`stat-icon ${tone}`}>{icon}</div></div><p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p><p className="mt-2 text-xs text-slate-500">{detail}</p></div>}
function Status({status}){const map={up:["Operational","good"],down:["Down","bad"],paused:["Paused","muted"],pending:["Pending","wait"]};const [label,style]=map[status]||map.pending;return <span className={`status-pill ${style}`}>{label}</span>}
function Field({label,children}){return <label className="block"><span className="mb-2 block text-xs font-medium text-slate-300">{label}</span>{children}</label>}
function AuthScreen(p){return <div className="grid min-h-screen bg-[#0b1220] text-slate-100 lg:grid-cols-2"><div className="hidden flex-col justify-between border-r border-line bg-[#0e1828] p-12 lg:flex"><Brand/><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-mint">Know before they do</p><h1 className="mt-5 max-w-lg text-5xl font-semibold leading-tight tracking-tight">Every endpoint.<br/>Under your watch.</h1><p className="mt-5 max-w-md leading-7 text-slate-400">One clear view of API uptime, response times, and incidents. Catch issues before your users do.</p></div><p className="text-xs text-slate-600">PulseWatch · API observability</p></div><div className="flex items-center justify-center p-6"><form onSubmit={p.handleAuth} className="w-full max-w-sm"><div className="mb-8 lg:hidden"><Brand/></div><p className="text-xs font-semibold uppercase tracking-[.2em] text-mint">Welcome to PulseWatch</p><h2 className="mt-3 text-3xl font-semibold">{p.authMode==="login"?"Sign in":"Create your account"}</h2><p className="mt-2 text-sm text-slate-400">{p.authMode==="login"?"Access your monitoring workspace.":"Start monitoring your APIs in minutes."}</p>{p.authError&&<div className="mt-5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{p.authError}</div>}<div className="mt-7 space-y-4"><Field label="Email address"><input required type="email" autoComplete="email" placeholder="you@company.com" value={p.email} onChange={e=>p.setEmail(e.target.value)}/></Field><Field label="Password"><input required type="password" minLength="8" autoComplete={p.authMode==="login"?"current-password":"new-password"} placeholder="At least 8 characters" value={p.password} onChange={e=>p.setPassword(e.target.value)}/></Field>{p.authMode==="register"&&<Field label="Confirm password"><input required type="password" minLength="8" value={p.confirmation} onChange={e=>p.setConfirmation(e.target.value)} placeholder="Repeat your password"/></Field>}</div><button className="primary-button mt-6 w-full justify-center py-3" type="submit">{p.authMode==="login"?"Sign in":"Create account"}</button><p className="mt-6 text-center text-sm text-slate-400">{p.authMode==="login"?"New to PulseWatch?":"Already have an account?"} <button type="button" className="font-medium text-mint hover:underline" onClick={()=>{p.setAuthMode(p.authMode==="login"?"register":"login");}}>{p.authMode==="login"?"Create account":"Sign in"}</button></p></form></div></div>}
export default App;
