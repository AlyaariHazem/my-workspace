import { Injectable } from '@angular/core';

export interface CurrencyOption {
  code: string | null;   // e.g. 'USD' … or null for "no currency"
  locale: string | null; // e.g. 'en-US' … or null to use app/browser default
  label: string;         // UI label
}

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly CURR_CODE_KEY   = 'selectedCurrencyCode';
  private readonly CURR_LOCALE_KEY = 'selectedCurrencyLocale';

  // Special "no currency" option
  private readonly NONE: CurrencyOption = { code: null, locale: null, label: '— None —' };

  // Available currencies (put NONE first so it’s the default)
  readonly currencies: CurrencyOption[] = [
    this.NONE,
    { code: 'USD', locale: 'en-US', label: 'USD — US Dollar' },
    { code: 'EUR', locale: 'de-DE', label: 'EUR — Euro' },
    { code: 'GBP', locale: 'en-GB', label: 'GBP — British Pound' },
    { code: 'SAR', locale: 'ar-SA', label: 'SAR — Saudi Riyal' },
  ];

  private _currency: CurrencyOption = this.readCurrencyFromLS();

  // ---- Public API ----
  getCurrency(): CurrencyOption { return this._currency; }
  getCurrencyCode(): string | null { return this._currency.code; }
  getCurrencyLocale(): string | null { return this._currency.locale; }
  isNone(): boolean { return this._currency.code == null; }

  /** Accepts a CurrencyOption, a code string, or null to clear. */
  setCurrency(opt: CurrencyOption | string | null): void {
    let chosen: CurrencyOption | undefined;

    if (opt === null) {
      this._currency = this.NONE;
      this.removeFromLS();
      return;
    }

    if (typeof opt === 'string') {
      chosen = this.currencies.find(c => c.code === opt);
    } else if (opt && typeof opt === 'object') {
      chosen = this.currencies.find(c => c.code === opt.code);
    }

    this._currency = chosen ?? this.NONE;

    // Persist only when a real currency is selected
    try {
      if (this._currency.code) {
        localStorage.setItem(this.CURR_CODE_KEY, this._currency.code);
        localStorage.setItem(this.CURR_LOCALE_KEY, this._currency.locale ?? '');
      } else {
        this.removeFromLS();
      }
    } catch { /* ignore storage errors */ }
  }

  // ---- Internal ----
  private readCurrencyFromLS(): CurrencyOption {
    try {
      const code   = localStorage.getItem(this.CURR_CODE_KEY);
      const locale = localStorage.getItem(this.CURR_LOCALE_KEY);
      if (!code) return this.NONE;

      // If stored code exists, return the configured option or reconstruct a label
      return (
        this.currencies.find(c => c.code === code) ??
        { code, locale: locale || 'en-US', label: code }
      );
    } catch {
      return this.NONE;
    }
  }

  private removeFromLS() {
    try {
      localStorage.removeItem(this.CURR_CODE_KEY);
      localStorage.removeItem(this.CURR_LOCALE_KEY);
    } catch { /* ignore */ }
  }
}
