import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent } from './table.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuctionsService } from '../../services/auctions/auctions.service';
import { IAuctionItem } from '@shared/models/auction.model';
import { DEFAULT_FILTER } from '@shared/models/filter.model';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;
  let auctionService: AuctionsService;

  const makeAuction = (overrides: Partial<IAuctionItem>): IAuctionItem => ({
    uuid: 'uuid',
    bin: true,
    category: 'weapon',
    end: 0,
    highest_bid_amount: 0,
    item_name: 'Item',
    item_lore: '',
    starting_bid: 0,
    tier: 'COMMON',
    ...overrides,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent, HttpClientTestingModule],
      providers: [AuctionsService]
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    auctionService = TestBed.inject(AuctionsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('_filteredItems', () => {
    const auctions: IAuctionItem[] = [
      makeAuction({ uuid: '1', bin: true, category: 'weapon', tier: 'COMMON', starting_bid: 100, item_name: 'Sword' }),
      makeAuction({ uuid: '2', bin: false, category: 'armor', tier: 'RARE', starting_bid: 500, item_name: 'Helmet' }),
    ];

    it('filters by auction type', () => {
      const result = (component as any)._filteredItems(auctions, { ...DEFAULT_FILTER, auctionType: 'BIN' });
      expect(result.map((a: IAuctionItem) => a.uuid)).toEqual(['1']);
    });

    it('filters by category', () => {
      const result = (component as any)._filteredItems(auctions, { ...DEFAULT_FILTER, category: 'armor' });
      expect(result.map((a: IAuctionItem) => a.uuid)).toEqual(['2']);
    });

    it('filters by min/max bid', () => {
      const result = (component as any)._filteredItems(auctions, { ...DEFAULT_FILTER, minBid: 200, maxBid: 1000 });
      expect(result.map((a: IAuctionItem) => a.uuid)).toEqual(['2']);
    });

    it('filters and orders by search relevance', () => {
      const result = (component as any)._filteredItems(auctions, { ...DEFAULT_FILTER, searchString: 'sword', searchArray: ['sword'] });
      expect(result.map((a: IAuctionItem) => a.uuid)).toEqual(['1']);
    });
  });

  describe('_sortAuctions', () => {
    const auctions: IAuctionItem[] = [
      makeAuction({ uuid: '1', item_name: 'Zebra', starting_bid: 100, end: 200 }),
      makeAuction({ uuid: '2', item_name: 'Apple', starting_bid: 300, end: 100 }),
    ];

    it('sorts by item name ascending', () => {
      const result = (component as any)._sortAuctions(auctions, { column: 'Item', reverse: false });
      expect(result.map((a: IAuctionItem) => a.uuid)).toEqual(['2', '1']);
    });

    it('reverses order when reverse is true', () => {
      const result = (component as any)._sortAuctions(auctions, { column: 'Item', reverse: true });
      expect(result.map((a: IAuctionItem) => a.uuid)).toEqual(['1', '2']);
    });

    it('sorts by current bid', () => {
      const result = (component as any)._sortAuctions(auctions, { column: 'Current Bid', reverse: false });
      expect(result.map((a: IAuctionItem) => a.uuid)).toEqual(['1', '2']);
    });

    it('returns auctions unchanged when no column is set', () => {
      const result = (component as any)._sortAuctions(auctions, { column: '', reverse: false });
      expect(result).toBe(auctions);
    });
  });

  it('resets to page 0 when the filtered result set changes', () => {
    component.pageNumber.set(3);
    auctionService.setFilter({ ...DEFAULT_FILTER, category: 'armor' });
    TestBed.flushEffects();
    expect(component.pageNumber()).toBe(0);
  });
});
