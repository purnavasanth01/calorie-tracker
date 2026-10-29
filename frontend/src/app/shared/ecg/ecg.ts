import { Component } from '@angular/core';

@Component({
  selector: 'app-ecg',
  template: `
    <svg viewBox="0 0 240 48" aria-hidden="true">
      <path class="base" [attr.d]="path" />
      <path class="pulse" pathLength="1" [attr.d]="path" />
    </svg>
  `,
  styles: `
    :host {
      display: block;
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }

    path {
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .base {
      stroke: var(--ecg-base, rgba(244, 239, 230, 0.12));
    }

    .pulse {
      stroke: var(--ecg-color, var(--color-gold));
      stroke-dasharray: 0.28 0.72;
      animation: pulse 1.8s linear infinite;
    }

    @keyframes pulse {
      from {
        stroke-dashoffset: 1;
      }
      to {
        stroke-dashoffset: 0;
      }
    }
  `,
})
export class Ecg {
  readonly path = 'M0 26 H80 l8 -12 l10 26 l10 -32 l8 20 l6 -2 H240';
}
