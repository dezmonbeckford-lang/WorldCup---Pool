import { useState, useEffect } from "react";
import { supabase } from "../App";

export default function Leaderboard({ session }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScores();
  }, [session]);

  async function loadScores() {
    setLoading(true);
    const { data } = await supabase
      .from("scores")
      .select("*, profiles(full_name, email)")
      .order("total_points", { ascending: false });
    setScores(data || []);
    setLoading(false);
  }

  if (loading) return <div className="empty-state"><div className="icon">⏳</div><p>Loading standings...</p></div>;

  if (scores.length === 0) return (
    <div className="empty-state">
      <div className="icon">📊</div>
      <p>No scores yet. Get your friends to sign up and make their picks!</p>
    </div>
  );

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <div className="page-title">📊 <span>Standings</span></div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="flex-row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 800, letterSpacing: 1 }}>
              {scores.length} Players
            </div>
            <div style={{ color: "var(--text2)", fontSize: 13 }}>Scores update as results come in</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadScores}>🔄 Refresh</button>
        </div>
      </div>

      {scores.map((score, idx) => {
        const isMe = score.user_id === session.user.id;
        const name = score.profiles?.full_name || score.profiles?.email?.split("@")[0] || "Player";
        const rankClass = idx === 0 ? "top1" : idx === 1 ? "top2" : idx === 2 ? "top3" : "";
        return (
          <div key={score.user_id} className={`lb-row ${isMe ? "me" : ""} ${rankClass}`}>
            <div className="lb-rank">
              {idx < 3 ? medals[idx] : idx + 1}
            </div>
            <div className="lb-name">
              {name}
              {isMe && <span className="tag" style={{ marginLeft: 8, fontSize: 11 }}>You</span>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="lb-pts">{score.total_points}</div>
              <div className="lb-pts-label">pts</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
