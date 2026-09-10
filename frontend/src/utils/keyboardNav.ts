// Project-wide keyboard field navigation.
//
// Goal: pressing Down Arrow, Up Arrow, or Enter while focused in any tracked
// form moves focus to the next/previous field — exactly like Tab/Shift+Tab
// already do natively — so every screen in the app can be driven end-to-end
// from the keyboard alone, no mouse required.
//
// Custom dropdown/combobox components (the various SDD/SearchDD/
// MultiSelectDD/CalendarDD implementations across the app) each call
// markPanelOpen()/markPanelClosed() — usually via a one-line useEffect
// watching their own `open` state — while their own option list is open.
// useKeyboardFieldNav checks anyPanelOpen() and backs off whenever that's
// true, so an open dropdown keeps full control of its own Up/Down/Enter
// handling instead of having it hijacked mid-selection.

import { useEffect, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from 'react';

// A counter, not a boolean — more than one dropdown could theoretically be
// mid-transition (one closing while another opens) before their own
// close-on-outside-click effects settle.
let openPanelCount = 0;

export function markPanelOpen(): void {
  openPanelCount++;
}

export function markPanelClosed(): void {
  openPanelCount = Math.max(0, openPanelCount - 1);
}

export function anyPanelOpen(): boolean {
  return openPanelCount > 0;
}

const FOCUSABLE_SELECTOR = [
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
].join(',');

function isVisible(el: HTMLElement): boolean {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

/**
 * Attach to a form/page's outer container ref. While focus is anywhere
 * inside that container, ArrowDown/Enter move to the next focusable field
 * and ArrowUp moves to the previous one — mirroring what Tab/Shift+Tab
 * already do, just without needing to reach for Tab specifically.
 *
 * Opt an individual field out entirely with a `data-kbnav-skip` attribute
 * on it (or a wrapping element) — e.g. a multi-line textarea, or a field
 * whose Enter key already does something else on its own (submit a form,
 * add a chip, etc). Textareas are skipped automatically.
 */
export function useKeyboardFieldNav(containerRef: RefObject<HTMLElement | null>, enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter') return;
      if (anyPanelOpen()) return; // an open dropdown owns its own arrows/Enter right now

      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.tagName === 'TEXTAREA') return; // multi-line — arrows/Enter stay native
      if (target.closest('[data-kbnav-skip]')) return;

      const all = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isVisible);
      const idx = all.indexOf(target);
      if (idx === -1) return;

      if (e.key === 'ArrowUp') {
        const prev = all[idx - 1];
        if (prev) { e.preventDefault(); prev.focus(); }
        return;
      }
      // ArrowDown or Enter both move forward.
      const next = all[idx + 1];
      if (next) { e.preventDefault(); next.focus(); }
    };

    container.addEventListener('keydown', handler);
    return () => container.removeEventListener('keydown', handler);
  }, [containerRef, enabled]);
}

// ─────────────────────────────────────────────────────────────────
// Dropdown/combobox keyboard operability.
//
// The hooks above move focus BETWEEN fields. These two move focus
// WITHIN a single custom dropdown (SDD/SearchDD/MultiSelectDD/
// ClientPicker/BioDD/CalendarDD/etc across the app) so none of them
// require a mouse either:
//
//   useDropdownTriggerKeyDown — put its returned handler on the
//   trigger element's onKeyDown. While the panel is closed, ArrowDown/
//   ArrowUp/Enter/Space open it (Enter/Space also matter because most
//   triggers are plain <div onClick> elements, not real <button>s, so
//   they need to be made focusable — give the trigger tabIndex={0} and
//   role="button" alongside this handler).
//
//   useDropdownPanelArrowNav — call once the panel is open. It focuses
//   the first real option automatically, then ArrowDown/ArrowUp move
//   real DOM focus between whatever matches `optionSelector` inside
//   panelRef (default: enabled buttons/links/inputs), Escape closes the
//   panel and returns focus to the trigger. Enter/Space need no special
//   handling — they already activate a focused <button> natively.
// ─────────────────────────────────────────────────────────────────

const DEFAULT_OPTION_SELECTOR = 'button:not([disabled]), [role="option"]:not([aria-disabled="true"]), input:not([disabled])';

export function useDropdownTriggerKeyDown(
  open: boolean,
  setOpen: (v: boolean) => void,
): (e: ReactKeyboardEvent) => void {
  return (e: ReactKeyboardEvent) => {
    if (open) return; // panel owns keys once it's open (see useDropdownPanelArrowNav)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
    }
  };
}

export interface DropdownPanelArrowNavOpts {
  optionSelector?: string;
  // Type-to-filter comboboxes (panel opens via the input's own onFocus, not
  // a click on a separate trigger) need the input to KEEP focus the instant
  // the panel opens, so the user can carry on typing — set this to false for
  // those. Click-to-open dropdowns want the opposite: jump straight into the
  // option list so arrows work immediately (the default).
  autoFocusFirst?: boolean;
}

export function useDropdownPanelArrowNav(
  open: boolean,
  setOpen: (v: boolean) => void,
  panelRef: RefObject<HTMLElement | null>,
  triggerRef: RefObject<HTMLElement | null>,
  opts: DropdownPanelArrowNavOpts = {},
): void {
  const optionSelector = opts.optionSelector ?? DEFAULT_OPTION_SELECTOR;
  const autoFocusFirst = opts.autoFocusFirst ?? true;
  useEffect(() => {
    if (!open) return;

    // Focus the first option once the panel has painted (portals/positioning
    // often land a frame after `open` flips true).
    const focusFirst = (): boolean => {
      const panel = panelRef.current;
      if (!panel) return false;
      const opts = Array.from(panel.querySelectorAll<HTMLElement>(optionSelector)).filter(isVisible);
      if (opts.length === 0) return false;
      opts[0].focus();
      return true;
    };
    let raf = 0;
    if (autoFocusFirst && !focusFirst()) raf = requestAnimationFrame(focusFirst);

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      // Options that are plain <div role="option"> (not real <button>s) get
      // no native keyboard activation from the browser — simulate a click.
      // Real buttons/inputs already handle Enter/Space themselves, so leave
      // those alone (their own onClick already fires natively).
      if (e.key === 'Enter' || e.key === ' ') {
        const active = document.activeElement as HTMLElement | null;
        if (active && active.getAttribute('role') === 'option' && panelRef.current?.contains(active)) {
          e.preventDefault();
          // Some option rows select on onMouseDown instead of onClick (to
          // beat a search input's onBlur-closes-panel race) — dispatch both
          // so either handler style fires.
          active.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
          active.click();
        }
        return;
      }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const panel = panelRef.current;
      if (!panel) return;
      const opts = Array.from(panel.querySelectorAll<HTMLElement>(optionSelector)).filter(isVisible);
      if (opts.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      const idx = active ? opts.indexOf(active) : -1;
      e.preventDefault();
      if (e.key === 'ArrowDown') {
        opts[idx === -1 ? 0 : Math.min(idx + 1, opts.length - 1)].focus();
      } else {
        if (idx <= 0) { triggerRef.current?.focus(); }
        else opts[idx - 1].focus();
      }
    };

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}
