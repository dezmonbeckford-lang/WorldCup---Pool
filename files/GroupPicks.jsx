import { useState, useEffect } from "react";
import { supabase } from "../App";
import { GROUPS } from "../data/worldcup";

export default function GroupPicks({ session }) {
  const [picks, setPicks] = useState({}); // { A: [teamId, teamId], ... }
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    loadPicks();
    checkLock();
  }, [session]);

  async function checkLock() {
    const { data } = await supabase.from("settings").select("group_picks_open").single();
    setLocked(data && !data.group_picks_open);
  }

  async function loadPicks() {
    setLoading(true);
    const { data } = await supabase.from("group_picks").select("*").eq("user_id", session.user.id);
    const p = {};
    if (data) data.forEach(row => { p[row.group_id] = [row.first_place, row.second_place].filter(Boolean); });
    setPicks(p);
    setLoading(false);
  }

  function toggleTeam(groupId, teamId) {
    if (locked) return;
    setPicks(prev => {
      const cur = prev[groupId] || [];
      if (cur.includes(teamId)) {
        return { ...prev, [groupId]: cur.filter(t => t !== teamId) };
      }
      if (cur.length >= 2) {
        // Replace second pick
        return { ...prev, [groupId]: [cur[0], teamId] };
      }
      return { ...prev, [groupId]: [...cur, teamId] };
    });
    setSaved(false);
  }

  async function savePicks() {
    setSaving(true);
    const rows = Object.entries(picks).map(([group_id, teams]) => ({
      user_id: session.user.id,
      group_id,
      first_place: teams[0] || null,
      second_place: teams[1] || null,
    }));
    // Upsert
    const { error } = await supabase.from("group_picks").upsert(rows, { onConflict: "user_id,group_id" });
    if (!error) setSaved(true);
    setSaving(false);
  }

  const totalPicked = Object.values(picks).filter(g => g.length === 2).length;
  const totalGroups = Object.keys(GROUPS).length;

  if (loading) return <div className="empty-state"><div className="icon">⏳</div><p>Loading picks...</p></div>;

  return (
    <div>
      <div className="page-title">🏆 <span>Group Stage</span> Picks</div>

      {locked && (
        <div className="card" style={{ marginBottom: 20, borderColor: "var(--red)" }}>
          <div className="flex-row">
            <span style={{ fontSize: 24 }}>🔒</span>
            <div>
              <strong>Group picks are locked.</strong>
              <p style={{ color: "var(--text2)", fontSize: 14, marginTop: 4 }}>The group stage has started. Your picks are saved and being scored.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-row" style={{ marginBottom: 20 }}>
        <span className="picks-badge">✅ {totalPicked}/{totalGroups} Groups Complete</span>
        <span className="picks-note">Pick <strong>2 teams</strong> to advance from each group. First pick = group winner.</span>
      </div>

      <div className="group-grid">
        {Object.entries(GROUPS).map(([groupId, { teams }]) => {
          const groupPicks = picks[groupId] || [];
          return (
            <div className="group-card" key={groupId}>
              <div className="group-label">Group {groupId}</div>
              <div className="team-list">
                {teams.map(team => {
                  const pos = groupPicks.indexOf(team.id);
                  const isFirst = pos === 0;
                  const isSelected = pos >= 0;
                  return (
                    <div
                      key={team.id}
                      className={`team-row ${isFirst ? "selected-1" : isSelected ? "selected" : ""}`}
                      onClick={() => toggleTeam(groupId, team.id)}
                    >
                      <span className="team-flag">{team.flag}</span>
                      <span className="team-name">{team.name}</span>
                      {isFirst && <span className="team-check" title="Group winner pick">🥇</span>}
                      {!isFirst && isSelected && <span className="team-check">✅</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!locked && (
        <div className="save-bar">
          <span style={{ color: "var(--text2)", fontSize: 14 }}>
            {saved ? "✅ Picks saved!" : `${totalPicked}/${totalGroups} groups picked`}
          </span>
          <button className="btn btn-primary" onClick={savePicks} disabled={saving}>
            {saving ? "Saving..." : "💾 Save My Picks"}
          </button>
        </div>
      )}
    </div>
  );
}
