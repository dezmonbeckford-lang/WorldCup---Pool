import { useState, useEffect } from "react";
import { supabase } from "../App";
import { GROUPS, POINTS } from "../data/worldcup";

export default function AdminPanel({ session }) {
  const [settings, setSettings] = useState({ group_picks_open: true, bracket_open: false });
  const [groupResults, setGroupResults] = useState({}); // { A: [id, id] }
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadSettings();
    loadResults();
  }, []);

  async function loadSettings() {
    const { data } = await supabase.from("settings").select("*").single();
    if (data) setSettings(data);
  }

  async function loadResults() {
    const { data } = await supabase.from("group_results").select("*");
    const r = {};
    if (data) data.forEach(row => {
      r[row.group_id] = [row.first_place, row.second_place].filter(Boolean);
    });
    setGroupResults(r);
  }

  async function saveSettings() {
    setSaving(true);
    await supabase.from("settings").upsert({ id: 1, ...settings });
    setMsg("✅ Settings saved!");
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  function toggleResult(groupId, teamId) {
    setGroupResults(prev => {
      const cur = prev[groupId] || [];
      if (cur.includes(teamId)) return { ...prev, [groupId]: cur.filter(t => t !== teamId) };
      if (cur.length >= 2) return { ...prev, [groupId]: [cur[0], teamId] };
      return { ...prev, [groupId]: [...cur, teamId] };
    });
  }

  async function saveGroupResults() {
    setSaving(true);
    const rows = Object.entries(groupResults).map(([group_id, teams]) => ({
      group_id,
      first_place: teams[0] || null,
      second_place: teams[1] || null,
    }));
    await supabase.from("group_results").upsert(rows, { onConflict: "group_id" });

    // Now score all users' group picks
    await scoreGroupPicks();
    setMsg("✅ Results saved & points calculated!");
    setSaving(false);
    setTimeout(() => setMsg(""), 4000);
  }

  async function scoreGroupPicks() {
    const { data: allPicks } = await supabase.from("group_picks").select("*");
    if (!allPicks) return;

    const userPoints = {}; // user_id -> points

    for (const pick of allPicks) {
      const result = groupResults[pick.group_id] || [];
      let pts = 0;
      if (result.includes(pick.first_place)) {
        pts += POINTS.group_correct_advance;
        if (result[0] === pick.first_place) pts += POINTS.group_correct_1st;
      }
      if (result.includes(pick.second_place)) {
        pts += POINTS.group_correct_advance;
      }
      userPoints[pick.user_id] = (userPoints[pick.user_id] || 0) + pts;
    }

    // Upsert scores
    const scoreRows = Object.entries(userPoints).map(([user_id, group_points]) => ({
      user_id,
      group_points,
      bracket_points: 0,
      total_points: group_points,
    }));
    await supabase.from("scores").upsert(scoreRows, { onConflict: "user_id" });
  }

  async function seedBracket() {
    setSaving(true);
    // Take all group advancers and put them in bracket seed order
    const advancers = [];
    for (const [groupId, results] of Object.entries(groupResults)) {
      for (const teamId of results) {
        const group = GROUPS[groupId];
        const team = group?.teams.find(t => t.id === teamId);
        if (team) advancers.push({ team_id: teamId, team_name: team.name, flag: team.flag, group_id: groupId, seed_order: results.indexOf(teamId) });
      }
    }
    await supabase.from("bracket_advancers").delete().neq("team_id", "___");
    await supabase.from("bracket_advancers").insert(advancers);
    setMsg("✅ Bracket seeded with " + advancers.length + " teams!");
    setSaving(false);
    setTimeout(() => setMsg(""), 4000);
  }

  return (
    <div>
      <div className="page-title">⚙️ <span>Admin</span> Panel</div>

      {msg && <div className="auth-success" style={{ marginBottom: 20 }}>{msg}</div>}

      {/* Settings */}
      <div className="card admin-section">
        <div className="card-title">🔧 Phase Controls</div>
        <div className="toggle-row">
          <div>
            <strong>Group Picks</strong>
            <p style={{ fontSize: 13, color: "var(--text2)" }}>Allow users to pick group advancers</p>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={settings.group_picks_open}
              onChange={e => setSettings(s => ({ ...s, group_picks_open: e.target.checked }))} />
            <span className="slider"></span>
          </label>
        </div>
        <div className="toggle-row">
          <div>
            <strong>Bracket Picks</strong>
            <p style={{ fontSize: 13, color: "var(--text2)" }}>Allow users to fill out bracket</p>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={settings.bracket_open}
              onChange={e => setSettings(s => ({ ...s, bracket_open: e.target.checked }))} />
            <span className="slider"></span>
          </label>
        </div>
        <button className="btn btn-primary mt-16" onClick={saveSettings} disabled={saving}>
          Save Settings
        </button>
      </div>

      {/* Group Results */}
      <div className="card admin-section">
        <div className="card-title">📋 Enter Group Results</div>
        <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 16 }}>
          Select the 2 teams that advanced from each group. First pick = group winner.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {Object.entries(GROUPS).map(([groupId, { teams }]) => {
            const res = groupResults[groupId] || [];
            return (
              <div key={groupId} style={{ background: "var(--bg2)", borderRadius: 8, padding: 12, border: "1px solid var(--border)" }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 16, marginBottom: 8 }}>Group {groupId}</div>
                {teams.map(team => {
                  const pos = res.indexOf(team.id);
                  const isSel = pos >= 0;
                  return (
                    <div key={team.id}
                      onClick={() => toggleResult(groupId, team.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "6px 8px",
                        borderRadius: 6, marginBottom: 4, cursor: "pointer",
                        background: isSel ? (pos === 0 ? "rgba(255,214,0,0.15)" : "var(--green-dim)") : "transparent",
                        border: `1px solid ${isSel ? (pos === 0 ? "var(--gold)" : "var(--green)") : "transparent"}`,
                      }}>
                      <span>{team.flag}</span>
                      <span style={{ flex: 1, fontSize: 14 }}>{team.name}</span>
                      {pos === 0 && <span title="1st place">🥇</span>}
                      {pos === 1 && <span title="2nd place">✅</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="flex-row mt-16">
          <button className="btn btn-primary" onClick={saveGroupResults} disabled={saving}>
            💾 Save Results & Score All Players
          </button>
          <button className="btn btn-gold" onClick={seedBracket} disabled={saving}>
            🗂️ Seed Bracket
          </button>
        </div>
      </div>
    </div>
  );
}
