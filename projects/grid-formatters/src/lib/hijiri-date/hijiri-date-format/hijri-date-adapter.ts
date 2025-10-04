// hijri-date-adapter.ts
import { Inject, Optional, Injectable } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
import moment from 'moment-hijri';
import type { Moment } from 'moment';

@Injectable()
export class HijriDateAdapter extends DateAdapter<Moment> {

  private readonly MIN_H = 1356;
  private readonly MAX_H = 1500;

  constructor(@Optional() @Inject(MAT_DATE_LOCALE) matDateLocale: string) {
    super();
    this.setLocale(matDateLocale || 'ar');
    // keep Arabic names but force Latin digits
    moment.updateLocale(this.locale || 'ar', { postformat: (s: string) => s });
  }


  override createDate(y: number, m: number, d: number): Moment {
    if (m < 0 || m > 11) throw Error(`Invalid month index ${m}.`);
    const base = moment().startOf('day').iYear(y).iMonth(m).iDate(1);
    if (!base.isValid()) return this.invalid();

    const dim = base.iDaysInMonth();
    const day = Math.min(Math.max(d, 1), dim);
    return base.iDate(day);
  }

 override addCalendarYears(d: Moment, y: number): Moment {
    const day = d.iDate();
    let res = d.clone().iDate(1).add(y, 'iYear');
    const yr = res.iYear();
    if (yr < this.MIN_H) res = res.iYear(this.MIN_H);
    if (yr > this.MAX_H) res = res.iYear(this.MAX_H);
    return res.iDate(Math.min(day, res.iDaysInMonth()));
  }


  override today(): Moment { return moment().startOf('day'); }
  override clone(x: Moment): Moment { return x.clone(); }

  // Material will pass MAT_DATE_FORMATS.parse.dateInput as "fmt"
  override parse(v: any, fmt?: string | string[]): Moment | null {
  if (v == null || v === '') return null;
  if (moment.isMoment(v)) return v.clone();
  const s = String(v).trim().replace(/[-/]+$/, '');        // 👈 strip stray separators
  const m = moment(s, ['iDD/iMM/iYYYY','iD/iM/iYYYY','YYYY-MM-DD','YYYY/MM/DD','DD/MM/YYYY','MM/DD/YYYY'], true);
  return m.isValid() ? m : null;
}


  override deserialize(v: any): Moment | null {
    if (v == null) return null;
    if (moment.isMoment(v)) return v.clone();
    const m = v instanceof Date ? moment(v) : moment(v, moment.ISO_8601, true);
    return m.isValid() ? m : null;
  }

  override format(d: Moment, display: string): string { return d ? d.format(display) : ''; }


override addCalendarMonths(d: Moment, m: number): Moment {
  const day = d.iDate();
  const res = d.clone().iDate(1).add(m, 'iMonth');       // أضف أشهر هجريًا
  const dim = res.iDaysInMonth();
  return res.iDate(Math.min(day, dim));
}

  override addCalendarDays(d: Moment, n: number): Moment { return d.clone().add(n, 'day'); }

  override getYear(d: Moment) { return d.iYear(); }
  override getMonth(d: Moment) { return d.iMonth(); }
  override getDate(d: Moment) { return d.iDate(); }
  override getDayOfWeek(d: Moment) { return d.day(); }

  override getMonthNames(style: 'long'|'short'|'narrow'): string[] {
    const long = ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة',
                  'رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
    if (style !== 'long') return ['محرم','صفر','ربيع ثاني','ربيع أول','جماد ثاني','جماد أول','رجب','شعب','رمضان','شوال','ذو القعدة','ذو الحجة'];
    return long;
  }
  override getDateNames(): string[] { return Array.from({ length: 30 }, (_, i) => String(i + 1)); }
  override getDayOfWeekNames(style: 'long'|'short'|'narrow'): string[] {
    const long = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    if (style === 'short') return ['أح','اث','ثل','أر','خم','جم','سب'];
    if (style === 'narrow') return ['ح','ن','ث','ر','خ','ج','س'];
    return long;
  }
  override getYearName(d: Moment) { return String(d.iYear()); }
  override getFirstDayOfWeek() { return 0; }
  override getNumDaysInMonth(d: Moment) { return d.iDaysInMonth(); }
  override isDateInstance(o: any): o is Moment { return moment.isMoment(o); }
  override isValid(d: Moment) { return !!d && d.isValid(); }
  override invalid(): Moment { return moment.invalid() as Moment; }
  override toIso8601(d: Moment) { return d.clone().format('YYYY-MM-DD'); }
}

export const HIJRI_MAT_FORMATS: MatDateFormats = {
  parse:   { dateInput: 'iDD/iMM/iYYYY' },
  display: {
    dateInput: 'iDD/iMM/iYYYY',
    monthYearLabel: 'iMMMM iYYYY',
    dateA11yLabel: 'iD iMMMM iYYYY',
    monthYearA11yLabel: 'iMMMM iYYYY',
  },
};
