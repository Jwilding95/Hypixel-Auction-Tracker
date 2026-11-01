import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileDetailComponent, PROFILE_TABS } from './profile-detail.component';
import { EMPTY_DETAIL } from '../../testing/profile-detail.fixture';

describe('ProfileDetailComponent', () => {
  let fixture: ComponentFixture<ProfileDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProfileDetailComponent] }).compileComponents();
    fixture = TestBed.createComponent(ProfileDetailComponent);
    fixture.componentRef.setInput('detail', EMPTY_DETAIL);
    fixture.detectChanges();
  });

  const panelText = (): string => fixture.nativeElement.querySelector('.panel').textContent;
  const clickTab = (name: string): void => {
    const tab = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('.tab'))
      .find(t => t.textContent?.trim() === name);
    tab!.click();
    fixture.detectChanges();
  };

  it('should render every tab and start on Gear', () => {
    const labels = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.tab')).map(t => t.textContent?.trim());
    expect(labels).toEqual([...PROFILE_TABS]);
    expect(fixture.nativeElement.querySelector('.panel img').getAttribute('alt')).toBe("Bustling Rancher's Boots");
    expect(fixture.nativeElement.querySelector('.panel img').getAttribute('src')).toBe('/api/icon/RANCHERS_BOOTS');
    fixture.nativeElement.querySelector('.panel .tile').dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.panel .item-card').innerHTML).toContain('item-card-5');
  });

  it('should switch panels when a tab is clicked', () => {
    clickTab('Pets');
    expect(fixture.nativeElement.querySelector('.panel img').getAttribute('alt')).toBe('[Lvl 84] Bee');

    clickTab('Misc');
    expect(panelText()).toContain('Deaths');
    expect(fixture.nativeElement.querySelector('.panel img')).toBeNull();
  });

  it('should render every tab without throwing on empty data', () => {
    for (const tab of PROFILE_TABS) {
      clickTab(tab);
      expect(fixture.nativeElement.querySelector('.panel')).toBeTruthy();
    }
  });
});
