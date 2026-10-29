import { Directive, ElementRef, inject } from '@angular/core';
import { prefersReducedMotion } from './reduced-motion';

@Directive({
  selector: '[appParallax]',
  host: {
    '(pointermove)': 'follow($event)',
    '(pointerleave)': 'reset()',
  },
})
export class Parallax {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);

  follow(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' || prefersReducedMotion()) return;

    const box = this.el.nativeElement.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * 2 - 1;
    const y = ((event.clientY - box.top) / box.height) * 2 - 1;
    this.el.nativeElement.style.setProperty('--px', x.toFixed(3));
    this.el.nativeElement.style.setProperty('--py', y.toFixed(3));
  }

  reset(): void {
    this.el.nativeElement.style.removeProperty('--px');
    this.el.nativeElement.style.removeProperty('--py');
  }
}
