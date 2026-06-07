// ── Demo tabs ──────────────────────────────────
document.querySelectorAll('.demo-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.demo-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.demo-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    document.getElementById(tab.getAttribute('aria-controls')).classList.add('active');
  });
});

const demoForm = document.getElementById('demo-request-form');
const demoFormStatus = document.getElementById('demo-form-status');

function setDemoFormStatus(message, kind) {
  if (!demoFormStatus) return;
  demoFormStatus.textContent = message;
  demoFormStatus.classList.remove('is-success', 'is-error');
  if (kind) demoFormStatus.classList.add(kind);
}

if (demoForm) {
  demoForm.addEventListener('submit', event => {
    event.preventDefault();

    if (!demoForm.reportValidity()) return;

    const payload = Object.fromEntries(new FormData(demoForm).entries());

    // Honeypot — bail silently if the hidden website field was filled
    if ((payload.website || '').trim()) return;

    const subject = encodeURIComponent('Demo request — Lobby');
    const body = encodeURIComponent(
      'Hi Abigail,\n\n' +
      'I\'d love to book a demo for Lobby. Here are my details:\n\n' +
      'Name:          ' + (payload.name    || '—') + '\n' +
      'Email:         ' + (payload.email   || '—') + '\n' +
      'Business:      ' + (payload.company || '—') + '\n' +
      'Phone:         ' + (payload.phone   || '—') + '\n' +
      (payload.message ? 'More info:\n' + payload.message + '\n' : '') +
      '\nThanks!'
    );

    window.location.href = 'mailto:hello@abigailbuilds.com?subject=' + subject + '&body=' + body;

    demoForm.reset();
    setDemoFormStatus('Opening your email app with everything filled in…', 'is-success');
  });
}

// ── Dashboard slideout ─────────────────────────
const overlay = document.getElementById('dash-overlay');
const slideout = document.getElementById('dash-slideout');
const closeBtn = document.getElementById('dash-close');
const slideoutBody = document.getElementById('dash-slideout-body');

const TRANSCRIPT_PLACEHOLDER = [
  ['Lobby AI', 'Thanks for calling. How can I help you today?'],
  ['Caller', 'Hi, yes — I was hoping to get some help with something.'],
  ['Lobby AI', 'Of course. Can I get your name and a quick description of what you need?'],
  ['Caller', 'Sure, it\'s on the line. It\'s been going on for a few days now and I\'d love to get it sorted.'],
  ['Lobby AI', 'Absolutely. I\'ll make sure the right person gets back to you shortly. Is there anything else you\'d like to add?'],
  ['Caller', 'No, I think that covers it. Thanks so much.'],
  ['Lobby AI', 'Perfect. You\'ll hear back very soon. Have a wonderful day.']
];

const DEMO_FORM_ENDPOINT = 'REPLACE_WITH_YOUR_SECURE_ENDPOINT';

