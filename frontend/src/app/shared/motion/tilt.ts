import { Directive, ElementRef, inject } from '@angular/core';
import { prefersReducedMotion } from './reduced-motion';

const MAX_TILT_DEG = 5;

@Directive({
  selector: '[appTilt]',
  host: {
    class: 'tilt',
    '(pointermove)': 'follow($event)',
    '(pointerleave)': 'reset()',
  },
})
export class Tilt {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);

  follow(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' || prefersReducedMotion()) return;

    const card = this.el.nativeElement;
    const box = card.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;

    card.style.setProperty('--tilt-x', `${(0.5 - y) * MAX_TILT_DEG}deg`);
    card.style.setProperty('--tilt-y', `${(x - 0.5) * MAX_TILT_DEG}deg`);
    card.style.setProperty('--spot-x', `${x * 100}%`);
    card.style.setProperty('--spot-y', `${y * 100}%`);
  }

  reset(): void {
    const style = this.el.nativeElement.style;
    ['--tilt-x', '--tilt-y', '--spot-x', '--spot-y'].forEach((name) => style.removeProperty(name));
  }
}
