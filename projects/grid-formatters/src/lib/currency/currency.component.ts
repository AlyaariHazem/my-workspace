import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyService, CurrencyOption } from './currency.service';

const CURRENCY_EVT = 'currency-format-changed';

@Component({
  selector: 'app-currency',
  standalone: false,
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss']
})
export class CurrencyComponent implements OnInit {
  // Currency state only
  currencyOptions: CurrencyOption[] = [];
  selectedCurrency!: CurrencyOption;
  /** bind with [innerHTML] in the template */
  currencyPreview = '';
  applyCurrencyDisabled = true;

  constructor(
    public settings: CurrencyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currencyOptions   = this.settings.currencies;
    this.selectedCurrency  = this.settings.getCurrency(); // { code, locale, label }
    this.updateCurrencyPreview();
  }

  onCurrencyChange(): void {
    if (!this.selectedCurrency) return;
    this.settings.setCurrency(this.selectedCurrency); // persist to LS
    this.updateCurrencyPreview();
    this.applyCurrencyDisabled = false;
  }

  onApplyCurrency(): void {
    // ensure persisted
    this.settings.setCurrency(this.selectedCurrency);

    // notify same-tab listeners (inputs/renderers)
    window.dispatchEvent(new CustomEvent(CURRENCY_EVT, {
      detail: { code: this.selectedCurrency.code, locale: this.selectedCurrency.locale }
    }));

    // optional: force re-render like before
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([currentUrl]));

    this.applyCurrencyDisabled = true;
    this.updateCurrencyPreview();
  }

  private updateCurrencyPreview(): void {
  const cur: CurrencyOption =
    this.selectedCurrency ?? { code: 'SAR', locale: 'ar-SA', label: '' };

  // Intl.NumberFormat accepts string | string[] | undefined (NOT null)
  const loc: string | undefined = cur.locale ?? undefined;

  // No currency selected -> plain number
  if (!cur.code) {
    this.currencyPreview = new Intl.NumberFormat(loc, {
      style: 'decimal',
      minimumFractionDigits: 2,
    }).format(1234.56);
    return;
  }

  // SAR: render special glyph + decimal number
  if (cur.code === 'SAR') {
    const num = new Intl.NumberFormat(loc, {
      style: 'decimal',
      minimumFractionDigits: 2,
    }).format(1234.56);

    this.currencyPreview =
      `<span class="sar-cell"><span class="icon-saudi_riyal"></span>&nbsp;${num}</span>`;
    return;
  }

  // Any other currency
  this.currencyPreview = new Intl.NumberFormat(loc, {
    style: 'currency',
    currency: cur.code, // cur.code is string here
  }).format(1234.56);
}

}
