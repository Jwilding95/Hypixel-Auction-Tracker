import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createAsyncResource } from '../../core/async-signal-resource';

/**
 * Shape of a single bazaar product as returned by the Hypixel
 * /v2/skyblock/bazaar API endpoint's `products` map.
 */
export interface IBazaarProduct {
  product_id: string;
  sell_summary: { amount: number; pricePerUnit: number; orders: number }[];
  buy_summary: { amount: number; pricePerUnit: number; orders: number }[];
  quick_status: {
    productId: string;
    sellPrice: number; sellVolume: number; sellMovingWeek: number; sellOrders: number;
    buyPrice: number; buyVolume: number; buyMovingWeek: number; buyOrders: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BazaarService {

  private http = inject(HttpClient);

  private _resource = createAsyncResource<Record<string, IBazaarProduct>>(
    () => this._getBazaarProducts(),
    {},
    'Error fetching bazaar products',
  );
  public bazaars = this._resource.data;
  public loading = this._resource.loading;
  public error = this._resource.error;

  private _getBazaarProducts(): Observable<Record<string, IBazaarProduct>> {
    const apiUrl = "https://api.hypixel.net/v2/skyblock/bazaar";
    return this.http.get<any>(apiUrl).pipe(
      map(data => data.products)
    );
  }
}
