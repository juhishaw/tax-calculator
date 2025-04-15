import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxPolicyTableComponent } from './tax-policy-table.component';

describe('TaxPolicyTableComponent', () => {
  let component: TaxPolicyTableComponent;
  let fixture: ComponentFixture<TaxPolicyTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaxPolicyTableComponent]
    });
    fixture = TestBed.createComponent(TaxPolicyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
