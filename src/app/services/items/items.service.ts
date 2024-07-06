import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {

  constructor(
    private http: HttpClient
  ) {
    this._initializeData();
  }

  private _itemsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public items$: Observable<any[]> = this._itemsSubject.asObservable();

  private _errorSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public error$: Observable<string> = this._errorSubject.asObservable();

  private _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this._loadingSubject.asObservable();

  /**
   * Set subscription to _getItems, calling _setItems
   */
  private _initializeData(): void {
    this._getItems().subscribe({
      next: (items: any) => {
        this._setItems(items);
      },
      error: (e) => {
        this._setError("Error fetching items");
        console.error(e);
      }
    });
  }

  private _setItems(items: any): void {
    this._itemsSubject.next(items);
  }

  private _setError(error: string): void {
    this._errorSubject.next(error);
  }

  private _setLoading(loadingState: boolean): void {
    this._loadingSubject.next(loadingState)
  }

  private _getItems() {
    this._setLoading(true);
    const apiUrl = "https://api.hypixel.net/v2/resources/skyblock/items";
    const data = this.http.get<any>(apiUrl).pipe(
      map(data => data.items)
    );
    this._setLoading(false);
    return data;
  }
}
