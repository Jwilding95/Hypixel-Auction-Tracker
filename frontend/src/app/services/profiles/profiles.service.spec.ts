import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EMPTY_DETAIL } from '../../testing/profile-detail.fixture';
import { ProfilesService } from './profiles.service';
import { ISkyblockProfile } from '@shared/models/profile.model';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let httpMock: HttpTestingController;

  const uuid = '069a79f444e94726a5befca90e38aaf5';
  const overview = EMPTY_DETAIL;
  const profiles: ISkyblockProfile[] = [
    { profile_id: 'a', cute_name: 'Apple', game_mode: 'classic', selected: true },
    { profile_id: 'b', cute_name: 'Banana', game_mode: 'ironman', selected: false },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ProfilesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should resolve the username then load profiles', () => {
    service.lookup('Notch');
    expect(service.loading()).toBe(true);

    httpMock.expectOne('/api/mojang/Notch').flush({ id: uuid, name: 'Notch' });
    httpMock.expectOne(`/api/profiles/${uuid}`).flush(profiles);
    httpMock.expectOne(r => r.url === '/api/profile/a' && r.params.get('uuid') === uuid).flush(overview);

    expect(service.overview()).toEqual(overview);
    expect(service.profiles()).toEqual(profiles);
    expect(service.player()).toEqual({ id: uuid, name: 'Notch' });
    expect(service.selectedProfile()?.profile_id).toBe('a');
    expect(service.loading()).toBe(false);
    expect(service.error()).toBe('');
  });

  it('should set an error when the username is not found', () => {
    service.lookup('nobody');
    httpMock.expectOne('/api/mojang/nobody').flush({ error: 'Username not found' }, { status: 404, statusText: 'Not Found' });

    expect(service.error()).toBe('Username not found');
    expect(service.player()).toBeNull();
    expect(service.profiles()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('should report no profiles when the player has none', () => {
    service.lookup('Notch');
    httpMock.expectOne('/api/mojang/Notch').flush({ id: uuid, name: 'Notch' });
    httpMock.expectOne(`/api/profiles/${uuid}`).flush([]);

    expect(service.profiles()).toEqual([]);
    expect(service.searched()).toBe(true);
    expect(service.error()).toBe('');
  });

  it('should set a generic error when the profiles request fails', () => {
    service.lookup('Notch');
    httpMock.expectOne('/api/mojang/Notch').flush({ id: uuid, name: 'Notch' });
    httpMock.expectOne(`/api/profiles/${uuid}`).flush({}, { status: 502, statusText: 'Bad Gateway' });

    expect(service.error()).toBe('Error fetching profiles');
  });

  it('should track the selected profile and clear it on a new lookup', () => {
    service.selectProfile(profiles[0]);
    expect(service.selectedProfile()).toEqual(profiles[0]);

    service.lookup('Notch');
    expect(service.selectedProfile()).toBeNull();
    httpMock.expectOne('/api/mojang/Notch');
  });
});
