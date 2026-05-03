import { useState, useEffect } from "react";
import { supabase } from "../App";

export default function Dashboard({ session, profile, setPage }) {
  const [stats, setStats] = useState({ totalPlayers: 0, myPoints: 0, myRank: 0 });
  const [settings, setSettings] = useState({ group_picks_open: true, bracket_open: false });

  useEffect(() => {
    loadStats();
    loadSettings();
  }, [session]);

  async function loadStats() {
    const { data: scores } = await supabase.from("scores").select("user_id, total_points").order("total_points", { ascending: false });
    if (!scores) return;
    const myScore = scores.find(s => s.user_id === session.user.id);
    const myRank = scores.findIndex(s => s.user_id === session.user.id) + 1;
    setStats({ totalPlayers: scores.length, myPoints: myScore?.total_points || 0, myRank: myRank || "-" });
  }

  async function loadSettings() {
    const { data } = await supabase.from("settings").select("*").single();
    if (data) setSettings(data);
  }

  const displayName = profile?.full_name || session.user.email.split("@")[0];

  return (
    <div>
      <div className="dash-hero">
        <h1>WORLD<span>POOL</span> <br/>2026</h1>
        <p>Welcome back, <strong>{displayName}</strong> ⚽</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num">{stats.myPoints}</div>
          <div className="stat-label">My Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.myRank === 0 ? "-" : `#${stats.myRank}`}</div>
          <div className="stat-label">My Rank</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.totalPlayers}</div>
          <div className="stat-label">Players</div>
        </div>
      </div>

      <div className="action-grid">
        <div className="action-card" onClick={() => setPage("groups")}
          style={!settings.group_picks_open ? { opacity: 0.5, pointerEvents: "none" } : {}}>
          <div className="icon">🏆</div>
          <h3>Group Picks</h3>
          <p>Pick which teams advance from each group</p>
          {settings.group_picks_open
            ? <span className="tag">Open Now</span>
            : <span className="tag red">Locked</span>}
        </div>
        <div className="action-card" onClick={() => setPage("bracket")}
          style={!settings.bracket_open ? { opacity: 0.5, pointerEvents: "none" } : {}}>
          <div className="icon">🗂️</div>
          <h3>Bracket</h3>
          <p>Fill out your knockout stage bracket</p>
          {settings.bracket_open
            ? <span className="tag">Open Now</span>
            : <span className="tag red">Locked</span>}
        </div>
        <div className="action-card" onClick={() => setPage("leaderboard")}>
          <div className="icon">📊</div>
          <h3>Standings</h3>
          <p>See where you rank against your friends</p>
        </div>
        <div className="action-card" style={{ cursor: "default" }}>
          <div className="icon">📋</div>
          <h3>How Points Work</h3>
          <p>Group advance: 3pts · Group winner: +2pts · Each round: 5→8→11→14→17→25</p>
        </div>
      </div>
    </div>
  );
}
