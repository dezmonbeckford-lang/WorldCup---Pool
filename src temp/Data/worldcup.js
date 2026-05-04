// World Cup 2026 Groups (48 teams, 12 groups of 4)
export const GROUPS = {
  A: { teams: [
    { id: "usa", name: "USA", flag: "🇺🇸" },
    { id: "mex", name: "Mexico", flag: "🇲🇽" },
    { id: "can", name: "Canada", flag: "🇨🇦" },
    { id: "nzl", name: "New Zealand", flag: "🇳🇿" },
  ]},
  B: { teams: [
    { id: "arg", name: "Argentina", flag: "🇦🇷" },
    { id: "chi", name: "Chile", flag: "🇨🇱" },
    { id: "per", name: "Peru", flag: "🇵🇪" },
    { id: "civ", name: "Ivory Coast", flag: "🇨🇮" },
  ]},
  C: { teams: [
    { id: "bra", name: "Brazil", flag: "🇧🇷" },
    { id: "col", name: "Colombia", flag: "🇨🇴" },
    { id: "uru", name: "Uruguay", flag: "🇺🇾" },
    { id: "bol", name: "Bolivia", flag: "🇧🇴" },
  ]},
  D: { teams: [
    { id: "fra", name: "France", flag: "🇫🇷" },
    { id: "bel", name: "Belgium", flag: "🇧🇪" },
    { id: "cro", name: "Croatia", flag: "🇭🇷" },
    { id: "mar", name: "Morocco", flag: "🇲🇦" },
  ]},
  E: { teams: [
    { id: "eng", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { id: "ned", name: "Netherlands", flag: "🇳🇱" },
    { id: "sen", name: "Senegal", flag: "🇸🇳" },
    { id: "tun", name: "Tunisia", flag: "🇹🇳" },
  ]},
  F: { teams: [
    { id: "ger", name: "Germany", flag: "🇩🇪" },
    { id: "por", name: "Portugal", flag: "🇵🇹" },
    { id: "srb", name: "Serbia", flag: "🇷🇸" },
    { id: "cmr", name: "Cameroon", flag: "🇨🇲" },
  ]},
  G: { teams: [
    { id: "spa", name: "Spain", flag: "🇪🇸" },
    { id: "ita", name: "Italy", flag: "🇮🇹" },
    { id: "alb", name: "Albania", flag: "🇦🇱" },
    { id: "nga", name: "Nigeria", flag: "🇳🇬" },
  ]},
  H: { teams: [
    { id: "por2", name: "Portugal B", flag: "🇵🇹" },
    { id: "den", name: "Denmark", flag: "🇩🇰" },
    { id: "pol", name: "Poland", flag: "🇵🇱" },
    { id: "egy", name: "Egypt", flag: "🇪🇬" },
  ]},
  I: { teams: [
    { id: "jpn", name: "Japan", flag: "🇯🇵" },
    { id: "kor", name: "South Korea", flag: "🇰🇷" },
    { id: "aus", name: "Australia", flag: "🇦🇺" },
    { id: "ira", name: "Iran", flag: "🇮🇷" },
  ]},
  J: { teams: [
    { id: "mba", name: "Saudi Arabia", flag: "🇸🇦" },
    { id: "qat", name: "Qatar", flag: "🇶🇦" },
    { id: "irq", name: "Iraq", flag: "🇮🇶" },
    { id: "omn", name: "Oman", flag: "🇴🇲" },
  ]},
  K: { teams: [
    { id: "ned2", name: "Netherlands B", flag: "🇳🇱" },
    { id: "gha", name: "Ghana", flag: "🇬🇭" },
    { id: "egu", name: "Guinea", flag: "🇬🇳" },
    { id: "tan", name: "Tanzania", flag: "🇹🇿" },
  ]},
  L: { teams: [
    { id: "mex2", name: "Mexico B", flag: "🇲🇽" },
    { id: "cos", name: "Costa Rica", flag: "🇨🇷" },
    { id: "jam", name: "Jamaica", flag: "🇯🇲" },
    { id: "pan", name: "Panama", flag: "🇵🇦" },
  ]},
};

// Points system
export const POINTS = {
  group_correct_advance: 3,    // Correctly picked a team that advances
  group_correct_1st: 2,        // Correctly picked a group winner
  r32_correct: 5,
  r16_correct: 8,
  qf_correct: 11,
  sf_correct: 14,
  final_correct: 17,
  champion_correct: 25,
};

// Bracket rounds
export const ROUNDS = ["Round of 32", "Round of 16", "Quarterfinals", "Semifinals", "Final"];

export function getTeamById(id) {
  for (const group of Object.values(GROUPS)) {
    const t = group.teams.find(t => t.id === id);
    if (t) return t;
  }
  return null;
}
