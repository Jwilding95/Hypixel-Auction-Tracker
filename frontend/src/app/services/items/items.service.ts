import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createAsyncResource } from '../../core/async-signal-resource';

/**
 * Shape of a single item as returned by the Hypixel
 * /v2/resources/skyblock/items API endpoint. Items vary significantly by
 * type, so several fields are left loosely typed pending further use.
 */
export interface ISkyblockItem {
  id: string;
  name: string;
  material: string;
  durability?: number;
  category?: string;
  tier?: string;
  npc_sell_price?: number;
  skin?: { value: string; signature: string };
  stats?: Record<string, unknown>;
  requirements?: unknown[];
  museum_data?: Record<string, unknown>;
  salvages?: unknown[];
  gemstone_slots?: unknown[];
  upgrade_costs?: unknown[];
  components?: unknown[];
}

@Injectable({
  providedIn: 'root'
})
export class ItemsService {

  private http = inject(HttpClient);

  private _resource = createAsyncResource<ISkyblockItem[]>(
    () => this._getItems(),
    [],
    'Error fetching items',
  );
  public items = this._resource.data;
  public loading = this._resource.loading;
  public error = this._resource.error;

  private _getItems(): Observable<ISkyblockItem[]> {
    const apiUrl = "https://api.hypixel.net/v2/resources/skyblock/items";
    return this.http.get<any>(apiUrl).pipe(
      map(data => data.items)
    );
  }
}
