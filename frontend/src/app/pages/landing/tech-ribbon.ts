import { Component } from '@angular/core';

@Component({
  selector: 'app-tech-ribbon',
  templateUrl: './tech-ribbon.html',
  styleUrl: './tech-ribbon.scss',
})
export class TechRibbon {
  readonly techStack = ['Angular', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Python', 'XGBoost', 'Docker', 'Render'];
}
