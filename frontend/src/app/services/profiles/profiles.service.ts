import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { IMojangProfile, ISkyblockProfileDetail, ISkyblockProfile } from '@shared/models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfilesService {

  private http = inject(HttpClient);

  private _profiles = signal<ISkyblockProfile[]>([]);
  public profiles = this._profiles.asReadonly();

  private _loading = signal<boolean>(false);
  public loading = this._loading.asReadonly();

  private _error = signal<string>('');
  public error = this._error.asReadonly();

  private _searched = signal<boolean>(false);
  public searched = this._searched.asReadonly();

  private _player = signal<IMojangProfile | null>(null);
  public player = this._player.asReadonly();

  private _selectedProfile = signal<ISkyblockProfile | null>(null);
  public selectedProfile = this._selectedProfile.asReadonly();

  private _overview = signal<ISkyblockProfileDetail | null>(null);
  public overview = this._overview.asReadonly();

  private _overviewLoading = signal<boolean>(false);
  public overviewLoading = this._overviewLoading.asReadonly();

  private _overviewError = signal<string>('');
  public overviewError = this._overviewError.asReadonly();

  private _overviewSub?: Subscription;

  /**
   * Selects a profile and loads its full data
   * from the backend's /api/profile proxy (Hypixel skyblock/profile?profile=)
   * @param { ISkyblockProfile } profile - The profile to select
   */
  public selectProfile(profile: ISkyblockProfile): void {
    this._selectedProfile.set(profile);
    this._overviewSub?.unsubscribe();
    this._overview.set(null);
    this._overviewError.set('');

    const player = this._player();
    if (!player) {
      return;
    }

    this._overviewLoading.set(true);
    this._overviewSub = this.http.get<ISkyblockProfileDetail>(
      `/api/profile/${profile.profile_id}`, { params: { uuid: player.id } }
    ).subscribe({
      next: (overview) => {
        this._overview.set(overview);
        this._overviewLoading.set(false);
      },
      error: (e: HttpErrorResponse) => {
        console.error(e);
        this._overviewError.set(e.status === 429 ? 'Too many requests, please try again shortly' : 'Error fetching profile data');
        this._overviewLoading.set(false);
      },
    });
  }

  /**
   * Resolves a Minecraft username to a UUID (via the backend's Mojang proxy),
   * then loads that player's SkyBlock profiles
   * @param { string } username - The Minecraft username to look up
   */
  public lookup(username: string): void {
    this._loading.set(true);
    this._error.set('');
    this._profiles.set([]);
    this._overviewSub?.unsubscribe();
    this._selectedProfile.set(null);
    this._overview.set(null);
    this._overviewError.set('');
    this._overviewLoading.set(false);
    this._player.set(null);

    this.http.get<IMojangProfile>(`/api/mojang/${encodeURIComponent(username)}`).pipe(
      tap(mojang => this._player.set(mojang)),
      switchMap(mojang => this.http.get<ISkyblockProfile[]>(`/api/profiles/${mojang.id}`))
    ).subscribe({
      next: (profiles) => {
        this._profiles.set(profiles);
        this._searched.set(true);
        this._loading.set(false);
        const last = profiles.find(p => p.selected);
        if (last) {
          this.selectProfile(last);
        }
      },
      error: (e: HttpErrorResponse) => {
        console.error(e);
        this._error.set(this._errorMessage(e));
        this._searched.set(true);
        this._loading.set(false);
      },
    });
  }

  private _errorMessage(e: HttpErrorResponse): string {
    switch (e.status) {
      case 400:
      case 404: return 'Username not found';
      case 429: return 'Too many requests, please try again shortly';
      default: return 'Error fetching profiles';
    }
  }
}
