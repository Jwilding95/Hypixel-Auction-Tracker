import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemIconComponent } from './item-icon.component';

describe('ItemIconComponent', () => {
  let fixture: ComponentFixture<ItemIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ItemIconComponent] }).compileComponents();
    fixture = TestBed.createComponent(ItemIconComponent);
    fixture.componentRef.setInput('name', 'Hyper Cleaver');
    fixture.componentRef.setInput('lore', '§7Damage: §c+212\n\n§5§lEPIC SWORD');
    fixture.componentRef.setInput('iconId', 'HYPER_CLEAVER');
    fixture.detectChanges();
  });

  const img = (): HTMLImageElement | null => fixture.nativeElement.querySelector('img');

  const hover = (): void => {
    fixture.nativeElement.querySelector('.tile').dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
  };

  it('should show the icon, and an auction style item card only while hovering', () => {
    expect(img()!.getAttribute('src')).toBe('/api/icon/HYPER_CLEAVER');
    expect(fixture.nativeElement.querySelector('.item-card')).toBeNull();

    hover();
    const card = fixture.nativeElement.querySelector('.item-card');
    expect(card.textContent).toContain('Hyper Cleaver');
    expect(card.textContent).toContain('Damage: +212');
    expect(card.querySelector('.item-card-5')).toBeTruthy();

    fixture.nativeElement.querySelector('.tile').dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.item-card')).toBeNull();
  });

  it('should scroll an overflowing card with the wheel', () => {
    hover();
    const card: HTMLElement = fixture.nativeElement.querySelector('.item-card');
    Object.defineProperty(card, 'scrollHeight', { value: 500 });
    Object.defineProperty(card, 'clientHeight', { value: 100 });
    const event = new WheelEvent('wheel', { deltaY: 40, cancelable: true });
    fixture.nativeElement.querySelector('.tile').dispatchEvent(event);
    expect(card.scrollTop).toBe(40);
    expect(event.defaultPrevented).toBe(true);
  });

  it('should fall back to the initial when the icon fails', () => {
    img()!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(img()).toBeNull();
    expect(fixture.nativeElement.querySelector('.fallback').textContent).toBe('H');
  });

  it('should escape html in names', () => {
    fixture.componentRef.setInput('name', '<b>x</b>');
    hover();
    expect(fixture.nativeElement.querySelector('.item-card b')).toBeNull();
  });

  it('should show a count badge for stacks only', () => {
    expect(fixture.nativeElement.querySelector('.count')).toBeNull();
    fixture.componentRef.setInput('count', 64);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.count').textContent).toBe('64');
  });
});
