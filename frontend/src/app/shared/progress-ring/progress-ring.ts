import { Component, input } from '@angular/core';

@Component({
  selector: 'app-progress-ring',
  template: `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <circle class="track" cx="60" cy="60" r="52" />
      @if (percent() > 0) {
        <circle class="fill" cx="60" cy="60" r="52" pathLength="100" [style.stroke-dashoffset]="100 - percent()" />
      }
    </svg>
    <span class="label"><ng-content /></span>
  `,
  styles: `
    :host {
      position: relative;
      display: inline-block;
      flex-shrink: 0;
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    circle {
      fill: none;
      stroke-width: var(--ring-width, 7);
    }

    .track {
      stroke: rgba(244, 239, 230, 0.12);
    }

    .fill {
      stroke: var(--color-gold);
      stroke-linecap: round;
      stroke-dasharray: 100;
      animation: trace 1.4s var(--ease-out) var(--ring-delay, 0.2s) backwards;
    }

    :host(.done) .fill {
      animation:
        trace 1.4s var(--ease-out) var(--ring-delay, 0.2s) backwards,
        glow 2.4s ease-in-out 1.6s 2;
    }

    .label {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @keyframes trace {
      from {
        stroke-dashoffset: 100;
      }
    }

    @keyframes glow {
      50% {
        filter: drop-shadow(0 0 6px rgba(184, 149, 90, 0.9));
      }
    }
  `,
})
export class ProgressRing {
  percent = input.required<number>();
}
