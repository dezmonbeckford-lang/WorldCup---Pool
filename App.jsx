import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import GroupPicks from "./components/GroupPicks";
import Bracket from "./components/Bracket";
import Leaderboard from "./components/Leaderboard";
import AdminPanel from "./components/AdminPanel";
import "./index.css";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "admin@example.com";

export default function App() {
  const [session, setSession] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      supabase.from("profiles").select("*").eq("id", session.user.id).single()
        .then(({ data }) => setProfile(data));
    }
  }, [session]);

  if (loading) return (
    <div className="splash">
      <div className="splash-ball">⚽</div>
      <p>Loading...</p>
    </div>
  );

  if (!session) return <Auth />;

  const isAdmin = session.user.email === ADMIN_EMAIL;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-logo">⚽ <span>WorldPool</span></div>
        <nav className="topbar-nav">
          <button className={page === "dashboard" ? "active" : ""} onClick={() => setPage("dashboard")}>Home</button>
          <button className={page === "groups" ? "active" : ""} onClick={() => setPage("groups")}>Groups</button>
          <button className={page === "bracket" ? "active" : ""} onClick={() => setPage("bracket")}>Bracket</button>
          <button className={page === "leaderboard" ? "active" : ""} onClick={() => setPage("leaderboard")}>Standings</button>
          {isAdmin && <button className={page === "admin" ? "active" : ""} onClick={() => setPage("admin")}>Admin</button>}
        </nav>
        <button className="signout-btn" onClick={() => supabase.auth.signOut()}>Sign Out</button>
      </header>

      <main className="content">
        {page === "dashboard" && <Dashboard session={session} profile={profile} setPage={setPage} />}
        {page === "groups" && <GroupPicks session={session} />}
        {page === "bracket" && <Bracket session={session} />}
        {page === "leaderboard" && <Leaderboard session={session} />}
        {page === "admin" && isAdmin && <AdminPanel session={session} />}
      </main>
    </div>
  );
}
