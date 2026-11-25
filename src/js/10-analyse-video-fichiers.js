/* ---------- Analyse simulée ---------- */
function pitchSVG(sel) {
  const r = rng(hashStr(ui.matchId || 'x')); const pts = [];
  for (let i = 0; i < 22; i++) { const team = i < 11 ? 0 : 1; const x = 70 + r() * 500, y = 70 + r() * 230; pts.push({x, y, team, n:(i % 11) + 1 + (team ? 0 : 0)}); }
  const nums = [1,2,4,5,3,6,8,10,7,9,11];
  return `<svg viewBox="0 0 640 360" class="pitch" role="img" aria-label="Image du match : clique sur ton joueur"><defs><linearGradient id="gz" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1f6b45"/><stop offset="1" stop-color="#2a8a59"/></linearGradient></defs><rect width="640" height="360" fill="#16402c"/><polygon points="120,40 520,40 630,340 10,340" fill="url(#gz)"/><polygon points="120,40 520,40 630,340 10,340" fill="none" stroke="#e9f5ee" stroke-opacity=".7" stroke-width="2"/><line x1="320" y1="40" x2="320" y2="340" stroke="#e9f5ee" stroke-opacity=".6" stroke-width="2"/><ellipse cx="320" cy="180" rx="70" ry="38" fill="none" stroke="#e9f5ee" stroke-opacity=".6" stroke-width="2"/>${pts.map((p, i) => `<g data-action="pick" data-arg="${i}" style="cursor:pointer"><circle cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" r="${sel === i ? 14 : 11}" fill="${p.team ? '#1b2a6b' : '#f4f4f0'}" stroke="${sel === i ? '#ffd23f' : '#0b1a12'}" stroke-width="${sel === i ? 4 : 1.5}"/><text x="${p.x.toFixed(0)}" y="${(p.y + 4).toFixed(0)}" text-anchor="middle" font-size="11" font-weight="700" fill="${p.team ? '#fff' : '#0b1a12'}" pointer-events="none">${nums[i % 11]}</text></g>`).join('')}</svg>`;
}
function aiModal() {
  openModal('Analyser le match', `<p class="small" style="margin:0">Clique sur ton joueur dans cette image. ${ui.pick != null ? '<b>Joueur sélectionné.</b>' : ''}</p>${pitchSVG(ui.pick)}
  <div id="aiProg" hidden><div class="bar" style="height:10px"><i id="aiBar" style="width:0%"></i></div><p class="small muted" id="aiStep" style="margin:8px 0 0"></p></div>
  <div class="actions"><button class="btn primary" data-action="aiRun"${ui.pick == null ? ' disabled' : ''}>Lancer l’analyse</button></div>
  <p class="tiny muted" style="margin:0">Simulation pour le prototype. Pipeline visé : détection des joueurs et du ballon, suivi image par image, confirmation par le numéro de maillot, détection des actions, puis validation par le joueur.</p>`);
}
function aiRun() {
  const m = curMatch(); if (!m) return;
  $('#aiProg').hidden = false;
  const steps = ['Détection des joueurs et du ballon', 'Suivi des trajectoires', 'Identification par le numéro de maillot', 'Détection des actions', 'Préparation des clips'];
  let k = 0; const bar = $('#aiBar'), st = $('#aiStep');
  const btn = document.querySelector('[data-action="aiRun"]'); if (btn) btn.disabled = true;
  const iv = setInterval(() => {
    k++; if (bar) bar.style.width = Math.min(100, k * 4) + '%'; if (st) st.textContent = steps[Math.min(steps.length - 1, Math.floor(k / 5))];
    if (k >= 25) {
      clearInterval(iv);
      const r = rng(hashStr(m.id + ui.pick + Date.now())); const dur = n0(m.duration) || 5400; const n = 8 + Math.floor(r() * 6);
      const pid = state.role === 'entraineur' ? null : 'me';
      const types = ['touche','touche','passe-cle','recup','duel','dribble','tir','passe-dec','but'];
      const targets = pid ? [pid] : roster().map(p => p.id);
      for (let i = 0; i < n; i++) { const t = Math.floor(60 + r() * (dur - 120)); m.clips.push({id:uid(), type:types[Math.floor(r() * types.length)], t, dur:10, rating:0, inReel:false, origin:'ia', status:'proposé', playerId:targets[Math.floor(r() * targets.length)]}); }
      m.aiPick = ui.pick; { const u = usage(); if (state.role === 'entraineur') u.teamAnalyses++; else u.analyses++; } save();
      $('#modal').hidden = true; $('#modal').innerHTML = '';
      ui.clipFilter = 'proposé'; render(); toast(`${n} actions détectées : valide-les dans la liste des clips.`);
    }
  }, 120);
}

