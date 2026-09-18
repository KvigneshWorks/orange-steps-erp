export const ERP_CSS = `
/* fonts now loaded once in index.html — see comment there */

/* ── Keyboard-only dropdown navigation: generic focus ring for any
   custom dropdown/combobox option across the whole app (see
   src/utils/keyboardNav.ts). Every option div/button in every custom
   SDD/SearchDD/MultiSelectDD/etc component carries role="option" so
   this one rule covers all of them without per-component CSS. ── */
[role="option"]:focus-visible,
[role="option"]:focus {
  outline: 2px solid var(--ember, #2563EB);
  outline-offset: -2px;
  background: var(--ember-ghost, rgba(59,130,246,0.10));
}

:root {
  --ember:        #2563EB;
  --ember-mid:    #3B82F6;
  --ember-light:  #60A5FA;
  --ember-pale:   #BFDBFE;
  --ember-ghost:  rgba(59,130,246,0.10);
  --ember-glow:   rgba(59,130,246,0.22);
  --ember-border: rgba(37,99,235,0.28);

  --grey:         #334155;
  --grey-2:       #3F4B63;
  --grey-3:       #4B5875;
  --grey-4:       #64748B;
  --grey-5:       #94A3B8;

  --white:        #FFFFFF;
  --off-white:    #F8FAFC;
  --surface:      #F1F5F9;
  --surface-2:    #E9EEF5;
  --surface-3:    #DCE4EF;

  --border:       #E2E8F0;
  --border-2:     #CBD5E1;
  --border-3:     #B6C2D6;

  --text-1:       #0F172A;
  --text-2:       #1E293B;
  --text-3:       #27364A;
  --text-4:       #475569;

  --success:      #1E9C6A;
  --success-bg:   rgba(30,156,106,0.10);
  --success-bd:   rgba(30,156,106,0.28);
  --error:        #D93B55;
  --error-bg:     rgba(217,59,85,0.10);
  --error-bd:     rgba(217,59,85,0.26);
  --warn:         #C47E0A;
  --warn-bg:      rgba(196,126,10,0.10);
  --warn-bd:      rgba(196,126,10,0.26);
  --info:         #2870CC;
  --info-bg:      rgba(40,112,204,0.10);
  --info-bd:      rgba(40,112,204,0.26);

  --font-display: 'Instrument Serif', serif;
  --font-body:    'Space Grotesk', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  --r-sm:  6px;
  --r-md:  10px;
  --r-lg:  16px;
  --r-xl:  22px;
  --sh-card:    0 1px 4px rgba(37,99,235,0.10), 0 4px 16px rgba(37,99,235,0.07);
  --sh-hover:   0 4px 20px rgba(37,99,235,0.14), 0 8px 40px rgba(37,99,235,0.10);
  --sh-ember:   0 4px 18px rgba(37,99,235,0.30);
  --sh-ember-lg:0 8px 32px rgba(37,99,235,0.40);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes erp-slide-up   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes erp-slide-down { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
@keyframes erp-fade-in    { from { opacity:0; }                              to { opacity:1; } }
@keyframes erp-pop        { from { opacity:0; transform:scale(0.97) translateY(6px); } to { opacity:1; transform:scale(1) translateY(0); } }
@keyframes erp-spin       { to   { transform:rotate(360deg); } }
@keyframes erp-pulse-dot  { 0%,100% { box-shadow:0 0 0 0 rgba(37,99,235,0.5); } 50% { box-shadow:0 0 0 5px rgba(37,99,235,0); } }
@keyframes erp-shimmer    {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}
@keyframes erp-bar-fill   { from { width:0; } to { width:100%; } }
@keyframes erp-float      { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
@keyframes erp-glow-pulse { 0%,100% { box-shadow:0 0 0 0 rgba(59,130,246,0.30); } 50% { box-shadow:0 0 0 8px rgba(59,130,246,0); } }
@keyframes erp-stagger-in { from { opacity:0; transform:translateY(14px) scale(0.985); } to { opacity:1; transform:translateY(0) scale(1); } }
@keyframes erp-gradient-x { 0% { background-position:0% 50%; } 50% { background-position:100% 50%; } 100% { background-position:0% 50%; } }

/* ultra animation utilities */
.ERP-anim-lift { transition: transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s ease; }
.ERP-anim-lift:hover { transform: translateY(-3px); box-shadow: var(--sh-hover); }
.ERP-stagger > * { animation: erp-stagger-in 0.45s cubic-bezier(0.22,1,0.36,1) both; }
.ERP-stagger > *:nth-child(1) { animation-delay: 0.03s; }
.ERP-stagger > *:nth-child(2) { animation-delay: 0.08s; }
.ERP-stagger > *:nth-child(3) { animation-delay: 0.13s; }
.ERP-stagger > *:nth-child(4) { animation-delay: 0.18s; }
.ERP-stagger > *:nth-child(5) { animation-delay: 0.23s; }
.ERP-stagger > *:nth-child(6) { animation-delay: 0.28s; }
.ERP-stagger > *:nth-child(7) { animation-delay: 0.33s; }
.ERP-stagger > *:nth-child(8) { animation-delay: 0.38s; }

.ERP-page {
  padding: 32px 36px;
  background: var(--surface);
  color: var(--text-1);
  font-family: var(--font-body);
  min-height: 100%;
  position: relative;
  overflow-x: hidden;
}

.ERP-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
  radial-gradient(circle, rgba(37,99,235,0.06) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
  z-index: 0;
}

.ERP-hdr {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
  animation: erp-slide-up 0.5s cubic-bezier(0.22,1,0.36,1) both;
  position: relative;
  z-index: 1;
}

.ERP-eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 3.5px;
  color: var(--ember);
  text-transform: uppercase;
  margin-bottom: 6px;
}

.ERP-eyebrow-line {
  width: 24px;
  height: 2px;
  background: linear-gradient(to right, var(--ember), var(--ember-light));
  border-radius: 2px;
}

.ERP-eyebrow-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--ember-mid);
  animation: erp-pulse-dot 2.5s ease-in-out infinite;
}

.ERP-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 800;
  font-style: italic;
  color: var(--grey);
  letter-spacing: -0.5px;
  line-height: 1.2;
  margin-bottom: 6px;
}

.ERP-title-em {
  color: var(--ember);
  font-style: normal;
}

.ERP-subtitle {
  font-family: var(--font-body);
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-3);
  letter-spacing: 0.2px;
}

.ERP-status-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: var(--white);
  border: 1.5px solid var(--ember-border);
  border-radius: 100px;
  font-family: var(--font-mono);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 2.5px;
  color: var(--ember);
  text-transform: uppercase;
  flex-shrink: 0;
  margin-top: 6px;
  box-shadow: var(--sh-card);
}

.ERP-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ember-mid);
  animation: erp-pulse-dot 2s ease-in-out infinite;
}

.ERP-divider {
  position: relative;
  height: 1px;
  background: linear-gradient(to right, var(--ember) 0%, rgba(37,99,235,0.3) 40%, transparent 70%);
  margin-bottom: 28px;
  z-index: 1;
}

.ERP-divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: -3px;
  width: 7px;
  height: 7px;
  background: var(--ember);
  border-radius: 1px;
  transform: rotate(45deg);
}

.ERP-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
}

/* Always keep at least 2 columns — mirrors desktop layout down to phone width */
@media (max-width: 1100px) { .ERP-stats { grid-template-columns: repeat(2, 1fr); gap: 9px; } }
@media (max-width: 380px)  { .ERP-stats { grid-template-columns: 1fr; } }

.ERP-stat {
  background: linear-gradient(165deg, var(--white) 0%, var(--off-white) 100%);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  padding: 12px 13px 10px;
  position: relative;
  overflow: hidden;
  cursor: default;
  transition: border-color 0.22s, transform 0.28s cubic-bezier(.22,1,.36,1), box-shadow 0.28s cubic-bezier(.22,1,.36,1);
  box-shadow: var(--sh-card);
}

.ERP-stat::after {
  content: '';
  position: absolute; top: 0; left: -60%; width: 40%; height: 100%;
  background: linear-gradient(115deg, transparent, rgba(255,255,255,.55), transparent);
  transform: skewX(-20deg);
  transition: left .6s ease;
  pointer-events: none;
}
.ERP-stat:hover::after { left: 130%; }

.ERP-stat:nth-child(1) { animation: erp-pop 0.4s 0.05s ease both; }
.ERP-stat:nth-child(2) { animation: erp-pop 0.4s 0.10s ease both; }
.ERP-stat:nth-child(3) { animation: erp-pop 0.4s 0.15s ease both; }
.ERP-stat:nth-child(4) { animation: erp-pop 0.4s 0.20s ease both; }
.ERP-stat:nth-child(5) { animation: erp-pop 0.4s 0.25s ease both; }
.ERP-stat:nth-child(6) { animation: erp-pop 0.4s 0.30s ease both; }
.ERP-stat:nth-child(7) { animation: erp-pop 0.4s 0.35s ease both; }
.ERP-stat:nth-child(8) { animation: erp-pop 0.4s 0.40s ease both; }

.ERP-stat:hover {
  border-color: var(--ember-border);
  transform: translateY(-4px) scale(1.012);
  box-shadow: var(--sh-hover);
}

.ERP-stat-accent {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--ember), var(--ember-light));
  border-radius: var(--r-lg) var(--r-lg) 0 0;
}

.ERP-stat-glow {
  position: absolute;
  bottom: -24px; right: -24px;
  width: 80px; height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--ember-ghost) 0%, transparent 70%);
  pointer-events: none;
}

.ERP-stat-icon {
  width: 26px; height: 26px;
  border-radius: 8px;
  background: var(--ember-ghost);
  border: 1px solid var(--ember-border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 10px -4px var(--ember-glow), inset 0 1px 0 rgba(255,255,255,.85), inset 0 -5px 7px -5px rgba(0,0,0,.08);
  transition: transform .3s cubic-bezier(.34,1.56,.64,1);
}
.ERP-stat-icon::before {
  content: ''; position: absolute; top: 2px; left: 4px; width: 55%; height: 40%;
  border-radius: 50%; background: linear-gradient(180deg, rgba(255,255,255,.9), transparent);
  opacity: .7; pointer-events: none;
}
.ERP-stat:hover .ERP-stat-icon { transform: translateY(-2px) scale(1.08) rotate(-4deg); }
.ERP-stat-icon svg { width: 13px; height: 13px; filter: brightness(1.2) saturate(.88); position: relative; z-index: 1; }

.ERP-stat-label {
  font-family: var(--font-mono);
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--text-4);
  text-transform: uppercase;
  margin-bottom: 4px;
  position: relative;
  z-index: 1;
}

.ERP-stat-val {
  font-family: var(--font-mono);
  font-size: 17.5px;
  font-weight: 800;
  font-style: normal;
  font-variant-numeric: tabular-nums;
  color: var(--grey);
  line-height: 1.05;
  letter-spacing: -0.3px;
  position: relative;
  z-index: 1;
}

/* ─────────────────────────────────────────────────────────────
   FORM CARD
   IMPORTANT: overflow must be VISIBLE so absolutely-positioned
   SearchDD dropdown panels can render outside the card boundary
   without being clipped. The rounded-corner border is preserved
   by the border-radius property alone; overflow:hidden is NOT
   needed for the visual border radius on a non-clipping element.
───────────────────────────────────────────────────────────── */
.ERP-form-card {
  background: linear-gradient(170deg, var(--white) 0%, var(--off-white) 100%);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  overflow: visible;            /* ← was: hidden — changed to fix dropdown clipping */
  margin-bottom: 22px;
  box-shadow: var(--sh-card);
  /* No mount animation here: an element with a transform/opacity animation
     (even one that already finished) is pinned into its own stacking
     context by the browser for as long as it lives. That trapped every
     SearchDD/dropdown panel opened inside this card — instead of floating
     above everything on the page, they could render underneath later
     content and read as garbled, overlapping text. Dropped so the
     explicit z-index below is what actually governs stacking. */
  position: relative;
  z-index: 1;
  transition: box-shadow .3s ease;
}
.ERP-form-card:hover { box-shadow: var(--sh-hover); }

.ERP-form-topbar {
  height: 3px;
  background: linear-gradient(90deg, var(--ember) 0%, var(--ember-light) 60%, rgba(139,166,220,0.4) 100%);
  animation: erp-bar-fill 0.8s 0.3s ease both;
  border-radius: var(--r-xl) var(--r-xl) 0 0;  /* ← round top corners since overflow:visible */
}

.ERP-form-body {
  padding: 26px 30px 24px;
  overflow: visible;            /* ← ensure dropdowns can escape */
}

.ERP-form-hdr {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  margin-bottom: 22px;
  border-bottom: 1px solid var(--border);
}

.ERP-form-icon-wrap {
  width: 48px; height: 48px;
  border-radius: var(--r-md);
  background: var(--ember-ghost);
  border: 1.5px solid var(--ember-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 5px 12px -5px var(--ember-glow), inset 0 1px 0 rgba(255,255,255,.8);
}
.ERP-form-icon-wrap::before {
  content: ''; position: absolute; top: 3px; left: 5px; width: 55%; height: 40%;
  border-radius: 50%; background: linear-gradient(180deg, rgba(255,255,255,.9), transparent);
  opacity: .65; pointer-events: none;
}
.ERP-form-icon-wrap svg { filter: brightness(1.2) saturate(.88); position: relative; z-index: 1; }

.ERP-form-title {
  font-family: var(--font-display);
  font-size: 18.5px;
  font-weight: 800;
  font-style: italic;
  color: var(--grey);
  margin-bottom: 3px;
}

.ERP-form-desc {
  font-family: var(--font-body);
  font-size: 10px;
  color: var(--text-3);
  font-weight: 600;
}

.ERP-section {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 24px 0 18px;
  position: relative;
  z-index: auto;
}

.ERP-section-tag {
  font-family: var(--font-mono);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--ember);
  background: var(--ember-ghost);
  border: 1px solid var(--ember-border);
  padding: 5px 13px;
  border-radius: var(--r-sm);
  white-space: nowrap;
}

.ERP-section-rule {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.ERP-g1 { display: grid; grid-template-columns: 1fr;           gap: 16px; }
.ERP-g2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
.ERP-g3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.ERP-g4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
.ERP-span-all { grid-column: 1 / -1; }
/* Field grids stay at least 2-up on mobile — same layout as desktop, just narrower columns */
@media (max-width: 1300px) { .ERP-g4 { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 1100px) { .ERP-g3 { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 480px)  { .ERP-g2,.ERP-g3,.ERP-g4 { gap: 12px; } }
@media (max-width: 380px)  { .ERP-g2,.ERP-g3,.ERP-g4 { grid-template-columns: 1fr; } }

.ERP-field {
  display: flex;
  flex-direction: column;
  position: relative;   /* ← needed so SDD-root z-index works within each field */
}

.ERP-label {
  font-family: var(--font-mono);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 2.5px;
  color: var(--text-3);
  text-transform: uppercase;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ERP-label.req::after {
  content: '*';
  color: var(--error);
  font-size: 9.5px;
  margin-left: 2px;
}

@media (max-width: 768px) {
  .ERP-page { padding: 18px 14px; }
}
@media (max-width: 440px) {
  .ERP-page { padding: 14px 10px; }
}

/* ── HEADER — wrap instead of squeezing title + status badge ── */
@media (max-width: 640px) {
  .ERP-hdr { flex-direction: column; align-items: flex-start; gap: 14px; }
  .ERP-status-badge { margin-top: 0; }
}
@media (max-width: 400px) {
  .ERP-subtitle { font-size: 9.5px; }
}

.ERP-label-opt {
  font-family: var(--font-body);
  font-size: 8px;
  font-weight: 600;
  color: var(--text-4);
  font-style: italic;
  letter-spacing: 0;
  text-transform: none;
}

.ERP-hint {
  font-family: var(--font-mono);
  font-size: 8px;
  color: var(--text-4);
  margin-top: 5px;
  letter-spacing: 0.5px;
}

.ERP-input, .ERP-textarea {
  padding: 10px 13px;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--r-md);
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-1);
  width: 100%;
  transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
  outline: none;
}

.ERP-input::placeholder, .ERP-textarea::placeholder {
  color: var(--text-4);
  font-weight: 600;
}

.ERP-input:focus, .ERP-textarea:focus {
  border-color: var(--ember-mid);
  background: var(--white);
  box-shadow: 0 0 0 3px var(--ember-ghost);
}

.ERP-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--off-white);
}

/* Full Name (Party Master) — forced to caps in JS on every keystroke; the
   text-transform here is just a visual backstop so pasted text reads
   uppercase instantly, before the state update round-trips. */
.ERP-input-caps {
  text-transform: uppercase;
  letter-spacing: 0.6px;
  font-weight: 800;
}
.ERP-input-caps::placeholder {
  text-transform: none;
  letter-spacing: normal;
  font-weight: 600;
}
.ERP-input-caps:focus {
  border-color: var(--ember-mid);
  background: var(--ember-ghost);
  box-shadow: 0 0 0 3px var(--ember-ghost);
}

.ERP-textarea {
  resize: vertical;
  min-height: 88px;
}

.ERP-select {
  padding: 10px 34px 10px 13px;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--r-md);
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-1);
  width: 100%;
  transition: border-color 0.18s, box-shadow 0.18s;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239A9A9A' stroke-width='1.8' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 13px center;
  cursor: pointer;
}

.ERP-select:focus {
  border-color: var(--ember-mid);
  box-shadow: 0 0 0 3px var(--ember-ghost);
}

.ERP-select option {
  background: var(--white);
  color: var(--text-1);
}

.ERP-dd {
  position: relative;
  width: 100%;
  z-index: 10;
  user-select: none;
}

.ERP-dd-trigger {
  width: 100%;
  padding: 10px 13px;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--r-md);
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  transition: all 0.18s ease;
  outline: none;
  text-align: left;
  user-select: none;
  min-height: 44px;
}

.ERP-dd-trigger.ph {
  color: var(--text-4);
  font-style: italic;
  font-weight: 600;
}

.ERP-dd-trigger.open {
  border-color: var(--ember-mid);
  box-shadow: 0 0 0 3px var(--ember-ghost);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.ERP-dd-trigger.dis {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
  background: var(--off-white);
}

.ERP-dd-trigger:hover:not(.open):not(.dis) {
  border-color: var(--border-2);
}

.ERP-dd-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px 2px 7px;
  background: var(--ember-ghost);
  border: 1px solid var(--ember-border);
  border-radius: 100px;
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  color: var(--ember);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ERP-dd-chip-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--ember-mid);
  flex-shrink: 0;
}

.ERP-dd-chevron {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: var(--text-4);
  transition: transform 0.22s ease, color 0.18s;
}

.ERP-dd-chevron.open {
  transform: rotate(180deg);
  color: var(--ember);
}

.ERP-dd-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 9999;
  background: var(--white);
  border: 1.5px solid var(--ember-mid);
  border-top: none;
  border-radius: 0 0 var(--r-md) var(--r-md);
  box-shadow: 0 12px 32px rgba(0,0,0,0.14);
  max-height: 200px;
  overflow-y: auto;
  animation: erp-slide-down 0.16s ease both;
}

.ERP-dd-panel::-webkit-scrollbar { width: 5px; }
.ERP-dd-panel::-webkit-scrollbar-track { background: var(--off-white); }
.ERP-dd-panel::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 3px; }

.ERP-dd-item {
  padding: 10px 14px;
  font-family: var(--font-body);
  font-size: 11px;
  color: var(--text-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  transition: all 0.12s ease;
}

.ERP-dd-item:last-child { border-bottom: none; }

.ERP-dd-item:hover,
.ERP-dd-item.sel {
  background: var(--ember-ghost);
  color: var(--ember);
}

.ERP-dd-item-check {
  color: var(--ember);
  font-weight: 800;
  font-size: 10.5px;
}

.ERP-dd-item-ph {
  color: var(--text-4);
  font-style: italic;
}

.ERP-dd-empty {
  padding: 18px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 8px;
  color: var(--text-4);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.ERP-btn-row {
  display: flex;
  gap: 12px;
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.ERP-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 26px;
  border-radius: var(--r-md);
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  border: none;
  transition: all 0.20s;
  position: relative;
  overflow: hidden;
}

.ERP-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0);
  transition: background 0.15s;
}

.ERP-btn:hover::before { background: rgba(255,255,255,0.12); }

.ERP-btn.primary {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  color: #fff;
  box-shadow: var(--sh-ember);
}

.ERP-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: var(--sh-ember-lg);
  background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
}

.ERP-btn.primary:active:not(:disabled),
.ERP-btn.secondary:active:not(:disabled) {
  transform: translateY(0) scale(0.97);
  transition: transform 0.1s ease;
}

.ERP-btn.primary::after, .ERP-btn.secondary::after {
  content: '';
  position: absolute; top: 0; left: -60%; width: 40%; height: 100%;
  background: linear-gradient(115deg, transparent, rgba(255,255,255,.5), transparent);
  transform: skewX(-20deg);
  transition: left .55s ease;
  pointer-events: none;
}
.ERP-btn.primary:hover::after, .ERP-btn.secondary:hover::after { left: 130%; }

.ERP-btn.secondary {
  background: transparent;
  border: 1.5px solid #3B82F6;
  color: #2563EB;
}

.ERP-btn.secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: var(--sh-ember);
  transform: translateY(-2px) scale(1.02);
}

.ERP-btn.danger {
  background: var(--error-bg);
  border: 1.5px solid var(--error-bd);
  color: var(--error);
}

.ERP-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* ── Unified compact refresh button — unique orbit icon, idle pulse + click ripple/spin ── */
@keyframes erpRefreshIdle { 0%,100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.30); } 50% { box-shadow: 0 0 0 5px rgba(37,99,235,0); } }
@keyframes erpRefreshSpin { to { transform: rotate(360deg); } }
@keyframes erpRefreshRipple { from { transform: scale(0.5); opacity: 0.6; } to { transform: scale(1.9); opacity: 0; } }
.ERP-refresh-btn {
  position: relative;
  width: 28px; height: 28px;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1.5px solid var(--ember-border);
  background: var(--ember-ghost);
  color: var(--ember);
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s, border-color 0.2s, color 0.2s;
  animation: erpRefreshIdle 2.6s ease-in-out infinite;
}
.ERP-refresh-btn svg { transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1); }
.ERP-refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.08);
  background: linear-gradient(135deg,#60A5FA,#2563EB);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 6px 16px rgba(37,99,235,0.35);
  animation-play-state: paused;
}
.ERP-refresh-btn:hover:not(:disabled) svg { transform: rotate(180deg); }
.ERP-refresh-btn:active:not(:disabled) { transform: translateY(0) scale(0.92); }
.ERP-refresh-btn.spin svg { animation: erpRefreshSpin 0.7s cubic-bezier(0.4,0,0.2,1); }
.ERP-refresh-btn.spin::after {
  content: '';
  position: absolute; inset: 0;
  border-radius: 50%;
  border: 1.5px solid var(--ember-mid);
  animation: erpRefreshRipple 0.6s ease-out;
  pointer-events: none;
}
.ERP-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; animation: none; }

.ERP-spinner {
  display: inline-block;
  width: 11px; height: 11px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: erp-spin 0.65s linear infinite;
}

.ERP-msg {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--r-md);
  border: 1px solid;
  font-family: var(--font-body);
  font-size: 10.5px;
  font-weight: 700;
  margin-top: 16px;
  animation: erp-slide-up 0.22s ease both;
}

.ERP-msg.success { background: var(--success-bg); border-color: var(--success-bd); color: var(--success); }
.ERP-msg.error   { background: var(--error-bg);   border-color: var(--error-bd);   color: var(--error);   }
.ERP-msg.warn    { background: var(--warn-bg);     border-color: var(--warn-bd);    color: var(--warn);    }

.ERP-msg-icon { width: 18px; height: 18px; flex-shrink: 0; }

.ERP-req-note {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  font-family: var(--font-mono);
  font-size: 8px;
  color: var(--text-4);
  letter-spacing: 0.5px;
}
.ERP-req-star { color: var(--error); font-size: 9px; }

/* ── TABLE CARD ─────────────────────────────────────────────── */
.ERP-tbl-card {
  background: linear-gradient(170deg, var(--white) 0%, var(--off-white) 100%);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  overflow: hidden;
  box-shadow: var(--sh-card);
  animation: erp-pop 0.45s 0.15s ease both;
  position: relative;
  z-index: 1;
  transition: box-shadow 0.25s ease, transform .3s cubic-bezier(.22,1,.36,1);
}
.ERP-tbl-card:hover { box-shadow: var(--sh-hover); transform: translateY(-2px); }

.ERP-tbl-hdr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 26px;
  background: var(--off-white);
  border-bottom: 1px solid var(--border);
}

.ERP-tbl-title {
  font-family: var(--font-display);
  font-size: 16.5px;
  font-weight: 800;
  font-style: italic;
  color: var(--grey);
  margin-bottom: 3px;
}

.ERP-tbl-sub {
  font-family: var(--font-mono);
  font-size: 8px;
  color: var(--text-4);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.ERP-tbl-count {
  font-family: var(--font-mono);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1px;
  padding: 6px 14px;
  border-radius: 100px;
  background: var(--ember-ghost);
  color: var(--ember);
  border: 1px solid var(--ember-border);
  text-transform: uppercase;
}

.ERP-tbl-scroll {
  max-height: 440px;
  overflow-y: auto;
  overflow-x: auto;
}

.ERP-tbl { width: 100%; border-collapse: collapse; }

.ERP-tbl thead { background: var(--surface-2); }

.ERP-tbl th {
  padding: 12px 16px;
  text-align: left;
  font-family: var(--font-mono);
  font-size: 8px;
  font-weight: 800;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 2.5px;
  border-bottom: 2px solid var(--ember);
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--surface-2);
  white-space: nowrap;
}

.ERP-tbl td {
  padding: 13px 16px;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-body);
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-2);
  vertical-align: middle;
}

.ERP-tbl tbody tr {
  transition: background 0.15s, box-shadow 0.15s, transform 0.15s;
  animation: erp-stagger-in 0.4s cubic-bezier(0.22,1,0.36,1) both;
}
.ERP-tbl tbody tr:nth-child(1)  { animation-delay: 0.02s; }
.ERP-tbl tbody tr:nth-child(2)  { animation-delay: 0.05s; }
.ERP-tbl tbody tr:nth-child(3)  { animation-delay: 0.08s; }
.ERP-tbl tbody tr:nth-child(4)  { animation-delay: 0.11s; }
.ERP-tbl tbody tr:nth-child(5)  { animation-delay: 0.14s; }
.ERP-tbl tbody tr:nth-child(6)  { animation-delay: 0.17s; }
.ERP-tbl tbody tr:nth-child(7)  { animation-delay: 0.20s; }
.ERP-tbl tbody tr:nth-child(8)  { animation-delay: 0.23s; }
.ERP-tbl tbody tr:nth-child(n+9){ animation-delay: 0.26s; }
.ERP-tbl tbody tr:hover {
  background: var(--ember-ghost);
  box-shadow: inset 3px 0 0 var(--ember-mid);
}
.ERP-tbl tbody tr:last-child td { border-bottom: none; }

.ERP-t-num {
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 800;
  color: var(--text-4);
  text-align: center;
}

.ERP-t-primary {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 800;
  color: var(--text-1);
}

.ERP-t-code {
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  background: var(--ember-ghost);
  color: var(--ember);
  padding: 3px 9px;
  border-radius: var(--r-sm);
  border: 1px solid var(--ember-border);
  display: inline-block;
}

.ERP-t-null {
  color: var(--text-4);
  font-size: 9.5px;
}

.ERP-t-desc {
  color: var(--text-3);
  font-size: 9.5px;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.ERP-t-creator {
  font-size: 9.5px;
  color: var(--text-3);
}

.ERP-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: var(--r-sm);
  font-family: var(--font-mono);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  border: 1px solid;
  white-space: nowrap;
}

.ERP-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

.ERP-badge.income   { background: var(--success-bg); color: var(--success); border-color: var(--success-bd); }
.ERP-badge.expense  { background: var(--error-bg);   color: var(--error);   border-color: var(--error-bd);   }
.ERP-badge.active   { background: var(--info-bg);    color: var(--info);    border-color: var(--info-bd);    }
.ERP-badge.inactive { background: var(--surface-2);  color: var(--text-4);  border-color: var(--border);     }
.ERP-badge.cat      { background: var(--info-bg);    color: var(--info);    border-color: var(--info-bd);    }
.ERP-badge.sub      { background: var(--warn-bg);    color: var(--warn);    border-color: var(--warn-bd);    }
.ERP-badge.id-pill  { background: var(--ember-ghost);color: var(--ember);   border-color: var(--ember-border); }
.ERP-badge.id-num   { font-family: var(--font-mono); color: var(--text-3); background:transparent; border:none; padding:0; letter-spacing:0.5px; }

.ERP-act {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 13px;
  border-radius: var(--r-sm);
  font-family: var(--font-mono);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.18s;
}

.ERP-act + .ERP-act { margin-left: 6px; }

.ERP-act.edit {
  background: var(--ember-ghost);
  color: var(--ember);
  border-color: var(--ember-border);
}

.ERP-act.edit:hover {
  background: var(--ember);
  color: #fff;
  border-color: var(--ember);
  transform: translateY(-1px) scale(1.04);
  box-shadow: 0 3px 10px rgba(37,99,235,0.3);
}

.ERP-act.delete {
  background: var(--error-bg);
  color: var(--error);
  border-color: var(--error-bd);
}

.ERP-act.delete:hover {
  background: var(--error);
  color: #fff;
  border-color: var(--error);
  transform: translateY(-1px) scale(1.04);
  box-shadow: 0 3px 10px rgba(217,59,85,0.3);
}

.ERP-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}

.ERP-empty-icon {
  width: 54px; height: 54px;
  border-radius: 50%;
  background: var(--ember-ghost);
  border: 1.5px solid var(--ember-border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  opacity: 0.75;
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 14px -6px var(--ember-glow), inset 0 1px 0 rgba(255,255,255,.8);
}
.ERP-empty-icon::before {
  content: ''; position: absolute; top: 4px; left: 7px; width: 55%; height: 40%;
  border-radius: 50%; background: linear-gradient(180deg, rgba(255,255,255,.9), transparent);
  opacity: .65; pointer-events: none;
}
.ERP-empty-icon svg { filter: brightness(1.2) saturate(.88); position: relative; z-index: 1; }

.ERP-empty-title {
  font-family: var(--font-display);
  font-size: 19.5px;
  font-weight: 800;
  font-style: italic;
  color: var(--grey);
  margin-bottom: 6px;
}

.ERP-empty-sub {
  font-family: var(--font-mono);
  font-size: 8px;
  color: var(--text-4);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.ERP-shimmer {
  background: linear-gradient(90deg, var(--off-white) 25%, var(--surface-3) 50%, var(--off-white) 75%);
  background-size: 600px 100%;
  animation: erp-shimmer 1.6s infinite linear;
  border-radius: var(--r-sm);
}

/* ── MISC UTIL ──────────────────────────────────────────────── */
.ERP-nowrap { white-space: nowrap; }
.ERP-center { text-align: center; }

/* ══════════════════════════════════════════════════════════════
   PREMIUM SCROLLBAR — ERP Light Surface Override
   Ember-branded · animated glow · ultra-modern
   ══════════════════════════════════════════════════════════════ */

@keyframes erp-sb-glow {
  0%,100% { box-shadow: 0 0 4px rgba(59,130,246,0.35), 0 0 10px rgba(37,99,235,0.15); }
  50%      { box-shadow: 0 0 9px rgba(59,130,246,0.65), 0 0 20px rgba(37,99,235,0.30); }
}
@keyframes erp-sb-appear {
  from { opacity: 0; transform: scaleY(0.5); }
  to   { opacity: 1; transform: scaleY(1); }
}

/* Firefox */
.ERP-page,
.ERP-tbl-scroll,
.erp-scroll {
  scrollbar-width: thin;
  scrollbar-color: #3B82F6 rgba(203,213,225,0.20);
}

/* Webkit — scoped to ERP light-surface containers */
.ERP-page ::-webkit-scrollbar,
.ERP-tbl-scroll::-webkit-scrollbar,
.erp-scroll::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.ERP-page ::-webkit-scrollbar-track,
.ERP-tbl-scroll::-webkit-scrollbar-track,
.erp-scroll::-webkit-scrollbar-track {
  background: rgba(203,213,225,0.22);
  border-radius: 99px;
}

.ERP-page ::-webkit-scrollbar-thumb,
.ERP-tbl-scroll::-webkit-scrollbar-thumb,
.erp-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #60A5FA 0%, #3B82F6 42%, #2563EB 100%);
  border-radius: 99px;
  border: 1.5px solid rgba(255,255,255,0.50);
  box-shadow:
    0 0 4px rgba(59,130,246,0.28),
    inset 0 1px 0 rgba(191,219,254,0.40);
  animation: erp-sb-appear 0.25s ease both;
  transition: background 0.22s ease, box-shadow 0.22s ease;
}

.ERP-page ::-webkit-scrollbar-thumb:hover,
.ERP-tbl-scroll::-webkit-scrollbar-thumb:hover,
.erp-scroll::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #BFDBFE 0%, #3B82F6 40%, #2563EB 100%);
  box-shadow:
    0 0 10px rgba(59,130,246,0.58),
    0 0 22px rgba(37,99,235,0.25),
    inset 0 1px 0 rgba(219,234,254,0.50);
  animation: erp-sb-glow 1.8s ease-in-out infinite;
}

.ERP-page ::-webkit-scrollbar-thumb:active,
.ERP-tbl-scroll::-webkit-scrollbar-thumb:active,
.erp-scroll::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, #DBEAFE 0%, #BFDBFE 20%, #3B82F6 55%, #2563EB 100%);
  box-shadow:
    0 0 14px rgba(59,130,246,0.72),
    0 0 28px rgba(37,99,235,0.38),
    inset 0 1px 0 rgba(219,234,254,0.55);
}

.ERP-page ::-webkit-scrollbar-corner,
.ERP-tbl-scroll::-webkit-scrollbar-corner,
.erp-scroll::-webkit-scrollbar-corner {
  background: transparent;
}

.ERP-page ::-webkit-scrollbar-button,
.ERP-tbl-scroll::-webkit-scrollbar-button,
.erp-scroll::-webkit-scrollbar-button {
  display: none;
}

/* ══════════════════════════════════════════════════════════════
   MOBILE — every field/section adapts, nothing collapses to a
   single dead column when 2-up still fits comfortably.
   ══════════════════════════════════════════════════════════════ */

/* Smooth momentum scroll for horizontally-scrollable tables on iOS */
.ERP-tbl-scroll { -webkit-overflow-scrolling: touch; }

@media (max-width: 900px) {
  .ERP-form-card, .ERP-tbl-card { border-radius: var(--r-lg); }
  .ERP-form-body { padding: 20px 18px 18px; }
  .ERP-tbl-hdr { padding: 14px 18px; flex-wrap: wrap; gap: 10px; }
}

/* Action buttons stay side-by-side (2-up) instead of stacking full-width */
@media (max-width: 560px) {
  .ERP-btn-row { flex-wrap: wrap; gap: 10px; }
  .ERP-btn-row .ERP-btn { flex: 1 1 calc(50% - 5px); justify-content: center; padding: 11px 14px; }
}
@media (max-width: 360px) {
  .ERP-btn-row .ERP-btn { flex: 1 1 100%; }
}

/* Table — tighten paddings/type so more columns stay visible before the
   horizontal scroll kicks in, and keep row actions usable at thumb size */
@media (max-width: 640px) {
  .ERP-tbl th { padding: 10px 12px; font-size: 7.5px; }
  .ERP-tbl td { padding: 11px 12px; font-size: 9.5px; }
  .ERP-t-desc { max-width: 120px; }
  .ERP-act { padding: 7px 11px; }
  .ERP-tbl-title { font-size: 14px; }
}

/* Stat card numerals scale down so 2-up cards never overflow.
   Pages routinely set an inline fontSize on .ERP-stat-val (e.g. for
   currency amounts) — inline styles beat plain CSS, so these rules use
   !important to guarantee the value always shrinks to fit on mobile
   instead of being clipped/overflowing its card. */
.ERP-stat-val { overflow-wrap: break-word; line-height: 1.05; }
@media (max-width: 900px) {
  .ERP-stat-val { font-size: 16px !important; }
}
@media (max-width: 480px) {
  .ERP-stat { padding: 10px 11px 9px; }
  .ERP-stat-val { font-size: 14px !important; letter-spacing: -0.2px; }
  .ERP-stat-label { font-size: 6.5px; letter-spacing: 1.5px; }
  .ERP-stat-icon { width: 22px; height: 22px; margin-bottom: 7px; }
}
@media (max-width: 380px) {
  .ERP-stat-val { font-size: 13px !important; }
}

/* Dropdown / select / input touch targets — full width, comfortable tap size */
@media (max-width: 480px) {
  .ERP-dd-trigger, .ERP-input, .ERP-textarea, .ERP-select { font-size: 10.5px; }
  .ERP-section-tag { font-size: 8px; padding: 4px 10px; }
}

/* ═══════════════════════════════════════════════════════════════
   SHARED DATE PICKER (CalendarDD) — one date-picker UI, used on every
   page via components/CalendarDD.tsx. Warm White + Orange only, kept
   deliberately SMALL everywhere per project standard.
═══════════════════════════════════════════════════════════════ */
.ERP-cal-wrap { position: relative; display: inline-block; }
.ERP-cal-field {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 10px; min-height: 30px;
  border: 1.5px solid var(--border); border-radius: 8px;
  background: var(--off-white); color: var(--text-1);
  font-family: var(--body, inherit); font-size: 9px; font-weight: 700;
  transition: border-color .18s, box-shadow .18s, background .18s;
  user-select: none; white-space: nowrap;
}
.ERP-cal-field:hover { border-color: var(--ember-border); background: #fff; }
.ERP-cal-field:focus-visible { outline: 2px solid var(--ember); outline-offset: 2px; border-color: var(--ember-border); }
.ERP-cal-field svg { color: var(--ember); flex-shrink: 0; }
.ERP-cal-val { font-family: var(--mono, inherit); font-size: 9px; font-weight: 700; color: var(--text-1); }

.ERP-cal-panel {
  background: #fff; border: 1.5px solid var(--border); border-radius: 12px;
  box-shadow: 0 12px 36px rgba(15,23,42,.16), 0 0 0 1px rgba(255,255,255,.9) inset;
  padding: 10px; animation: erp-cal-pop .2s cubic-bezier(.22,1,.36,1) both;
}
@keyframes erp-cal-pop { from { opacity: 0; transform: translateY(-6px) scale(.96); } to { opacity: 1; transform: none; } }

.ERP-cal-hdr { display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 8px; }
.ERP-cal-nav {
  width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--border);
  background: #fff; color: var(--text-3); display: flex; align-items: center; justify-content: center;
  cursor: pointer; padding: 0; flex-shrink: 0; transition: background .18s, color .18s, transform .18s;
}
.ERP-cal-nav:hover { background: var(--ember); color: #fff; border-color: var(--ember); transform: scale(1.08); }
.ERP-cal-title-btn {
  display: flex; align-items: center; justify-content: center; flex: 1;
  font-family: var(--mono, inherit); font-size: 9px; font-weight: 800; letter-spacing: .5px;
  color: var(--text-1); text-transform: uppercase; background: transparent; border: none;
  cursor: pointer; padding: 3px 6px; border-radius: 7px; transition: background .18s, color .18s;
}
.ERP-cal-title-btn:hover { background: var(--ember-ghost); color: var(--ember); }

.ERP-cal-mpick { animation: erp-cal-pop .16s ease both; }
.ERP-cal-mpick-yr { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 8px; }
.ERP-cal-mpick-yr-val { font-family: var(--mono, inherit); font-size: 9.5px; font-weight: 800; color: var(--ember); min-width: 38px; text-align: center; }
.ERP-cal-mpick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
.ERP-cal-mpick-btn {
  padding: 7px 3px; border-radius: 7px; border: 1px solid var(--border); background: #fff;
  font-family: var(--mono, inherit); font-size: 8.5px; font-weight: 800; color: var(--text-2);
  cursor: pointer; transition: background .15s, color .15s, border-color .15s, transform .15s;
}
.ERP-cal-mpick-btn:hover { background: var(--ember-ghost); color: var(--ember); border-color: var(--ember-border); transform: translateY(-1px); }
.ERP-cal-mpick-btn.sel { background: linear-gradient(135deg, var(--ember), var(--ember-light)); color: #fff; border-color: transparent; box-shadow: 0 3px 8px var(--ember-glow); }

.ERP-cal-week { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 2px; }
.ERP-cal-week span { text-align: center; font-family: var(--mono, inherit); font-size: 7.5px; font-weight: 800; color: var(--text-4); text-transform: uppercase; padding: 3px 0; display: block; }
.ERP-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; }
.ERP-cal-day {
  aspect-ratio: 1; border: none; background: transparent; border-radius: 7px;
  font-family: var(--mono, inherit); font-size: 9px; font-weight: 700; color: var(--text-2);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background .15s, color .15s, transform .15s;
}
.ERP-cal-day:hover:not(:disabled) { background: var(--ember-ghost); color: var(--ember); }
.ERP-cal-day.today { border: 1.5px solid var(--ember-border); color: var(--ember); font-weight: 800; }
.ERP-cal-day.sel { background: linear-gradient(135deg, var(--ember), var(--ember-light)); color: #fff; font-weight: 800; box-shadow: 0 3px 8px var(--ember-glow); transform: scale(1.05); }
.ERP-cal-day:disabled { color: var(--border-2); cursor: not-allowed; opacity: .45; }
.ERP-cal-day.empty { cursor: default; }
.ERP-cal-day:focus-visible, .ERP-cal-mpick-btn:focus-visible { outline: 2px solid var(--ember); outline-offset: 1px; }

.ERP-cal-footer { display: flex; justify-content: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); }
.ERP-cal-today-btn {
  font-family: var(--mono, inherit); font-size: 8px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase;
  color: var(--ember); background: var(--ember-ghost); border: 1px solid var(--ember-border); border-radius: 100px;
  padding: 4px 12px; cursor: pointer; transition: background .18s, color .18s, transform .18s;
}
.ERP-cal-today-btn:hover { background: var(--ember); color: #fff; transform: translateY(-1px); }

@media (max-width: 480px) {
  .ERP-cal-field { padding: 5px 8px; font-size: 9px; min-height: 28px; }
  .ERP-cal-val { font-size: 9px; }
}

/* ══════════════════════════════════════════════════════════════════
   MASTER-DATA TOOLBAR — a single unified list+form view (the list is
   always visible; the old Create/View tab switcher is gone) used by
   Account Head, Account Sub-Head, Identification Type, Party Master
   & Associate Name master pages. The "+ Add" button (or a row's Edit
   icon) opens the form inline, above the table, instead of hiding the
   list behind a separate tab.
══════════════════════════════════════════════════════════════════ */
.MD-toolbar-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; animation: erp-slide-up .3s .05s ease both; }
.MD-toolbar-count { font-family: var(--font-mono); font-size: 8.5px; font-weight: 800; letter-spacing: 1.3px; text-transform: uppercase; color: var(--text-2); }
.MD-toolbar-count b { color: var(--ember); font-size: 11px; }
.MD-add-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 16px;
  font-family: var(--font-mono); font-size: 8.5px; font-weight: 800; letter-spacing: 1.3px; text-transform: uppercase;
  cursor: pointer; white-space: nowrap;
  border-radius: var(--r-md);
  transition: transform .18s, box-shadow .18s;
  color: #fff;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  border: none;
  box-shadow: var(--sh-ember);
}
.MD-add-btn:hover { transform: translateY(-2px); box-shadow: var(--sh-ember-lg); }
.MD-inline-form { animation: erp-slide-up .25s ease both; margin-bottom: 22px; }
@media (max-width: 640px) {
  .MD-toolbar-bar { flex-wrap: wrap; }
  .MD-add-btn { flex: 1; justify-content: center; padding: 9px 10px; }
}

/* ══════════════════════════════════════════════════════════════════
   MASTER-DATA PAGE / FORM TITLES — professional upright ERP caps
   style, overriding the italic serif .ERP-title/.ERP-form-title only
   where this modifier class is also applied (Master Data pages only;
   other pages keep the editorial italic look).
══════════════════════════════════════════════════════════════════ */
.MD-page-title, .MD-page-title .ERP-title-em {
  font-family: var(--font-body);
  font-style: normal;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.6px;
  font-size: 18px;
}
.MD-form-title {
  font-family: var(--font-body);
  font-style: normal;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.5px;
  font-size: 14px;
}

/* Shared small "Cancel Edit" pill shown in a form header while editing —
   replaces the ad-hoc inline-styled button that was duplicated with
   slightly different styles across Master/SubCategory/IDType/BioData. */
.MD-cancel-pill {
  margin-left: auto; display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 15px; border-radius: 100px;
  background: var(--error-bg); border: 1.5px solid var(--error-bd); color: var(--error);
  font-family: var(--font-mono); font-size: 9px; font-weight: 800; letter-spacing: .6px;
  cursor: pointer; transition: background .16s, transform .16s, box-shadow .16s;
}
.MD-cancel-pill:hover { background: var(--error); color: #fff; border-color: var(--error); transform: translateY(-1px); box-shadow: 0 3px 10px rgba(217,59,85,0.25); }

/* ══════════════════════════════════════════════════════════════════
   MASTER-DATA FORM HEADER — clean, static, premium version of
   .ERP-form-hdr. Scoped modifier (added alongside .ERP-form-hdr, does
   not touch the base class used elsewhere e.g. DaybookPage.tsx).
   One solid gradient underline (no continuous shimmer/blink), a
   compact gradient-backed icon chip (no continuous pulse — just a
   one-time pop-in on mount), and the redundant "01 —" section rule
   directly beneath is hidden via .MD-first-section so only a single
   divider line shows under the header.
══════════════════════════════════════════════════════════════════ */
.MD-form-hdr {
  border-bottom: none;
  padding-bottom: 18px;
}
/* Real block-level divider (not a pseudo-element layered over the
   flex header row) rendered as its own sibling <div> right after
   .MD-form-hdr. Negative left/right margins bleed it past
   .ERP-form-body's 30px horizontal padding so it touches the card's
   actual left/right border edges — the same reliable technique used
   for .ERP-form-topbar at the top of the card. A pseudo-element
   anchored to the flex header row measured against the row's own box,
   not the card, which is why it kept falling short of the edges. */
.MD-form-divider {
  height: 2px;
  margin: 0 -30px 22px;
  background: linear-gradient(90deg, var(--ember) 0%, var(--ember-light) 50%, var(--ember) 100%);
  animation: erp-fade-in 0.5s .1s ease both;
}
.MD-form-icon-wrap {
  width: 38px; height: 38px;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  border: none;
  box-shadow: 0 3px 10px rgba(37,99,235,0.26), inset 0 1px 0 rgba(255,255,255,.4);
  animation: erp-pop 0.4s ease both;
  position: relative;
  overflow: hidden;
}
.MD-form-icon-wrap::before {
  content: ''; position: absolute; top: 2px; left: 4px; width: 55%; height: 40%;
  border-radius: 50%; background: linear-gradient(180deg, rgba(255,255,255,.55), transparent);
  opacity: .8; pointer-events: none;
}
.MD-form-icon-wrap svg { position: relative; z-index: 1; }
.MD-form-hdr .ERP-form-title, .MD-form-hdr .ERP-form-desc { animation: erp-slide-up 0.4s .1s cubic-bezier(0.22,1,0.36,1) both; }
.MD-form-hdr .MD-cancel-pill { animation: erp-fade-in 0.4s .18s ease both; }

/* Hides the "01 —" section-rule line that sits directly beneath
   .MD-form-hdr so only one divider line shows between the header and
   the first field group (the header's own underline). */
.MD-first-section.ERP-section { margin-top: 4px; }
.MD-first-section .ERP-section-rule { display: none; }

/* ══════════════════════════════════════════════════════════════════
   MASTER-DATA CREATE LAYOUT — form (left) + live preview (right).
   Cards get a firmer border + layered ember-tinted shadow so the
   panels read as distinct, premium surfaces rather than flat boxes.
══════════════════════════════════════════════════════════════════ */
.MD-create-grid { display: grid; grid-template-columns: minmax(0,1fr) 320px; gap: 22px; align-items: start; }
@media (max-width: 980px) {
  .MD-create-grid { grid-template-columns: 1fr; }
}
.MD-create-grid .ERP-form-card {
  border: 1.5px solid var(--border-2);
  box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 10px 30px rgba(15,23,42,0.08);
}
.MD-tbl-card {
  border: 1.5px solid var(--border-2) !important;
  box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 10px 30px rgba(15,23,42,0.07) !important;
}
.MD-preview-card {
  position: sticky; top: 16px;
  background: var(--white);
  border: 1.5px solid var(--border-2);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 12px 32px rgba(37,99,235,0.10);
  animation: erp-pop 0.4s 0.15s ease both;
}
.MD-preview-head {
  display: flex; align-items: center; gap: 9px; padding: 15px 18px;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  position: relative; overflow: hidden;
}
.MD-preview-head::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(120deg, rgba(255,255,255,0.18), transparent 55%);
}
.MD-preview-head-dot { width: 7px; height: 7px; border-radius: 50%; background: #fff; animation: erp-pulse-dot 2.2s ease-in-out infinite; flex-shrink: 0; position: relative; z-index: 1; box-shadow: 0 0 0 3px rgba(255,255,255,0.3); }
.MD-preview-head-txt { font-family: var(--font-mono); font-size: 8.5px; font-weight: 800; letter-spacing: 1.8px; text-transform: uppercase; color: #fff; position: relative; z-index: 1; }
.MD-preview-body { padding: 6px 18px 4px; display: flex; flex-direction: column; }
.MD-preview-row {
  display: flex; align-items: flex-start; gap: 11px;
  padding: 13px 0; border-bottom: 1px solid var(--border);
}
.MD-preview-row:last-child { border-bottom: none; }
.MD-preview-ico {
  width: 28px; height: 28px; border-radius: var(--r-md); flex-shrink: 0;
  background: var(--ember-ghost); border: 1px solid var(--ember-border);
  display: flex; align-items: center; justify-content: center; color: var(--ember-mid);
  margin-top: 1px;
  box-shadow: 0 3px 8px -4px var(--ember-glow), inset 0 1px 0 rgba(255,255,255,.8);
}
.MD-preview-ico svg { filter: brightness(1.2) saturate(.88); }
.MD-preview-txt { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.MD-preview-lbl { font-family: var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; color: var(--text-4); }
.MD-preview-val { font-family: var(--font-body); font-size: 11.5px; font-weight: 800; color: var(--text-1); word-break: break-word; line-height: 1.35; }
.MD-preview-val.empty { font-weight: 600; color: var(--text-4); font-style: italic; }
.MD-preview-foot {
  padding: 12px 18px; margin-top: 4px;
  background: var(--off-white); border-top: 1.5px solid var(--border-2);
  font-family: var(--font-mono); font-size: 8px; font-weight: 700; color: var(--text-3);
  text-align: center; letter-spacing: .5px; text-transform: uppercase;
}

/* ══════════════════════════════════════════════════════════════════
   MASTER-DATA VIEW TABLE — professional caps title, orange column
   headings, real column-grid borders, plain colored text instead of
   pill/dot badges, and icon-only action buttons with hover animation
   (no continuous/blinking motion — only on hover, per prior feedback).
   Scoped to .MD-tbl-card so it only affects the 5 master-data view
   tables and never the base .ERP-tbl used elsewhere in the app.
══════════════════════════════════════════════════════════════════ */
.ERP-tbl-title.MD-tbl-title {
  font-family: var(--font-mono);
  font-style: normal;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--text-1);
}

/* Solid vivid-orange header fill with white caps text — a light tint
   read as too subtle, so the header row now uses the same gradient
   as the active tab pill for a clearly "orange" heading row. The
   gradient is set on each <th> itself (not the parent <thead>) so
   every sticky header cell carries its own opaque background —
   otherwise, since only the <th> cells are position:sticky (not the
   thead), a transparent cell background lets the scrolling body rows
   show through underneath as you scroll, breaking the sticky effect. */
.MD-tbl-card .ERP-tbl th {
  color: #fff;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  border-bottom: none;
  text-align: center;
}
.MD-tbl-card .ERP-tbl th, .MD-tbl-card .ERP-tbl td {
  border-right: 1px solid var(--border);
  text-align: center;
}
.MD-tbl-card .ERP-tbl th:last-child, .MD-tbl-card .ERP-tbl td:last-child { border-right: none; }

/* All body text in these tables is plain black/dark — no color-coding
   anywhere (Type, Status, Account Head, Account Sub-Head, Identification Type, etc. all
   read the same dark, bold, professional way) EXCEPT the primary
   Name column, which stays orange as the one accent color per row. */
.MD-tbl-card .ERP-tbl td { text-transform: uppercase; letter-spacing: 0.25px; color: var(--text-1); }
/* .ERP-t-primary and .ERP-t-creator are applied directly on <td>
   elements (not nested spans), so they compete with the ".ERP-tbl td"
   rule above for the same element. A plain ".MD-tbl-card .ERP-t-primary"
   selector has LOWER specificity than ".MD-tbl-card .ERP-tbl td"
   (2 classes vs 2 classes + 1 element), so the black td rule was
   silently winning regardless of source order. Adding "td" to these
   selectors matches that specificity so they correctly override it. */
.MD-tbl-card td.ERP-t-primary { color: var(--ember); font-weight: 800; }
.MD-tbl-card .ERP-t-desc { color: var(--text-2); font-weight: 700; margin: 0 auto; }
.MD-tbl-card td.ERP-t-creator { color: var(--text-2); font-weight: 800; }
.MD-tbl-card .ERP-t-code { color: var(--text-1); font-weight: 800; }
.MD-tbl-card .ERP-t-null { text-transform: none; }
.MD-tbl-card .MD-tbl-tag,
.MD-tbl-card .MD-tbl-tag.success,
.MD-tbl-card .MD-tbl-tag.danger,
.MD-tbl-card .MD-tbl-tag.info,
.MD-tbl-card .MD-tbl-tag.warn,
.MD-tbl-card .MD-tbl-tag.ember,
.MD-tbl-card .MD-tbl-tag.muted { color: var(--text-1); }

/* In-table filter bar (Party Master view) — category dropdown + manual
   name search, styled entirely in the project's ember theme. */
.MD-tbl-filter-bar {
  display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap;
  padding: 16px 26px;
  background: var(--off-white);
  border-bottom: 1px solid var(--border);
}
.MD-tbl-filter-item { display: flex; flex-direction: column; gap: 6px; }
.MD-tbl-filter-item:first-child { max-width: 200px; }
.MD-tbl-filter-bar .MD-tbl-filter-item:nth-child(2) { flex: 1; min-width: 260px; }
.MD-tbl-filter-lbl {
  font-family: var(--font-mono); font-size: 8px; font-weight: 800;
  letter-spacing: 1.3px; text-transform: uppercase; color: var(--text-4);
}
.MD-tbl-search-row { display: flex; align-items: center; gap: 7px; max-width: 460px; width: 100%; }
.MD-tbl-search-input {
  flex: 1; width: 0; padding: 8px 12px;
  border: 1.5px solid var(--border-2); border-radius: var(--r-sm);
  font-family: var(--font-body); font-size: 10.5px; font-weight: 700;
  color: var(--text-1); background: #fff;
  transition: border-color .18s, box-shadow .18s;
}
.MD-tbl-search-input::placeholder { color: var(--text-4); font-weight: 600; }
.MD-tbl-search-input:focus { outline: none; border-color: var(--ember-mid); box-shadow: 0 0 0 3px var(--ember-ghost); }
.MD-tbl-search-btn {
  display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; flex-shrink: 0;
  border-radius: var(--r-sm); border: none;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  box-shadow: 0 2px 8px rgba(37,99,235,0.24);
  cursor: pointer;
  transition: transform .18s cubic-bezier(0.22,1,0.36,1), box-shadow .18s ease;
}
.MD-tbl-search-btn:hover { transform: translateY(-2px) scale(1.08); box-shadow: 0 5px 14px rgba(37,99,235,0.34); }
.MD-tbl-reset-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 15px; border-radius: 100px;
  background: #fff; border: 1.5px solid var(--border-2); color: var(--text-3);
  font-family: var(--font-mono); font-size: 8.5px; font-weight: 800;
  letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
  transition: all .18s ease;
}
.MD-tbl-reset-pill:hover { border-color: var(--ember-mid); color: var(--ember); background: var(--ember-ghost); }

/* Transparent, thin, professional scrollbar for the table's scroll
   container — replaces the default chunky OS scrollbar. */
.MD-tbl-card .ERP-tbl-scroll { scrollbar-width: thin; scrollbar-color: rgba(37,99,235,0.35) transparent; }
.MD-tbl-card .ERP-tbl-scroll::-webkit-scrollbar { width: 7px; height: 7px; background: transparent; }
.MD-tbl-card .ERP-tbl-scroll::-webkit-scrollbar-track { background: transparent; }
.MD-tbl-card .ERP-tbl-scroll::-webkit-scrollbar-thumb {
  background: rgba(37,99,235,0.30);
  border-radius: 100px;
  border: 1px solid transparent;
  background-clip: padding-box;
}
.MD-tbl-card .ERP-tbl-scroll::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.55); background-clip: padding-box; }

/* Plain colored text label — replaces the pill/dot .ERP-badge look
   for reference fields (Type, Status, Account Head, Account Sub-Head,
   Classification, Identification Type, etc.) inside the 5 master-data tables. */
.MD-tbl-tag {
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.MD-tbl-tag.success { color: var(--success); }
.MD-tbl-tag.danger  { color: var(--error); }
.MD-tbl-tag.info    { color: var(--info); }
.MD-tbl-tag.warn    { color: var(--warn); }
.MD-tbl-tag.ember   { color: var(--ember); }
.MD-tbl-tag.muted   { color: var(--text-4); font-weight: 800; }

/* Icon-only action buttons — replaces text+icon .ERP-act. Hover-only
   lift/scale/glow animation, nothing continuous or blinking. */
.MD-act-ico {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px;
  border-radius: var(--r-sm);
  border: 1px solid;
  cursor: pointer;
  transition: transform .2s cubic-bezier(0.22,1,0.36,1), box-shadow .2s ease, background .18s ease, color .18s ease, border-color .18s ease;
}
.MD-act-ico + .MD-act-ico { margin-left: 7px; }
.MD-act-ico.edit { background: var(--ember-ghost); color: var(--ember); border-color: var(--ember-border); }
.MD-act-ico.edit:hover {
  background: var(--ember); color: #fff; border-color: var(--ember);
  transform: translateY(-2px) scale(1.08);
  box-shadow: 0 5px 14px rgba(37,99,235,0.32);
}
.MD-act-ico.delete { background: var(--error-bg); color: var(--error); border-color: var(--error-bd); }
.MD-act-ico.delete:hover {
  background: var(--error); color: #fff; border-color: var(--error);
  transform: translateY(-2px) scale(1.08);
  box-shadow: 0 5px 14px rgba(217,59,85,0.32);
}

/* ══════════════════════════════════════════════════════════════════
   RUNNING LOADER — professional ember stick-figure runner for inline
   "fetching" states (replaces skeleton-row tables / plain "Loading..."
   text across the 5 Master Data pages). Distinct figure from
   ConfirmDeleteModal's falling mascot. Position is driven by "left"
   as a percentage of the track's own width, so the run bounces the
   full available width of whatever card it's placed in (responsive)
   rather than a fixed pixel distance. Bounces there-and-back in one
   keyframe loop (0%→50%→100%) with the flip synced at the 50%
   turnaround, so there's no jump/teleport at the loop boundary.
══════════════════════════════════════════════════════════════════ */
@keyframes rl-run-track { 0%, 100% { left: 0%; } 50% { left: calc(100% - 54px); } }
@keyframes rl-run-flip {
  0%, 49.9%  { transform: scaleX(1); }
  50%, 99.9% { transform: scaleX(-1); }
  100%       { transform: scaleX(1); }
}
/* Bumped amplitude across the whole run cycle (bob -4px to -6px, arm/leg
   swing widened ~6deg each side) for a more energetic, attractive stride —
   this is the one shared run-cycle used by every "running man" instance
   project-wide (RunningLoader's inline loaders, PageOpenIntro's full-page
   runner, and anywhere else that reuses these rl-run-* keyframes), so the
   improvement lands everywhere at once instead of needing a per-page fix. */
@keyframes rl-run-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes rl-run-arm-back  { 0%,100% { transform: rotate(44deg); } 50% { transform: rotate(-34deg); } }
@keyframes rl-run-arm-front { 0%,100% { transform: rotate(-34deg); } 50% { transform: rotate(44deg); } }
@keyframes rl-run-leg-back  { 0%,100% { transform: rotate(54deg); } 50% { transform: rotate(-42deg); } }
@keyframes rl-run-leg-front { 0%,100% { transform: rotate(-42deg); } 50% { transform: rotate(54deg); } }
@keyframes rl-run-line {
  0%   { opacity: 0; transform: translateX(8px); }
  45%  { opacity: 1; transform: translateX(0); }
  100% { opacity: 0; transform: translateX(-8px); }
}
@keyframes rl-dots { 0%, 80%, 100% { opacity: .25; transform: scale(.85); } 40% { opacity: 1; transform: scale(1); } }

.RL-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 46px 24px; }
.RL-track { position: relative; width: 100%; max-width: 460px; height: 76px; }
.RL-runner { position: absolute; top: 0; animation: rl-run-track 1.6s linear infinite; }
.RL-flip { animation: rl-run-flip 1.6s linear infinite; display: block; }
.RL-figure { animation: rl-run-bob 0.5s ease-in-out infinite; }
.RL-arm-back  { transform-origin: 0 0; animation: rl-run-arm-back 0.5s ease-in-out infinite; }
.RL-arm-front { transform-origin: 0 0; animation: rl-run-arm-front 0.5s ease-in-out infinite; }
.RL-leg-back  { transform-origin: 0 0; animation: rl-run-leg-back 0.5s ease-in-out infinite; }
.RL-leg-front { transform-origin: 0 0; animation: rl-run-leg-front 0.5s ease-in-out infinite; }
.RL-line { animation: rl-run-line 0.7s ease-in-out infinite; }
.RL-line.l2 { animation-delay: .09s; }
.RL-line.l3 { animation-delay: .18s; }
.RL-title {
  font-family: var(--font-mono); font-size: 9px; font-weight: 800;
  letter-spacing: 1.6px; text-transform: uppercase; color: var(--text-2);
  text-align: center; display: flex; align-items: center; justify-content: center;
}
.RL-dots { display: inline-flex; gap: 4px; margin-left: 6px; }
.RL-dots span { width: 4px; height: 4px; border-radius: 50%; background: var(--ember); display: inline-block; animation: rl-dots 1.1s ease-in-out infinite; }
.RL-dots span:nth-child(2) { animation-delay: .15s; }
.RL-dots span:nth-child(3) { animation-delay: .3s; }

/* ══════════════════════════════════════════════════════════════════
   PAGE-OPEN INTRO (PageOpenIntro.tsx) — "the man runs once, then falls,
   then the page opens". Used by Cash Book (both pages) and Credit
   Management. position:fixed with a JS-measured left/width (passed
   as inline style by the component) keeps this immune to the page's
   real scrollable content height and to sidebar collapsed/expanded
   width — both of which broke earlier CSS-only attempts at centering.
══════════════════════════════════════════════════════════════════ */
.DBI-overlay {
  position: fixed; top: 0; bottom: 0; z-index: 500;
  display: flex; align-items: center; justify-content: center;
  background: none;
  transition: opacity 0.26s ease;
  overflow: hidden;
}
.DBI-overlay.exiting { opacity: 0; pointer-events: none; }

/* While the intro is mounted, the real header/content sitting behind it
   must not be visible at all — showing both at once (sharp header +
   animation) is the "not a perfect way" problem. There's no separate
   colored layer here: the page's own .ERP-page background (var(--surface))
   is what's behind the runner, because its real children are hidden via
   opacity, not covered by another box. The moment the overlay starts its
   own fade-out (.exiting), the real content crossfades in at the same
   0.26s pace, so the handoff from "animation" to "page" is a single
   synchronized transition instead of an abrupt cut or a moment where
   both are visible together.

   !important on the hide rule is required, not decorative: several
   direct children use entrance-animation utility classes (.animate-scale/
   .animate-in/.animate-fade, e.g. DaybookTransactions' .T-filterpanel)
   whose keyframes animate opacity 0 to 1 and hold the end value via
   animation-fill-mode: both. Per the CSS cascade, a running/finished
   CSS *animation*'s value for a property beats a plain (non-!important)
   author rule for that same property, regardless of selector specificity
   — so without !important here, any child with its own opacity-animating
   entrance class stayed visible (at its animated opacity:1) right through
   the runner overlay, which is exactly the "filter panel + table show
   through while the man runs" bug this rule exists to prevent. Author
   !important does outrank animations in the cascade, so it wins back. */
.ERP-page:has(> .DBI-overlay) > *:not(.DBI-overlay) {
  opacity: 0 !important;
  pointer-events: none !important;
}
.ERP-page:has(> .DBI-overlay.exiting) > *:not(.DBI-overlay) {
  opacity: 1 !important;
  transition: opacity 0.26s ease;
  pointer-events: auto !important;
}
.DBI-track { position: relative; width: 100%; height: 128px; }
@keyframes dbi-walk { from { left: 0%; } to { left: calc(100% - 96px); } }
.DBI-runner { position: absolute; top: 0; animation: dbi-walk 1.5s linear forwards; }
.DBI-figure { animation: rl-run-bob 0.5s ease-in-out infinite; }
.DBI-arm-back  { transform-origin: 0 0; animation: rl-run-arm-back 0.5s ease-in-out infinite; }
.DBI-arm-front { transform-origin: 0 0; animation: rl-run-arm-front 0.5s ease-in-out infinite; }
.DBI-leg-back  { transform-origin: 0 0; animation: rl-run-leg-back 0.5s ease-in-out infinite; }
.DBI-leg-front { transform-origin: 0 0; animation: rl-run-leg-front 0.5s ease-in-out infinite; }
.DBI-lines { animation: rl-run-line 0.7s ease-in-out infinite; }
.DBI-lines .RL-line.l2 { animation-delay: 0.12s; }
.DBI-lines .RL-line.l3 { animation-delay: 0.24s; }
/* Was a trip-and-fall (rotate + drop down, fade out in place). Replaced
   with a leap that launches the runner diagonally up and off the edge of
   the screen — a quick anticipation squash, then an explosive jump that
   carries it past the overlay's own bounds (.DBI-overlay has
   overflow:hidden, so once the translate pushes it beyond the box it's
   genuinely clipped away, reading as "jumped outside the device" rather
   than merely fading). Much more of an attractive, energetic finish than
   a stumble. */
@keyframes dbi-jump {
  0%   { transform: translate(0,0) scale(1,1) rotate(0deg); opacity: 1; }
  18%  { transform: translate(3px,7px) scale(1.14,0.82) rotate(-6deg); opacity: 1; }
  50%  { transform: translate(90px,-70px) scale(0.92,1.12) rotate(22deg); opacity: 1; }
  100% { transform: translate(220px,-210px) scale(0.5,0.7) rotate(62deg); opacity: 0; }
}
.DBI-runner.falling { animation: none; left: calc(100% - 96px); }
.DBI-runner.falling .DBI-figure {
  animation: dbi-jump 620ms cubic-bezier(0.2,0.85,0.4,1) forwards;
}
/* Takeoff burst — a quick radial flash at the launch point, timed to the
   anticipation-squash moment, for extra "oomph" on the jump. */
.DBI-runner.falling::before {
  content: '';
  position: absolute;
  left: 4px; top: 28px;
  width: 42px; height: 42px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59,130,246,0.55) 0%, rgba(59,130,246,0) 72%);
  animation: dbi-burst 420ms ease-out 80ms both;
  pointer-events: none;
}
@keyframes dbi-burst {
  0%   { transform: scale(0.2); opacity: 0.9; }
  100% { transform: scale(2.4); opacity: 0; }
}
.DBI-runner.falling .DBI-arm-back,
.DBI-runner.falling .DBI-arm-front,
.DBI-runner.falling .DBI-leg-back,
.DBI-runner.falling .DBI-leg-front,
.DBI-runner.falling .DBI-lines { animation-play-state: paused; }
.DBI-label {
  position: absolute; left: 0; right: 0; bottom: 10px;
  text-align: center;
  font-family: var(--font-mono); font-size: 9px; font-weight: 800;
  letter-spacing: 2px; text-transform: uppercase; color: var(--text-3);
}

/* ══════════════════════════════════════════════════════════════════
   MASTER-DATA FIELD VALIDATION — replaces the native browser
   "Please fill out this field" tooltip. The invalid field gets a red
   border + brief shake and an inline message right under it; the
   page also scrolls/focuses to that exact field so the user lands on
   it directly instead of just reading a generic banner.
══════════════════════════════════════════════════════════════════ */
@keyframes md-shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}
.MD-field-error .ERP-input,
.MD-field-error .ERP-textarea,
.MD-field-error .ERP-dd-trigger,
.MD-field-error .SDD-trigger {
  border-color: var(--error) !important;
  background: var(--error-bg) !important;
  animation: md-shake 0.4s ease;
}
.MD-field-error-msg {
  display: flex; align-items: center; gap: 5px;
  margin-top: 6px;
  font-family: var(--font-mono); font-size: 8.5px; font-weight: 800;
  letter-spacing: 0.3px; color: var(--error);
  animation: erp-fade-in 0.2s ease both;
}

/* ══════════════════════════════════════════════════════════════════
   SHARED PAGINATION — one consistent, premium, animated pager for
   every view-page table project-wide (Master Data pages, Workforce
   Register, Attendance, Credit Management, Client Portal, Income
   Statement, Cash Book, all report tables). Used via the <Pagination/>
   component in src/components/Pagination.tsx — since ERP_CSS is
   already imported on every page, this bar looks identical everywhere
   with zero per-page CSS duplication.
══════════════════════════════════════════════════════════════════ */
@keyframes erp-pg-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
@keyframes erp-pg-pop { from{transform:scale(.7)} to{transform:scale(1.08)} }
.ERP-pg {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 22px; border-top: 1px solid var(--border);
  background: var(--off-white); flex-wrap: wrap; gap: 12px;
  animation: erp-pg-in 0.35s cubic-bezier(0.22,1,0.36,1) both;
}
.ERP-pg-info { font-family: var(--font-mono); font-size: 9px; font-weight: 700; color: var(--text-3); letter-spacing: 0.2px; }
.ERP-pg-info strong { color: var(--text-1); font-weight: 800; }
.ERP-pg-info-sep { margin: 0 6px; color: var(--border-2); }
.ERP-pg-btns {
  display: flex; align-items: center; gap: 4px; padding: 4px;
  background: var(--white); border: 1.5px solid var(--border);
  border-radius: 999px; box-shadow: var(--sh-card);
}
.ERP-pg-btn {
  display: flex; align-items: center; justify-content: center;
  min-width: 30px; height: 30px; padding: 0 4px; border-radius: 999px;
  background: transparent; border: none; font-size: 10px; font-weight: 800;
  font-family: var(--font-body); color: var(--text-3); cursor: pointer;
  transition: transform .18s cubic-bezier(.34,1.56,.64,1), background .18s ease, color .18s ease, box-shadow .18s ease;
}
.ERP-pg-btn:hover:not(:disabled) { color: var(--ember); background: var(--ember-ghost); transform: translateY(-1px) scale(1.06); }
.ERP-pg-btn:active:not(:disabled) { transform: scale(0.9); transition-duration: .08s; }
.ERP-pg-btn.on {
  background: linear-gradient(135deg, var(--ember-mid,#3B82F6), var(--ember));
  color: #fff; box-shadow: 0 3px 10px rgba(37,99,235,0.4); transform: scale(1.08);
  animation: erp-pg-pop .28s cubic-bezier(.34,1.56,.64,1);
}
.ERP-pg-btn.on:hover { transform: scale(1.1); }
.ERP-pg-edge { color: var(--text-4); }
.ERP-pg-btn:disabled { opacity: .28; cursor: not-allowed; transform: none !important; }
.ERP-pg-ellipsis {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 30px; font-size: 9px; font-weight: 800;
  color: var(--text-4); letter-spacing: 1px;
}
.ERP-pg-per { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 9px; font-weight: 700; color: var(--text-3); }
.ERP-pg-per-sel {
  padding: 7px 12px; background: var(--white); border: 1.5px solid var(--border);
  border-radius: 999px; font-family: var(--font-mono); font-size: 9px; font-weight: 800;
  color: var(--text-1); cursor: pointer; outline: none; transition: all .18s ease; box-shadow: var(--sh-card);
}
.ERP-pg-per-sel:hover { border-color: var(--ember-border); color: var(--ember); }
.ERP-pg-per-sel:focus { border-color: var(--ember-mid); box-shadow: 0 0 0 2px var(--ember-ghost); }
@media (max-width: 720px) {
  .ERP-pg { justify-content: center; text-align: center; }
}
`;
