import { DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';

@Directive({ selector: '[appInView]' })
export class InView {
  appInView = output<void>();

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const reveal = () => {
      el.classList.add('in-view');
      this.appInView.emit();
    };

    if (!('IntersectionObserver' in window)) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }
}
