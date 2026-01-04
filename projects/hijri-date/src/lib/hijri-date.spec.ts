import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HijriDate } from './hijri-date';

describe('HijriDate', () => {
  let component: HijriDate;
  let fixture: ComponentFixture<HijriDate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HijriDate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HijriDate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
