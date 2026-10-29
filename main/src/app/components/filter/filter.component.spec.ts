import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { FilterComponent } from './filter.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuctionsService } from '../../services/auctions/auctions.service';
import { DEFAULT_FILTER } from '../../models/filter.model';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;
  let auctionService: AuctionsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterComponent, HttpClientTestingModule],
      providers: [AuctionsService, { provide: ActivatedRoute, useValue: {} }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    auctionService = TestBed.inject(AuctionsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('reflects active filters from the auction service', () => {
    auctionService.setFilter({ ...DEFAULT_FILTER, tier: 'legendary', minBid: 100 });
    TestBed.flushEffects();

    const props = component.activeFilters().map(chip => chip.prop);
    expect(props.includes('tier')).toBe(true);
    expect(props.includes('minBid')).toBe(true);
  });

  it('removeFilter resets the given property to its default and updates the service', () => {
    auctionService.setFilter({ ...DEFAULT_FILTER, tier: 'legendary' });
    component.removeFilter('tier');
    expect(auctionService.filter().tier).toBe('all');
  });
});
