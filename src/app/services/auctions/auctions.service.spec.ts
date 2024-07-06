import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuctionsService } from './auctions.service';
import { IAuctionItem } from '../../models/auction.model';
import { IFilter } from '../../models/filter.model';

describe('AuctionsService', () => {
  let service: AuctionsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuctionsService]
    });
    service = TestBed.inject(AuctionsService);
    httpMock = TestBed.inject(HttpTestingController);

    const initialRequest = httpMock.expectOne('https://api.hypixel.net/v2/skyblock/auctions');
    initialRequest.flush({ totalPages: 1 });

    const auctionsRequest = httpMock.expectOne('https://api.hypixel.net/v2/skyblock/auctions?page=0');
    auctionsRequest.flush({ auctions: [] });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch total pages', () => {
    const dummyResponse = { totalPages: 2 };
  
    service['_getTotalPages']().subscribe(totalPages => {
      expect(totalPages).toBe(2);
    });
  
    const req = httpMock.expectOne('https://api.hypixel.net/v2/skyblock/auctions');
    expect(req.request.method).toBe('GET');
    req.flush(dummyResponse);
  });

  it('should fetch auction data for a given page', () => {
    const dummyAuctions = [{ auctionId: '1' }, { auctionId: '2' }];

    service['_getAuctionsData'](0).subscribe(auctions => {
      expect(auctions.length).toBe(2);
      expect(auctions).toEqual(dummyAuctions);
    });

    const req = httpMock.expectOne('https://api.hypixel.net/v2/skyblock/auctions?page=0');
    expect(req.request.method).toBe('GET');
    req.flush(dummyAuctions);
  });

  it('should fetch all auctions', () => {
    const totalPagesResponse = { totalPages: 2 };
    const auctionsPage1 = { auctions: [{ auctionId: '1' }] };
    const auctionsPage2 = { auctions: [{ auctionId: '2' }] };
  
    service['_fetchAllAuctions']().subscribe(auctions => {
      expect(auctions.length).toBe(2);
      expect(auctions).toEqual([{ auctionId: '1' }, { auctionId: '2' }]);
    });
  
    const totalPagesReq = httpMock.expectOne('https://api.hypixel.net/v2/skyblock/auctions');
    totalPagesReq.flush(totalPagesResponse);
  
    const auctionsReq1 = httpMock.expectOne('https://api.hypixel.net/v2/skyblock/auctions?page=0');
    const auctionsReq2 = httpMock.expectOne('https://api.hypixel.net/v2/skyblock/auctions?page=1');
    auctionsReq1.flush(auctionsPage1);
    auctionsReq2.flush(auctionsPage2);
  });

  it('should transform auctions', () => {
    const rawAuctions = [
      { 
        auctioneer: '', bids: [], bin: true, category: 'weapon', claimed: false, claimed_bidders: [], 
        coop: [], end: 123456, extra: 'qwe extra', highest_bid_amount: 1000, item_bytes: '', 
        item_lore: 'qwe lore', item_name: 'qwe', item_uuid: '', last_updated: 123456, profile_id: '', 
        start: 111111,  starting_bid: 500, tier: 'COMMON', uuid: '' 
      },
      { 
        auctioneer: '', bids: [], bin: true, category: 'weapon', claimed: false, claimed_bidders: [], 
        coop: [], end: 123456, extra: 'asd extra', highest_bid_amount: 1000, item_bytes: '', 
        item_lore: 'asd lore', item_name: 'asd', item_uuid: '', last_updated: 123456, profile_id: '', 
        start: 111111,  starting_bid: 500, tier: 'COMMON', uuid: '' 
      },
    ];
  
    const transformedAuctions: IAuctionItem[] = service['_transformAuctions'](rawAuctions);
  
    expect(transformedAuctions.length).toBe(2);
    expect(Object.entries(transformedAuctions[0])).toEqual([
      ['bids', []], ['bin', true], ['category', 'weapon'], ['end', 123456], ['highest_bid_amount', 1000], 
      ['item_name', 'qwe'], ['starting_bid', 500], ['tier', 'COMMON']
    ]);
  });
});
