import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionsFooterComponent } from './suggestions-footer.component';

describe('SuggestionsFooterComponent', () => {
  let component: SuggestionsFooterComponent;
  let fixture: ComponentFixture<SuggestionsFooterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuggestionsFooterComponent]
    });
    fixture = TestBed.createComponent(SuggestionsFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
