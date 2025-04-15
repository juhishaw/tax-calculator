import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxPreviewWidgetComponent } from './tax-preview-widget.component';

describe('TaxPreviewWidgetComponent', () => {
  let component: TaxPreviewWidgetComponent;
  let fixture: ComponentFixture<TaxPreviewWidgetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaxPreviewWidgetComponent]
    });
    fixture = TestBed.createComponent(TaxPreviewWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
