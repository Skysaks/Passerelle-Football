/* ---------- Fenêtres ---------- */
function openModal(title, body, wide) {
  const m = $('#modal');
  m.innerHTML = `<div class="sheet${wide ? ' wide' : ''}"><div class="sheet-h"><h2>${esc(title)}</h2><button class="btn sm" data-action="closeModal">Fermer</button></div><div class="sheet-b">${body}</div></div>`;
  m.hidden = false;
  const f = m.querySelector('input,select,textarea,button:not([data-action="closeModal"])'); if (f) f.focus();
  hydrateMedia();
}
function closeModal() { $('#modal').hidden = true; $('#modal').innerHTML = ''; render(); }
let toastT;
function toast(t) { const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, 3200); }

function programReadHTML(pr) {
  const isUni = ORGS[pr.org] && ORGS[pr.org].uni; const r = matchScore(state.player, pr);
  const net = Math.max(0, n0(pr.costAnnual) - n0(pr.avgAid));
  return `<div style="display:flex;gap:14px;align-items:center"><div class="score ${scoreClass(r.score)}">${r.score}</div><div><div class="prog-meta"><span>${esc(pr.type)}</span><span>${esc(pr.org)}</span><span>${esc(pr.conference)}</span><span>${esc(pr.city)}, ${esc(pr.region)}, ${esc(pr.country)}</span><span>${esc(pr.gender)}</span></div><div class="reasons">${reasonsHTML(r)}</div></div></div>
  ${pr.demo ? '<div class="callout warn small">Fiche d’exemple fictive : nom, chiffres et contacts inventés pour la démonstration.</div>' : ''}
  <div class="grid g3">${isUni ? `<div class="card kpi"><span class="v">${money(pr.costAnnual, pr.currency)}</span><span class="l">Coût annuel total</span></div><div class="card kpi"><span class="v">${money(pr.avgAid, pr.currency)}</span><span class="l">Aide moyenne</span></div><div class="card kpi"><span class="v">${money(net * rate(pr.currency))}</span><span class="l">Reste à charge estimé / an</span></div>` : ''}<div class="card kpi"><span class="v">${pr.intlShare !== '' ? esc(pr.intlShare) + ' %' : '—'}</span><span class="l">Internationaux</span></div><div class="card kpi"><span class="v">${esc(pr.rosterSize || '—')}</span><span class="l">Taille de l’effectif</span></div><div class="card kpi"><span class="v" style="font-size:1.25rem">${fdate(pr.deadline)}</span><span class="l">Date limite</span></div></div>
  <div><h3 style="margin-bottom:8px">Besoins</h3><div class="chips">${Object.entries(pr.needs || {}).filter(([, n]) => n0(n) > 0).map(([p, n]) => `<span class="pill acc">${esc(p)} × ${n}</span>`).join('') || '<span class="muted">Non renseignés</span>'}</div></div>
  ${isUni ? `<div class="small"><b>Admission :</b> GPA min. ${esc(pr.gpaMin || '—')} · anglais ${esc(pr.englishMin || '—')} · ${esc(pr.majors || '')}</div>` : (pr.majors ? `<div class="small">${esc(pr.majors)}</div>` : '')}
  ${pr.notes ? `<div class="callout small">${esc(pr.notes)}</div>` : ''}
  <div><h3 style="margin-bottom:8px">Staff</h3><div class="list">${pr.staff.map((s, si) => `<div class="row"><div class="grow"><div class="t">${esc(s.name)}</div><div class="small muted">${esc(s.role)} · ${esc(s.languages)} · ${esc(s.email)}</div></div><button class="btn sm" data-action="compose" data-arg="${pr.id}:${si}">Écrire</button></div>`).join('') || '<div class="empty">Aucun contact.</div>'}</div></div>
  <div class="actions">${state.player.pipeline[pr.id] ? `<span class="pill acc">Suivi : ${esc(state.player.pipeline[pr.id])}</span>` : `<button class="btn primary" data-action="follow" data-arg="${pr.id}">Suivre ce programme</button>`}<button class="btn" data-action="editProgram" data-arg="${pr.id}">Compléter la fiche</button>${pr.website ? `<a class="btn" href="${esc(pr.website)}" target="_blank" rel="noopener">Site officiel</a>` : ''}</div>`;
}

