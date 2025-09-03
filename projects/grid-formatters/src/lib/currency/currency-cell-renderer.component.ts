// currency-cell-renderer.component.ts
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener
} from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

const CURR_CODE_KEY   = 'selectedCurrencyCode';
const CURR_LOCALE_KEY = 'selectedCurrencyLocale';
const DEFAULT_CODE: string | null = 'SAR';
const DEFAULT_LOCALE = 'ar-SA';
const CURRENCY_EVT   = 'currency-format-changed';

// ⬇️ Use English/Latin digits whenever code is null
const DECIMAL_LOCALE_WHEN_NULL = 'en-US';

@Component({
  selector: 'app-currency-cell',
  standalone: true,
  template: `<span [innerHTML]="html"></span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyCellRendererComponent implements ICellRendererAngularComp {
  private params: any;
  private value: any;

  html = '';

  private code: string | null = DEFAULT_CODE;      // may be null
  private locale: string | undefined = DEFAULT_LOCALE; // never pass null to Intl
  private minFrac = 0;
  private maxFrac = 2;
  private useGrouping = true;

  constructor(private cdr: ChangeDetectorRef) {}

  agInit(params: any): void {
    this.params = params;
    this.value  = params.value;
    this.resolveOptions();
    this.render();
  }

  refresh(params: any): boolean {
    this.params = params;
    this.value  = params.value;
    this.resolveOptions();
    this.render();
    return true;
  }

  @HostListener('window:storage', ['$event'])
  onStorageChanged(ev: StorageEvent) {
    if (ev.key === CURR_CODE_KEY || ev.key === CURR_LOCALE_KEY) {
      this.resolveOptions();
      this.render();
    }
  }

  @HostListener(`window:${CURRENCY_EVT}`)
  onCurrencyEvent() {
    this.resolveOptions();
    this.render();
  }

  // -------------------------------

  private render() {
    if (this.value == null || this.value === '') {
      this.html = '';
      return this.invalidate();
    }

    const n = typeof this.value === 'number'
      ? this.value
      : Number(String(this.value).replace(/[^\d.-]/g, ''));

    if (!Number.isFinite(n)) {
      this.html = String(this.value);
      return this.invalidate();
    }

    const loc: string | undefined = this.locale ?? undefined;

    // ❗ No currency selected → ALWAYS show English digits (en-US)
    if (!this.code) {
      this.html = new Intl.NumberFormat(DECIMAL_LOCALE_WHEN_NULL, {
        style: 'decimal',
        useGrouping: this.useGrouping,
        minimumFractionDigits: this.minFrac,
        maximumFractionDigits: this.maxFrac,
      }).format(n);
      return this.invalidate();
    }

    // SAR → show Saudi Riyal glyph from the font (not "ر س")
    if (this.code === 'SAR') {
      const num = new Intl.NumberFormat(loc, {
        style: 'decimal',
        useGrouping: this.useGrouping,
        minimumFractionDigits: this.minFrac,
        maximumFractionDigits: this.maxFrac,
      }).format(n);

      this.html =
        `<span class="sar-cell"><span class="icon-saudi_riyal" aria-hidden="true"></span>&nbsp;${num}</span>`;
      return this.invalidate();
    }

    // Other currencies → normal currency formatting in chosen locale
    this.html = new Intl.NumberFormat(loc, {
      style: 'currency',
      currency: this.code,
      useGrouping: this.useGrouping,
      minimumFractionDigits: this.minFrac,
      maximumFractionDigits: this.maxFrac,
    }).format(n);

    this.invalidate();
  }

  private resolveOptions() {
    const p = (this.params?.colDef?.cellRendererParams) || {};
    const row = this.params?.data ?? {};

    let codeMaybe: string | null | undefined = p.currencyCode;
    if (codeMaybe === undefined && p.currencyField) codeMaybe = row[p.currencyField];
    if (codeMaybe === undefined) codeMaybe = this.readCodeFromLS(); // string | null
    this.code = (codeMaybe === undefined) ? DEFAULT_CODE : codeMaybe; // keep null if explicitly set

    let localeMaybe: string | null | undefined = p.locale;
    if (localeMaybe === undefined && p.localeField) localeMaybe = row[p.localeField];
    if (localeMaybe === undefined) localeMaybe = this.readLocaleFromLS();
    this.locale = localeMaybe ?? DEFAULT_LOCALE; // never null to Intl

    this.minFrac     = this.pickNum(p.minFractionDigits, 0);
    this.maxFrac     = this.pickNum(p.maxFractionDigits, 2);
    this.useGrouping = p.useGrouping !== false;
  }

  private readCodeFromLS(): string | null {
    try {
      const v = window.localStorage?.getItem(CURR_CODE_KEY);
      return v === null || v === '' ? null : v;
    } catch {
      return null;
    }
  }

  private readLocaleFromLS(): string | undefined {
    try {
      const v = window.localStorage?.getItem(CURR_LOCALE_KEY);
      return v === null || v === '' ? undefined : v;
    } catch {
      return undefined;
    }
  }

  private pickNum(v: any, fb: number) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fb;
  }

  private invalidate() {
    try { this.cdr.markForCheck(); this.cdr.detectChanges(); } catch {}
  }
}