const callData = {
  jake: {
    type: 'new_lead',
    name: 'Jake Thornton', phone: '+12145551847', email: null,
    calledAt: 'Thu, Jun 4, 2026, 2:17 PM', receivedAt: 'Thu, Jun 4, 2026, 2:18 PM',
    score: '9/10', scoreDesc: 'Urgent storm damage — high conversion likelihood',
    extraction: [
      ['Caller Name', 'Jake Thornton'], ['Caller Phone', '214-555-1847'],
      ['Lead Type', 'New Lead'], ['Industry', 'Roofing'],
      ['Reason for Call', 'Storm damage to roof — multiple shingles missing. Concerned about potential interior water damage before upcoming rain.', true],
      ['Property Address', '47 Birchwood Ave, Dallas TX 75201'],
      ['Urgency', 'High — rain forecast this weekend'], ['Best Contact Time', 'Weekday mornings']
    ],
    transcript: TRANSCRIPT_PLACEHOLDER
  },
  maria: {
    type: 'new_lead',
    name: 'Maria Nguyen', phone: '+14695559243', email: 'maria.n@gmail.com',
    calledAt: 'Thu, Jun 4, 2026, 11:41 AM', receivedAt: 'Thu, Jun 4, 2026, 11:42 AM',
    score: '8/10', scoreDesc: 'High urgency — follow up within 2 hours',
    extraction: [
      ['Caller Name', 'Maria Nguyen'], ['Caller Phone', '469-555-9243'],
      ['Lead Type', 'New Lead'], ['Industry', 'HVAC'],
      ['Reason for Call', 'AC unit stopped working overnight. Home with young children — urgently needs service in summer heat.', true],
      ['Property Type', 'Residential — 3 bedroom home'],
      ['Urgency', 'High — no cooling in extreme heat'], ['Best Contact Time', 'Anytime today']
    ],
    transcript: TRANSCRIPT_PLACEHOLDER
  },
  david: {
    type: 'existing_customer',
    name: 'David Chang', phone: '+19725554781', email: null,
    calledAt: 'Wed, Jun 3, 2026, 4:54 PM', receivedAt: 'Wed, Jun 3, 2026, 4:55 PM',
    message: '"Hi, this is David — I\'m a return customer. I wanted to check in about my appointment tomorrow morning. Can someone confirm it\'s still booked? Also wanted to make sure you\'re bringing the part I mentioned last time. Thanks."',
    summary: 'Existing customer confirming appointment scheduled for tomorrow morning. Also requesting confirmation that a specific part will be available. Friendly tone, low urgency.',
    sentiment: 'positive',
    actionItems: 'Confirm appointment time. Verify parts availability before the visit.',
    transcript: TRANSCRIPT_PLACEHOLDER
  },
  quotepro: {
    type: 'spam',
    name: 'QuotePro Marketing', phone: '+18005550294', email: null,
    calledAt: 'Wed, Jun 3, 2026, 2:29 PM', receivedAt: 'Wed, Jun 3, 2026, 2:30 PM',
    summary: 'Caller attempting to sell digital marketing and Google Ads services. Not a genuine customer enquiry. Flagged as Sales/Spam — no follow-up required.',
    transcript: TRANSCRIPT_PLACEHOLDER
  },
  linda: {
    type: 'new_lead',
    name: 'Linda Watts', phone: '+15044449817', email: null,
    calledAt: 'Wed, Jun 3, 2026, 10:13 AM', receivedAt: 'Wed, Jun 3, 2026, 10:14 AM',
    score: '8/10', scoreDesc: 'Strong booking intent — event confirmed in 3 weeks',
    extraction: [
      ['Caller Name', 'Linda Watts'], ['Caller Phone', '504-444-9817'],
      ['Lead Type', 'New Lead'], ['Industry', 'Events / Catering'],
      ['Reason for Call', 'Looking to book catering for a 60-person corporate event in 3 weeks. Budget has been confirmed internally.', true],
      ['Event Date', '2026-06-27'], ['Headcount', '~60 guests'], ['Budget', 'Confirmed — flexible on extras']
    ],
    transcript: TRANSCRIPT_PLACEHOLDER
  },
  sunrise: {
    type: 'spam',
    name: 'Sunrise Insurance Co.', phone: '+18005550422', email: null,
    calledAt: 'Wed, Jun 3, 2026, 9:04 AM', receivedAt: 'Wed, Jun 3, 2026, 9:05 AM',
    summary: 'Caller attempting to sell commercial insurance products. Not related to business operations. Flagged as Sales/Spam — no follow-up required.',
    transcript: TRANSCRIPT_PLACEHOLDER
  }
};

function scoreColor(score) {
  const n = parseInt(score);
  if (n >= 9) return '#2D8C5E';
  if (n >= 7) return '#C9A87C';
  return '#B03020';
}

function renderCallInfo(d) {
  return `<div class="slideout-section">
    <div class="slideout-section-label">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
      Call Info
    </div>
    <div class="slideout-grid">
      <div><div class="slideout-field-label">Caller</div><div class="slideout-field-val">${d.name}</div></div>
      <div><div class="slideout-field-label">Phone</div><div class="slideout-field-val">${d.phone}</div></div>
      <div><div class="slideout-field-label">Email</div><div class="slideout-field-val" style="${d.email ? '' : 'color:#8A7D68;'}">${d.email || '—'}</div></div>
      <div><div class="slideout-field-label">Call Type</div><div class="slideout-field-val">Inbound</div></div>
      <div><div class="slideout-field-label">Called At</div><div class="slideout-field-val">${d.calledAt}</div></div>
      <div><div class="slideout-field-label">Received At</div><div class="slideout-field-val">${d.receivedAt}</div></div>
    </div>
  </div>`;
}

