import { Component } from '@angular/core';
import { CountUp } from '../../shared/motion/count-up';
import { Parallax } from '../../shared/motion/parallax';
import { Ecg } from '../../shared/ecg/ecg';
import { ProgressRing } from '../../shared/progress-ring/progress-ring';

@Component({
  selector: 'app-hero-visual',
  imports: [CountUp, Parallax, Ecg, ProgressRing],
  templateUrl: './hero-visual.html',
  styleUrl: './hero-visual.scss',
})
export class HeroVisual {}
