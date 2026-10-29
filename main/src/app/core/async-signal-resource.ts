import { signal, Signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface AsyncResource<T> {
  data: Signal<T>;
  loading: Signal<boolean>;
  error: Signal<string>;
  reload: () => void;
}

/**
 * Wraps a cold Observable-returning fetcher with signal-based data/loading/error
 * state, loading immediately on creation. `reload()` re-runs the fetcher.
 */
export function createAsyncResource<T>(
  fetcher: () => Observable<T>,
  initialValue: T,
  errorMessage: string,
): AsyncResource<T> {
  const data = signal<T>(initialValue);
  const loading = signal<boolean>(false);
  const error = signal<string>('');

  function load(): void {
    loading.set(true);
    error.set('');
    fetcher().subscribe({
      next: (value) => {
        data.set(value);
        loading.set(false);
      },
      error: (e) => {
        console.error(e);
        error.set(errorMessage);
        loading.set(false);
      },
    });
  }

  load();

  return { data: data.asReadonly(), loading: loading.asReadonly(), error: error.asReadonly(), reload: load };
}
