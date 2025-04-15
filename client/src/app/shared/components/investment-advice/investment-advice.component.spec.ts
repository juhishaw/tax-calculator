import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentAdviceComponent } from './investment-advice.component';

describe('InvestmentAdviceComponent', () => {
  let component: InvestmentAdviceComponent;
  let fixture: ComponentFixture<InvestmentAdviceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InvestmentAdviceComponent]
    });
    fixture = TestBed.createComponent(InvestmentAdviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
