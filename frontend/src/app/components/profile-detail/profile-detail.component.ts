import { AfterViewInit, Component, computed, ElementRef, input, OnDestroy, signal, viewChild } from '@angular/core';
import { DatePipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { ItemIconComponent } from '../item-icon/item-icon.component';
import { ISkyblockProfileDetail } from '@shared/models/profile.model';

export const PROFILE_TABS = [
  'Gear', 'Accessories', 'Pets', 'Inventory', 'Skills', 'Dungeons', 'Slayer',
  'Minions', 'Bestiary', 'Collections', 'Crimson Isle', 'Rift', 'Misc',
] as const;
export type ProfileTab = typeof PROFILE_TABS[number];

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [DecimalPipe, DatePipe, NgTemplateOutlet, ItemIconComponent],
  templateUrl: './profile-detail.component.html',
  styleUrl: './profile-detail.component.scss'
})
export class ProfileDetailComponent implements AfterViewInit, OnDestroy {

  public detail = input.required<ISkyblockProfileDetail>();

  private tabsEl = viewChild<ElementRef<HTMLElement>>('tabsEl');
  private resizeObserver?: ResizeObserver;

  public canScrollLeft = signal<boolean>(false);
  public canScrollRight = signal<boolean>(false);

  public tabs = PROFILE_TABS;
  public activeTab = signal<ProfileTab>('Gear');

  public bestiaryFilter = signal<string>('');
  public collectionFilter = signal<string>('');

  public filteredBestiary = computed(() => {
    const q = this.bestiaryFilter().toLowerCase();
    return this.detail().bestiary.families.filter(f => f.name.toLowerCase().includes(q));
  });

  public filteredCollections = computed(() => {
    const q = this.collectionFilter().toLowerCase();
    return this.detail().collections.filter(c => c.name.toLowerCase().includes(q));
  });

  public inventoryGroups = computed(() => {
    const inv = this.detail().inventory;
    return [
      { title: 'Inventory', items: inv.inventory },
      { title: 'Ender Chest', items: inv.ender_chest },
      { title: 'Personal Vault', items: inv.vault },
      { title: 'Potion Bag', items: inv.potion_bag },
      { title: 'Quiver', items: inv.quiver },
    ];
  });

  public dungeonFloorGroups = computed(() => {
    const d = this.detail().dungeons;
    return [
      { title: 'Catacombs Floors', floors: d.floors },
      { title: 'Master Mode Floors', floors: d.master_floors },
    ];
  });

  public ngAfterViewInit(): void {
    const el = this.tabsEl()?.nativeElement;
    if (!el) {
      return;
    }
    this.updateScroll();
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.updateScroll());
      this.resizeObserver.observe(el);
    }
  }

  public ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  /** Shows each arrow only while there is more to scroll in that direction */
  public updateScroll(): void {
    const el = this.tabsEl()?.nativeElement;
    if (!el) {
      return;
    }
    this.canScrollLeft.set(el.scrollLeft > 1);
    this.canScrollRight.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }

  /** Smoothly scrolls the tab strip by most of its visible width */
  public scrollTabs(direction: -1 | 1): void {
    const el = this.tabsEl()?.nativeElement;
    el?.scrollBy({ left: direction * el.clientWidth * 0.75, behavior: 'smooth' });
  }

  public select(tab: ProfileTab): void {
    this.activeTab.set(tab);
  }

  /** Percentage of the way to the skill cap, for progress bars */
  public progress(level: number, cap: number): number {
    return cap > 0 ? Math.min(100, (level / cap) * 100) : 0;
  }

  public rarityClass(rarity: string | null): string {
    return rarity ? `rarity-${rarity.toLowerCase().replace(/\s+/g, '-')}` : '';
  }

  public onFilter(target: 'bestiary' | 'collections', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    (target === 'bestiary' ? this.bestiaryFilter : this.collectionFilter).set(value);
  }
}
