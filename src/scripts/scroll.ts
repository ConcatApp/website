/**
 * Scroll system
 *  - Lenis        smooth, inertial scrolling (skipped when the user prefers reduced motion)
 *  - GSAP         scroll-linked effects via ScrollTrigger, driven by Lenis
 *  - Motion       lightweight one-shot reveals via inView (IntersectionObserver)
 *
 * Re-initialises on every Astro view-transition navigation and tears down before the swap.
 *
 * Markup hooks:
 *   data-reveal              fade + rise once ~20% of the element is visible
 *   data-reveal="stagger"    same, but the element's direct children animate in sequence
 *   data-parallax="0.15"     drifts up to 15% of its height across its scroll range (GSAP scrub)
 *
 * In-page links (a[href="#id"] on the current page) are handled here too. Astro's ClientRouter would
 * otherwise perform a native jump by setting location.href, after which Lenis's own `anchors` handler
 * measures the target from the new viewport position and animates the page back to the top. The click
 * is caught in the capture phase, its default prevented (which makes ClientRouter skip it), and the
 * scroll runs through Lenis, instantly under reduced motion. The URL hash is updated in place.
 */
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate, inView, stagger } from 'motion';

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

let lenis: Lenis | null = null;
let cleanups: Array<() => void> = [];

/** Access the live Lenis instance (e.g. `getLenis()?.scrollTo('#download')`). */
export function getLenis() {
  return lenis;
}

function initLenis() {
  if (reducedMotion.matches) return;

  lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    anchors: false, // in-page links are handled by initAnchors below
  });

  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  cleanups.push(() => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  });
}

function initReveals() {
  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (targets.length === 0) return;

  if (reducedMotion.matches) {
    for (const el of targets) el.style.opacity = '1';
    return;
  }

  const stop = inView(
    targets,
    (el) => {
      const element = el as HTMLElement;
      const isStagger = element.dataset.reveal === 'stagger';
      const nodes = isStagger ? (Array.from(element.children) as HTMLElement[]) : [element];

      if (isStagger) {
        for (const child of nodes) child.style.opacity = '0';
        element.style.opacity = '1';
      }

      animate(
        nodes,
        { opacity: [0, 1], y: [20, 0] },
        { duration: 0.9, ease: EASE_OUT_EXPO, delay: isStagger ? stagger(0.08) : 0 },
      );
      // Not returning an onLeave callback => fires once.
    },
    { amount: 0.2, margin: '0px 0px -8% 0px' },
  );

  cleanups.push(stop);
}

function initParallax() {
  if (reducedMotion.matches) return;

  for (const el of document.querySelectorAll<HTMLElement>('[data-parallax]')) {
    const amount = Number.parseFloat(el.dataset.parallax || '0.15') * 100;
    const tween = gsap.fromTo(
      el,
      { yPercent: amount / 2 },
      {
        yPercent: -amount / 2,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
    cleanups.push(() => {
      tween.scrollTrigger?.kill();
      tween.kill();
    });
  }
}

function initAnchors() {
  const onClick = (ev: MouseEvent) => {
    if (
      ev.defaultPrevented ||
      ev.button !== 0 ||
      ev.metaKey ||
      ev.ctrlKey ||
      ev.altKey ||
      ev.shiftKey
    ) {
      return;
    }
    const link = ev.target instanceof Element ? ev.target.closest('a[href]') : null;
    if (!(link instanceof HTMLAnchorElement) || (link.target && link.target !== '_self')) return;

    const url = new URL(link.href);
    if (
      url.origin !== location.origin ||
      url.pathname !== location.pathname ||
      url.search !== location.search ||
      !url.hash
    ) {
      return;
    }
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;

    ev.preventDefault();
    history.replaceState(history.state, '', url.hash);

    // Both paths honour the section's scroll-margin-top, which keeps it clear of the fixed header.
    if (lenis) lenis.scrollTo(target, { duration: 1 });
    else target.scrollIntoView();

    // Like a native hash jump, let keyboard focus continue from the target.
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }
    target.focus({ preventScroll: true });
  };

  document.addEventListener('click', onClick, true);
  cleanups.push(() => document.removeEventListener('click', onClick, true));
}

function destroy() {
  for (const fn of cleanups) fn();
  cleanups = [];
  for (const trigger of ScrollTrigger.getAll()) trigger.kill();
}

function init() {
  destroy();
  initLenis();
  initAnchors();
  initReveals();
  initParallax();
  ScrollTrigger.refresh();
}

// `astro:page-load` fires on first load and after every client-side navigation.
document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', destroy);
// The `js` class lives on <html>, which the router replaces on navigation.
document.addEventListener('astro:after-swap', () => document.documentElement.classList.add('js'));
