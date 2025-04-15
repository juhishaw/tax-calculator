import { TestBed } from '@angular/core/testing';

import { TaxUtilsService } from './tax-utils.service';

describe('TaxUtilsService', () => {
  let service: TaxUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaxUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
