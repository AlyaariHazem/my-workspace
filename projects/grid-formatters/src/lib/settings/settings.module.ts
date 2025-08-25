// projects/grid-formatters/src/lib/settings/settings.module.ts
import { NgModule } from '@angular/core';
import { SettingsComponent } from './settings.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CommonModule } from '@angular/common';
import { ListboxModule } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';


@NgModule({
  declarations: [SettingsComponent],
  imports: [ OverlayPanelModule, FormsModule, ListboxModule, CommonModule,ButtonModule], 
  exports: [SettingsComponent]
})
export class SettingsModule {}
