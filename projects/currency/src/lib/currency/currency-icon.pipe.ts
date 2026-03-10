import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CurrencyService } from './currency.service';

const CURR_CODE_KEY = 'selectedCurrencyCode';
const CURR_LOCALE_KEY = 'selectedCurrencyLocale';
const DECIMAL_LOCALE_WHEN_NULL = 'en-US';

export interface CurrencyIconPipeOptions {
  currencyCode?: string | null;
  locale?: string | null;
  minFractionDigits?: number;
  maxFractionDigits?: number;
  useGrouping?: boolean;
}

@Pipe({
  name: 'currencyIcon',
  standalone: true,
  pure: false // Not pure because it reads from localStorage/CurrencyService
})
export class CurrencyIconPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);
  private currencyService = inject(CurrencyService);

  transform(
    value: number | string | null | undefined,
    options?: CurrencyIconPipeOptions
  ): SafeHtml {
    if (value == null || value === '') {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }

    // Convert to number
    const n = typeof value === 'number'
      ? value
      : Number(String(value).replace(/[^\d.-]/g, ''));

    if (!Number.isFinite(n)) {
      return this.sanitizer.bypassSecurityTrustHtml(String(value));
    }

    // Resolve options
    const opts = this.resolveOptions(options);
    const loc: string | undefined = opts.locale ?? undefined;

    // No currency selected → ALWAYS show English digits (en-US)
    if (!opts.currencyCode) {
      const formatted = new Intl.NumberFormat(DECIMAL_LOCALE_WHEN_NULL, {
        style: 'decimal',
        useGrouping: opts.useGrouping,
        minimumFractionDigits: opts.minFractionDigits,
        maximumFractionDigits: opts.maxFractionDigits,
      }).format(n);
      return this.sanitizer.bypassSecurityTrustHtml(formatted);
    }

    // SAR → show Saudi Riyal glyph from the font (not "ر س")
    if (opts.currencyCode === 'SAR') {
      const num = new Intl.NumberFormat(loc, {
        style: 'decimal',
        useGrouping: opts.useGrouping,
        minimumFractionDigits: opts.minFractionDigits,
        maximumFractionDigits: opts.maxFractionDigits,
      }).format(n);

      const html = `<span class="sar-cell"><span class="icon-saudi_riyal" aria-hidden="true"></span>&nbsp;${num}</span>`;
      return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    // Other currencies → normal currency formatting in chosen locale
    const formatted = new Intl.NumberFormat(loc, {
      style: 'currency',
      currency: opts.currencyCode,
      useGrouping: opts.useGrouping,
      minimumFractionDigits: opts.minFractionDigits,
      maximumFractionDigits: opts.maxFractionDigits,
    }).format(n);

    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }

  private resolveOptions(options?: CurrencyIconPipeOptions): Required<CurrencyIconPipeOptions> {
    const p = options || {};

    // Get currency code - use CurrencyService if not provided
    let codeMaybe: string | null | undefined = p.currencyCode;
    if (codeMaybe === undefined) {
      // Use CurrencyService to get the current currency from localStorage
      codeMaybe = this.currencyService.getCurrencyCode();
    }

    // Get locale - use CurrencyService if not provided
    let localeMaybe: string | null | undefined = p.locale;
    if (localeMaybe === undefined) {
      // Use CurrencyService to get the current locale from localStorage
      localeMaybe = this.currencyService.getCurrencyLocale();
    }

    return {
      currencyCode: codeMaybe ?? null,
      locale: localeMaybe ?? null,
      minFractionDigits: p.minFractionDigits ?? 0,
      maxFractionDigits: p.maxFractionDigits ?? 2,
      useGrouping: p.useGrouping !== false,
    };
  }
}