function renderAIExtraction(d) {
  const color = scoreColor(d.score);
  const rows = d.extraction.map(([label, val, full]) =>
    `<div${full ? ' class="slideout-full-row"' : ''}><div class="slideout-field-label">${label}</div><div class="slideout-field-val${full ? ' long' : ''}">${val}</div></div>`
  ).join('');
  return `<div class="slideout-section">
    <div class="slideout-section-label" style="justify-content:space-between;">
      <span style="display:flex;align-items:center;gap:7px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
        Lead Intelligence
      </span>
      <button class="slideout-rerun" aria-label="Re-run analysis">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        Re-run
      </button>
    </div>
    <div class="score-banner" style="border-color:${color}20;background:${color}08;">
      <div class="score-badge-circle" style="background:${color}15;color:${color};border-color:${color}30;">LEAD</div>
      <div>
        <div class="score-val" style="color:${color};">Score: ${d.score}</div>
        <div class="score-desc">${d.scoreDesc}</div>
      </div>
    </div>
    <div class="slideout-grid">${rows}</div>
  </div>`;
}

function renderCustomerMessage(d) {
  const sentimentClass = d.sentiment === 'positive' ? 'sentiment-positive' : d.sentiment === 'distressed' ? 'sentiment-distressed' : 'sentiment-neutral';
  const sentimentLabel = d.sentiment === 'positive' ? 'Positive' : d.sentiment === 'distressed' ? 'Distressed' : 'Neutral';
  return `<div class="slideout-section">
    <div class="slideout-section-label">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      Customer Message
    </div>
    <div class="slideout-message-box">${d.message}</div>
    <div class="slideout-kv-row"><span class="slideout-kv-label">Summary</span><span class="slideout-kv-val">${d.summary}</span></div>
    <div class="slideout-kv-row" style="align-items:center;"><span class="slideout-kv-label">Sentiment</span><span class="sentiment-badge ${sentimentClass}">${sentimentLabel}</span></div>
    <div class="slideout-kv-row"><span class="slideout-kv-label">Action Items</span><span class="slideout-kv-val">${d.actionItems}</span></div>
  </div>`;
}

function renderSummary(d) {
  return `<div class="slideout-section">
    <div class="slideout-section-label">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg>
      Summary
    </div>
    <div class="slideout-kv-val" style="font-size:0.82rem;color:#3A3028;line-height:1.55;padding:0 2px 4px;">${d.summary}</div>
  </div>`;
}

function renderRecording() {
  return `<div class="slideout-section">
    <div class="slideout-section-label">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
      Recording
      <span class="rec-demo-badge">Demo</span>
    </div>
    <div class="recording-player">
      <button class="rec-play-btn" aria-label="Play recording (unavailable in demo)" title="Available in full version">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </button>
      <span class="rec-time">0:00</span>
      <div class="rec-bar"><div class="rec-bar-fill"></div></div>
      <span class="rec-time rec-total">1:48</span>
      <svg class="rec-vol" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
    </div>
  </div>`;
}

function renderTranscript(lines) {
  const lineHtml = lines.map(([speaker, text]) =>
    `<div class="transcript-line"><strong>${speaker}:</strong> ${text}</div>`
  ).join('');
  return `<div class="slideout-section">
    <button class="transcript-toggle" onclick="this.classList.toggle('open')">
      <span class="transcript-toggle-label">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Transcript
      </span>
      <span class="transcript-show"></span>
    </button>
    <div class="transcript-body">${lineHtml}</div>
  </div>`;
}

function renderNotes() {
  return `<div class="slideout-section">
    <div class="slideout-section-label">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      Notes
    </div>
    <div class="notes-empty">No notes yet.</div>
  </div>`;
}

