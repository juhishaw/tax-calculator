import { TestBed } from '@angular/core/testing';

import { TaxPreviewService } from './tax-preview.service';

describe('TaxPreviewService', () => {
  let service: TaxPreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaxPreviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
