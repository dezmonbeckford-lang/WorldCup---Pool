import { useState } from "react";
import { supabase } from "../App";

export default function Auth() {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit() {
    setError(""); setSuccess(""); setLoading(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) setError(error.message);
      else if (data.user && !data.session) setSuccess("Check your email to confirm your account!");
      else {
        // Insert profile
        await supabase.from("profiles").insert({ id: data.user.id, full_name: name, email });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-title">⚽ WorldPool</div>
        <p className="auth-subtitle">The ultimate World Cup prediction pool</p>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        {mode === "signup" && (
          <div className="form-group">
            <label>Your Name</label>
            <input placeholder="e.g. Diego Maradona" value={name} onChange={e => setName(e.target.value)} />
          </div>
        )}
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleSubmit} disabled={loading}>
          {loading ? "Loading..." : mode === "signin" ? "Sign In" : "Create Account"}
        </button>
        <div className="auth-toggle">
          {mode === "signin" ? (
            <>Don't have an account? <button onClick={() => { setMode("signup"); setError(""); }}>Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setMode("signin"); setError(""); }}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  );
}