function openSlideout(id) {
  const d = callData[id];
  if (!d) return;
  let html = renderCallInfo(d);
  if (d.type === 'new_lead') html += renderAIExtraction(d);
  if (d.type === 'existing_customer') html += renderCustomerMessage(d);
  if (d.type === 'spam' || d.type === 'vendor') html += renderSummary(d);
  html += renderRecording();
  html += renderTranscript(d.transcript);
  html += renderNotes();
  slideoutBody.innerHTML = html;
  overlay.classList.add('open');
  slideout.classList.add('open');
  overlay.removeAttribute('aria-hidden');
  closeBtn.focus();
}

function closeSlideout() {
  overlay.classList.remove('open');
  slideout.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  hideRecPopover();
}

// ── Recording locked popover ────────────────────
const recPopover = document.getElementById('rec-popover');
const recPopoverClose = document.getElementById('rec-popover-close');

function showRecPopover(btn) {
  const rect = btn.getBoundingClientRect();
  recPopover.removeAttribute('hidden');
  // Position above the button, arrow pointing down
  const popW = 268;
  let left = rect.left - 16; // align arrow roughly with button
  // Keep within viewport
  if (left + popW > window.innerWidth - 12) left = window.innerWidth - popW - 12;
  if (left < 8) left = 8;
  const top = rect.top - recPopover.offsetHeight - 12;
  recPopover.style.left = left + 'px';
  recPopover.style.top = (top < 8 ? rect.bottom + 12 : top) + 'px';
  // Flip arrow if shown below
  if (top < 8) {
    recPopover.style.setProperty('--arrow-top', 'auto');
    recPopover.style.setProperty('--arrow-bottom', 'auto');
    recPopover.style.removeProperty('--arrow-flip');
    recPopover.classList.add('rec-popover-below');
  } else {
    recPopover.classList.remove('rec-popover-below');
  }
  requestAnimationFrame(() => recPopover.classList.add('rec-popover-visible'));
}

function hideRecPopover() {
  recPopover.classList.remove('rec-popover-visible', 'rec-popover-below');
  recPopover.addEventListener('transitionend', () => recPopover.setAttribute('hidden', ''), { once: true });
}

recPopoverClose.addEventListener('click', hideRecPopover);

// Event delegation — slideout body may be re-rendered
document.addEventListener('click', e => {
  if (e.target.closest('.rec-play-btn')) {
    e.stopPropagation();
    if (recPopover.classList.contains('rec-popover-visible')) {
      hideRecPopover();
    } else {
      showRecPopover(e.target.closest('.rec-play-btn'));
    }
    return;
  }
  // Close if clicking outside
  if (!e.target.closest('#rec-popover') && recPopover.classList.contains('rec-popover-visible')) {
    hideRecPopover();
  }
});

document.querySelectorAll('.dash-row').forEach(row => {
  row.addEventListener('click', () => openSlideout(row.dataset.id));
  row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSlideout(row.dataset.id); } });
});
closeBtn.addEventListener('click', closeSlideout);
overlay.addEventListener('click', closeSlideout);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSlideout(); });

// ── Nav scroll glass effect ────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });
nav.classList.toggle('scrolled', window.scrollY > 20);

// ── Hamburger menu ─────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// ── Scroll animation ───────────────────────────
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-up').forEach(el => io.observe(el));

// ── Phone mockup animation ─────────────────────
const bubbleIds = ['b1','b2','b3','b4'];
const delays = [400, 1500, 2800, 4100];

function runPhoneAnim() {
  bubbleIds.forEach((id, i) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.classList.add('show');
    }, delays[i]);
  });
  setTimeout(() => {
    const b = document.getElementById('lead-badge');
    if (b) b.classList.add('show');
  }, 5400);
}

function resetPhoneAnim() {
  bubbleIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
  });
  const badge = document.getElementById('lead-badge');
  if (badge) badge.classList.remove('show');
  setTimeout(runPhoneAnim, 400);
}

runPhoneAnim();
setInterval(resetPhoneAnim, 9500);

// ── Waveform generator ─────────────────────────
document.querySelectorAll('.video-waveform').forEach(waveform => {
  for (let i = 0; i < 48; i++) {
    const bar = document.createElement('div');
    bar.className = 'waveform-bar';
    const h = Math.floor(Math.random() * 28) + 8;
    const d = (Math.random() * 0.6 + 0.5).toFixed(2);
    bar.style.setProperty('--h', h + 'px');
    bar.style.setProperty('--d', d + 's');
    bar.style.animationDelay = (Math.random() * 0.5).toFixed(2) + 's';
    waveform.appendChild(bar);
  }
});

