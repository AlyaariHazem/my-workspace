import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  Directive,
} from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { formatDate } from '@angular/common';
import { Subscription, combineLatest } from 'rxjs';
import { SettingsService } from './settings/settings.service';
import { BaseFormatParams, FormatKind } from './ag-format.types';

@Directive()
export abstract class BaseFormatRenderer<TData = any>
  implements ICellRendererAngularComp, OnDestroy
{
  display = '';
  protected params!: BaseFormatParams<TData>;

  /** Combined format (used by default base render) */
  protected fmt = '';

  /** Kept separately for subclasses that need them (e.g., date-or-datetime) */
  protected dateFmt: string | undefined;
  protected timeFmt: string | undefined;

  protected tz: string | null = null;
  protected abstract kind: FormatKind;
  private sub = new Subscription();

  constructor(
    protected settings: SettingsService,
    protected cdr: ChangeDetectorRef
  ) {}

  agInit(params: BaseFormatParams<TData>): void {
    this.params = params;
    this.resolveFmtAndTz();

    // Subscribe only if NOT overridden via fmt/date*/time*
    const hasFmtOverride = !!(
      params.fmt ??
      params.dateFormat ??
      params.dateFmt ??
      params.timeFormat ??
      params.timeFmt
    );

    if (!hasFmtOverride) {
      if (this.kind === 'datetime') {
        this.sub.add(
          combineLatest([
            this.settings.dateFormat$,
            this.settings.timeFormat$,
            this.settings.timezone$,
          ]).subscribe(([df, tf, tz]) => {
            this.dateFmt = df;
            this.timeFmt = tf;
            this.fmt = `${df} ${tf}`.trim();
            this.tz = tz && tz !== 'local' ? tz : null;
            this.render(this.params.value);
          })
        );
      } else if (this.kind === 'date') {
        this.sub.add(
          this.settings.dateFormat$.subscribe((df) => {
            this.dateFmt = df;
            this.fmt = df;
            this.render(this.params.value);
          })
        );
        this.sub.add(
          this.settings.timezone$.subscribe((tz) => {
            this.tz = tz && tz !== 'local' ? tz : null;
            this.render(this.params.value);
          })
        );
      } else {
        // 'time'
        this.sub.add(
          this.settings.timeFormat$.subscribe((tf) => {
            this.timeFmt = tf;
            this.fmt = tf;
            this.render(this.params.value);
          })
        );
        this.sub.add(
          this.settings.timezone$.subscribe((tz) => {
            this.tz = tz && tz !== 'local' ? tz : null;
            this.render(this.params.value);
          })
        );
      }
    }

    this.render(params.value);
  }

  refresh(params: BaseFormatParams<TData>): boolean {
    this.params = params;
    this.resolveFmtAndTz();
    this.render(params.value);
    return true;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private resolveFmtAndTz(): void {
    const p = this.params;
    const tzRaw = p.timezone ?? p.tz ?? null;
    this.tz = !tzRaw || tzRaw === 'local' ? null : tzRaw;

    if (p.fmt) {
      this.fmt = p.fmt;
      // try to derive date/time parts for subclasses that need them:
      const [dGuess, tGuess] = this.splitCombinedFmt(p.fmt);
      this.dateFmt = this.dateFmt ?? dGuess;
      this.timeFmt = this.timeFmt ?? tGuess;
      return;
    }

    if (this.kind === 'date') {
      this.dateFmt = p.dateFormat ?? p.dateFmt ?? this.settings.getDateFormat();
      this.fmt = this.dateFmt;
      return;
    }

    if (this.kind === 'time') {
      this.timeFmt =
        p.timeFormat ?? p.timeFmt ?? this.settings.getDateTimeFormat();
      this.fmt = this.timeFmt;
      return;
    }

    // datetime
    this.dateFmt = p.dateFormat ?? p.dateFmt ?? this.settings.getDateFormat();
    this.timeFmt =
      p.timeFormat ?? p.timeFmt ?? this.settings.getDateTimeFormat();
    this.fmt = `${this.dateFmt} ${this.timeFmt}`.trim();
  }

  /** Default render: use the single combined fmt */
  protected render(value: any): void {
    if (value == null || value === '') {
      this.display = '';
      this.cdr.markForCheck();
      return;
    }
    const d = this.toDate(value);
    if (d) {
      this.display = this.tz
        ? formatDate(d, this.fmt, 'en-US', this.tz) ?? ''
        : formatDate(d, this.fmt, 'en-US') ?? '';
    } else {
      const s = String(value);
      this.display = s.includes('T') ? s.slice(0, 10) : s.split(' ')[0];
    }
    this.cdr.markForCheck();
  }

  private toDate(value: any): Date | null {
    if (value instanceof Date) return value;
    if (typeof value === 'number')
      return new Date(value < 1e12 ? value * 1000 : value);
    const t = new Date(String(value).trim());
    return isNaN(t.getTime()) ? null : t;
  }

  /** crude but effective splitter: left of first [Hh] is date, from it to end is time */
  private splitCombinedFmt(fmt: string): [string, string] {
    const idx = fmt.search(/[Hh]/);
    if (idx <= 0) return [fmt.trim(), 'HH:mm']; // no time tokens found → assume date only
    const d = fmt.slice(0, idx).trim();
    const t = fmt.slice(idx).trim();
    return [d || 'yyyy-MM-dd', t || 'HH:mm'];
  }
}