/* ---------- Vidéo ---------- */
function bindVideo() {
  const v = $('#mv'); if (!v) return;
  v.addEventListener('loadedmetadata', () => { const m = curMatch(); if (m) { m.duration = Math.round(v.duration); m.width = v.videoWidth; m.height = v.videoHeight; save(); } });
  v.addEventListener('timeupdate', () => {
    if (PC.reel) { const c = PC.reel[PC.idx]; if (c && v.currentTime >= c.t + c.dur) nextReel(); }
    else if (PC.stopAt != null && v.currentTime >= PC.stopAt) { v.pause(); PC.stopAt = null; }
  });
}
function addTag(type) {
  const v = $('#mv'), m = curMatch(); if (!v || !m) return;
  const t = Math.max(0, v.currentTime - 6);
  const pid = state.role === 'entraineur' ? (ui.tagPlayer || (roster()[0] || {}).id) : 'me';
  m.clips.push({id:uid(), type, t:Math.round(t * 10) / 10, dur:10, rating:3, inReel:false, origin:'manuel', status:'validé', playerId:pid});
  ui.clipFilter = 'all'; const f = $('#clipFilter'); if (f) f.value = 'all';
  refreshClips(); toast(`${ctype(type)[1]} marqué à ${tc(v.currentTime)}`);
}
function playClip(id) { const v = $('#mv'), m = curMatch(); const c = m && m.clips.find(x => x.id === id); if (!v || !c) return; PC.reel = null; PC.stopAt = c.t + c.dur; v.currentTime = c.t; v.play().catch(() => {}); }
function reelStart(record) {
  const m = curMatch(), v = $('#mv'); if (!m || !v) return;
  const list = reelClips(m); if (!list.length) { toast('Coche d’abord des clips « Temps forts ».'); return; }
  PC.reel = list; PC.idx = 0; PC.stopAt = null;
  if (record) {
    const s = v.captureStream ? v.captureStream() : (v.mozCaptureStream ? v.mozCaptureStream() : null);
    if (!s || !window.MediaRecorder) { toast('Ce navigateur ne permet pas l’enregistrement : utilise l’aperçu.'); }
    else {
      PC.chunks = []; const mt = MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
      try { PC.rec = new MediaRecorder(s, {mimeType:mt}); PC.rec.ondataavailable = e => { if (e.data && e.data.size) PC.chunks.push(e.data); }; PC.rec.onstop = () => { const b = new Blob(PC.chunks, {type:'video/webm'}); const m = curMatch(); addVideoBlob(b, {title:'Temps forts · ' + (m ? m.title : ''), type:'Temps forts', source:'reel'}); }; }
      catch (e) { PC.rec = null; toast('Enregistrement impossible ici : utilise l’aperçu.'); }
    }
  }
  const ov = $('#ov'); if (ov) ov.classList.add('on');
  v.pause(); v.currentTime = list[0].t;
  setTimeout(() => { if (ov) ov.classList.remove('on'); if (PC.rec && PC.rec.state === 'inactive') PC.rec.start(250); v.play().catch(() => {}); }, 2500);
}
function nextReel() {
  const v = $('#mv'); PC.idx++;
  if (!PC.reel || PC.idx >= PC.reel.length) { if (v) v.pause(); PC.reel = null; if (PC.rec && PC.rec.state !== 'inactive') PC.rec.stop(); PC.rec = null; toast('Fin de la vidéo des temps forts.'); return; }
  v.currentTime = PC.reel[PC.idx].t;
}

/* ---------- Fichiers ---------- */
async function saveFile(name, data) {
  if (caps.downloads) { try { await caps.downloads.save({filename:name, data}); toast('Fichier proposé au téléchargement.'); return; } catch (e) { if (e && e.code === 'declined') return; } }
  if (!IN_FRAME) { const b = data instanceof Blob ? data : new Blob([data], {type:'application/octet-stream'}); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); return; }
  if (typeof data === 'string') openModal('Copier le contenu', `<p class="small muted" style="margin:0">Le téléchargement n’est pas disponible ici. Copie le contenu ci-dessous dans un fichier « ${esc(name)} ».</p><textarea id="copyArea" rows="14" readonly>${esc(data)}</textarea><div class="actions"><button class="btn primary" data-action="copyArea">Copier</button></div>`);
  else toast('Téléchargement indisponible dans cette vue : ouvre la version hors ligne.');
}
async function copyText(t) { try { await navigator.clipboard.writeText(t); toast('Copié.'); } catch (e) { toast('Copie refusée par le navigateur.'); } }
function profileExportHTML() {
  const css = `body{margin:0;background:#f3f5f3;font:0.9375rem/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;color:#16201c}main{max-width:820px;margin:32px auto;padding:0 16px}.pp{background:#fff;border:1px solid #dde3df;border-radius:14px;padding:28px}.pp h1{margin:0;font-size:1.625rem;color:#0b2a1f}.pp h3{font-size:0.75rem;text-transform:uppercase;letter-spacing:.08em;color:#0b6b4d;margin:18px 0 6px}.meta{color:#4a5a54}table{border-collapse:collapse;width:100%;font-size:0.8125rem}th,td{padding:7px 9px;border-bottom:1px solid #e3e9e6;text-align:left}th{background:#f1f5f3;color:#4a5a54}`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(state.player.firstName)} ${esc(state.player.lastName)} · Recruiting profile</title><style>${css}</style></head><body><main>${profileDoc(state.player, {export:true})}</main></body></html>`;
}

