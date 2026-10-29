import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Gender } from '../../core/models/prediction.model';

@Component({
  selector: 'app-gender-toggle',
  imports: [ReactiveFormsModule],
  template: `
    <div class="field">
      <span class="field-label" id="gender-label">Gender</span>
      <div class="segmented" role="radiogroup" aria-labelledby="gender-label">
        <label><input class="sr-only" type="radio" name="gender" [formControl]="control()" value="male" /><span>Male</span></label>
        <label><input class="sr-only" type="radio" name="gender" [formControl]="control()" value="female" /><span>Female</span></label>
      </div>
    </div>
  `,
})
export class GenderToggle {
  control = input.required<FormControl<Gender>>();
}
