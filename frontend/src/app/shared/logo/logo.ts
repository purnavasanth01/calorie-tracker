import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  host: { '[class.draw]': 'draw()', '[class.pulse]': 'pulse()' },
  template: `
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle class="logo-ring" cx="16" cy="16" r="15" pathLength="1" />
      <path
        class="logo-flame"
        pathLength="1"
        d="M16 6.5c.9 4.2 6 6.6 6 12.4a6 6 0 0 1-12 0c0-2.7 1.3-4.4 2.9-5.7.3 2 1.2 3.2 2.4 3.7-.6-3.7-.3-7.5.7-10.4z"
      />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
    }

    svg {
      width: 100%;
      height: 100%;
      overflow: visible;
      fill: none;
      stroke: var(--color-gold);
      stroke-width: 1.4;
      stroke-linejoin: round;
    }

    :host(.draw) .logo-ring,
    :host(.draw) .logo-flame {
      stroke-dasharray: 1;
      animation: trace 1.2s cubic-bezier(0.6, 0, 0.2, 1) backwards;
    }

    :host(.draw) .logo-ring {
      transform: rotate(-90deg);
      transform-origin: center;
    }

    :host(.draw) .logo-flame {
      animation-delay: 0.45s;
    }

    :host(.pulse) .logo-flame {
      transform-origin: 50% 85%;
      animation: flicker 1.6s ease-in-out infinite;
    }

    :host(.draw.pulse) .logo-flame {
      animation:
        trace 1.2s cubic-bezier(0.6, 0, 0.2, 1) 0.45s backwards,
        flicker 1.6s ease-in-out 1.6s infinite;
    }

    @keyframes trace {
      from {
        stroke-dashoffset: 1;
      }
      to {
        stroke-dashoffset: 0;
      }
    }

    @keyframes flicker {
      50% {
        transform: scale(1.08, 1.14);
        filter: drop-shadow(0 0 3px rgba(184, 149, 90, 0.8));
      }
    }
  `,
})
export class Logo {
  draw = input(false);
  pulse = input(false);
}
