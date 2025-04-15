import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeductionSummaryComponent } from './deduction-summary.component';

describe('DeductionSummaryComponent', () => {
  let component: DeductionSummaryComponent;
  let fixture: ComponentFixture<DeductionSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeductionSummaryComponent]
    });
    fixture = TestBed.createComponent(DeductionSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
