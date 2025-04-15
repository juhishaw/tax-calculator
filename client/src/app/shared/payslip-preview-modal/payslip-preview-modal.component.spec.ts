import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayslipPreviewModalComponent } from './payslip-preview-modal.component';

describe('PayslipPreviewModalComponent', () => {
  let component: PayslipPreviewModalComponent;
  let fixture: ComponentFixture<PayslipPreviewModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayslipPreviewModalComponent]
    });
    fixture = TestBed.createComponent(PayslipPreviewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
