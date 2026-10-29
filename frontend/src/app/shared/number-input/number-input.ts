import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NUMBER_FIELDS, NumberField, NumberFieldConfig } from '../../core/models/number-fields';

@Component({
  selector: 'app-number-input',
  imports: [ReactiveFormsModule, DecimalPipe],
  template: `
    <div class="field">
      <label class="field-label" [for]="field()">{{ config().label }}</label>
      <div class="input-unit">
        <input
          class="input"
          type="number"
          inputmode="decimal"
          [id]="field()"
          [formControl]="control()"
          [step]="config().step ?? 1"
          [min]="config().min"
          [max]="config().max"
          [attr.aria-invalid]="isInvalid()"
          [attr.aria-describedby]="field() + '-hint'"
        />
        <span aria-hidden="true">{{ config().unit }}</span>
      </div>
      <span class="hint" [id]="field() + '-hint'" [class.is-error]="isInvalid()">
        {{ config().min | number }}–{{ config().max | number }} {{ config().unit }}
      </span>
    </div>
  `,
})
export class NumberInput {
  field = input.required<NumberField>();
  control = input.required<FormControl<number | null>>();

  config = computed<NumberFieldConfig>(() => NUMBER_FIELDS[this.field()]);

  isInvalid(): boolean {
    return this.control().invalid && this.control().touched;
  }
}
