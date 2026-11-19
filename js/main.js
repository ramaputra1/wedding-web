/* Renders the invitation from js/config.js and wires up every interaction. */
(() => {
  'use strict';
  const C = window.WEDDING;
  const I = window.I18N;
  const LS_LANG = 'wedding.lang';

  /* ---------- helpers ---------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };
  let lang = ['id', 'en'].includes(store.get(LS_LANG)) ? store.get(LS_LANG) : (C.defaultLang || 'id');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const t = (v) => (v == null ? '' : typeof v === 'object' ? (v[lang] ?? v.id ?? v.en ?? '') : String(v));
  const ui = (k) => t(I[k]);
  const locale = () => (lang === 'id' ? 'id-ID' : 'en-GB');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const fmtDate = (iso, opts) => new Intl.DateTimeFormat(locale(), { timeZone: C.timeZone, ...opts }).format(new Date(iso));
  const longDate = (iso) => fmtDate(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const shortDate = (iso) => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: C.timeZone, day: '2-digit', month: '2-digit', year: 'numeric' })
      .formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
    return `${p.day} · ${p.month} · ${p.year}`;
  };
  const time = (iso) => (lang === 'en'
    ? new Intl.DateTimeFormat('en-US', { timeZone: C.timeZone, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso)) // 11:00 AM
    : fmtDate(iso, { hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '.')); // 11.00

  /* ---------- guest + couple ---------- */
  const guestName = (new URLSearchParams(location.search).get(C.guest?.param || 'to') || '').trim().replace(/\s+/g, ' ').slice(0, 80);
  const [p1, p2] = C.couple.first === 'groom' ? [C.couple.groom, C.couple.bride] : [C.couple.bride, C.couple.groom];
  const namesInline = `${p1.nick} & ${p2.nick}`;
  const namesStacked = `<span class="n1">${esc(p1.nick)}</span><span class="amp">&amp;</span><span class="n2">${esc(p2.nick)}</span>`;

  const sprig = '<svg class="sprig" viewBox="0 0 64 22" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" aria-hidden="true"><path d="M2 11h22M40 11h22"/><path d="M32 11c-3-5-8-7-13-6 3 4 7 6 13 6z"/><path d="M32 11c3-5 8-7 13-6-3 4-7 6-13 6z"/><path d="M32 11c-3 5-8 7-13 6 3-4 7-6 13-6z"/><path d="M32 11c3 5 8 7 13 6-3-4-7-6-13-6z"/><circle cx="32" cy="11" r="1.5" fill="currentColor"/></svg>';
  const head = (labelKey, titleKey) => `
    <div class="sec-head">
      <p class="label">${esc(ui(labelKey))}</p>
      ${sprig}
      ${titleKey ? `<h2 class="title">${esc(ui(titleKey))}</h2>` : ''}
    </div>`;
  const section = (id, cls, inner, attrs = '') => `<section id="${id}" class="sec ${cls}"${attrs}><div class="wrap reveal" data-reveal="${id}">${inner}</div></section>`;
  // absolute URL: a url() inside a CSS variable would otherwise resolve against css/
  const cssUrl = (path) => `url('${esc(new URL(path, document.baseURI).href)}')`;
  const icon = {
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="1"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="1"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/></svg>',
    gift: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="8.5" width="17" height="4" rx=".5"/><path d="M5 12.5v8h14v-8M12 8.5v12"/><path d="M12 8.5c-1.5-3-5.5-4.5-6-2s3.5 2 6 2c2.5 0 6.5.5 6-2s-4.5-1-6 2z"/></svg>',
    // a generic bank glyph (roof + columns) — not any bank's actual logo, just a stand-in for cards with no logo file
    bank: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10 12 4l9 6"/><path d="M4 10h16"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/><path d="M3 20h18"/></svg>',
  };

  /* ---------- calendar links ---------- */
  const utc = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const calTitle = (ev) => `${t(ev.name)} — ${namesInline}`;
  // no end time given → block 2 hours in the guest's calendar
  const calEnd = (ev) => ev.end || new Date(new Date(ev.start).getTime() + 2 * 36e5).toISOString();
  const googleCal = (ev) => 'https://calendar.google.com/calendar/render?' + new URLSearchParams({
    action: 'TEMPLATE', text: calTitle(ev), dates: `${utc(ev.start)}/${utc(calEnd(ev))}`,
    location: [ev.venue, ev.address].filter(Boolean).join(', '), details: location.origin + location.pathname,
  });

  /* ---------- gallery photos: empty config list -> 6 empty frames to fill later ---------- */
  const galleryPhotos = () => ((C.gallery || []).length ? C.gallery : Array(6).fill(''));

  /* ---------- gift options (Support Us pop-up + optional gift section) ---------- */
  const giftList = () => {
    const G = C.gift || {};
    const opts = G.options || [];
    // options with a `url` key are links: the whole row is one button (no url yet → shown, not clickable)
    const link = (o) => {
      const tile = `<span class="gl-tile" style="--brand:${esc(o.color || '#2f4450')}" aria-hidden="true">${
        o.logo ? `<span class="gl-logo" style="--logo:${cssUrl(o.logo)}"></span>` : icon.send}</span>`;
      const body = `${tile}
        <span class="gl-text"><span class="gl-name" translate="no">${esc(o.name)}</span>${o.note ? `<span class="gl-note">${esc(t(o.note))}</span>` : ''}</span>
        <span class="gl-go" aria-hidden="true">${icon.arrow}</span>`;
      return o.url
        ? `<a class="gift-link" href="${esc(o.url)}" target="_blank" rel="noopener">${body}</a>`
        : `<span class="gift-link is-pending" aria-disabled="true">${body}</span>`;
    };
    const card = (o) => `
      <div class="gift">
        <span class="gift-tile" style="--brand:${esc(o.color || '#2f4450')}" aria-hidden="true">${
          o.logo ? `<span class="gl-logo" style="--logo:${cssUrl(o.logo)}"></span>` : icon.bank}</span>
        <p class="gift-type" translate="no">${esc(o.name)}</p>
        ${o.number ? `<p class="gift-number" translate="no">${esc(o.number)}</p>` : ''}
        ${o.holder ? `<p class="gift-holder">${esc(ui('accountHolder'))} ${esc(o.holder)}</p>` : ''}
        ${o.number ? `<div class="gift-actions"><button class="btn btn-sm btn-line" type="button" data-copy="${esc(String(o.number).replace(/\s+/g, ''))}">${icon.copy}<span>${esc(ui('copy'))}</span></button></div>` : ''}
      </div>`;
    const links = opts.filter((o) => 'url' in o);
    const cards = opts.filter((o) => !('url' in o));
    const address = G.address ? `
      <div class="gift">
        <p class="gift-type">${esc(ui('giftAddress'))}</p>
        <p class="gift-holder gift-address">${esc(t(G.address))}</p>
        <div class="gift-actions"><button class="btn btn-sm btn-line" type="button" data-copy="${esc(t(G.address))}">${icon.copy}<span>${esc(ui('copy'))}</span></button></div>
      </div>` : '';
    return `
      ${G.intro ? `<p class="lead">${esc(t(G.intro))}</p>` : ''}
      ${links.length ? `<div class="gift-links">${links.map(link).join('')}</div>` : ''}
      ${cards.length || address ? `<div class="gifts">${cards.map(card).join('')}${address}</div>` : ''}`;
  };

  /* ---------- sections ---------- */
  const S = {
    /* First look: collage + countdown. Every picture slot comes from config.firstLook. */
    hero: () => {
      const F = C.firstLook || {};
      const img = (src, alt = '') => (src ? `<img src="${esc(src)}" alt="${esc(alt)}">` : '');
      const deco = (cls, src, d) => `<div class="fl-piece ${cls}${src ? '' : ' is-empty'}" style="--d:${d}ms" aria-hidden="true">${img(src)}</div>`;
      const photos = [0, 1, 2].map((i) => `<div class="fl-photo">${img(F.photos?.[i], `${namesInline} ${i + 1}`)}</div>`).join('');
      const heart = 'M50 88C20 66 2 48 2 28 2 12 14 2 28 2c10 0 18 6 22 14C54 8 62 2 72 2c14 0 26 10 26 26 0 20-18 38-48 60z';
      const contact = (() => {
        const c = String(F.contact || '').trim();
        if (!c) return '';
        if (c.includes('@')) return `<a href="mailto:${esc(c)}">${esc(c)}</a>`;
        if (/^[+\d\s-]{8,}$/.test(c)) return `<a href="https://wa.me/${c.replace(/\D/g, '').replace(/^0/, '62')}" target="_blank" rel="noopener">${esc(c)}</a>`;
        return esc(c);
      })();
      return `
      <section id="home" class="sec first-look on-dark">
        <div class="wrap">
          <h2 class="sr-only">${esc(ui('theWeddingOf'))} ${esc(namesInline)}</h2>
          <div class="collage">
            ${deco('fl-lily', F.lily, 250)}
            <div class="fl-piece fl-frame${F.frame ? ' has-img' : ''}" style="--d:0ms" aria-hidden="true">${img(F.frame)}</div>
            ${deco('fl-greenery', F.greenery, 400)}
            <div class="fl-piece fl-note${F.paper ? ' has-img' : ''}" style="--d:150ms">
              ${F.paper ? `<img class="fl-paper" src="${esc(F.paper)}" alt="">` : ''}
              <p class="title fl-note-text">${esc(t(F.title))}</p>
            </div>
            <div class="fl-piece fl-strip${F.photosBW === false ? '' : ' is-bw'}" style="--d:300ms">${photos}</div>
            ${deco('fl-lace', F.lace, 450)}
            <div class="fl-piece fl-heart" style="--d:500ms">
              <svg viewBox="0 0 100 90" aria-hidden="true"><path class="h-fill" d="${heart}"/><path class="h-line" d="${heart}" transform="translate(50 46) scale(.86) translate(-50 -46)"/></svg>
              <p class="fl-heart-text"><span>${esc(shortDate(C.date).replace(/ · /g, '.'))}</span><span>${t(F.place).split('\n').map(esc).join('<br>')}</span></p>
            </div>
            <div class="fl-piece fl-vinyl-wrap" style="--d:600ms">
              <div class="fl-vinyl" aria-hidden="true"><span class="fl-vinyl-label script" translate="no">${esc(C.couple.monogram)}</span></div>
            </div>
          </div>

          <p class="fl-count-title">${esc(ui('countdownOn'))}</p>
          <div class="fl-countdown" data-countdown>
            ${['days', 'hours', 'minutes', 'seconds'].map((u, i) => `${i ? '<span class="fl-colon" aria-hidden="true">:</span>' : ''}<div class="fl-cd"><span class="fl-num" data-cd="${u}">00</span><span class="fl-unit">${esc(ui(u))}</span></div>`).join('')}
          </div>
          <p class="label" data-cd-done hidden>${esc(ui('countdownDone'))}</p>

          <p class="title fl-tagline">${esc(ui('flTagline'))}</p>
          ${C.sections.rsvp ? `<a class="btn btn-ghost fl-cta" href="#rsvp">${esc(ui('flCta'))}</a>` : ''}
          ${contact ? `<p class="fl-contact">${esc(ui('flContact'))}<br>${contact}</p>` : ''}
          <p class="title fl-names" translate="no">${esc(namesInline)}</p>
          <a class="scroll-hint" href="#${firstAfterHero()}">${esc(ui('scrollHint'))}</a>
        </div>
      </section>`;
    },

    countdown: () => section('countdown', 'bg-navy grain-bg on-dark', `
      ${head('countdownLabel', 'countdownTitle')}
      <div class="countdown" data-countdown>
        ${['days', 'hours', 'minutes', 'seconds'].map((u) => `<div class="cd-cell"><span class="cd-num" data-cd="${u}">00</span><span class="cd-unit">${esc(ui(u))}</span></div>`).join('')}
      </div>
      <p class="cd-done label" data-cd-done hidden>${esc(ui('countdownDone'))}</p>
      <p class="muted">${esc(longDate(C.date))}</p>`),

    story: () => section('story', 'bg-cream', `
      ${head('storyLabel', 'storyTitle')}
      <ol class="timeline">
        ${(C.story || []).map((s) => `
          <li class="tl-item"><span class="tl-year">${esc(s.year)}</span>
            <div><h3 class="tl-title">${esc(t(s.title))}</h3><p class="tl-text">${esc(t(s.text))}</p></div></li>`).join('')}
      </ol>`),

    // with config.eventsPhoto: the venue photo fills the section under a night-blue tint
    events: () => section('events', C.eventsPhoto ? 'bg-photo on-dark' : 'bg-paper', `
      ${head('eventsLabel', 'eventsTitle')}
      <div class="events">
        ${C.events.map((ev) => `
          <article class="event">
            <h3 class="event-name">${esc(t(ev.name))}</h3>
            <p class="event-date">${esc(longDate(ev.start))}</p>
            <p class="event-time">${esc(time(ev.start))}${ev.end ? ` – ${esc(time(ev.end))}` : ''} ${esc(C.timeZoneLabel || '')}</p>
            <p class="event-venue">${esc(t(ev.venue))}</p>
            <p class="event-addr">${esc(t(ev.address))}</p>
            ${ev.note ? `<p class="event-note">${esc(t(ev.note))}</p>` : ''}
            <div class="event-actions">
              ${ev.mapsUrl ? `<a class="btn btn-sm" href="${esc(ev.mapsUrl)}" target="_blank" rel="noopener">${icon.pin}${esc(ui('openMap'))}</a>` : ''}
              <a class="btn btn-sm btn-line" href="${esc(googleCal(ev))}" target="_blank" rel="noopener">${icon.cal}${esc(ui('addCalendar'))}</a>
            </div>
          </article>`).join('')}
      </div>`, C.eventsPhoto ? ` style="--photo:${cssUrl(C.eventsPhoto)}"` : ''),

    // day-of schedule — same timeline look as "Our Story", with a time instead of a year
    agenda: () => section('agenda', 'bg-paper', `
      ${head('agendaLabel', 'agendaTitle')}
      <ol class="timeline timeline-agenda">
        ${(C.agenda || []).map((a) => `
          <li class="tl-item"><span class="tl-time">${esc(time(a.time))}</span>
            <div><h3 class="tl-title">${esc(t(a.title))}</h3>${a.text ? `<p class="tl-text">${esc(t(a.text))}</p>` : ''}</div></li>`).join('')}
      </ol>`),

    dresscode: () => {
      const D = C.dressCode || {};
      return section('dresscode', 'bg-cream', `
        ${head('dressLabel', 'dressTitle')}
        ${D.note ? `<p class="lead">${esc(t(D.note))}</p>` : ''}
        <ul class="swatches">
          ${(D.colors || []).map((c) => `
            <li class="swatch">
              <span class="swatch-dot" style="--c:${esc(c.hex)}" aria-hidden="true"></span>
              <span class="swatch-name">${esc(t(c.name))}</span>
            </li>`).join('')}
        </ul>`);
    },

    // an open envelope with the first photos peeking out; tap -> small gallery pop-up
    gallery: () => {
      const peek = galleryPhotos().slice(0, 3).map((src, i) => `
        <span class="genv-photo genv-p${i}">${src
          ? `<img src="${esc(src)}" alt="" loading="lazy">`
          : `<span class="genv-ph script" translate="no">${esc(C.couple.monogram)}</span>`}</span>`).join('');
      return section('gallery', 'bg-paper', `
        ${head('galleryLabel', 'galleryTitle')}
        <button class="genv" type="button" data-gallery-open aria-haspopup="dialog" aria-label="${esc(ui('galleryOpen'))}">
          <span class="genv-flap" aria-hidden="true"></span>
          <span class="genv-back" aria-hidden="true"></span>
          ${peek}
          <svg class="genv-front" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path class="genv-pocket" d="M0,0 L50,38 L100,0 L100,100 L0,100 Z"/>
            <path class="genv-fold" d="M0,100 L50,56 L100,100"/>
          </svg>
          <span class="genv-seal script" aria-hidden="true" translate="no">${esc(C.couple.monogram)}</span>
        </button>
        <p class="label genv-hint" aria-hidden="true">${esc(ui('galleryOpen'))}</p>`);
    },

    rsvp: () => section('rsvp', 'bg-slate grain-bg on-dark', `
      ${head('rsvpLabel', 'rsvpTitle')}
      ${C.rsvp.deadline ? `<p class="muted">${esc(ui('rsvpBy'))} ${esc(longDate(`${C.rsvp.deadline}T12:00:00${C.date.slice(-6)}`))}</p>` : ''}
      <div id="rsvp-body" style="width:100%">${window.RSVP.render()}</div>`),

    closing: () => section('closing', 'bg-slate grain-bg on-dark sec-short', `
      ${head('closingLabel')}
      <p class="lead">${esc(t(C.closing.text))}</p>
      ${C.closing.hashtag ? `<p class="hashtag">${esc(C.closing.hashtag)}</p>` : ''}`),

    // last section: the same gift options as the pop-up, shown right on the page
    support: () => section('support', 'bg-paper', `
      <span class="support-mark" aria-hidden="true">${icon.gift}</span>
      ${head('giftLabel', 'supportUs')}
      ${giftList()}`),
  };
  const ORDER = ['story', 'countdown', 'events', 'agenda', 'dresscode', 'gallery', 'rsvp', 'closing', 'support'];
  const enabled = () => ORDER.filter((k) => C.sections[k]);
  function firstAfterHero() { return enabled()[0] || 'home'; }

  /* ---------- render ---------- */
  const revealed = new Set();
  let io;
  function render() {
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach((el) => { el.textContent = ui(el.dataset.i18n); });
    $$('[data-i18n-label]').forEach((el) => el.setAttribute('aria-label', ui(el.dataset.i18nLabel)));
    const slots = {
      names: namesInline,
      date: shortDate(C.date),
      monogram: C.couple.monogram,
      guest: guestName || t(C.guest?.fallback),
    };
    $$('[data-slot]').forEach((el) => {
      if (el.dataset.slot === 'names-stacked') el.innerHTML = namesStacked;
      else el.textContent = slots[el.dataset.slot] ?? '';
    });
    $('#open-btn').setAttribute('aria-label', ui('coverOpen'));
    $$('[data-lang-code]').forEach((el) => { el.textContent = lang.toUpperCase(); });
    $$('[data-lang-toggle]').forEach((el) => el.setAttribute('aria-label', `${ui('langSwitch')}: ${lang === 'id' ? 'English' : 'Bahasa Indonesia'}`));
    // navbar links only for sections that are switched on (Home and Gift are always there)
    $$('.bnav a[data-nav]').forEach((a) => { a.hidden = a.dataset.nav !== 'home' && !C.sections[a.dataset.nav]; });
    $('#support-body').innerHTML = giftList();

    const main = $('#content');
    main.innerHTML = S.hero() + enabled().map((k) => S[k]()).join('') +
      `<footer class="foot"><p>${esc(namesInline)} · ${esc(shortDate(C.date))}</p>${C.footer?.credit ? `<p class="foot-credit">${esc(C.footer.credit)}</p>` : ''}</footer>`;

    window.RSVP.bind(main);
    tickCountdown();
    observeReveal(main);
    observeNav(main);
  }

  function observeReveal(root) {
    if (!('IntersectionObserver' in window) || reduced()) return;
    document.documentElement.classList.add('js-reveal');
    io?.disconnect();
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        revealed.add(en.target.dataset.reveal);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    $$('.reveal', root).forEach((el) => {
      if (revealed.has(el.dataset.reveal)) el.classList.add('is-in');
      else io.observe(el);
    });
  }

  /* ---------- navbar: highlight the item of the section in view ---------- */
  // sections without their own item light up their nearest one
  const NAV_FOR = { home: 'home', story: 'story', countdown: 'story', events: 'events', agenda: 'events', dresscode: 'events', gallery: 'gallery', rsvp: 'rsvp', closing: 'rsvp', support: 'support' };
  let navIo;
  function setNav(key) {
    $$('.bnav [data-nav]').forEach((el) => {
      const on = el.dataset.nav === key;
      el.classList.toggle('is-active', on);
      if (on && el.tagName === 'A') el.setAttribute('aria-current', 'true'); else el.removeAttribute('aria-current');
    });
  }
  function observeNav(root) {
    if (!('IntersectionObserver' in window)) return;
    navIo?.disconnect();
    // a thin band across the middle of the screen decides which section is "current"
    navIo = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setNav(NAV_FOR[en.target.id]); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$(':scope > section', root).forEach((s) => navIo.observe(s));
    setNav('home');
  }

  /* ---------- countdown ---------- */
  function tickCountdown() {
    const boxes = $$('[data-countdown]');
    if (!boxes.length) return;
    let ms = new Date(C.date).getTime() - Date.now();
    if (ms <= 0) {
      boxes.forEach((box) => {
        box.hidden = true;
        const done = $('[data-cd-done]', box.parentElement);
        if (done) done.hidden = false;
      });
      return;
    }
    const values = {};
    for (const [u, size] of Object.entries({ days: 864e5, hours: 36e5, minutes: 6e4, seconds: 1e3 })) {
      values[u] = String(Math.floor(ms / size)).padStart(2, '0');
      ms %= size;
    }
    boxes.forEach((box) => $$('[data-cd]', box).forEach((el) => {
      if (el.textContent !== values[el.dataset.cd]) el.textContent = values[el.dataset.cd];
    }));
  }
  setInterval(tickCountdown, 1000);

  /* ---------- envelope ---------- */
  let opened = false;
  function openInvite() {
    if (opened) return;
    opened = true;
    const cover = $('#cover');
    const main = $('#content');
    const finish = () => {
      cover.classList.add('is-gone');
      document.body.classList.remove('is-locked');
      main.inert = false;
      toTop(); // always start at the first screen
      main.focus({ preventScroll: true });
      setTimeout(() => { cover.hidden = true; }, 800);
    };
    if (reduced()) return finish();
    cover.classList.add('is-opening');
    setTimeout(() => cover.classList.add('is-flap-open'), 350);
    setTimeout(() => cover.classList.add('is-letter-out'), 1050);
    setTimeout(finish, 2150);
  }

  /* ---------- Support Us pop-up ---------- */
  const sheet = $('#support-dialog');
  // the round gift button and the "Support Us" section button both carry data-support-open
  document.addEventListener('click', (e) => { if (e.target.closest('[data-support-open]')) sheet.showModal(); });
  sheet.addEventListener('click', (e) => {
    // close on ✕ or on a tap outside the panel
    if (e.target.closest('[data-sheet-close]') || e.target === sheet) sheet.close();
  });

  /* ---------- small gallery pop-up ---------- */
  const lb = $('#lightbox');
  const lbImg = $('.gpop-frame img', lb);
  const lbPh = $('.gpop-ph', lb);
  let lbIndex = 0;
  function showPhoto(i) {
    const photos = galleryPhotos();
    lbIndex = (i + photos.length) % photos.length;
    const src = photos[lbIndex];
    lbImg.hidden = !src;
    lbPh.hidden = Boolean(src);
    if (src) { lbImg.src = src; lbImg.alt = `${ui('photo')} ${lbIndex + 1}`; }
    $('#gpop-count').textContent = `${lbIndex + 1} / ${photos.length}`;
    $$('.gpop-thumb', lb).forEach((b, k) => {
      const on = k === lbIndex;
      b.classList.toggle('is-active', on);
      if (on) { b.setAttribute('aria-current', 'true'); b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
      else b.removeAttribute('aria-current');
    });
  }
  function openGallery(i = 0) {
    lbPh.textContent = C.couple.monogram;
    $('#gpop-thumbs').innerHTML = galleryPhotos().map((src, k) => `
      <button class="gpop-thumb" type="button" data-thumb="${k}" aria-label="${esc(ui('photo'))} ${k + 1}">${src ? `<img src="${esc(src)}" alt="">` : ''}</button>`).join('');
    lb.showModal();
    showPhoto(i);
  }
  lb.addEventListener('click', (e) => {
    const act = e.target.closest('[data-lb]')?.dataset.lb;
    const thumb = e.target.closest('[data-thumb]');
    if (act === 'close' || e.target === lb) lb.close();
    if (act === 'prev') showPhoto(lbIndex - 1);
    if (act === 'next') showPhoto(lbIndex + 1);
    if (thumb) showPhoto(Number(thumb.dataset.thumb));
  });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') showPhoto(lbIndex - 1);
    if (e.key === 'ArrowRight') showPhoto(lbIndex + 1);
  });
  let touchX = null;
  lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showPhoto(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- toast + copy ---------- */
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 1800);
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.append(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    }
  }

  /* ---------- global events ---------- */
  document.addEventListener('click', async (e) => {
    if (e.target.closest('#open-btn, [data-open]')) return openInvite();
    const copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) {
      if (await copyText(copyBtn.dataset.copy)) {
        const span = $('span', copyBtn);
        span.textContent = ui('copied');
        toast(`${ui('copied')}: ${copyBtn.dataset.copy}`);
        setTimeout(() => { span.textContent = ui('copy'); }, 1600);
      }
      return;
    }
    if (e.target.closest('[data-gallery-open]')) { openGallery(0); return; }
    // any in-page anchor (bnav, fl-cta, scroll-hint) — smooth scroll without leaving #section in the URL
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      const id = anchor.getAttribute('href').slice(1);
      if (id) {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
      }
      return;
    }
    if (e.target.closest('[data-lang-toggle]')) {
      lang = lang === 'id' ? 'en' : 'id';
      store.set(LS_LANG, lang);
      render();
      return;
    }
  });
  /* ---------- boot ---------- */
  // Every visit starts at the top: no scroll restore on reload, no jump to a #section left in the URL.
  function toTop() { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  toTop();
  window.RSVP.init({ esc, t, ui, longDate, guestName, toast, getLang: () => lang });
  $('#content').inert = true;
  render();
})();
