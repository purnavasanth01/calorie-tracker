import { Component } from '@angular/core';
import { Logo } from '../../shared/logo/logo';
import { InView } from '../../shared/motion/in-view';
import { Ecg } from '../../shared/ecg/ecg';

@Component({
  selector: 'app-how-it-works',
  imports: [Logo, InView, Ecg],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.scss',
})
export class HowItWorks {
  readonly steps = [
    {
      numeral: 'I',
      title: 'Log a session',
      text: 'Enter duration, heart rate and body temperature. Your saved profile fills in the rest.',
    },
    {
      numeral: 'II',
      title: 'The model estimates',
      text: 'An XGBoost model trained on 15,000 workouts predicts the calories you burned.',
    },
    {
      numeral: 'III',
      title: 'Track your week',
      text: 'See each day against your weekly goal, with every session kept in your history.',
    },
  ];
}
