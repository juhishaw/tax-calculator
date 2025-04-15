import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsSummaryComponent } from './results-summary.component';

describe('ResultsSummaryComponent', () => {
  let component: ResultsSummaryComponent;
  let fixture: ComponentFixture<ResultsSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResultsSummaryComponent]
    });
    fixture = TestBed.createComponent(ResultsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
