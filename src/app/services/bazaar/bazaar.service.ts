import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BazaarService {

  constructor(
    private http: HttpClient
  ) {
    this._initializeData();
  }

  private _bazaarsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public bazaars$: Observable<any[]> = this._bazaarsSubject.asObservable();

  private _errorSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public error$: Observable<string> = this._errorSubject.asObservable();

  private _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this._loadingSubject.asObservable();

  /**
   * Set subscription to _getBazaarProducts, calling _setBazaarProducts
   */
  private _initializeData(): void {
    this._getBazaarProducts().subscribe({
      next: (products: any) => {
        this._setBazaarProducts(products);
      },
      error: (e) => {
        this._setError("Error fetching bazaar products");
        console.error(e);
      }
    });
  }

  private _setBazaarProducts(prouducts: any): void {
    this._bazaarsSubject.next(prouducts);
  }

  private _setError(error: string): void {
    this._errorSubject.next(error);
  }

  private _setLoading(loadingState: boolean): void {
    this._loadingSubject.next(loadingState)
  }

  private _getBazaarProducts() {
    this._setLoading(true);
    const apiUrl = "https://api.hypixel.net/v2/resources/skyblock/bazaars";
    const data = this.http.get<any>(apiUrl).pipe(
      map(data => data.products)
    );
    this._setLoading(false);
    return data;
  }
}
