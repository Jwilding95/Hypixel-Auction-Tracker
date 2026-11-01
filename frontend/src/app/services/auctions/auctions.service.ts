import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, concatMap } from 'rxjs/operators';
import { IAuctionItem, IRawAuction } from '@shared/models/auction.model';
import { DEFAULT_FILTER, IFilter } from '@shared/models/filter.model';
import { createAsyncResource } from '../../core/async-signal-resource';

@Injectable({
  providedIn: 'root'
})
export class AuctionsService {

  private http = inject(HttpClient);

  private _resource = createAsyncResource<IAuctionItem[]>(
    () => this._fetchAllAuctions(),
    [],
    'Error fetching auctions',
  );
  public auctions = this._resource.data;
  public loading = this._resource.loading;
  public error = this._resource.error;

  private _filter = signal<IFilter>(DEFAULT_FILTER);
  public filter = this._filter.asReadonly();

  public setFilter(filterObject: IFilter): void {
    this._filter.set(filterObject);
  }

  /**
   * Iterates through a range of 0 to totalPages, invoking _getAuctionsData with
   * the page number as the argument for each number within the range, then
   * iterating through each response and pushing the auctions property value
   * into a new array, transformed into IAuctionItem[]
   * @returns { Observable<IAuctionItem[]> } - All api data across all pages
   */
  private _fetchAllAuctions(): Observable<IAuctionItem[]> {
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
        return allAuctions;
      }),
      map(raw => this._transformAuctions(raw)),
    );
  }

  /**
   * Gets the total number of pages of data from the api
   * @returns { Observable<number> } - The number of pages the api data is
   * paginated into
   */
  private _getTotalPages(): Observable<number> {
    // Deliberately capped to 1 page during testing to limit Hypixel API calls.
    // The real pagination logic below is intentionally unreachable for now —
    // do not delete it; remove this early return once testing is complete.
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
   * @param { IRawAuction[] } auctions - Raw data returned from API
   * @returns { IAuctionItem[] } - Array of IAuctionItem elements,
   * destructured from API data
   */
  private _transformAuctions(auctions: IRawAuction[]): IAuctionItem[] {
    return auctions.map((item) => {
      const { uuid, bin, category, end, highest_bid_amount, item_name,
        item_lore, starting_bid, tier } = item;
      return { uuid, bin, category, end, highest_bid_amount, item_name,
        item_lore, starting_bid, tier };
    });
  }
}
