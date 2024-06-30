import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, of, throwError } from 'rxjs';
import { map, concatMap, catchError } from 'rxjs/operators';
import { IAuctionItem } from '../models/auction.model';
import { IFilter } from '../models/filter.model';

@Injectable({
  providedIn: 'root'
})

export class AuctionsService {

  private _auctionsSubject: BehaviorSubject<IAuctionItem[]> = new BehaviorSubject<IAuctionItem[]>([]);
  public auctions$: Observable<IAuctionItem[]> = this._auctionsSubject.asObservable();

  private _errorSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public error$: Observable<string> = this._errorSubject.asObservable();

  private _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this._loadingSubject.asObservable();

  private _filterSubject: BehaviorSubject<IFilter> = new BehaviorSubject<IFilter>({
    searchString: "",
    excludeString: "",
    searchArray: [],
    excludeArray: [],
    itemName: true,
    itemDescription: false,
    auctionType: "all",
    minBid: 0,
    maxBid: 0,
    category: "all",
    tier: "all",
  });
  public filter$: Observable<IFilter> = this._filterSubject.asObservable(); 

  constructor(
    private http: HttpClient
  ) { 
    this._initializeData();
    
  }

  /**
   * Set subscription to _fetchAllAuctions, calling _setAuctions
   * and _initializeFilter
   */
  private _initializeData(): void {
    this._fetchAllAuctions().subscribe({
      next: (auctions: any) => {
        this._setAuctions(this._transformAuctions(auctions));
        this._initializeFilter();
      },
      error: (e) => {
        this._setError("Error fetching auctions");
        console.error(e);
      }
    });
  }

  private _setAuctions(auctions: IAuctionItem[]): void {
    this._auctionsSubject.next(auctions);
  }

  private _setError(error: string): void {
    this._errorSubject.next(error);
  }
  
  private _initializeFilter(): void {
    this._filterSubject.next(this._filterSubject.value)
  }

  public setFilter(filterObject: any): void {
    this._filterSubject.next(filterObject)
  }

  private _setLoading(loadingState: boolean): void {
    this._loadingSubject.next(loadingState)
  }

  /**
   * Iterates through a range of 0 to totalPages, invoking _getAuctionsData with
   * the page number as the argument for each number within the range, then
   * iterating through each response and pushing the auctions property value
   * into a new array
   * @returns { Observable<Object[]> } - All api data across all pages
   */
  private _fetchAllAuctions(): Observable<Object[]> {
    this._setLoading(true)
    return this._getTotalPages().pipe(
      concatMap(totalPages => {
        const requests = [];
        for (let page = 0; page < totalPages; page++) {
          requests.push(this._getAuctionsData(page));
        }
        return forkJoin(requests);
      }),
      map((responses: any[]) => {
        const allAuctions: any[] = [];
        responses.forEach(response => {
          if (response && response.auctions) {
            allAuctions.push(...response.auctions);
          }
        });
        this._setLoading(false)
        return allAuctions;
      }),
      catchError(error => {
        this._setLoading(false);
        return throwError(() => error)
      })
    );
  }
  
  /**
   * Gets the total number of pages of data from the api
   * @returns { Observable<number> } - The number of pages the api data is 
   * paginated into
   */
  private _getTotalPages(): Observable<number> {
    return of(1)
    const apiUrl = `https://api.hypixel.net/v2/skyblock/auctions`;
    return this.http.get<any>(apiUrl).pipe(
      map(data => data.totalPages)
    );
  }
  
  /**
   * Return data from GET request to API url with a 'page' query parameter
   * @param { number } page - The current page of api data to get
   * @returns { Observable<Object[]> } - An array of objects for each page of api data 
   * (limited to 1000 objects)
   */
  private _getAuctionsData(page: number): Observable<Object[]> {
    const apiUrl = `https://api.hypixel.net/v2/skyblock/auctions?page=${page}`;
    return this.http.get<Object[]>(apiUrl);
  }

  /**
   * Transform API object array data into an array of IAuctionItem objects
   * @param { Object[] } auctions - Raw data returned from API
   * @returns { IAuctionItem[] } - Array of IAuctionItem elements, 
   * destructured from API data
   */
  private _transformAuctions(auctions: Object[]): IAuctionItem[] {
    return auctions.map((item: Record<string, any>) => {
      const { bin, category, end, highest_bid_amount, item_name,
        item_lore, starting_bid, tier } = item;
      return { bin, category, end, highest_bid_amount, item_name,
        item_lore, starting_bid, tier };
    });
  }

  private _getItems() {
    const apiUrl = "https://api.hypixel.net/v2/resources/skyblock/items";
    return this.http.get<any>(apiUrl).pipe(
      map(data => data.items)
    );
  }
}
