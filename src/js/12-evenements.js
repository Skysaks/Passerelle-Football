/* ---------- Événements ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]'); if (!el || el.disabled) return;
  if (el.tagName === 'INPUT') return;
  const fn = ACT[el.dataset.action]; if (!fn) return;
  e.preventDefault(); fn(el.dataset.arg, el, e);
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.bind && el.type !== 'checkbox' && el.tagName !== 'SELECT') {
    if (el.dataset.num) {
      const raw = el.value.trim().replace(/\s/g, '').replace(',', '.');
      if (raw !== '' && isNaN(Number(raw))) { el.setAttribute('aria-invalid', 'true'); let er = document.getElementById(el.id + '-err'); if (!er) { er = document.createElement('p'); er.id = el.id + '-err'; er.className = 'field-err'; el.insertAdjacentElement('afterend', er); } er.textContent = 'Nombre attendu, par exemple 4,05'; el.setAttribute('aria-describedby', er.id); return; }
      set(el.dataset.bind, raw === '' ? '' : Number(raw)); saveSoon(); refreshLive(); return;
    }
    set(el.dataset.bind, el.type === 'number' ? (el.value === '' ? '' : Number(el.value)) : el.value);
    saveSoon(); refreshLive();
  } else if (el.dataset.draft && el.tagName !== 'SELECT') { draft[el.dataset.draft] = el.value; }
  else if (el.dataset.ui && el.type !== 'checkbox' && el.tagName !== 'SELECT') {
    setUI(el.dataset.ui, el.value); clearTimeout(window._uiT); window._uiT = setTimeout(render, 250);
  }
});
function setUI(path, val) { const ks = path.split('.'); let o = ui; for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]]; o[ks[ks.length - 1]] = val; }
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.upload === 'video') { const f = el.files[0]; el.value = ''; if (f) addVideoBlob(f, {title:f.name.replace(/\.[^.]+$/, ''), source:'upload'}); return; }
  if (el.dataset.doc) { const f = el.files[0], k = el.dataset.doc; el.value = ''; if (!f) return; (async () => { const key = 'd_' + k; let ok = false; try { await IDB.put(key, f); ok = true; } catch (e) {} if (!ok) { toast('Impossible de stocker ce fichier sur cet appareil.'); return; } state.player.docs[k] = {status:'fourni', name:f.name, date:today(), localKey:key}; save(); render(); toast('Pièce ajoutée au dossier.'); })(); return; }
  if (el.dataset.file) { const f = el.files[0]; if (f) { const m = state.matches.find(x => x.id === el.dataset.file); videoURLs[el.dataset.file] = URL.createObjectURL(f); if (m) { m.fileName = f.name; if (m.source === 'demo') m.source = 'file'; save(); } render(); } return; }
  if (el.dataset.import) { const f = el.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { const s = JSON.parse(r.result); if (s.version !== 1 || !s.player) throw 0; state = migrate(s); save(); render(); toast('Données importées.'); } catch (x) { toast('Fichier non reconnu : exporte-le depuis Passerelle.'); } }; r.readAsText(f); return; }
  if (el.dataset.actionChange) { const fn = CHANGE_ACT[el.dataset.actionChange]; if (fn) fn(el.dataset.arg, el); return; }
  if (el.dataset.onchange === 'clipFilter') { ui.clipFilter = el.value; refreshClips(); return; }
  if (el.dataset.onchange === 'tagPlayer') { ui.tagPlayer = el.value; return; }
  if (el.dataset.bind && el.type === 'date' && /birthDate$/.test(el.dataset.bind)) { rerenderSoon(); return; }
  if (el.dataset.multi) { const arr = get(el.dataset.multi) || []; const v = el.value; set(el.dataset.multi, el.checked ? [...new Set([...arr, v])] : arr.filter(x => x !== v)); save(); refreshLive(); return; }
  if (el.dataset.draft) {
    draft[el.dataset.draft] = el.value;
    if (el.dataset.draft === 'programId' || el.dataset.draft === 'staffIdx') { if (el.dataset.draft === 'programId') draft.staffIdx = 0; const pr = findProgram(draft.programId); const s = pr.staff[n0(draft.staffIdx)]; draft.coachName = s ? s.name : ''; draft.coachEmail = s ? s.email : ''; const t = emailTemplate(pr, s); draft.subject = t.subject; draft.body = t.body; renderCompose(); }
    return;
  }
  if (el.dataset.ui && (el.tagName === 'SELECT' || el.type === 'checkbox')) { setUI(el.dataset.ui, el.type === 'checkbox' ? el.checked : el.value); render(); return; }
  if (el.dataset.bind && (el.tagName === 'SELECT' || el.type === 'checkbox')) {
    set(el.dataset.bind, el.type === 'checkbox' ? el.checked : el.value); save(); refreshLive();
    const inModal = !!el.closest('#modal');
    if (inModal) { const pi = el.dataset.bind.match(/^programs\.(\d+)\.(org|type)$/); if (pi) ACT.editProgram(state.programs[+pi[1]].id); return; }
    if (el.dataset.rerender || /\.(position|level|org|type|gender|birthDate)$/.test(el.dataset.bind) || el.dataset.bind.startsWith('offers.')) rerenderSoon();
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#modal').hidden) { closeModal(); return; }
  const tag = (e.target.tagName || '').toLowerCase(); if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
  if ($('#mv') && $('#modal').hidden && /^[1-9]$/.test(e.key)) { const c = CLIP_TYPES.find(x => x[2] === e.key); if (c) { e.preventDefault(); addTag(c[0]); } }
});
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
window.addEventListener('hashchange', render);

