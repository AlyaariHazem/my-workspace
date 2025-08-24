// date-only
import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { SettingsService } from './settings/settings.service';
import { BaseFormatRenderer } from './ag-base-format-renderer';
import { FormatKind } from './ag-format.types';

@Component({
  selector: 'app-date-cell',
  standalone: true,
  template: `{{ display }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateCellRendererComponent extends BaseFormatRenderer {
  protected kind: FormatKind = 'date';
  constructor(settings: SettingsService, cdr: ChangeDetectorRef) {
    super(settings, cdr);
  }
}

