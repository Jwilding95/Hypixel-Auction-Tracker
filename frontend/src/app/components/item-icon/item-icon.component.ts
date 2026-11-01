import { Component, computed, input, signal } from '@angular/core';
import { LoreTransformPipe } from '../../pipes/loreTransform.pipe';

/**
 * An item's icon with the auction tracker's item card shown on hover.
 * Icons are tried from SkyCrypt first, then Coflnet (which also covers pets),
 * falling back to a plain tile with the item's initial.
 */
@Component({
  selector: 'app-item-icon',
  standalone: true,
  imports: [LoreTransformPipe],
  templateUrl: './item-icon.component.html',
  styleUrl: './item-icon.component.scss'
})
export class ItemIconComponent {

  public name = input.required<string>();
  public lore = input<string>('');
  public iconId = input<string>('');
  public count = input<number>(1);
  public rarityClass = input<string>('');

  private failed = signal<boolean>(false);

  /** Icon URL (served by the backend, which tries SkyCrypt then Coflnet), or null if missing/failed */
  public src = computed(() =>
    this.iconId() && !this.failed() ? `/api/icon/${encodeURIComponent(this.iconId())}` : null);

  public hovered = signal<boolean>(false);
  public cardPosition = signal<{ left?: number; right?: number; top?: number; bottom?: number }>({});

  public onImageError(): void {
    this.failed.set(true);
  }

  /** While the card is open the wheel scrolls it (when it overflows) instead of the page */
  public onWheel(event: WheelEvent): void {
    const card = (event.currentTarget as HTMLElement).querySelector<HTMLElement>('.item-card');
    if (!card || card.scrollHeight <= card.clientHeight) {
      return;
    }
    card.scrollTop += event.deltaY;
    event.preventDefault();
  }

  public onEnter(event: MouseEvent): void {
    this.positionCard(event);
    this.hovered.set(window.innerWidth >= 600);
  }

  /**
   * Anchors the (fixed position) card beside the tile, flipping to the left
   * and/or above depending on where the tile is on screen, like the auction table
   */
  public positionCard(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const position: { left?: number; right?: number; top?: number; bottom?: number } = {};
    if (rect.right > window.innerWidth / 2) {
      position.right = window.innerWidth - rect.left + 8;
    } else {
      position.left = rect.right + 8;
    }
    if (rect.top > window.innerHeight / 2) {
      position.bottom = window.innerHeight - rect.bottom - 5;
    } else {
      position.top = rect.top - 5;
    }
    this.cardPosition.set(position);
  }
}
