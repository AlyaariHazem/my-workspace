// projects/grid-formatters/src/lib/settings/settings.module.ts
import { NgModule } from '@angular/core';
import { SettingsComponent } from './settings.component';

@NgModule({
  imports: [SettingsComponent],   // import standalone
  exports: [SettingsComponent]
})
export class SettingsModule {}
