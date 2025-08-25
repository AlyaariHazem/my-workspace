// date+time
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { BaseFormatRenderer } from './ag-base-format-renderer';
import { FormatKind } from './ag-format.types';

@Component({
  selector: 'app-datetime-cell',
  standalone: true,
  template: `{{ display }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateTimeCellRendererComponent extends BaseFormatRenderer {
  protected kind: FormatKind = 'datetime';
  constructor(cdr: ChangeDetectorRef) { super(cdr); }
}
