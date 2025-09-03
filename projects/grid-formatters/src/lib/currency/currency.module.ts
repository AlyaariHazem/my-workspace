// projects/grid-formatters/src/lib/settings/settings.module.ts
import { NgModule } from '@angular/core';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CommonModule } from '@angular/common';
import { ListboxModule } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CurrencyComponent } from './currency.component';


@NgModule({
  declarations: [CurrencyComponent],
  imports: [ OverlayPanelModule, FormsModule, ListboxModule, CommonModule,ButtonModule],
  exports: [CurrencyComponent]
})
export class CurrencyModule {}
