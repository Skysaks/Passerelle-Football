/* ===================== Vidéo (projecteur, ralenti, annotation, studio, chapitres) ===================== */
const VIDEO_TYPES_V6 = ['Temps forts', 'Match complet', 'Format vertical (réseaux)', 'Séquence technique', 'Entraînement', 'Coups de pied arrêtés', 'Tests physiques', 'Présentation en anglais', 'Interview'];
const VT_EN = {'Temps forts':'Highlights', 'Match complet':'Full match', 'Format vertical (réseaux)':'Vertical cut', 'Séquence technique':'Technical skills', 'Entraînement':'Training', 'Coups de pied arrêtés':'Set pieces', 'Tests physiques':'Physical testing', 'Présentation en anglais':'Introduction (English)', 'Interview':'Interview'};

/* ---------- Rectangle réellement affiché par une <video> (object-fit: contain) ---------- */
function videoRect(v) {
  const W = v.clientWidth, H = v.clientHeight, vw = v.videoWidth || 16, vh = v.videoHeight || 9;
  const k = Math.min(W / vw, H / vh), w = vw * k, h = vh * k;
  return {x:(W - w) / 2, y:(H - h) / 2, w, h};
}

/* ---------- Projecteur sur le joueur, ralenti, boucle ---------- */
const VT = {speed:1, loop:false, spot:true, clip:null};
playClip = function (id) {
  const v = $('#mv'), m = curMatch(); const c = m && m.clips.find(x => x.id === id); if (!v || !c) return;
  PC.reel = null; PC.stopAt = c.t + c.dur; VT.clip = c; v.playbackRate = VT.speed; v.currentTime = c.t; v.play().catch(() => {});
};
function spotTick() {
  const v = $('#mv'), s = $('#spot'); if (!v || !s) return;
  const c = PC.reel ? PC.reel[PC.idx] : VT.clip;
  if (!c || !c.box || !VT.spot) { s.hidden = true; return; }
  const at = c.at || (c.t + 3), on = v.currentTime >= at - .35 && v.currentTime <= at + .5;
  if (!on) { s.hidden = true; return; }
  const r = videoRect(v), [x1, y1, x2, y2] = c.box, cx = r.x + (x1 + x2) / 2 * r.w, cy = r.y + (y1 + y2) / 2 * r.h;
  const rad = Math.max(22, Math.max((x2 - x1) * r.w, (y2 - y1) * r.h) * .85);
  Object.assign(s.style, {left:(cx - rad) + 'px', top:(cy - rad) + 'px', width:rad * 2 + 'px', height:rad * 2 + 'px'}); s.hidden = false;
}
const bindVideoV5 = bindVideo;
bindVideo = function () {
  bindVideoV5();
  const v = $('#mv'); if (!v || v.dataset.v6) return; v.dataset.v6 = '1';
  v.playbackRate = VT.speed;
  v.addEventListener('timeupdate', () => {
    spotTick();
    if (VT.loop && VT.clip && !PC.reel && v.currentTime >= VT.clip.t + VT.clip.dur - .15) { v.currentTime = VT.clip.t; v.play().catch(() => {}); }
  });
  v.addEventListener('seeked', spotTick);
  const wrap = v.parentElement;
  if (wrap && !$('#spot')) { const s = document.createElement('div'); s.id = 'spot'; s.className = 'spot'; s.hidden = true; s.setAttribute('aria-hidden', 'true'); wrap.appendChild(s); }
  if (wrap && !$('#vtools')) {
    const t = document.createElement('div'); t.id = 'vtools'; t.className = 'vtools';
    t.innerHTML = `<div class="seg" role="group" aria-label="Vitesse de lecture">${[[.25, '¼×'], [.5, '½×'], [1, '1×'], [2, '2×']].map(([s, l]) => `<button type="button" data-action="vtSpeed" data-arg="${s}" aria-pressed="${VT.speed === s}">${l}</button>`).join('')}</div>
      <label class="check small"><input type="checkbox" data-action-change="vtLoop"${VT.loop ? ' checked' : ''}>Boucle sur le clip</label>
      <label class="check small"><input type="checkbox" data-action-change="vtSpot"${VT.spot ? ' checked' : ''}>Projecteur sur le joueur</label>
      <span style="flex:1"></span><button type="button" class="btn sm" data-action="vtFrame" aria-label="Image précédente">‹ Image</button><button type="button" class="btn sm" data-action="vtFrame" data-arg="1" aria-label="Image suivante">Image ›</button><button type="button" class="btn sm" data-action="annotate">Annoter l’image</button>`;
    wrap.insertAdjacentElement('afterend', t);
  }
};
Object.assign(ACT, {
  vtSpeed(s) { VT.speed = +s; const v = $('#mv'); if (v) v.playbackRate = VT.speed; document.querySelectorAll('[data-action="vtSpeed"]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.arg === VT.speed))); },
  vtFrame(d) { const v = $('#mv'); if (!v) return; v.pause(); v.currentTime = Math.max(0, v.currentTime + (d ? 1 : -1) / 25); }
});
Object.assign(CHANGE_ACT, { vtLoop(a, el) { VT.loop = el.checked; }, vtSpot(a, el) { VT.spot = el.checked; spotTick(); } });

/* ---------- Annotation d'image (flèches, cercles, trait libre) ---------- */
const AN = {tool:'arrow', color:'#ffd400', shapes:[], draft:null};
ACT.annotate = function () {
  const v = $('#mv'), m = curMatch(); if (!v || !v.videoWidth) { toast('Charge la vidéo du match pour annoter une image.'); return; }
  v.pause(); AN.shapes = []; AN.t = v.currentTime;
  const W = Math.min(1280, v.videoWidth), H = Math.round(W * v.videoHeight / v.videoWidth);
  const base = document.createElement('canvas'); base.width = W; base.height = H; base.getContext('2d').drawImage(v, 0, 0, W, H); AN.base = base;
  openModal(`Annoter l’image · ${tc(AN.t)}`, `<div class="an-tools"><div class="seg" role="group" aria-label="Outil">${[['arrow', 'Flèche'], ['circle', 'Cercle'], ['free', 'Trait libre']].map(([k, l]) => `<button type="button" data-action="anTool" data-arg="${k}" aria-pressed="${AN.tool === k}">${l}</button>`).join('')}</div><div class="seg" role="group" aria-label="Couleur">${[['#ffd400', 'Jaune'], ['#ffffff', 'Blanc'], ['#ff4d4d', 'Rouge'], ['#4dd2ff', 'Bleu']].map(([c, l]) => `<button type="button" data-action="anColor" data-arg="${c}" aria-pressed="${AN.color === c}"><span class="an-c" style="background:${c}"></span>${l}</button>`).join('')}</div><button type="button" class="btn sm" data-action="anUndo">Annuler le dernier tracé</button></div>
    <canvas id="anCanvas" width="${W}" height="${H}" class="an-canvas" aria-label="Image du match à annoter : glisse pour dessiner"></canvas>
    <p class="tiny muted" style="margin:0">Glisse sur l’image pour dessiner. L’image annotée s’enregistre avec le match et se télécharge en PNG.</p>
    <div class="actions"><button class="btn" data-action="anDownload">Télécharger</button><button class="btn primary" data-action="anSave">Enregistrer avec le match</button></div>`, true);
  const cv = $('#anCanvas'); anPaint();
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); const p = pos(e); AN.draft = {tool:AN.tool, color:AN.color, pts:[p, p]}; });
  cv.addEventListener('pointermove', e => { if (!AN.draft) return; const p = pos(e); if (AN.draft.tool === 'free') AN.draft.pts.push(p); else AN.draft.pts[1] = p; anPaint(); });
  const end = () => { if (AN.draft) { AN.shapes.push(AN.draft); AN.draft = null; anPaint(); } };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
};
function anPaint() {
  const cv = $('#anCanvas'); if (!cv) return; const g = cv.getContext('2d'); g.drawImage(AN.base, 0, 0);
  const lw = Math.max(3, cv.width / 260);
  [...AN.shapes, AN.draft].filter(Boolean).forEach(s => {
    g.strokeStyle = s.color; g.fillStyle = s.color; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 4;
    const [[x0, y0], [x1, y1]] = [s.pts[0], s.pts[s.pts.length - 1]];
    g.beginPath();
    if (s.tool === 'free') { s.pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }
    else if (s.tool === 'circle') { g.ellipse((x0 + x1) / 2, (y0 + y1) / 2, Math.abs(x1 - x0) / 2 + 1, Math.abs(y1 - y0) / 2 + 1, 0, 0, Math.PI * 2); g.stroke(); }
    else { g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); const a = Math.atan2(y1 - y0, x1 - x0), h = lw * 5; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - h * Math.cos(a - .45), y1 - h * Math.sin(a - .45)); g.lineTo(x1 - h * Math.cos(a + .45), y1 - h * Math.sin(a + .45)); g.closePath(); g.fill(); }
  });
  g.shadowBlur = 0;
}
Object.assign(ACT, {
  anTool(k) { AN.tool = k; document.querySelectorAll('[data-action="anTool"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.arg === k))); },
  anColor(c) { AN.color = c; document.querySelectorAll('[data-action="anColor"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.arg === c))); },
  anUndo() { AN.shapes.pop(); anPaint(); },
  anDownload() { const cv = $('#anCanvas'); if (!cv) return; cv.toBlob(b => saveFile(`annotation-${tc(AN.t).replace(/:/g, 'm')}.png`, b), 'image/png'); },
  async anSave() {
    const cv = $('#anCanvas'), m = curMatch(); if (!cv || !m) return;
    const thumb = (() => { const c = document.createElement('canvas'); c.width = 320; c.height = Math.round(320 * cv.height / cv.width); c.getContext('2d').drawImage(cv, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', .7); })();
    const id = uid(); const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    try { await IDB.put('a_' + id, blob); } catch (e) {}
    (m.annotations = m.annotations || []).push({id, t:Math.round(AN.t * 10) / 10, thumb, key:'a_' + id, date:today()});
    save(); closeModal(); render(); toast('Image annotée enregistrée avec le match.');
  },
  async anOpen(id) { const m = curMatch(), a = m && (m.annotations || []).find(x => x.id === id); if (!a) return; let src = a.thumb; try { const b = await IDB.get(a.key); if (b) src = URL.createObjectURL(b); } catch (e) {} openModal(`Annotation · ${tc(a.t)}`, `<img src="${src}" alt="Image annotée à ${tc(a.t)}" style="width:100%;border-radius:12px"><div class="actions"><button class="btn" data-action="anSeek" data-arg="${a.t}">Aller à ce moment</button><button class="btn" data-action="anDel" data-arg="${a.id}">Supprimer</button></div>`, true); },
  anSeek(t) { closeModal(); const v = $('#mv'); if (v) { v.currentTime = +t; v.pause(); } },
  anDel(id) { const m = curMatch(); if (!m) return; const done = undoable('Annotation supprimée.'); m.annotations = (m.annotations || []).filter(x => x.id !== id); closeModal(); save(); render(); done(); }
});
function annotationsHTML(m) {
  const a = m.annotations || []; if (!a.length) return '';
  return `<section class="card"><h3>Images annotées <span class="small muted">${a.length}</span></h3><div class="an-grid">${a.map(x => `<button type="button" class="an-thumb" data-action="anOpen" data-arg="${x.id}" style="background-image:url('${x.thumb}')"><span>${tc(x.t)}</span><span class="sr">Ouvrir l’annotation à ${tc(x.t)}</span></button>`).join('')}</div></section>`;
}

/* ---------- Studio de montage : cartons, sous-titres, projecteur, ralenti, format vertical ---------- */
const STUDIO = {vertical:false, intro:true, outro:true, captions:true, spot:true, slow:true, running:false, cancel:false};
ACT.studioOpen = function () {
  const m = curMatch(), v = $('#mv'); if (!m) return;
  if (!v || !videoURLs[m.id]) { toast('Charge la vidéo du match pour utiliser le studio.'); return; }
  const list = reelClips(m); if (!list.length) { toast('Coche d’abord des clips « Temps forts ».'); return; }
  const dur = list.reduce((s, c) => s + c.dur + (STUDIO.slow && c.at ? .8 : 0), 0) + (STUDIO.intro ? 3 : 0) + (STUDIO.outro ? 3 : 0);
  const opt = (k, l, d) => `<label class="check"><input type="checkbox" data-action-change="studioOpt" data-arg="${k}"${STUDIO[k] ? ' checked' : ''}><span><b>${l}</b><span class="small muted"> · ${d}</span></span></label>`;
  openModal('Studio de montage', `<p class="small muted" style="margin:0">${list.length} clip${list.length > 1 ? 's' : ''}, environ ${Math.round(dur)} s. La vidéo se fabrique en direct dans ton navigateur (sans son), puis s’ajoute à ton profil.</p>
    <div><span class="lbl2" id="stFmt">Format</span><div class="seg" role="group" aria-labelledby="stFmt"><button type="button" data-action="studioFmt" data-arg="0" aria-pressed="${!STUDIO.vertical}">16:9 · recruteurs</button><button type="button" data-action="studioFmt" data-arg="1" aria-pressed="${STUDIO.vertical}">9:16 · Instagram, TikTok</button></div></div>
    <div class="stack" style="gap:6px">${opt('intro', 'Carton d’ouverture', 'nom, poste, club, promotion')}${opt('captions', 'Sous-titres', 'type d’action et minute')}${opt('spot', 'Projecteur', 'arrêt sur image et cercle sur toi au moment de l’action (clips du moteur)')}${opt('slow', 'Ralenti', 'action ralentie de moitié pendant 1,5 s')}${opt('outro', 'Carton de fin', 'lien du profil et contact')}</div>
    ${STUDIO.vertical ? '<p class="tiny muted" style="margin:0">En vertical, l’image suit ta position quand le moteur l’a mesurée ; sinon elle reste centrée.</p>' : ''}
    <div id="stProg" hidden><div class="bar" style="height:10px"><i id="stBar" style="width:0%"></i></div><p class="small muted" id="stStep" aria-live="polite" style="margin:6px 0 0"></p></div>
    <canvas id="stPreview" class="st-prev${STUDIO.vertical ? ' vert' : ''}" width="${STUDIO.vertical ? 360 : 640}" height="${STUDIO.vertical ? 640 : 360}" aria-hidden="true"></canvas>
    <div class="actions"><button class="btn primary" data-action="studioGo" id="stGo">Créer la vidéo</button><button class="btn" data-action="studioCancel" id="stCancel" hidden>Arrêter</button></div>`, true);
  studioPaintCard($('#stPreview'), 'intro', 0);
};
Object.assign(ACT, {
  studioFmt(v) { STUDIO.vertical = v === '1'; ACT.studioOpen(); },
  studioCancel() { STUDIO.cancel = true; }
});
Object.assign(CHANGE_ACT, { studioOpt(k, el) { STUDIO[k] = el.checked; } });
function fitText(g, txt, x, y, maxW, weight, px) { let s = px; do { g.font = `${weight} ${Math.round(s)}px system-ui,sans-serif`; s *= .94; } while (g.measureText(txt).width > maxW && s > 8); g.fillText(txt, x, y); }
function studioPaintCard(cv, kind, k) {
  if (!cv) return; const g = cv.getContext('2d'), W = cv.width, H = cv.height, p = state.player, acc = profileAccent(p);
  const grd = g.createLinearGradient(0, 0, W, H); grd.addColorStop(0, acc); grd.addColorStop(1, '#0b1210'); g.fillStyle = grd; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = Math.max(1, W / 320); for (let x = 0; x < W; x += W / 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  const a = Math.min(1, k * 3); g.globalAlpha = a; g.fillStyle = '#fff'; g.textAlign = 'center';
  const S = Math.min(W, H) / 360, avail = p.project.availableFrom ? new Date(p.project.availableFrom).getFullYear() : '';
  if (kind === 'intro') {
    const mw = W * .86, lv = levelOf(p.level), en = (look(p).lang || 'en') === 'en';
    fitText(g, ((POS_EN[p.position] || p.position) + (avail ? ` · CLASS OF ${avail}` : '')).toUpperCase(), W / 2, H / 2 - 44 * S, mw, 700, 13 * S);
    fitText(g, `${p.firstName} ${p.lastName}`, W / 2, H / 2 + 4 * S, mw, 800, 40 * S);
    fitText(g, p.club || '', W / 2, H / 2 + 34 * S, mw, 500, 15 * S);
    fitText(g, [lv ? (en ? lv[3] || lv[1] : lv[1]) : '', p.height ? p.height + ' cm' : ''].filter(Boolean).join(' · '), W / 2, H / 2 + 56 * S, mw, 500, 14 * S);
  } else {
    const mw = W * .86;
    fitText(g, `${p.firstName} ${p.lastName}`, W / 2, H / 2 - 16 * S, mw, 800, 26 * S);
    fitText(g, `passerelle.app/p/${(hashStr(p.id + p.lastName) % 1e8).toString(36)}`, W / 2, H / 2 + 14 * S, mw, 500, 15 * S);
    if (p.visibility.showContacts && p.email) fitText(g, p.email, W / 2, H / 2 + 38 * S, mw, 500, 15 * S);
  }
  g.globalAlpha = 1;
}
function studioPaintFrame(g, v, W, H, c, opts) {
  const vw = v.videoWidth, vh = v.videoHeight; if (!vw) return;
  let sx = 0, sy = 0, sw = vw, sh = vh;
  if (opts.vertical) { sh = vh; sw = Math.min(vw, vh * 9 / 16); const cx = c.box ? (c.box[0] + c.box[2]) / 2 * vw : vw / 2; sx = Math.max(0, Math.min(vw - sw, cx - sw / 2)); }
  else { const k = Math.min(vw / W, vh / H); sw = W * k; sh = H * k; sx = (vw - sw) / 2; sy = (vh - sh) / 2; }
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.drawImage(v, sx, sy, sw, sh, 0, 0, W, H);
  if (opts.spot && c.box && opts.freeze) {
    const [x1, y1, x2, y2] = c.box, px = ((x1 + x2) / 2 * vw - sx) / sw * W, py = ((y1 + y2) / 2 * vh - sy) / sh * H;
    const rad = Math.max(26, Math.max((x2 - x1) * vw / sw * W, (y2 - y1) * vh / sh * H) * .85);
    g.save(); g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.rect(0, 0, W, H); g.arc(px, py, rad, 0, Math.PI * 2, true); g.fill('evenodd');
    g.strokeStyle = '#ffd400'; g.lineWidth = Math.max(3, W / 240); g.beginPath(); g.arc(px, py, rad, 0, Math.PI * 2); g.stroke(); g.restore();
  }
  if (opts.captions) {
    const S = Math.min(W, H) / 360, lbl = `${CLIP_EN[c.type] || ctype(c.type)[1]}${c.outcome === 'reussie' ? ' ✓' : ''} · ${Math.floor((c.at || c.t) / 60)}'`;
    g.font = `700 ${Math.round(15 * S)}px system-ui,sans-serif`; const tw = g.measureText(lbl).width;
    g.fillStyle = 'rgba(0,0,0,.6)'; const x = 14 * S, y = H - 44 * S; g.beginPath(); g.roundRect ? g.roundRect(x, y, tw + 24 * S, 30 * S, 15 * S) : g.rect(x, y, tw + 24 * S, 30 * S); g.fill();
    g.fillStyle = '#fff'; g.textAlign = 'left'; g.fillText(lbl, x + 12 * S, y + 20 * S);
    g.font = `600 ${Math.round(11 * S)}px system-ui,sans-serif`; g.textAlign = 'right'; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText(`${state.player.firstName} ${state.player.lastName} · #${state.player.jersey || ''}`, W - 14 * S, 24 * S);
  }
}
const raf = () => new Promise(r => requestAnimationFrame(() => r()));
const once = (el, ev, ms) => new Promise(r => { const f = () => { el.removeEventListener(ev, f); r(); }; el.addEventListener(ev, f); if (ms) setTimeout(f, ms); });
ACT.studioGo = async function () {
  if (STUDIO.running) return;
  const m = curMatch(), v = $('#mv'), list = reelClips(m); if (!v || !list.length) return;
  if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) { toast('Ce navigateur ne permet pas de fabriquer la vidéo : essaie Chrome, Edge ou Firefox.'); return; }
  const [W, H] = STUDIO.vertical ? [720, 1280] : [1280, 720];
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const prev = $('#stPreview'), pg = prev ? prev.getContext('2d') : null;
  const mirror = () => { if (pg) pg.drawImage(cv, 0, 0, prev.width, prev.height); };
  const mt = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'].find(t => MediaRecorder.isTypeSupported(t)) || '';
  let rec; try { rec = new MediaRecorder(cv.captureStream(30), mt ? {mimeType:mt, videoBitsPerSecond:5e6} : undefined); } catch (e) { toast('Enregistrement impossible ici.'); return; }
  const chunks = []; rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  STUDIO.running = true; STUDIO.cancel = false; $('#stProg').hidden = false; $('#stGo').disabled = true; $('#stCancel').hidden = false;
  const step = (i, msg) => { const b = $('#stBar'), s = $('#stStep'); if (b) b.style.width = Math.round(i * 100) + '%'; if (s) s.textContent = msg; };
  const wasMuted = v.muted; v.muted = true; v.pause();
  const card = async (kind, ms) => { const t0 = performance.now(); while (performance.now() - t0 < ms && !STUDIO.cancel) { studioPaintCard(cv, kind, (performance.now() - t0) / ms); mirror(); await raf(); } };
  try {
    rec.start(250);
    if (STUDIO.intro) { step(0, 'Carton d’ouverture'); await card('intro', 3000); }
    for (let i = 0; i < list.length && !STUDIO.cancel; i++) {
      const c = list[i]; step(i / list.length, `Clip ${i + 1} sur ${list.length} : ${ctype(c.type)[1]}`);
      rec.pause(); v.currentTime = c.t; await once(v, 'seeked', 3000); studioPaintFrame(g, v, W, H, c, STUDIO); mirror(); rec.resume();
      v.playbackRate = 1; await v.play().catch(() => {});
      const at = c.at || (c.t + 3); let frozen = !(STUDIO.spot && c.box && c.at);
      while (!STUDIO.cancel && v.currentTime < c.t + c.dur && !v.ended) {
        if (!frozen && v.currentTime >= at - .03) { // arrêt sur image : le cercle tombe exactement sur le joueur
          frozen = true; v.pause(); const t0 = performance.now(), o = Object.assign({}, STUDIO, {freeze:true});
          while (performance.now() - t0 < 900 && !STUDIO.cancel) { studioPaintFrame(g, v, W, H, c, o); mirror(); await raf(); }
          await v.play().catch(() => {});
        }
        const slow = STUDIO.slow && c.at && Math.abs(v.currentTime - at) <= .75; const r = slow ? .5 : 1; if (v.playbackRate !== r) v.playbackRate = r;
        studioPaintFrame(g, v, W, H, c, STUDIO); mirror(); await raf();
      }
      v.pause();
    }
    if (STUDIO.outro && !STUDIO.cancel) { step(1, 'Carton de fin'); await card('outro', 3000); }
    const stopped = once(rec, 'stop'); rec.stop(); await stopped;
  } finally { v.playbackRate = VT.speed; v.muted = wasMuted; STUDIO.running = false; }
  if (STUDIO.cancel) { toast('Montage arrêté.'); closeModal(); return; }
  const blob = new Blob(chunks, {type:(mt || 'video/webm').split(';')[0]});
  step(1, 'Ajout au profil…');
  const ok = await addVideoBlob(blob, {title:(STUDIO.vertical ? 'Format vertical · ' : 'Temps forts · ') + (m.opponent || m.title), type:STUDIO.vertical ? 'Format vertical (réseaux)' : 'Temps forts', source:'studio'});
  if (ok !== false) {
    // Les WebM enregistrés par le navigateur n'indiquent pas leur durée : on la calcule.
    const vd = isFinite(v.duration) ? v.duration : Infinity;
    const secs = (STUDIO.intro ? 3 : 0) + (STUDIO.outro ? 3 : 0) + list.reduce((a, c) => a + Math.max(0, Math.min(c.dur, vd - c.t)) + (STUDIO.slow && c.at ? 1.5 : 0) + (STUDIO.spot && c.box && c.at ? .9 : 0), 0);
    const nv = state.player.videos[state.player.videos.length - 1]; if (nv && !nv.duration) { nv.duration = Math.round(secs); save(); render(); }
    closeModal();
  }
};

/* ---------- Chapitres des vidéos du profil ---------- */
ACT.chapters = function (id) {
  const v = findVideo(id); if (!v) return; v.chapters = v.chapters || [];
  const playable = !v.demo && (v.localKey || v.assetId);
  openModal(`Chapitres · ${v.title}`, `${playable ? `<div class="vmedia"><video id="chapVid" data-media="${v.id}" data-vid="${v.id}" data-owner="self" controls playsinline poster="${esc(v.thumb)}"></video></div>` : '<p class="small muted" style="margin:0">Vidéo sans fichier lisible ici : indique les minutes à la main.</p>'}
    <div class="form"><div class="field"><label for="ch_t">Instant (min:s)</label><input id="ch_t" placeholder="1:24" inputmode="numeric"></div><div class="field"><label for="ch_l">Titre du chapitre</label><input id="ch_l" placeholder="Passe décisive" maxlength="40"></div></div>
    <div class="actions">${playable ? '<button class="btn" data-action="chapNow">Prendre l’instant de la vidéo</button>' : ''}<button class="btn primary" data-action="chapAdd" data-arg="${v.id}">Ajouter</button></div>
    <div class="list" id="chapList">${chapListHTML(v)}</div>
    <p class="tiny muted" style="margin:0">Les chapitres apparaissent sous la vidéo du profil public : un recruteur va droit à l’action.</p>`, true);
  if (playable && typeof hydrateMedia === 'function') hydrateMedia();
};
function chapListHTML(v) { return (v.chapters || []).slice().sort((a, b) => a.t - b.t).map(c => `<div class="row"><span class="num muted">${tc(c.t)}</span><span class="grow">${esc(c.l)}</span><button class="btn sm icon" data-action="chapDel" data-arg="${v.id}|${c.t}" aria-label="Supprimer ${esc(c.l)}">✕</button></div>`).join('') || '<div class="empty">Aucun chapitre.</div>'; }
Object.assign(ACT, {
  chapNow() { const v = $('#chapVid'), i = $('#ch_t'); if (v && i) i.value = tc(v.currentTime); },
  chapAdd(id) {
    const v = findVideo(id); if (!v) return; const raw = ($('#ch_t') || {}).value || '', l = (($('#ch_l') || {}).value || '').trim();
    const parts = raw.split(':').map(x => parseFloat(x.replace(',', '.'))); const t = parts.length === 2 ? parts[0] * 60 + parts[1] : parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0];
    if (!isFinite(t) || t < 0) { invalid('ch_t', 'Format attendu : 1:24'); return; } if (!l) { invalid('ch_l', 'Donne un titre au chapitre.'); return; }
    (v.chapters = v.chapters || []).push({t:Math.round(t), l}); save(); $('#chapList').innerHTML = chapListHTML(v); $('#ch_l').value = ''; $('#ch_l').focus();
  },
  chapDel(a) { const [id, t] = String(a).split('|'); const v = findVideo(id); if (!v) return; v.chapters = (v.chapters || []).filter(c => String(c.t) !== t); save(); $('#chapList').innerHTML = chapListHTML(v); },
  seekTo(a, el) { const t = +a, box = el.closest('.vmedia-wrap') || el.closest('.pp2-sec') || document; const vid = box.querySelector('video'); if (vid) { vid.currentTime = t; vid.play().catch(() => {}); } }
});
const publicVideosHTMLV5 = publicVideosHTML;
publicVideosHTML = function (p, exp) {
  let html = publicVideosHTMLV5(p, exp);
  const vs = (p.videos || []).filter(v => v.visible).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  if (!vs.length) return html;
  const L = (p.look && p.look.lang) || 'en';
  if (L === 'en') html = html.replace(/>Temps forts</g, '>Highlights<');
  const f = vs[0], ch = (f.chapters || []).slice().sort((a, b) => a.t - b.t);
  if (ch.length) {
    const chips = `<div class="chapchips" role="list">${ch.map(c => exp ? `<span role="listitem">${tc(c.t)} · ${esc(c.l)}</span>` : `<button type="button" role="listitem" data-action="seekTo" data-arg="${c.t}">${tc(c.t)} · ${esc(c.l)}</button>`).join('')}</div>`;
    const i = html.indexOf('</div>', html.indexOf('vmedia')); // après le premier lecteur
    html = i > 0 ? html.slice(0, i + 6) + chips + html.slice(i + 6) : html + chips;
  }
  return html;
};

