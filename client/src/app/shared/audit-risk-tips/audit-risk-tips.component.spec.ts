import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditRiskTipsComponent } from './audit-risk-tips.component';

describe('AuditRiskTipsComponent', () => {
  let component: AuditRiskTipsComponent;
  let fixture: ComponentFixture<AuditRiskTipsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AuditRiskTipsComponent]
    });
    fixture = TestBed.createComponent(AuditRiskTipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