// ── ROI Calculator ─────────────────────────────
const sliders = {
  missedCalls: document.getElementById('missed-calls'),
  viablePct: document.getElementById('viable-pct'),
  caseValue: document.getElementById('case-value')
};
const displays = {
  missedCalls: document.getElementById('missed-calls-val'),
  viablePct: document.getElementById('viable-pct-val'),
  caseValue: document.getElementById('case-value-val')
};
const results = {
  casesMonth: document.getElementById('res-cases-month'),
  revMonth: document.getElementById('res-rev-month'),
  revYear: document.getElementById('res-rev-year')
};

function fmt(n) {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
  if (n >= 1000) return '$' + n.toLocaleString();
  return '$' + n;
}

function calcROI() {
  const missed = parseInt(sliders.missedCalls.value);
  const pct = parseInt(sliders.viablePct.value) / 100;
  const val = parseInt(sliders.caseValue.value);

  displays.missedCalls.textContent = missed;
  displays.viablePct.textContent = sliders.viablePct.value + '%';
  displays.caseValue.textContent = '$' + parseInt(sliders.caseValue.value).toLocaleString();

  const leadsLost = Math.round(missed * pct);
  const revMonth = leadsLost * val;
  const revYear = revMonth * 12;

  results.casesMonth.textContent = leadsLost;
  results.revMonth.textContent = fmt(revMonth);
  results.revYear.textContent = fmt(revYear);
}

Object.values(sliders).forEach(s => s.addEventListener('input', calcROI));
calcROI();

// ── FAQ Accordion ──────────────────────────────
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ── Demo audio players ──────────────────────────
const demoPlayers = [
  { wrapperId: 'demo-player-roofing', audioId: 'demo-audio-roofing', btnId: 'demo-play-btn-roofing', labelId: 'demo-label-roofing', progressId: 'audio-progress-roofing', defaultLabel: 'Storm damage inquiry \u2014 female agent voice' },
  { wrapperId: 'demo-player-law',     audioId: 'demo-audio-law',     btnId: 'demo-play-btn-law',     labelId: 'demo-label-law',     progressId: 'audio-progress-law',     defaultLabel: 'New client intake \u2014 male agent voice' }
].map(p => ({
  wrapper:  document.getElementById(p.wrapperId),
  audio:    document.getElementById(p.audioId),
  btn:      document.getElementById(p.btnId),
  label:    document.getElementById(p.labelId),
  progress: document.getElementById(p.progressId),
  defaultLabel: p.defaultLabel
}));

function pauseAllExcept(active) {
  demoPlayers.forEach(p => {
    if (p !== active && !p.audio.paused) {
      p.audio.pause();
      p.wrapper.classList.remove('playing');
      p.label.textContent = p.defaultLabel;
      p.btn.setAttribute('aria-label', 'Play demo call');
    }
  });
}

demoPlayers.forEach(player => {
  function toggleAudio() {
    if (player.audio.paused) {
      pauseAllExcept(player);
      player.audio.play();
      player.wrapper.classList.add('playing');
      player.label.textContent = 'Playing\u2026';
      player.btn.setAttribute('aria-label', 'Pause demo call');
    } else {
      player.audio.pause();
      player.wrapper.classList.remove('playing');
      player.label.textContent = 'Click to resume';
      player.btn.setAttribute('aria-label', 'Play demo call');
    }
  }

  player.audio.addEventListener('timeupdate', () => {
    if (player.audio.duration) {
      player.progress.style.width = (player.audio.currentTime / player.audio.duration * 100) + '%';
    }
  });

  player.audio.addEventListener('ended', () => {
    player.wrapper.classList.remove('playing');
    player.progress.style.width = '0%';
    player.label.textContent = player.defaultLabel;
    player.btn.setAttribute('aria-label', 'Play demo call');
  });

  player.btn.addEventListener('click', e => { e.stopPropagation(); toggleAudio(); });
  player.wrapper.addEventListener('click', toggleAudio);
  player.wrapper.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAudio(); }
  });
});
