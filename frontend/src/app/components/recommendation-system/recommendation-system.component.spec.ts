import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EMPTY_DETAIL } from '../../testing/profile-detail.fixture';
import { RecommendationSystemComponent } from './recommendation-system.component';


describe('RecommendationSystemComponent', () => {
  let component: RecommendationSystemComponent;
  let fixture: ComponentFixture<RecommendationSystemComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecommendationSystemComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecommendationSystemComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not search with an empty username', () => {
    component.search();
    httpMock.expectNone('/api/mojang/');
  });

  it('should render a card per profile and mark the selected one', () => {
    component.usernameForm.setValue('Notch');
    component.search();
    httpMock.expectOne('/api/mojang/Notch').flush({ id: 'abc', name: 'Notch' });
    httpMock.expectOne('/api/profiles/abc').flush([
      { profile_id: 'a', cute_name: 'Apple', game_mode: 'classic', selected: true },
      { profile_id: 'b', cute_name: 'Banana', game_mode: 'ironman', selected: false },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.player img').getAttribute('src')).toContain('abc');

    const cards = fixture.nativeElement.querySelectorAll('.profile');
    expect(cards.length).toBe(2);
    expect(component.profilesService.selectedProfile()?.profile_id).toBe('a');
    expect(fixture.nativeElement.querySelector('.overview').textContent).toContain('Apple');

    cards[1].click();
    httpMock.expectOne(r => r.url === '/api/profile/b').flush(EMPTY_DETAIL);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.profile.selected').length).toBe(1);
    expect(component.profilesService.selectedProfile()?.profile_id).toBe('b');
    const overview = fixture.nativeElement.querySelector('.overview');
    expect(overview.textContent).toContain('Banana');
    expect(overview.textContent).toContain('81');
    expect(overview.textContent).toContain('N/A');
  });
});
