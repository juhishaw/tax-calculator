import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HousePropertyComponent } from './house-property.component';

describe('HousePropertyComponent', () => {
  let component: HousePropertyComponent;
  let fixture: ComponentFixture<HousePropertyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HousePropertyComponent]
    });
    fixture = TestBed.createComponent(HousePropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
