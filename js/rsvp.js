/* RSVP → Google Form (no database). Answers land in the form's Google Sheet. */
window.RSVP = (() => {
  'use strict';
  const C = window.WEDDING;
  const R = C.rsvp;
  const LS_RSVP = 'wedding.rsvp';
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
  };
  let ctx;
  const state = { name: '', email: '', attendance: '', guests: '1', message: '', error: '', sending: false, submitted: null };
  const isDemo = () => !R.formAction;
  const hasEmail = () => Boolean(R.fields.email); // optional field, shown only when the form has an Email question
  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  function init(c) {
    ctx = c;
    const saved = store.get(LS_RSVP);
    if (saved?.attendance) Object.assign(state, { submitted: saved.attendance, name: saved.name || '', email: saved.email || '' });
    if (!state.name && ctx.guestName) state.name = ctx.guestName;
  }

  /* ---------- form ---------- */
  function render() {
    const { esc, ui } = ctx;
    if (state.submitted) {
      return `
        <div class="thanks" role="status">
          <p class="script">${esc(ui('thanksTitle'))}</p>
          <p class="lead">${esc(ui(state.submitted === 'yes' ? 'thanksYes' : 'thanksNo'))}</p>
          ${hasEmail() && state.email ? `<p class="thanks-email">${esc(ui('thanksEmail'))} <strong translate="no">${esc(state.email)}</strong></p>` : ''}
          <button class="link-btn" type="button" data-rsvp-reset>${esc(ui('changeAnswer'))}</button>
        </div>`;
    }
    const opts = Array.from({ length: Math.max(1, R.maxGuests || 1) }, (_, i) => i + 1)
      .map((n) => `<option value="${n}" ${String(n) === state.guests ? 'selected' : ''}>${n} ${esc(ui('fGuestUnit'))}</option>`).join('');
    const radio = (v, key) => `
      <label class="choice"><input type="radio" name="attendance" value="${v}" ${state.attendance === v ? 'checked' : ''}><span>${esc(ui(key))}</span></label>`;
    return `
      <form class="rsvp-form" novalidate>
        <div class="field">
          <label for="r-name">${esc(ui('fName'))}</label>
          <input class="input" id="r-name" name="name" autocomplete="name" maxlength="80" required
            placeholder="${esc(ui('fNamePh'))}" value="${esc(state.name)}">
        </div>
        ${hasEmail() ? `
        <div class="field">
          <label for="r-email">${esc(ui('fEmail'))} <span class="opt">${esc(ui('fOptional'))}</span></label>
          <input class="input" id="r-email" name="email" type="email" inputmode="email" autocomplete="email"
            spellcheck="false" autocapitalize="off" maxlength="120" aria-describedby="r-email-hint"
            placeholder="${esc(ui('fEmailPh'))}" value="${esc(state.email)}">
          <p class="field-hint" id="r-email-hint">${esc(ui('fEmailHint'))}</p>
        </div>` : ''}
        <div class="field" role="radiogroup" aria-labelledby="r-att">
          <span class="flabel" id="r-att">${esc(ui('fAttend'))}</span>
          <div class="choices">${radio('yes', 'fYes')}${radio('no', 'fNo')}</div>
        </div>
        <div class="field" id="r-guests-f" ${state.attendance === 'yes' ? '' : 'hidden'}>
          <label for="r-guests">${esc(ui('fGuests'))}</label>
          <select class="select" id="r-guests" name="guests">${opts}</select>
        </div>
        <div class="field">
          <label for="r-msg">${esc(ui('fMessage'))} <span class="opt">${esc(ui('fOptional'))}</span></label>
          <textarea class="textarea" id="r-msg" name="message" maxlength="500" placeholder="${esc(ui('fMessagePh'))}">${esc(state.message)}</textarea>
        </div>
        <div class="hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
        <p class="form-error" role="alert">${esc(state.error)}</p>
        <button class="btn" type="submit" ${state.sending ? 'disabled' : ''}>${esc(ui(state.sending ? 'fSending' : 'fSend'))}</button>
        ${isDemo() ? `<p class="demo-note">${esc(ui('demoNote'))}</p>` : ''}
      </form>`;
  }

  function rerender() {
    const body = document.getElementById('rsvp-body');
    if (!body) return;
    body.innerHTML = render();
    bind(body);
  }

  function bind(root) {
    const form = root.querySelector('.rsvp-form');
    const reset = root.querySelector('[data-rsvp-reset]');
    if (reset) reset.addEventListener('click', () => { state.submitted = null; rerender(); document.getElementById('r-name')?.focus(); });
    if (!form) return;
    form.addEventListener('input', (e) => {
      const { name, value } = e.target;
      if (name in state) state[name] = value;
      if (name === 'attendance') form.querySelector('#r-guests-f').hidden = value !== 'yes';
      if (state.error) { state.error = ''; form.querySelector('.form-error').textContent = ''; }
    });
    form.addEventListener('submit', (e) => { e.preventDefault(); submit(form); });
  }

  async function submit(form) {
    if (state.sending) return;
    const { ui } = ctx;
    state.name = state.name.trim();
    state.email = state.email.trim();
    state.message = state.message.trim();
    const emailBad = hasEmail() && state.email && !validEmail(state.email);
    const err = !state.name ? 'errName' : emailBad ? 'errEmail' : !state.attendance ? 'errAttend' : '';
    if (err) {
      state.error = ui(err);
      form.querySelector('.form-error').textContent = state.error;
      form.querySelector({ errName: '#r-name', errEmail: '#r-email', errAttend: 'input[name="attendance"]' }[err]).focus();
      return;
    }
    if (form.website.value) return; // bot filled the hidden field

    state.sending = true;
    rerender();
    const yes = state.attendance === 'yes';
    const body = new URLSearchParams({
      [R.fields.name]: state.name,
      [R.fields.attendance]: R.attendanceValues[state.attendance],
      [R.fields.guests]: yes ? state.guests : '0',
      [R.fields.message]: state.message,
    });
    // the Apps Script on the Google Form reads these to send the confirmation email in the guest's language
    if (hasEmail()) body.append(R.fields.email, state.email);
    if (R.fields.lang) body.append(R.fields.lang, ctx.getLang());
    try {
      if (isDemo()) {
        console.info('[RSVP demo] would send:', Object.fromEntries(body));
        await new Promise((r) => setTimeout(r, 700));
      } else {
        // Google Forms sends no CORS headers: the response is opaque, but the entry is recorded.
        await fetch(R.formAction, { method: 'POST', mode: 'no-cors', body });
      }
      state.submitted = state.attendance;
      store.set(LS_RSVP, { attendance: state.attendance, name: state.name, email: state.email, at: Date.now() });
      state.message = '';
    } catch {
      state.error = ui('errNetwork');
    }
    state.sending = false;
    rerender();
  }

  return { init, render, bind };
})();
