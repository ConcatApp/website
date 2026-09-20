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
    anchors: true, // intercepts in-page #anchor links
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

function destroy() {
  for (const fn of cleanups) fn();
  cleanups = [];
  for (const trigger of ScrollTrigger.getAll()) trigger.kill();
}

function init() {
  destroy();
  initLenis();
  initReveals();
  initParallax();
  ScrollTrigger.refresh();
}

// `astro:page-load` fires on first load and after every client-side navigation.
document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', destroy);
// The `js` class lives on <html>, which the router replaces on navigation.
document.addEventListener('astro:after-swap', () => document.documentElement.classList.add('js'));
