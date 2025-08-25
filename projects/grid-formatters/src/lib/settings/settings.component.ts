import { DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from './settings.service';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
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
    private router: Router
  ) {}

  ngOnInit() {
    this.dateFormats = this.settings.dateFormats;
    this.timeFormats = this.settings.dateTimeFormats;

    this.selectedDateFormat = this.settings.getDateFormat();
    this.selectedTimeFormat = this.settings.getDateTimeFormat();

    this.updatePreview();
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private startTimer() {
    this.timer = setInterval(() => {
      this.now = new Date();
      this.updateCurrentFormats();
    }, 1000);
  }

  private updateCurrentFormats() {
    try {
      this.currentDateFormatted =
        this.datePipe.transform(this.now, this.selectedDateFormat) || '';
      this.currentDateTimeFormatted =
        this.datePipe.transform(this.now, this.selectedTimeFormat) || '';
    } catch {
      this.currentDateFormatted = this.now.toLocaleDateString();
      this.currentDateTimeFormatted = this.now.toLocaleString();
    }
  }

  onDateFormatChange() {
    if (!this.selectedDateFormat) return;
    // Persist (to localStorage) but wait for Apply to notify the app
    this.settings.setDateFormat(this.selectedDateFormat);
    this.updatePreview();
    this.updateCurrentFormats();
    this.applyButtonDisabled = false;
  }

  onTimeFormatChange() {
    if (!this.selectedTimeFormat) return;
    // Persist (to localStorage) but wait for Apply to notify the app
    this.settings.setDateTimeFormat(this.selectedTimeFormat);
    this.updatePreview();
    this.updateCurrentFormats();
    this.applyButtonDisabled = false;
  }

  /** Apply: broadcast to same tab so all BaseFormatRenderer instances re-read LS */
  onApply() {
  // Make sure LS has the final value
  this.settings.setDateFormat(this.selectedDateFormat);
  this.settings.setDateTimeFormat(this.selectedTimeFormat);

  // 🔔 Tell ALL renderers in this tab to re-read localStorage and re-render
  window.dispatchEvent(new CustomEvent('dt-format-changed', {
    detail: {
      dateFormat: this.selectedDateFormat,
      timeFormat: this.selectedTimeFormat
    }
  }));
   const currentUrl = this.router.url;
    // Navigate away and back to force reload
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });

  this.applyButtonDisabled = true;
  this.updatePreview();
  this.updateCurrentFormats();
}


  private updatePreview() {
    try {
      this.previewDateTime = this.formatDateTime(this.now);
    } catch {
      this.previewDateTime = this.now.toLocaleString();
    }
  }

  private formatDateTime(date: Date): string {
    try {
      const datePart = this.datePipe.transform(date, this.selectedDateFormat) || '';
      const timePart = this.datePipe.transform(date, this.selectedTimeFormat) || '';
      return `${datePart} ${timePart}`.trim();
    } catch {
      return date.toLocaleString();
    }
  }
}
