import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { BazaarService } from './bazaar.service';

describe('BazaarService', () => {
  let service: BazaarService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(BazaarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
