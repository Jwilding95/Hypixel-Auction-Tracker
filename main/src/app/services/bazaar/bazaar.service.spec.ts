import { TestBed } from '@angular/core/testing';

import { BazaarService } from './bazaar.service';

describe('BazaarService', () => {
  let service: BazaarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BazaarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
