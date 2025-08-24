import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { OverlayPanelModule } from 'primeng/overlaypanel';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';
import { SettingsService } from './settings.service';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  imports: [CommonModule, FormsModule, OverlayPanelModule, ListboxModule, ButtonModule],
  styleUrls: ['./settings.component.scss'],
  providers: [DatePipe, SettingsService]
})
export class SettingsComponent implements OnInit, OnDestroy {
  dateFormats!: string[];
  timeFormats!: string[];

  selectedDateFormat!: string;
  selectedTimeFormat!: string;

  previewDateTime!: string;
  now = new Date();
  private timer: any;
  currentDateFormatted = '';
  currentDateTimeFormatted = '';
  applyButtonDisabled = true;
  constructor(
    public settings: SettingsService,
    private datePipe: DatePipe,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.dateFormats = this.settings.dateFormats;
    this.timeFormats = this.settings.dateTimeFormats;

    this.selectedDateFormat = this.settings.getDateFormat();
    this.selectedTimeFormat = this.settings.getDateTimeFormat();

    this.updatePreview();
    this.startTimer();
  }
 refresh() {
    const currentUrl = this.router.url;
    // Navigate away and back to force reload
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }
  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private startTimer() {
    this.timer = setInterval(() => {
      this.now = new Date();
      this.updateCurrentFormats();
    }, 1000);
  }

  private updateCurrentFormats() {
    try {
      this.currentDateFormatted = this.datePipe.transform(this.now, this.selectedDateFormat) || '';
      this.currentDateTimeFormatted = this.datePipe.transform(this.now, this.selectedTimeFormat) || '';
    } catch (error) {
      console.warn('Error formatting date:', error);
      this.currentDateFormatted = this.now.toLocaleDateString();
      this.currentDateTimeFormatted = this.now.toLocaleString();
    }
  }

  onDateFormatChange() {
  // ONLY update the *local selection* and preview
  this.updatePreview();
  this.updateCurrentFormats();
  this.applyButtonDisabled = this.selectedDateFormat === this.settings.getDateFormat()
    && this.selectedTimeFormat === this.settings.getDateTimeFormat();
}

onTimeFormatChange() {
  // ONLY update the *local selection* and preview
  this.updatePreview();
  this.updateCurrentFormats();
  this.applyButtonDisabled = this.selectedDateFormat === this.settings.getDateFormat()
    && this.selectedTimeFormat === this.settings.getDateTimeFormat();
}

// 🔘 Apply: now persist + emit (BehaviorSubject.next)
apply(panel?: { hide: () => void }) {
  const changedDate = this.selectedDateFormat !== this.settings.getDateFormat();
  const changedTime = this.selectedTimeFormat !== this.settings.getDateTimeFormat();

  if (changedDate) this.settings.setDateFormat(this.selectedDateFormat);
  if (changedTime) this.settings.setDateTimeFormat(this.selectedTimeFormat);

  this.applyButtonDisabled = true;

  // optional: close the overlay
  panel?.hide();
  this.cdr.markForCheck();
}

  private updatePreview() {
    try {
      this.previewDateTime = this.formatDateTime(this.now);
    } catch (error) {
      console.warn('Error updating preview:', error);
      this.previewDateTime = this.now.toLocaleString();
    }
  }

  private formatDateTime(date: Date): string {
    try {
      const datePart = this.datePipe.transform(date, this.selectedDateFormat) || '';
      const timePart = this.datePipe.transform(date, this.selectedTimeFormat) || '';
      return `${datePart} ${timePart}`.trim();
    } catch (error) {
      console.warn('Error in formatDateTime:', error);
      return date.toLocaleString();
    }
  }
}
