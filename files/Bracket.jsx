import { useState, useEffect } from "react";
import { supabase } from "../App";
import { ROUNDS } from "../data/worldcup";

// 32 teams in R32, bracket structure
const ROUND_SIZES = [32, 16, 8, 4, 2, 1];
const ROUND_NAMES = ["Round of 32", "Round of 16", "Quarterfinals", "Semifinals", "Final", "Champion"];

export default function Bracket({ session }) {
  const [picks, setPicks] = useState({}); // { "r32_m1": "teamId", ... }
  const [advancers, setAdvancers] = useState([]); // teams that made it from groups (admin set)
  const [locked, setLocked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeRound, setActiveRound] = useState(0);

  useEffect(() => {
    checkSettings();
    loadBracketPicks();
    loadAdvancers();
  }, [session]);

  async function checkSettings() {
    const { data } = await supabase.from("settings").select("bracket_open").single();
    setLocked(data && !data.bracket_open);
  }

  async function loadAdvancers() {
    const { data } = await supabase.from("bracket_advancers").select("*");
    setAdvancers(data || []);
    setLoading(false);
  }

  async function loadBracketPicks() {
    const { data } = await supabase.from("bracket_picks").select("*").eq("user_id", session.user.id);
    if (data) {
      const p = {};
      data.forEach(row => { p[row.matchup_key] = row.team_id; });
      setPicks(p);
    }
  }

  function pickWinner(roundIdx, matchIdx, teamId) {
    if (locked) return;
    const key = `r${roundIdx}_m${matchIdx}`;
    setPicks(prev => ({ ...prev, [key]: teamId }));
    setSaved(false);
  }

  async function savePicks() {
    setSaving(true);
    const rows = Object.entries(picks).map(([matchup_key, team_id]) => ({
      user_id: session.user.id,
      matchup_key,
      team_id,
    }));
    await supabase.from("bracket_picks").upsert(rows, { onConflict: "user_id,matchup_key" });
    setSaved(true);
    setSaving(false);
  }

  // Build matchups for a round based on previous picks
  function getMatchups(roundIdx) {
    const matchCount = ROUND_SIZES[roundIdx] / 2;
    const matchups = [];
    for (let i = 0; i < matchCount; i++) {
      let teamA, teamB;
      if (roundIdx === 0) {
        // R32: use advancers seeded by admin
        teamA = advancers[i * 2] || null;
        teamB = advancers[i * 2 + 1] || null;
      } else {
        // Later rounds: use picks from previous round
        const prevA_key = `r${roundIdx - 1}_m${i * 2}`;
        const prevB_key = `r${roundIdx - 1}_m${i * 2 + 1}`;
        const prevA_id = picks[prevA_key];
        const prevB_id = picks[prevB_key];
        teamA = advancers.find(a => a.team_id === prevA_id) || (prevA_id ? { team_id: prevA_id, team_name: prevA_id, flag: "🏳️" } : null);
        teamB = advancers.find(a => a.team_id === prevB_id) || (prevB_id ? { team_id: prevB_id, team_name: prevB_id, flag: "🏳️" } : null);
      }
      matchups.push({ i, teamA, teamB });
    }
    return matchups;
  }

  if (locked) return (
    <div className="bracket-locked">
      <div className="lock-icon">🔒</div>
      <h2>Bracket Locked</h2>
      <p style={{ color: "var(--text2)", maxWidth: 400, margin: "0 auto" }}>
        The bracket will open once the group stage is complete. You'll get a notification when it's time to fill out your picks!
      </p>
    </div>
  );

  if (loading) return <div className="empty-state"><div className="icon">⏳</div><p>Loading bracket...</p></div>;

  if (advancers.length === 0) return (
    <div className="bracket-locked">
      <div className="lock-icon">⏳</div>
      <h2>Setting Up Bracket</h2>
      <p style={{ color: "var(--text2)" }}>The admin is seeding the bracket. Check back soon!</p>
    </div>
  );

  const maxRound = 5; // 0=R32 through 5=Champion
  const matchups = getMatchups(activeRound);
  const champion = activeRound === 5 ? picks[`r4_m0`] : null;

  return (
    <div>
      <div className="page-title">🗂️ <span>Bracket</span> Picks</div>

      <div className="round-tabs">
        {ROUND_NAMES.slice(0, 6).map((name, idx) => (
          <button
            key={idx}
            className={`round-tab ${activeRound === idx ? "active" : ""}`}
            onClick={() => setActiveRound(idx)}
          >
            {name}
          </button>
        ))}
      </div>

      {activeRound === 5 ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2 }}>Your Champion</h2>
          {champion ? (
            <div style={{ marginTop: 16, fontSize: 20, fontWeight: 700 }}>
              {advancers.find(a => a.team_id === champion)?.flag} {advancers.find(a => a.team_id === champion)?.team_name || champion}
            </div>
          ) : (
            <p style={{ color: "var(--text2)", marginTop: 8 }}>Complete the Final round to set your champion!</p>
          )}
        </div>
      ) : (
        matchups.map(({ i, teamA, teamB }) => {
          const key = `r${activeRound}_m${i}`;
          const winner = picks[key];
          return (
            <div className="matchup-card" key={i}>
              <div className="matchup-label">Match {i + 1}</div>
              <div className="matchup-teams">
                {[teamA, teamB].map((team, ti) => {
                  if (!team) return (
                    <div key={ti} className="matchup-team tbd">TBD — complete previous round</div>
                  );
                  const isWinner = winner === team.team_id;
                  return (
                    <div
                      key={ti}
                      className={`matchup-team ${isWinner ? "winner" : ""}`}
                      onClick={() => pickWinner(activeRound, i, team.team_id)}
                    >
                      <span style={{ fontSize: 22 }}>{team.flag}</span>
                      <span style={{ flex: 1, fontWeight: 600 }}>{team.team_name}</span>
                      {isWinner && <span>✅</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      <div className="save-bar">
        <span style={{ color: "var(--text2)", fontSize: 14 }}>
          {saved ? "✅ Bracket saved!" : "Pick a winner for each matchup"}
        </span>
        <button className="btn btn-primary" onClick={savePicks} disabled={saving}>
          {saving ? "Saving..." : "💾 Save Bracket"}
        </button>
      </div>
    </div>
  );
}
