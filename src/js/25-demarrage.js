/* ---------- Démarrage ---------- */
load(); applyPrefs();
if (!location.hash) history.replaceState(null, '', '#' + HOME[state.role]);
render();
(async () => {
  try {
    if (!window.claude || typeof window.claude.use !== 'function') return;
    const [s, d, a, as] = await Promise.all([window.claude.use('sample').catch(() => null), window.claude.use('downloads').catch(() => null), window.claude.use('artifact').catch(() => null), window.claude.use('assets').catch(() => null)]);
    caps.sample = s; caps.downloads = d; caps.artifact = a; caps.assets = as;
    if (s || d || a || as) { if ($('#modal').hidden) render(); }
  } catch (e) {}
})();
