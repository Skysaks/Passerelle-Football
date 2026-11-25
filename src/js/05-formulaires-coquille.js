/* ---------- Champs de formulaire ---------- */
function fid(path) { return 'f_' + path.replace(/[^a-z0-9]/gi, '_'); }
function F(path, label, type, opt) {
  type = type || 'text'; opt = opt || {};
  const v = get(path), id = fid(path);
  let ctl;
  if (type === 'select') {
    ctl = `<select id="${id}" data-bind="${path}">${opt.noEmpty ? '' : '<option value="">—</option>'}${opt.options.map(o => { const [val, lab] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(val)}"${String(v ?? '') === String(val) ? ' selected' : ''}>${esc(lab)}</option>`; }).join('')}</select>`;
  } else if (type === 'textarea') {
    ctl = `<textarea id="${id}" data-bind="${path}" rows="${opt.rows || 3}" placeholder="${esc(opt.ph || '')}">${esc(v ?? '')}</textarea>`;
  } else if (type === 'check') {
    return `<label class="check${opt.wide ? ' field wide' : ''}"><input type="checkbox" id="${id}" data-bind="${path}"${v ? ' checked' : ''}${opt.rerender ? ' data-rerender="1"' : ''}><span>${esc(label)}</span></label>`;
  } else {
    const isNum = type === 'number';
    const shown = isNum ? (v === '' || v == null ? '' : String(v).replace('.', ',')) : (v ?? '');
    ctl = `<input id="${id}" type="${isNum ? 'text' : type}" data-bind="${path}" value="${esc(shown)}"${isNum ? ' inputmode="decimal" data-num="1"' : ''} placeholder="${esc(opt.ph || '')}" autocomplete="${type === 'email' ? 'email' : type === 'tel' ? 'tel' : 'off'}">`;
  }
  return `<div class="field${opt.wide ? ' wide' : ''}"><label for="${id}">${esc(label)}${opt.unit ? ` <span class="unit">(${esc(opt.unit)})</span>` : ''}</label>${ctl}${opt.help ? `<small>${esc(opt.help)}</small>` : ''}</div>`;
}
function MULTI(path, label, options) {
  const v = get(path) || [];
  return `<div class="field wide"><label>${esc(label)}</label><div class="chips">${options.map((o, i) => `<label class="chipbox"><input type="checkbox" id="${fid(path)}_${i}" data-multi="${path}" value="${esc(o)}"${v.includes(o) ? ' checked' : ''}>${esc(o)}</label>`).join('')}</div></div>`;
}
function ring(p, label) { return `<div style="display:flex;align-items:center;gap:12px"><div class="ring" style="--p:${p}"><span>${p}%</span></div>${label ? `<div><div style="font-weight:600">${esc(label)}</div></div>` : ''}</div>`; }

/* ---------- Coquille ---------- */
function unread(role) { return state.notifications.filter(n => n.to === role && !n.read).length; }
function currentRoute() {
  const h = location.hash.slice(1);
  for (const r of ['joueur','entraineur','recruteur','operateur']) if (NAV[r] && NAV[r].some(x => x[0] === h)) { if (state.role !== r) state.role = r; return h; }
  if (NAV.commun.some(x => x[0] === h)) return h;
  return HOME[state.role];
}
function shell(content, route) {
  const nav = NAV[state.role].map(([k, l]) => `<a href="#${k}"${k === route ? ' aria-current="page"' : ''}><span>${esc(l)}</span>${k === HOME[state.role] && unread(state.role) ? `<span class="badge">${unread(state.role)}</span>` : ''}</a>`).join('');
  const com = NAV.commun.map(([k, l]) => `<a href="#${k}"${k === route ? ' aria-current="page"' : ''}><span>${esc(l)}</span></a>`).join('');
  return `<div class="app"><aside class="side">
    <div class="brand"><div class="logo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><path d="M3 17c4-8 14-8 18 0"/><path d="M7 17v-4M12 17v-6M17 17v-4"/></svg></div><b>Passerelle</b></div>
    <div class="seg" role="group" aria-label="Rôle">${Object.keys(ROLE_LABEL).map(r => `<button type="button" data-action="role" data-arg="${r}" aria-pressed="${state.role === r}">${ROLE_LABEL[r]}</button>`).join('')}</div>
    <nav class="nav" aria-label="Navigation">${nav}<div class="lbl">Commun</div>${com}</nav>
    <div class="demo-note">Prototype. Universités, clubs, entraîneurs et joueurs d’exemple sont <b>fictifs</b>. Tes saisies restent dans ce navigateur.</div>
  </aside><main class="main" id="main">${content}</main></div>`;
}
function head(title, sub, actions) { return `<div class="head"><div><h1>${esc(title)}</h1>${sub ? `<p>${sub}</p>` : ''}</div>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`; }

