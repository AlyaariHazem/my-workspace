import { CommonModule } from '@angular/common';
import {
  Component, Input, forwardRef, ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, AbstractControl, ValidationErrors
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import moment, { Moment } from 'moment-hijri';

@Component({
  selector: 'lib-hijri-date-field',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,],
  templateUrl: './hijri-date-field.component.html',
  styleUrls: ['./hijri-date-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HijriDateFieldComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => HijriDateFieldComponent), multi: true },
  ]
})
export class HijriDateFieldComponent implements ControlValueAccessor {
  constructor(private cdr: ChangeDetectorRef) {}
  /** Placeholder displayed in the input */
  @Input() placeholder = 'iDD/iMM/iYYYY';

  /** Min/Max and startAt accept Moment or string (Hijri iYYYY-iMM-iDD, or ISO) */
  @Input() min: Moment | string | null = null;
  @Input() max: Moment | string | null = null;
  @Input() startAt: Moment | string | null = null;

  /** Marks the control as required for error display only (host form should still add Validators.required if needed) */
  @Input() required = false;

  value: Moment | null = null;
  disabled = false;
   touched = false;

  // — make matInput go to error state when required && touched && empty
  matcher: ErrorStateMatcher = {
    isErrorState: () => !!this.required && this.touched && !this.value
  };

  // Datepicker state helpers
  get minMoment(): Moment | null { return this.coerceMoment(this.min); }
  get maxMoment(): Moment | null { return this.coerceMoment(this.max); }
  get startAtMoment(): Moment | null {
    return this.coerceMoment(this.startAt) || this.minMoment || null;
  }
  
writeValue(v: any): void {
    this.value = this.coerceMoment(v);
    this.cdr.markForCheck();
  }

  onInputChanged(v: Moment | null) {
    this.value = v;
    this.onChange(this.value);
    this.cdr.markForCheck();
  }

  markTouched() {
    this.touched = true;
    this.onTouched();
    this.cdr.markForCheck();
  }

  private onChange: (v: Moment | null) => void = () => {};
  private onTouched: () => void = () => {};

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  validate(_: AbstractControl): ValidationErrors | null {
    if (!this.value) return this.required ? { required: true } : null;
    if (this.minMoment && this.value.isBefore(this.minMoment, 'day')) return { min: true };
    if (this.maxMoment && this.value.isAfter(this.maxMoment, 'day')) return { max: true };
    return null;
  }

  private coerceMoment(v: any): Moment | null {
    if (!v) return null;
    if (moment.isMoment(v)) return v.clone();

    const s = String(v).trim().replace(/[-/]+$/, '');
    // Try Hijri first
    let m = moment(s, ['iYYYY-iMM-iDD','iDD/iMM/iYYYY','iD/iM/iYYYY'], true);
    if (m.isValid()) return m.startOf('day');

    // Try ISO/Gregorian
    m = moment(s, moment.ISO_8601, true);
    if (!m.isValid()) m = moment(s, ['YYYY-MM-DD','YYYY/MM/DD','DD/MM/YYYY','MM/DD/YYYY'], true);
    return m.isValid() ? m.startOf('day') : null;
  }
}