/* ---------- Messages ---------- */
function emailTemplate(pr, s) {
  const p = state.player, lv = levelOf(p.level), age = ageAt(p.birthDate), gpa = gpaFrom20(p.academic.average);
  const year = p.project.availableFrom ? new Date(p.project.availableFrom).getFullYear() : '';
  const last = (s && s.name ? s.name.split(' ').slice(-1)[0] : '');
  const need = n0((pr.needs || {})[p.position]);
  const subject = `${year} ${POS_EN[p.position] || p.position}, ${p.firstName} ${p.lastName} (${[p.club, lv ? lv[1].split(' (')[0] : ''].filter(Boolean).join(', ')})`;
  const lines = [
    `Dear Coach ${last},`, '',
    `My name is ${p.firstName} ${p.lastName}, a ${age != null ? age + '-year-old ' : ''}${(POS_EN[p.position] || p.position || 'player').toLowerCase()} from ${p.city || 'France'}, currently playing for ${p.club}${lv ? ' in ' + lv[3] : ''}. I am interested in joining ${pr.name}${year ? ' for fall ' + year : ''}.`, '',
    `Season ${p.stats.season}: ${p.stats.matches || '—'} matches, ${p.stats.minutes || '—'} minutes, ${p.stats.goals || 0} goals, ${p.stats.assists || 0} assists${p.statsValidated ? ' (verified by my coach)' : ''}. ${p.height ? 'Height ' + p.height + ' cm, ' : ''}${p.foot ? ({Droit:'right', Gauche:'left', 'Les deux':'both'}[p.foot]) + ' foot.' : ''}`,
    `Academics: ${p.academic.diploma === 'Bac obtenu' ? 'French Baccalauréat' : p.academic.diploma || '—'}${p.academic.average ? ', average ' + p.academic.average + '/20' + (gpa != null ? ' (approx. ' + gpa.toFixed(1) + ' GPA)' : '') : ''}${p.academic.englishTest && p.academic.englishTest !== 'Aucun' ? '; ' + p.academic.englishTest + ' ' + p.academic.englishScore : ''}.`,
    need > 0 ? `I understand your program may have openings at my position next season.` : '',
    '', `My recruiting profile and highlights: ${p.links.highlight || '[link to my profile]'}`, `${p.endorsements.length ? 'My coach, ' + p.endorsements[0].coach + ', is happy to provide a reference.' : ''}`, '',
    'Thank you for your time. I would welcome the chance to talk.', '', 'Best regards,', `${p.firstName} ${p.lastName}`, `${p.email}${p.phone ? ' · ' + p.phone : ''}`
  ].filter((l, i, a) => !(l === '' && a[i - 1] === ''));
  return {subject, body:lines.join('\n').replace(/\n{3,}/g, '\n\n')};
}
let draft = null;
function composeModal(prId, si, msgId) {
  if (msgId) { const m = state.messages.find(x => x.id === msgId); draft = {...m}; }
  else {
    const pr = findProgram(prId) || state.programs[0]; const idx = si != null && si >= 0 ? si : 0; const s = pr.staff[idx];
    const t = emailTemplate(pr, s);
    draft = {id:uid(), programId:pr.id, staffIdx:idx, coachName:s ? s.name : '', coachEmail:s ? s.email : '', subject:t.subject, body:t.body, status:'brouillon', dir:'out', date:today()};
  }
  renderCompose();
}
function renderCompose() {
  const pr = findProgram(draft.programId), o = ORGS[pr.org] || {};
  const mailto = `mailto:${encodeURIComponent(draft.coachEmail)}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
  openModal('Écrire à un entraîneur', `
  <div class="form"><div class="field"><label for="c_prog">Programme</label><select id="c_prog" data-draft="programId">${state.programs.map(x => `<option value="${x.id}"${x.id === draft.programId ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
  <div class="field"><label for="c_staff">Destinataire</label><select id="c_staff" data-draft="staffIdx">${pr.staff.map((s, i) => `<option value="${i}"${i === n0(draft.staffIdx) ? ' selected' : ''}>${esc(s.name)} · ${esc(s.role)}</option>`).join('') || '<option>Aucun contact dans la fiche</option>'}</select></div>
  <div class="field wide"><label for="c_subj">Objet</label><input type="text" id="c_subj" data-draft="subject" value="${esc(draft.subject)}"></div>
  <div class="field wide"><label for="c_body">Message (en anglais)</label><textarea id="c_body" data-draft="body" rows="14">${esc(draft.body)}</textarea></div></div>
  ${o.ncaa && !o.noAth ? '<div class="callout warn small">NCAA D1 et D2 : les entraîneurs ne peuvent pas initier le contact avant le 15 juin qui suit la 2e année de lycée américain (environ la fin de la Seconde). Tu peux écrire avant, mais ils peuvent ne pas répondre.</div>' : ''}
  <div class="small muted">Adresse : <b>${esc(draft.coachEmail || '—')}</b>. Les faits du message viennent uniquement de ton profil : relis-le avant l’envoi.</div>
  <div class="actions"><button class="btn" data-action="draftTemplate">Régénérer depuis le profil</button>${caps.sample ? `<button class="btn" data-action="draftAI"${ui.aiBusy ? ' disabled' : ''}>${ui.aiBusy ? 'Rédaction…' : 'Personnaliser avec Claude'}</button>` : ''}<span style="flex:1"></span><button class="btn" data-action="copyDraft">Copier</button><a class="btn" href="${mailto}">Ouvrir dans ma messagerie</a><button class="btn" data-action="saveDraft" data-arg="brouillon">Enregistrer le brouillon</button><button class="btn primary" data-action="saveDraft" data-arg="envoyé">Marquer comme envoyé</button></div>`, true);
}

