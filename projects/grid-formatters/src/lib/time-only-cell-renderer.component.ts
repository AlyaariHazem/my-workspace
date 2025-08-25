// time-only
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { BaseFormatRenderer } from './ag-base-format-renderer';
import { FormatKind } from './ag-format.types';

@Component({
  selector: 'app-time-cell',
  standalone: true,
  template: `{{ display }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeCellRendererComponent extends BaseFormatRenderer {
  protected kind: FormatKind = 'time';
  constructor(cdr: ChangeDetectorRef) { super(cdr); }
}
