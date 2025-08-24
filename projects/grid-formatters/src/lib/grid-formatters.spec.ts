import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridFormatters } from './grid-formatters';

describe('GridFormatters', () => {
  let component: GridFormatters;
  let fixture: ComponentFixture<GridFormatters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridFormatters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridFormatters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
