import { Directive, ElementRef, LOCALE_ID, effect, inject, input } from '@angular/core';
import { prefersReducedMotion } from './reduced-motion';

const DURATION_MS = 900;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

@Directive({ selector: '[appCountUp]' })
export class CountUp {
  value = input.required<number>({ alias: 'appCountUp' });
  decimals = input(0);

  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private locale = inject(LOCALE_ID);

  constructor() {
    effect((onCleanup) => {
      const target = this.value();
      const digits = this.decimals();
      const format = new Intl.NumberFormat(this.locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
      const render = (n: number) => (this.el.nativeElement.textContent = format.format(n));

      if (prefersReducedMotion()) {
        render(target);
        return;
      }

      const start = performance.now();
      let frame = 0;
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / DURATION_MS);
        render(target * easeOutCubic(progress));
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
      onCleanup(() => cancelAnimationFrame(frame));
    });
  }
}
