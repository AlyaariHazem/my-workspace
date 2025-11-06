import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HiremeShared } from './hireme-shared';

describe('HiremeShared', () => {
  let component: HiremeShared;
  let fixture: ComponentFixture<HiremeShared>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HiremeShared]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HiremeShared);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
