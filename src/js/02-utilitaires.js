/* ---------- Utilitaires ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => new Date().toISOString().slice(0, 10);
const n0 = v => (v === '' || v == null || isNaN(Number(v))) ? 0 : Number(v);
const has = v => !(v === '' || v == null || (Array.isArray(v) && !v.length));
function get(path, obj) { return path.split('.').reduce((o, k) => o == null ? undefined : o[k], obj || state); }
function set(path, val) { const ks = path.split('.'); let o = state; for (let i = 0; i < ks.length - 1; i++) { if (o[ks[i]] == null) o[ks[i]] = {}; o = o[ks[i]]; } o[ks[ks.length - 1]] = val; }
function money(v, cur) { try { return new Intl.NumberFormat('fr-FR', {style:'currency', currency:cur || 'EUR', maximumFractionDigits:0}).format(n0(v)); } catch (e) { return Math.round(n0(v)) + ' ' + (cur || ''); } }
function fdate(d) { if (!d) return '—'; const x = new Date(/^\d{4}-\d{2}-\d{2}$/.test(d) ? d + 'T12:00:00' : d); return isNaN(x) ? d : x.toLocaleDateString('fr-FR', {day:'numeric', month:'short', year:'numeric'}); }
function ageAt(birth, at) { if (!birth) return null; const b = new Date(birth), a = at || new Date(); let y = a.getFullYear() - b.getFullYear(); const m = a.getMonth() - b.getMonth(); if (m < 0 || (m === 0 && a.getDate() < b.getDate())) y--; return y; }
function tc(t) { const s = Math.max(0, Math.floor(t)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function levelOf(k) { return LEVELS.find(l => l[0] === k); }
function levelLabel(k) { const l = levelOf(k); return l ? l[1] : '—'; }
function ctype(k) { return CLIP_TYPES.find(c => c[0] === k) || CLIP_TYPES[8]; }
function hashStr(s) { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = seed || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function gpaFrom20(avg) {
  const a = Number(avg); if (!avg || isNaN(a)) return null;
  const pts = [[0,0],[8,1],[10,2],[12,3],[14,3.5],[16,4],[20,4]];
  for (let i = 1; i < pts.length; i++) if (a <= pts[i][0]) { const [x0,y0] = pts[i-1], [x1,y1] = pts[i]; return y0 + (a - x0) * (y1 - y0) / (x1 - x0); }
  return 4;
}
function rate(cur) { return cur === 'EUR' ? 1 : cur === 'CAD' ? n0(state.settings.rateCad) : n0(state.settings.rateUsd); }

