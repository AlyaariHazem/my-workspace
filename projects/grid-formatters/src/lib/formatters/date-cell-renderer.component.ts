// date-only
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { BaseFormatRenderer } from './base/ag-base-format-renderer';
import { FormatKind } from '../ag-format.types';

@Component({
  selector: 'app-date-cell',
  standalone: true,
  template: `{{ display }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateCellRendererComponent extends BaseFormatRenderer {
  protected kind: FormatKind = 'date';
  constructor(cdr: ChangeDetectorRef) { super(cdr); }
}
